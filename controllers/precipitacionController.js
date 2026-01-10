// controllers/sondasController.js
const Precipitacion = require('../models/precipitacion');
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

    const precipitacion = await Precipitacion.find(filtro).sort({ timestamp: -1 });
    res.json(precipitacion);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener precipitaciones', details: err.message });
  }
}

async function getOne(req, res) {
  try {
    const precipitacion = await Precipitacion.findOne({ _id: req.params.id, deletedAt: null });
    if (!precipitacion) return res.status(404).json({ error: 'Precipitacion no encontrada' });
    res.json(precipitacion);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener precipitacion', details: err.message });
  }
}

async function create(req, res) {
  try {
    const { tipo, acumulada, probabilidad, sonda, timestamp } = req.body || {};
    
    if (!tipo || probabilidad == null || acumulada == null || !sonda || !timestamp) {
      return res.status(400).json({ error: 'Faltan campos: tipo, probabilidad, acumulada, sonda, timestamp' });
    }

     const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      return res.status(400).json({ error: 'timestamp no es válido (ISO 8601)' });
    }

    const precipitacion = new Precipitacion({ tipo, probabilidad, acumulada, sonda, timestamp: ts });
    await precipitacion.save();
    res.status(201).json(precipitacion);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear precipitacion', details: err.message });
  }
}

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

    const updated = await Precipitacion.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Precipitacion no encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar Precipitacion', details: err.message });
  }
}

async function remove(req, res) {
  try {
    const dato = await Precipitacion.findOne({ _id: req.params.id, deletedAt: null });
    if (!dato) return res.status(404).json({ error: 'Precipitacion no encontrada' });

    dato.deletedAt = new Date();
    await dato.save();

    res.json({ message: 'Precipitacion eliminada (borrado lógico)' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar Precipitacion', details: err.message });
  }
}

// STATS sobre campo "acumulada"
async function min(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const doc = await Precipitacion.findOne(built.filtro).sort({ acumulada: 1 }).select('acumulada');
    if (!doc) return res.status(404).json({ error: 'No hay datos en ese intervalo' });
    res.json({ metric: 'min', field: 'acumulada', value: doc.acumulada });
  } catch (err) {
    res.status(500).json({ error: 'Error en min', details: err.message });
  }
}

async function max(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const doc = await Precipitacion.findOne(built.filtro).sort({ acumulada: -1 }).select('acumulada');
    if (!doc) return res.status(404).json({ error: 'No hay datos en ese intervalo' });
    res.json({ metric: 'max', field: 'acumulada', value: doc.acumulada });
  } catch (err) {
    res.status(500).json({ error: 'Error en max', details: err.message });
  }
}

async function avg(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const docs = await Precipitacion.find(built.filtro).select('acumulada');
    if (docs.length === 0) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    const suma = docs.reduce((acc, d) => acc + d.acumulada, 0);
    const media = suma / docs.length;

    res.json({ metric: 'avg', field: 'acumulada', value: media, count: docs.length });
  } catch (err) {
    res.status(500).json({ error: 'Error en avg', details: err.message });
  }
}

async function median(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const docs = await Precipitacion.find(built.filtro).sort({ acumulada: 1 }).select('acumulada');
    const n = docs.length;
    if (n === 0) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    let mediana;
    if (n % 2 === 1) {
      mediana = docs[Math.floor(n / 2)].acumulada;
    } else {
      const a = docs[n / 2 - 1].acumulada;
      const b = docs[n / 2].acumulada;
      mediana = (a + b) / 2;
    }

    res.json({ metric: 'median', field: 'acumulada', value: mediana, count: n });
  } catch (err) {
    res.status(500).json({ error: 'Error en median', details: err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove, min, max, avg, median };