# TODO — Rhapsody Webapp

## A. Perbaikan Cepat dari Review Repo

- [ ] Fix link tombol `Booking Sekarang` di `resources/js/pages/schedule/index.tsx` dari `/booking` menjadi `/bookings`.
- [ ] Ganti parameter `Request $request` di `BookingController::update()` menjadi `UpdateBookingRequest $request`.
- [ ] Pisahkan logic update admin dan update customer agar validasinya tidak bercampur.
- [ ] Pastikan customer hanya bisa update booking miliknya sendiri dengan status `pending`.
- [ ] Pastikan update booking customer tetap mengecek tabrakan slot menggunakan `BookingSchedule::isSlotAvailable()`.
- [ ] Hapus nested form pada `BookingCard` karena form delete saat ini berada di dalam form update.
- [ ] Hapus tombol delete admin yang dobel pada card booking.
- [ ] Pisahkan form delete payment method dari form update payment method.
- [ ] Ubah `DatabaseSeeder` agar tidak hardcode admin email/password; gunakan `ADMIN_EMAIL`, `ADMIN_PASSWORD`, dan `ADMIN_PHONE` dari `.env` atau panggil `AdminUserSeeder`.
- [ ] Tambahkan feature test untuk create booking, update booking, cancel booking, dan admin update status.

## B. Persiapan XenPlatform

- [ ] Ajukan/aktifkan XenPlatform pada akun Xendit platform owner.
- [ ] Tentukan tipe sub-account yang akan digunakan untuk client.
- [ ] Tentukan struktur fee platform: flat, percent, atau hybrid.
- [ ] Tentukan siapa yang menanggung transaction fee dan VAT.
- [ ] Tentukan kebijakan refund, chargeback, dan split fee reversal.
- [ ] Tambahkan environment variable:
  - [ ] `XENDIT_SECRET_KEY`
  - [ ] `XENDIT_WEBHOOK_TOKEN`
  - [ ] `XENDIT_CALLBACK_VERIFICATION_TOKEN`
  - [ ] `XENDIT_PLATFORM_ACCOUNT_ID`
  - [ ] `XENDIT_BASE_URL`
- [ ] Buat config `config/xendit.php` atau tambahkan konfigurasi Xendit di `config/services.php`.

## C. Database Migration

- [x] Buat tabel `clients` jika sistem akan mendukung multi-client/merchant.
- [x] Tambahkan relasi client ke user/admin client.
- [x] Buat tabel `xendit_sub_accounts`.
- [x] Buat tabel `platform_fee_rules`.
- [x] Buat tabel `payments`.
- [x] Buat tabel `platform_wallet_ledger_entries`.
- [x] Buat tabel `platform_withdrawals`.
- [x] Tambahkan enum untuk payment status:
  - [x] `pending`
  - [x] `paid`
  - [x] `expired`
  - [x] `failed`
  - [x] `refunded`
- [x] Tambahkan enum untuk split status:
  - [x] `pending`
  - [x] `succeeded`
  - [x] `failed`
  - [x] `not_applicable`
- [x] Tambahkan enum untuk withdrawal status:
  - [x] `pending`
  - [x] `processing`
  - [x] `succeeded`
  - [x] `failed`
  - [x] `cancelled`

## D. Model dan Relasi

- [x] Buat model `Client`.
- [x] Buat model `XenditSubAccount`.
- [x] Buat model `PlatformFeeRule`.
- [x] Buat model `Payment`.
- [x] Buat model `PlatformWalletLedgerEntry`.
- [x] Buat model `PlatformWithdrawal`.
- [x] Relasikan `Client` ke `XenditSubAccount`.
- [x] Relasikan `Client` ke `Booking`.
- [x] Relasikan `Booking` ke `Payment`.
- [x] Relasikan `PlatformWithdrawal` ke user requester.

## E. Service Layer

- [ ] Buat service `XenditClient`.
- [ ] Implement method `createSubAccount()`.
- [ ] Implement method `createSplitRule()`.
- [ ] Implement method `createInvoiceForSubAccount()` atau payment request sesuai channel yang dipilih.
- [ ] Implement method `createPayout()` untuk withdrawal.
- [ ] Implement method `getBalance()` jika dibutuhkan di dashboard.
- [ ] Implement method `verifyWebhook()`.
- [ ] Buat service `PaymentService`.
- [ ] Buat service `PlatformWalletService`.
- [ ] Pastikan semua request eksternal memiliki timeout dan error handling.

## F. Sub-Account Client

- [ ] Buat halaman super admin daftar client merchant.
- [ ] Buat form tambah client merchant.
- [ ] Buat tombol/integrasi create Xendit sub-account.
- [ ] Simpan `xendit_account_id` setelah sub-account dibuat.
- [ ] Simpan status onboarding/KYC client.
- [ ] Tambahkan filter status: draft, invited, submitted, verified, rejected, suspended.
- [ ] Tampilkan warning jika client belum verified sehingga belum bisa menerima pembayaran.

## G. Split Fee / Revenue Share

- [ ] Buat halaman konfigurasi platform fee.
- [ ] Dukung fee percent.
- [ ] Dukung fee flat.
- [ ] Dukung hybrid jika dibutuhkan.
- [ ] Buat split rule di Xendit saat fee rule disimpan.
- [ ] Simpan `xendit_split_rule_id` di database.
- [ ] Saat create payment, sertakan split rule yang sesuai.
- [ ] Simpan platform fee expected amount pada tabel `payments`.
- [ ] Simpan split webhook result jika tersedia.
- [ ] Tambahkan status `split_failed` untuk rekonsiliasi manual.

## H. Payment Flow Booking

- [ ] Ubah flow create booking agar dapat membuat payment record.
- [ ] Integrasikan payment link/invoice Xendit.
- [ ] Buat halaman instruksi pembayaran customer.
- [ ] Buat halaman payment status.
- [ ] Tambahkan webhook endpoint untuk payment paid/expired/failed.
- [ ] Update status booking setelah payment sukses sesuai business rule.
- [ ] Kirim WhatsApp notification saat payment sukses.
- [ ] Simpan raw webhook payload untuk audit.
- [ ] Pastikan webhook idempotent agar tidak double update.

## I. Super Admin Platform Wallet

- [x] Buat route `/admin/platform-wallet` atau `/platform-wallet` dengan middleware super admin.
- [x] Buat controller `PlatformWalletController`.
- [x] Buat page React `resources/js/pages/admin/platform-wallet/index.tsx`.
- [x] Tampilkan card `Available Balance`.
- [x] Tampilkan card `Total Platform Fee`.
- [x] Tampilkan card `Pending Withdrawal`.
- [x] Tampilkan card `Total Withdrawn`.
- [x] Tampilkan tabel ledger platform fee.
- [x] Tampilkan tabel withdrawal history.
- [x] Tambahkan filter tanggal dan status.
- [x] Tambahkan pagination.
- [x] Tambahkan export CSV jika dibutuhkan.

## J. Super Admin Withdrawal

- [ ] Buat route `POST /admin/platform-withdrawals`.
- [ ] Buat controller `PlatformWithdrawalController`.
- [ ] Buat request validation `StorePlatformWithdrawalRequest`.
- [ ] Validasi nominal minimum withdrawal.
- [ ] Validasi nominal tidak boleh melebihi available balance.
- [ ] Validasi rekening tujuan.
- [ ] Simpan withdrawal status `pending`.
- [ ] Kirim payout/withdrawal request ke Xendit.
- [ ] Ubah status menjadi `processing`.
- [ ] Buat webhook handler untuk withdrawal success/failed.
- [ ] Jika succeeded, catat debit ledger.
- [ ] Jika failed, tampilkan failure reason dan jangan kurangi saldo final.
- [ ] Tambahkan audit log untuk setiap request withdrawal.

## K. Authorization dan Security

- [ ] Tambahkan role `super_admin` jika saat ini hanya ada `admin` dan `customer`.
- [ ] Buat middleware `EnsureSuperAdmin`.
- [ ] Batasi halaman wallet hanya untuk super admin/platform owner.
- [ ] Batasi data rekening hanya untuk role yang berhak.
- [ ] Verifikasi webhook Xendit.
- [ ] Jangan simpan API key di database.
- [ ] Jangan hitung saldo dari frontend.
- [ ] Tambahkan rate limit untuk endpoint withdrawal.
- [ ] Tambahkan audit log untuk update fee rule dan withdrawal.

## L. Testing

- [ ] Feature test: customer create booking.
- [ ] Feature test: customer tidak bisa booking slot yang sudah terisi.
- [ ] Feature test: customer tidak bisa update booking confirmed.
- [ ] Feature test: admin bisa update status booking.
- [ ] Feature test: super admin bisa melihat wallet.
- [ ] Feature test: non-super-admin tidak bisa melihat wallet.
- [ ] Feature test: super admin bisa request withdrawal valid.
- [ ] Feature test: withdrawal melebihi saldo ditolak.
- [ ] Feature test: payment webhook paid idempotent.
- [ ] Feature test: split failed tidak membuat payment gagal.
- [ ] Unit test: perhitungan platform fee percent.
- [ ] Unit test: perhitungan platform fee flat.
- [ ] Unit test: ledger available balance.

## M. Deployment Checklist

- [ ] Pastikan `.env` production berisi Xendit API key production.
- [ ] Pastikan webhook URL production sudah didaftarkan di Xendit Dashboard.
- [ ] Pastikan queue worker berjalan.
- [ ] Pastikan scheduler berjalan jika ada rekonsiliasi berkala.
- [ ] Pastikan log channel production aktif.
- [ ] Pastikan database backup aktif.
- [ ] Pastikan SSL aktif.
- [ ] Pastikan admin default password sudah diganti.
- [ ] Pastikan APP_DEBUG=false.
- [ ] Jalankan `composer test`.
- [ ] Jalankan `npm run build`.
- [ ] Jalankan smoke test payment sandbox sebelum production.

## N. Catatan Keputusan dari Sesi Ini

- Sistem diarahkan menjadi model platform/marketplace.
- Akun Xendit owner menjadi Master Account.
- Client bisnis menjadi sub-account/merchant di bawah akun owner.
- Setiap transaksi client harus bisa memotong fee otomatis untuk platform owner.
- Super admin membutuhkan halaman untuk mencairkan dana dari saldo platform.
- Withdrawal harus memakai ledger internal agar tidak hanya mengandalkan tampilan saldo gateway.
- Integrasi Xendit harus dirancang dengan webhook idempotent dan audit trail.
