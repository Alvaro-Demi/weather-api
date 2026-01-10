const mongoose = require('mongoose');

const infoGeneralSchema = new mongoose.Schema({
    temperaturaReal: { type: Number, required: true },
    sensacionTermica: { type: Number, required: true },
    cubiertaNubes: { type: String, required: true },
    sonda: { type: mongoose.Schema.Types.ObjectId, ref: 'Sonda', required: true },
    timestamp: { type: Date, required: true },
    deletedAt: { type: Date, default: null }
});
module.exports = mongoose.model('InfoGeneral', infoGeneralSchema);
