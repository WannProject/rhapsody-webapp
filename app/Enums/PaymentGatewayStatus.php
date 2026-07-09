<?php

namespace App\Enums;

enum PaymentGatewayStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Expired = 'expired';
    case Failed = 'failed';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Paid => 'Paid',
            self::Expired => 'Expired',
            self::Failed => 'Failed',
            self::Refunded => 'Refunded',
        };
    }
}
