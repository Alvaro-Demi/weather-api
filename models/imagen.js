const mongoose = require('mongoose');

const imagenSchema = new mongoose.Schema({
  localizacion: { type: String, required: true },
  url: { type: String, required: true },
  timestamp: { type: Date, required: true },  // fecha+hora juntas
  deletedAt: { type: Date, default: null }

});

module.exports = mongoose.model('Imagen', imagenSchema);
