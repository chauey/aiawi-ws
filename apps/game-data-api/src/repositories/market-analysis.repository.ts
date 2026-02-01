import {
  JsonStorageService,
  generateId,
  getCurrentTimestamp,
} from '../database/json-storage.service';
import {
  MarketSegmentDto,
  MarketingCampaignDto,
  FeatureRequestDto,
  CompetitiveAnalysisDto,
  CampaignStatus,
  FeatureStatus,
  FeaturePriority,
} from '../shared/dtos/market-analysis.dto';
import { PagedResultDto, FilterDto } from '../shared/dtos/base.dto';

const MARKET_SEGMENTS_KEY = 'marketSegments';
const CAMPAIGNS_KEY = 'campaigns';
const FEATURE_REQUESTS_KEY = 'featureRequests';
const COMPETITIVE_ANALYSES_KEY = 'competitiveAnalyses';

export interface MarketSegmentFilterDto extends FilterDto {
  minTAM?: number;
  minGrowthRate?: number;
  competitionLevel?: string;
}

export interface CampaignFilterDto extends FilterDto {
  status?: CampaignStatus;
  productId?: string;
  minBudget?: number;
  maxBudget?: number;
}

export interface FeatureRequestFilterDto extends FilterDto {
  status?: FeatureStatus;
  priority?: FeaturePriority;
  productId?: string;
  minRiceScore?: number;
}

/**
 * Market Analysis Repository
 * Handles market segments, campaigns, feature requests, and competitive analysis
 */
export class MarketAnalysisRepository {
  // In-memory storage for market analysis data
  private marketSegments: MarketSegmentDto[] = [];
  private campaigns: MarketingCampaignDto[] = [];
  private featureRequests: FeatureRequestDto[] = [];
  private competitiveAnalyses: CompetitiveAnalysisDto[] = [];

  constructor(private storage: JsonStorageService) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    // Market analysis data stored in-memory for now
    // Could be extended to use JsonStorageService with additional collections
  }

  // ==========================================
  // MARKET SEGMENTS
  // ==========================================

  createMarketSegment(
    dto: Omit<MarketSegmentDto, 'id' | 'creationTime' | 'lastModificationTime'>,
  ): MarketSegmentDto {
    const segment: MarketSegmentDto = {
      id: generateId(),
      creationTime: getCurrentTimestamp(),
      lastModificationTime: getCurrentTimestamp(),
      ...dto,
    };
    this.marketSegments.push(segment);
    return segment;
  }

  getMarketSegments(
    filter: MarketSegmentFilterDto,
  ): PagedResultDto<MarketSegmentDto> {
    let items = [...this.marketSegments];

    if (filter.filter) {
      const search = filter.filter.toLowerCase();
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search),
      );
    }

    if (filter.minTAM) {
      items = items.filter((s) => s.totalAddressableMarket >= filter.minTAM!);
    }

    if (filter.minGrowthRate) {
      items = items.filter((s) => s.growthRateAnnual >= filter.minGrowthRate!);
    }

    if (filter.competitionLevel) {
      items = items.filter(
        (s) => s.competitionLevel === filter.competitionLevel,
      );
    }

    const totalCount = items.length;
    const skipCount = filter.skipCount || 0;
    const maxResultCount = filter.maxResultCount || 10;
    items = items.slice(skipCount, skipCount + maxResultCount);

    return { items, totalCount };
  }

  getMarketSegmentById(id: string): MarketSegmentDto | null {
    return this.marketSegments.find((s) => s.id === id) || null;
  }

  // ==========================================
  // MARKETING CAMPAIGNS
  // ==========================================

  createCampaign(
    dto: Omit<
      MarketingCampaignDto,
      'id' | 'creationTime' | 'lastModificationTime'
    >,
  ): MarketingCampaignDto {
    const campaign: MarketingCampaignDto = {
      id: generateId(),
      creationTime: getCurrentTimestamp(),
      lastModificationTime: getCurrentTimestamp(),
      ...dto,
    };
    this.campaigns.push(campaign);
    return campaign;
  }

  getCampaigns(
    filter: CampaignFilterDto,
  ): PagedResultDto<MarketingCampaignDto> {
    let items = [...this.campaigns];

    if (filter.filter) {
      const search = filter.filter.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search),
      );
    }

    if (filter.status) {
      items = items.filter((c) => c.status === filter.status);
    }

    if (filter.productId) {
      items = items.filter((c) => c.productId === filter.productId);
    }

    if (filter.minBudget) {
      items = items.filter((c) => c.budgetTotal >= filter.minBudget!);
    }

    if (filter.maxBudget) {
      items = items.filter((c) => c.budgetTotal <= filter.maxBudget!);
    }

    const totalCount = items.length;
    const skipCount = filter.skipCount || 0;
    const maxResultCount = filter.maxResultCount || 10;
    items = items.slice(skipCount, skipCount + maxResultCount);

    return { items, totalCount };
  }

  getCampaignById(id: string): MarketingCampaignDto | null {
    return this.campaigns.find((c) => c.id === id) || null;
  }

  updateCampaignMetrics(
    id: string,
    metrics: Partial<MarketingCampaignDto['metrics']>,
  ): boolean {
    const campaign = this.campaigns.find((c) => c.id === id);
    if (!campaign) return false;

    campaign.metrics = { ...campaign.metrics, ...metrics };
    campaign.lastModificationTime = getCurrentTimestamp();
    return true;
  }

  // ==========================================
  // FEATURE REQUESTS
  // ==========================================

  createFeatureRequest(
    dto: Omit<
      FeatureRequestDto,
      'id' | 'creationTime' | 'lastModificationTime' | 'riceScore'
    >,
  ): FeatureRequestDto {
    // Calculate RICE score
    const reach = dto.reach || 0;
    const impact = dto.impact || 0;
    const confidence = dto.confidence || 0;
    const effort = dto.effort || 1;
    const riceScore = (reach * impact * (confidence / 100)) / effort;

    const feature: FeatureRequestDto = {
      id: generateId(),
      creationTime: getCurrentTimestamp(),
      lastModificationTime: getCurrentTimestamp(),
      riceScore,
      ...dto,
    };
    this.featureRequests.push(feature);
    return feature;
  }

  getFeatureRequests(
    filter: FeatureRequestFilterDto,
  ): PagedResultDto<FeatureRequestDto> {
    let items = [...this.featureRequests];

    if (filter.filter) {
      const search = filter.filter.toLowerCase();
      items = items.filter(
        (f) =>
          f.title.toLowerCase().includes(search) ||
          f.description.toLowerCase().includes(search),
      );
    }

    if (filter.status) {
      items = items.filter((f) => f.status === filter.status);
    }

    if (filter.priority) {
      items = items.filter((f) => f.priority === filter.priority);
    }

    if (filter.productId) {
      items = items.filter((f) => f.productId === filter.productId);
    }

    if (filter.minRiceScore) {
      items = items.filter((f) => f.riceScore >= filter.minRiceScore!);
    }

    // Sort by RICE score descending
    items.sort((a, b) => b.riceScore - a.riceScore);

    const totalCount = items.length;
    const skipCount = filter.skipCount || 0;
    const maxResultCount = filter.maxResultCount || 10;
    items = items.slice(skipCount, skipCount + maxResultCount);

    return { items, totalCount };
  }

  getFeatureRequestById(id: string): FeatureRequestDto | null {
    return this.featureRequests.find((f) => f.id === id) || null;
  }

  updateFeatureStatus(id: string, status: FeatureStatus): boolean {
    const feature = this.featureRequests.find((f) => f.id === id);
    if (!feature) return false;

    feature.status = status;
    feature.lastModificationTime = getCurrentTimestamp();
    return true;
  }

  // ==========================================
  // COMPETITIVE ANALYSIS
  // ==========================================

  createCompetitiveAnalysis(
    dto: Omit<
      CompetitiveAnalysisDto,
      'id' | 'creationTime' | 'lastModificationTime'
    >,
  ): CompetitiveAnalysisDto {
    const analysis: CompetitiveAnalysisDto = {
      id: generateId(),
      creationTime: getCurrentTimestamp(),
      lastModificationTime: getCurrentTimestamp(),
      ...dto,
    };
    this.competitiveAnalyses.push(analysis);
    return analysis;
  }

  getCompetitiveAnalyses(): CompetitiveAnalysisDto[] {
    return [...this.competitiveAnalyses];
  }

  getCompetitiveAnalysisByProductId(
    productId: string,
  ): CompetitiveAnalysisDto | null {
    return (
      this.competitiveAnalyses.find((a) => a.productId === productId) || null
    );
  }

  // ==========================================
  // ANALYTICS & INSIGHTS
  // ==========================================

  getMarketOverview(): {
    totalSegments: number;
    totalTAM: number;
    avgGrowthRate: number;
    topGrowthSegments: MarketSegmentDto[];
  } {
    const segments = this.marketSegments;
    const totalSegments = segments.length;
    const totalTAM = segments.reduce(
      (sum, s) => sum + s.totalAddressableMarket,
      0,
    );
    const avgGrowthRate =
      segments.length > 0
        ? segments.reduce((sum, s) => sum + s.growthRateAnnual, 0) /
          segments.length
        : 0;
    const topGrowthSegments = [...segments]
      .sort((a, b) => b.growthRateAnnual - a.growthRateAnnual)
      .slice(0, 5);

    return { totalSegments, totalTAM, avgGrowthRate, topGrowthSegments };
  }

  getCampaignPerformance(): {
    totalCampaigns: number;
    activeCampaigns: number;
    totalBudget: number;
    totalSpent: number;
    avgROI: number;
    topPerformers: MarketingCampaignDto[];
  } {
    const campaigns = this.campaigns;
    const activeCampaigns = campaigns.filter(
      (c) => c.status === CampaignStatus.Active,
    ).length;
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budgetTotal, 0);
    const totalSpent = campaigns.reduce(
      (sum, c) => sum + (c.metrics?.spend || 0),
      0,
    );

    const campaignsWithROI = campaigns.filter(
      (c) => c.metrics?.roi !== undefined,
    );
    const avgROI =
      campaignsWithROI.length > 0
        ? campaignsWithROI.reduce((sum, c) => sum + (c.metrics?.roi || 0), 0) /
          campaignsWithROI.length
        : 0;

    const topPerformers = [...campaigns]
      .filter((c) => c.metrics?.roi !== undefined)
      .sort((a, b) => (b.metrics?.roi || 0) - (a.metrics?.roi || 0))
      .slice(0, 5);

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalBudget,
      totalSpent,
      avgROI,
      topPerformers,
    };
  }

  getFeatureBacklog(): {
    totalFeatures: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    topRiceScores: FeatureRequestDto[];
    avgRiceScore: number;
  } {
    const features = this.featureRequests;
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    features.forEach((f) => {
      byStatus[f.status] = (byStatus[f.status] || 0) + 1;
      byPriority[f.priority] = (byPriority[f.priority] || 0) + 1;
    });

    const topRiceScores = [...features]
      .sort((a, b) => b.riceScore - a.riceScore)
      .slice(0, 10);

    const avgRiceScore =
      features.length > 0
        ? features.reduce((sum, f) => sum + f.riceScore, 0) / features.length
        : 0;

    return {
      totalFeatures: features.length,
      byStatus,
      byPriority,
      topRiceScores,
      avgRiceScore,
    };
  }
}
