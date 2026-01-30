import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { JsonStorageService } from './database/json-storage.service';
import { GameRepository } from './repositories/game.repository';
import { createGameRouter } from './routes/game.routes';
import { swaggerSpec } from './swagger/swagger.config';

const app = express();
const port = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize JSON storage
const storage = new JsonStorageService();
const gameRepository = new GameRepository(storage);

// Swagger UI
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Game Data API Documentation',
  }),
);

// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/games', createGameRouter(gameRepository));

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check endpoint
 *     description: Returns the API health status and current timestamp
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
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
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
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
