import express, { Router, Request, Response } from 'express';
import { ProductRepository } from '../repositories/product.repository';
import { JsonStorageService } from '../database/json-storage.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
  ProductCategory,
} from '../shared/dtos/product.dto';

const router: Router = express.Router();
const storage = new JsonStorageService();
const productRepo = new ProductRepository(storage);

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         tagline:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [Game, Online Course, SaaS Application, AI Agent, Productivity Tool, Family App, etc.]
 *         relationship:
 *           type: string
 *           enum: [Our Product, Competitor, Complementary, Inspiration, Reference]
 *         status:
 *           type: string
 *         priorityScore:
 *           type: number
 *     CreateProduct:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - category
 *         - relationship
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         relationship:
 *           type: string
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filtering and paging
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Text search filter
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Product category filter
 *       - in: query
 *         name: relationship
 *         schema:
 *           type: string
 *         description: Relationship type filter
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: Filter by company
 *       - in: query
 *         name: hasAI
 *         schema:
 *           type: boolean
 *         description: Filter products with AI features
 *       - in: query
 *         name: recommendedOnly
 *         schema:
 *           type: boolean
 *         description: Only return recommended products
 *       - in: query
 *         name: skipCount
 *         schema:
 *           type: integer
 *         description: Number of items to skip
 *       - in: query
 *         name: maxResultCount
 *         schema:
 *           type: integer
 *         description: Maximum number of items to return
 *     responses:
 *       200:
 *         description: Paged list of products
 */
router.get('/', (req: Request, res: Response) => {
  const filter: ProductFilterDto = {
    filter: req.query.filter as string,
    category: req.query.category as ProductCategory,
    relationship: req.query.relationship as any,
    status: req.query.status as any,
    monetizationModel: req.query.monetizationModel as any,
    companyId: req.query.companyId as string,
    hasFreeTier:
      req.query.hasFreeTier === 'true'
        ? true
        : req.query.hasFreeTier === 'false'
          ? false
          : undefined,
    hasAI: req.query.hasAI === 'true',
    hasAPI: req.query.hasAPI === 'true',
    hasMobileApp: req.query.hasMobileApp === 'true',
    minPriorityScore: req.query.minPriorityScore
      ? parseInt(req.query.minPriorityScore as string)
      : undefined,
    recommendedOnly: req.query.recommendedOnly === 'true',
    tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    skipCount: parseInt(req.query.skipCount as string) || 0,
    maxResultCount: parseInt(req.query.maxResultCount as string) || 10,
    sorting: req.query.sorting as string,
  };

  const result = productRepo.getList(filter);
  res.json(result);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id', (req: Request, res: Response) => {
  const product = productRepo.getById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProduct'
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', (req: Request, res: Response) => {
  const dto: CreateProductDto = req.body;
  const product = productRepo.create(dto);
  res.status(201).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.put('/:id', (req: Request, res: Response) => {
  const dto: UpdateProductDto = req.body;
  const product = productRepo.update(req.params.id, dto);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = productRepo.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.status(204).send();
});

/**
 * @swagger
 * /api/products/{id}/features:
 *   post:
 *     summary: Add a feature to a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Feature added
 *       404:
 *         description: Product not found
 */
router.post('/:id/features', (req: Request, res: Response) => {
  const feature = productRepo.addFeature(req.params.id, req.body);
  if (!feature) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.status(201).json(feature);
});

/**
 * @swagger
 * /api/products/{id}/pricing-tiers:
 *   post:
 *     summary: Add a pricing tier to a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Pricing tier added
 */
router.post('/:id/pricing-tiers', (req: Request, res: Response) => {
  const tier = productRepo.addPricingTier(req.params.id, req.body);
  if (!tier) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.status(201).json(tier);
});

/**
 * @swagger
 * /api/products/{id}/metrics:
 *   patch:
 *     summary: Update product metrics
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Metrics updated
 */
router.patch('/:id/metrics', (req: Request, res: Response) => {
  productRepo.updateMetrics(req.params.id, req.body);
  const product = productRepo.getById(req.params.id);
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}/competitors:
 *   get:
 *     summary: Get competitors of a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of competitor products
 */
router.get('/:id/competitors', (req: Request, res: Response) => {
  const competitors = productRepo.getCompetitors(req.params.id);
  res.json(competitors);
});

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of product categories
 */
router.get('/meta/categories', (_req: Request, res: Response) => {
  res.json(Object.values(ProductCategory));
});

export default router;
