import { AuditedEntityDto } from './base.dto';

// ==========================================
// ENUMS
// ==========================================

export enum CampaignStatus {
  Planning = 'Planning',
  Active = 'Active',
  Paused = 'Paused',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum FeatureStatus {
  Idea = 'Idea',
  UnderReview = 'Under Review',
  Planned = 'Planned',
  InProgress = 'In Progress',
  Beta = 'Beta',
  Released = 'Released',
  Rejected = 'Rejected',
}

export enum FeaturePriority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Backlog = 'Backlog',
}

// ==========================================
// MARKET ANALYSIS ENTITIES
// For strategic planning, marketing campaigns, and feature prioritization
// ==========================================

/**
 * Market Segment
 */
export interface MarketSegmentDto extends AuditedEntityDto {
  name: string;
  description: string;

  // Size & Value
  totalAddressableMarket: number; // TAM in dollars
  serviceableAddressableMarket: number; // SAM in dollars
  serviceableObtainableMarket: number; // SOM in dollars

  // Growth
  growthRateAnnual: number; // percentage
  projectedSize2025?: number;
  projectedSize2030?: number;

  // Characteristics
  targetAudiences: string[];
  painPoints: string[];
  buyingBehavior: string[];
  decisionMakers: string[];

  // Competition
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Saturated';
  topCompetitors: string[]; // Company IDs
  marketLeader?: string; // Company ID
  marketLeaderShare: number;

  // Opportunity
  opportunityScore: number; // 1-100
  entryBarriers: string[];
  ourAdvantages: string[];
  riskFactors: string[];

  // Tags
  tags: string[];
}

/**
 * Marketing Campaign DTO
 */
export interface MarketingCampaignDto extends AuditedEntityDto {
  name: string;
  description: string;

  // Target
  productId?: string;
  companyId?: string;
  marketSegmentId?: string;
  targetAudiences: string[];

  // Timing
  startDate: Date;
  endDate?: Date;
  status: 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';

  // Budget
  budgetTotal: number;
  budgetSpent: number;
  currency: string;

  // Channels
  channels: CampaignChannel[];

  // Goals
  goalType:
    | 'Awareness'
    | 'Traffic'
    | 'Leads'
    | 'Conversions'
    | 'Revenue'
    | 'Retention';
  goalTarget: number;
  goalMetric: string;
  goalAchieved: number;

  // Results
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
  roi: number; // percentage

  // Content
  messagingThemes: string[];
  keyMessages: string[];
  creativesUrls: string[];
  landingPageUrl?: string;

  // Analysis
  whatWorked: string[];
  whatDidntWork: string[];
  lessonsLearned: string[];

  // Tags
  tags: string[];
}

/**
 * Campaign Channel
 */
export interface CampaignChannel {
  channelType:
    | 'SEO'
    | 'SEM'
    | 'Social Organic'
    | 'Social Paid'
    | 'Email'
    | 'Content Marketing'
    | 'Influencer'
    | 'Affiliate'
    | 'PR'
    | 'Events'
    | 'Webinars'
    | 'Podcast'
    | 'YouTube'
    | 'Reddit'
    | 'ProductHunt'
    | 'AppStore'
    | 'Direct'
    | 'Referral'
    | 'Other';
  platform?: string; // e.g., "Facebook", "Google Ads"
  budgetAllocated: number;
  budgetSpent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  costPerClick: number;
  costPerConversion: number;
  notes?: string;
}

/**
 * Feature Request / Roadmap Item
 */
export interface FeatureRequestDto extends AuditedEntityDto {
  productId: string;

  // Basic Info
  title: string;
  description: string;
  requestedBy: string; // "Users", "Sales", "Support", "Internal", "Competitor Analysis"

  // Classification
  category: string;
  type:
    | 'Feature'
    | 'Enhancement'
    | 'Bug Fix'
    | 'Technical Debt'
    | 'Integration';

  // Priority
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Backlog';
  status:
    | 'Idea'
    | 'Under Review'
    | 'Planned'
    | 'In Progress'
    | 'Beta'
    | 'Released'
    | 'Rejected';

  // Impact Analysis
  userImpact: number; // 1-10
  revenueImpact: number; // 1-10
  competitiveImpact: number; // 1-10
  effortEstimate: 'XS' | 'S' | 'M' | 'L' | 'XL';
  riceScore?: number; // Reach * Impact * Confidence / Effort

  // Business Case
  problemStatement: string;
  proposedSolution: string;
  expectedOutcome: string;
  successMetrics: string[];

  // Competitive Intel
  competitorHasIt: string[]; // Company IDs that have this feature
  isTableStakes: boolean; // Must-have to compete
  isDifferentiator: boolean; // Would set us apart

  // Timeline
  targetQuarter?: string;
  estimatedDevDays?: number;
  actualDevDays?: number;
  releaseDate?: Date;

  // Voting
  userVotes: number;
  internalVotes: number;

  // Links
  linkedCampaignId?: string;
  linkedMarketSegmentId?: string;

  // Notes
  technicalNotes?: string;
  businessNotes?: string;

  // Tags
  tags: string[];
}

/**
 * Competitive Analysis DTO
 */
export interface CompetitiveAnalysisDto extends AuditedEntityDto {
  name: string; // e.g., "Q1 2026 AI Agent Market Analysis"
  description: string;

  // Scope
  marketSegmentId?: string;
  productCategory?: string;
  analyzedCompanyIds: string[];
  analyzedProductIds: string[];

  // Timing
  analysisDate: Date;
  validUntil?: Date;

  // Market Overview
  marketSize: number;
  marketGrowth: number;
  marketTrends: string[];
  emergingThreats: string[];

  // Competitive Landscape
  competitorRankings: CompetitorRanking[];

  // Feature Comparison
  featureMatrix: FeatureComparison[];

  // Pricing Comparison
  pricingComparison: PricingComparison[];

  // Recommendations
  strategicRecommendations: string[];
  featurePriorities: string[];
  marketingOpportunities: string[];
  defensiveActions: string[];

  // SWOT Summary
  industryStrengths: string[];
  industryWeaknesses: string[];
  industryOpportunities: string[];
  industryThreats: string[];

  // Tags
  tags: string[];
}

/**
 * Competitor Ranking in Analysis
 */
export interface CompetitorRanking {
  companyId: string;
  companyName: string;
  rank: number;
  marketShare: number;
  overallScore: number; // 1-100
  productQuality: number; // 1-10
  brandStrength: number; // 1-10
  pricingCompetitiveness: number; // 1-10
  customerSatisfaction: number; // 1-10
  growthMomentum: number; // 1-10
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
}

/**
 * Feature Comparison in Analysis
 */
export interface FeatureComparison {
  featureName: string;
  category: string;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  ourStatus: 'None' | 'Basic' | 'Good' | 'Best-in-Class';
  competitorStatuses: Record<
    string,
    'None' | 'Basic' | 'Good' | 'Best-in-Class'
  >; // companyId -> status
  gapAnalysis: string;
  actionRequired: string;
}

/**
 * Pricing Comparison in Analysis
 */
export interface PricingComparison {
  tierName: string;
  ourPrice?: number;
  competitorPrices: Record<string, number>; // companyId -> price
  averageMarketPrice: number;
  ourPositioning: 'Below Market' | 'At Market' | 'Above Market' | 'Premium';
  valueProposition: string;
}

// ==========================================
// FILTER DTOs
// ==========================================

/**
 * Market Segment Filter
 */
export interface MarketSegmentFilterDto {
  filter?: string;
  minTAM?: number;
  minGrowthRate?: number;
  competitionLevel?: 'Low' | 'Medium' | 'High' | 'Saturated';
  tags?: string[];
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

/**
 * Marketing Campaign Filter
 */
export interface MarketingCampaignFilterDto {
  filter?: string;
  productId?: string;
  companyId?: string;
  status?: 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  goalType?: string;
  channelType?: string;
  minBudget?: number;
  maxBudget?: number;
  minROI?: number;
  tags?: string[];
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

/**
 * Feature Request Filter
 */
export interface FeatureRequestFilterDto {
  filter?: string;
  productId?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low' | 'Backlog';
  status?: string;
  type?: string;
  requestedBy?: string;
  isTableStakes?: boolean;
  isDifferentiator?: boolean;
  minRiceScore?: number;
  tags?: string[];
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}
