<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BookingStatus;
use App\Enums\PaymentGatewayStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\StudioSetting;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $studio = StudioSetting::active();
        $today = now()->toDateString();
        $startOfMonth = now()->startOfMonth()->toDateString();

        $paidBookings = static fn () => Booking::query()
            ->where('payment_status', PaymentStatus::Paid->value);

        $paidPayments = static fn () => Payment::query()
            ->where('status', PaymentGatewayStatus::Paid->value);

        $stats = [
            'totalBookings' => Booking::query()->count(),
            'pendingBookings' => Booking::query()->where('status', BookingStatus::Pending->value)->count(),
            'confirmedBookings' => Booking::query()->where('status', BookingStatus::Confirmed->value)->count(),
            'completedBookings' => Booking::query()->where('status', BookingStatus::Completed->value)->count(),
            'cancelledBookings' => Booking::query()
                ->whereIn('status', [
                    BookingStatus::Cancelled->value,
                    BookingStatus::Expired->value,
                    BookingStatus::Refunded->value,
                ])
                ->count(),
            'paidBookings' => (clone $paidBookings())->count(),
            'pendingPayments' => Booking::query()->where('payment_status', PaymentStatus::Pending->value)->count(),
            'failedPayments' => Booking::query()
                ->whereIn('payment_status', [
                    PaymentStatus::Failed->value,
                    PaymentStatus::Expired->value,
                ])
                ->count(),
        ];

        $revenue = [
            'today' => (clone $paidPayments())
                ->whereDate('paid_at', $today)
                ->sum('amount'),
            'thisMonth' => (clone $paidPayments())
                ->whereBetween('paid_at', [$startOfMonth.' 00:00:00', $today.' 23:59:59'])
                ->sum('amount'),
            'allTime' => (clone $paidPayments())->sum('amount'),
        ];

        $recentBookings = Booking::query()
            ->with(['paymentMethod', 'user', 'payment'])
            ->latest('booking_date')
            ->latest('starts_at')
            ->limit(10)
            ->get()
            ->map(fn (Booking $booking) => [
                'code' => $booking->code,
                'customerName' => $booking->customer_name,
                'bandName' => $booking->user?->band_name,
                'bookingDate' => $booking->booking_date->toDateString(),
                'startsAt' => substr($booking->starts_at, 0, 5),
                'endsAt' => substr($booking->ends_at, 0, 5),
                'totalPrice' => $booking->total_price,
                'status' => $booking->status->value,
                'statusLabel' => $booking->status->label(),
                'paymentStatus' => $booking->payment_status->value,
                'paymentStatusLabel' => $booking->payment_status->label(),
                'paymentMethodName' => $booking->paymentMethod?->name,
            ]);

        $bookingsByDay = Booking::query()
            ->selectRaw('DATE(booking_date) as day, COUNT(*) as total')
            ->whereBetween('booking_date', [now()->subDays(13)->toDateString(), $today])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day')
            ->map->total;

        $last14Days = collect(range(0, 13))
            ->map(fn (int $days) => Carbon::today()->subDays($days)->toDateString())
            ->reverse()
            ->values()
            ->map(fn (string $day) => [
                'date' => $day,
                'total' => $bookingsByDay->get($day, 0),
            ]);

        $topPaymentMethods = PaymentMethod::query()
            ->withCount(['bookings as paid_bookings_count' => static fn ($query) => $query
                ->where('payment_status', PaymentStatus::Paid->value),
            ])
            ->orderByDesc('paid_bookings_count')
            ->limit(5)
            ->get()
            ->map(fn (PaymentMethod $method) => [
                'name' => $method->name,
                'typeLabel' => $method->type->label(),
                'paidBookings' => (int) $method->paid_bookings_count,
            ]);

        return Inertia::render('reports/index', [
            'studio' => [
                'name' => $studio->name,
                'hourlyRate' => $studio->hourly_rate,
            ],
            'stats' => $stats,
            'revenue' => $revenue,
            'recentBookings' => $recentBookings,
            'bookingsLast14Days' => $last14Days,
            'topPaymentMethods' => $topPaymentMethods,
            'activeEquipmentCount' => Equipment::query()->where('is_active', true)->count(),
            'activePaymentMethodCount' => PaymentMethod::query()->where('is_active', true)->count(),
        ]);
    }
}
