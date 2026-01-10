require('dotenv').config();
const app = require('./app');
const conectarDB = require('./config/db');

const port = process.env.PORT || 3000;

(async function start() {
  try {
    await conectarDB();
    console.log('✅ Conexión a DB realizada, continuando arranque...');

    app.listen(port, () => {
      console.log(`Servidor arrancado en http://localhost:${port}`);
    });
  } catch (err) {
    console.error('ERROR arrancando la aplicación:', err);
    process.exit(1);
  }
})();
