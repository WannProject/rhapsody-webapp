# 🎵 Rhapsody Studio — Refactor Prompt

> **Project:** Sistem Booking Studio Rekaman  
> **Stack:** Laravel 13 + React (Inertia.js + TypeScript)  
> **Role:** Admin & Customer

---

## 📋 Konteks Project

- Framework backend: **Laravel 13**
- Frontend: **React + TypeScript + Inertia.js** (Laravel Starter Kit)
- Ada dua role pengguna: **Admin** dan **Customer**
- Customer dapat melakukan booking sesi rekaman di studio
- Admin dapat mengelola semua data (jadwal, booking, laporan, user)

---

## 🚨 Masalah yang Perlu Diperbaiki

### 1. Routing Bermasalah

- Route prefix tidak wajar, contoh: `/rhapsody-admins-team/dashboard`
- Akses ke root URL `/` langsung menampilkan dashboard tanpa autentikasi
- Seharusnya `/` redirect ke halaman **login** jika user belum login

### 2. Styling Tidak Konsisten

- Masih ada elemen yang menggunakan style default bawaan Laravel Breeze
- Custom styling yang sudah dibuat belum diterapkan secara merata
- Perlu menghapus atau menimpa semua style default yang tidak dipakai

### 3. Struktur Folder Belum Rapi

- File halaman dan komponen perlu diorganisir ulang secara konsisten
- Setiap halaman harus punya file yang lengkap: `index`, `create`, `edit`, `show`, `delete`

---

## 📁 Struktur Folder yang Diinginkan

### Pages — `resources/js/pages/`

```
pages/
├── auth/
│   ├── login.tsx
│   └── register.tsx
│
├── dashboard/
│   └── index.tsx               # Dashboard utama (Admin)
│
├── schedule/
│   ├── index.tsx
│   ├── create.tsx
│   ├── edit.tsx
│   ├── show.tsx
│   └── delete.tsx
│
├── booking/
│   ├── index.tsx
│   ├── create.tsx
│   ├── edit.tsx
│   ├── show.tsx
│   └── delete.tsx
│
├── report/
│   ├── index.tsx
│   └── show.tsx
│
├── admin/
│   ├── index.tsx
│   ├── create.tsx
│   ├── edit.tsx
│   ├── show.tsx
│   └── delete.tsx
│
└── user/
    ├── index.tsx
    ├── create.tsx
    ├── edit.tsx
    ├── show.tsx
    └── delete.tsx
```

### Components — `resources/js/components/`

```
components/
├── ui/                         # Komponen UI generik
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Badge.tsx
│
├── layout/
│   ├── AdminLayout.tsx         # Layout sidebar untuk Admin
│   └── CustomerLayout.tsx      # Layout navbar untuk Customer
│
├── schedule/
│   ├── ScheduleTable.tsx
│   └── ScheduleForm.tsx
│
├── booking/
│   ├── BookingTable.tsx
│   └── BookingForm.tsx
│
├── report/
│   └── ReportCard.tsx
│
├── admin/
│   ├── AdminTable.tsx
│   └── AdminForm.tsx
│
└── user/
    ├── UserTable.tsx
    └── UserForm.tsx
```

---

## 🛣️ Routing yang Diinginkan

### `routes/web.php`

```php
<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\AdminBookingController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Customer\CustomerDashboardController;
use App\Http\Controllers\Customer\BookingController;

// Root redirect ke login
Route::get('/', fn() => redirect('/login'));

// Auth routes bawaan Laravel
require __DIR__.'/auth.php';

// Customer routes
Route::middleware(['auth', 'role:customer'])
    ->group(function () {
        Route::get('/dashboard', [CustomerDashboardController::class, 'index'])
            ->name('customer.dashboard');
        Route::resource('/booking', BookingController::class);
    });

// Admin routes
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])
            ->name('dashboard');
        Route::resource('/schedule', ScheduleController::class);
        Route::resource('/booking', AdminBookingController::class);
        Route::resource('/report', ReportController::class);
        Route::resource('/users', UserController::class);
    });
```

---

## 🔐 Role & Middleware

### Migration — Tambah Kolom `role` ke Tabel `users`

```php
// database/migrations/xxxx_add_role_to_users_table.php
Schema::table('users', function (Blueprint $table) {
    $table->enum('role', ['admin', 'customer'])->default('customer')->after('email');
});
```

### Middleware — `app/Http/Middleware/CheckRole.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): mixed
    {
        if (!$request->user() || $request->user()->role !== $role) {
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
```

### Register Middleware — `bootstrap/app.php`

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\CheckRole::class,
    ]);
})
```

### Redirect Setelah Login — `AuthenticatedSessionController.php`

```php
public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();
    $request->session()->regenerate();

    $user = $request->user();

    return redirect(
        $user->role === 'admin' ? '/admin/dashboard' : '/dashboard'
    );
}
```

---

## ✅ Checklist Refactor

- [ ] Perbaiki semua route di `routes/web.php` sesuai struktur di atas
- [ ] Root URL `/` redirect ke `/login`
- [ ] Buat middleware `CheckRole` dan register di `bootstrap/app.php`
- [ ] Tambah kolom `role` ke tabel `users` via migration
- [ ] Perbaiki redirect setelah login berdasarkan role
- [ ] Refactor semua file di `resources/js/pages/` sesuai struktur folder
- [ ] Refactor semua file di `resources/js/components/` sesuai struktur folder
- [ ] Buat `AdminLayout.tsx` — layout dengan sidebar untuk admin
- [ ] Buat `CustomerLayout.tsx` — layout dengan navbar untuk customer
- [ ] Pastikan semua halaman menggunakan layout yang sesuai rolenya
- [ ] Semua modal CRUD (create, edit, delete) menggunakan komponen popup `Modal.tsx`
- [ ] Hapus semua styling default Breeze yang tidak dipakai
- [ ] Terapkan custom styling secara konsisten di semua halaman

---

## 📝 Catatan Tambahan

- Semua operasi CRUD (tambah, edit, hapus) menggunakan **modal popup**, bukan halaman terpisah
- Layout Admin menggunakan **sidebar navigasi** dengan menu: Dashboard, Schedule, Booking, Report, Users
- Layout Customer menggunakan **navbar** dengan menu: Dashboard, Booking Saya
- Gunakan **TypeScript** secara konsisten di semua file React
- Pastikan semua props Inertia di-type dengan benar menggunakan `PageProps`

---

_Kerjakan satu per satu sesuai checklist, dan jelaskan setiap perubahan yang dibuat._
