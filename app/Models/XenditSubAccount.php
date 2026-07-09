<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $client_id
 * @property string $xendit_account_id
 * @property string $status
 * @property string $type
 * @property array|null $onboarding_payload
 * @property \Illuminate\Support\Carbon|null $onboarded_at
 * @property-read Client $client
 */
#[Fillable(['client_id', 'xendit_account_id', 'status', 'type', 'onboarding_payload', 'onboarded_at'])]
class XenditSubAccount extends Model
{
    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    protected function casts(): array
    {
        return [
            'onboarding_payload' => 'array',
            'onboarded_at' => 'datetime',
        ];
    }
}
