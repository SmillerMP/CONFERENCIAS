const swaggerJsdoc = require('swagger-jsdoc');

/**
 * @openapi
 * components:
 *   schemas:
 *     HealthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: OK
 *         timestamp:
 *           type: string
 *           format: date-time
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Accion
 *         description:
 *           type: string
 *           example: Peliculas de accion
 *     CategoryInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Drama
 *         description:
 *           type: string
 *           example: Peliculas dramaticas
 *     Movie:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         title:
 *           type: string
 *           example: Matrix
 *         description:
 *           type: string
 *           example: Ciencia ficcion
 *         categoryId:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         releaseDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: 1999-03-31
 *         director:
 *           type: string
 *           example: Lana Wachowski
 *         duration:
 *           type: integer
 *           nullable: true
 *           example: 136
 *     MovieInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: Interstellar
 *         description:
 *           type: string
 *           example: Exploracion espacial
 *         categoryId:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         releaseDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: 2014-11-07
 *         director:
 *           type: string
 *           example: Christopher Nolan
 *         duration:
 *           type: integer
 *           nullable: true
 *           example: 169
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Error interno del servidor
 *
 * paths:
 *   /api/health:
 *     get:
 *       tags:
 *         - Health
 *       summary: Verifica estado de la API
 *       responses:
 *         '200':
 *           description: API activa
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/HealthResponse'
 *
 *   /api/categories:
 *     get:
 *       tags:
 *         - Categories
 *       summary: Lista todas las categorias
 *       responses:
 *         '200':
 *           description: Lista de categorias
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Category'
 *     post:
 *       tags:
 *         - Categories
 *       summary: Crea una categoria
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryInput'
 *       responses:
 *         '201':
 *           description: Categoria creada
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Category'
 *         '400':
 *           description: Datos invalidos
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *
 *   /api/categories/{id}:
 *     get:
 *       tags:
 *         - Categories
 *       summary: Obtiene una categoria por ID
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         '200':
 *           description: Categoria encontrada
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Category'
 *         '404':
 *           description: Categoria no encontrada
 *     put:
 *       tags:
 *         - Categories
 *       summary: Actualiza una categoria
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryInput'
 *       responses:
 *         '200':
 *           description: Categoria actualizada
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Category'
 *     delete:
 *       tags:
 *         - Categories
 *       summary: Elimina una categoria
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         '200':
 *           description: Categoria eliminada
 *
 *   /api/movies:
 *     get:
 *       tags:
 *         - Movies
 *       summary: Lista peliculas o filtra por search
 *       parameters:
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Lista de peliculas
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Movie'
 *     post:
 *       tags:
 *         - Movies
 *       summary: Crea una pelicula
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieInput'
 *       responses:
 *         '201':
 *           description: Pelicula creada
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Movie'
 *
 *   /api/movies/{id}:
 *     get:
 *       tags:
 *         - Movies
 *       summary: Obtiene una pelicula por ID
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         '200':
 *           description: Pelicula encontrada
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Movie'
 *         '404':
 *           description: Pelicula no encontrada
 *     put:
 *       tags:
 *         - Movies
 *       summary: Actualiza una pelicula
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieInput'
 *       responses:
 *         '200':
 *           description: Pelicula actualizada
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Movie'
 *     delete:
 *       tags:
 *         - Movies
 *       summary: Elimina una pelicula
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         '200':
 *           description: Pelicula eliminada
 *
 *   /api/movies/category/{categoryId}:
 *     get:
 *       tags:
 *         - Movies
 *       summary: Lista peliculas por categoria
 *       parameters:
 *         - in: path
 *           name: categoryId
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         '200':
 *           description: Lista de peliculas por categoria
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Movie'
 */

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Movies API',
      version: '1.0.0',
      description: 'Documentacion de API para peliculas y categorias'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor local'
      }
    ]
  },
  apis: [__filename]
});

module.exports = swaggerSpec;
