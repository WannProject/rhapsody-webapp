<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $payment_id
 * @property int|null $platform_withdrawal_id
 * @property string $type
 * @property int $amount
 * @property string|null $description
 * @property array|null $metadata
 * @property-read Payment|null $payment
 * @property-read PlatformWithdrawal|null $withdrawal
 */
#[Fillable(['payment_id', 'platform_withdrawal_id', 'type', 'amount', 'description', 'metadata'])]
class PlatformWalletLedgerEntry extends Model
{
    /**
     * @return BelongsTo<Payment, $this>
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * @return BelongsTo<PlatformWithdrawal, $this>
     */
    public function withdrawal(): BelongsTo
    {
        return $this->belongsTo(PlatformWithdrawal::class);
    }

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'metadata' => 'array',
        ];
    }
}
