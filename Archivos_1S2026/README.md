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


</br>

### Politcas S3 (Web Estatica)

```bash
{
  "Version": "2023-04-06",
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
