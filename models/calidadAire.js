const mongoose = require('mongoose');

const calidadAireSchema = new mongoose.Schema({
  indice: { type: Number, required: true }, // 0-100
  ozono: { type: Number, required: true }, // ppb
  particulasPequenas: { type: Number, required: true }, // µg/m3
  particulasGrandes: { type: Number, required: true },  // µg/m3
  dioxidoNitrogeno: { type: Number, required: true },   // ppb
  monoxidoCarbono: { type: Number, required: true },    // ppb
  dioxidoAzufre: { type: Number, required: true },      // ppb
  sonda: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sonda',
    required: true
  },
  timestamp: { type: Date, required: true },
  deletedAt: { type: Date, default: null }
});

module.exports = mongoose.model('CalidadAire', calidadAireSchema);
