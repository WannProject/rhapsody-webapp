<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $opens_at
 * @property string $closes_at
 * @property int $slot_duration_minutes
 * @property int $hourly_rate
 * @property bool $is_active
 */
#[Fillable(['name', 'opens_at', 'closes_at', 'slot_duration_minutes', 'hourly_rate', 'is_active'])]
class StudioSetting extends Model
{
    /**
     * Get the active studio setting, creating the default one if needed.
     */
    public static function active(): self
    {
        return self::query()->firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Rhapsody Studio',
                'opens_at' => '09:00',
                'closes_at' => '21:00',
                'slot_duration_minutes' => 120,
                'hourly_rate' => 150000,
                'is_active' => true,
            ],
        );
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'slot_duration_minutes' => 'integer',
            'hourly_rate' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
