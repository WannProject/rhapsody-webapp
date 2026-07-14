<?php

use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Admin\PlatformFeeRuleController;
use App\Http\Controllers\Admin\PlatformWalletController;
use App\Http\Controllers\Admin\PlatformWithdrawalController;
use App\Http\Controllers\BookingPageController;
use App\Http\Controllers\Bookings\BookingController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\WebhookController;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public pages
Route::get('/', HomeController::class)->name('home');
Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule');
Route::redirect('/dashboard', '/');

// Xendit webhook (public, verified by callback token)
Route::post('/webhooks/xendit', [WebhookController::class, 'xendit'])->name('webhooks.xendit');

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
        Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus'])->name('bookings.status');

        Route::get('/reports', fn () => Inertia::render('reports/index'))->name('reports');

        Route::post('/payment-methods', [PaymentMethodController::class, 'store'])->name('payment-methods.store');
        Route::patch('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update'])->name('payment-methods.update');
        Route::delete('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy'])->name('payment-methods.destroy');
    });

    // Super Admin-only — XenPlatform management
    Route::middleware(EnsureSuperAdmin::class)->prefix('admin')->name('admin.')->group(function () {
        // Clients
        Route::get('/clients', [ClientController::class, 'index'])->name('clients.index');
        Route::post('/clients', [ClientController::class, 'store'])->name('clients.store');
        Route::get('/clients/{client}', [ClientController::class, 'show'])->name('clients.show');
        Route::patch('/clients/{client}', [ClientController::class, 'update'])->name('clients.update');
        Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');
        Route::post('/clients/{client}/sub-account', [ClientController::class, 'createSubAccount'])->name('clients.sub-account');

        // Platform Fee Rules
        Route::get('/platform-fees', [PlatformFeeRuleController::class, 'index'])->name('platform-fees.index');
        Route::post('/platform-fees', [PlatformFeeRuleController::class, 'store'])->name('platform-fees.store');
        Route::patch('/platform-fees/{platformFeeRule}', [PlatformFeeRuleController::class, 'update'])->name('platform-fees.update');
        Route::delete('/platform-fees/{platformFeeRule}', [PlatformFeeRuleController::class, 'destroy'])->name('platform-fees.destroy');

        // Platform Wallet
        Route::get('/platform-wallet', [PlatformWalletController::class, 'index'])->name('platform-wallet.index');
        Route::get('/platform-wallet/export', [PlatformWalletController::class, 'export'])->name('platform-wallet.export');

        // Withdrawals
        Route::post('/platform-withdrawals', [PlatformWithdrawalController::class, 'store'])->middleware('throttle:withdrawals')->name('platform-withdrawals.store');
        Route::delete('/platform-withdrawals/{platformWithdrawal}', [PlatformWithdrawalController::class, 'destroy'])->name('platform-withdrawals.destroy');
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
