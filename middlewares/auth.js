const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization;

  // Esperamos: Authorization: Bearer TOKEN
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido (Bearer)' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // guardamos info del usuario autenticado
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o caducado' });
  }
}

module.exports = auth;
