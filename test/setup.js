const mongoose = require('mongoose');

beforeAll(async () => {
  const uri = process.env.MONGODB_URI; 
  if (!uri) throw new Error('Falta MONGO_URI en .env');

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});
