<?php

namespace App\Http\Controllers;

use App\Enums\SplitStatus;
use App\Models\Payment;
use App\Services\PaymentService;
use App\Services\PlatformWalletService;
use App\Services\XenditClient;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function __construct(
        private readonly XenditClient $xendit,
        private readonly PaymentService $paymentService,
        private readonly PlatformWalletService $walletService,
    ) {}

    public function xendit(Request $request)
    {
        $token = $request->header('X-CALLBACK-TOKEN') ?? '';
        $verificationToken = config('xendit.callback_verification_token');

        if (! $this->xendit->verifyWebhook($token, $verificationToken)) {
            return response()->json(['message' => 'Invalid token'], 403);
        }

        $payload = $request->all();
        $event = $payload['event'] ?? '';
        $data = is_array($payload['data'] ?? null) ? $payload['data'] : $payload;

        if ($this->isPayoutWebhook($event, $data)) {
            $withdrawal = $this->walletService->syncWithdrawalFromPayoutWebhook($data);

            if (! $withdrawal) {
                return response()->json(['message' => 'Withdrawal not found'], 404);
            }

            return response()->json(['message' => 'OK']);
        }

        $externalId = $payload['external_id'] ?? null;

        if (! $externalId) {
            return response()->json(['message' => 'Missing external_id'], 400);
        }

        $payment = Payment::query()
            ->where('xendit_external_id', $externalId)
            ->orWhere('xendit_invoice_id', $payload['invoice_id'] ?? '')
            ->first();

        if (! $payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $status = $payload['status'] ?? '';

        match (true) {
            in_array($status, ['PAID', 'SETTLED', 'SETTLING'], true) || $event === 'invoice.paid' => $this->paymentService->markAsPaid($payment, $payload),

            $status === 'EXPIRED' || $event === 'invoice.expired' => $this->paymentService->markAsExpired($payment, $payload),

            $status === 'FAILED' || $event === 'invoice.failed' => $this->paymentService->markAsFailed($payment, $payload['failure_reason'] ?? null, $payload),

            $status === 'REFUNDED' || $event === 'invoice.refunded' => $this->paymentService->markAsRefunded($payment, $payload),

            default => null,
        };

        if (isset($payload['split'])) {
            $splitStatus = match ($payload['split']['status'] ?? '') {
                'SUCCEEDED' => SplitStatus::Succeeded,
                'FAILED' => SplitStatus::Failed,
                default => null,
            };

            if ($splitStatus) {
                $actualFee = $payload['split']['platform_amount'] ?? null;
                $this->paymentService->updateSplitStatus($payment, $splitStatus, $actualFee !== null ? (int) $actualFee : null);
            }
        }

        return response()->json(['message' => 'OK']);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function isPayoutWebhook(string $event, array $payload): bool
    {
        if (str_starts_with($event, 'payout.')) {
            return true;
        }

        return isset($payload['reference_id'])
            && str_starts_with((string) $payload['reference_id'], 'withdrawal-');
    }
}
