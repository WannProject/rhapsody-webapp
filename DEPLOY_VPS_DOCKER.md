# Deploy ke VPS dengan Docker (Production)

Stack: Caddy (HTTPS otomatis) → Nginx → PHP-FPM 8.4 + MySQL 8.4 + queue worker + scheduler.

> Wajib PHP 8.4: 21 package di `composer.lock` (Symfony 8.x dkk) butuh PHP >= 8.4.1,
> jadi PHP 8.3 tidak bisa jalan walau `composer.json` tertulis `^8.3`.
> File terkait: [Dockerfile](/home/wann/My-Project/Rhapsody-Studio/rhapsody-webapp/Dockerfile),
> [docker-compose.prod.yml](/home/wann/My-Project/Rhapsody-Studio/rhapsody-webapp/docker-compose.prod.yml),
> [.env.docker.example](/home/wann/My-Project/Rhapsody-Studio/rhapsody-webapp/.env.docker.example).

## Syarat VPS

- Ubuntu 22.04/24.04, RAM minimal 2 GB.
- Domain (A record) mengarah ke IP VPS. Tanpa domain tetap bisa jalan via IP (HTTP saja).
- Port 80 dan 443 terbuka.

## 1. Install Docker

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# login ulang SSH, lalu cek:
docker --version
docker compose version
```

## 2. Clone + env

```bash
sudo apt install -y git
mkdir -p ~/apps && cd ~/apps
git clone <URL_REPO_KAMU> rhapsody-webapp
cd rhapsody-webapp
cp .env.docker.example .env
nano .env
```

Wajib diisi: `APP_URL`, `SITE_HOST`, `ADMIN_*`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`.
Untuk Xendit/Fonnte/SMTP, isi belakangan juga bisa (aplikasi tetap jalan, fitur itu yang nonaktif).

## 3. Jalanin pertama kali

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f app
```

Tunggu sampai log `app` menampilkan migrasi + optimize selesai, lalu seed awal:

```bash
docker compose -f docker-compose.prod.yml exec app php artisan db:seed --force
```

Seeder membuat admin dari `ADMIN_*` di `.env` dan akun demo
`customer@rhapsody.test` / `password`. Setelah login, hapus/ubah akun demo itu.

## 4. Verifikasi

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml exec app php artisan about
docker compose -f docker-compose.prod.yml exec app php artisan migrate:status
```

Buka di browser: `https://domain-kamu/` (atau `http://IP-VPS/` kalau pakai IP),
lalu `/login`, `/schedule`, `/up`. HTTPS butuh waktu ~1 menit saat pertama
(Caddy lagi menerbitkan sertifikat).

## 5. Webhook Xendit

Arahkan callback Xendit ke `https://domain-kamu/webhooks/xendit`,
isi token di `.env`, lalu:

```bash
docker compose -f docker-compose.prod.yml up -d app worker
```

## 6. Update berikutnya

```bash
cd ~/apps/rhapsody-webapp
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app php artisan migrate --force
```

`RUN_MIGRATIONS=true` (default) juga menjalankan migrasi otomatis tiap
container `app` dibuat ulang, jadi perintah migrate manual di atas opsional
tapi aman dijalankan ulang.

## 7. Operasional

```bash
# Lihat log
docker compose -f docker-compose.prod.yml logs -f app worker scheduler web caddy
# Cek queue macet
docker compose -f docker-compose.prod.yml exec app php artisan queue:failed
# Masuk ke container
docker compose -f docker-compose.prod.yml exec app sh
# Backup database
docker compose -f docker-compose.prod.yml exec mysql mysqldump -uroot -p"$DB_ROOT_PASSWORD" "$DB_DATABASE" > backup-$(date +%F).sql
# Hentikan semua
docker compose -f docker-compose.prod.yml down
```

## Catatan

- Data MySQL tersimpan di volume `mysql-data`, file upload di `storage-data`.
  `docker compose down` tidak menghapus volume. Jangan `down -v` kecuali
  memang mau reset total.
- File `docker-compose.yml` yang lama tetap untuk dev lokal, jangan dipakai
  di VPS. Produksi selalu pakai `-f docker-compose.prod.yml`.
- Kalau `.env` diubah, jalankan `up -d app worker scheduler` agar config
  cache di dalam container direfresh (entrypoint menjalankan
  `php artisan optimize` ulang).
