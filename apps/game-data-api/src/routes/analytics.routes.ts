import express, { Router, Request, Response } from 'express';
import { getStorage } from '../database/storage';
import { ProductRepository } from '../repositories/product.repository';
import { CompanyRepository } from '../repositories/company.repository';
import {
  ProductDto,
  ProductCategory,
  ProductRelationship,
} from '../shared/dtos/product.dto';
import {
  CompanyDto,
  CompanyType,
  CompanyRelationship,
} from '../shared/dtos/company.dto';

const router: Router = express.Router();
const storage = getStorage();
const productRepo = new ProductRepository(storage);
const companyRepo = new CompanyRepository(storage);

/**
 * Platform Analytics Dashboard
 * Comprehensive insights across all products and companies
 */

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get comprehensive dashboard analytics
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Complete platform analytics
 */
router.get('/dashboard', (_req: Request, res: Response) => {
  const products = productRepo.getList({ maxResultCount: 1000 });
  const companies = companyRepo.getList({ maxResultCount: 1000 });

  // Product stats
  const productsByCategory: Record<string, number> = {};
  const productsByRelationship: Record<string, number> = {};
  const productsByStatus: Record<string, number> = {};
  let totalPriorityScore = 0;
  let recommendedCount = 0;
  let aiProductsCount = 0;
  let freeTierCount = 0;

  products.items.forEach((p: ProductDto) => {
    productsByCategory[p.category] = (productsByCategory[p.category] || 0) + 1;
    productsByRelationship[p.relationship] =
      (productsByRelationship[p.relationship] || 0) + 1;
    productsByStatus[p.status] = (productsByStatus[p.status] || 0) + 1;
    totalPriorityScore += p.priorityScore;
    if (p.recommendedForStudy) recommendedCount++;
    if (p.featureFlags?.hasAIGeneration || p.featureFlags?.hasAIAssistant)
      aiProductsCount++;
    if (p.hasFreeTier) freeTierCount++;
  });

  // Company stats
  const companiesByType: Record<string, number> = {};
  const companiesByRelationship: Record<string, number> = {};
  const companiesByStage: Record<string, number> = {};
  const companiesBySize: Record<string, number> = {};
  let totalFunding = 0;
  let totalEmployees = 0;
  let publicCompanies = 0;

  companies.items.forEach((c: CompanyDto) => {
    companiesByType[c.companyType] = (companiesByType[c.companyType] || 0) + 1;
    companiesByRelationship[c.relationship] =
      (companiesByRelationship[c.relationship] || 0) + 1;
    companiesByStage[c.stage] = (companiesByStage[c.stage] || 0) + 1;
    companiesBySize[c.size] = (companiesBySize[c.size] || 0) + 1;
    totalFunding += c.funding?.totalFunding || 0;
    totalEmployees += c.funding?.employees || 0;
    if (c.funding?.isPublic) publicCompanies++;
  });

  // Top products by priority
  const topProducts = [...products.items]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 10)
    .map((p: ProductDto) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      priorityScore: p.priorityScore,
      relationship: p.relationship,
    }));

  // Top funded companies
  const topFundedCompanies = [...companies.items]
    .filter((c: CompanyDto) => c.funding?.totalFunding)
    .sort(
      (a, b) => (b.funding?.totalFunding || 0) - (a.funding?.totalFunding || 0),
    )
    .slice(0, 10)
    .map((c: CompanyDto) => ({
      id: c.id,
      name: c.name,
      type: c.companyType,
      funding: c.funding?.totalFunding,
      stage: c.stage,
    }));

  res.json({
    summary: {
      totalProducts: products.totalCount,
      totalCompanies: companies.totalCount,
      recommendedProducts: recommendedCount,
      competitorProducts:
        productsByRelationship[ProductRelationship.Competitor] || 0,
      aiProducts: aiProductsCount,
      freeTierProducts: freeTierCount,
      avgPriorityScore:
        products.totalCount > 0
          ? Math.round(totalPriorityScore / products.totalCount)
          : 0,
      totalFunding: totalFunding,
      totalEmployees: totalEmployees,
      publicCompanies: publicCompanies,
    },
    products: {
      byCategory: productsByCategory,
      byRelationship: productsByRelationship,
      byStatus: productsByStatus,
      topByPriority: topProducts,
    },
    companies: {
      byType: companiesByType,
      byRelationship: companiesByRelationship,
      byStage: companiesByStage,
      bySize: companiesBySize,
      topByFunding: topFundedCompanies,
    },
  });
});

/**
 * @swagger
 * /api/analytics/competitive-landscape:
 *   get:
 *     summary: Get competitive landscape analysis
 *     tags: [Analytics]
 */
router.get('/competitive-landscape', (_req: Request, res: Response) => {
  const products = productRepo.getList({ maxResultCount: 1000 });
  const companies = companyRepo.getList({ maxResultCount: 1000 });

  // Group competitors by category
  const competitorsByCategory: Record<
    string,
    { products: any[]; companies: any[] }
  > = {};

  products.items
    .filter(
      (p: ProductDto) => p.relationship === ProductRelationship.Competitor,
    )
    .forEach((p: ProductDto) => {
      if (!competitorsByCategory[p.category]) {
        competitorsByCategory[p.category] = { products: [], companies: [] };
      }
      competitorsByCategory[p.category].products.push({
        id: p.id,
        name: p.name,
        priorityScore: p.priorityScore,
        strengths: p.strengths,
        weaknesses: p.weaknesses,
        threatLevel: p.threatLevel,
      });
    });

  companies.items
    .filter(
      (c: CompanyDto) => c.relationship === CompanyRelationship.Competitor,
    )
    .forEach((c: CompanyDto) => {
      if (!competitorsByCategory[c.companyType]) {
        competitorsByCategory[c.companyType] = { products: [], companies: [] };
      }
      competitorsByCategory[c.companyType].companies.push({
        id: c.id,
        name: c.name,
        funding: c.funding?.totalFunding,
        threatLevel: c.threatLevel,
        strengths: c.strengths,
        weaknesses: c.weaknesses,
      });
    });

  // Threat level distribution
  const threatLevels: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
  products.items.forEach((p: ProductDto) => {
    if (p.threatLevel) {
      threatLevels[p.threatLevel] = (threatLevels[p.threatLevel] || 0) + 1;
    }
  });

  res.json({
    competitorsByCategory,
    threatLevelDistribution: threatLevels,
    totalCompetitors: {
      products: products.items.filter(
        (p: ProductDto) => p.relationship === ProductRelationship.Competitor,
      ).length,
      companies: companies.items.filter(
        (c: CompanyDto) => c.relationship === CompanyRelationship.Competitor,
      ).length,
    },
  });
});

/**
 * @swagger
 * /api/analytics/market-opportunity:
 *   get:
 *     summary: Get market opportunity analysis
 *     tags: [Analytics]
 */
router.get('/market-opportunity', (_req: Request, res: Response) => {
  const products = productRepo.getList({ maxResultCount: 1000 });

  // Identify market gaps (categories with few products)
  const productsByCategory: Record<string, number> = {};
  products.items.forEach((p: ProductDto) => {
    productsByCategory[p.category] = (productsByCategory[p.category] || 0) + 1;
  });

  const allCategories = Object.values(ProductCategory);
  const marketGaps = allCategories
    .filter((cat) => !productsByCategory[cat] || productsByCategory[cat] < 3)
    .map((cat) => ({
      category: cat,
      currentProducts: productsByCategory[cat] || 0,
      opportunity: 'High - Few tracked products in this category',
    }));

  // Products recommended for study not yet analyzed
  const studyTargets = products.items
    .filter((p: ProductDto) => p.recommendedForStudy && p.priorityScore >= 80)
    .map((p: ProductDto) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      priorityScore: p.priorityScore,
      uniqueSellingPoints: p.uniqueSellingPoints,
    }));

  // Inspiration products (good patterns to follow)
  const inspirationProducts = products.items
    .filter(
      (p: ProductDto) => p.relationship === ProductRelationship.Inspiration,
    )
    .map((p: ProductDto) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      strengths: p.strengths,
      lessonsLearned: p.lessonsLearned,
    }));

  res.json({
    marketGaps,
    studyTargets,
    inspirationProducts,
    categoryDistribution: productsByCategory,
  });
});

/**
 * @swagger
 * /api/analytics/pricing-analysis:
 *   get:
 *     summary: Get pricing analysis across products
 *     tags: [Analytics]
 */
router.get('/pricing-analysis', (_req: Request, res: Response) => {
  const products = productRepo.getList({ maxResultCount: 1000 });

  const pricingByCategory: Record<
    string,
    {
      count: number;
      freeTierCount: number;
      avgStartingPrice: number;
      priceRange: { min: number; max: number };
    }
  > = {};

  const pricingByModel: Record<string, number> = {};

  products.items.forEach((p: ProductDto) => {
    // By monetization model
    pricingByModel[p.monetizationModel] =
      (pricingByModel[p.monetizationModel] || 0) + 1;

    // By category
    if (!pricingByCategory[p.category]) {
      pricingByCategory[p.category] = {
        count: 0,
        freeTierCount: 0,
        avgStartingPrice: 0,
        priceRange: { min: Infinity, max: 0 },
      };
    }

    const cat = pricingByCategory[p.category];
    cat.count++;
    if (p.hasFreeTier) cat.freeTierCount++;
    if (p.startingPrice) {
      cat.avgStartingPrice += p.startingPrice;
      cat.priceRange.min = Math.min(cat.priceRange.min, p.startingPrice);
      cat.priceRange.max = Math.max(cat.priceRange.max, p.startingPrice);
    }
  });

  // Calculate averages
  Object.values(pricingByCategory).forEach((cat) => {
    if (cat.count > 0) {
      cat.avgStartingPrice = Math.round(cat.avgStartingPrice / cat.count);
    }
    if (cat.priceRange.min === Infinity) cat.priceRange.min = 0;
  });

  res.json({
    pricingByCategory,
    pricingByModel,
    summary: {
      totalWithFreeTier: products.items.filter((p: ProductDto) => p.hasFreeTier)
        .length,
      totalFreeTrials: products.items.filter(
        (p: ProductDto) => p.freeTrialDays && p.freeTrialDays > 0,
      ).length,
      avgFreeTrialDays: Math.round(
        products.items
          .filter((p: ProductDto) => p.freeTrialDays)
          .reduce((sum, p: ProductDto) => sum + (p.freeTrialDays || 0), 0) /
          (products.items.filter((p: ProductDto) => p.freeTrialDays).length ||
            1),
      ),
    },
  });
});

/**
 * @swagger
 * /api/analytics/tech-stack:
 *   get:
 *     summary: Get technology/platform analysis
 *     tags: [Analytics]
 */
router.get('/tech-stack', (_req: Request, res: Response) => {
  const products = productRepo.getList({ maxResultCount: 1000 });

  const platformDistribution: Record<string, number> = {};
  const featureAdoption: Record<string, number> = {};

  products.items.forEach((p: ProductDto) => {
    // Platforms
    p.platforms?.forEach((platform) => {
      platformDistribution[platform] =
        (platformDistribution[platform] || 0) + 1;
    });

    // Feature flags
    if (p.featureFlags) {
      Object.entries(p.featureFlags).forEach(([key, value]) => {
        if (value === true) {
          featureAdoption[key] = (featureAdoption[key] || 0) + 1;
        }
      });
    }
  });

  // Sort features by adoption
  const sortedFeatures = Object.entries(featureAdoption)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

  res.json({
    platformDistribution,
    featureAdoption: sortedFeatures,
    totalProducts: products.totalCount,
    multiPlatformProducts: products.items.filter(
      (p: ProductDto) => (p.platforms?.length || 0) > 2,
    ).length,
  });
});

/**
 * @swagger
 * /api/analytics/company-intelligence:
 *   get:
 *     summary: Get company intelligence summary
 *     tags: [Analytics]
 */
router.get('/company-intelligence', (_req: Request, res: Response) => {
  const companies = companyRepo.getList({ maxResultCount: 1000 });

  // Funding analysis
  const fundingByStage: Record<
    string,
    { count: number; totalFunding: number }
  > = {};
  const fundingByType: Record<string, { count: number; totalFunding: number }> =
    {};

  companies.items.forEach((c: CompanyDto) => {
    const funding = c.funding?.totalFunding || 0;

    if (!fundingByStage[c.stage]) {
      fundingByStage[c.stage] = { count: 0, totalFunding: 0 };
    }
    fundingByStage[c.stage].count++;
    fundingByStage[c.stage].totalFunding += funding;

    if (!fundingByType[c.companyType]) {
      fundingByType[c.companyType] = { count: 0, totalFunding: 0 };
    }
    fundingByType[c.companyType].count++;
    fundingByType[c.companyType].totalFunding += funding;
  });

  // Geographic distribution
  const byCountry: Record<string, number> = {};
  companies.items.forEach((c: CompanyDto) => {
    const country = c.contact?.country || 'Unknown';
    byCountry[country] = (byCountry[country] || 0) + 1;
  });

  // Partnership opportunities
  const partnershipCandidates = companies.items
    .filter(
      (c: CompanyDto) =>
        c.relationship === CompanyRelationship.Complementary ||
        (c.partnershipPotential && c.partnershipPotential >= 7),
    )
    .map((c: CompanyDto) => ({
      id: c.id,
      name: c.name,
      type: c.companyType,
      partnershipPotential: c.partnershipPotential,
      strengths: c.strengths,
    }));

  // Acquisition targets
  const acquisitionTargets = companies.items
    .filter((c: CompanyDto) => c.acquisitionTarget)
    .map((c: CompanyDto) => ({
      id: c.id,
      name: c.name,
      type: c.companyType,
      valuation: c.funding?.valuation,
      stage: c.stage,
    }));

  res.json({
    fundingAnalysis: {
      byStage: fundingByStage,
      byType: fundingByType,
    },
    geographicDistribution: byCountry,
    partnershipCandidates,
    acquisitionTargets,
  });
});

export default router;
