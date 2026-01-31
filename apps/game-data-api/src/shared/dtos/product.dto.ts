import { AuditedEntityDto, EntityDto } from './base.dto';

// ==========================================
// PRODUCT ENTITY - Replaces Game
// Generic for: Games, Courses, Software, AI Agents, etc.
// ==========================================

/**
 * Product Category - High-level categorization
 */
export enum ProductCategory {
  // Gaming
  Game = 'Game',

  // Education
  OnlineCourse = 'Online Course',
  TrainingProgram = 'Training Program',
  Certification = 'Certification',
  Bootcamp = 'Bootcamp',
  Ebook = 'Ebook',

  // Software
  SaaSApp = 'SaaS Application',
  MobileApp = 'Mobile App',
  DesktopApp = 'Desktop App',
  WebApp = 'Web Application',
  BrowserExtension = 'Browser Extension',
  API = 'API',
  SDK = 'SDK',
  Plugin = 'Plugin',

  // AI
  AIAgent = 'AI Agent',
  AIModel = 'AI Model',
  AITool = 'AI Tool',
  LLMWrapper = 'LLM Wrapper',
  AIAssistant = 'AI Assistant',

  // Productivity
  ProductivityTool = 'Productivity Tool',
  ProjectManagement = 'Project Management',
  CRM = 'CRM',
  Collaboration = 'Collaboration',
  Documentation = 'Documentation',

  // Family / Consumer
  FamilyApp = 'Family App',
  ParentingTool = 'Parenting Tool',
  ChildSafety = 'Child Safety',
  FamilyCalendar = 'Family Calendar',
  ChoreManagement = 'Chore Management',

  // Other
  Marketplace = 'Marketplace',
  Platform = 'Platform',
  Hardware = 'Hardware',
  Service = 'Service',
  Other = 'Other',
}

/**
 * Product Subcategory - More specific categorization
 */
export enum ProductSubcategory {
  // Gaming subcategories
  RPG = 'RPG',
  ActionGame = 'Action',
  Strategy = 'Strategy',
  Simulation = 'Simulation',
  Puzzle = 'Puzzle',
  Casual = 'Casual',
  MMO = 'MMO',

  // Course subcategories
  Programming = 'Programming',
  DataScience = 'Data Science',
  Design = 'Design',
  Marketing = 'Marketing',
  Business = 'Business',
  PersonalDevelopment = 'Personal Development',
  Language = 'Language',

  // AI subcategories
  Chatbot = 'Chatbot',
  ImageGeneration = 'Image Generation',
  TextGeneration = 'Text Generation',
  CodeAssistant = 'Code Assistant',
  VoiceAssistant = 'Voice Assistant',
  DataAnalysis = 'Data Analysis',
  Automation = 'Automation',

  // Productivity subcategories
  TaskManagement = 'Task Management',
  NotesTaking = 'Notes Taking',
  TimeTracking = 'Time Tracking',
  EmailManagement = 'Email Management',
  CalendarApp = 'Calendar',

  // Family subcategories
  ScreenTimeManagement = 'Screen Time',
  LocationSharing = 'Location Sharing',
  FamilyChat = 'Family Chat',
  MealPlanning = 'Meal Planning',
  BudgetManagement = 'Budget',

  // General
  Analytics = 'Analytics',
  Communication = 'Communication',
  Security = 'Security',
  Storage = 'Storage',
  Other = 'Other',
}

/**
 * Platform - Where the product runs
 */
export enum Platform {
  Web = 'Web',
  iOS = 'iOS',
  Android = 'Android',
  Windows = 'Windows',
  macOS = 'macOS',
  Linux = 'Linux',
  Roblox = 'Roblox',
  Steam = 'Steam',
  Console = 'Console',
  CLI = 'CLI',
  API = 'API',
  CrossPlatform = 'Cross-Platform',
}

/**
 * Target Audience
 */
export enum TargetAudience {
  // Age groups
  Children = 'Children (5-12)',
  Teens = 'Teens (13-17)',
  YoungAdults = 'Young Adults (18-24)',
  Adults = 'Adults (25-44)',
  Seniors = 'Seniors (45+)',
  AllAges = 'All Ages',

  // Professional
  Developers = 'Developers',
  Designers = 'Designers',
  Marketers = 'Marketers',
  Executives = 'Executives',
  Entrepreneurs = 'Entrepreneurs',
  Freelancers = 'Freelancers',
  Students = 'Students',
  Teachers = 'Teachers',

  // Family
  Parents = 'Parents',
  Families = 'Families',
  Couples = 'Couples',

  // Business
  Startups = 'Startups',
  SMB = 'Small-Medium Business',
  Enterprise = 'Enterprise',

  // Other
  General = 'General',
}

/**
 * Monetization Model
 */
export enum MonetizationModel {
  Free = 'Free',
  Freemium = 'Freemium',
  Subscription = 'Subscription',
  OneTimePurchase = 'One-Time Purchase',
  PayPerUse = 'Pay-Per-Use',
  Credits = 'Credits/Tokens',
  InAppPurchases = 'In-App Purchases',
  Ads = 'Ads',
  Affiliate = 'Affiliate',
  Hybrid = 'Hybrid',
  Enterprise = 'Enterprise/Custom',
  OpenSource = 'Open Source',
}

/**
 * Product Relationship (to us)
 */
export enum ProductRelationship {
  OurProduct = 'Our Product',
  Competitor = 'Competitor',
  Complementary = 'Complementary',
  Inspiration = 'Inspiration',
  Reference = 'Reference',
  PartnerProduct = 'Partner Product',
  Acquired = 'Acquired',
}

/**
 * Product Status
 */
export enum ProductStatus {
  Concept = 'Concept',
  InDevelopment = 'In Development',
  Beta = 'Beta',
  Launched = 'Launched',
  Growing = 'Growing',
  Mature = 'Mature',
  Declining = 'Declining',
  Sunset = 'Sunset',
  Discontinued = 'Discontinued',
}

// ==========================================
// FEATURE FLAGS - Universal product features
// ==========================================

/**
 * Feature Flags - Universal features a product can have
 */
export interface ProductFeatureFlags {
  // Core Capabilities
  hasUserAccounts: boolean;
  hasTeams: boolean;
  hasRoles: boolean;
  hasPermissions: boolean;
  hasAPI: boolean;
  hasWebhooks: boolean;
  hasIntegrations: boolean;

  // Collaboration
  hasRealTimeCollab: boolean;
  hasChat: boolean;
  hasComments: boolean;
  hasSharing: boolean;

  // Content
  hasContentCreation: boolean;
  hasMediaUpload: boolean;
  hasTemplates: boolean;
  hasLibrary: boolean;

  // AI Features
  hasAIGeneration: boolean;
  hasAIAssistant: boolean;
  hasNaturalLanguage: boolean;
  hasAutomation: boolean;

  // Analytics
  hasAnalytics: boolean;
  hasReporting: boolean;
  hasDashboards: boolean;

  // Mobile
  hasMobileApp: boolean;
  hasOfflineMode: boolean;
  hasPushNotifications: boolean;

  // Monetization
  hasFreeTier: boolean;
  hasTrialPeriod: boolean;
  hasSubscription: boolean;
  hasMicroTransactions: boolean;

  // Security
  hasSSO: boolean;
  hasMFA: boolean;
  hasAuditLog: boolean;
  hasDataExport: boolean;

  // Gamification
  hasAchievements: boolean;
  hasLeaderboards: boolean;
  hasRewards: boolean;
  hasProgress: boolean;

  // Social
  hasSocialLogin: boolean;
  hasSocialSharing: boolean;
  hasCommunity: boolean;

  // Support
  hasLiveChat: boolean;
  hasKnowledgeBase: boolean;
  hasTicketSystem: boolean;
}

// ==========================================
// PRODUCT METRICS
// ==========================================

/**
 * Product Metrics - Universal success metrics
 */
export interface ProductMetricsDto {
  // Users
  totalUsers: number;
  monthlyActiveUsers: number;
  dailyActiveUsers: number;
  newUsersMonthly: number;

  // Engagement
  averageSessionLength: number; // minutes
  sessionsPerUser: number; // weekly
  retentionDay1: number; // percentage
  retentionDay7: number;
  retentionDay30: number;

  // Revenue
  revenueMonthly: number;
  revenueAnnual: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  conversionRate: number; // free to paid

  // Growth
  growthRateMonthly: number; // percentage
  churnRate: number; // percentage
  netPromoterScore: number; // -100 to 100

  // Product
  featureAdoptionRate: number;
  supportTicketsMonthly: number;
  bugReportsMonthly: number;
  averageRating: number; // 1-5
  reviewCount: number;
}

// ==========================================
// PRODUCT FEATURES
// ==========================================

/**
 * Product Feature DTO - Individual feature analysis
 */
export interface ProductFeatureDto extends AuditedEntityDto {
  productId: string;
  name: string;
  description: string;
  category: string;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  implementationComplexity: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  userImpact: number; // 1-10
  monetizationPotential: number; // 1-10

  // Analysis
  whatMakesItGreat: string[];
  improvementOpportunities: string[];
  competitiveAdvantage: string;

  // Implementation
  technicalNotes: string;
  bestPractices: string[];
  commonPitfalls: string[];
  estimatedDevTime: string; // e.g., "2 weeks"
}

// ==========================================
// PRICING TIERS
// ==========================================

/**
 * Pricing Tier DTO
 */
export interface PricingTierDto extends AuditedEntityDto {
  productId: string;
  name: string; // e.g., "Free", "Pro", "Enterprise"
  priceMonthly: number;
  priceAnnual?: number;
  priceLifetime?: number;
  currency: string;

  // Limits
  userLimit?: number;
  storageLimit?: string;
  apiCallLimit?: number;
  customLimits: Record<string, string | number>;

  // Features
  featuresIncluded: string[];
  featuresExcluded: string[];

  // Marketing
  isPopular: boolean;
  isBestValue: boolean;
  ctaText: string;
  description: string;
}

// ==========================================
// MAIN PRODUCT DTO
// ==========================================

/**
 * Main Product DTO - Replaces GameDto
 */
export interface ProductDto extends AuditedEntityDto {
  // Basic Info
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  screenshotUrls: string[];
  websiteUrl?: string;
  demoUrl?: string;

  // Classification
  category: ProductCategory;
  subcategory: ProductSubcategory;
  platforms: Platform[];
  targetAudiences: TargetAudience[];
  relationship: ProductRelationship;
  status: ProductStatus;

  // Company Link
  companyId?: string;
  companyName?: string;

  // Dates
  launchDate?: Date;
  lastUpdateDate?: Date;

  // Features
  featureFlags: ProductFeatureFlags;
  features: ProductFeatureDto[];

  // Monetization
  monetizationModel: MonetizationModel;
  pricingTiers: PricingTierDto[];
  hasFreeTier: boolean;
  freeTrialDays?: number;
  startingPrice?: number;

  // Metrics
  metrics: ProductMetricsDto;

  // Analysis
  strengths: string[];
  weaknesses: string[];
  uniqueSellingPoints: string[];
  lessonsLearned: string[];

  // Competitive Intel
  competitorIds: string[];
  marketPosition: 'Leader' | 'Challenger' | 'Follower' | 'Niche';
  differentiators: string[];

  // Strategic Assessment
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  priorityScore: number; // 1-100
  recommendedForStudy: boolean;
  replicationDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';

  // Notes
  strategicNotes: string;
  technicalNotes: string;

  // Tags
  tags: string[];
}

/**
 * Create Product DTO
 */
export interface CreateProductDto {
  name: string;
  slug?: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  category: ProductCategory;
  subcategory?: ProductSubcategory;
  platforms?: Platform[];
  targetAudiences?: TargetAudience[];
  relationship: ProductRelationship;
  status?: ProductStatus;
  companyId?: string;
  monetizationModel?: MonetizationModel;
  featureFlags?: Partial<ProductFeatureFlags>;
  tags?: string[];
}

/**
 * Update Product DTO
 */
export interface UpdateProductDto extends Partial<CreateProductDto> {
  metrics?: Partial<ProductMetricsDto>;
  strengths?: string[];
  weaknesses?: string[];
  uniqueSellingPoints?: string[];
  competitorIds?: string[];
  threatLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  priorityScore?: number;
  recommendedForStudy?: boolean;
}

/**
 * Product Filter DTO
 */
export interface ProductFilterDto {
  filter?: string; // Text search
  category?: ProductCategory;
  subcategory?: ProductSubcategory;
  platform?: Platform;
  targetAudience?: TargetAudience;
  relationship?: ProductRelationship;
  status?: ProductStatus;
  monetizationModel?: MonetizationModel;
  companyId?: string;
  hasFreeTier?: boolean;
  minPriorityScore?: number;
  recommendedOnly?: boolean;
  tags?: string[];
  // Feature filters
  hasAI?: boolean;
  hasAPI?: boolean;
  hasMobileApp?: boolean;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}
