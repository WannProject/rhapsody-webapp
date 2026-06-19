<?php

namespace App\Models;

use App\Enums\PaymentMethodType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property PaymentMethodType $type
 * @property string $name
 * @property string|null $instructions
 * @property bool $is_active
 * @property int $sort_order
 */
#[Fillable(['type', 'name', 'instructions', 'is_active', 'sort_order'])]
class PaymentMethod extends Model
{
    /**
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => PaymentMethodType::class,
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
