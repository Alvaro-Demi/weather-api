require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    const exists = await User.findOne({ username: 'admin' });
    if (exists) {
      console.log("⚠️ Ya existe el usuario admin");
      process.exit(0);
    }

    const hashed = await bcrypt.hash('1234', 10);

    await User.create({
      username: 'admin',
      fullName: 'Administrador',
      email: 'admin@aemet.local',
      password: hashed
    });

    console.log("✅ Usuario admin creado: admin / 1234");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
