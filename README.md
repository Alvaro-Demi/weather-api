# 🌦️ Weather API

REST API desarrollada con Node.js y Express para gestionar y consultar datos meteorológicos y ambientales.

El proyecto incluye autenticación de usuarios, acceso a diferentes tipos de datos meteorológicos, documentación mediante Swagger, WebSockets para comunicación en tiempo real y tests automatizados.

## ✨ Funcionalidades

* 🔐 Autenticación de usuarios
* 🌡️ Gestión de datos de temperatura y humedad
* 🌧️ Gestión de precipitaciones
* 💨 Gestión de datos de viento
* 🌫️ Gestión de calidad del aire
* 📊 Consulta de datos avanzados
* 📡 Gestión de sondas y dispositivos
* 🖼️ Gestión de imágenes
* 🔄 Comunicación en tiempo real mediante WebSockets
* 📝 Validación de peticiones
* ⚠️ Middleware para gestión de errores
* 📋 Registro de peticiones y logs
* 🧪 Tests automatizados con Jest
* 📚 Documentación de la API mediante Swagger

## 🛠️ Tecnologías

### Backend

* Node.js
* Express
* JavaScript
* REST API

### Base de datos

* Base de datos SQL

### Comunicación

* WebSockets

### Testing y documentación

* Jest
* Swagger

### Herramientas

* Git
* GitHub
* npm

## 🏗️ Arquitectura

El proyecto utiliza una estructura organizada por responsabilidades:

```text
weather-api/
├── config/          # Configuración de la aplicación y base de datos
├── controllers/     # Lógica de las diferentes funcionalidades
├── middlewares/     # Autenticación, validación, errores y logs
├── models/          # Modelos de datos
├── routes/          # Endpoints de la API
├── test/            # Tests automatizados
├── utils/           # Funciones auxiliares
├── ws/              # Servidor WebSocket
├── public/          # Recursos públicos
└── app.js           # Configuración de Express
```

## 🔐 Autenticación

La API incorpora autenticación de usuarios mediante middleware, protegiendo los endpoints que requieren acceso autorizado.

## 📡 WebSockets

El proyecto incluye un servidor WebSocket integrado con el servidor HTTP/HTTPS para permitir comunicación en tiempo real.

## 🧪 Testing

Se utilizan tests automatizados con Jest para comprobar diferentes partes de la API, incluyendo:

* Autenticación
* Usuarios
* Datos meteorológicos
* Calidad del aire
* Humedad
* Precipitaciones
* Sondas
* Imágenes
* Datos avanzados

## 📚 Documentación

La API incluye configuración para documentar sus endpoints mediante **Swagger**, facilitando su consulta y prueba durante el desarrollo.

## 💻 Instalación

Clona el repositorio:

```bash
git clone https://github.com/Alvaro-Demi/weather-api.git
```

Instala las dependencias:

```bash
cd weather-api
npm install
```

Configura las variables de entorno necesarias para la conexión con la base de datos y el funcionamiento de la aplicación.

Después inicia el servidor:

```bash
npm start
```

## 📌 Estado del proyecto

Proyecto académico desarrollado durante el ciclo de Desarrollo de Aplicaciones Web.

El repositorio se mantiene como muestra de trabajo backend con Node.js, Express, APIs REST, autenticación, WebSockets y testing.
