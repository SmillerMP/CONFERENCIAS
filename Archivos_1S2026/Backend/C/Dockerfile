FROM gcc:latest

WORKDIR /app

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y \
    libmicrohttpd-dev \
    libjson-c-dev \
    uuid-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar el código fuente
COPY main.c .

# Compilar la aplicación
RUN gcc -o api main.c -lmicrohttpd -ljson-c -luuid

# Exponer el puerto
EXPOSE 80

# Ejecutar la aplicación
CMD ["./api"]
