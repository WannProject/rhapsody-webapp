<?php

namespace App\Support;

use App\Jobs\SendFonnteMessage;
use App\Models\Booking;

class BookingWhatsApp
{
    public static function bookingCreated(Booking $booking): void
    {
        self::send($booking, "Halo {$booking->customer_name}, booking {$booking->code} untuk {$booking->booking_date->format('d M Y')} pukul {$booking->starts_at} sudah kami terima dan menunggu konfirmasi admin.");
    }

    public static function statusChanged(Booking $booking): void
    {
        self::send($booking, "Update booking {$booking->code}: status booking {$booking->status->label()}, status pembayaran {$booking->payment_status->label()}.");
    }

    public static function paymentPaid(Booking $booking): void
    {
        self::send($booking, "Pembayaran untuk booking {$booking->code} telah diterima. Status booking: {$booking->status->label()}. Terima kasih!");
    }

    private static function send(Booking $booking, string $message): void
    {
        if (! $booking->customer_phone) {
            return;
        }

        SendFonnteMessage::dispatch($booking->customer_phone, $message);
    }
}
