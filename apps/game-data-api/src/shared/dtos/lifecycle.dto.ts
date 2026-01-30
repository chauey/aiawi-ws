import { AuditedEntityDto } from './base.dto';

/**
 * Development Stage Enumeration
 */
export enum DevelopmentStage {
  Concept = 'Concept',
  Prototype = 'Prototype',
  PreProduction = 'Pre-Production',
  Production = 'Production',
  Alpha = 'Alpha',
  Beta = 'Beta',
  SoftLaunch = 'Soft Launch',
  Live = 'Live',
  Maintenance = 'Maintenance',
  EndOfLife = 'End of Life',
}

/**
 * Marketing Channel Enumeration
 */
export enum MarketingChannel {
  YouTube = 'YouTube',
  TikTok = 'TikTok',
  Instagram = 'Instagram',
  Twitter = 'Twitter',
  Discord = 'Discord',
  Reddit = 'Reddit',
  Influencers = 'Influencers',
  PaidAds = 'Paid Ads',
  OrganicSearch = 'Organic Search',
  WordOfMouth = 'Word of Mouth',
  InGameEvents = 'In-Game Events',
}

/**
 * Research Data DTO
 */
export interface ResearchDataDto extends AuditedEntityDto {
  gameId: string;
  marketSize: number; // Total addressable market
  targetAudience: string;
  competitorCount: number;
  keyCompetitors: string[];
  playerSurveyResults?: string;
  marketTrends: string[];
  opportunityScore: number; // 1-10
  threatLevel: number; // 1-10
  researchNotes: string;
}

/**
 * Ideation Concept DTO
 */
export interface IdeationConceptDto extends AuditedEntityDto {
  gameId: string;
  conceptName: string;
  description: string;
  uniqueValue: string;
  targetMarket: string;
  estimatedDevTime: number; // in months
  estimatedBudget: number;
  prototypeStatus: 'Not Started' | 'In Progress' | 'Complete';
  validationScore: number; // 1-10 based on testing
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
}

/**
 * Development Plan DTO
 */
export interface DevelopmentPlanDto extends AuditedEntityDto {
  gameId: string;
  currentStage: DevelopmentStage;
  milestones: MilestoneDto[];
  teamSize: number;
  budget: number;
  burnRate: number; // monthly
  estimatedLaunchDate: Date;
  techStack: string[];
  developmentNotes: string;
}

/**
 * Milestone DTO
 */
export interface MilestoneDto {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  status: 'Not Started' | 'In Progress' | 'Blocked' | 'Complete';
  progress: number; // 0-100
  assignedTo?: string;
}

/**
 * Implementation Status DTO
 */
export interface ImplementationStatusDto extends AuditedEntityDto {
  gameId: string;
  featuresComplete: number;
  featuresInProgress: number;
  featuresPending: number;
  codeQualityScore: number; // 1-10
  technicalDebt: 'Low' | 'Medium' | 'High' | 'Critical';
  lastDeploymentDate?: Date;
  currentSprint: number;
  sprintVelocity: number;
  implementationNotes: string;
}

/**
 * QA Testing DTO
 */
export interface QATestingDto extends AuditedEntityDto {
  gameId: string;
  totalBugs: number;
  criticalBugs: number;
  resolvedBugs: number;
  testCoverage: number; // percentage
  playtestSessions: number;
  averagePlaytestScore: number; // 1-10
  userFeedbackSummary: string;
  qaStatus: 'Pass' | 'Fail' | 'Conditional';
}

/**
 * Deployment Info DTO
 */
export interface DeploymentInfoDto extends AuditedEntityDto {
  gameId: string;
  platforms: string[];
  regions: string[];
  version: string;
  releaseDate: Date;
  updateFrequency: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
  lastUpdate: Date;
  serverStatus: 'Stable' | 'Issues' | 'Down';
  uptime: number; // percentage
}

/**
 * Marketing Campaign DTO
 */
export interface MarketingCampaignDto extends AuditedEntityDto {
  gameId: string;
  campaignName: string;
  channel: MarketingChannel;
  budget: number;
  startDate: Date;
  endDate: Date;
  reach: number; // impressions
  engagement: number; // clicks, likes, shares
  conversions: number; // installs, sign-ups
  roi: number; // return on investment
  creativeAssets: string[]; // URLs
  influencersUsed: string[];
  campaignNotes: string;
}

/**
 * Sales & Monetization DTO
 */
export interface SalesMonetizationDto extends AuditedEntityDto {
  gameId: string;
  pricingTiers: PricingTierDto[];
  bundles: BundleDto[];
  promotions: PromotionDto[];
  conversionFunnel: ConversionFunnelDto;
  averageTransactionValue: number;
  lifetimeValue: number; // LTV per user
  customerAcquisitionCost: number;
  salesNotes: string;
}

/**
 * Pricing Tier DTO
 */
export interface PricingTierDto {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  popularityRank: number;
}

/**
 * Bundle DTO
 */
export interface BundleDto {
  id: string;
  name: string;
  items: string[];
  regularPrice: number;
  bundlePrice: number;
  discount: number; // percentage
  popularity: number; // sales count
}

/**
 * Promotion DTO
 */
export interface PromotionDto {
  id: string;
  name: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  applicableItems: string[];
  conversionLift: number; // percentage increase
}

/**
 * Conversion Funnel DTO
 */
export interface ConversionFunnelDto {
  totalVisitors: number;
  signUps: number;
  activePlayers: number;
  firstTimeBuyers: number;
  repeatBuyers: number;
  whales: number; // top spenders
}

/**
 * User Acquisition DTO
 */
export interface UserAcquisitionDto extends AuditedEntityDto {
  gameId: string;
  totalUsers: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  organicGrowth: number; // percentage
  paidAcquisition: number; // percentage
  viralCoefficient: number;
  churnRate: number; // percentage
  acquisitionChannels: { channel: string; percentage: number }[];
}

/**
 * Community Management DTO
 */
export interface CommunityManagementDto extends AuditedEntityDto {
  gameId: string;
  discordMembers?: number;
  subredditMembers?: number;
  socialMediaFollowers: { platform: string; count: number }[];
  communityEngagement: 'Low' | 'Medium' | 'High' | 'Very High';
  moderatorCount: number;
  averageResponseTime: number; // in hours
  sentimentScore: number; // 1-10
  communityNotes: string;
}

/**
 * Live Operations DTO
 */
export interface LiveOperationsDto extends AuditedEntityDto {
  gameId: string;
  activeEvents: LiveEventDto[];
  seasonPassActive: boolean;
  currentSeason?: string;
  updateSchedule: string;
  playerSupport: {
    ticketsResolved: number;
    averageResolveTime: number; // hours
    satisfactionScore: number; // 1-10
  };
  liveOpsNotes: string;
}

/**
 * Live Event DTO
 */
export interface LiveEventDto {
  id: string;
  name: string;
  type: 'Limited Time' | 'Seasonal' | 'Holiday' | 'Community' | 'Competitive';
  startDate: Date;
  endDate: Date;
  participation: number; // player count
  revenueGenerated: number;
  engagement: number; // 1-10
}

/**
 * Analytics Dashboard DTO
 */
export interface AnalyticsDashboardDto extends AuditedEntityDto {
  gameId: string;
  keyMetrics: {
    dau: number; // daily active users
    mau: number; // monthly active users
    arpdau: number; // average revenue per DAU
    sessionLength: number; // minutes
    sessionsPerDay: number;
    retentionD1: number;
    retentionD7: number;
    retentionD30: number;
    churnRate: number;
  };
  revenueBreakdown: {
    iapRevenue: number;
    adRevenue: number;
    subscriptionRevenue: number;
  };
  userDemographics: {
    ageGroups: { range: string; percentage: number }[];
    topCountries: { country: string; percentage: number }[];
    deviceTypes: { type: string; percentage: number }[];
  };
}

/**
 * Competitor Analysis DTO
 */
export interface CompetitorAnalysisDto extends AuditedEntityDto {
  gameId: string;
  competitorName: string;
  similarityScore: number; // 1-10
  theirStrengths: string[];
  theirWeaknesses: string[];
  ourAdvantages: string[];
  ourDisadvantages: string[];
  strategicRecommendations: string[];
  lastAnalyzed: Date;
}

/**
 * Player Feedback DTO
 */
export interface PlayerFeedbackDto extends AuditedEntityDto {
  gameId: string;
  source: 'Review' | 'Survey' | 'Support' | 'Social' | 'In-Game';
  rating: number; // 1-5 stars
  feedbackText: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  category:
    | 'Gameplay'
    | 'Monetization'
    | 'Performance'
    | 'Content'
    | 'Social'
    | 'Other';
  actionable: boolean;
  status: 'New' | 'Reviewed' | 'Implemented' | 'Dismissed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}
