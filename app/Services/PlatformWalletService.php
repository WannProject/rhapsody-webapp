<?php

namespace App\Services;

use App\Enums\WithdrawalStatus;
use App\Models\PlatformWalletLedgerEntry;
use App\Models\PlatformWithdrawal;
use App\Models\User;
use Illuminate\Support\Facades\DB;

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
        if (! $withdrawal->status === WithdrawalStatus::Pending) {
            return;
        }

        $withdrawal->update(['status' => WithdrawalStatus::Processing, 'processed_at' => now()]);

        try {
            $response = $this->xendit->createPayout([
                'reference_id' => 'withdrawal-'.$withdrawal->id,
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
            ]);
        } catch (\Exception $e) {
            $withdrawal->update([
                'status' => WithdrawalStatus::Failed,
                'failure_reason' => $e->getMessage(),
            ]);

            PlatformWalletLedgerEntry::where('platform_withdrawal_id', $withdrawal->id)->delete();
        }
    }

    public function completeWithdrawal(PlatformWithdrawal $withdrawal): void
    {
        $withdrawal->update([
            'status' => WithdrawalStatus::Succeeded,
            'succeeded_at' => now(),
        ]);
    }

    public function failWithdrawal(PlatformWithdrawal $withdrawal, string $reason): void
    {
        $withdrawal->update([
            'status' => WithdrawalStatus::Failed,
            'failure_reason' => $reason,
        ]);

        PlatformWalletLedgerEntry::where('platform_withdrawal_id', $withdrawal->id)->delete();
    }
}
