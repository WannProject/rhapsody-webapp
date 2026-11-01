# Production image for Rhapsody Studio (Laravel 13 + PHP 8.3 + Vite).
# Targets: `app` (php-fpm, default) and `web` (nginx serving ./public).

# ---------- Stage 1: PHP dependencies ----------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction
COPY . .
RUN composer dump-autoload --optimize --no-dev --no-interaction

# ---------- Stage 2: frontend assets ----------
# Needs PHP too: @laravel/vite-plugin-wayfinder runs `php artisan` at build time.
FROM php:8.4-cli-bookworm AS frontend
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates curl gnupg \
        libpng-dev libjpeg-dev libfreetype6-dev libonig-dev libxml2-dev libzip-dev libicu-dev \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql mbstring bcmath intl zip \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
COPY --from=vendor /app/vendor ./vendor
# artisan needs an env file to boot; the real .env is excluded from context.
RUN cp .env.example .env
RUN npm run build \
    && rm -rf node_modules vendor .env /root/.npm

# ---------- Stage 3: PHP runtime ----------
FROM php:8.4-fpm-bookworm AS app
ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /var/www/html

# System deps + PHP extensions needed by Laravel/MySQL/GD/queue.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip pkg-config libpng-dev libjpeg-dev libfreetype6-dev \
        libonig-dev libxml2-dev libzip-dev libicu-dev libcurl4-openssl-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql mbstring xml bcmath curl zip gd intl pcntl opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists

COPY docker/php/conf.d/app.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Application source (respects .dockerignore).
COPY . .
# Dependencies + built assets from earlier stages.
COPY --from=vendor /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build
RUN rm -f public/hot \
    && mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]

# ---------- Stage 4: Nginx serving ./public ----------
FROM nginx:1.27-alpine AS web
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=app /var/www/html/public /usr/share/nginx/html
