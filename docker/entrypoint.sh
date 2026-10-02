#!/bin/sh
set -eu

export SERVER_NAME=":${PORT:-80}"

echo "Starting Laravel migrations for the current Railway release."
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link --force
php artisan optimize

if [ "$#" -eq 0 ]; then
	set -- frankenphp run --config /etc/caddy/Caddyfile
fi

exec "$@"
