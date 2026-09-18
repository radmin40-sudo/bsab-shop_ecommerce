# Build frontend assets with the repository's Node toolchain.
FROM node:22-alpine3.22 AS frontend

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

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --no-scripts

COPY . .
COPY --from=frontend /app/public/build ./public/build
COPY docker/entrypoint.sh /usr/local/bin/bsabshop-entrypoint
COPY docker/Caddyfile /etc/caddy/Caddyfile

RUN chmod +x /usr/local/bin/bsabshop-entrypoint \
    && composer dump-autoload --no-dev --optimize \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/bsabshop-entrypoint"]
