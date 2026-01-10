const mongoose = require('mongoose');

const humedadSchema = new mongoose.Schema({
   humedad: { type: Number, required: true },       // %
  puntoRocio: { type: Number, required: true },    // ºC
  sonda: { type: mongoose.Schema.Types.ObjectId, ref: 'Sonda', require: true },
  timestamp: { type: Date, required: true },   // fecha+hora juntas
  deletedAt: { type: Date, default: null }

});

module.exports = mongoose.model('Humedad', humedadSchema);
