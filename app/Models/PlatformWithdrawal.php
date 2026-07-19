<?php

namespace App\Models;

use App\Enums\WithdrawalStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $requested_by
 * @property int $amount
 * @property string $currency
 * @property WithdrawalStatus $status
 * @property string|null $xendit_payout_id
 * @property string|null $xendit_reference_id
 * @property string|null $xendit_payout_status
 * @property string|null $destination_bank_code
 * @property string|null $destination_account_holder
 * @property string|null $destination_account_number
 * @property string|null $failure_reason
 * @property Carbon|null $processed_at
 * @property Carbon|null $succeeded_at
 * @property Carbon|null $failed_at
 * @property-read User $requester
 * @property-read Collection<int, PlatformWalletLedgerEntry> $ledgerEntries
 */
#[Fillable([
    'requested_by', 'amount', 'currency', 'status', 'xendit_payout_id', 'xendit_reference_id', 'xendit_payout_status',
    'destination_bank_code', 'destination_account_holder', 'destination_account_number',
    'failure_reason', 'processed_at', 'succeeded_at', 'failed_at',
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
            'failed_at' => 'datetime',
        ];
    }
}
