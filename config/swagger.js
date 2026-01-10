const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AEMET API',
    version: '1.0.0',
    description: 'Documentación de la API meteorológica (prototipo)',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

const options = {
  swaggerDefinition,
  // aquí indicamos dónde están tus rutas para leer comentarios JSDoc
  apis: ['./routes/*.js'],
};

module.exports = swaggerJSDoc(options);
