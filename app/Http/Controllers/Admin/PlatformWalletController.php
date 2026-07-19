<?php

namespace App\Http\Controllers\Admin;

use App\Enums\WithdrawalStatus;
use App\Http\Controllers\Controller;
use App\Models\PlatformWalletLedgerEntry;
use App\Models\PlatformWithdrawal;
use App\Services\PlatformWalletService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PlatformWalletController extends Controller
{
    public function index(Request $request, PlatformWalletService $wallet): Response
    {
        $filters = $this->validatedFilters($request);

        $ledgerEntries = $this->applyDateFilters(PlatformWalletLedgerEntry::query(), $filters)
            ->with(['payment.booking', 'withdrawal'])
            ->latest()
            ->when($filters['type'], fn (Builder $query, string $type) => $query->where('type', $type))
            ->paginate(20, pageName: 'ledger_page')
            ->withQueryString();

        $withdrawals = $this->applyDateFilters(PlatformWithdrawal::query(), $filters)
            ->with('requester')
            ->latest()
            ->when(
                $filters['withdrawal_status'],
                fn (Builder $query, string $status) => $query->where('status', $status),
            )
            ->paginate(10, pageName: 'withdrawal_page')
            ->withQueryString();

        return Inertia::render('admin/platform-wallet/index', [
            'availableBalance' => $wallet->availableBalance(),
            'balanceSnapshot' => $wallet->balanceSnapshot(),
            'totalPlatformFee' => $wallet->totalPlatformFee(),
            'pendingWithdrawals' => $wallet->pendingWithdrawals(),
            'totalWithdrawn' => $wallet->totalWithdrawn(),
            'ledgerEntries' => $ledgerEntries->through(fn ($entry) => [
                'id' => $entry->id,
                'type' => $entry->type,
                'amount' => $entry->amount,
                'description' => $entry->description,
                'createdAt' => $entry->created_at->toDateTimeString(),
                'paymentCode' => $entry->payment?->booking?->code,
                'withdrawalId' => $entry->withdrawal?->id,
            ])->items(),
            'withdrawals' => $withdrawals->through(fn ($w) => [
                'id' => $w->id,
                'amount' => $w->amount,
                'status' => $w->status->value,
                'statusLabel' => $w->status->label(),
                'destination' => trim(($w->destination_bank_code ?? '').' '.$w->destination_account_holder.' '.$w->destination_account_number),
                'requestedBy' => $w->requester?->name,
                'createdAt' => $w->created_at->toDateTimeString(),
                'xenditPayoutId' => $w->xendit_payout_id,
                'xenditReferenceId' => $w->xendit_reference_id,
                'xenditPayoutStatus' => $w->xendit_payout_status,
                'failureReason' => $w->failure_reason,
            ])->items(),
            'ledgerPagination' => [
                'currentPage' => $ledgerEntries->currentPage(),
                'lastPage' => $ledgerEntries->lastPage(),
                'total' => $ledgerEntries->total(),
            ],
            'withdrawalPagination' => [
                'currentPage' => $withdrawals->currentPage(),
                'lastPage' => $withdrawals->lastPage(),
                'total' => $withdrawals->total(),
            ],
            'filters' => $filters,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->validatedFilters($request);
        $entries = $this->applyDateFilters(PlatformWalletLedgerEntry::query(), $filters)
            ->with(['payment.booking', 'withdrawal'])
            ->latest()
            ->when($filters['type'], fn (Builder $query, string $type) => $query->where('type', $type));

        return response()->streamDownload(function () use ($entries): void {
            $output = fopen('php://output', 'w');

            if ($output === false) {
                return;
            }

            fputcsv($output, ['Date', 'Type', 'Amount', 'Description', 'Booking', 'Withdrawal ID'], ',', '"', '');

            foreach ($entries->cursor() as $entry) {
                fputcsv($output, [
                    $entry->created_at->toDateTimeString(),
                    $entry->type,
                    $entry->amount,
                    $entry->description,
                    $entry->payment?->booking?->code,
                    $entry->withdrawal?->id,
                ], ',', '"', '');
            }

            fclose($output);
        }, 'platform-wallet-ledger-'.now()->toDateString().'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return array{type: string|null, withdrawal_status: string|null, from_date: string|null, to_date: string|null}
     */
    private function validatedFilters(Request $request): array
    {
        $validated = $request->validate([
            'type' => ['nullable', Rule::in(['all', 'credit', 'debit'])],
            'withdrawal_status' => ['nullable', Rule::in([
                'all',
                ...array_map(fn (WithdrawalStatus $status) => $status->value, WithdrawalStatus::cases()),
            ])],
            'from_date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:to_date'],
            'to_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from_date'],
        ]);

        return [
            'type' => ($validated['type'] ?? 'all') === 'all' ? null : $validated['type'],
            'withdrawal_status' => ($validated['withdrawal_status'] ?? 'all') === 'all'
                ? null
                : $validated['withdrawal_status'],
            'from_date' => $validated['from_date'] ?? null,
            'to_date' => $validated['to_date'] ?? null,
        ];
    }

    /**
     * @template TModel of \Illuminate\Database\Eloquent\Model
     *
     * @param  Builder<TModel>  $query
     * @param  array{from_date: string|null, to_date: string|null}  $filters
     * @return Builder<TModel>
     */
    private function applyDateFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when(
                $filters['from_date'],
                fn (Builder $builder, string $date) => $builder->whereDate('created_at', '>=', $date),
            )
            ->when(
                $filters['to_date'],
                fn (Builder $builder, string $date) => $builder->whereDate('created_at', '<=', $date),
            );
    }
}
