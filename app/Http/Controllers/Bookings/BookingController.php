<?php

namespace App\Http\Controllers\Bookings;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBookingStatusRequest;
use App\Http\Requests\Bookings\StoreBookingRequest;
use App\Http\Requests\Bookings\UpdateBookingRequest;
use App\Models\Booking;
use App\Models\StudioSetting;
use App\Services\BookingSchedule;
use App\Services\PaymentService;
use App\Support\BookingWhatsApp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService,
    ) {}

    public function store(StoreBookingRequest $request, BookingSchedule $schedule): RedirectResponse
    {
        $user = $request->user();
        $studio = StudioSetting::active();
        $validated = $request->validated();
        $startsAt = $validated['starts_at'];
        $endsAt = $schedule->endsAt($studio, $startsAt);

        $booking = DB::transaction(fn () => Booking::create([
            'user_id' => $user->id,
            'payment_method_id' => $validated['payment_method_id'],
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => ($validated['customer_phone'] ?? null) ?: $user->phone,
            'booking_date' => $validated['booking_date'],
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'total_price' => $schedule->totalPrice($studio, $startsAt, $endsAt),
            'status' => BookingStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
            'notes' => $validated['notes'] ?? null,
        ]));

        try {
            $this->paymentService->createPaymentForBooking($booking);
        } catch (\Throwable) {
        }

        $user->forceFill(['phone' => $booking->customer_phone])->save();
        BookingWhatsApp::bookingCreated($booking);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking berhasil dibuat.')]);

        return to_route('bookings', ['date' => $booking->booking_date->toDateString()]);
    }

    public function update(UpdateBookingRequest $request, Booking $booking, BookingSchedule $schedule): RedirectResponse
    {
        $validated = $request->validated();
        $studio = StudioSetting::active();
        $startsAt = $validated['starts_at'];
        $endsAt = $schedule->endsAt($studio, $startsAt);

        $booking->update([
            'payment_method_id' => $validated['payment_method_id'],
            'customer_phone' => $validated['customer_phone'] ?? $booking->customer_phone,
            'booking_date' => $validated['booking_date'],
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'total_price' => $schedule->totalPrice($studio, $startsAt, $endsAt),
            'notes' => $validated['notes'] ?? $booking->notes,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking berhasil diperbarui.')]);

        return to_route('bookings', ['date' => $booking->booking_date->toDateString()]);
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validated();
        $status = BookingStatus::from($validated['status']);

        $booking->update([
            'status' => $status,
            'payment_status' => PaymentStatus::from($validated['payment_status']),
            'admin_notes' => $validated['admin_notes'] ?? null,
            'confirmed_at' => $status === BookingStatus::Confirmed && ! $booking->confirmed_at
                ? now()
                : $booking->confirmed_at,
            'cancelled_at' => $status === BookingStatus::Cancelled
                ? now()
                : $booking->cancelled_at,
        ]);

        BookingWhatsApp::statusChanged($booking->fresh());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status booking diperbarui.')]);

        return to_route('bookings', ['date' => $booking->booking_date->toDateString()]);
    }

    public function destroy(Booking $booking): RedirectResponse
    {
        $user = request()->user();
        $isAdmin = $user->isAdmin();
        $date = $booking->booking_date->toDateString();

        if ($isAdmin) {
            $booking->delete();
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking dihapus.')]);
        } else {
            abort_unless($booking->isOwnedBy($user), 403);

            $booking->update([
                'status' => BookingStatus::Cancelled,
                'payment_status' => PaymentStatus::Cancelled,
                'cancelled_at' => now(),
            ]);

            BookingWhatsApp::statusChanged($booking->fresh());
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking dibatalkan.')]);
        }

        return to_route('bookings', ['date' => $date]);
    }
}
