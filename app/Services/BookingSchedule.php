<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\StudioSetting;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
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

    /**
     * Calculate the equipment additional price for a selection of equipment with quantities.
     *
     * @param  Collection<int, Equipment>  $equipments  keyed by id
     * @param  array<int, int>  $quantities  equipment_id => quantity
     */
    public function equipmentAdditionalPrice(Collection $equipments, array $quantities): int
    {
        $total = 0;

        foreach ($quantities as $equipmentId => $quantity) {
            $quantity = (int) $quantity;
            if ($quantity <= 0) {
                continue;
            }

            $equipment = $equipments->firstWhere('id', (int) $equipmentId);
            if (! $equipment || ! $equipment->is_active) {
                continue;
            }

            $allowed = min($quantity, $equipment->stock);
            if ($allowed <= 0) {
                continue;
            }

            $total += $allowed * (int) $equipment->additional_price;
        }

        return $total;
    }

    public function isSlotAvailable(string $date, string $startsAt, string $endsAt, ?Booking $ignoreBooking = null): bool
    {
        $this->releaseExpiredHolds($date);

        return ! $this->conflictingBookings($date, $startsAt, $endsAt, $ignoreBooking)
            ->exists();
    }

    public function lockSlotAvailable(string $date, string $startsAt, string $endsAt, ?Booking $ignoreBooking = null): bool
    {
        $this->releaseExpiredHolds($date);

        return ! $this->conflictingBookings($date, $startsAt, $endsAt, $ignoreBooking)
            ->lockForUpdate()
            ->exists();
    }

    public function holdUntil(): CarbonImmutable
    {
        return CarbonImmutable::now()->addMinutes((int) config('booking.hold_minutes', 15));
    }

    public function releaseExpiredHolds(?string $date = null): int
    {
        return Booking::query()
            ->where('status', BookingStatus::Pending->value)
            ->whereNotNull('held_until')
            ->where('held_until', '<', now())
            ->when($date, fn (Builder $query) => $query->whereDate('booking_date', $date))
            ->update([
                'status' => BookingStatus::Expired->value,
                'payment_status' => PaymentStatus::Expired->value,
                'cancelled_at' => now(),
            ]);
    }

    /**
     * @return Builder<Booking>
     */
    public function conflictingBookings(string $date, string $startsAt, string $endsAt, ?Booking $ignoreBooking = null): Builder
    {
        return Booking::query()
            ->active()
            ->whereDate('booking_date', $date)
            ->when($ignoreBooking, fn ($query) => $query->whereKeyNot($ignoreBooking->id))
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt);
    }

    /**
     * @return Collection<int, mixed>
     */
    public function slotsForDate(string $date, StudioSetting $studio): Collection
    {
        $this->releaseExpiredHolds($date);

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
                    'label' => $booking ? $this->slotLabel($booking) : 'Tersedia',
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

    private function slotLabel(Booking $booking): string
    {
        if ($booking->status === BookingStatus::Pending && $booking->held_until) {
            return 'Ditahan sementara';
        }

        return $booking->status->label();
    }
}
