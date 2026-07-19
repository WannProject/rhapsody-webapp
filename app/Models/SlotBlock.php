<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property Carbon $booking_date
 * @property string $starts_at
 * @property string $ends_at
 * @property string|null $reason
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $creator
 */
#[Fillable(['booking_date', 'starts_at', 'ends_at', 'reason', 'created_by'])]
class SlotBlock extends Model
{
    protected $table = 'slot_blocks';

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check whether this block overlaps a given time range on the same date.
     */
    public function coversTimeRange(string $date, string $startsAt, string $endsAt): bool
    {
        if ($this->booking_date->toDateString() !== $date) {
            return false;
        }

        return $this->starts_at < $endsAt && $this->ends_at > $startsAt;
    }
}
