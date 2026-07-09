<?php

namespace App\Models;

use App\Enums\FeeType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $client_id
 * @property FeeType $fee_type
 * @property float $percent
 * @property int $flat_amount
 * @property string|null $xendit_split_rule_id
 * @property bool $is_active
 * @property-read Client|null $client
 */
#[Fillable(['client_id', 'fee_type', 'percent', 'flat_amount', 'xendit_split_rule_id', 'is_active'])]
class PlatformFeeRule extends Model
{
    /** @use HasFactory<\Database\Factories\PlatformFeeRuleFactory> */
    use HasFactory;
    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function calculateFee(int $amount): int
    {
        return $this->fee_type->calculate($amount, $this->percent, $this->flat_amount);
    }

    protected function casts(): array
    {
        return [
            'fee_type' => FeeType::class,
            'percent' => 'float',
            'flat_amount' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
