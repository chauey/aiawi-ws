import {
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
  ProductFeatureDto,
  ProductFeatureFlags,
  ProductMetricsDto,
  PricingTierDto,
  ProductCategory,
  ProductStatus,
  ProductRelationship,
} from '../shared/dtos/product.dto';
import { PagedResultDto } from '../shared/dtos/base.dto';
import {
  generateId,
  getCurrentTimestamp,
  JsonStorageService,
} from '../database/json-storage.service';

export class ProductRepository {
  constructor(private storage: JsonStorageService) {}

  // Create a new product
  create(dto: CreateProductDto, creatorId?: string): ProductDto {
    const now = getCurrentTimestamp();
    const product: ProductDto = {
      id: generateId(),
      creationTime: now,
      lastModificationTime: now,
      creatorId: creatorId || 'system',
      lastModifierId: creatorId || 'system',

      // Basic Info
      name: dto.name,
      slug: dto.slug || this.generateSlug(dto.name),
      tagline: dto.tagline || '',
      description: dto.description,
      logoUrl: dto.logoUrl,
      screenshotUrls: [],
      websiteUrl: dto.websiteUrl,

      // Classification
      category: dto.category,
      subcategory: dto.subcategory || ('Other' as any),
      platforms: dto.platforms || [],
      targetAudiences: dto.targetAudiences || [],
      relationship: dto.relationship,
      status: dto.status || ProductStatus.Concept,

      // Company
      companyId: dto.companyId,

      // Features
      featureFlags: {
        ...this.getDefaultFeatureFlags(),
        ...dto.featureFlags,
      },
      features: [],

      // Monetization
      monetizationModel: dto.monetizationModel || ('Freemium' as any),
      pricingTiers: [],
      hasFreeTier: true,

      // Metrics
      metrics: this.getDefaultMetrics(),

      // Analysis
      strengths: [],
      weaknesses: [],
      uniqueSellingPoints: [],
      lessonsLearned: [],

      // Competitive
      competitorIds: [],
      marketPosition: 'Niche',
      differentiators: [],

      // Strategic
      threatLevel: 'Low',
      priorityScore: 50,
      recommendedForStudy: false,
      replicationDifficulty: 'Medium',

      // Notes
      strategicNotes: '',
      technicalNotes: '',

      // Tags
      tags: dto.tags || [],
    };

    this.storage.create('products', product);
    return product;
  }

  // Update a product
  update(
    id: string,
    dto: UpdateProductDto,
    modifierId?: string,
  ): ProductDto | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const updated: ProductDto = {
      ...existing,
      ...dto,
      lastModificationTime: getCurrentTimestamp(),
      lastModifierId: modifierId || existing.lastModifierId,
      featureFlags: dto.featureFlags
        ? { ...existing.featureFlags, ...dto.featureFlags }
        : existing.featureFlags,
      metrics: dto.metrics
        ? { ...existing.metrics, ...dto.metrics }
        : existing.metrics,
    };

    this.storage.update('products', id, updated);
    return updated;
  }

  // Delete a product
  delete(id: string): boolean {
    return this.storage.delete('products', id);
  }

  // Get product by ID
  getById(id: string): ProductDto | null {
    return this.storage.getById<ProductDto>('products', id);
  }

  // Get products with filtering and paging
  getList(filter: ProductFilterDto): PagedResultDto<ProductDto> {
    let products = this.storage.getAll<ProductDto>('products');

    // Apply text filter
    if (filter.filter) {
      const searchTerm = filter.filter.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.tagline?.toLowerCase().includes(searchTerm) ||
          p.tags.some((t) => t.toLowerCase().includes(searchTerm)),
      );
    }

    // Apply category filter
    if (filter.category) {
      products = products.filter((p) => p.category === filter.category);
    }

    // Apply subcategory filter
    if (filter.subcategory) {
      products = products.filter((p) => p.subcategory === filter.subcategory);
    }

    // Apply platform filter
    if (filter.platform) {
      products = products.filter((p) => p.platforms.includes(filter.platform!));
    }

    // Apply target audience filter
    if (filter.targetAudience) {
      products = products.filter((p) =>
        p.targetAudiences.includes(filter.targetAudience!),
      );
    }

    // Apply relationship filter
    if (filter.relationship) {
      products = products.filter((p) => p.relationship === filter.relationship);
    }

    // Apply status filter
    if (filter.status) {
      products = products.filter((p) => p.status === filter.status);
    }

    // Apply monetization filter
    if (filter.monetizationModel) {
      products = products.filter(
        (p) => p.monetizationModel === filter.monetizationModel,
      );
    }

    // Apply company filter
    if (filter.companyId) {
      products = products.filter((p) => p.companyId === filter.companyId);
    }

    // Apply free tier filter
    if (filter.hasFreeTier !== undefined) {
      products = products.filter((p) => p.hasFreeTier === filter.hasFreeTier);
    }

    // Apply priority score filter
    if (filter.minPriorityScore !== undefined) {
      products = products.filter(
        (p) => p.priorityScore >= filter.minPriorityScore!,
      );
    }

    // Apply recommended filter
    if (filter.recommendedOnly) {
      products = products.filter((p) => p.recommendedForStudy);
    }

    // Apply tags filter
    if (filter.tags && filter.tags.length > 0) {
      products = products.filter((p) =>
        filter.tags!.some((tag) => p.tags.includes(tag)),
      );
    }

    // Apply feature flag filters
    if (filter.hasAI) {
      products = products.filter(
        (p) => p.featureFlags.hasAIGeneration || p.featureFlags.hasAIAssistant,
      );
    }
    if (filter.hasAPI) {
      products = products.filter((p) => p.featureFlags.hasAPI);
    }
    if (filter.hasMobileApp) {
      products = products.filter((p) => p.featureFlags.hasMobileApp);
    }

    // Get total count before paging
    const totalCount = products.length;

    // Apply sorting
    if (filter.sorting) {
      const [field, direction] = filter.sorting.split(' ');
      products.sort((a, b) => {
        const aVal = (a as any)[field];
        const bVal = (b as any)[field];
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return direction === 'desc' ? -cmp : cmp;
      });
    } else {
      // Default sort by priority score desc
      products.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    // Apply paging
    const skip = filter.skipCount || 0;
    const take = filter.maxResultCount || 10;
    products = products.slice(skip, skip + take);

    return {
      items: products,
      totalCount,
    };
  }

  // Add a feature to a product
  addFeature(
    productId: string,
    feature: Omit<
      ProductFeatureDto,
      'id' | 'productId' | 'creationTime' | 'lastModificationTime'
    >,
  ): ProductFeatureDto | null {
    const product = this.getById(productId);
    if (!product) return null;

    const now = getCurrentTimestamp();
    const newFeature: ProductFeatureDto = {
      id: generateId(),
      productId,
      creationTime: now,
      lastModificationTime: now,
      ...feature,
    };

    product.features.push(newFeature);
    this.storage.update('products', productId, product);
    return newFeature;
  }

  // Add a pricing tier
  addPricingTier(
    productId: string,
    tier: Omit<
      PricingTierDto,
      'id' | 'productId' | 'creationTime' | 'lastModificationTime'
    >,
  ): PricingTierDto | null {
    const product = this.getById(productId);
    if (!product) return null;

    const now = getCurrentTimestamp();
    const newTier: PricingTierDto = {
      id: generateId(),
      productId,
      creationTime: now,
      lastModificationTime: now,
      ...tier,
    };

    product.pricingTiers.push(newTier);
    this.storage.update('products', productId, product);
    return newTier;
  }

  // Update metrics
  updateMetrics(productId: string, metrics: Partial<ProductMetricsDto>): void {
    const product = this.getById(productId);
    if (!product) return;

    product.metrics = { ...product.metrics, ...metrics };
    product.lastModificationTime = getCurrentTimestamp();
    this.storage.update('products', productId, product);
  }

  // Get products by company
  getByCompany(companyId: string): ProductDto[] {
    return this.storage
      .getAll<ProductDto>('products')
      .filter((p) => p.companyId === companyId);
  }

  // Get competitors of a product
  getCompetitors(productId: string): ProductDto[] {
    const product = this.getById(productId);
    if (!product) return [];

    return product.competitorIds
      .map((id) => this.getById(id))
      .filter((p): p is ProductDto => p !== null);
  }

  // Helper: Generate URL slug
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Get default feature flags
  getDefaultFeatureFlags(): ProductFeatureFlags {
    return {
      // Core
      hasUserAccounts: false,
      hasTeams: false,
      hasRoles: false,
      hasPermissions: false,
      hasAPI: false,
      hasWebhooks: false,
      hasIntegrations: false,

      // Collaboration
      hasRealTimeCollab: false,
      hasChat: false,
      hasComments: false,
      hasSharing: false,

      // Content
      hasContentCreation: false,
      hasMediaUpload: false,
      hasTemplates: false,
      hasLibrary: false,

      // AI
      hasAIGeneration: false,
      hasAIAssistant: false,
      hasNaturalLanguage: false,
      hasAutomation: false,

      // Analytics
      hasAnalytics: false,
      hasReporting: false,
      hasDashboards: false,

      // Mobile
      hasMobileApp: false,
      hasOfflineMode: false,
      hasPushNotifications: false,

      // Monetization
      hasFreeTier: false,
      hasTrialPeriod: false,
      hasSubscription: false,
      hasMicroTransactions: false,

      // Security
      hasSSO: false,
      hasMFA: false,
      hasAuditLog: false,
      hasDataExport: false,

      // Gamification
      hasAchievements: false,
      hasLeaderboards: false,
      hasRewards: false,
      hasProgress: false,

      // Social
      hasSocialLogin: false,
      hasSocialSharing: false,
      hasCommunity: false,

      // Support
      hasLiveChat: false,
      hasKnowledgeBase: false,
      hasTicketSystem: false,
    };
  }

  // Get default metrics
  getDefaultMetrics(): ProductMetricsDto {
    return {
      totalUsers: 0,
      monthlyActiveUsers: 0,
      dailyActiveUsers: 0,
      newUsersMonthly: 0,
      averageSessionLength: 0,
      sessionsPerUser: 0,
      retentionDay1: 0,
      retentionDay7: 0,
      retentionDay30: 0,
      revenueMonthly: 0,
      revenueAnnual: 0,
      averageRevenuePerUser: 0,
      lifetimeValue: 0,
      conversionRate: 0,
      growthRateMonthly: 0,
      churnRate: 0,
      netPromoterScore: 0,
      featureAdoptionRate: 0,
      supportTicketsMonthly: 0,
      bugReportsMonthly: 0,
      averageRating: 0,
      reviewCount: 0,
    };
  }
}
