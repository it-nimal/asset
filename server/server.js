import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, isDBConnected } from './config/db.js';
import assetRoutes from './routes/assetRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables reliably with absolute path
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware (Support large invoice photos and PDF uploads)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/assets', assetRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    port: PORT,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      connected: isDBConnected(),
      uri: process.env.MONGO_URI ? 'Configured' : 'Default',
    },
    service: 'Asset Management MERN API',
  });
});

// Serve frontend static build if available
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
} else {
  app.get('/', (req, res) => {
    res.send('MERN Asset Management API is running. Check /api/health for system status.');
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Connect to Database and start server
const startServer = async () => {
  try {
    const connected = await connectDB();

    if (!connected) {
      console.error('[Express] Database connection failed.');
      process.exit(1);
    }

    console.log('[Express] Database ready for asset management.');

    try {
      const { Asset } = await import('./models/Asset.js');
      const count = await Asset.countDocuments();

      if (count === 0) {
        const { feedRealUserData } = await import('./seed/feedUserData.js');
        console.log('[Real Data Ingestion] Starting import of 124 hardware systems...');
        await feedRealUserData();
        console.log('[Express] Auto-populated 124 company systems into database.');
      } else {
        console.log(`[Express] Connected to existing database with ${count} assets.`);
      }
    } catch (e) {
      console.warn('[Express] Auto-populate warning:', e.message);
    }

    app.listen(PORT, () => {
      console.log(
        `[Express] Server running on http://localhost:${PORT} in ${
          process.env.NODE_ENV || 'development'
        } mode`
      );
    });

  } catch (error) {
    console.error('[Express] Startup failed:', error);
    process.exit(1);
  }
};

startServer();

