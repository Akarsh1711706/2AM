import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { initSchema } from './db/postgres';
import { getRedis } from './db/redis';
import { registerSocketHandlers } from './events/socketHandlers';

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: config.corsOrigins,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

app.use(helmet());
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register Socket.io handlers
registerSocketHandlers(io);

const start = async () => {
  try {
    // Initialize database connections
    await getRedis();
    try {
      await initSchema();
    } catch (err) {
      console.warn('[Startup] Postgres schema init failed (may be unavailable):', err);
    }

    httpServer.listen(config.port, () => {
      console.log(`[Server] 2AM backend running on port ${config.port}`);
      console.log(`[Server] Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('[Startup] Failed to start server:', err);
    process.exit(1);
  }
};

start();
