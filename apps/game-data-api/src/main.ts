import express from 'express';
import cors from 'cors';
import { JsonStorageService } from './database/json-storage.service';
import { GameRepository } from './repositories/game.repository';
import { createGameRouter } from './routes/game.routes';

const app = express();
const port = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize JSON storage
const storage = new JsonStorageService();
const gameRepository = new GameRepository(storage);

// Routes
app.use('/api/games', createGameRouter(gameRepository));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  },
);

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Game Data API listening at http://localhost:${port}/api`);
  console.log(`📊 JSON Storage ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // JSON storage auto-saves, no cleanup needed
    process.exit(0);
  });
});

export default app;
