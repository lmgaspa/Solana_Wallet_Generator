const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://btcex:dianalila@cluster0.y37vilu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'DianaExchange';

let client;
let db;

async function connectToDatabase() {
  try {
    if (!client) {
      client = new MongoClient(url, {
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        useNewUrlParser: true, // Aviso de depreciação, mas ainda necessário para versões anteriores
        useUnifiedTopology: true // Aviso de depreciação, mas necessário para conexão moderna
      });
      
      await client.connect();
      console.log('Connected successfully to MongoDB server');
    }

    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err; // Rethrow the error to be handled by the caller
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not connected. Please call connectToDatabase first.');
  }
  return db;
}

async function closeDatabase() {
  try {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  } catch (err) {
    console.error('Error closing MongoDB client:', err);
    throw err; // Rethrow the error to be handled by the caller
  }
}

module.exports = {
  connectToDatabase,
  getDb,
  closeDatabase
};