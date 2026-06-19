<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case PendingConfirmation = 'pending_confirmation';
    case Paid = 'paid';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Unpaid => 'Belum Dibayar',
            self::PendingConfirmation => 'Menunggu Konfirmasi',
            self::Paid => 'Lunas',
            self::Cancelled => 'Dibatalkan',
        };
    }
}
