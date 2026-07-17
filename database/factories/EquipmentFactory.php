<?php

namespace Database\Factories;

use App\Models\Equipment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Equipment>
 */
class EquipmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'category' => fake()->randomElement(['guitar', 'keyboard', 'bass', 'drum', 'microphone']),
            'stock' => fake()->numberBetween(1, 5),
            'additional_price' => fake()->numberBetween(0, 5) * 25000,
            'is_active' => true,
        ];
    }
}
