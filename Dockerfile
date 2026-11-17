FROM php:8.4-cli

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    libzip-dev \
    libicu-dev \
    libpq-dev

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    intl \
    zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install --no-dev --optimize-autoloader \
    && php artisan storage:link

CMD php artisan serve --host=0.0.0.0 --port=$PORT
