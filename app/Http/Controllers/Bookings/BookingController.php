<?php

namespace App\Http\Controllers\Bookings;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBookingStatusRequest;
use App\Http\Requests\Bookings\StoreBookingRequest;
use App\Http\Requests\Bookings\UpdateBookingRequest;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\StudioSetting;
use App\Services\BookingSchedule;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
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

        $booking = DB::transaction(function () use ($schedule, $studio, $validated, $startsAt, $endsAt, $user, $request) {
            StudioSetting::query()->whereKey($studio->id)->lockForUpdate()->firstOrFail();

            if (! $schedule->lockSlotAvailable($validated['booking_date'], $startsAt, $endsAt)) {
                throw ValidationException::withMessages([
                    'starts_at' => __('Slot waktu ini sudah dibooking.'),
                ]);
            }

            $equipmentSelection = $this->normalizeEquipmentSelection($validated['equipment'] ?? []);
            $equipments = Equipment::query()
                ->where('is_active', true)
                ->whereIn('id', array_keys($equipmentSelection))
                ->get()
                ->keyBy('id');

            $basePrice = $schedule->totalPrice($studio, $startsAt, $endsAt);
            $additionalPrice = $schedule->equipmentAdditionalPrice($equipments, $equipmentSelection);

            $booking = Booking::create([
                'user_id' => $user->id,
                'payment_method_id' => $validated['payment_method_id'],
                'customer_name' => $user->contact_name ?? $user->band_name ?? $user->name,
                'customer_email' => $user->email,
                'customer_phone' => ($validated['customer_phone'] ?? null) ?: $user->whatsapp_number ?: $user->phone,
                'booking_date' => $validated['booking_date'],
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'base_price' => $basePrice,
                'additional_price' => $additionalPrice,
                'total_price' => $basePrice + $additionalPrice,
                'status' => BookingStatus::Pending,
                'payment_status' => PaymentStatus::Unpaid,
                'held_until' => $schedule->holdUntil(),
                'notes' => $validated['notes'] ?? null,
                'customer_equipment_notes' => $validated['customer_equipment_notes'] ?? null,
            ]);

            $this->syncEquipment($booking, $equipments, $equipmentSelection);

            return $booking;
        });

        $payment = null;

        try {
            $payment = $this->paymentService->createPaymentForBooking($booking);
        } catch (\Throwable) {
        }

        $user->forceFill(['whatsapp_number' => $booking->customer_phone])->save();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking berhasil dibuat.')]);

        if ($payment?->payment_link_url) {
            return redirect()->away($payment->payment_link_url);
        }

        return to_route('bookings', ['date' => $booking->booking_date->toDateString()]);
    }

    public function update(UpdateBookingRequest $request, Booking $booking, BookingSchedule $schedule): RedirectResponse
    {
        $validated = $request->validated();
        $studio = StudioSetting::active();
        $startsAt = $validated['starts_at'];
        $endsAt = $schedule->endsAt($studio, $startsAt);

        DB::transaction(function () use ($booking, $schedule, $studio, $validated, $startsAt, $endsAt, $request) {
            StudioSetting::query()->whereKey($studio->id)->lockForUpdate()->firstOrFail();

            if (! $schedule->lockSlotAvailable($validated['booking_date'], $startsAt, $endsAt, $booking)) {
                throw ValidationException::withMessages([
                    'starts_at' => __('Slot waktu ini sudah dibooking.'),
                ]);
            }

            $equipmentSelection = $this->normalizeEquipmentSelection($validated['equipment'] ?? []);
            $equipments = Equipment::query()
                ->where('is_active', true)
                ->whereIn('id', array_keys($equipmentSelection))
                ->get()
                ->keyBy('id');

            $basePrice = $schedule->totalPrice($studio, $startsAt, $endsAt);
            $additionalPrice = $schedule->equipmentAdditionalPrice($equipments, $equipmentSelection);

            $booking->update([
                'payment_method_id' => $validated['payment_method_id'],
                'customer_phone' => $validated['customer_phone'] ?? $booking->customer_phone,
                'booking_date' => $validated['booking_date'],
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'base_price' => $basePrice,
                'additional_price' => $additionalPrice,
                'total_price' => $basePrice + $additionalPrice,
                'held_until' => $booking->status === BookingStatus::Pending
                    ? $schedule->holdUntil()
                    : $booking->held_until,
                'notes' => $validated['notes'] ?? $booking->notes,
                'customer_equipment_notes' => $validated['customer_equipment_notes'] ?? $booking->customer_equipment_notes,
            ]);

            $this->syncEquipment($booking, $equipments, $equipmentSelection);
        });

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
            'held_until' => $status === BookingStatus::Pending ? $booking->held_until : null,
        ]);

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
                'held_until' => null,
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking dibatalkan.')]);
        }

        return to_route('bookings', ['date' => $date]);
    }

    /**
     * Coerce the equipment input into {equipment_id => quantity} ints, dropping zero/negatives.
     *
     * @param  array<mixed>  $input
     * @return array<int, int>
     */
    private function normalizeEquipmentSelection(array $input): array
    {
        $cleaned = [];

        foreach ($input as $id => $quantity) {
            $id = (int) $id;
            $quantity = (int) $quantity;

            if ($id <= 0 || $quantity <= 0) {
                continue;
            }

            $cleaned[$id] = $quantity;
        }

        return $cleaned;
    }

    /**
     * @param  array<int, int>  $selection
     * @param  Collection<int, Equipment>  $equipments
     */
    private function syncEquipment(Booking $booking, Collection $equipments, array $selection): void
    {
        if ($selection === []) {
            $booking->equipments()->detach();

            return;
        }

        $pivot = [];

        foreach ($selection as $id => $quantity) {
            $equipment = $equipments->get($id);
            if (! $equipment) {
                continue;
            }

            $allowed = min($quantity, $equipment->stock);
            if ($allowed <= 0) {
                continue;
            }

            $pivot[$id] = [
                'quantity' => $allowed,
                'unit_price' => $equipment->additional_price,
            ];
        }

        $booking->equipments()->sync($pivot);
    }
}
