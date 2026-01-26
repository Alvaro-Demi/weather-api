const { broadcast } = require('../ws/wsServer');
const Sonda = require('../models/sondas');

/**
 * Obtiene la ciudad (localizacion) a partir del ID de la sonda
 */
async function getLocationFromSondaId(sondaId) {
  if (!sondaId) return null;
  const s = await Sonda.findById(sondaId).select('localizacion').lean();
  return s?.localizacion || null;
}

/**
 * Calcula stats (min/max/avg/median) de un campo numérico de un modelo,
 * usando un filtro mongoose ya construido.
 */
async function calcStats(Model, filtro, field) {
  const minDoc = await Model.findOne(filtro).sort({ [field]: 1 }).select(field);
  const maxDoc = await Model.findOne(filtro).sort({ [field]: -1 }).select(field);

  const docs = await Model.find(filtro).sort({ [field]: 1 }).select(field).lean();
  const n = docs.length;

  if (n === 0) {
    return { min: null, max: null, avg: null, median: null, count: 0 };
  }

  const values = docs
    .map(d => d[field])
    .filter(v => typeof v === 'number');

  values.sort((a, b) => a - b);

  const min = minDoc ? minDoc[field] : values[0];
  const max = maxDoc ? maxDoc[field] : values[values.length - 1];
  const avg = values.reduce((acc, v) => acc + v, 0) / values.length;

  const mid = Math.floor(values.length / 2);
  const median = values.length % 2 === 0
    ? (values[mid - 1] + values[mid]) / 2
    : values[mid];

  return {
    min,
    max,
    avg: Number(avg.toFixed(2)),
    median,
    count: values.length
  };
}

/**
 * Función principal: manda notificación WS cuando cambia una medición.
 *
 * @param {object} params
 * @param {string} params.resource - nombre (ej: "viento", "humedad")
 * @param {"create"|"update"|"delete"} params.action
 * @param {object} params.doc - doc creado/actualizado/eliminado (o al menos { _id, sonda })
 * @param {import('mongoose').Model} params.Model - Mongoose model de la colección
 * @param {string} params.statsField - campo numérico a usar para stats (ej: "velocidad")
 */
async function notify({ resource, action, doc, Model, statsField }) {
  // 1) Localización del evento (ciudad) a partir de la sonda
  const location = await getLocationFromSondaId(doc.sonda);

  // 2) Filtro de stats:
  //    - siempre ignoramos borrados (soft delete)
  //    - si hay sonda, calculamos stats SOLO para esa sonda
  const filtroStats = { deletedAt: null };
  if (doc.sonda) filtroStats.sonda = doc.sonda;

  // 3) Stats actualizados
  const stats = await calcStats(Model, filtroStats, statsField);

  // 4) PUSH a clientes WS (respeta suscripción por ciudad)
  broadcast(
    {
      type: 'notify',
      resource,
      action,
      location,
      data: doc,
      stats
    },
    location
  );
}


module.exports = { notify };