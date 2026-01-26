
const InfoGeneral = require('../models/infoGeneral.js'); // ajusta el nombre si lo creaste distinto
const { notify } = require('../utils/notify');

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

// GET /api/users
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

    const datos = await InfoGeneral.find(filtro).sort({ timestamp: -1 });
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener info general', details: err.message });
  }
}


// GET /api/users/:id
async function getOne(req, res) {
  try {
    const infoGeneral = await InfoGeneral.findOne({ _id: req.params.id, deletedAt: null });
    if (!infoGeneral) return res.status(404).json({ error: 'infoGeneral no encontrado' });
    res.json(infoGeneral);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener infoGeneral', details: err.message });
  }
}

// POST /api/users
async function create(req, res) {
  try {
    const { temperaturaReal, sensacionTermica, cubiertaNubes, sonda, timestamp } = req.body || {};

    if (temperaturaReal == null || sensacionTermica == null || !cubiertaNubes || !sonda || !timestamp) {
      return res.status(400).json({
        error: 'Faltan campos: temperaturaReal, sensacionTermica, cubiertaNubes, sonda, timestamp'
      });
    }

    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      return res.status(400).json({ error: 'timestamp no es válido (ISO 8601)' });
    }

    const dato = new InfoGeneral({
      temperaturaReal,
      sensacionTermica,
      cubiertaNubes,
      sonda,
      timestamp: ts
    });
    await dato.save();

    await notify({
      resource: 'infoGeneral',
      action: 'create',
      doc: dato,
      Model: InfoGeneral,
      statsField: 'temperaturaReal' // <- el campo numérico a analizar
    });

    res.status(201).json(dato);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear info general', details: err.message });
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

    const updated = await InfoGeneral.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Info general no encontrada' });

    await notify({
      resource: 'infoGeneral',
      action: 'update',
      doc: updated,
      Model: InfoGeneral,
      statsField: 'temperaturaReal'
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar info general', details: err.message });
  }
}

// DELETE /api/users/:id
async function remove(req, res) {
  try {
    const dato = await InfoGeneral.findOne({ _id: req.params.id, deletedAt: null });
    if (!dato) return res.status(404).json({ error: 'Info general no encontrada' });

    dato.deletedAt = new Date();
    await dato.save();

    await notify({
      resource: 'infoGeneral',
      action: 'delete',
      doc: dato,
      Model: InfoGeneral,
      statsField: 'temperaturaReal'
    });

    res.json({ message: 'Info general eliminada (borrado lógico)' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar info general', details: err.message });
  }
}

// STATS sobre campo "temperaturaReal"
async function min(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const doc = await InfoGeneral.findOne(built.filtro).sort({ temperaturaReal: 1 }).select('temperaturaReal');
    if (!doc) return res.status(404).json({ error: 'No hay datos en ese intervalo' });
    res.json({ metric: 'min', field: 'temperaturaReal', value: doc.temperaturaReal });
  } catch (err) {
    res.status(500).json({ error: 'Error en min', details: err.message });
  }
}

async function max(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const doc = await InfoGeneral.findOne(built.filtro).sort({ temperaturaReal: -1 }).select('temperaturaReal');
    if (!doc) return res.status(404).json({ error: 'No hay datos en ese intervalo' });
    res.json({ metric: 'max', field: 'temperaturaReal', value: doc.temperaturaReal });
  } catch (err) {
    res.status(500).json({ error: 'Error en max', details: err.message });
  }
}

async function avg(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const docs = await InfoGeneral.find(built.filtro).select('temperaturaReal');
    if (docs.length === 0) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    const suma = docs.reduce((acc, d) => acc + d.temperaturaReal, 0);
    const media = suma / docs.length;

    res.json({ metric: 'avg', field: 'temperaturaReal', value: media, count: docs.length });
  } catch (err) {
    res.status(500).json({ error: 'Error en avg', details: err.message });
  }
}

async function median(req, res) {
  const built = buildStatsFilter(req);
  if (built.error) return res.status(400).json({ error: built.error });

  try {
    const docs = await InfoGeneral.find(built.filtro).sort({ temperaturaReal: 1 }).select('temperaturaReal');
    const n = docs.length;
    if (n === 0) return res.status(404).json({ error: 'No hay datos en ese intervalo' });

    let mediana;
    if (n % 2 === 1) {
      mediana = docs[Math.floor(n / 2)].temperaturaReal;
    } else {
      const a = docs[n / 2 - 1].temperaturaReal;
      const b = docs[n / 2].temperaturaReal;
      mediana = (a + b) / 2;
    }

    res.json({ metric: 'median', field: 'temperaturaReal', value: mediana, count: n });
  } catch (err) {
    res.status(500).json({ error: 'Error en median', details: err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove, min, max, avg, median };