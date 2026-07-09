<?php

namespace Database\Factories;

use App\Enums\FeeType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \App\Models\PlatformFeeRule
 */
class PlatformFeeRuleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id' => null,
            'fee_type' => FeeType::Percent,
            'percent' => fake()->randomFloat(2, 0, 10),
            'flat_amount' => 0,
            'is_active' => true,
        ];
    }
}
