# Despliegue en la Nube: Almacenamiento S3 y Computacion EC2 al Alcance de tu Mano

Conferencia del curso de Manejo e Implementacion de Archivos

![Afiche](./Afiche.jpg)

## Temas a tratar

- AWS
- IAM
- EC2
- S3

## Demostracion

En esta sesion realizaremos una demostracion practica de los servicios de AWS, incluyendo:

- Explicacion de las politicas IAM y de su uso
- Despliegue de una aplicacion containerizada utilizando **Docker** en una instancia **EC2**
- Hospedaje de una pagina estatica utilizando **Amazon S3**

## Comandos Docker Basicos

Estos son los comandos principales utilizados durante el despliegue y publicacion de imagenes:

1. docker build

Construye una imagen a partir de un Dockerfile.

Ejemplo:
docker build -t usuario/mi-app:latest .

2. docker run

Ejecuta un contenedor a partir de una imagen.

Ejemplo:
docker run --rm -p 8000:8000 usuario/mi-app:latest

3. docker push

Publica una imagen en un registro remoto (por ejemplo Docker Hub).

Ejemplo:
docker push usuario/mi-app:latest

## Que es Docker Hub y para que sirve

Docker Hub es un registro en la nube donde se almacenan y distribuyen imagenes de Docker.

Sirve para:

- Compartir imagenes entre equipos.
- Versionar imagenes por tags (por ejemplo latest, v1.0.0).
- Descargar imagenes desde cualquier servidor o instancia EC2 usando docker pull.
- Centralizar el flujo de CI/CD para construir y publicar contenedores.

## Nota de Migracion (Cambio de IP y Build Frontend)

Cuando migres la aplicacion a otro servidor o instancia (por ejemplo otra EC2), debes actualizar la URL/IP del backend en la configuracion del frontend.

Archivo a modificar:

Frontend/tasks/src/config.js

Valor de referencia:
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

En produccion, reemplaza localhost o la IP anterior por la nueva IP publica o dominio del backend.

Despues de cambiar la configuracion, vuelve a compilar el frontend con uno de estos comandos:

npm run build

o

pnpm run build


</br>

### Politcas S3 (Web Estatica)

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mi-bucket/*"
    }
  ]
}
```
