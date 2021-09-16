#!/bin/sh

# El número de puerto usado por el servidor web
PORT=8080

# Clave privada para generar los JWT
PRIVATEKEY=1234567890

# Configuración del servicio de correo electrónico
EMAIL_USER=micuentadecorreo@gmail.com
EMAIL_PASSWORD=EstaEsLaClave
EMAIL_SERVICE=gmail

# Configuración de PostgreSQL
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=1234567890
DB_NAME=rotaciones_development
DB_DIALECT=postgres
DB_PORT=5432
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
