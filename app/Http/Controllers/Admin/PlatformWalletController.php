<?php

namespace App\Http\Controllers\Admin;

use App\Enums\WithdrawalStatus;
use App\Http\Controllers\Controller;
use App\Services\PlatformWalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlatformWalletController extends Controller
{
    public function index(Request $request, PlatformWalletService $wallet): Response
    {
        $ledgerEntries = \App\Models\PlatformWalletLedgerEntry::query()
            ->with(['payment.booking', 'withdrawal'])
            ->latest()
            ->when($request->input('type'), fn ($q, $type) => $q->where('type', $type))
            ->paginate(20, page: $request->input('ledger_page', 1), pageName: 'ledger_page')
            ->withQueryString();

        $withdrawals = \App\Models\PlatformWithdrawal::query()
            ->with('requester')
            ->latest()
            ->when($request->input('withdrawal_status'), fn ($q, $status) => $q->where('status', $status))
            ->paginate(10, page: $request->input('withdrawal_page', 1), pageName: 'withdrawal_page')
            ->withQueryString();

        return Inertia::render('admin/platform-wallet/index', [
            'availableBalance' => $wallet->availableBalance(),
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
            ]),
            'withdrawals' => $withdrawals->through(fn ($w) => [
                'id' => $w->id,
                'amount' => $w->amount,
                'status' => $w->status->value,
                'statusLabel' => $w->status->label(),
                'destination' => trim(($w->destination_bank_code ?? '').' '.$w->destination_account_holder.' '.$w->destination_account_number),
                'requestedBy' => $w->requester?->name,
                'createdAt' => $w->created_at->toDateTimeString(),
                'failureReason' => $w->failure_reason,
            ]),
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
            'filters' => $request->only(['type', 'withdrawal_status']),
        ]);
    }
}
