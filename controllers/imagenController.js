
const Imagen = require('../models/imagen'); // ajusta el nombre si lo creaste distinto

// GET /api/users
async function getAll(req, res) {
  try {
    const filtro = { deletedAt: null };

    // localizacion opcional
    if (req.query.localizacion) {
      filtro.localizacion = req.query.localizacion.trim();
    }

    // rango de tiempo opcional
    if (req.query.from || req.query.to) {
      filtro.timestamp = {};

      if (req.query.from) {
        const fromDate = new Date(req.query.from);
        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({ error: 'from no es una fecha válida (usa ISO 8601)' });
        }
        filtro.timestamp.$gte = fromDate;
      }

      if (req.query.to) {
        const toDate = new Date(req.query.to);
        if (isNaN(toDate.getTime())) {
          return res.status(400).json({ error: 'to no es una fecha válida (usa ISO 8601)' });
        }
        filtro.timestamp.$lte = toDate;
      }
    }

    const imagenes = await Imagen.find(filtro).sort({ timestamp: -1 });
    res.json(imagenes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener imágenes', details: err.message });
  }
}

// GET /api/users/:id
async function getOne(req, res) {
  try {
    const imagen = await Imagen.findOne({ _id: req.params.id, deletedAt: null });
    if (!imagen) return res.status(404).json({ error: 'imagen no encontrado' });
    res.json(imagen);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener imagen', details: err.message });
  }
}

// POST /api/users
async function create(req, res) {
  try {
    const { localizacion, url, timestamp } = req.body || {};

    if (!localizacion || !url || !timestamp) {
      return res.status(400).json({ error: 'Faltan campos: localizacion, url, timestamp' });
    }

    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      return res.status(400).json({ error: 'timestamp no es válido (usa ISO 8601)' });
    }

    const nueva = new Imagen({
      localizacion: localizacion.trim(),
      url,
      timestamp: ts
    });

    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear imagen', details: err.message });
  }
}

// PUT /api/users/:id
async function update(req, res) {
  try {
    const payload = { ...(req.body || {}) };
    if ('deletedAt' in payload) delete payload.deletedAt;

    const updated = await Imagen.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );
    
    if (!updated) return res.status(404).json({ error: 'imagen no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar imagen', details: err.message });
  }
}

// DELETE /api/users/:id
async function remove(req, res) {
  try {
    const imagen = await Imagen.findOne({ _id: req.params.id, deletedAt: null });
    if (!imagen) return res.status(404).json({ error: 'Imagen no encontrada' });

    imagen.deletedAt = new Date();
    await imagen.save();

    res.json({ message: 'Imagen eliminada (borrado lógico)' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar imagen', details: err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove };
