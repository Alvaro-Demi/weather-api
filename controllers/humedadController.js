
const Humedad = require('../models/humedad');

function buildStatsFilter(req) {
  const filtro = { deletedAt: null };

  if (req.query.sondaId) filtro.sonda = req.query.sondaId;

  const { from, to } = req.query;

  if (from || to) {
    filtro.timestamp = {};

    if (from) {
      const dFrom = new Date(from);
      if (isNaN(dFrom.getTime())) return { error: 'from no es una fecha válida (ISO 8601)' };
      filtro.timestamp.$gte = dFrom;
    }

    if (to) {
      const dTo = new Date(to);
      if (isNaN(dTo.getTime())) return { error: 'to no es una fecha válida (ISO 8601)' };
      filtro.timestamp.$lte = dTo;
    }
  }

  return { filtro };
}

// GET /api/user
async function getAll(req, res) {
  try {
    const filtro = { deletedAt: null };

    if (req.query.sondaId) filtro.sonda = req.query.sondaId;

    if (req.query.from || req.query.to) {
      filtro.timestamp = {};

      if (req.query.from) {
        const dFrom = new Date(req.query.from);
        if (isNaN(dFrom.getTime())) return res.status(400).json({ error: 'from no es una fecha válida (ISO 8601)' });
        filtro.timestamp.$gte = dFrom;
      }

      if (req.query.to) {
        const dTo = new Date(req.query.to);
        if (isNaN(dTo.getTime())) return res.status(400).json({ error: 'to no es una fecha válida (ISO 8601)' });
        filtro.timestamp.$lte = dTo;
      }
    }

    const datos = await Humedad.find(filtro).sort({ timestamp: -1 });
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener humedad', details: err.message });
  }
}

// GET /api/users/:id
async function getOne(req, res) {
  try {
    const humedad = await Humedad.findOne({ _id: req.params.id, deletedAt: null });
    if (!humedad) return res.status(404).json({ error: 'humedad no encontrado' });
    res.json(humedad);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener humedad', details: err.message });
  }
}

// POST /api/users
async function create(req, res) {
  try {
    const { humedad, puntoRocio, sonda, timestamp } = req.body || {};

    // 1) Validación mínima
    if (humedad == null || puntoRocio == null || !sonda || !timestamp) {
      return res.status(400).json({ error: 'Faltan campos: humedad, puntoRocio, sonda, timestamp' });
    }

    // 2) Convertir timestamp a Date y validar  
    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      return res.status(400).json({ error: 'timestamp no es válido (ISO 8601)' });
    }

    // 3) Crear con whitelist (sin aceptar campos extra)  
    const dato = new Humedad({ humedad, puntoRocio, sonda, timestamp: ts });
    await dato.save();
    res.status(201).json(dato);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear humedad', details: err.message });
  }
}

// PUT /api/users/:id
async function update(req, res) {
  try {
    const payload = { ...(req.body || {}) };
    if ('deletedAt' in payload) delete payload.deletedAt;

    if (payload.timestamp) {
      const ts = new Date(payload.timestamp);
      if (isNaN(ts.getTime())) {
        return res.status(400).json({ error: 'timestamp no es válido (ISO 8601)' });
      }
      payload.timestamp = ts;
    }
    const updated = await Humedad.findByIdAndUpdate(
      { _id: req.params.id, deletedAt: null },
      payload,
      { new: true, runValidators: true });

    if (!updated) return res.status(404).json({ error: 'humedad no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar humedad', details: err.message });
  }
}

// DELETE /api/humedad/:id  (soft delete)
async function remove(req, res) {
  try {
    const updated = await Humedad.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Humedad no encontrada' });

    res.json({ message: 'Humedad eliminada (soft delete)' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar Humedad', details: err.message });
  }
}

// STATS sobre campo "humedad"
async function min(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const doc = await Humedad.findOne(built.filtro).sort({ humedad: 1 }).select('humedad');
    if (!doc) return res.status(404).json({ error: 'No hay datos en ese intervalo' });
    res.json({ metric: 'min', field: 'humedad', value: doc.humedad });
  } catch (err) {
    res.status(500).json({ error: 'Error en min', details: err.message });
  }
}

async function max(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const doc = await Humedad.findOne(built.filtro).sort({ humedad: -1 }).select('humedad');
    if (!doc) return res.status(404).json({ error: 'No hay datos en ese intervalo' });
    res.json({ metric: 'max', field: 'humedad', value: doc.humedad });
  } catch (err) {
    res.status(500).json({ error: 'Error en max', details: err.message });
  }
}

async function avg(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const docs = await Humedad.find(built.filtro).select('humedad');
    if (docs.length === 0) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    const suma = docs.reduce((acc, d) => acc + d.humedad, 0);
    const media = suma / docs.length;

    res.json({ metric: 'avg', field: 'humedad', value: media, count: docs.length });
  } catch (err) {
    res.status(500).json({ error: 'Error en avg', details: err.message });
  }
}

async function median(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const docs = await Humedad.find(built.filtro).sort({ humedad: 1 }).select('humedad');
    const n = docs.length;
    if (n === 0) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    let mediana;
    if (n % 2 === 1) {
      mediana = docs[Math.floor(n / 2)].humedad;
    } else {
      const a = docs[n / 2 - 1].humedad;
      const b = docs[n / 2].humedad;
      mediana = (a + b) / 2;
    }

    res.json({ metric: 'median', field: 'humedad', value: mediana, count: n });
  } catch (err) {
    res.status(500).json({ error: 'Error en median', details: err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove, min, max, avg, median };


