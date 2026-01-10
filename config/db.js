// config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // para leer la URI de .env

async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado correctamente a MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
  }
}

module.exports = conectarDB;

