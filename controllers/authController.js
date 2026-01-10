const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function login(req, res) {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'username y password son obligatorios' });
    }

    // solo usuarios no borrados
    const user = await User.findOne({ username, deletedAt: null });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '5h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error en login', details: err.message });
  }
}

module.exports = { login };
