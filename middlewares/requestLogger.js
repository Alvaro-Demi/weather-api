const { log } = require('../logs/utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const area = req.originalUrl; // “área de la API”
    const msg = `${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`;
    log('INFO', area, msg);
  });

  next();
}

module.exports = requestLogger;
