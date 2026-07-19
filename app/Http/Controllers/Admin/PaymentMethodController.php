<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePaymentMethodRequest;
use App\Http\Requests\Admin\UpdatePaymentMethodRequest;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    public function store(StorePaymentMethodRequest $request): RedirectResponse
    {
        PaymentMethod::create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->integer('sort_order', 0),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Metode pembayaran dibuat.')]);

        return to_route('orders');
    }

    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
            'sort_order' => $request->integer('sort_order', 0),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Metode pembayaran diperbarui.')]);

        return to_route('orders');
    }

    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        if ($paymentMethod->bookings()->exists()) {
            $paymentMethod->update(['is_active' => false]);
        } else {
            $paymentMethod->delete();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Metode pembayaran dinonaktifkan.')]);

        return to_route('orders');
    }
}
