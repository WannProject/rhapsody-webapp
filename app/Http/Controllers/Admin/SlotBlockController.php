<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSlotBlockRequest;
use App\Models\SlotBlock;
use App\Services\BookingSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SlotBlockController extends Controller
{
    public function store(StoreSlotBlockRequest $request, BookingSchedule $schedule): RedirectResponse
    {
        $studio = \App\Models\StudioSetting::active();
        $validated = $request->validated();
        $startsAt = $validated['starts_at'];
        $endsAt = $schedule->endsAt($studio, $startsAt);

        $existing = SlotBlock::query()
            ->whereDate('booking_date', $validated['booking_date'])
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->exists();

        if ($existing) {
            return back()->withInput()->withErrors([
                'starts_at' => __('Slot ini sudah diblokir.'),
            ]);
        }

        SlotBlock::query()->create([
            'booking_date' => $validated['booking_date'],
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'reason' => $validated['reason'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        return to_route('bookings', ['date' => $validated['booking_date']])
            ->with('toast', ['type' => 'success', 'message' => __('Slot berhasil diblokir.')]);
    }

    public function destroy(Request $request, SlotBlock $slotBlock): RedirectResponse
    {
        $date = $slotBlock->booking_date->toDateString();

        $slotBlock->delete();

        return to_route('bookings', ['date' => $date])
            ->with('toast', ['type' => 'success', 'message' => __('Blokir slot dibatalkan.')]);
    }
}
