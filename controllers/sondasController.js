// controllers/sondasController.js
const sondas = require('../models/sondas');
const Sonda = require('../models/sondas');

async function getAll(req, res) {
  try {
    const filtro = { deletedAt: null };

    // Si viene el query param, lo añadimos al filtro
    if (req.query.localizacion) {
      filtro.localizacion = req.query.localizacion;
    }

    const sondas = await Sonda.find(filtro);
    res.json(sondas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener sondas', details: err.message });
  }
}

async function getOne(req, res) {
  try {
    const sondas = await Sonda.findOne({ _id: req.params.id, deletedAt: null });
    if (!sondas) return res.status(404).json({ error: 'Sonda no encontrada' });
    res.json(sondas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener sonda', details: err.message });
  }
}

// POST /api/sondas
async function create(req, res) {
  try {
    const { nombre, descripcion, localizacion } = req.body || {};
    if (!nombre || !localizacion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: nombre y localizacion' });
    }
    const sondas = new Sonda({
      nombre,
      descripcion,
      localizacion
    });
    
    await sondas.save();
    res.status(201).json(sondas);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear sonda', details: err.message });
  }
}

// PUT /api/sondas/:id
async function update(req, res) {
  try {
    const payload = { ...(req.body || {}) };
    // Evita que puedan "revivir" o borrar desde el PUT
    if ('deletedAt' in payload) delete payload.deletedAt;

    const updated = await Sonda.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Sonda no encontrada' });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar sonda', details: err.message });
  }
}

async function remove(req, res) {
  try {
    const sondas = await Sonda.findById(req.params.id);
    if (!sondas || sondas.deletedAt !== null) {
      return res.status(404).json({ error: 'Sonda no encontrada' });
    }
    sondas.deletedAt = new Date();
    await sondas.save();

    res.json({ message: 'Sonda eliminada (borrado lógico)' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar sonda', details: err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove };
