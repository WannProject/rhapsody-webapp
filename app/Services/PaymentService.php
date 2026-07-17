<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\PaymentGatewayStatus;
use App\Enums\PaymentStatus;
use App\Enums\SplitStatus;
use App\Models\Booking;
use App\Models\Client;
use App\Models\Payment;
use App\Models\PlatformFeeRule;
use App\Models\PlatformWalletLedgerEntry;
use App\Support\BookingWhatsApp;
use Illuminate\Support\Carbon;
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

        if ($this->xendit->isConfigured()) {
            $this->createXenditInvoice($payment, $booking, $client, $feeRule);
        }

        return $payment->fresh();
    }

    public function markAsPaid(Payment $payment, ?array $webhookPayload = null): void
    {
        $bookingForNotification = null;

        DB::transaction(function () use ($payment, $webhookPayload, &$bookingForNotification) {
            $lockedPayment = Payment::query()
                ->with('booking.user')
                ->lockForUpdate()
                ->findOrFail($payment->id);

            if ($lockedPayment->status !== PaymentGatewayStatus::Paid) {
                $lockedPayment->update([
                    'status' => PaymentGatewayStatus::Paid,
                    'paid_at' => now(),
                    'raw_webhook_payload' => $webhookPayload ?? $lockedPayment->raw_webhook_payload,
                ]);

                if ($lockedPayment->platform_fee_expected > 0) {
                    PlatformWalletLedgerEntry::create([
                        'payment_id' => $lockedPayment->id,
                        'type' => 'credit',
                        'amount' => $lockedPayment->platform_fee_expected,
                        'description' => "Platform fee from payment #{$lockedPayment->id}",
                    ]);
                }
            }

            $booking = $lockedPayment->booking;
            if ($booking) {
                $shouldConfirmBooking = $booking->status === BookingStatus::Pending;

                $booking->update([
                    'payment_status' => PaymentStatus::Paid,
                    'status' => $shouldConfirmBooking ? BookingStatus::Confirmed : $booking->status,
                    'confirmed_at' => $shouldConfirmBooking
                        ? ($booking->confirmed_at ?? now())
                        : $booking->confirmed_at,
                    'held_until' => null,
                ]);

                if (! $lockedPayment->paid_notification_sent_at) {
                    $lockedPayment->forceFill(['paid_notification_sent_at' => now()])->save();
                    $bookingForNotification = $booking->fresh();
                }
            }
        });

        if ($bookingForNotification) {
            BookingWhatsApp::paymentPaid($bookingForNotification);
        }
    }

    public function markAsExpired(Payment $payment, ?array $webhookPayload = null): void
    {
        DB::transaction(function () use ($payment, $webhookPayload) {
            $payment->update([
                'status' => PaymentGatewayStatus::Expired,
                'expired_at' => now(),
                'raw_webhook_payload' => $webhookPayload ?? $payment->raw_webhook_payload,
            ]);

            $booking = $payment->booking;
            if ($booking && $booking->status === BookingStatus::Pending) {
                $booking->update([
                    'status' => BookingStatus::Expired,
                    'payment_status' => PaymentStatus::Expired,
                    'cancelled_at' => now(),
                    'held_until' => null,
                ]);
            }
        });
    }

    public function markAsFailed(Payment $payment, ?string $reason = null, ?array $webhookPayload = null): void
    {
        DB::transaction(function () use ($payment, $reason, $webhookPayload) {
            $payment->update([
                'status' => PaymentGatewayStatus::Failed,
                'failure_reason' => $reason,
                'raw_webhook_payload' => $webhookPayload ?? $payment->raw_webhook_payload,
            ]);

            $payment->booking?->update([
                'status' => BookingStatus::Expired,
                'payment_status' => PaymentStatus::Failed,
                'cancelled_at' => now(),
                'held_until' => null,
            ]);
        });
    }

    public function markAsRefunded(Payment $payment, ?array $webhookPayload = null): void
    {
        DB::transaction(function () use ($payment, $webhookPayload) {
            $payment->update([
                'status' => PaymentGatewayStatus::Refunded,
                'raw_webhook_payload' => $webhookPayload ?? $payment->raw_webhook_payload,
            ]);

            $payment->booking?->update([
                'status' => BookingStatus::Refunded,
                'payment_status' => PaymentStatus::Refunded,
                'held_until' => null,
            ]);
        });
    }

    public function updateSplitStatus(Payment $payment, SplitStatus $status, ?int $actualFee = null): void
    {
        $payment->update([
            'split_status' => $status,
            'platform_fee_actual' => $actualFee ?? $payment->platform_fee_expected,
        ]);
    }

    private function createXenditInvoice(Payment $payment, Booking $booking, ?Client $client, ?PlatformFeeRule $feeRule): void
    {
        $splitConfig = [];
        $canUseSubAccount = $client
            && $client->xenditSubAccount
            && $client->status->canReceivePayments();

        if ($canUseSubAccount && $feeRule && $payment->platform_fee_expected > 0) {
            $splitConfig['split'] = [
                [
                    'type' => 'platform',
                    'amount' => $payment->platform_fee_expected,
                    'currency' => 'IDR',
                ],
            ];
        }

        try {
            $invoiceData = [
                'external_id' => $payment->xendit_external_id,
                'amount' => $booking->total_price,
                'payer_email' => $booking->customer_email,
                'description' => "Booking {$booking->code} - {$booking->booking_date->format('d M Y')}",
                'success_redirect_url' => route('bookings').'?payment=success',
                'failure_redirect_url' => route('bookings').'?payment=failed',
                ...$splitConfig,
            ];

            $response = $canUseSubAccount
                ? $this->xendit->createInvoiceForSubAccount($client->xenditSubAccount->xendit_account_id, $invoiceData)
                : $this->xendit->createInvoice($invoiceData);

            $payment->update([
                'xendit_invoice_id' => $response['id'] ?? null,
                'payment_link_url' => $response['invoice_url'] ?? null,
                'expired_at' => isset($response['expiry_date'])
                    ? Carbon::parse($response['expiry_date'])
                    : $payment->expired_at,
                'split_status' => $canUseSubAccount && $payment->platform_fee_expected > 0
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
