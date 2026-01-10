const mongoose = require('mongoose');

const datosAvanzadosSchema = new mongoose.Schema({
  presionAire: { type: Number, required: true },        // milibares
  indiceUltravioleta: { type: Number, required: true }, // 0-10
  indicePolen: { type: Number, required: true },        // 0-100
  sonda: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sonda',
    required: true
  },
  timestamp: { type: Date, required: true },
  deletedAt: { type: Date, default: null }
});

module.exports = mongoose.model('DatosAvanzados', datosAvanzadosSchema);
