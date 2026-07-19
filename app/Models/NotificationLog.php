<?php

namespace App\Models;

use App\Enums\NotificationStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $channel
 * @property string $recipient
 * @property string|null $title
 * @property string $message
 * @property NotificationStatus $status
 * @property string|null $reference_type
 * @property int|null $reference_id
 * @property string|null $error_message
 * @property int $attempts
 * @property Carbon|null $sent_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'channel',
    'recipient',
    'title',
    'message',
    'status',
    'reference_type',
    'reference_id',
    'error_message',
    'attempts',
    'sent_at',
])]
class NotificationLog extends Model
{
    protected $table = 'notification_logs';

    protected function casts(): array
    {
        return [
            'status' => NotificationStatus::class,
            'attempts' => 'integer',
            'sent_at' => 'datetime',
        ];
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeFailed(Builder $query): Builder
    {
        return $query->where('status', NotificationStatus::Failed->value);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeSent(Builder $query): Builder
    {
        return $query->where('status', NotificationStatus::Sent->value);
    }

    /**
     * Mark this log as a successful send.
     */
    public function markSent(): void
    {
        $this->forceFill([
            'status' => NotificationStatus::Sent,
            'attempts' => $this->attempts + 1,
            'sent_at' => now(),
            'error_message' => null,
        ])->save();
    }

    /**
     * Mark this log as a failed attempt, capturing the error.
     */
    public function markFailed(string $error): void
    {
        $this->forceFill([
            'status' => NotificationStatus::Failed,
            'attempts' => $this->attempts + 1,
            'error_message' => $error,
        ])->save();
    }
}
