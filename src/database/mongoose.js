const mongoose = require('mongoose');

let isConnected = false;

async function connectMongoose() {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000),
    socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000)
  });

  isConnected = true;
  console.log('✅ Mongoose connected');
  return mongoose.connection;
}

module.exports = { connectMongoose };
