
const DatosAvanzados = require('../models/datosAvanzados'); // ajusta el nombre si lo creaste distinto
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

    const datos = await DatosAvanzados.find(filtro).sort({ timestamp: -1 });
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener datos avanzados', details: err.message });
  }
}


// GET /api/users/:id
async function getOne(req, res) {
  try {
    const datosAvanzados = await DatosAvanzados.findOne({ _id: req.params.id, deletedAt: null });
    if (!datosAvanzados) return res.status(404).json({ error: 'datos no encontrado' });
    res.json(datosAvanzados);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener datos', details: err.message });
  }
}

// POST /api/users
async function create(req, res) {
  try {
    const { presionAire, indiceUltravioleta, indicePolen, sonda, timestamp } = req.body || {};

    if (presionAire == null || indiceUltravioleta == null || indicePolen == null || !sonda || !timestamp) {
      return res.status(400).json({
        error: 'Faltan campos: presionAire, indiceUltravioleta, indicePolen, sonda, timestamp'
      });
    } const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      return res.status(400).json({ error: 'timestamp no es válido (ISO 8601)' });
    }

    const datosAvanzados = new DatosAvanzados({
      presionAire,
      indiceUltravioleta,
      indicePolen,
      sonda,
      timestamp: ts
    });

    await datosAvanzados.save();
    res.status(201).json(datosAvanzados);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear datos', details: err.message });
  }
}

// PUT /api/users/:id
async function update(req, res) {
  try {
    const payload = { ...(req.body || {}) };
    if ('deletedAt' in payload) delete payload.deletedAt;

    if (payload.timestamp) {
      const ts = new Date(payload.timestamp);
      if (isNaN(ts.getTime())) return res.status(400).json({ error: 'timestamp no es válido (ISO 8601)' });
      payload.timestamp = ts;
    }

    const updated = await DatosAvanzados.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Datos avanzados no encontrados' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar datos avanzados', details: err.message });
  }
}

// DELETE /api/users/:id
async function remove(req, res) {
  try {
    const dato = await DatosAvanzados.findOne({ _id: req.params.id, deletedAt: null });
    if (!dato) return res.status(404).json({ error: 'Datos avanzados no encontrados' });

    dato.deletedAt = new Date();
    await dato.save();

    res.json({ message: 'Datos avanzados eliminados (borrado lógico)' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar datos avanzados', details: err.message });
  }
}

// STATS sobre "presionAire"
async function min(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const doc = await DatosAvanzados.findOne(built.filtro).sort({ presionAire: 1 }).select('presionAire');
    if (!doc) return res.status(404).json({ error: 'No hay datos en ese intervalo' });
    res.json({ metric: 'min', field: 'presionAire', value: doc.presionAire });
  } catch (err) {
    res.status(500).json({ error: 'Error en min', details: err.message });
  }
}

async function max(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const doc = await DatosAvanzados.findOne(built.filtro).sort({ presionAire: -1 }).select('presionAire');
    if (!doc) return res.status(404).json({ error: 'No hay datos en ese intervalo' });
    res.json({ metric: 'max', field: 'presionAire', value: doc.presionAire });
  } catch (err) {
    res.status(500).json({ error: 'Error en max', details: err.message });
  }
}

async function avg(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const docs = await DatosAvanzados.find(built.filtro).select('presionAire');
    if (docs.length === 0) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    const suma = docs.reduce((acc, d) => acc + d.presionAire, 0);
    const media = suma / docs.length;

    res.json({ metric: 'avg', field: 'presionAire', value: media, count: docs.length });
  } catch (err) {
    res.status(500).json({ error: 'Error en avg', details: err.message });
  }
}

async function median(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const docs = await DatosAvanzados.find(built.filtro).sort({ presionAire: 1 }).select('presionAire');
    const n = docs.length;
    if (n === 0) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    let mediana;
    if (n % 2 === 1) {
      mediana = docs[Math.floor(n / 2)].presionAire;
    } else {
      const a = docs[n / 2 - 1].presionAire;
      const b = docs[n / 2].presionAire;
      mediana = (a + b) / 2;
    }

    res.json({ metric: 'median', field: 'presionAire', value: mediana, count: n });
  } catch (err) {
    res.status(500).json({ error: 'Error en median', details: err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove, min, max, avg, median };