// models/user.js
const mongoose = require('mongoose');

// Definimos el esquema (estructura del documento en la BD)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // nombre de usuario
  fullName: { type: String, required: true },                // nombre completo
  description: { type: String },                             // descripción opcional
  email: { type: String, required: true, unique: true },     // correo electrónico
  password: { type: String, required: true },                 // contraseña
  deletedAt: { type: Date, default: null }
});

// Exportamos el modelo
module.exports = mongoose.model('User', userSchema);
