import express, { Router, Request, Response } from 'express';
import {
  MarketAnalysisRepository,
  MarketSegmentFilterDto,
  CampaignFilterDto,
  FeatureRequestFilterDto,
} from '../repositories/market-analysis.repository';
import { getStorage } from '../database/storage';
import {
  CampaignStatus,
  FeatureStatus,
  FeaturePriority,
} from '../shared/dtos/market-analysis.dto';

const router: Router = express.Router();
const storage = getStorage();
const marketRepo = new MarketAnalysisRepository(storage);

// =================================
// MARKET SEGMENTS
// =================================

/**
 * @swagger
 * /api/market/segments:
 *   get:
 *     summary: Get all market segments
 *     tags: [Market Analysis]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *       - in: query
 *         name: minTAM
 *         schema:
 *           type: number
 *       - in: query
 *         name: minGrowthRate
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of market segments
 */
router.get('/segments', (req: Request, res: Response) => {
  const filter: MarketSegmentFilterDto = {
    filter: req.query.filter as string,
    minTAM: req.query.minTAM
      ? parseFloat(req.query.minTAM as string)
      : undefined,
    minGrowthRate: req.query.minGrowthRate
      ? parseFloat(req.query.minGrowthRate as string)
      : undefined,
    competitionLevel: req.query.competitionLevel as string,
    skipCount: parseInt(req.query.skipCount as string) || 0,
    maxResultCount: parseInt(req.query.maxResultCount as string) || 10,
  };
  const result = marketRepo.getMarketSegments(filter);
  res.json(result);
});

/**
 * @swagger
 * /api/market/segments:
 *   post:
 *     summary: Create a market segment
 *     tags: [Market Analysis]
 */
router.post('/segments', (req: Request, res: Response) => {
  const segment = marketRepo.createMarketSegment(req.body);
  res.status(201).json(segment);
});

/**
 * @swagger
 * /api/market/segments/{id}:
 *   get:
 *     summary: Get a market segment by ID
 *     tags: [Market Analysis]
 */
router.get('/segments/:id', (req: Request, res: Response) => {
  const segment = marketRepo.getMarketSegmentById(req.params.id);
  if (!segment) {
    res.status(404).json({ error: 'Market segment not found' });
    return;
  }
  res.json(segment);
});

// =================================
// MARKETING CAMPAIGNS
// =================================

/**
 * @swagger
 * /api/market/campaigns:
 *   get:
 *     summary: Get all marketing campaigns
 *     tags: [Market Analysis]
 */
router.get('/campaigns', (req: Request, res: Response) => {
  const filter: CampaignFilterDto = {
    filter: req.query.filter as string,
    status: req.query.status as CampaignStatus,
    productId: req.query.productId as string,
    minBudget: req.query.minBudget
      ? parseFloat(req.query.minBudget as string)
      : undefined,
    maxBudget: req.query.maxBudget
      ? parseFloat(req.query.maxBudget as string)
      : undefined,
    skipCount: parseInt(req.query.skipCount as string) || 0,
    maxResultCount: parseInt(req.query.maxResultCount as string) || 10,
  };
  const result = marketRepo.getCampaigns(filter);
  res.json(result);
});

/**
 * @swagger
 * /api/market/campaigns:
 *   post:
 *     summary: Create a marketing campaign
 *     tags: [Market Analysis]
 */
router.post('/campaigns', (req: Request, res: Response) => {
  const campaign = marketRepo.createCampaign(req.body);
  res.status(201).json(campaign);
});

/**
 * @swagger
 * /api/market/campaigns/{id}:
 *   get:
 *     summary: Get a campaign by ID
 *     tags: [Market Analysis]
 */
router.get('/campaigns/:id', (req: Request, res: Response) => {
  const campaign = marketRepo.getCampaignById(req.params.id);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  res.json(campaign);
});

/**
 * @swagger
 * /api/market/campaigns/{id}/metrics:
 *   patch:
 *     summary: Update campaign metrics
 *     tags: [Market Analysis]
 */
router.patch('/campaigns/:id/metrics', (req: Request, res: Response) => {
  const success = marketRepo.updateCampaignMetrics(req.params.id, req.body);
  if (!success) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  const campaign = marketRepo.getCampaignById(req.params.id);
  res.json(campaign);
});

// =================================
// FEATURE REQUESTS
// =================================

/**
 * @swagger
 * /api/market/features:
 *   get:
 *     summary: Get all feature requests (sorted by RICE score)
 *     tags: [Market Analysis]
 */
router.get('/features', (req: Request, res: Response) => {
  const filter: FeatureRequestFilterDto = {
    filter: req.query.filter as string,
    status: req.query.status as FeatureStatus,
    priority: req.query.priority as FeaturePriority,
    productId: req.query.productId as string,
    minRiceScore: req.query.minRiceScore
      ? parseFloat(req.query.minRiceScore as string)
      : undefined,
    skipCount: parseInt(req.query.skipCount as string) || 0,
    maxResultCount: parseInt(req.query.maxResultCount as string) || 10,
  };
  const result = marketRepo.getFeatureRequests(filter);
  res.json(result);
});

/**
 * @swagger
 * /api/market/features:
 *   post:
 *     summary: Create a feature request (auto-calculates RICE score)
 *     tags: [Market Analysis]
 */
router.post('/features', (req: Request, res: Response) => {
  const feature = marketRepo.createFeatureRequest(req.body);
  res.status(201).json(feature);
});

/**
 * @swagger
 * /api/market/features/{id}:
 *   get:
 *     summary: Get a feature request by ID
 *     tags: [Market Analysis]
 */
router.get('/features/:id', (req: Request, res: Response) => {
  const feature = marketRepo.getFeatureRequestById(req.params.id);
  if (!feature) {
    res.status(404).json({ error: 'Feature request not found' });
    return;
  }
  res.json(feature);
});

/**
 * @swagger
 * /api/market/features/{id}/status:
 *   patch:
 *     summary: Update feature request status
 *     tags: [Market Analysis]
 */
router.patch('/features/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const success = marketRepo.updateFeatureStatus(req.params.id, status);
  if (!success) {
    res.status(404).json({ error: 'Feature request not found' });
    return;
  }
  const feature = marketRepo.getFeatureRequestById(req.params.id);
  res.json(feature);
});

// =================================
// COMPETITIVE ANALYSIS
// =================================

/**
 * @swagger
 * /api/market/competitive:
 *   get:
 *     summary: Get all competitive analyses
 *     tags: [Market Analysis]
 */
router.get('/competitive', (_req: Request, res: Response) => {
  const analyses = marketRepo.getCompetitiveAnalyses();
  res.json({ items: analyses, totalCount: analyses.length });
});

/**
 * @swagger
 * /api/market/competitive:
 *   post:
 *     summary: Create a competitive analysis
 *     tags: [Market Analysis]
 */
router.post('/competitive', (req: Request, res: Response) => {
  const analysis = marketRepo.createCompetitiveAnalysis(req.body);
  res.status(201).json(analysis);
});

/**
 * @swagger
 * /api/market/competitive/product/{productId}:
 *   get:
 *     summary: Get competitive analysis for a product
 *     tags: [Market Analysis]
 */
router.get('/competitive/product/:productId', (req: Request, res: Response) => {
  const analysis = marketRepo.getCompetitiveAnalysisByProductId(
    req.params.productId,
  );
  if (!analysis) {
    res.status(404).json({ error: 'Competitive analysis not found' });
    return;
  }
  res.json(analysis);
});

// =================================
// ANALYTICS & INSIGHTS
// =================================

/**
 * @swagger
 * /api/market/analytics/overview:
 *   get:
 *     summary: Get market overview analytics
 *     tags: [Market Analysis]
 */
router.get('/analytics/overview', (_req: Request, res: Response) => {
  const overview = marketRepo.getMarketOverview();
  res.json(overview);
});

/**
 * @swagger
 * /api/market/analytics/campaigns:
 *   get:
 *     summary: Get campaign performance analytics
 *     tags: [Market Analysis]
 */
router.get('/analytics/campaigns', (_req: Request, res: Response) => {
  const performance = marketRepo.getCampaignPerformance();
  res.json(performance);
});

/**
 * @swagger
 * /api/market/analytics/features:
 *   get:
 *     summary: Get feature backlog analytics
 *     tags: [Market Analysis]
 */
router.get('/analytics/features', (_req: Request, res: Response) => {
  const backlog = marketRepo.getFeatureBacklog();
  res.json(backlog);
});

// =================================
// META ENDPOINTS
// =================================

router.get('/meta/campaign-statuses', (_req: Request, res: Response) => {
  res.json(Object.values(CampaignStatus));
});

router.get('/meta/feature-statuses', (_req: Request, res: Response) => {
  res.json(Object.values(FeatureStatus));
});

router.get('/meta/feature-priorities', (_req: Request, res: Response) => {
  res.json(Object.values(FeaturePriority));
});

export default router;
