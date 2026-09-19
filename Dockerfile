# Build frontend assets with the repository's Node toolchain.
FROM node:22-alpine AS frontend

WORKDIR /app

RUN apk update \
    && apk upgrade \
    && rm -rf /var/cache/apk/*

COPY package*.json ./
RUN npm ci
COPY resources ./resources
COPY public ./public
COPY vite.config.js tsconfig.json components.json eslint.config.js .prettierrc .prettierignore ./
RUN npm run build

# Install production PHP dependencies separately for a small, repeatable runtime image.
FROM dunglas/frankenphp:php8.3-bookworm AS runtime

WORKDIR /app

RUN install-php-extensions \
    pdo_mysql \
    pdo_sqlite \
    gd \
    intl \
    zip \
    opcache

RUN printf "upload_max_filesize=25M\npost_max_size=30M\nmax_file_uploads=20\nmemory_limit=256M\n" > /usr/local/etc/php/conf.d/uploads.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --no-scripts

COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY public ./public
COPY resources/views ./resources/views
COPY routes ./routes
COPY artisan .
COPY --from=frontend /app/public/build ./public/build
COPY docker/entrypoint.sh /usr/local/bin/bsabshop-entrypoint
COPY docker/Caddyfile /etc/caddy/Caddyfile

RUN chmod +x /usr/local/bin/bsabshop-entrypoint \
    && composer dump-autoload --no-dev --optimize \
    && mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/bsabshop-entrypoint"]
