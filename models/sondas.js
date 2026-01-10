const mongoose = require('mongoose');

const sondaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  localizacion: { type: String, required: true },
  deletedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Sonda', sondaSchema);
