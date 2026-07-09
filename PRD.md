# 🎵 Rhapsody Studio — PRD (Product Requirements Document)

> **Project:** Sistem Booking Studio Rekaman  
> **Stack:** Laravel 13 + React (Inertia.js + TypeScript)  
> **Status:** Refactor Phase 2 — Unified Permission-Based Architecture

---

## 1. Ringkasan

### Problem Saat Ini

- Halaman admin (`/admin/manage`) dan customer terpisah → duplikasi kode
- Nav "Payment" ada di sidebar padahal bisa diakses dari flow booking
- Customer bisa lihat link "Admin" di sidebar
- Dashboard controller terpisah dan tidak efisien

### Solusi

- **Single Page + Permission-Based Access** — satu halaman untuk semua role, beda hak akses
- Gabung `dashboard`, `booking-form`, `payment` ke halaman `/bookings`
- Reports tetap terpisah admin-only

---

## 2. Arsitektur Route

| Method | Route                   | Auth | Role           | Controller                        |
| ------ | ----------------------- | ---- | -------------- | --------------------------------- |
| GET    | `/`                     | ✗    | All            | `HomeController`                  |
| GET    | `/schedule`             | ✗    | All            | `ScheduleController@index`        |
| GET    | `/bookings`             | ✓    | All            | `BookingPageController@index`     |
| GET    | `/reports`              | ✓    | Admin          | `ReportController@index`          |
| POST   | `/bookings`             | ✓    | Customer       | `BookingController@store`         |
| PATCH  | `/bookings/{id}`        | ✓    | Customer/Admin | `BookingController@update`        |
| DELETE | `/bookings/{id}`        | ✓    | Customer/Admin | `BookingController@destroy`       |
| POST   | `/payment-methods`      | ✓    | Admin          | `PaymentMethodController@store`   |
| PATCH  | `/payment-methods/{id}` | ✓    | Admin          | `PaymentMethodController@update`  |
| DELETE | `/payment-methods/{id}` | ✓    | Admin          | `PaymentMethodController@destroy` |

### Route yang Dihapus

/admin/\* → digabung ke /bookings
/admin/manage → digabung ke /bookings
/payment → digabung ke /bookings (flow)
/dashboard → redirect ke /

---

## 3. Navigation Sidebar

| Item     | Route       | Guest | Customer | Admin |
| -------- | ----------- | ----- | -------- | ----- |
| Home     | `/`         | ✓     | ✓        | ✓     |
| Schedule | `/schedule` | ✓     | ✓        | ✓     |
| Bookings | `/bookings` | ✗     | ✓        | ✓     |
| Reports  | `/reports`  | ✗     | ✗        | ✓     |

## **Payment**: tidak di sidebar, diakses dari flow booking saja.

## 4. Halaman `/bookings` — Satu Halaman Dua Role

### Props dari Server

```ts
{
  isAdmin: boolean;
  bookings: Booking[];          // admin: semua, customer: milik sendiri
  scheduleSlots: ScheduleSlot[];
  paymentMethods: PaymentMethod[];
  stats: { total, pending, confirmed, paid };
  selectedDate: string;
}
Tampilan Customer
┌─────────────────────────────────────────────┐
│  Bookings                                   │
│                                             │
│  ┌─ Stats Cards ───────────────────────────┐│
│  │  3 Total │ 1 Pending │ 1 Confirmed │ 1 Paid │
│  └─────────────────────────────────────────┘│
│                                             │
│  ┌─ Booking Form ──────────────────────────┐│
│  │ [Tanggal] [Jam] [Metode Bayar] [WA]    ││
│  │ [Catatan]                  [BOOKING]    ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ┌─ My Bookings ───────────────────────────┐│
│  │ #RH-001 │ 22 Jun │ Pending │ Rp 300K   ││
│  │          [Edit] [Cancel]                ││
│  │ #RH-002 │ 23 Jun │ Confirmed │ Rp 150K ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
Tampilan Admin
┌─────────────────────────────────────────────┐
│  Bookings                                   │
│                                             │
│  ┌─ Stats Cards ───────────────────────────┐│
│  │  12 Total │ 3 Pending │ 5 Conf │ 4 Paid ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ┌─ All Bookings ──────────────────────────┐│
│  │ #RH-001 │ John │ 22 Jun │ Pending       ││
│  │ [Status ▼] [Payment ▼] [Notes] [Update] ││
│  │ [Delete]                                ││
│  │ #RH-002 │ Jane │ 23 Jun │ Confirmed     ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ┌─ Payment Methods ───────────────────────┐│
│  │ [+ Tambah]  QRIS | VA | Transfer | Cash ││
│  │ QRIS Studio  [Edit] [Delete]            ││
│  │ BCA Transfer [Edit] [Delete]            ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
5. File Changes
Dihapus (9 file)
pages/dashboard.tsx
pages/dashboard/booking-form.tsx
pages/dashboard/booking-list.tsx
pages/dashboard/payment-method-manager.tsx
pages/dashboard/schedule-board.tsx
pages/dashboard/types.ts
pages/payments/index.tsx
app/Http/Controllers/DashboardController.php
routes/admin/* (otomatis dari wayfinder)
Dibuat (3 file)
app/Http/Controllers/BookingPageController.php
pages/bookings/index.tsx  ← rewrite full
pages/reports/index.tsx   ← update
Diupdate (4 file)
routes/web.php
app/Http/Controllers/HomeController.php
resources/js/lib/rhapsody-data.ts    ← nav items
resources/js/app.tsx                  ← layout resolver
6. Security
Layer
Client
Server GET
Server POST/PATCH/DELETE
Server Admin actions
7. Test Plan
Test
Customer creates booking → appears on /bookings
Admin sees all bookings on /bookings
Admin updates booking status from /bookings
Customer cannot see payment-methods manager
Customer cannot access /reports (403)
Guest cannot access /bookings (redirect login)
All 98 existing tests still pass
8. Checklist Eksekusi
-
1. Buat BookingPageController.php
-
2. Restruktur routes/web.php — hapus prefix admin, gabung booking routes
-
3. Update HomeController.php — tambah data booking
-
4. Buat pages/bookings/index.tsx — halaman gabungan
-
5. Update pages/reports/index.tsx — data real
-
6. Update lib/rhapsody-data.ts — nav items baru
-
7. Update app.tsx — layout resolver
-
8. Hapus 9 file lama
-
9. npm run build — build frontend
-
10. php artisan test — 98 tests pass
---
```
