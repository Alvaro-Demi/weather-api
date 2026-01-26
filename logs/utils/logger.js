const fs = require('fs');
const path = require('path');

// 1) Crear carpeta logs si no existe
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// 2) Crear nombre de archivo log con fecha/hora de arranque
function pad(n) {
  return String(n).padStart(2, '0');
}

const now = new Date();
const fileName = `log-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.log`;
const logFilePath = path.join(logsDir, fileName);

// 3) Función central de log
function log(level, area, message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level}] [${area}] ${message}`;

  // Consola
  console.log(line);

  // Fichero (append)
  fs.appendFile(logFilePath, line + '\n', (err) => {
    if (err) console.error('Error escribiendo log:', err.message);
  });
}

module.exports = { log, logFilePath };
