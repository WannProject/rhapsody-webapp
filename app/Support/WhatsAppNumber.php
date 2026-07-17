<?php

namespace App\Support;

class WhatsAppNumber
{
    /**
     * Normalize an Indonesian WhatsApp number to the 62xxx format used by Fonnte.
     *
     * Rules:
     * - Strip everything except digits.
     * - "08..." -> "628...".
     * - "+62..." -> "62...".
     * - "8..." (no prefix) -> "628...".
     * - Empty/null input returns null.
     */
    public static function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value);

        if ($digits === '' || $digits === '0') {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        if (str_starts_with($digits, '62')) {
            return $digits;
        }

        if (str_starts_with($digits, '8')) {
            return '62'.$digits;
        }

        // International numbers outside ID keep their original digits.
        return $digits;
    }
}
