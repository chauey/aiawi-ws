import { AuditedEntityDto, EntityDto } from './base.dto';

/**
 * Game Genre Enumeration
 */
export enum GameGenre {
  Action = 'Action',
  Adventure = 'Adventure',
  RPG = 'RPG',
  Strategy = 'Strategy',
  Simulation = 'Simulation',
  Shooter = 'Shooter',
  Racing = 'Racing',
  Sports = 'Sports',
  Horror = 'Horror',
  Puzzle = 'Puzzle',
  Platformer = 'Platformer',
  MMO = 'MMO',
  Survival = 'Survival',
  OpenWorld = 'OpenWorld',
  BattleRoyale = 'BattleRoyale',
  Other = 'Other',
}

/**
 * Platform Enumeration
 */
export enum Platform {
  Roblox = 'Roblox',
  Mobile = 'Mobile',
  PC = 'PC',
  Console = 'Console',
  Web = 'Web',
  CrossPlatform = 'CrossPlatform',
}

/**
 * Age Group Enumeration
 */
export enum AgeGroup {
  PreschoolAge = 'Preschool (3-5)',
  ElementaryAge = 'Elementary (6-12)',
  Teen = 'Teen (13-17)',
  YoungAdult = 'Young Adult (18-24)',
  Adult = 'Adult (25+)',
  AllAges = 'All Ages',
}

/**
 * Monetization Model Enumeration
 */
export enum MonetizationModel {
  Free = 'Free',
  Premium = 'Premium',
  Freemium = 'Freemium',
  Subscription = 'Subscription',
  InAppPurchases = 'InAppPurchases',
  Ads = 'Ads',
  Hybrid = 'Hybrid',
}

/**
 * Game Ownership Type
 */
export enum GameOwnership {
  OurGame = 'Our Game',
  Competitor = 'Competitor',
  Reference = 'Reference',
}

/**
 * Feature Flags - Major systems/features a game can have
 */
export interface GameFeatureFlags {
  // Core Systems
  hasCollectionSystem: boolean;
  hasTradingSystem: boolean;
  hasProgressionSystem: boolean;
  hasCraftingSystem: boolean;
  hasBuildingSystem: boolean;

  // Social Features
  hasMultiplayer: boolean;
  hasGuilds: boolean;
  hasChat: boolean;
  hasFriendSystem: boolean;
  hasLeaderboards: boolean;

  // Monetization Features
  hasInAppPurchases: boolean;
  hasGachaSystem: boolean;
  hasSeasonPass: boolean;
  hasAds: boolean;
  hasVIPSystem: boolean;

  // Progression Features
  hasLevelSystem: boolean;
  hasSkillTree: boolean;
  hasAchievements: boolean;
  hasQuests: boolean;
  hasDailies: boolean;

  // Content Systems
  hasProcGeneratedContent: boolean;
  hasStoryMode: boolean;
  hasPvP: boolean;
  hasPvE: boolean;
  hasRaids: boolean;

  // Customization
  hasCharacterCustomization: boolean;
  hasHousingCustomization: boolean;
  hasSkinSystem: boolean;
  hasEmotes: boolean;

  // Economy
  hasVirtualCurrency: boolean;
  hasMarketplace: boolean;
  hasAuctions: boolean;

  // Technical
  hasCrossPlatform: boolean;
  hasCloudSaves: boolean;
  hasOfflineProgress: boolean;
}

/**
 * Success Metric DTO
 */
export interface SuccessMetricDto {
  totalPlays: number;
  concurrentPlayers: number;
  peakConcurrentPlayers: number;
  averageSessionLength: number; // in minutes
  retentionRateDay1: number; // percentage
  retentionRateDay7: number; // percentage
  retentionRateDay30: number; // percentage
  revenueTotal: number;
  revenueMonthly: number;
  conversionRate: number; // percentage
  averageRevenuePerUser: number;
}

/**
 * Game Feature DTO
 */
export interface GameFeatureDto extends AuditedEntityDto {
  gameId: string;
  name: string;
  description: string;
  category: string;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  implementationComplexity: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  userEngagementImpact: number; // 1-10 scale
  monetizationPotential: number; // 1-10 scale

  // Success Analysis
  whatMakesItGreat: string[]; // Top 3+ things that make this feature successful
  improvementOpportunities: string[]; // How to make it even better
  competitiveAdvantage: string; // Why this beats competitors

  // Implementation
  technicalNotes: string;
  codeSnippets?: string;
  bestPractices?: string[]; // Proven implementation patterns
  commonPitfalls?: string[]; // Mistakes to avoid
}

/**
 * Game System DTO
 */
export interface GameSystemDto extends AuditedEntityDto {
  gameId: string;
  name: string;
  description: string;
  systemType:
    | 'Core'
    | 'Progression'
    | 'Economy'
    | 'Social'
    | 'Combat'
    | 'UI'
    | 'Analytics'
    | 'Other';

  // Success Analysis
  whatMakesItGreat: string[]; // Top 3+ key strengths
  improvementOpportunities: string[]; // Optimization ideas

  // Technical Details
  algorithmDescription: string;
  pseudocode?: string;
  performance: 'Excellent' | 'Good' | 'Average' | 'NeedsOptimization';
  scalability: 'High' | 'Medium' | 'Low';
  dependencies: string[]; // IDs of other systems
  optimizationTips?: string[]; // Performance improvements
}

/**
 * Reward Structure DTO
 */
export interface RewardStructureDto extends AuditedEntityDto {
  gameId: string;
  name: string;
  rewardType:
    | 'Currency'
    | 'Item'
    | 'Experience'
    | 'Unlock'
    | 'Cosmetic'
    | 'Achievement'
    | 'Other';
  triggerCondition: string;
  value: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  playerEngagement: number; // 1-10 scale
  balanceNotes: string;
}

/**
 * Game Mechanic DTO
 */
export interface GameMechanicDto extends AuditedEntityDto {
  gameId: string;
  name: string;
  description: string;
  mechanicType:
    | 'Movement'
    | 'Combat'
    | 'Interaction'
    | 'Progression'
    | 'Economy'
    | 'Social'
    | 'Other';
  funFactor: number; // 1-10 scale
  retentionImpact: number; // 1-10 scale
  implementationGuide: string;
  videoReferenceUrl?: string;
}

/**
 * Success Factor DTO
 */
export interface SuccessFactorDto extends AuditedEntityDto {
  gameId: string;
  factor: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  evidenceSource: string;
  replicability: number; // 1-10 scale
}

/**
 * Game Requirement DTO - For tracking features/tasks to implement
 */
export interface GameRequirementDto extends AuditedEntityDto {
  gameId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  estimatedHours?: number;
  actualHours?: number;
  assignee?: string;
  linkedSystemId?: string;
  linkedFeatureId?: string;
  acceptanceCriteria: string[];
  notes?: string;
  dueDate?: Date;
  completedDate?: Date;
  tags: string[];
}

/**
 * Game Setting DTO - Configuration values for the game
 */
export interface GameSettingDto extends AuditedEntityDto {
  gameId: string;
  key: string;
  name: string;
  description: string;
  category: string;
  valueType: 'number' | 'string' | 'boolean' | 'array' | 'object';
  value: string;
  defaultValue: string;
  minValue?: number;
  maxValue?: number;
  isActive: boolean;
  linkedSystemId?: string;
  notes?: string;
}

/**
 * Tutorial Step DTO - For onboarding and in-game help
 */
export interface TutorialStepDto extends AuditedEntityDto {
  gameId: string;
  tutorialId: string;
  tutorialName: string;
  stepNumber: number;
  title: string;
  instruction: string;
  targetElement?: string;
  action: 'Click' | 'Wait' | 'Input' | 'Move' | 'Look' | 'Custom';
  validationCriteria?: string;
  skipCondition?: string;
  rewardOnComplete?: string;
  voiceoverScript?: string;
  animationId?: string;
  durationMs?: number;
  isRequired: boolean;
  notes?: string;
}

/**
 * Documentation Section DTO - For game manuals and docs
 */
export interface DocumentationSectionDto extends AuditedEntityDto {
  gameId: string;
  docType: string;
  title: string;
  content: string;
  order: number;
  parentSectionId?: string;
  version: string;
  lastUpdatedBy?: string;
  isPublished: boolean;
  tags: string[];
}

/**
 * Main Game DTO
 */
export interface GameDto extends AuditedEntityDto {
  name: string;
  developer: string;
  genre: GameGenre;
  releaseDate: Date;
  platform: Platform;
  ageGroup: AgeGroup;
  ownership: GameOwnership;
  description: string;
  thumbnailUrl?: string;
  gameUrl?: string;

  // Feature Flags
  featureFlags: GameFeatureFlags;

  // Monetization
  monetizationModel: MonetizationModel;
  pricePoint?: number;

  // Success Metrics
  successMetrics: SuccessMetricDto;

  // Relationships
  features: GameFeatureDto[];
  systems: GameSystemDto[];
  rewards: RewardStructureDto[];
  mechanics: GameMechanicDto[];
  successFactors: SuccessFactorDto[];

  // Project Management (optional - for Our Games)
  requirements?: GameRequirementDto[];
  settings?: GameSettingDto[];
  tutorials?: TutorialStepDto[];
  documentation?: DocumentationSectionDto[];

  // Analysis
  strengths: string[];
  weaknesses: string[];
  uniqueSellingPoints: string[];
  lessonsLearned: string[];

  // Priority for replication
  priorityScore: number; // 1-100 calculated score
  recommendedForReplication: boolean;

  // Tags for filtering
  tags: string[];
}

/**
 * Create Game DTO
 */
export interface CreateGameDto {
  name: string;
  developer: string;
  genre: GameGenre;
  releaseDate: Date;
  platform: Platform;
  ageGroup: AgeGroup;
  ownership: GameOwnership;
  description: string;
  thumbnailUrl?: string;
  gameUrl?: string;
  featureFlags?: Partial<GameFeatureFlags>;
  monetizationModel: MonetizationModel;
  pricePoint?: number;
  tags: string[];
}

/**
 * Update Game DTO
 */
export interface UpdateGameDto extends Partial<CreateGameDto> {
  priorityScore?: number;
  recommendedForReplication?: boolean;
}

/**
 * Game Filter DTO
 */
export interface GameFilterDto {
  filter?: string;
  genre?: GameGenre;
  platform?: Platform;
  ageGroup?: AgeGroup;
  ownership?: GameOwnership;
  monetizationModel?: MonetizationModel;
  minPriorityScore?: number;
  recommendedOnly?: boolean;
  tags?: string[];
  // Feature flag filters
  hasCollectionSystem?: boolean;
  hasTradingSystem?: boolean;
  hasProgressionSystem?: boolean;
  hasMultiplayer?: boolean;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}
