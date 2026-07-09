<?php

namespace Database\Factories;

use App\Enums\PaymentMethodType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \App\Models\PaymentMethod
 */
class PaymentMethodFactory extends Factory
{
    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(PaymentMethodType::cases()),
            'name' => fake()->words(2, true),
            'instructions' => fake()->sentence(),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
