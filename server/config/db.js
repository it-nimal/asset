import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is always loaded regardless of execution working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

mongoose.set('autoIndex', false);

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const forceLocal = process.env.USE_LOCAL_DB === 'true';

  // 1. If not forced to local, try connecting to specified MONGO_URI (e.g. Atlas)
  if (!forceLocal && uri && !uri.includes('localhost') && !uri.includes('127.0.0.1')) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[MongoDB] Connecting to database (attempt ${attempt}/3)...`);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 15000,
          family: 4,
          autoIndex: false,
          maxPoolSize: 10,
        });
        // Probe ping and query to confirm connection is stable and not dropping
        await mongoose.connection.db.admin().ping();
        await mongoose.connection.db.collection('assets').findOne({});
        console.log(`[MongoDB] Connected successfully to database: ${conn.connection.host}`);
        return true;
      } catch (error) {
        console.warn(`[MongoDB] Attempt ${attempt} to connect failed: ${error.message}`);
        try { await mongoose.disconnect(); } catch (e) {}
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }
    console.log(`[MongoDB] Initializing resilient local persistent database fallback...`);
  }

  // 2. Local Persistent Database on Disk (.mongodb-data with wiredTiger)
  try {
    const dbPath = path.resolve(__dirname, '../../.mongodb-data');
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

    // Try starting on default port 27017 for Compass/GUI access, fallback to random free port
    try {
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'asset_mgmt',
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
          port: 27017,
        },
        autoStart: true,
        timeout: 30000,
      });
    } catch (portErr) {
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'asset_mgmt',
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
        },
        autoStart: true,
        timeout: 30000,
      });
    }

    const localUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(localUri, { autoIndex: false });
    console.log(`[MongoDB] Local Persistent Database running & connected: ${localUri}`);
    return true;
  } catch (localError) {
    console.error(`[MongoDB] Failed to start local database:`, localError.message);
    return false;
  }
};

export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};
