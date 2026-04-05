# API de Gestion de Tareas

API REST para gestionar tareas con operaciones CRUD completas.

Este backend incluye dos implementaciones:

- C en la carpeta `C/`
- Python (FastAPI) en la carpeta `Python/`

## Caracteristicas

- Endpoints CRUD para tareas
- Almacenamiento en memoria
- Respuestas JSON
- Ejecucion local o con Docker

## Endpoints

- `GET /` - Informacion de la API
- `GET /health` - Estado del servicio
- `GET /tareas` - Listar todas las tareas
- `GET /tareas/{id}` - Obtener una tarea especifica
- `POST /tareas` - Crear nueva tarea
- `PUT /tareas/{id}` - Actualizar tarea
- `DELETE /tareas/{id}` - Eliminar tarea

Base URL por defecto:

```text
http://localhost:8000
```

## Ejecutar con Docker

### Opcion C

```bash
docker build -t api-tareas-c ./C
docker run --rm -p 8000:8000 api-tareas-c
```

### Opcion Python

```bash
docker build -t api-tareas-python ./Python
docker run --rm -p 8000:8000 api-tareas-python
```

## Ejecutar localmente

### Opcion C

Prerrequisitos (Ubuntu/Debian):

```bash
sudo apt-get install libmicrohttpd-dev libjson-c-dev uuid-dev gcc
```

Compilar y ejecutar:

```bash
cd C
gcc -o api main.c -lmicrohttpd -ljson-c -luuid
./api
```

### Opcion Python

```bash
cd Python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Documentacion interactiva en Python:

```text
http://localhost:8000/docs
```

## Ejemplos de uso

### Crear una tarea

```bash
curl -X POST http://localhost:8000/tareas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Mi primera tarea","descripcion":"Descripcion de ejemplo","completada":false}'
```

### Listar todas las tareas

```bash
curl http://localhost:8000/tareas
```

### Obtener una tarea especifica

```bash
curl http://localhost:8000/tareas/{id}
```

### Actualizar una tarea

```bash
curl -X PUT http://localhost:8000/tareas/{id} \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Tarea actualizada","completada":true}'
```

### Eliminar una tarea

```bash
curl -X DELETE http://localhost:8000/tareas/{id}
```

## Notas

- Los datos se almacenan en memoria y se pierden al reiniciar.
- La implementacion en C maneja hasta 1000 tareas por defecto.
