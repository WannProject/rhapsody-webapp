<?php

use App\Http\Controllers\Admin\AdminBookingController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Bookings\BookingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Root — RhapsodyApp home page
Route::inertia('/', 'welcome')->name('home');

// Public pages
Route::inertia('/schedule', 'schedule/index')->name('schedule');

// Auth-required pages
Route::middleware(['auth', 'verified', EnsureTeamMembership::class])->group(function () {
    Route::inertia('/booking', 'booking/index')->name('booking');
    Route::inertia('/payment', 'payments/index')->name('payment');
    Route::inertia('/reports', 'reports/index')->name('reports');
});

// Customer booking routes
Route::middleware(['auth', 'verified', 'role:customer', EnsureTeamMembership::class])
    ->group(function () {
        Route::post('/booking', [BookingController::class, 'store'])
            ->name('booking.store');
        Route::patch('/booking/{booking}', [BookingController::class, 'update'])
            ->name('booking.update');
        Route::delete('/booking/{booking}', [BookingController::class, 'destroy'])
            ->name('booking.destroy');
    });

// Admin routes
Route::middleware(['auth', 'verified', 'role:admin', EnsureTeamMembership::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/manage', DashboardController::class)
            ->name('manage');

        Route::patch('/booking/{booking}', [AdminBookingController::class, 'update'])
            ->name('booking.update');
        Route::delete('/booking/{booking}', [AdminBookingController::class, 'destroy'])
            ->name('booking.destroy');

        Route::post('/payment-methods', [PaymentMethodController::class, 'store'])
            ->name('payment-methods.store');
        Route::patch('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update'])
            ->name('payment-methods.update');
        Route::delete('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy'])
            ->name('payment-methods.destroy');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('/invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])
        ->name('invitations.accept');
    Route::delete('/invitations/{invitation}', [TeamInvitationController::class, 'decline'])
        ->name('invitations.decline');
});

require __DIR__.'/settings.php';
