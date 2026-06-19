<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\StudioSetting;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class BookingSchedule
{
    public function endsAt(StudioSetting $studio, string $startsAt): string
    {
        return CarbonImmutable::createFromFormat('H:i', substr($startsAt, 0, 5))
            ->addMinutes($studio->slot_duration_minutes)
            ->format('H:i');
    }

    public function totalPrice(StudioSetting $studio, string $startsAt, string $endsAt): int
    {
        $start = CarbonImmutable::createFromFormat('H:i', substr($startsAt, 0, 5));
        $end = CarbonImmutable::createFromFormat('H:i', substr($endsAt, 0, 5));
        $hours = max($start->diffInMinutes($end) / 60, 0);

        return (int) round($hours * $studio->hourly_rate);
    }

    public function isSlotAvailable(string $date, string $startsAt, string $endsAt, ?Booking $ignoreBooking = null): bool
    {
        return ! Booking::query()
            ->active()
            ->whereDate('booking_date', $date)
            ->when($ignoreBooking, fn ($query) => $query->whereKeyNot($ignoreBooking->id))
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->exists();
    }

    /**
     * @return Collection<int, mixed>
     */
    public function slotsForDate(string $date, StudioSetting $studio): Collection
    {
        $open = CarbonImmutable::parse($date.' '.$studio->opens_at);
        $close = CarbonImmutable::parse($date.' '.$studio->closes_at);
        $duration = $studio->slot_duration_minutes;
        $bookings = Booking::query()
            ->active()
            ->whereDate('booking_date', $date)
            ->get();

        return collect(range(0, 100))
            ->map(fn (int $index) => $open->addMinutes($duration * $index))
            ->takeWhile(fn (CarbonImmutable $start) => $start->addMinutes($duration)->lte($close))
            ->map(function (CarbonImmutable $start) use ($bookings, $duration, $studio) {
                $end = $start->addMinutes($duration);
                $booking = $bookings->first(fn (Booking $booking) => (
                    $booking->starts_at < $end->format('H:i:s')
                    && $booking->ends_at > $start->format('H:i:s')
                ));

                return [
                    'time' => $start->format('H:i'),
                    'endsAt' => $end->format('H:i'),
                    'label' => $booking ? $booking->status->label() : 'Tersedia',
                    'price' => 'Rp '.number_format($studio->hourly_rate * ($duration / 60), 0, ',', '.'),
                    'available' => ! $booking,
                    'booking' => $booking ? [
                        'code' => $booking->code,
                        'status' => $booking->status->value,
                        'customerName' => $booking->customer_name,
                    ] : null,
                ];
            })
            ->values();
    }
}
