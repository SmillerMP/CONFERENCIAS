# Etapa 1: Builder - para instalar dependencias
FROM python:3.12-slim AS builder

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para compilación
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar solo requirements para aprovechar caché de Docker
COPY requirements.txt .

# Crear virtualenv y instalar dependencias
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r requirements.txt

# Etapa 2: Runtime - imagen final optimizada
FROM python:3.12-slim

# Crear usuario no-root
RUN groupadd -r appuser && \
    useradd -r -g appuser -u 1001 appuser

# Directorio de trabajo
WORKDIR /app

# Copiar virtualenv desde builder
COPY --from=builder /opt/venv /opt/venv

# Copiar código de la aplicación
COPY --chown=appuser:appuser main.py .

# Cambiar a usuario no-root
USER appuser

# Comando para ejecutar la aplicación
CMD ["/opt/venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
