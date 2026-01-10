
const Viento = require('../models/viento');

function buildStatsFilter(req) {
  const filtro = { deletedAt: null };

  if (req.query.sondaId) {
    filtro.sonda = req.query.sondaId;
  }

  // from/to recomendados (en práctica suele ser obligatorio)
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
  } else {
    // Si quieres obligar intervalo, descomenta esto:
    // return { error: 'Debes indicar from y/o to' };
  }

  return { filtro };
}

async function getAll(req, res) {
  try {
    const filtro = { deletedAt: null };

    // Filtro opcional por sonda
    if (req.query.sondaId) {
      filtro.sonda = req.query.sondaId;
    }

    // Filtro opcional por rango de tiempo
    if (req.query.from || req.query.to) {
      filtro.timestamp = {};

      if (req.query.from) {
        const fromDate = new Date(req.query.from);
        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({ error: 'from no es una fecha válida (ISO 8601)' });
        }
        filtro.timestamp.$gte = fromDate;
      }

      if (req.query.to) {
        const toDate = new Date(req.query.to);
        if (isNaN(toDate.getTime())) {
          return res.status(400).json({ error: 'to no es una fecha válida (ISO 8601)' });
        }
        filtro.timestamp.$lte = toDate;
      }
    }
    const viento = await Viento.find(filtro).sort({timestamp: -1});
    res.json(viento);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener Viento', details: err.message });
  }
}

async function getOne(req, res) {
  try {
    const viento = await Viento.findOne({ _id: req.params.id, deletedAt: null });
    if (!viento) return res.status(404).json({ error: 'Viento no encontrado' });
    res.json(viento);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener Viento', details: err.message });
  }
}

async function create(req, res) {
  try {
    const { velocidad, rafagas, direccion, sonda, timestamp } = req.body || {};

    // 1) Validación mínima
    if (velocidad == null || rafagas == null || !direccion || !sonda || !timestamp) {
      return res.status(400).json({
        error: 'Faltan campos: velocidad, rafagas, direccion, sonda, timestamp'
      });
    }

    // 2) Convertir timestamp a Date y validar
    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      return res.status(400).json({ error: 'timestamp no es válido (usa ISO 8601)' });
    }
    // 3) Crear con whitelist (sin aceptar campos extra)
    const viento = new Viento({
      velocidad,
      rafagas,
      direccion,
      sonda,
      timestamp: ts
    });

    await viento.save();
    res.status(201).json(viento);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear Viento', details: err.message });
  }
}

async function update(req, res) {
  try {
    const payload = { ...(req.body || {}) };
    // Evita que puedan "revivir" o borrar desde el PUT
    if ('deletedAt' in payload) delete payload.deletedAt;

    const updated = await Viento.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Viento no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar Viento', details: err.message });
  }
}

async function remove(req, res) {
  try {
    const viento = await Viento.findById(req.params.id);
    if (!viento || viento.deletedAt !== null) {
      return res.status(404).json({ error: 'Viento no encontrado' });
    }
    viento.deletedAt = new Date();
    await viento.save();

    res.json({ message: 'Viento eliminado (borrado logico)' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar Viento', details: err.message });
  }
}

async function min(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const doc = await Viento
      .findOne(built.filtro)
      .sort({ velocidad: 1 })
      .select('velocidad timestamp sonda');

    if (!doc) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    res.json({ metric: 'min', field: 'velocidad', value: doc.velocidad });
  } catch (err) {
    res.status(500).json({ error: 'Error en min', details: err.message });
  }
}

async function max(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const doc = await Viento
      .findOne(built.filtro)
      .sort({ velocidad: -1 })
      .select('velocidad timestamp sonda');

    if (!doc) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    res.json({ metric: 'max', field: 'velocidad', value: doc.velocidad });
  } catch (err) {
    res.status(500).json({ error: 'Error en max', details: err.message });
  }
}

async function avg(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const docs = await Viento.find(built.filtro).select('velocidad');

    if (docs.length === 0) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    const suma = docs.reduce((acc, d) => acc + d.velocidad, 0);
    const media = suma / docs.length;

    res.json({ metric: 'avg', field: 'velocidad', value: media, count: docs.length });
  } catch (err) {
    res.status(500).json({ error: 'Error en avg', details: err.message });
  }
}

async function median(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const docs = await Viento
      .find(built.filtro)
      .sort({ velocidad: 1 })
      .select('velocidad');

    const n = docs.length;
    if (n === 0) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    let mediana;
    if (n % 2 === 1) {
      // impar
      mediana = docs[Math.floor(n / 2)].velocidad;
    } else {
      // par
      const a = docs[n / 2 - 1].velocidad;
      const b = docs[n / 2].velocidad;
      mediana = (a + b) / 2;
    }

    res.json({ metric: 'median', field: 'velocidad', value: mediana, count: n });
  } catch (err) {
    res.status(500).json({ error: 'Error en median', details: err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove, min, max, avg, median };
