#!/bin/sh
# Entrypoint for the `app`, `worker`, and `scheduler` services.
# - Waits for MySQL, ensures writable dirs + storage link.
# - Only the `php-fpm` process runs key generation, migrations, and optimize.
set -e

wait_for_db() {
    if [ "${DB_CONNECTION:-mysql}" != "mysql" ]; then
        return 0
    fi
    echo "Waiting for database ${DB_HOST:-mysql}:${DB_PORT:-3306}..."
    for i in $(seq 1 60); do
        if php -r '
            try {
                new PDO(
                    "mysql:host=".getenv("DB_HOST").";port=".getenv("DB_PORT"),
                    getenv("DB_USERNAME"),
                    getenv("DB_PASSWORD")
                );
                exit(0);
            } catch (Throwable $e) {
                exit(1);
            }' >/dev/null 2>&1; then
            echo "Database is reachable."
            return 0
        fi
        sleep 2
    done
    echo "Database did not become reachable in time." >&2
    exit 1
}

mkdir -p storage/app/public \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

wait_for_db

php artisan storage:link >/dev/null 2>&1 || true

# Full init only on the main app process (not worker/scheduler replicas).
if [ "${1:-}" = "php-fpm" ]; then
    if [ -z "${APP_KEY:-}" ]; then
        echo "APP_KEY is empty, generating one..."
        export APP_KEY="$(php artisan key:generate --show --no-interaction)"
        echo "Generated APP_KEY."
    fi

    if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
        echo "Running migrations..."
        php artisan migrate --force
    fi

    echo "Optimizing for production..."
    php artisan optimize
fi

exec "$@"
