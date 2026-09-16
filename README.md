# 🌦️ Weather API

REST API desarrollada con **Node.js y Express** para gestionar y consultar datos meteorológicos y ambientales.

El proyecto incorpora autenticación de usuarios, validación de peticiones, documentación mediante Swagger, comunicación en tiempo real mediante WebSockets y tests automatizados.

## ✨ Funcionalidades

* 🔐 Registro y autenticación de usuarios
* 🔑 Autenticación mediante JWT
* 🔒 Gestión segura de contraseñas mediante bcrypt
* 🌡️ Gestión de datos meteorológicos
* 🌧️ Gestión de precipitaciones
* 💨 Gestión de datos de viento
* 🌫️ Gestión de calidad del aire
* 💧 Gestión de humedad
* 📊 Consulta de datos avanzados
* 📡 Gestión de sondas y dispositivos
* 🖼️ Gestión de imágenes
* 🔄 Comunicación en tiempo real mediante WebSockets
* ✅ Validación de peticiones
* ⚠️ Middleware para gestión de errores
* 📝 Registro de peticiones
* 🧪 Tests automatizados
* 📚 Documentación de la API mediante Swagger

## 🛠️ Tecnologías

### Backend

* Node.js
* Express
* JavaScript
* REST API

### Base de datos

* MongoDB
* Mongoose

### Autenticación y seguridad

* JSON Web Token (JWT)
* bcryptjs
* Express Validator
* dotenv

### Comunicación

* WebSockets

### Testing

* Jest
* Supertest

### Documentación

* Swagger
* Swagger UI

### Herramientas

* Git
* GitHub
* npm

## 🏗️ Arquitectura

El proyecto utiliza una estructura organizada por responsabilidades:

```text
weather-api/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── test/
├── utils/
├── ws/
├── public/
├── app.js
└── server.js
```

### Capas principales

* **Controllers:** lógica de las diferentes operaciones de la API.
* **Models:** modelos de datos gestionados mediante Mongoose.
* **Routes:** definición y organización de los endpoints.
* **Middlewares:** autenticación, validación, gestión de errores y registro de peticiones.
* **Test:** pruebas automatizadas de los diferentes recursos de la API.
* **WebSockets:** comunicación en tiempo real.
* **Config:** configuración de base de datos y documentación Swagger.

## 🔐 Autenticación

La API incorpora un sistema de autenticación basado en **JWT**.

Las contraseñas de los usuarios se gestionan mediante **bcryptjs** y los endpoints que requieren autorización están protegidos mediante middleware.

## 📡 WebSockets

El proyecto incluye un servidor WebSocket utilizando la librería `ws`.

Esto permite establecer comunicación en tiempo real entre el servidor y los clientes conectados.

También se incluye un cliente de prueba dentro de:

```text
public/ws-client.html
```

## 🧪 Testing

El proyecto utiliza **Jest** y **Supertest** para realizar pruebas automatizadas sobre diferentes endpoints y funcionalidades de la API.

Entre las áreas cubiertas se encuentran:

* Autenticación
* Usuarios
* Datos meteorológicos
* Calidad del aire
* Humedad
* Precipitaciones
* Sondas
* Imágenes
* Datos avanzados
* Viento

Los tests pueden ejecutarse mediante:

```bash
npm test
```

## 📚 Documentación de la API

La API incorpora documentación mediante **Swagger** y **Swagger UI**, facilitando la consulta de los endpoints disponibles y su utilización durante el desarrollo.

## ⚙️ Scripts disponibles

```bash
npm start
```

Inicia el servidor.

```bash
npm run dev
```

Inicia el proyecto en modo desarrollo utilizando Nodemon.

```bash
npm test
```

Ejecuta los tests automatizados mediante Jest.

## 💻 Instalación

Clona el repositorio:

```bash
git clone https://github.com/Alvaro-Demi/weather-api.git
```

Accede al proyecto:

```bash
cd weather-api
```

Instala las dependencias:

```bash
npm install
```

Configura las variables de entorno necesarias para la conexión con MongoDB y la configuración de la aplicación.

Después inicia el servidor:

```bash
npm start
```

Para desarrollo:

```bash
npm run dev
```

## 🎯 Objetivo

El objetivo del proyecto fue desarrollar una **API REST completa con Node.js y Express**, trabajando diferentes aspectos del desarrollo backend como:

* Diseño de una API REST
* Persistencia de datos con MongoDB
* Autenticación y autorización
* Validación de datos
* Middleware
* Comunicación en tiempo real
* Testing automatizado
* Documentación de endpoints

## 📌 Estado del proyecto

Proyecto académico desarrollado durante el ciclo de **Desarrollo de Aplicaciones Web (DAW)**.

El repositorio se mantiene como muestra de trabajo backend con Node.js, Express, MongoDB, APIs REST, autenticación, WebSockets y testing.
