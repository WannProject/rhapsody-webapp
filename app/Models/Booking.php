<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Support\WhatsAppNumber;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
 * @property int $base_price
 * @property int $additional_price
 * @property int $total_price
 * @property BookingStatus $status
 * @property PaymentStatus $payment_status
 * @property string|null $notes
 * @property string|null $customer_equipment_notes
 * @property string|null $admin_notes
 * @property Carbon|null $confirmed_at
 * @property Carbon|null $cancelled_at
 * @property Carbon|null $held_until
 * @property-read User $user
 * @property-read Client|null $client
 * @property-read PaymentMethod|null $paymentMethod
 * @property-read Payment|null $payment
 * @property-read Collection<int, Equipment> $equipments
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
    'base_price',
    'additional_price',
    'total_price',
    'status',
    'payment_status',
    'notes',
    'customer_equipment_notes',
    'admin_notes',
    'confirmed_at',
    'cancelled_at',
    'held_until',
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
     * @return BelongsToMany<Equipment, $this>
     */
    public function equipments(): BelongsToMany
    {
        return $this->belongsToMany(Equipment::class, 'booking_equipment')
            ->using(BookingEquipment::class)
            ->withPivot(['quantity', 'unit_price'])
            ->withTimestamps();
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->whereNotIn('status', [
                BookingStatus::Cancelled->value,
                BookingStatus::Expired->value,
                BookingStatus::Refunded->value,
            ])
            ->where(function (Builder $query) {
                $query
                    ->where('status', '!=', BookingStatus::Pending->value)
                    ->orWhereNull('held_until')
                    ->orWhere('held_until', '>=', now());
            });
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
     * Normalize the customer WhatsApp number whenever it is set.
     *
     * @return Attribute<string|null, never>
     */
    protected function customerPhone(): Attribute
    {
        return Attribute::set(fn (?string $value) => WhatsAppNumber::normalize($value));
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
            'base_price' => 'integer',
            'additional_price' => 'integer',
            'total_price' => 'integer',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'held_until' => 'datetime',
        ];
    }
}
