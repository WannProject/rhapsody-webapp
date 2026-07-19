# TODO - Rhapsody Webapp

Dokumen ini diperbarui dari audit SOP "Aplikasi Penyewaan Studio Musik" terhadap codebase saat ini.

Status verifikasi terakhir:
- `php artisan test`: lulus, 187 tests / 795 assertions.
- `npm run build`: lulus.
- `npx tsc --noEmit`: lulus.
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
- [x] Tambahkan proteksi database terhadap double booking untuk slot aktif.
- [x] Tambahkan test simulasi dua customer memilih slot sama.
- [x] Pastikan status cancelled/expired/refunded tidak memblokir slot aktif.

### 4. Fix bug withdrawal guard

- [x] Perbaiki kondisi di `PlatformWalletService::processWithdrawal()` dari `! $withdrawal->status === ...` menjadi pengecekan status yang benar.
- [x] Tambahkan test bahwa withdrawal non-pending tidak diproses ulang.
- [x] Pastikan failed withdrawal mengembalikan ledger debit seperti aturan saat ini.
- [x] Pastikan log withdrawal tidak menyimpan data rekening secara berlebihan.

## Prioritas P1 - Gap Data Model SOP

### 5. Customer profile dan registrasi

- [x] Buat migration/model `CustomerProfile` atau tambahkan struktur setara.
- [x] Simpan data registrasi SOP:
  - [x] Nama Band.
  - [x] Nama Pemesan.
  - [x] Email.
  - [x] Nomor WhatsApp.
  - [x] Password.
- [x] Update form register agar field sesuai SOP, bukan hanya `name`, `email`, `phone`.
- [x] Normalisasi nomor WhatsApp ke format konsisten.
- [x] Pastikan email tetap unique.
- [x] Pastikan password tetap disimpan hashed.
- [x] Update halaman profile untuk mengelola Nama Band, Nama Pemesan, dan WhatsApp.
- [x] Tambahkan test registrasi customer dengan nama band.

### 6. Equipment dan alat booking

- [x] Buat migration/model `Equipment`.
- [x] Buat migration/model pivot `BookingEquipment`.
- [x] Seed data alat SOP:
  - [x] Gitar listrik 1.
  - [x] Gitar listrik 2.
  - [x] Gitar akustik.
  - [x] Piano atau keyboard.
  - [x] Bass.
  - [x] Drum akustik.
  - [x] Mikrofon vokal.
- [x] Tambahkan field `stock`, `additional_price`, dan `is_active` untuk alat studio.
- [x] Booking form alat harus benar-benar mengirim pilihan ke backend.
- [x] Gunakan checkbox untuk alat milik studio.
- [x] Mikrofon vokal memakai pilihan jumlah 0 sampai 2.
- [x] Validasi mikrofon maksimal 2 di backend.
- [x] Tambahkan field teks untuk alat tambahan milik customer.
- [x] Simpan snapshot harga alat pada booking.
- [x] Tampilkan daftar alat di detail pesanan customer dan admin.
- [x] Tambahkan test validasi mikrofon maksimal 2.
- [x] Tambahkan test alat booking tersimpan dan tampil di detail.

### 7. Studio, harga, dan time slot

- [x] Putuskan apakah tetap memakai `studio_settings` atau migrasi ke tabel `studios` sesuai ERD SOP.
- [x] Jika tetap `studio_settings`, tambahkan field yang kurang:
  - [x] Address.
  - [x] Description.
  - [x] Harga per jam.
  - [x] Durasi minimum booking.
  - [x] Jam operasional.
  - [x] Status aktif.
- [x] Simpan snapshot `base_price`, `additional_price`, dan `total_price` pada booking.
- [x] Pertimbangkan tabel `time_slots` eksplisit jika slot hold/booked/blocked ingin dikelola per tanggal.
- [x] Tambahkan status slot:
  - [x] `available`.
  - [x] `held`.
  - [x] `booked`.
  - [x] `blocked`.
- [x] Tambahkan fitur superadmin untuk block slot tertentu.

### 8. Notification history

- [x] Buat tabel/model `Notification` atau struktur audit notifikasi.
- [x] Simpan channel, recipient, title, message, status, dan sent_at.
- [x] Catat notifikasi WhatsApp payment success ke superadmin.
- [x] Catat notifikasi payment success ke customer jika channel sudah ditentukan.
- [x] Tambahkan retry/error state untuk notifikasi gagal.

## Prioritas P1 - UI dan Alur Customer

### 9. Booking customer sesuai SOP

- [x] Booking page harus memandu urutan:
  - [x] Pilih tanggal.
  - [x] Pilih jam tersedia.
  - [x] Slot ditahan sementara.
  - [x] Pilih alat.
  - [x] Isi alat tambahan sendiri.
  - [x] Lihat ringkasan pesanan.
  - [x] Lanjutkan pembayaran.
- [x] Slot harus menampilkan status:
  - [x] Tersedia.
  - [x] Ditahan sementara.
  - [x] Sudah dibooking.
- [x] Customer dashboard dapat melihat tanggal berikutnya.
- [x] Landing/schedule publik hanya menampilkan jadwal hari ini.
- [x] Jika public schedule menerima query date, batasi atau redirect ke hari ini.
- [x] Customer harus login sebelum memilih jadwal dari landing/schedule.
- [x] Pisahkan halaman Booking dan Info Pesanan agar halaman tidak terlalu panjang.

### 10. Info pesanan dan riwayat booking

- [x] Buat/tajamkan halaman "Info Pesanan" customer.
- [x] Pisahkan pesanan aktif dan riwayat pesanan.
- [x] Tampilkan detail pesanan:
  - [x] Booking code.
  - [x] Data customer.
  - [x] Tanggal dan jam.
  - [x] Durasi.
  - [x] Daftar alat.
  - [x] Total pembayaran.
  - [x] Status booking.
  - [x] Status pembayaran.
  - [x] Link payment jika masih pending.
- [x] Customer hanya bisa melihat pesanan miliknya.

## Prioritas P1 - UI dan Alur Superadmin

### 11. Pengelolaan pesanan superadmin

- [x] Pastikan menu "Info Pesanan" superadmin menampilkan seluruh pesanan.
- [x] Tambahkan filter SOP:
  - [x] Tanggal.
  - [x] Nama Band.
  - [x] Status booking.
  - [x] Status pembayaran.
- [x] Tambahkan detail pesanan admin lengkap:
  - [x] Data customer.
  - [x] Jadwal.
  - [x] Daftar alat.
  - [x] Total pembayaran.
  - [x] Status pembayaran.
- [x] Superadmin bisa mengubah status booking ke `completed`.
- [x] Batasi perubahan status payment agar tidak bertentangan dengan webhook Xendit.
- [x] Tambahkan flow pembatalan/refund sesuai aturan studio.

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
- [x] Tampilkan saldo Xendit live sesuai SOP, atau tulis keputusan eksplisit bahwa saldo memakai ledger internal.
- [x] Jika memakai saldo Xendit live, hubungkan `XenditClient::getBalance()` ke wallet page.
- [x] Tambahkan webhook/rekonsiliasi payout success/failed.
- [x] Simpan riwayat penarikan dengan reference id Xendit.
- [x] Tampilkan status pencairan dari Xendit jika tersedia.
- [x] Tambahkan test payout webhook success/failed.

## Prioritas P2 - Status dan Konsistensi Bahasa Domain

### 14. Selaraskan status SOP

- [x] Booking status perlu selaras dengan SOP:
  - [x] `pending_payment`.
  - [x] `confirmed`.
  - [x] `completed`.
  - [x] `cancelled`.
  - [x] `expired`.
  - [x] `refunded`.
- [x] Payment status perlu selaras dengan SOP:
  - [x] `pending`.
  - [x] `paid`.
  - [x] `failed`.
  - [x] `expired`.
  - [x] `refunded`.
- [x] Slot status perlu tersedia:
  - [x] `available`.
  - [x] `held`.
  - [x] `booked`.
  - [x] `blocked`.
- [x] Update migration awal development untuk enum/value database yang berubah.
- [x] Update label UI bahasa Indonesia.
- [x] Update tests yang masih memakai status lama seperti `unpaid` atau `pending`.

### 15. Rapikan sitemap dan navbar

- [x] Landing navbar:
  - [x] Home.
  - [x] Schedule.
  - [x] Login.
- [x] Landing home:
  - [x] Logo studio.
  - [x] Slider iklan/promosi.
  - [x] Tombol Register.
  - [x] Tombol Login.
  - [x] Informasi singkat studio.
  - [x] Harga studio.
  - [x] Fasilitas.
  - [x] Lokasi dan kontak.
- [x] Customer dashboard navbar:
  - [x] Beranda.
  - [x] Booking.
  - [x] Info Pesanan.
  - [x] Profil.
  - [x] Pengaturan.
  - [x] Ubah Password.
  - [x] Logout.
- [x] Superadmin navbar:
  - [x] Beranda.
  - [x] Info Pesanan.
  - [x] Ubah Data.
  - [x] Tarik Dana.
  - [x] Profil.
  - [x] Pengaturan.
  - [x] Ubah Password.
  - [x] Logout.

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

- [x] Feature test: registrasi customer dengan Nama Band dan WhatsApp.
- [x] Feature test: customer booking dengan pilihan alat.
- [x] Feature test: mikrofon lebih dari 2 ditolak.
- [x] Feature test: booking membuat invoice Xendit.
- [x] Feature test: customer diarahkan atau mendapat payment URL Xendit.
- [x] Feature test: webhook paid mengubah payment paid dan booking confirmed.
- [x] Feature test: webhook expired mengubah booking expired dan melepas slot.
- [x] Feature test: webhook paid tidak mengirim WA dobel.
- [x] Feature test: customer tidak bisa melihat booking user lain.
- [x] Feature test: superadmin bisa filter pesanan berdasarkan tanggal/nama band/status.
- [x] Feature test: superadmin update harga tidak mengubah booking lama.
- [x] Feature test: withdrawal non-pending tidak diproses ulang.
- [x] Unit test: total harga = base price + additional equipment price.
- [x] Unit test: normalisasi nomor WhatsApp.
- [x] Unit test: slot availability mengabaikan cancelled/expired/refunded.

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
