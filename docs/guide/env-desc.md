# Descripción del Ambiente

## `./docker-compose.yml`

El archivo `./docker-compose.yml` es un archivo YAML que define servicios, redes y volúmenes para una aplicación Docker.

>[YAML](https://yaml.org/) es un lenguaje de serialización de datos fácil de usar para todos los lenguajes de programación.


Avancemos y construyamos dicho archivo en la raíz de nuestro proyecto Laravel. Tenga en cuenta que estamos estableciendo dos (2) bloques: `services` y `networks` respectivamente.

```bash
version: "3.9"
services:  
  php_appname:
    # omitted for brevity ...
 
  nginx_appname:
    # omitted for brevity ...

  pgsql_appname:
    # omitted for brevity ...

networks:
    # omitted for brevity ...

```

En el primer bloque establecemos los servicios básicos que necesitamos para levantar una aplicación Laravel. En este caso, PHP, Nginx y PostgreSQL.

>Ya sabemos que Nginx pudiera ser sustituido por Apache2; y PostgreSQL, por MySQL por ejemplo.

Para seguir un _standar_, usaremos la palabra `appname` como nombre de la aplicación. Así que sientase libre de cambiarlo si así lo desea.

## El servicio PHP

Empecemos con el servicio `php_appname`.

```bash{3,4,5,6,7,8,9,10,11,12,13,14,15}
version: "3.9"
services:  
  php_appname:
    build:
      context: .
      dockerfile: Dockerfile    
    container_name: appname_php
    # restart: always
    tty: true
    working_dir: /var/www/html/
    volumes:
      - ./:/var/www/html/
      - ./php/laravel.ini:/usr/local/etc/php/conf.d/laravel.ini
    networks:
      - appname-network
 
  nginx_appname:
    # omitted for brevity ...

  pgsql_appname:
    # omitted for brevity ...

networks:
  # omitted for brevity ...
```

Tenga en cuenta lo siguiente:

- El contexto del servicio `php_appname` se establece en la raiz del proyecto. Por lo que será descrito en el archivo `Dockerfile` que está ubicado directamente en la misma carpeta.
- Este contenedor se llamará `appname_php`.
- Una vez que agregue un `tty: true` al contenedor, `bash` podrá crear una sesión interactiva.
- El directorio de trabajo será `/var/www/html/`
- En `volumes` establecemos las carpetas que serán espejo:
    - `./` espejo de `/var/www/html/`
    - `./php/laravel.ini` espejo de `/usr/local/etc/php/conf.d/laravel.ini`.
- el servicio será expuesto por la red `appname-network`.

## El servicio Nginx

Avancemos con el servicio `nginx_appname`.

```bash{6,7,8,9,10,11,12,13,14,15,16,17,18}
version: "3.9"
services:  
  php_appname:
    # omitted for brevity ...
 
  nginx_appname:
    depends_on:
      - php_appname
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: appname_nginx
    restart: unless-stopped
    tty: true
    ports:
      - "80:80"
    networks:
      - appname-network

  pgsql_appname:
    # omitted for brevity ...

networks:
  # omitted for brevity ...
```

////////////////////////////////////////////

```bash
version: "3.9"
services:  
  php_appname:
    build:
      context: .
      dockerfile: Dockerfile    
    container_name: appname_php
    restart: unless-stopped
    tty: true
    working_dir: /var/www/html/
    volumes:
      - ./:/var/www/html/
      - ./php/laravel.ini:/usr/local/etc/php/conf.d/laravel.ini
    networks:
      - appname-network
 
  nginx_appname:
    depends_on:
      - php_appname
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: appname_nginx
    restart: unless-stopped
    tty: true
    ports:
      - "80:80"
    networks:
      - appname-network

  pgsql_appname:
    container_name: appname_pgsql
    image: postgres:13
    ports:
      - "${DB_PORT}:5432"
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - "./postgresql:/var/lib/postgresql/data"
    networks:
      - appname-network
    healthcheck:
      test: ["CMD", "pg_isready", "-q", "-d", "${DB_DATABASE}", "-U", "${DB_USERNAME}"]

networks:
  appname-network:
    driver: bridge
```





## `./Dockerfile`

```bash
FROM php:8.1.0-fpm

# Copy composer.lock and composer.json into the working directory
COPY composer.lock composer.json /var/www/html/

# Set working directory
WORKDIR /var/www/html/

# Install dependencies for the operating system software
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libpng-dev \
    libonig-dev \
    libzip-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install extensions for php
RUN docker-php-ext-install mbstring zip exif pcntl
RUN docker-php-ext-install pdo pgsql pdo_pgsql
RUN docker-php-ext-install gd

# Install composer (php package manager)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy existing application directory contents to the working directory
COPY . /var/www/html

# Assign permissions of the working directory to the www-data user
RUN chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

# Expose port 9000 and start php-fpm server (for FastCGI Process Manager)
EXPOSE 9000
CMD ["php-fpm"]
```

## `./nginx/Dockerfile`

```bash
FROM nginx:1.23.1
COPY ./default.conf /etc/nginx/conf.d/default.conf
```
## `default.conf`

```bash
server {
  listen 80;
  server_name localhost;
  index index.php index.html;
  error_log  /var/log/nginx/error.log;
  access_log /var/log/nginx/access.log;
  root /var/www/html/public;

  location / {
      try_files $uri $uri/ /index.php?$query_string;
      gzip_static on;
  }

  location ~ \.php$ {
      fastcgi_split_path_info ^(.+\.php)(/.+)$;
      fastcgi_pass appname_php:9000;
      fastcgi_index index.php;
      include fastcgi_params;
      fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
      fastcgi_param PATH_INFO $fastcgi_path_info;
  }
}
```
