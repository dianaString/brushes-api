## (modulo-3-evaluacion-final-dianaString)

# Desarrollo de una API REST personalizada
El ejercicio consiste en desarrollar una API que permita insertar, modificar, listar y eliminar información utilizando Express.js, Node.js y una base de datos (MySQL)

### INSTRUCCIONES PARA NAVEGAR POR LA API:

#### Consultar la lista de pinceles - GET/api/brushes
      https://brushesapi.onrender.com/api/brushes 
#### Consultar un pincel - GET/api/brushes/:id
      https://brushesapi.onrender.com/api/brushes/(id_del_pincel)
#### Para añadir un pincel - POST/api/brushes
*Desde Postman o RapidAPI:*
    
    POST https://brushesapi.onrender.com/api/brushes

    Body JSON de ejemplo:
    {
        "name": "Pincel_1",
        "serie": "0001",
        "hair_type": "synthethic",
        "hardness": "hard",
        "recommended_medium": "acrylic",
        "price": "afforable"
    } 

#### Para actualizar un pincel - PUT/api/brushes/:id
*Desde Postman o RapidAPI:*

    PUT https://brushesapi.onrender.com/api/brushes

    Body JSON de ejemplo:
    {
        "name": "Pincel_1",
        "serie": "0001",
        "hair_type": "natural",
        "hardness": "medium",
        "recommended_medium": "gouache",
        "price": "expensive"
    } 
#### Para eliminar un pincel - DELETE/api/brushes/:id
*Desde Postman o RapidAPI:*

    DELETE https://brushesapi.onrender.com/api/brushes/(id_del_pincel)

#### Para registrarse como usuario - POST/login
*Desde Postman o RapidAPI:*

    POST https://brushesapi.onrender.com/register

    Body JSON de ejemplo: (a rellenar)
    {
    "name": "",
    "email": "",
    "password": ""
    }

#### Para hacer login como usuario - POST/login
*Desde Postman o RapidAPI:*

    POST https://brushesapi.onrender.com/login

    Body JSON de ejemplo: (usuario funcional)
    {
    "name": "usuario3",
    "password": "usuario3_1234"
    }

#### Acceso mediante token - POST/user_brushes
*Desde Postman o RapidAPI:*

    POST http://localhost:3005/user_brushes

    Headers de ejemplo: (usuario funcional)
    Authorization eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXN1YXJpbzMiLCJpZCI6NiwiaWF0IjoxNzAwMDQ1MDYzLCJleHAiOjE3MDAwNDg2NjN9.V7e6Vs3qH9hENUR4k0lfohcP1pTwv0cdA0uIgSP9SfY

### Objetivos:

1: Diseño de la Base de Datos para la API

- [X] Crear la base de datos: tablas, columnas y relaciones. 
- [X] Incluir el código del archivo .sql en el repositorio.

2: Configuración del Servidor

- [X] Configurar un servidor Express.js y conectarse a la base de datos.
- [X] Implementar las funciones necesarias para el manejo de JSON y cualquier otra funcionalidad que se considere necesaria.
- [X] Gestionar la contraseña y datos de acceso a la base de
datos con variables de entorno (dotenv).

3: API RESTful
Definir las rutas y endpoints correspondientes:
- [X] Insertar una entrada en la entidad principal.
- [X] Leer/Listar todas las entradas existentes.
- [X] Actualizar una entrada existente.
- [X] Eliminar una entrada existente.

### Bonus

Sistema de autenticación con JWT (registro y inicio de sesión):
- [X] Permitir el registro de un nuevo usuario.
- [X] Permitir que un usuario existente inicie sesión.
- [X] Implementar un middleware de autenticación que verifique el token JWT en cada solicitud del API.

Algunos extras:

- [X] Añadir un servidor de estáticos.
- [ ] Subir el servidor de la API a algún servicio para que esté disponible en Internet.
- [ ] ~~Instalar y configurar la librería Swagger para generar una página web con la documentación de los endpoints de la API~~
- [ ] ~~Hacer testing~~

### Entrega
*El límite de entrega es el **miércoles 14 de noviembre a las 14:00**.*


<br>