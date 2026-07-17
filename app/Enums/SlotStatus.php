<?php

namespace App\Enums;

enum SlotStatus: string
{
    case Available = 'available';
    case Held = 'held';
    case Booked = 'booked';
    case Blocked = 'blocked';

    public function label(): string
    {
        return match ($this) {
            self::Available => 'Tersedia',
            self::Held => 'Ditahan sementara',
            self::Booked => 'Sudah dibooking',
            self::Blocked => 'Diblokir',
        };
    }

    public function isBookable(): bool
    {
        return $this === self::Available;
    }
}
