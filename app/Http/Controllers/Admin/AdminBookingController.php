<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBookingStatusRequest;
use App\Models\Booking;
use App\Support\BookingWhatsApp;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class AdminBookingController extends Controller
{
    public function update(UpdateBookingStatusRequest $request, Booking $booking): RedirectResponse
    {
        $data = $request->validated();
        $status = BookingStatus::from($data['status']);

        $booking->update([
            'status' => $status,
            'payment_status' => $data['payment_status'],
            'admin_notes' => $data['admin_notes'] ?? null,
            'confirmed_at' => $status === BookingStatus::Confirmed && ! $booking->confirmed_at
                ? now()
                : $booking->confirmed_at,
            'cancelled_at' => $status === BookingStatus::Cancelled
                ? now()
                : $booking->cancelled_at,
        ]);

        BookingWhatsApp::statusChanged($booking->fresh());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status booking diperbarui.')]);

        return to_route('admin.manage', ['date' => $booking->booking_date->toDateString()]);
    }

    public function destroy(Booking $booking): RedirectResponse
    {
        $date = $booking->booking_date->toDateString();

        $booking->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking dihapus.')]);

        return to_route('admin.manage', ['date' => $date]);
    }
}
