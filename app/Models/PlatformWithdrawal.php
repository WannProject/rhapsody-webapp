<?php

namespace App\Models;

use App\Enums\WithdrawalStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $requested_by
 * @property int $amount
 * @property string $currency
 * @property WithdrawalStatus $status
 * @property string|null $xendit_payout_id
 * @property string|null $destination_bank_code
 * @property string|null $destination_account_holder
 * @property string|null $destination_account_number
 * @property string|null $failure_reason
 * @property \Illuminate\Support\Carbon|null $processed_at
 * @property \Illuminate\Support\Carbon|null $succeeded_at
 * @property-read User $requester
 * @property-read \Illuminate\Database\Eloquent\Collection<int, PlatformWalletLedgerEntry> $ledgerEntries
 */
#[Fillable([
    'requested_by', 'amount', 'currency', 'status', 'xendit_payout_id',
    'destination_bank_code', 'destination_account_holder', 'destination_account_number',
    'failure_reason', 'processed_at', 'succeeded_at',
])]
class PlatformWithdrawal extends Model
{
    /**
     * @return BelongsTo<User, $this>
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * @return HasMany<PlatformWalletLedgerEntry, $this>
     */
    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(PlatformWalletLedgerEntry::class);
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, [
            WithdrawalStatus::Succeeded,
            WithdrawalStatus::Failed,
            WithdrawalStatus::Cancelled,
        ], true);
    }

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'status' => WithdrawalStatus::class,
            'processed_at' => 'datetime',
            'succeeded_at' => 'datetime',
        ];
    }
}
