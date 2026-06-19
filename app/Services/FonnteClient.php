<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class FonnteClient
{
    public function send(string $target, string $message): void
    {
        $token = config('services.fonnte.token');

        if (! $token || ! $target) {
            return;
        }

        Http::withHeaders([
            'Authorization' => $token,
        ])
            ->asForm()
            ->post((string) config('services.fonnte.base_url'), [
                'target' => $target,
                'message' => $message,
            ])
            ->throw();
    }
}
