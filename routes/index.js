const express = require('express');
const router = express.Router();

// Rutas de ejemplo (más adelante las sustituiremos por controllers)
router.get('/', (req, res) => {
  res.json({ ok: true, api: 'AEMET - endpoints en /api/...' });
});

// ejemplo de ruta de usuarios (lista dummy)
router.get('/users', (req, res) => {
  res.json([
    { username: 'admin', fullName: 'Administrador' }
  ]);
});

module.exports = router;
