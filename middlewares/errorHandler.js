const { log } = require('../logs/utils/logger');
const { sendSlackError } = require('../logs/utils/slack');

function errorHandler(err, req, res, next) {
    const area = req.originalUrl || 'unknown';
    const msg = `${req.method} ${req.originalUrl} -> ${err.message}`;

    log('ERROR', area, msg);

    const text =
        `🚨 *AEMET API ERROR 500*\n` +
        `• *Método:* ${req.method}\n` +
        `• *Ruta:* ${req.originalUrl}\n` +
        `• *Mensaje:* ${err.message}\n` +
        `• *Timestamp:* ${new Date().toISOString()}`;

    sendSlackError(text);


    // Si ya se envió respuesta, delega
    if (res.headersSent) return next(err);

    res.status(500).json({
        error: 'Error interno del servidor',
        details: err.message
    });
}

module.exports = errorHandler;
