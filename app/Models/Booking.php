<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $code
 * @property int $user_id
 * @property int|null $client_id
 * @property int|null $payment_method_id
 * @property string $customer_name
 * @property string $customer_email
 * @property string|null $customer_phone
 * @property Carbon $booking_date
 * @property string $starts_at
 * @property string $ends_at
 * @property int $total_price
 * @property BookingStatus $status
 * @property PaymentStatus $payment_status
 * @property string|null $notes
 * @property string|null $admin_notes
 * @property Carbon|null $confirmed_at
 * @property Carbon|null $cancelled_at
 * @property-read User $user
 * @property-read Client|null $client
 * @property-read PaymentMethod|null $paymentMethod
 * @property-read Payment|null $payment
 */
#[Fillable([
    'user_id',
    'client_id',
    'payment_method_id',
    'customer_name',
    'customer_email',
    'customer_phone',
    'booking_date',
    'starts_at',
    'ends_at',
    'total_price',
    'status',
    'payment_status',
    'notes',
    'admin_notes',
    'confirmed_at',
    'cancelled_at',
])]
class Booking extends Model
{
    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Booking $booking) {
            if (empty($booking->code)) {
                $booking->code = 'RHP-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
            }
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return BelongsTo<PaymentMethod, $this>
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * @return HasOne<Payment, $this>
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', '!=', BookingStatus::Cancelled->value);
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function canBeChangedBy(User $user): bool
    {
        return $user->isAdmin() || ($this->isOwnedBy($user) && $this->status === BookingStatus::Pending);
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'code';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'status' => BookingStatus::class,
            'payment_status' => PaymentStatus::class,
            'total_price' => 'integer',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }
}
