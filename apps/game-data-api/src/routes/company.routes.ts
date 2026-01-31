import express, { Router, Request, Response } from 'express';
import { CompanyRepository } from '../repositories/company.repository';
import { JsonStorageService } from '../database/json-storage.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyFilterDto,
  CompanyType,
  CompanyRelationship,
  CompanySize,
  CompanyStage,
} from '../shared/dtos/company.dto';

const router: Router = express.Router();
const storage = new JsonStorageService();
const companyRepo = new CompanyRepository(storage);

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         companyType:
 *           type: string
 *           enum: [Software Company, EdTech, SaaS, Game Studio, AI Company, Productivity, Family Tech, etc.]
 *         relationship:
 *           type: string
 *           enum: [Our Company, Competitor, Partner, Reference, Prospect, Vendor]
 *         size:
 *           type: string
 *         stage:
 *           type: string
 *     CreateCompany:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - companyType
 *         - relationship
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         companyType:
 *           type: string
 *         relationship:
 *           type: string
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies with filtering and paging
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Text search filter
 *       - in: query
 *         name: companyType
 *         schema:
 *           type: string
 *         description: Company type filter
 *       - in: query
 *         name: relationship
 *         schema:
 *           type: string
 *         description: Relationship type filter
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         description: Company size filter
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *         description: Funding stage filter
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Country filter
 *       - in: query
 *         name: skipCount
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxResultCount
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paged list of companies
 */
router.get('/', (req: Request, res: Response) => {
  const filter: CompanyFilterDto = {
    filter: req.query.filter as string,
    companyType: req.query.companyType as CompanyType,
    relationship: req.query.relationship as CompanyRelationship,
    size: req.query.size as CompanySize,
    stage: req.query.stage as CompanyStage,
    minFunding: req.query.minFunding
      ? parseFloat(req.query.minFunding as string)
      : undefined,
    maxFunding: req.query.maxFunding
      ? parseFloat(req.query.maxFunding as string)
      : undefined,
    minEmployees: req.query.minEmployees
      ? parseInt(req.query.minEmployees as string)
      : undefined,
    maxEmployees: req.query.maxEmployees
      ? parseInt(req.query.maxEmployees as string)
      : undefined,
    country: req.query.country as string,
    isPublic:
      req.query.isPublic === 'true'
        ? true
        : req.query.isPublic === 'false'
          ? false
          : undefined,
    tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    skipCount: parseInt(req.query.skipCount as string) || 0,
    maxResultCount: parseInt(req.query.maxResultCount as string) || 10,
    sorting: req.query.sorting as string,
  };

  const result = companyRepo.getList(filter);
  res.json(result);
});

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get a company by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company details
 *       404:
 *         description: Company not found
 */
router.get('/:id', (req: Request, res: Response) => {
  const company = companyRepo.getById(req.params.id);
  if (!company) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }
  res.json(company);
});

/**
 * @swagger
 * /api/companies/slug/{slug}:
 *   get:
 *     summary: Get a company by slug
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company details
 *       404:
 *         description: Company not found
 */
router.get('/slug/:slug', (req: Request, res: Response) => {
  const company = companyRepo.getBySlug(req.params.slug);
  if (!company) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }
  res.json(company);
});

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompany'
 *     responses:
 *       201:
 *         description: Company created
 */
router.post('/', (req: Request, res: Response) => {
  const dto: CreateCompanyDto = req.body;
  const company = companyRepo.create(dto);
  res.status(201).json(company);
});

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Update a company
 *     tags: [Companies]
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
 *         description: Company updated
 *       404:
 *         description: Company not found
 */
router.put('/:id', (req: Request, res: Response) => {
  const dto: UpdateCompanyDto = req.body;
  const company = companyRepo.update(req.params.id, dto);
  if (!company) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }
  res.json(company);
});

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Delete a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Company deleted
 *       404:
 *         description: Company not found
 */
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = companyRepo.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }
  res.status(204).send();
});

/**
 * @swagger
 * /api/companies/{id}/products/{productId}:
 *   post:
 *     summary: Link a product to a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product linked
 */
router.post('/:id/products/:productId', (req: Request, res: Response) => {
  const success = companyRepo.addProduct(req.params.id, req.params.productId);
  if (!success) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }
  res.json({ success: true });
});

/**
 * @swagger
 * /api/companies/{id}/products/{productId}:
 *   delete:
 *     summary: Unlink a product from a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product unlinked
 */
router.delete('/:id/products/:productId', (req: Request, res: Response) => {
  const success = companyRepo.removeProduct(
    req.params.id,
    req.params.productId,
  );
  if (!success) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }
  res.json({ success: true });
});

/**
 * @swagger
 * /api/companies/{id}/competitors/{competitorId}:
 *   post:
 *     summary: Add a competitor to a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: competitorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Competitor added
 */
router.post('/:id/competitors/:competitorId', (req: Request, res: Response) => {
  const success = companyRepo.addCompetitor(
    req.params.id,
    req.params.competitorId,
  );
  if (!success) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }
  res.json({ success: true });
});

/**
 * @swagger
 * /api/companies/{id}/competitors:
 *   get:
 *     summary: Get competitors of a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of competitor companies
 */
router.get('/:id/competitors', (req: Request, res: Response) => {
  const competitors = companyRepo.getCompetitors(req.params.id);
  res.json(competitors);
});

/**
 * @swagger
 * /api/companies/{id}/metrics:
 *   patch:
 *     summary: Update company metrics
 *     tags: [Companies]
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
  companyRepo.updateMetrics(req.params.id, req.body);
  const company = companyRepo.getById(req.params.id);
  res.json(company);
});

/**
 * @swagger
 * /api/companies/types:
 *   get:
 *     summary: Get all company types
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: List of company types
 */
router.get('/meta/types', (_req: Request, res: Response) => {
  res.json(Object.values(CompanyType));
});

export default router;
