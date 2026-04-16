# Transformando Oracle en uns Entorno Ágil con Docker y APls


Conferencia del curso de Manejo e Implementacion de Archivos

![Afiche](./Afiche.jpg)



Proyecto backend con Node.js + Express + Oracle Database, orquestado con Docker Compose.

## 1. Estructura del proyecto

```text
Bases1_1S2026/
	docker-compose.yml
	Backend/
		API/
			Dockerfile
			package.json
			src/
				index.js
				db.js
				models/
					Category.js
					Movie.js
				routes/
					categories.js
					movies.js
		DB/
			create-user.sql
			init-oracle.sql
			seed-oracle.sql
```

## 2. Servicios en Docker Compose

El archivo docker-compose.yml define 2 servicios:

### oracle-db

- Imagen: gvenzl/oracle-free:23-slim-faststart
- Puerto: 1521 (mapeable con DB_PORT)
- Volumen persistente: oracle_data
- Inicializa esquema con:
	- Backend/DB/init-oracle.sql
- Red: movies-network
- Healthcheck habilitado

### movies-api

- Build local desde Backend/API/Dockerfile
- Comando de arranque: pnpm run dev
- Puerto: 3001 (mapeable con API_PORT)
- Variables de entorno para conexion Oracle
- Dependencia de oracle-db (espera estado healthy)
- Monta codigo fuente para desarrollo:
	- Backend/API/src -> /app/src

## 3. Variables de entorno requeridas

Crear un archivo .env en la raiz Bases1_1S2026 con:

```env
ORACLE_PASSWORD=oracle_root_password
DB_USER=movie_user
DB_PASSWORD=movie_user_password
DB_CONNECTION_STRING=oracle-db:1521/FREEPDB1
DB_PORT=1521
API_PORT=3001
```

Descripcion:

- ORACLE_PASSWORD: password del usuario administrador de Oracle (contenedor).
- DB_USER: usuario de aplicacion para la API.
- DB_PASSWORD: password del usuario de aplicacion.
- DB_CONNECTION_STRING: cadena de conexion usada por la API.
- DB_PORT: puerto expuesto de Oracle en host.
- API_PORT: puerto expuesto de la API en host.

## 4. Levantar el proyecto

Desde la carpeta Bases1_1S2026:

```bash
docker compose up --build
```

Para detener:

```bash
docker compose down
```

Para detener y borrar volumen de datos:

```bash
docker compose down -v
```

## 5. Inicializacion de base de datos

El script Backend/DB/init-oracle.sql crea:

- Tabla categories
- Tabla movies
- Secuencia categories_seq
- Secuencia movies_seq

El script Backend/DB/seed-oracle.sql inserta datos semilla si las tablas estan vacias.

## 6. Base URL de la API

Si se usa configuracion por defecto:

```text
http://localhost:3001/api
```

## 7. Endpoints

### 7.1 Healthcheck

- Metodo: GET
- Ruta: /health

Ejemplo:

```bash
curl -X GET http://localhost:3001/api/health
```

Respuesta esperada:

```json
{
	"status": "OK",
	"timestamp": "2026-04-16T12:00:00.000Z"
}
```

### 7.2 Categorias

#### Crear categoria

- Metodo: POST
- Ruta: /categories
- Content-Type: application/json

Body (estructura POST):

```json
{
	"name": "Accion",
	"description": "Peliculas de accion y aventura"
}
```

Reglas:

- name: requerido, no vacio.
- description: opcional.

Respuesta exitosa (201):

```json
{
	"id": 1,
	"name": "Accion",
	"description": "Peliculas de accion y aventura"
}
```

#### Listar categorias

- Metodo: GET
- Ruta: /categories

Respuesta (200):

```json
[
	{
		"id": 1,
		"name": "Accion",
		"description": "Peliculas de accion y aventura",
		"created_at": "2026-04-16T00:00:00.000Z"
	}
]
```

#### Obtener categoria por ID

- Metodo: GET
- Ruta: /categories/:id

Errores comunes:

- 400 si id no es numerico.
- 404 si categoria no existe.

#### Actualizar categoria

- Metodo: PUT
- Ruta: /categories/:id
- Content-Type: application/json

Body (estructura PUT):

```json
{
	"name": "Accion y Aventura",
	"description": "Categoria actualizada"
}
```

Reglas:

- name: requerido, no vacio.

#### Eliminar categoria

- Metodo: DELETE
- Ruta: /categories/:id

Respuesta (200):

```json
{
	"message": "Categoria eliminada correctamente"
}
```

### 7.3 Peliculas

#### Crear pelicula

- Metodo: POST
- Ruta: /movies
- Content-Type: application/json

Body (estructura POST):

```json
{
	"title": "Interestelar",
	"description": "Exploracion espacial para salvar la humanidad",
	"categoryId": 4,
	"releaseDate": "2014-11-07",
	"director": "Christopher Nolan",
	"duration": 169
}
```

Reglas:

- title: requerido, no vacio.
- description: opcional.
- categoryId: opcional; si se envia, debe existir en categories.
- releaseDate: opcional, formato recomendado YYYY-MM-DD.
- director: opcional.
- duration: opcional, numero (minutos).

Respuesta exitosa (201):

```json
{
	"id": 101,
	"title": "Interestelar",
	"description": "Exploracion espacial para salvar la humanidad",
	"categoryId": 4,
	"releaseDate": "2014-11-07",
	"director": "Christopher Nolan",
	"duration": 169
}
```

#### Listar peliculas

- Metodo: GET
- Ruta: /movies
- Query opcional:
	- search: filtra por titulo, descripcion o director.

Ejemplos:

```bash
curl -X GET "http://localhost:3001/api/movies"
curl -X GET "http://localhost:3001/api/movies?search=nolan"
```

#### Obtener pelicula por ID

- Metodo: GET
- Ruta: /movies/:id

Errores comunes:

- 400 si id no es numerico.
- 404 si pelicula no existe.

#### Obtener peliculas por categoria

- Metodo: GET
- Ruta: /movies/category/:categoryId

Errores comunes:

- 400 si categoryId no es numerico.
- 404 si categoria no existe.

#### Actualizar pelicula

- Metodo: PUT
- Ruta: /movies/:id
- Content-Type: application/json

Body (estructura PUT):

```json
{
	"title": "Interestelar (Edicion Extendida)",
	"description": "Version actualizada",
	"categoryId": 4,
	"releaseDate": "2014-11-07",
	"director": "Christopher Nolan",
	"duration": 175
}
```

Reglas:

- title: requerido, no vacio.
- categoryId: si se envia, debe existir.

#### Eliminar pelicula

- Metodo: DELETE
- Ruta: /movies/:id

Respuesta (200):

```json
{
	"message": "Pelicula eliminada correctamente"
}
```

## 8. Estructura de errores en la API

Errores de validacion o logica en rutas:

```json
{
	"error": "Mensaje descriptivo"
}
```

Error global no controlado:

```json
{
	"error": "Error interno del servidor",
	"status": 500
}
```

## 9. Flujo recomendado para pruebas manuales

1. Verificar salud:
	 - GET /api/health
2. Crear categoria:
	 - POST /api/categories
3. Crear pelicula usando categoryId existente:
	 - POST /api/movies
4. Listar y filtrar:
	 - GET /api/movies
	 - GET /api/movies?search=texto
5. Probar detalle, actualizacion y eliminacion:
	 - GET/PUT/DELETE por ID

