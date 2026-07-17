<?php

namespace App\Models;

use Database\Factories\EquipmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $name
 * @property string $category
 * @property int $stock
 * @property int $additional_price
 * @property bool $is_active
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Booking> $bookings
 */
#[Fillable(['name', 'category', 'stock', 'additional_price', 'is_active'])]
class Equipment extends Model
{
    /** @use HasFactory<EquipmentFactory> */
    use HasFactory;

    protected $table = 'equipments';

    /**
     * @return BelongsToMany<Booking, $this>
     */
    public function bookings(): BelongsToMany
    {
        return $this->belongsToMany(Booking::class, 'booking_equipment')
            ->using(BookingEquipment::class)
            ->withPivot(['quantity', 'unit_price'])
            ->withTimestamps();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stock' => 'integer',
            'additional_price' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
