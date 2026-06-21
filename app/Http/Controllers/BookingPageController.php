<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\PaymentMethod;
use App\Models\StudioSetting;
use App\Services\BookingSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingPageController extends Controller
{
    public function index(Request $request, BookingSchedule $schedule): Response
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        $selectedDate = $request->query('date', now()->toDateString());
        $studio = StudioSetting::active();

        $bookingsQuery = Booking::query()
            ->with(['paymentMethod', 'user'])
            ->latest('booking_date')
            ->latest('starts_at');

        return Inertia::render('bookings/index', [
            'isAdmin' => $isAdmin,
            'selectedDate' => $selectedDate,
            'userRole' => $user->role->value,
            'studio' => [
                'name' => $studio->name,
                'opensAt' => substr($studio->opens_at, 0, 5),
                'closesAt' => substr($studio->closes_at, 0, 5),
                'slotDurationMinutes' => $studio->slot_duration_minutes,
                'hourlyRate' => $studio->hourly_rate,
            ],
            'scheduleSlots' => $schedule->slotsForDate($selectedDate, $studio),
            'paymentMethods' => PaymentMethod::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn (PaymentMethod $method) => [
                    'id' => $method->id,
                    'type' => $method->type->value,
                    'typeLabel' => $method->type->label(),
                    'name' => $method->name,
                    'instructions' => $method->instructions,
                    'isActive' => $method->is_active,
                    'sortOrder' => $method->sort_order,
                ]),
            'allPaymentMethods' => PaymentMethod::query()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn (PaymentMethod $method) => [
                    'id' => $method->id,
                    'type' => $method->type->value,
                    'typeLabel' => $method->type->label(),
                    'name' => $method->name,
                    'instructions' => $method->instructions,
                    'isActive' => $method->is_active,
                    'sortOrder' => $method->sort_order,
                ]),
            'bookings' => ($isAdmin ? $bookingsQuery : $bookingsQuery->where('user_id', $user->id))
                ->limit(50)
                ->get()
                ->map(fn (Booking $booking) => [
                    'code' => $booking->code,
                    'customerName' => $booking->customer_name,
                    'customerEmail' => $booking->customer_email,
                    'customerPhone' => $booking->customer_phone,
                    'bookingDate' => $booking->booking_date->toDateString(),
                    'startsAt' => substr($booking->starts_at, 0, 5),
                    'endsAt' => substr($booking->ends_at, 0, 5),
                    'totalPrice' => $booking->total_price,
                    'status' => $booking->status->value,
                    'statusLabel' => $booking->status->label(),
                    'paymentStatus' => $booking->payment_status->value,
                    'paymentStatusLabel' => $booking->payment_status->label(),
                    'paymentMethodId' => $booking->payment_method_id,
                    'paymentMethodName' => $booking->paymentMethod?->name,
                    'notes' => $booking->notes,
                    'adminNotes' => $booking->admin_notes,
                ]),
            'stats' => $isAdmin
                ? [
                    'totalBookings' => Booking::query()->count(),
                    'pendingBookings' => Booking::query()->where('status', 'pending')->count(),
                    'confirmedBookings' => Booking::query()->where('status', 'confirmed')->count(),
                    'paidBookings' => Booking::query()->where('payment_status', 'paid')->count(),
                ]
                : [
                    'totalBookings' => Booking::query()->where('user_id', $user->id)->count(),
                    'pendingBookings' => Booking::query()->where('user_id', $user->id)->where('status', 'pending')->count(),
                    'confirmedBookings' => Booking::query()->where('user_id', $user->id)->where('status', 'confirmed')->count(),
                    'paidBookings' => Booking::query()->where('user_id', $user->id)->where('payment_status', 'paid')->count(),
                ],
        ]);
    }
}
