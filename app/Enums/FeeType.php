<?php

namespace App\Enums;

enum FeeType: string
{
    case Flat = 'flat';
    case Percent = 'percent';
    case Hybrid = 'hybrid';

    public function label(): string
    {
        return match ($this) {
            self::Flat => 'Flat',
            self::Percent => 'Percent',
            self::Hybrid => 'Hybrid',
        };
    }

    public function calculate(int $amount, float $percent, int $flatAmount): int
    {
        return match ($this) {
            self::Flat => $flatAmount,
            self::Percent => (int) round($amount * ($percent / 100)),
            self::Hybrid => (int) round($amount * ($percent / 100)) + $flatAmount,
        };
    }
}
