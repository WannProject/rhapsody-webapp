<?php

namespace App\Services;

use App\Enums\PaymentGatewayStatus;
use App\Enums\SplitStatus;
use App\Models\Booking;
use App\Models\Client;
use App\Models\Payment;
use App\Models\PlatformFeeRule;
use App\Models\PlatformWalletLedgerEntry;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(
        private readonly XenditClient $xendit,
    ) {}

    public function createPaymentForBooking(Booking $booking): Payment
    {
        $client = $booking->client;
        $feeRule = $this->getFeeRule($client);
        $platformFee = $feeRule ? $feeRule->calculateFee($booking->total_price) : 0;

        $externalId = 'RHP-'.$booking->code.'-'.Str::lower(Str::random(8));

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'client_id' => $client?->id,
            'xendit_external_id' => $externalId,
            'amount' => $booking->total_price,
            'platform_fee_expected' => $platformFee,
            'status' => PaymentGatewayStatus::Pending,
            'split_status' => SplitStatus::NotApplicable,
        ]);

        if ($client && $client->xenditSubAccount && $client->status->canReceivePayments()) {
            $this->createXenditInvoice($payment, $booking, $client, $feeRule);
        }

        return $payment;
    }

    public function markAsPaid(Payment $payment, ?array $webhookPayload = null): void
    {
        if ($payment->status === PaymentGatewayStatus::Paid) {
            return;
        }

        DB::transaction(function () use ($payment, $webhookPayload) {
            $payment->update([
                'status' => PaymentGatewayStatus::Paid,
                'paid_at' => now(),
                'raw_webhook_payload' => $webhookPayload ?? $payment->raw_webhook_payload,
            ]);

            if ($payment->platform_fee_expected > 0) {
                PlatformWalletLedgerEntry::create([
                    'payment_id' => $payment->id,
                    'type' => 'credit',
                    'amount' => $payment->platform_fee_expected,
                    'description' => "Platform fee from payment #{$payment->id}",
                ]);
            }

            $booking = $payment->booking;
            if ($booking) {
                $booking->update([
                    'payment_status' => \App\Enums\PaymentStatus::Paid,
                    'status' => $booking->status === \App\Enums\BookingStatus::Pending
                        ? \App\Enums\BookingStatus::Confirmed
                        : $booking->status,
                    'confirmed_at' => $booking->confirmed_at ?? now(),
                ]);

                \App\Support\BookingWhatsApp::paymentPaid($booking->fresh());
            }
        });
    }

    public function markAsExpired(Payment $payment, ?array $webhookPayload = null): void
    {
        $payment->update([
            'status' => PaymentGatewayStatus::Expired,
            'expired_at' => now(),
            'raw_webhook_payload' => $webhookPayload ?? $payment->raw_webhook_payload,
        ]);
    }

    public function markAsFailed(Payment $payment, ?string $reason = null, ?array $webhookPayload = null): void
    {
        $payment->update([
            'status' => PaymentGatewayStatus::Failed,
            'failure_reason' => $reason,
            'raw_webhook_payload' => $webhookPayload ?? $payment->raw_webhook_payload,
        ]);
    }

    public function updateSplitStatus(Payment $payment, SplitStatus $status, ?int $actualFee = null): void
    {
        $payment->update([
            'split_status' => $status,
            'platform_fee_actual' => $actualFee ?? $payment->platform_fee_expected,
        ]);
    }

    private function createXenditInvoice(Payment $payment, Booking $booking, Client $client, ?PlatformFeeRule $feeRule): void
    {
        $splitConfig = [];

        if ($feeRule && $payment->platform_fee_expected > 0) {
            $splitConfig['split'] = [
                [
                    'type' => 'platform',
                    'amount' => $payment->platform_fee_expected,
                    'currency' => 'IDR',
                ],
            ];
        }

        try {
            $response = $this->xendit->createInvoiceForSubAccount($client->xenditSubAccount->xendit_account_id, [
                'external_id' => $payment->xendit_external_id,
                'amount' => $booking->total_price,
                'payer_email' => $booking->customer_email,
                'description' => "Booking {$booking->code} - {$booking->booking_date->format('d M Y')}",
                'success_redirect_url' => route('bookings').'?payment=success',
                'failure_redirect_url' => route('bookings').'?payment=failed',
                ...$splitConfig,
            ]);

            $payment->update([
                'xendit_invoice_id' => $response['id'] ?? null,
                'payment_link_url' => $response['invoice_url'] ?? null,
                'split_status' => $payment->platform_fee_expected > 0
                    ? SplitStatus::Pending
                    : SplitStatus::NotApplicable,
            ]);
        } catch (\Exception $e) {
            $payment->update([
                'failure_reason' => 'Failed to create Xendit invoice: '.$e->getMessage(),
                'split_status' => SplitStatus::Failed,
            ]);
        }
    }

    private function getFeeRule(?Client $client): ?PlatformFeeRule
    {
        if (! $client) {
            return PlatformFeeRule::query()
                ->whereNull('client_id')
                ->where('is_active', true)
                ->first();
        }

        return $client->feeRule ?: PlatformFeeRule::query()
            ->whereNull('client_id')
            ->where('is_active', true)
            ->first();
    }
}
