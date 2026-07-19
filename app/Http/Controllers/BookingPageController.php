<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\PaymentMethod;
use App\Models\SlotBlock;
use App\Models\StudioSetting;
use App\Services\BookingSchedule;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BookingPageController extends Controller
{
    public function index(Request $request, BookingSchedule $schedule): Response
    {
        return $this->renderPage($request, $schedule, 'booking');
    }

    public function orders(Request $request, BookingSchedule $schedule): Response
    {
        return $this->renderPage($request, $schedule, 'orders');
    }

    private function renderPage(Request $request, BookingSchedule $schedule, string $pageMode): Response
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        $selectedDate = $request->query('date', now()->toDateString());
        $filters = $isAdmin && $pageMode === 'orders' ? $request->validate([
            'filter_date' => ['nullable', 'date_format:Y-m-d'],
            'band' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::enum(BookingStatus::class)],
            'payment_status' => ['nullable', Rule::enum(PaymentStatus::class)],
        ]) : [];
        $studio = StudioSetting::active();

        $equipments = Equipment::query()
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        $slotBlocks = SlotBlock::query()
            ->whereDate('booking_date', $selectedDate)
            ->orderBy('starts_at')
            ->get();

        $bookingsQuery = Booking::query()
            ->with(['paymentMethod', 'user', 'payment', 'equipments'])
            ->latest('booking_date')
            ->latest('starts_at');

        $scopedQuery = $isAdmin ? $bookingsQuery : $bookingsQuery->where('user_id', $user->id);

        if ($isAdmin && $pageMode === 'orders') {
            $this->applyAdminFilters($scopedQuery, $filters);
        }

        $allBookings = $pageMode === 'orders'
            ? $scopedQuery->limit(50)->get()
            : collect();

        $activeBookings = $allBookings->filter(fn (Booking $b) => $b->status->isActive())->values();
        $historyBookings = $allBookings->filter(fn (Booking $b) => ! $b->status->isActive())->values();

        return Inertia::render('bookings/index', [
            'pageMode' => $pageMode,
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
            'slotBlocks' => $slotBlocks->map(fn (SlotBlock $block) => [
                'id' => $block->id,
                'bookingDate' => $block->booking_date->toDateString(),
                'startsAt' => substr($block->starts_at, 0, 5),
                'endsAt' => substr($block->ends_at, 0, 5),
                'reason' => $block->reason,
            ]),
            'equipments' => $equipments->map(fn (Equipment $equipment) => [
                'id' => $equipment->id,
                'name' => $equipment->name,
                'category' => $equipment->category,
                'stock' => $equipment->stock,
                'additionalPrice' => $equipment->additional_price,
                'isMicrophone' => $equipment->category === 'microphone',
            ]),
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
            'bookings' => $allBookings
                ->map(fn (Booking $booking) => $this->listPayload($booking))
                ->values()->all(),
            'activeBookings' => $activeBookings
                ->map(fn (Booking $booking) => $this->listPayload($booking))
                ->values()->all(),
            'historyBookings' => $historyBookings
                ->map(fn (Booking $booking) => $this->listPayload($booking))
                ->values()->all(),
            'stats' => $isAdmin
                ? [
                    'totalBookings' => Booking::query()->count(),
                    'pendingBookings' => Booking::query()->where('status', BookingStatus::Pending->value)->count(),
                    'confirmedBookings' => Booking::query()->where('status', BookingStatus::Confirmed->value)->count(),
                    'paidBookings' => Booking::query()->where('payment_status', PaymentStatus::Paid->value)->count(),
                ]
                : [
                    'totalBookings' => Booking::query()->where('user_id', $user->id)->count(),
                    'pendingBookings' => Booking::query()->where('user_id', $user->id)->where('status', BookingStatus::Pending->value)->count(),
                    'confirmedBookings' => Booking::query()->where('user_id', $user->id)->where('status', BookingStatus::Confirmed->value)->count(),
                    'paidBookings' => Booking::query()->where('user_id', $user->id)->where('payment_status', PaymentStatus::Paid->value)->count(),
                ],
            'filters' => [
                'filter_date' => $filters['filter_date'] ?? '',
                'band' => $filters['band'] ?? '',
                'status' => $filters['status'] ?? '',
                'payment_status' => $filters['payment_status'] ?? '',
            ],
            'bookingStatusOptions' => array_map(
                fn (BookingStatus $status) => ['value' => $status->value, 'label' => $status->label()],
                BookingStatus::cases(),
            ),
            'paymentStatusOptions' => array_map(
                fn (PaymentStatus $status) => ['value' => $status->value, 'label' => $status->label()],
                PaymentStatus::cases(),
            ),
        ]);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyAdminFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['filter_date'] ?? null, fn ($query, string $date) => $query->whereDate('booking_date', $date))
            ->when($filters['band'] ?? null, function ($query, string $band) {
                $query->where(function ($query) use ($band) {
                    $query
                        ->where('customer_name', 'like', "%{$band}%")
                        ->orWhere('customer_email', 'like', "%{$band}%")
                        ->orWhereHas('user', function ($query) use ($band) {
                            $query
                                ->where('band_name', 'like', "%{$band}%")
                                ->orWhere('contact_name', 'like', "%{$band}%");
                        });
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['payment_status'] ?? null, fn ($query, string $status) => $query->where('payment_status', $status));
    }

    /**
     * @return array<string, mixed>
     */
    private function listPayload(Booking $booking): array
    {
        return [
            'code' => $booking->code,
            'customerName' => $booking->customer_name,
            'customerEmail' => $booking->customer_email,
            'customerPhone' => $booking->customer_phone,
            'bandName' => $booking->user?->band_name,
            'contactName' => $booking->user?->contact_name,
            'bookingDate' => $booking->booking_date->toDateString(),
            'startsAt' => substr($booking->starts_at, 0, 5),
            'endsAt' => substr($booking->ends_at, 0, 5),
            'basePrice' => $booking->base_price,
            'additionalPrice' => $booking->additional_price,
            'totalPrice' => $booking->total_price,
            'status' => $booking->status->value,
            'statusLabel' => $booking->status->label(),
            'isActive' => $booking->status->isActive(),
            'paymentStatus' => $booking->payment_status->value,
            'paymentStatusLabel' => $booking->payment_status->label(),
            'paymentMethodId' => $booking->payment_method_id,
            'paymentMethodName' => $booking->paymentMethod?->name,
            'notes' => $booking->notes,
            'customerEquipmentNotes' => $booking->customer_equipment_notes,
            'adminNotes' => $booking->admin_notes,
            'paymentLinkUrl' => $booking->payment?->payment_link_url,
            'equipments' => $booking->equipments->map(fn (Equipment $equipment) => [
                'id' => $equipment->id,
                'name' => $equipment->name,
                'category' => $equipment->category,
                'quantity' => (int) $equipment->pivot->quantity,
                'unitPrice' => (int) $equipment->pivot->unit_price,
            ]),
        ];
    }
}
