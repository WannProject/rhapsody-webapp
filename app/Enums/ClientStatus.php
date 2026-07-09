<?php

namespace App\Enums;

enum ClientStatus: string
{
    case Draft = 'draft';
    case Invited = 'invited';
    case Submitted = 'submitted';
    case Verified = 'verified';
    case Rejected = 'rejected';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Invited => 'Invited',
            self::Submitted => 'Submitted',
            self::Verified => 'Verified',
            self::Rejected => 'Rejected',
            self::Suspended => 'Suspended',
        };
    }

    public function canReceivePayments(): bool
    {
        return $this === self::Verified;
    }
}
