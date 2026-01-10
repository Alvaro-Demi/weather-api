const mongoose = require('mongoose');

const vientoSchema = new mongoose.Schema({
  velocidad: { type: Number, required: true }, // km/h
  rafagas: { type: Number, required: true },   // km/h
  direccion: {
    type: String,
    required: true,
    enum: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  },
  sonda: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sonda',
    required: true
  },
  timestamp: { type: Date, required: true },   // fecha+hora juntas
  deletedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Viento', vientoSchema);
