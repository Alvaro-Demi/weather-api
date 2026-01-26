
const Viento = require('../models/viento');
const { broadcast } = require('../ws/wsServer');
const Sonda = require('../models/sondas');

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
    const viento = await Viento.find(filtro).sort({ timestamp: -1 });
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

    // 4) Localización del evento (ciudad de la sonda)
    const location = await getLocationFromSondaId(viento.sonda);

    // 5) Construimos un filtro de stats (por sonda, y no borrados)
    const filtroStats = { deletedAt: null, sonda: viento.sonda };

    // 6) Calculamos stats actualizados
    const stats = await calcStats(filtroStats);

    // 7) Enviamos notificación PUSH por WebSocket
    broadcast(
      {
        type: 'notify',
        resource: 'viento',
        action: 'create',
        location,
        data: viento,
        stats
      },
      location // para que solo lo reciban suscritos a esa ciudad (o todos si no filtran)
    );

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

    const location = await getLocationFromSondaId(updated.sonda);
    const filtroStats = { deletedAt: null, sonda: updated.sonda };
    const stats = await calcStats(filtroStats);

    broadcast(
      {
        type: 'notify',
        resource: 'viento',
        action: 'update',
        location,
        data: updated,
        stats
      },
      location
    );

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

    const location = await getLocationFromSondaId(viento.sonda);
    const filtroStats = { deletedAt: null, sonda: viento.sonda };
    const stats = await calcStats(filtroStats);

    broadcast(
      {
        type: 'notify',
        resource: 'viento',
        action: 'delete',
        location,
        data: { _id: viento._id }, // basta con id si quieres
        stats
      },
      location
    );


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

// Calcula min/max/avg/median usando un filtro Mongoose ya construido.
// Esto lo usamos para notificaciones WS (sin depender de req/res).
async function calcStats(filtro) {
  // min
  const minDoc = await Viento.findOne(filtro).sort({ velocidad: 1 }).select('velocidad');
  // max
  const maxDoc = await Viento.findOne(filtro).sort({ velocidad: -1 }).select('velocidad');
  // avg + median necesitan lista
  const docs = await Viento.find(filtro).sort({ velocidad: 1 }).select('velocidad');

  const n = docs.length;
  if (n === 0) {
    return { min: null, max: null, avg: null, median: null, count: 0 };
  }

  const values = docs.map(d => d.velocidad);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const avg = sum / n;

  let median;
  if (n % 2 === 1) median = values[Math.floor(n / 2)];
  else median = (values[n / 2 - 1] + values[n / 2]) / 2;

  return {
    min: minDoc?.velocidad ?? null,
    max: maxDoc?.velocidad ?? null,
    avg: Number(avg.toFixed(2)),
    median,
    count: n
  };
}

// Dado un ObjectId de sonda, obtiene la localización (ciudad).
async function getLocationFromSondaId(sondaId) {
  if (!sondaId) return null;
  const s = await Sonda.findById(sondaId).select('localizacion').lean();
  return s?.localizacion || null;
}


module.exports = { getAll, getOne, create, update, remove, min, max, avg, median };
