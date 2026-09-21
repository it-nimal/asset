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

// API Routes
app.use('/api/assets', assetRoutes);
app.use('/api', assetRoutes);

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
      console.log(`[Express] Connected to database with ${count} assets.`);
      if (count === 0) {
        console.log('[Express] Initializing database with company asset roster...');
        const { feedRealUserData } = await import('./seed/feedUserData.js');
        await feedRealUserData();
      }
    } catch (e) {
      console.warn('[Express] Database check warning:', e.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `[Express] Server running on http://0.0.0.0:${PORT} (Access on: http://192.168.8.123:${PORT} / http://localhost:${PORT}) in ${
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
