<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\ClientStatus;
use App\Enums\NotificationStatus;
use App\Enums\PaymentStatus;
use App\Enums\WithdrawalStatus;
use App\Models\Booking;
use App\Models\Client;
use App\Models\Equipment;
use App\Models\NotificationLog;
use App\Models\PaymentMethod;
use App\Models\PlatformFeeRule;
use App\Models\PlatformWithdrawal;
use App\Models\StudioSetting;
use App\Services\BookingSchedule;
use App\Services\PlatformWalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(
        Request $request,
        BookingSchedule $schedule,
        PlatformWalletService $wallet,
    ): Response|RedirectResponse
    {
        $user = $request->user();
        $today = now()->toDateString();
        $selectedDate = $request->query('date', $today);

        if ($selectedDate !== $today) {
            return to_route('home');
        }

        $studio = StudioSetting::active();

        $props = [
            'selectedDate' => $selectedDate,
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
        ];

        if ($user) {
            $props = array_merge($props, [
                'bookings' => Booking::query()
                    ->with(['paymentMethod', 'user'])
                    ->where('user_id', $user->id)
                    ->where('booking_date', '>=', now()->toDateString())
                    ->latest('booking_date')
                    ->latest('starts_at')
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
                    ]),
                'stats' => [
                    'totalBookings' => Booking::query()->where('user_id', $user->id)->count(),
                    'pendingBookings' => Booking::query()->where('user_id', $user->id)->where('status', BookingStatus::Pending->value)->count(),
                    'confirmedBookings' => Booking::query()->where('user_id', $user->id)->where('status', BookingStatus::Confirmed->value)->count(),
                    'paidBookings' => Booking::query()->where('user_id', $user->id)->where('payment_status', PaymentStatus::Paid->value)->count(),
                ],
                'isAuthenticated' => true,
                'userRole' => $user->role->value,
            ]);

            if ($user->isSuperAdmin()) {
                $props['adminStats'] = [
                    'totalBookings' => Booking::query()->count(),
                    'pendingBookings' => Booking::query()->where('status', BookingStatus::Pending->value)->count(),
                    'confirmedBookings' => Booking::query()->where('status', BookingStatus::Confirmed->value)->count(),
                    'paidBookings' => Booking::query()->where('payment_status', PaymentStatus::Paid->value)->count(),
                    'totalClients' => Client::query()->count(),
                    'verifiedClients' => Client::query()->where('status', ClientStatus::Verified->value)->count(),
                    'pendingClients' => Client::query()
                        ->whereIn('status', [
                            ClientStatus::Draft->value,
                            ClientStatus::Invited->value,
                            ClientStatus::Submitted->value,
                        ])
                        ->count(),
                    'activeEquipments' => Equipment::query()->where('is_active', true)->count(),
                    'activeFeeRules' => PlatformFeeRule::query()->where('is_active', true)->count(),
                    'activePaymentMethods' => PaymentMethod::query()->where('is_active', true)->count(),
                    'failedNotifications' => NotificationLog::query()->where('status', NotificationStatus::Failed->value)->count(),
                    'pendingWithdrawalsCount' => PlatformWithdrawal::query()
                        ->whereIn('status', [
                            WithdrawalStatus::Pending->value,
                            WithdrawalStatus::Processing->value,
                        ])
                        ->count(),
                    'availableBalance' => $wallet->availableBalance(),
                    'pendingWithdrawalsAmount' => $wallet->pendingWithdrawals(),
                    'totalPlatformFee' => $wallet->totalPlatformFee(),
                    'recentBookings' => Booking::query()
                        ->with(['paymentMethod', 'user'])
                        ->latest('booking_date')
                        ->latest('starts_at')
                        ->limit(5)
                        ->get()
                        ->map(fn (Booking $booking) => [
                            'code' => $booking->code,
                            'customerName' => $booking->customer_name,
                            'customerEmail' => $booking->customer_email,
                            'bookingDate' => $booking->booking_date->toDateString(),
                            'startsAt' => substr($booking->starts_at, 0, 5),
                            'endsAt' => substr($booking->ends_at, 0, 5),
                            'totalPrice' => $booking->total_price,
                            'statusLabel' => $booking->status->label(),
                            'paymentStatusLabel' => $booking->payment_status->label(),
                            'paymentMethodName' => $booking->paymentMethod?->name,
                        ]),
                ];
            }
        }

        return Inertia::render('welcome', $props);
    }
}
