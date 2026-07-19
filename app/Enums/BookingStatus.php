<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
    case Completed = 'completed';
    case Expired = 'expired';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu Konfirmasi',
            self::Confirmed => 'Terkonfirmasi',
            self::Cancelled => 'Dibatalkan',
            self::Completed => 'Selesai',
            self::Expired => 'Kedaluwarsa',
            self::Refunded => 'Refunded',
        };
    }

    /**
     * Bookings still considered "active" (customer-facing in-progress orders).
     */
    public function isActive(): bool
    {
        return in_array($this, [self::Pending, self::Confirmed], true);
    }

    /**
     * Bookings that have reached a terminal state (no further customer action needed).
     */
    public function isTerminal(): bool
    {
        return in_array($this, [self::Cancelled, self::Expired, self::Refunded], true);
    }

    /**
     * @return list<string>
     */
    public static function activeValues(): array
    {
        return array_map(fn (self $s) => $s->value, [self::Pending, self::Confirmed]);
    }

    /**
     * @return list<string>
     */
    public static function historyValues(): array
    {
        return array_map(fn (self $s) => $s->value, [self::Completed, self::Cancelled, self::Expired, self::Refunded]);
    }
}
