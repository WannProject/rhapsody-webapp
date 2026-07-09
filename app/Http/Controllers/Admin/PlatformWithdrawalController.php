<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePlatformWithdrawalRequest;
use App\Models\PlatformWithdrawal;
use App\Services\PlatformWalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PlatformWithdrawalController extends Controller
{
    public function store(StorePlatformWithdrawalRequest $request, PlatformWalletService $wallet): RedirectResponse
    {
        $withdrawal = $wallet->requestWithdrawal(
            user: $request->user(),
            amount: $request->integer('amount'),
            destination: [
                'bank_code' => $request->input('bank_code'),
                'account_holder' => $request->input('account_holder'),
                'account_number' => $request->input('account_number'),
            ],
        );

        Log::channel('stack')->info('platform-withdrawal:requested', [
            'withdrawal_id' => $withdrawal->id,
            'user_id' => $request->user()->id,
            'amount' => $withdrawal->amount,
            'destination' => $withdrawal->destination_account_number,
        ]);

        $wallet->processWithdrawal($withdrawal);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Withdrawal diajukan.')]);

        return to_route('admin.platform-wallet.index');
    }

    public function destroy(PlatformWithdrawal $platformWithdrawal, PlatformWalletService $wallet): RedirectResponse
    {
        if (! $platformWithdrawal->isTerminal()) {
            $wallet->failWithdrawal($platformWithdrawal, 'Cancelled by admin');

            Log::warning('platform-withdrawal:cancelled', [
                'withdrawal_id' => $platformWithdrawal->id,
                'user_id' => request()->user()?->id,
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Withdrawal dibatalkan.')]);

        return to_route('admin.platform-wallet.index');
    }
}
