
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// GET /api/user
async function getAll(req, res) {
  try {
    const user = await User.find({ deletedAt: null }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: err.message });
  }
}

// GET /api/user/:id
async function getOne(req, res) {
  try {
    const user = await User.findOne({ _id: req.params.id, deletedAt: null }).select('-password');

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario', details: err.message });
  }
}

// POST /api/users
async function create(req, res) {
  try {
    const { username, fullName, description, email, password } = req.body || {};
    
    // 1) Validar antes de hashear
    if (!username || !fullName || !email || !password) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: username, fullName, email y password'
      });
    }

    // 2) Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3) Crear solo con campos permitidos
    const user = new User({
      username,
      fullName,
      description,
      email,
      password: hashedPassword
    });

    await user.save();

     // 4) Respuesta segura
    const safe = await User.findById(user._id).select('-password');
    res.status(201).json(safe);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {}).join(', ');
      return res.status(409).json({ error: `Valor duplicado en campo(s): ${field}` });
    }
    res.status(400).json({ error: 'Error al crear usuario', details: err.message });
  }
}



// PUT /api/users/:id
async function update(req, res) {
  try {
    const payload = { ...(req.body || {}) };
    // Evita que puedan "revivir" o borrar desde el PUT
    if ('deletedAt' in payload) delete payload.deletedAt;
    if ('password' in payload) delete payload.password;

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      payload,
      { new: true, runValidators: true } // 👈 devuelve el documento actualizado
    ).select('-password'); // 👈 no mostramos la contraseña

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ error: "Error al actualizar usuario", details: err.message });
  }
}

// DELETE /api/users/:id
async function remove(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.deletedAt !== null) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.deletedAt = new Date();
    await user.save();

    res.json({ message: 'Usuario eliminado (borrado lógico)' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario', details: err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove };
