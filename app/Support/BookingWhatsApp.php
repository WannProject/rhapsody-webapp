<?php

namespace App\Support;

use App\Enums\NotificationStatus;
use App\Enums\UserRole;
use App\Jobs\SendFonnteMessage;
use App\Models\Booking;
use App\Models\NotificationLog;
use App\Models\StudioSetting;
use App\Models\User;
use Illuminate\Support\Carbon;

class BookingWhatsApp
{
    public static function paymentPaid(Booking $booking): void
    {
        self::send(
            target: self::adminTarget(),
            message: self::paymentPaidMessage($booking),
            title: 'Booking Studio Baru',
            reference: $booking,
        );
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
        $user = $booking->user;
        $startsAt = self::time($booking->starts_at);
        $endsAt = self::time($booking->ends_at);

        return implode("\n", [
            'BOOKING STUDIO BARU',
            'Nama Band: '.($user->band_name ?: '-'),
            'Nama Pemesan: '.($user->contact_name ?: $booking->customer_name),
            'Nomor WhatsApp: '.($user->whatsapp_number ?: $booking->customer_phone ?: '-'),
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

    /**
     * Create a pending NotificationLog then dispatch the sender job with the log id.
     */
    private static function send(?string $target, string $message, ?string $title = null, ?Booking $reference = null): void
    {
        if (! $target) {
            return;
        }

        $log = NotificationLog::query()->create([
            'channel' => 'whatsapp',
            'recipient' => $target,
            'title' => $title,
            'message' => $message,
            'status' => NotificationStatus::Pending,
            'reference_type' => $reference ? $reference::class : null,
            'reference_id' => $reference?->id,
            'attempts' => 0,
        ]);

        SendFonnteMessage::dispatch($target, $message, $log->id);
    }
}
