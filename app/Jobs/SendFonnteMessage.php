<?php

namespace App\Jobs;

use App\Enums\NotificationStatus;
use App\Models\NotificationLog;
use App\Services\FonnteClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Throwable;

class SendFonnteMessage implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(
        public string $target,
        public string $message,
        public int $logId,
    ) {
        //
    }

    public function handle(FonnteClient $client): void
    {
        $log = $this->resolveLog();
        $log->increment('attempts');

        if (! $this->target) {
            $log->forceFill([
                'status' => NotificationStatus::Failed,
                'error_message' => 'Recipient is empty.',
            ])->save();

            return;
        }

        try {
            $client->send($this->target, $this->message);
            $log->forceFill([
                'status' => NotificationStatus::Sent,
                'sent_at' => now(),
                'error_message' => null,
            ])->save();
        } catch (Throwable $e) {
            $log->forceFill([
                'status' => NotificationStatus::Failed,
                'error_message' => $e->getMessage(),
            ])->save();

            throw $e;
        }
    }

    /**
     * Called by Laravel when all retries are exhausted.
     */
    public function failed(Throwable $exception): void
    {
        $this->resolveLog()?->forceFill([
            'status' => NotificationStatus::Failed,
            'error_message' => $exception->getMessage(),
        ])->save();
    }

    public function retryUntil(): Carbon
    {
        return now()->addHours(1);
    }

    private function resolveLog(): NotificationLog
    {
        return NotificationLog::query()->findOrFail($this->logId);
    }
}
