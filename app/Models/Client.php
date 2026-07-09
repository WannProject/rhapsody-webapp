<?php

namespace App\Models;

use App\Enums\ClientStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $business_name
 * @property string|null $business_type
 * @property ClientStatus $status
 * @property int|null $user_id
 * @property \Illuminate\Support\Carbon|null $verified_at
 * @property \Illuminate\Support\Carbon|null $suspended_at
 * @property array|null $metadata
 * @property-read User|null $user
 * @property-read XenditSubAccount|null $xenditSubAccount
 * @property-read PlatformFeeRule|null $feeRule
 */
#[Fillable(['name', 'email', 'phone', 'business_name', 'business_type', 'status', 'user_id', 'verified_at', 'suspended_at', 'metadata'])]
class Client extends Model
{
    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasOne<XenditSubAccount, $this>
     */
    public function xenditSubAccount(): HasOne
    {
        return $this->hasOne(XenditSubAccount::class);
    }

    /**
     * @return HasOne<PlatformFeeRule, $this>
     */
    public function feeRule(): HasOne
    {
        return $this->hasOne(PlatformFeeRule::class);
    }

    /**
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    protected function casts(): array
    {
        return [
            'status' => ClientStatus::class,
            'verified_at' => 'datetime',
            'suspended_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
