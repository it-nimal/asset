import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // 1. Try Connecting to MongoDB (Atlas or local instance) if configured
  if (uri) {
    try {
      const conn = await mongoose.connect(uri, {
        family: 4,
        tlsAllowInvalidCertificates: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Connected successfully to database: ${conn.connection.host}`);
      return true;
    } catch (error) {
      console.warn(`[MongoDB] Connection to MONGO_URI failed (${error.message}).`);
      console.log(`[MongoDB] Initializing resilient local embedded database fallback...`);
    }
  }

  // 2. Resilient Auto-Local Fallback (Never leaves user offline)
  try {
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: { dbName: 'asset_mgmt' },
      autoStart: true,
      timeout: 30000,
    });
    const localUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(localUri);
    console.log(`[MongoDB] Local Embedded Database running & connected: ${localUri}`);
    return true;
  } catch (localError) {
    console.error(`[MongoDB] Failed to start local database:`, localError.message);
    return false;
  }
};

export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};
