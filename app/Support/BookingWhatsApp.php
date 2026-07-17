<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Jobs\SendFonnteMessage;
use App\Models\Booking;
use App\Models\StudioSetting;
use App\Models\User;
use Illuminate\Support\Carbon;

class BookingWhatsApp
{
    public static function paymentPaid(Booking $booking): void
    {
        self::send(self::adminTarget(), self::paymentPaidMessage($booking));
    }

    private static function adminTarget(): ?string
    {
        $studioContact = StudioSetting::active()->contact_phone;

        if ($studioContact) {
            return $studioContact;
        }

        return User::query()
            ->where('role', UserRole::SuperAdmin)
            ->whereNotNull('phone')
            ->value('phone');
    }

    private static function paymentPaidMessage(Booking $booking): string
    {
        $startsAt = self::time($booking->starts_at);
        $endsAt = self::time($booking->ends_at);

        return implode("\n", [
            'BOOKING STUDIO BARU',
            'Nama Band: '.$booking->customer_name,
            'Nama Pemesan: '.$booking->customer_name,
            'Nomor WhatsApp: '.($booking->customer_phone ?: '-'),
            'Tanggal Booking: '.$booking->booking_date->format('d/m/Y'),
            "Jam Booking: {$startsAt} - {$endsAt}",
            'Durasi: '.self::duration($booking),
            'Alat Digunakan: '.($booking->notes ?: 'Belum dicatat'),
            'Total Pembayaran: Rp '.number_format($booking->total_price, 0, ',', '.'),
            'Status Pembayaran: Berhasil',
            'Silakan periksa detail pesanan melalui dashboard Superadmin.',
        ]);
    }

    private static function duration(Booking $booking): string
    {
        $start = Carbon::parse($booking->booking_date->toDateString().' '.$booking->starts_at);
        $end = Carbon::parse($booking->booking_date->toDateString().' '.$booking->ends_at);
        $minutes = $start->diffInMinutes($end);
        $hours = intdiv($minutes, 60);
        $remainingMinutes = $minutes % 60;

        if ($hours > 0 && $remainingMinutes > 0) {
            return "{$hours} jam {$remainingMinutes} menit";
        }

        if ($hours > 0) {
            return "{$hours} jam";
        }

        return "{$minutes} menit";
    }

    private static function time(string $value): string
    {
        return substr($value, 0, 5);
    }

    private static function send(?string $target, string $message): void
    {
        if (! $target) {
            return;
        }

        SendFonnteMessage::dispatch($target, $message);
    }
}
