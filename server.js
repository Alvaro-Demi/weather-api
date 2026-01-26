require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = require('./app');
const conectarDB = require('./config/db');
const { createWsServer } = require('./ws/wsServer');

const port = process.env.PORT || 3000;

// Cargar certificado TLS
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'cert/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert/cert.pem')),
};

(async function start() {
  try {
    await conectarDB();
    console.log('✅ Conexión a DB realizada, continuando arranque...');

    // 1) Crear servidor HTTPS usando Express como handler
    const server = https.createServer(sslOptions, app);

    // 2) Enganchar WebSocket al MISMO servidor (ahora será WSS)
    createWsServer(server);

    // 3) Escuchar en el puerto
    server.listen(port, () => {
      console.log(`🔐 Servidor arrancado en https://localhost:${port}`);
      console.log(`🔒 WebSocket listo en wss://localhost:${port}/ws`);
    });

  } catch (err) {
    console.error('ERROR arrancando la aplicación:', err);
    process.exit(1);
  }
})();
