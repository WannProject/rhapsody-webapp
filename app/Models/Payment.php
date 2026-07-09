<?php

namespace App\Models;

use App\Enums\PaymentGatewayStatus;
use App\Enums\SplitStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $booking_id
 * @property int|null $client_id
 * @property string|null $xendit_invoice_id
 * @property string|null $xendit_payment_id
 * @property string|null $xendit_external_id
 * @property string|null $payment_channel
 * @property int $amount
 * @property int $platform_fee_expected
 * @property int $platform_fee_actual
 * @property PaymentGatewayStatus $status
 * @property SplitStatus $split_status
 * @property string|null $split_rule_id
 * @property string|null $payment_link_url
 * @property string|null $failure_reason
 * @property array|null $raw_webhook_payload
 * @property \Illuminate\Support\Carbon|null $paid_at
 * @property \Illuminate\Support\Carbon|null $expired_at
 * @property-read Booking $booking
 * @property-read Client|null $client
 */
#[Fillable([
    'booking_id', 'client_id', 'xendit_invoice_id', 'xendit_payment_id', 'xendit_external_id',
    'payment_channel', 'amount', 'platform_fee_expected', 'platform_fee_actual',
    'status', 'split_status', 'split_rule_id', 'payment_link_url', 'failure_reason',
    'raw_webhook_payload', 'paid_at', 'expired_at',
])]
class Payment extends Model
{
    /**
     * @return BelongsTo<Booking, $this>
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return HasMany<PlatformWalletLedgerEntry, $this>
     */
    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(PlatformWalletLedgerEntry::class);
    }

    public function isPaid(): bool
    {
        return $this->status === PaymentGatewayStatus::Paid;
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, [
            PaymentGatewayStatus::Paid,
            PaymentGatewayStatus::Expired,
            PaymentGatewayStatus::Failed,
            PaymentGatewayStatus::Refunded,
        ], true);
    }

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'platform_fee_expected' => 'integer',
            'platform_fee_actual' => 'integer',
            'status' => PaymentGatewayStatus::class,
            'split_status' => SplitStatus::class,
            'raw_webhook_payload' => 'array',
            'paid_at' => 'datetime',
            'expired_at' => 'datetime',
        ];
    }
}
