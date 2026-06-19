<?php

namespace App\Enums;

enum PaymentMethodType: string
{
    case Qris = 'qris';
    case VirtualAccount = 'virtual_account';
    case BankTransfer = 'bank_transfer';
    case Cash = 'cash';

    public function label(): string
    {
        return match ($this) {
            self::Qris => 'QRIS',
            self::VirtualAccount => 'Virtual Account',
            self::BankTransfer => 'Transfer Bank',
            self::Cash => 'Tunai',
        };
    }
}
