import { Router, Request, Response } from 'express';
import { getStorage } from '../database/storage';
import {
  FeatureDto,
  ProductFeatureDto,
  FeatureMatrixDto,
  ProductSummaryDto,
} from '../shared/dtos/feature.dto';
import { ProductDto } from '../shared/dtos/product.dto';

const router = Router();
const storage = getStorage();

/**
 * GET /api/features
 * Get all features
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const features = storage.getCollection<FeatureDto>('features') || [];
    res.json({
      items: features,
      totalCount: features.length,
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

/**
 * GET /api/features/:id
 * Get single feature by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const features = storage.getCollection<FeatureDto>('features') || [];
    const feature = features.find(
      (f) => f.id === req.params.id || f.slug === req.params.id,
    );

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    res.json(feature);
  } catch (error) {
    console.error('Error fetching feature:', error);
    res.status(500).json({ error: 'Failed to fetch feature' });
  }
});

/**
 * GET /api/features/matrix
 * Get full feature matrix with products
 */
router.get('/matrix/view', (req: Request, res: Response) => {
  try {
    const features = storage.getCollection<FeatureDto>('features') || [];
    const productFeatures =
      storage.getCollection<ProductFeatureDto>('product-features') || [];
    const products = storage.getCollection<ProductDto>('products') || [];

    // Filter to relevant products (our games + key competitors)
    const relevantRelationships = ['Our Product', 'Competitor', 'Inspiration'];
    const relevantProducts = products
      .filter(
        (p) =>
          relevantRelationships.includes(p.relationship) &&
          p.category === 'Game',
      )
      .map(
        (p): ProductSummaryDto => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          relationship: p.relationship,
          status: p.status,
          category: p.category,
        }),
      );

    const matrix: FeatureMatrixDto = {
      features,
      products: relevantProducts,
      matrix: productFeatures,
    };

    res.json(matrix);
  } catch (error) {
    console.error('Error fetching feature matrix:', error);
    res.status(500).json({ error: 'Failed to fetch feature matrix' });
  }
});

/**
 * GET /api/features/product/:productId
 * Get features for a specific product
 */
router.get('/product/:productId', (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const productFeatures =
      storage.getCollection<ProductFeatureDto>('product-features') || [];
    const features = storage.getCollection<FeatureDto>('features') || [];

    const productFeatureMap = productFeatures.filter(
      (pf) => pf.productId === productId || pf.productId.includes(productId),
    );

    // Enrich with feature details
    const enriched = productFeatureMap.map((pf) => {
      const feature = features.find((f) => f.id === pf.featureId);
      return {
        ...pf,
        feature,
      };
    });

    res.json({
      items: enriched,
      totalCount: enriched.length,
    });
  } catch (error) {
    console.error('Error fetching product features:', error);
    res.status(500).json({ error: 'Failed to fetch product features' });
  }
});

/**
 * GET /api/features/comparison
 * Compare features across our products vs competitors
 */
router.get('/comparison/summary', (req: Request, res: Response) => {
  try {
    const features = storage.getCollection<FeatureDto>('features') || [];
    const productFeatures =
      storage.getCollection<ProductFeatureDto>('product-features') || [];
    const products = storage.getCollection<ProductDto>('products') || [];

    // Our products
    const ourProducts = products.filter(
      (p) => p.relationship === 'Our Product',
    );
    const competitorProducts = products.filter(
      (p) =>
        p.relationship === 'Competitor' || p.relationship === 'Inspiration',
    );

    // Calculate feature coverage
    const summary = features.map((feature) => {
      const ourImplementations = productFeatures.filter(
        (pf) =>
          pf.featureId === feature.id &&
          ourProducts.some(
            (p) => p.slug === pf.productId || p.id === pf.productId,
          ),
      );

      const competitorImplementations = productFeatures.filter(
        (pf) =>
          pf.featureId === feature.id &&
          competitorProducts.some(
            (p) => p.slug === pf.productId || p.id === pf.productId,
          ),
      );

      const implemented = ourImplementations.filter(
        (pf) => pf.status === 'Implemented',
      );
      const planned = ourImplementations.filter(
        (pf) => pf.status === 'Planned' || pf.status === 'In Progress',
      );
      const competitorHas = competitorImplementations.filter(
        (pf) => pf.status === 'Implemented',
      );

      return {
        feature,
        ourImplementedCount: implemented.length,
        ourPlannedCount: planned.length,
        competitorCount: competitorHas.length,
        gap: competitorHas.length > 0 && implemented.length === 0,
        shouldPrioritize:
          competitorHas.length >= 2 &&
          implemented.length === 0 &&
          feature.importance === 'Critical',
      };
    });

    // Sort by priority
    const prioritized = summary.sort((a, b) => {
      if (a.shouldPrioritize && !b.shouldPrioritize) return -1;
      if (!a.shouldPrioritize && b.shouldPrioritize) return 1;
      if (a.gap && !b.gap) return -1;
      if (!a.gap && b.gap) return 1;
      return b.competitorCount - a.competitorCount;
    });

    res.json({
      items: prioritized,
      totalCount: prioritized.length,
      stats: {
        totalFeatures: features.length,
        ourProductCount: ourProducts.length,
        competitorCount: competitorProducts.length,
        gapCount: prioritized.filter((s) => s.gap).length,
        prioritizeCount: prioritized.filter((s) => s.shouldPrioritize).length,
      },
    });
  } catch (error) {
    console.error('Error fetching comparison:', error);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
});

/**
 * POST /api/features
 * Create a new feature
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const features = storage.getCollection<FeatureDto>('features') || [];
    const newFeature: FeatureDto = {
      ...req.body,
      id: req.body.id || `feat-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    features.push(newFeature);
    storage.setCollection('features', features);

    res.status(201).json(newFeature);
  } catch (error) {
    console.error('Error creating feature:', error);
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

/**
 * PUT /api/features/:id
 * Update a feature
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const features = storage.getCollection<FeatureDto>('features') || [];
    const index = features.findIndex((f) => f.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    features[index] = {
      ...features[index],
      ...req.body,
      updatedAt: new Date(),
    };

    storage.setCollection('features', features);
    res.json(features[index]);
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

/**
 * POST /api/features/product-feature
 * Add/update product-feature mapping
 */
router.post('/product-feature', (req: Request, res: Response) => {
  try {
    const productFeatures =
      storage.getCollection<ProductFeatureDto>('product-features') || [];
    const { productId, featureId, ...data } = req.body;

    // Find existing or create new
    const existingIndex = productFeatures.findIndex(
      (pf) => pf.productId === productId && pf.featureId === featureId,
    );

    if (existingIndex >= 0) {
      productFeatures[existingIndex] = {
        ...productFeatures[existingIndex],
        ...data,
      };
    } else {
      productFeatures.push({ productId, featureId, ...data });
    }

    storage.setCollection('product-features', productFeatures);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error saving product-feature:', error);
    res.status(500).json({ error: 'Failed to save product-feature mapping' });
  }
});

export default router;
