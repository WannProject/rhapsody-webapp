<?php

namespace App\Jobs;

use App\Services\FonnteClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendFonnteMessage implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $target,
        public string $message,
    ) {
        //
    }

    public function handle(FonnteClient $client): void
    {
        $client->send($this->target, $this->message);
    }
}
