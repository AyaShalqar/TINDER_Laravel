FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpq-dev \
    librdkafka-dev \
    pkg-config \
    libssl-dev \
    && docker-php-ext-install pdo pdo_pgsql

# RUN pecl install rdkafka && docker-php-ext-enable rdkafka

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=8000
