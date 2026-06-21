<?php

use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Bookings\BookingController;
use App\Http\Controllers\BookingPageController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

// Public pages
Route::get('/', HomeController::class)->name('home');
Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule');
Route::redirect('/dashboard', '/');

// Auth-required pages
Route::middleware(['auth', 'verified', EnsureTeamMembership::class])->group(function () {
    // Bookings — unified page for customer + admin
    Route::get('/bookings', [BookingPageController::class, 'index'])->name('bookings');

    // Booking CRUD — customer + admin (ownership/role check in controller)
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::patch('/bookings/{booking}', [BookingController::class, 'update'])->name('bookings.update');
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])->name('bookings.destroy');

    // Admin-only actions
    Route::middleware(EnsureAdmin::class)->group(function () {
        Route::get('/reports', fn () => \Inertia\Inertia::render('reports/index'))->name('reports');

        Route::post('/payment-methods', [PaymentMethodController::class, 'store'])->name('payment-methods.store');
        Route::patch('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update'])->name('payment-methods.update');
        Route::delete('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy'])->name('payment-methods.destroy');
    });
});

// Team invitations
Route::middleware(['auth'])->group(function () {
    Route::get('/invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])
        ->name('invitations.accept');
    Route::delete('/invitations/{invitation}', [TeamInvitationController::class, 'decline'])
        ->name('invitations.decline');
});

require __DIR__.'/settings.php';
