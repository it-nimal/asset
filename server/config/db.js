import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const atlasUri = process.env.USE_ATLAS === 'true' ? process.env.MONGO_URI : null;

  // 1. Try Connecting to MongoDB Atlas if explicitly enabled
  if (atlasUri) {
    try {
      const conn = await mongoose.connect(atlasUri, {
        family: 4,
        tlsAllowInvalidCertificates: true,
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`[MongoDB Atlas] Connected successfully to Cloud: ${conn.connection.host}`);
      return true;
    } catch (atlasError) {
      console.warn(`[MongoDB Atlas] Cloud connection skipped (${atlasError.message}).`);
      console.log(`[MongoDB] Initializing local resilient database fallback...`);
    }
  }

  // 2. Resilient Auto-Local Fallback (Never leaves user offline)
  try {
    const binaryPath = 'D:\\User Data\\Desktop\\asset-mgmt\\.mongodb-binaries\\mongod-x64-win32-8.2.6.exe';
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: { dbName: 'asset_mgmt' },
      binary: { systemBinary: binaryPath },
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
