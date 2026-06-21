<?php

namespace App\Http\Controllers\Bookings;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Bookings\StoreBookingRequest;
use App\Http\Requests\Bookings\UpdateBookingRequest;
use App\Models\Booking;
use App\Models\StudioSetting;
use App\Services\BookingSchedule;
use App\Support\BookingWhatsApp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function store(StoreBookingRequest $request, BookingSchedule $schedule): RedirectResponse
    {
        $user = $request->user();
        $studio = StudioSetting::active();
        $startsAt = $request->validated('starts_at');
        $endsAt = $schedule->endsAt($studio, $startsAt);

        $booking = DB::transaction(fn () => Booking::create([
            'user_id' => $user->id,
            'payment_method_id' => $request->validated('payment_method_id'),
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => $request->validated('customer_phone') ?: $user->phone,
            'booking_date' => $request->validated('booking_date'),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'total_price' => $schedule->totalPrice($studio, $startsAt, $endsAt),
            'status' => BookingStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
            'notes' => $request->validated('notes'),
        ]));

        $user->forceFill(['phone' => $booking->customer_phone])->save();
        BookingWhatsApp::bookingCreated($booking);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking berhasil dibuat.')]);

        return to_route('home', ['date' => $booking->booking_date->toDateString()]);
    }

    public function update(UpdateBookingRequest $request, Booking $booking, BookingSchedule $schedule): RedirectResponse
    {
        $studio = StudioSetting::active();
        $startsAt = $request->validated('starts_at');
        $endsAt = $schedule->endsAt($studio, $startsAt);

        $booking->update([
            'payment_method_id' => $request->validated('payment_method_id'),
            'customer_phone' => $request->validated('customer_phone'),
            'booking_date' => $request->validated('booking_date'),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'total_price' => $schedule->totalPrice($studio, $startsAt, $endsAt),
            'notes' => $request->validated('notes'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking berhasil diperbarui.')]);

        return to_route('home', ['date' => $booking->booking_date->toDateString()]);
    }

    public function destroy(Booking $booking): RedirectResponse
    {
        abort_unless($booking->isOwnedBy(request()->user()) || request()->user()->isAdmin(), 403);

        $booking->update([
            'status' => BookingStatus::Cancelled,
            'payment_status' => PaymentStatus::Cancelled,
            'cancelled_at' => now(),
        ]);

        BookingWhatsApp::statusChanged($booking->fresh());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking dibatalkan.')]);

        return to_route('home', ['date' => $booking->booking_date->toDateString()]);
    }
}
