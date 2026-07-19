<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Models\StudioSetting;
use App\Services\BookingSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request, BookingSchedule $schedule): Response|RedirectResponse
    {
        $today = now()->toDateString();
        $selectedDate = $request->query('date', $today);

        if ($selectedDate !== $today) {
            return to_route('schedule');
        }

        $studio = StudioSetting::active();

        return Inertia::render('schedule/index', [
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
        ]);
    }
}
