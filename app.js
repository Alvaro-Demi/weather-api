// app.js - punto de entrada básico (versión corregida)
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const requestLogger = require('./middlewares/requestLogger')
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

// Rutas base simples (index)
const indexRoutes = require('./routes/index');
// --- RUTAS: requiere aquí todas las rutas antes de montar la 404 ----
const userRoutes = require('./routes/user'); 
const sondasRoutes = require('./routes/sondas');
const vientoRoutes = require('./routes/viento');
const precipitacionRoutes = require('./routes/precipitacion');
const infoGeneralRoutes = require('./routes/infoGeneral');
const imagenRoutes = require('./routes/imagen');
const humedadRoutes = require('./routes/humedad');
const datosAvanzadosRoutes = require('./routes/datosAvanzados');
const calidadAireRoutes = require('./routes/calidadAire');

const authRoutes = require('./routes/auth');

// Middlewares
app.use(express.json()); // permitimos JSON en body
app.use(requestLogger);
app.use(express.static('public'));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Montamos las rutas en el app
app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/user', userRoutes);
app.use('/api/sondas', sondasRoutes);
app.use('/api/viento', vientoRoutes);
app.use('/api/precipitacion', precipitacionRoutes);
app.use('/api/infoGeneral', infoGeneralRoutes);
app.use('/api/imagen', imagenRoutes);
app.use('/api/humedad', humedadRoutes);
app.use('/api/datosAvanzados', datosAvanzadosRoutes);
app.use('/api/calidadAire', calidadAireRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AEMET API - en desarrollo ✅' });
});

//Pruebas, Borrar luego
//prueba de slack
app.get('/boom', (req, res) => {
  throw new Error('Error de prueba Slack');
});
//console.log('Slack webhook:', process.env.SLACK_WEBHOOK_URL ? 'OK' : 'NO');




// Manejo básico de errores 404 (después de montar todas las rutas)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (al final)
app.use(errorHandler);

module.exports = app;


