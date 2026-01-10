const mongoose = require('mongoose');

const precipitacionSchema = new mongoose.Schema({
  tipo: { type:String, required: true, enum: ['Agua', 'Nieve', 'Granizo']},
  probabilidad: { type:Number, required: true},
  acumulada: { type:Number, required: true},
  sonda: { type: mongoose.Schema.Types.ObjectId, ref: 'Sonda', required: true },
  timestamp: { type: Date, required: true },   // fecha+hora juntas
  deletedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Precipitacion', precipitacionSchema);
