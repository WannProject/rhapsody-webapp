# TODO - Rhapsody Webapp

Dokumen ini diperbarui dari audit SOP "Aplikasi Penyewaan Studio Musik" terhadap codebase saat ini.

Status verifikasi terakhir:
- `php artisan test`: lulus, 137 tests / 529 assertions.
- `npm run build`: lulus.
- Codebase sudah di-index ke `.codebase-memory/graph.db.zst`.

## Prioritas P0 - Harus Dikerjakan Dulu

### 1. Betulkan flow booking ke Xendit

- [x] Tentukan strategi pembayaran utama:
  - [x] Direct invoice dari akun Xendit studio, atau
  - [x] XenPlatform sub-account client.
- [x] Pastikan setiap booking customer bisa membuat invoice Xendit tanpa bergantung pada `client_id` kosong.
- [x] Saat booking dibuat, simpan payment record dengan `external_id`, `invoice_id`, `payment_link_url`, `amount`, dan status `pending`.
- [x] Setelah invoice dibuat, arahkan customer ke payment URL Xendit, bukan hanya kembali ke `/bookings`.
- [x] Tampilkan link/tombol "Bayar Sekarang" jika invoice URL sudah tersedia.
- [x] Jangan konfirmasi booking dari halaman sukses browser.
- [x] Konfirmasi booking hanya dari webhook Xendit yang valid.
- [x] Tambahkan handling invoice expired agar booking ikut `expired` dan slot dilepas.
- [x] Tambahkan handling payment failed/refunded jika dibutuhkan SOP refund.
- [x] Tambahkan test untuk booking -> invoice created -> redirect/payment link tersedia.

### 2. Pindahkan WhatsApp notification sesuai SOP

- [x] Hapus pengiriman WhatsApp "booking baru" dari `BookingController::store()`.
- [x] Kirim WhatsApp ke superadmin hanya setelah webhook Xendit valid dan payment `paid`.
- [x] Pastikan format pesan sesuai SOP:
  - [x] Nama Band.
  - [x] Nama Pemesan.
  - [x] Nomor WhatsApp.
  - [x] Tanggal Booking.
  - [x] Jam Booking.
  - [x] Durasi Booking.
  - [x] Alat Digunakan.
  - [x] Total Pembayaran.
  - [x] Status Pembayaran: Berhasil.
- [x] Tambahkan idempotency supaya webhook ulang tidak mengirim WA dobel.
- [x] Tambahkan test bahwa WA tidak dikirim saat booking dibuat.
- [x] Tambahkan test bahwa WA dikirim setelah webhook paid.

### 3. Perkuat anti bentrok booking

- [x] Tambahkan konsep slot hold sementara saat customer masuk tahap pembayaran.
- [x] Simpan `held_until` atau field setara untuk booking pending/payment hold.
- [x] Slot `held` harus tampil sebagai tidak tersedia untuk customer lain.
- [x] Slot dilepas otomatis saat payment expired atau hold melewati batas.
- [x] Tambahkan locking/transaksi yang benar saat membuat booking.
- [ ] Tambahkan proteksi database terhadap double booking untuk slot aktif.
- [x] Tambahkan test simulasi dua customer memilih slot sama.
- [x] Pastikan status cancelled/expired/refunded tidak memblokir slot aktif.

### 4. Fix bug withdrawal guard

- [x] Perbaiki kondisi di `PlatformWalletService::processWithdrawal()` dari `! $withdrawal->status === ...` menjadi pengecekan status yang benar.
- [x] Tambahkan test bahwa withdrawal non-pending tidak diproses ulang.
- [x] Pastikan failed withdrawal mengembalikan ledger debit seperti aturan saat ini.
- [x] Pastikan log withdrawal tidak menyimpan data rekening secara berlebihan.

## Prioritas P1 - Gap Data Model SOP

### 5. Customer profile dan registrasi

- [ ] Buat migration/model `CustomerProfile` atau tambahkan struktur setara.
- [ ] Simpan data registrasi SOP:
  - [ ] Nama Band.
  - [ ] Nama Pemesan.
  - [ ] Email.
  - [ ] Nomor WhatsApp.
  - [ ] Password.
- [ ] Update form register agar field sesuai SOP, bukan hanya `name`, `email`, `phone`.
- [ ] Normalisasi nomor WhatsApp ke format konsisten.
- [ ] Pastikan email tetap unique.
- [ ] Pastikan password tetap disimpan hashed.
- [ ] Update halaman profile untuk mengelola Nama Band, Nama Pemesan, dan WhatsApp.
- [ ] Tambahkan test registrasi customer dengan nama band.

### 6. Equipment dan alat booking

- [x] Buat migration/model `Equipment`.
- [ ] Buat migration/model pivot `BookingEquipment`.
- [x] Seed data alat SOP:
  - [x] Gitar listrik 1.
  - [x] Gitar listrik 2.
  - [x] Gitar akustik.
  - [x] Piano atau keyboard.
  - [x] Bass.
  - [x] Drum akustik.
  - [x] Mikrofon vokal.
- [x] Tambahkan field `stock`, `additional_price`, dan `is_active` untuk alat studio.
- [ ] Booking form alat harus benar-benar mengirim pilihan ke backend.
- [ ] Gunakan checkbox untuk alat milik studio.
- [ ] Mikrofon vokal memakai pilihan jumlah 0 sampai 2.
- [ ] Validasi mikrofon maksimal 2 di backend.
- [ ] Tambahkan field teks untuk alat tambahan milik customer.
- [ ] Simpan snapshot harga alat pada booking.
- [ ] Tampilkan daftar alat di detail pesanan customer dan admin.
- [ ] Tambahkan test validasi mikrofon maksimal 2.
- [ ] Tambahkan test alat booking tersimpan dan tampil di detail.

### 7. Studio, harga, dan time slot

- [x] Putuskan apakah tetap memakai `studio_settings` atau migrasi ke tabel `studios` sesuai ERD SOP.
- [x] Jika tetap `studio_settings`, tambahkan field yang kurang:
  - [x] Address.
  - [x] Description.
  - [x] Harga per jam.
  - [x] Durasi minimum booking.
  - [x] Jam operasional.
  - [x] Status aktif.
- [ ] Simpan snapshot `base_price`, `additional_price`, dan `total_price` pada booking.
- [ ] Pertimbangkan tabel `time_slots` eksplisit jika slot hold/booked/blocked ingin dikelola per tanggal.
- [ ] Tambahkan status slot:
  - [ ] `available`.
  - [ ] `held`.
  - [ ] `booked`.
  - [ ] `blocked`.
- [ ] Tambahkan fitur superadmin untuk block slot tertentu.

### 8. Notification history

- [ ] Buat tabel/model `Notification` atau struktur audit notifikasi.
- [ ] Simpan channel, recipient, title, message, status, dan sent_at.
- [ ] Catat notifikasi WhatsApp payment success ke superadmin.
- [ ] Catat notifikasi payment success ke customer jika channel sudah ditentukan.
- [ ] Tambahkan retry/error state untuk notifikasi gagal.

## Prioritas P1 - UI dan Alur Customer

### 9. Booking customer sesuai SOP

- [ ] Booking page harus memandu urutan:
  - [ ] Pilih tanggal.
  - [ ] Pilih jam tersedia.
  - [ ] Slot ditahan sementara.
  - [ ] Pilih alat.
  - [ ] Isi alat tambahan sendiri.
  - [ ] Lihat ringkasan pesanan.
  - [ ] Lanjutkan pembayaran.
- [ ] Slot harus menampilkan status:
  - [ ] Tersedia.
  - [ ] Ditahan sementara.
  - [ ] Sudah dibooking.
- [ ] Customer dashboard dapat melihat tanggal berikutnya.
- [ ] Landing/schedule publik hanya menampilkan jadwal hari ini.
- [ ] Jika public schedule menerima query date, batasi atau redirect ke hari ini.
- [ ] Customer harus login sebelum memilih jadwal dari landing/schedule.

### 10. Info pesanan dan riwayat booking

- [ ] Buat/tajamkan halaman "Info Pesanan" customer.
- [ ] Pisahkan pesanan aktif dan riwayat pesanan.
- [ ] Tampilkan detail pesanan:
  - [ ] Booking code.
  - [ ] Data customer.
  - [ ] Tanggal dan jam.
  - [ ] Durasi.
  - [ ] Daftar alat.
  - [ ] Total pembayaran.
  - [ ] Status booking.
  - [ ] Status pembayaran.
  - [ ] Link payment jika masih pending.
- [ ] Customer hanya bisa melihat pesanan miliknya.

## Prioritas P1 - UI dan Alur Superadmin

### 11. Pengelolaan pesanan superadmin

- [ ] Pastikan menu "Info Pesanan" superadmin menampilkan seluruh pesanan.
- [ ] Tambahkan filter SOP:
  - [ ] Tanggal.
  - [ ] Nama Band.
  - [ ] Status booking.
  - [ ] Status pembayaran.
- [ ] Tambahkan detail pesanan admin lengkap:
  - [ ] Data customer.
  - [ ] Jadwal.
  - [ ] Daftar alat.
  - [ ] Total pembayaran.
  - [ ] Status pembayaran.
- [ ] Superadmin bisa mengubah status booking ke `completed`.
- [ ] Batasi perubahan status payment agar tidak bertentangan dengan webhook Xendit.
- [ ] Tambahkan flow pembatalan/refund sesuai aturan studio.

### 12. Halaman "Ubah Data"

- [x] Buat route/controller/page admin untuk pengaturan studio.
- [x] Superadmin bisa mengubah data studio:
  - [x] Nama studio.
  - [x] Alamat.
  - [x] Deskripsi.
  - [x] Kontak/lokasi jika dibutuhkan landing page.
- [x] Superadmin bisa mengubah harga:
  - [x] Harga per jam.
  - [x] Biaya tambahan alat.
  - [x] Durasi minimum booking.
- [x] Harga baru hanya berlaku untuk booking berikutnya.
- [x] Booking yang sudah dibuat tidak berubah harganya.
- [x] Superadmin bisa mengelola data alat:
  - [x] Nama alat.
  - [x] Kategori.
  - [x] Stok.
  - [x] Harga tambahan.
  - [x] Status aktif.
- [x] Superadmin bisa mengelola jam operasional.
- [x] Tambahkan test bahwa update harga tidak mengubah booking lama.

### 13. Wallet dan penarikan dana

- [x] Route superadmin platform wallet sudah ada.
- [x] Controller platform wallet sudah ada.
- [x] Page React platform wallet sudah ada.
- [x] Withdrawal request dasar sudah ada.
- [x] Validasi minimum withdrawal sudah ada.
- [x] Validasi saldo tidak cukup sudah ada.
- [ ] Tampilkan saldo Xendit live sesuai SOP, atau tulis keputusan eksplisit bahwa saldo memakai ledger internal.
- [ ] Jika memakai saldo Xendit live, hubungkan `XenditClient::getBalance()` ke wallet page.
- [ ] Tambahkan webhook/rekonsiliasi payout success/failed.
- [ ] Simpan riwayat penarikan dengan reference id Xendit.
- [ ] Tampilkan status pencairan dari Xendit jika tersedia.
- [ ] Tambahkan test payout webhook success/failed.

## Prioritas P2 - Status dan Konsistensi Bahasa Domain

### 14. Selaraskan status SOP

- [ ] Booking status perlu selaras dengan SOP:
  - [ ] `pending_payment`.
  - [ ] `confirmed`.
  - [ ] `completed`.
  - [ ] `cancelled`.
  - [ ] `expired`.
  - [ ] `refunded`.
- [ ] Payment status perlu selaras dengan SOP:
  - [ ] `pending`.
  - [ ] `paid`.
  - [ ] `failed`.
  - [ ] `expired`.
  - [ ] `refunded`.
- [ ] Slot status perlu tersedia:
  - [ ] `available`.
  - [ ] `held`.
  - [ ] `booked`.
  - [ ] `blocked`.
- [ ] Buat migration/backfill jika enum/value database berubah.
- [ ] Update label UI bahasa Indonesia.
- [ ] Update tests yang masih memakai status lama seperti `unpaid` atau `pending`.

### 15. Rapikan sitemap dan navbar

- [ ] Landing navbar:
  - [ ] Home.
  - [ ] Schedule.
  - [ ] Login.
- [ ] Landing home:
  - [ ] Logo studio.
  - [ ] Slider iklan/promosi.
  - [ ] Tombol Register.
  - [ ] Tombol Login.
  - [ ] Informasi singkat studio.
  - [ ] Harga studio.
  - [ ] Fasilitas.
  - [ ] Lokasi dan kontak.
- [ ] Customer dashboard navbar:
  - [ ] Beranda.
  - [ ] Booking.
  - [ ] Info Pesanan.
  - [ ] Profil.
  - [ ] Pengaturan.
  - [ ] Ubah Password.
  - [ ] Logout.
- [ ] Superadmin navbar:
  - [ ] Beranda.
  - [ ] Info Pesanan.
  - [ ] Ubah Data.
  - [ ] Tarik Dana.
  - [ ] Profil.
  - [ ] Pengaturan.
  - [ ] Ubah Password.
  - [ ] Logout.

## XenPlatform / Integrasi Xendit - Status Saat Ini

### Sudah selesai di codebase

- [x] Model `Client`.
- [x] Model `XenditSubAccount`.
- [x] Model `PlatformFeeRule`.
- [x] Model `Payment`.
- [x] Model `PlatformWalletLedgerEntry`.
- [x] Model `PlatformWithdrawal`.
- [x] Service `XenditClient`.
- [x] Method `createSubAccount()`.
- [x] Method `createSplitRule()`.
- [x] Method `createInvoiceForSubAccount()`.
- [x] Method `createPayout()`.
- [x] Method `getBalance()`.
- [x] Method `verifyWebhook()`.
- [x] Service `PaymentService`.
- [x] Service `PlatformWalletService`.
- [x] Webhook endpoint `/webhooks/xendit`.
- [x] Middleware `EnsureSuperAdmin`.
- [x] Rate limit withdrawal route.
- [x] Platform wallet page.
- [x] Client merchant page.
- [x] Platform fee page.
- [x] Payment webhook paid idempotent test.
- [x] Withdrawal sufficient/insufficient balance tests.
- [x] Split failed does not block payment test.

### Masih perlu dicek/dikerjakan

- [ ] Pastikan `.env.example` berisi semua konfigurasi Xendit yang dibutuhkan.
- [ ] Pastikan webhook URL production didaftarkan di dashboard Xendit.
- [ ] Pastikan mode sandbox/production bisa dibedakan jelas.
- [ ] Pastikan semua request eksternal punya timeout dan error handling yang tampil rapi ke user.
- [ ] Pastikan API key tidak pernah muncul di log.
- [ ] Tambahkan audit log untuk update fee rule.
- [ ] Tambahkan audit log untuk status payout/withdrawal.

## Testing Tambahan Wajib

- [ ] Feature test: registrasi customer dengan Nama Band dan WhatsApp.
- [ ] Feature test: customer booking dengan pilihan alat.
- [ ] Feature test: mikrofon lebih dari 2 ditolak.
- [x] Feature test: booking membuat invoice Xendit.
- [x] Feature test: customer diarahkan atau mendapat payment URL Xendit.
- [x] Feature test: webhook paid mengubah payment paid dan booking confirmed.
- [x] Feature test: webhook expired mengubah booking expired dan melepas slot.
- [x] Feature test: webhook paid tidak mengirim WA dobel.
- [ ] Feature test: customer tidak bisa melihat booking user lain.
- [ ] Feature test: superadmin bisa filter pesanan berdasarkan tanggal/nama band/status.
- [x] Feature test: superadmin update harga tidak mengubah booking lama.
- [x] Feature test: withdrawal non-pending tidak diproses ulang.
- [ ] Unit test: total harga = base price + additional equipment price.
- [ ] Unit test: normalisasi nomor WhatsApp.
- [ ] Unit test: slot availability mengabaikan cancelled/expired/refunded.

## Deployment Checklist

- [ ] `.env` production berisi Xendit API key production.
- [ ] `.env` production berisi callback verification token.
- [ ] Webhook Xendit production mengarah ke `/webhooks/xendit`.
- [ ] Queue worker berjalan jika notifikasi/rekonsiliasi dibuat async.
- [ ] Scheduler berjalan untuk release slot expired/held.
- [ ] Log channel production aktif.
- [ ] Database backup aktif.
- [ ] SSL aktif.
- [ ] Admin default password sudah diganti.
- [ ] `APP_DEBUG=false`.
- [ ] Jalankan `php artisan test`.
- [ ] Jalankan `npm run build`.
- [ ] Jalankan smoke test payment sandbox sebelum production.

## Catatan Keputusan

- Saat ini implementasi tidak persis sama dengan ERD PDF: project memakai `StudioSetting` dan booking berbasis tanggal/jam langsung, belum memakai `TimeSlot` eksplisit.
- Keputusan perlu dibuat: ikuti ERD PDF sepenuhnya atau adaptasi SOP ke struktur yang sudah ada.
- Untuk mengurangi risiko, kerjakan P0 dulu sebelum refactor besar ke ERD penuh.
- Wallet saat ini memakai ledger internal. SOP meminta saldo Xendit, jadi perlu keputusan apakah UI menampilkan ledger, saldo Xendit live, atau keduanya.
