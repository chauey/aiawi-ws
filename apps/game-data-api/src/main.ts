import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { getStorage } from './database/storage';
import { GameRepository } from './repositories/game.repository';
import { createGameRouter } from './routes/game.routes';
import systemRoutes from './routes/system.routes';
import productRoutes from './routes/product.routes';
import companyRoutes from './routes/company.routes';
import { swaggerSpec } from './swagger/swagger.config';
import { seedProductDatabase } from './database/seed-products';

const app = express();
const port = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for dashboard
app.use(express.static(path.join(__dirname, '../public')));

// Initialize JSON storage (singleton)
const storage = getStorage();
const gameRepository = new GameRepository(storage);

// Seed data if database is empty
const products = storage.getAll('products');

if (products.length === 0) {
  console.log('📦 Database empty, seeding sample data...');
  seedProductDatabase(storage);
}

// Dashboard redirect
app.get('/', (_req, res) => {
  res.redirect('/dashboard.html');
});

// Swagger UI
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Product Intelligence API Documentation',
  }),
);

// Swagger JSON endpoint
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes - Legacy (Games)
app.use('/api/games', createGameRouter(gameRepository));

// Routes - New (Products & Companies)
app.use('/api/products', productRoutes);
app.use('/api/companies', companyRoutes);

// Routes - Systems Discovery
app.use('/api/systems', systemRoutes);

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
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * @openapi
 * /api/seed:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Seed sample data
 *     description: Seeds the database with sample companies and products
 *     responses:
 *       200:
 *         description: Data seeded successfully
 */
app.post('/api/seed', (_req, res) => {
  seedProductDatabase(storage);
  res.json({ success: true, message: 'Database seeded with sample data' });
});

// Error handling
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  },
);

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Product Intelligence API at http://localhost:${port}/api`);
  console.log(`📊 Dashboard at http://localhost:${port}/`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
