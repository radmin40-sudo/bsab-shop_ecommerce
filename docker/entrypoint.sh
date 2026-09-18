#!/bin/sh
set -eu

export SERVER_NAME=":${PORT:-80}"

php artisan migrate --force
php artisan db:seed --force
php artisan storage:link --force
php artisan optimize

if [ "$#" -eq 0 ]; then
	set -- frankenphp run --config /etc/caddy/Caddyfile
fi

exec "$@"
