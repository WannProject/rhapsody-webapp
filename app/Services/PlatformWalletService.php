<?php

namespace App\Services;

use App\Enums\WithdrawalStatus;
use App\Models\PlatformWalletLedgerEntry;
use App\Models\PlatformWithdrawal;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class PlatformWalletService
{
    public function __construct(
        private readonly XenditClient $xendit,
    ) {}

    public function availableBalance(): int
    {
        $credits = PlatformWalletLedgerEntry::query()
            ->where('type', 'credit')
            ->sum('amount');

        $debits = PlatformWalletLedgerEntry::query()
            ->where('type', 'debit')
            ->whereIn('platform_withdrawal_id', function ($query) {
                $query->select('id')
                    ->from('platform_withdrawals')
                    ->whereIn('status', [
                        WithdrawalStatus::Succeeded->value,
                        WithdrawalStatus::Processing->value,
                        WithdrawalStatus::Pending->value,
                    ]);
            })
            ->sum('amount');

        return (int) ($credits - $debits);
    }

    public function totalPlatformFee(): int
    {
        return (int) PlatformWalletLedgerEntry::query()
            ->where('type', 'credit')
            ->sum('amount');
    }

    public function pendingWithdrawals(): int
    {
        return (int) PlatformWithdrawal::query()
            ->whereIn('status', [
                WithdrawalStatus::Pending->value,
                WithdrawalStatus::Processing->value,
            ])
            ->sum('amount');
    }

    public function totalWithdrawn(): int
    {
        return (int) PlatformWithdrawal::query()
            ->where('status', WithdrawalStatus::Succeeded->value)
            ->sum('amount');
    }

    /**
     * @return array{source: string, status: string, amount: int, ledgerAmount: int, currency: string, message: string, asOf: string}
     */
    public function balanceSnapshot(): array
    {
        $ledgerAmount = $this->availableBalance();

        if (! $this->xendit->isConfigured()) {
            return $this->ledgerBalanceSnapshot(
                $ledgerAmount,
                'Saldo Xendit live belum aktif karena secret key belum dikonfigurasi.',
                'not_configured',
            );
        }

        try {
            $response = $this->xendit->getBalance();
            $amount = $this->extractBalanceAmount($response);

            if ($amount === null) {
                throw new RuntimeException('Respons saldo Xendit tidak memuat nominal yang dikenali.');
            }

            return [
                'source' => 'xendit_live',
                'status' => 'available',
                'amount' => $amount,
                'ledgerAmount' => $ledgerAmount,
                'currency' => (string) ($response['currency'] ?? 'IDR'),
                'message' => 'Saldo live dari Xendit.',
                'asOf' => now()->toDateTimeString(),
            ];
        } catch (Throwable $e) {
            Log::warning('platform-wallet:xendit-balance-unavailable', [
                'reason' => $e->getMessage(),
            ]);

            return $this->ledgerBalanceSnapshot(
                $ledgerAmount,
                'Saldo Xendit live tidak tersedia, memakai ledger internal.',
                'unavailable',
            );
        }
    }

    public function requestWithdrawal(User $user, int $amount, array $destination): PlatformWithdrawal
    {
        $minAmount = (int) config('xendit.withdrawal.min_amount', 50000);
        abort_if($amount < $minAmount, 422, "Minimum withdrawal is Rp {$minAmount}.");

        $available = $this->availableBalance();
        abort_if($amount > $available, 422, 'Insufficient balance.');

        return DB::transaction(function () use ($user, $amount, $destination) {
            $withdrawal = PlatformWithdrawal::create([
                'requested_by' => $user->id,
                'amount' => $amount,
                'currency' => 'IDR',
                'status' => WithdrawalStatus::Pending,
                'destination_bank_code' => $destination['bank_code'] ?? null,
                'destination_account_holder' => $destination['account_holder'] ?? null,
                'destination_account_number' => $destination['account_number'] ?? null,
            ]);

            PlatformWalletLedgerEntry::create([
                'platform_withdrawal_id' => $withdrawal->id,
                'type' => 'debit',
                'amount' => $amount,
                'description' => "Withdrawal request #{$withdrawal->id}",
            ]);

            return $withdrawal;
        });
    }

    public function processWithdrawal(PlatformWithdrawal $withdrawal): void
    {
        if ($withdrawal->status !== WithdrawalStatus::Pending) {
            return;
        }

        $referenceId = 'withdrawal-'.$withdrawal->id;

        $withdrawal->update([
            'status' => WithdrawalStatus::Processing,
            'processed_at' => now(),
            'xendit_reference_id' => $referenceId,
        ]);

        try {
            $response = $this->xendit->createPayout([
                'reference_id' => $referenceId,
                'channel_code' => 'ID_BANK',
                'amount' => $withdrawal->amount,
                'currency' => 'IDR',
                'channel_properties' => [
                    'bank_code' => $withdrawal->destination_bank_code,
                    'account_holder_name' => $withdrawal->destination_account_holder,
                    'account_number' => $withdrawal->destination_account_number,
                ],
            ]);

            $withdrawal->update([
                'xendit_payout_id' => $response['id'] ?? null,
                'xendit_reference_id' => $referenceId,
                'xendit_payout_status' => $response['status'] ?? null,
            ]);
        } catch (\Exception $e) {
            $withdrawal->update([
                'status' => WithdrawalStatus::Failed,
                'failure_reason' => $e->getMessage(),
                'failed_at' => now(),
            ]);

            PlatformWalletLedgerEntry::where('platform_withdrawal_id', $withdrawal->id)->delete();
        }
    }

    public function completeWithdrawal(PlatformWithdrawal $withdrawal): void
    {
        $withdrawal->update([
            'status' => WithdrawalStatus::Succeeded,
            'succeeded_at' => now(),
            'failed_at' => null,
        ]);
    }

    public function failWithdrawal(PlatformWithdrawal $withdrawal, string $reason): void
    {
        $withdrawal->update([
            'status' => WithdrawalStatus::Failed,
            'failure_reason' => $reason,
            'failed_at' => now(),
        ]);

        PlatformWalletLedgerEntry::where('platform_withdrawal_id', $withdrawal->id)->delete();
    }

    public function syncWithdrawalFromPayoutWebhook(array $payload): ?PlatformWithdrawal
    {
        $payoutId = $payload['id'] ?? $payload['payout_id'] ?? null;
        $referenceId = $payload['reference_id'] ?? null;

        if (! $payoutId && ! $referenceId) {
            return null;
        }

        $withdrawal = PlatformWithdrawal::query()
            ->where(function ($query) use ($payoutId, $referenceId) {
                if ($payoutId) {
                    $query->where('xendit_payout_id', $payoutId);
                }

                if ($referenceId) {
                    $method = $payoutId ? 'orWhere' : 'where';
                    $query->{$method}('xendit_reference_id', $referenceId);
                }
            })
            ->first();

        if (! $withdrawal) {
            return null;
        }

        $xenditStatus = strtoupper((string) ($payload['status'] ?? ''));
        $failureReason = (string) ($payload['failure_reason'] ?? $payload['failure_code'] ?? 'Payout failed');

        $withdrawal->forceFill([
            'xendit_payout_id' => $payoutId ?: $withdrawal->xendit_payout_id,
            'xendit_reference_id' => $referenceId ?: $withdrawal->xendit_reference_id,
            'xendit_payout_status' => $xenditStatus ?: $withdrawal->xendit_payout_status,
        ])->save();

        if (in_array($xenditStatus, ['SUCCEEDED', 'SUCCESS', 'COMPLETED'], true)) {
            $this->completeWithdrawal($withdrawal);
        }

        if (in_array($xenditStatus, ['FAILED', 'CANCELLED', 'CANCELED', 'REJECTED'], true)) {
            $this->failWithdrawal($withdrawal, $failureReason);
        }

        return $withdrawal->fresh();
    }

    /**
     * @param  array<string, mixed>  $response
     */
    private function extractBalanceAmount(array $response): ?int
    {
        foreach (['balance', 'available_balance', 'available', 'amount'] as $key) {
            if (isset($response[$key]) && is_numeric($response[$key])) {
                return (int) $response[$key];
            }
        }

        if (isset($response['data']) && is_array($response['data'])) {
            return $this->extractBalanceAmount($response['data']);
        }

        return null;
    }

    /**
     * @return array{source: string, status: string, amount: int, ledgerAmount: int, currency: string, message: string, asOf: string}
     */
    private function ledgerBalanceSnapshot(int $ledgerAmount, string $message, string $status): array
    {
        return [
            'source' => 'ledger_internal',
            'status' => $status,
            'amount' => $ledgerAmount,
            'ledgerAmount' => $ledgerAmount,
            'currency' => 'IDR',
            'message' => $message,
            'asOf' => now()->toDateTimeString(),
        ];
    }
}
