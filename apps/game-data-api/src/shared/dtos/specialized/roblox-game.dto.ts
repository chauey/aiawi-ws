import { AuditedEntityDto, PagedAndSortedResultRequestDto } from '../base.dto';

// ==========================================
// ROBLOX GAME SPECIALIZED DTOs
// For market research, competitor analysis, feature ranking
// ==========================================

/**
 * Roblox Official Genres (from Discover page)
 * These are the actual categories used on roblox.com/discover
 */
export enum RobloxGenre {
  All = 'All',
  Featured = 'Featured',
  Popular = 'Popular',
  RecommendedForYou = 'Recommended For You',
  TopRated = 'Top Rated',
  TopEarning = 'Top Earning',
  MostEngaging = 'Most Engaging',

  // Main Genres
  Adventure = 'Adventure',
  BuildingCreation = 'Building & Creation',
  Comedy = 'Comedy',
  Fighting = 'Fighting',
  FPS = 'FPS',
  Horror = 'Horror',
  Medieval = 'Medieval',
  Military = 'Military',
  NavalPirate = 'Naval / Pirate',
  Obby = 'Obby',
  Racing = 'Racing',
  Roleplay = 'Roleplay',
  Romance = 'Romance',
  RPG = 'RPG',
  SciFi = 'Sci-Fi',
  Simulator = 'Simulator',
  SocialHangout = 'Social Hangout',
  Sports = 'Sports',
  Strategy = 'Strategy',
  Survival = 'Survival',
  TowerDefense = 'Tower Defense',
  Tycoon = 'Tycoon',
  Western = 'Western',
  Wild = 'Wild West',

  // Additional Sub-genres
  Puzzle = 'Puzzle',
  Music = 'Music',
  Educational = 'Educational',
  Fashion = 'Fashion',
  Anime = 'Anime',
  Sandbox = 'Sandbox',
  PvP = 'PvP',

  Other = 'Other',
}

/**
 * Roblox Sub-Genres for more specific categorization
 * These are community-recognized sub-genres
 */
export enum RobloxSubGenre {
  // Simulator Sub-Types
  PetSimulator = 'Pet Simulator',
  FarmingSimulator = 'Farming Simulator',
  ClickerSimulator = 'Clicker Simulator',
  IdleSimulator = 'Idle Simulator',
  CollectionSimulator = 'Collection Simulator',
  FishingSimulator = 'Fishing Simulator',
  MiningSimulator = 'Mining Simulator',
  CookingSimulator = 'Cooking Simulator',
  LifeSimulator = 'Life Simulator',

  // Tycoon Sub-Types
  IdleTycoon = 'Idle Tycoon',
  ManagementTycoon = 'Management Tycoon',
  DropperTycoon = 'Dropper Tycoon',

  // Obby Sub-Types
  TowerObby = 'Tower Obby',
  EscapeObby = 'Escape Obby',
  ParkourObby = 'Parkour Obby',
  DifficultyObby = 'Difficulty Obby',

  // Fighting Sub-Types
  AnimeFighting = 'Anime Fighting',
  BattleRoyale = 'Battle Royale',
  ArenaPvP = 'Arena PvP',

  // Social Sub-Types
  DressUp = 'Dress Up',
  Hangout = 'Hangout',
  LifeRP = 'Life RP',
  SchoolRP = 'School RP',

  // Horror Sub-Types
  SurvivalHorror = 'Survival Horror',
  JumpScare = 'Jump Scare',
  PsychologicalHorror = 'Psychological Horror',

  // RPG Sub-Types
  MMORPG = 'MMORPG',
  ActionRPG = 'Action RPG',
  DungeonCrawler = 'Dungeon Crawler',

  // Other
  MiniGames = 'Mini Games',
  StoryDriven = 'Story Driven',
  Meme = 'Meme / Brainrot',
  RNG = 'RNG / Gacha',
  AFK = 'AFK',
}

/**
 * Roblox Experience Guidelines - Official Age Ratings
 * These are the official Roblox content ratings
 * https://en.help.roblox.com/hc/en-us/articles/8862768451604
 */
export enum RobloxAgeRating {
  All = 'All Ages',
  NinePlus = '9+',
  ThirteenPlus = '13+',
  SeventeenPlus = '17+',
}

/**
 * Roblox Content Descriptors
 * Additional context about content in the experience
 */
export enum RobloxContentDescriptor {
  // Violence
  MildViolence = 'Mild Violence',
  ModerateViolence = 'Moderate Violence',
  StrongViolence = 'Strong Violence',
  BloodGore = 'Blood/Gore',

  // Fear
  MildFear = 'Mild Fear',
  ModerateFear = 'Moderate Fear',
  StrongFear = 'Strong Fear',

  // Language
  MildCrudeHumor = 'Mild Crude Humor',
  StrongLanguage = 'Strong Language',

  // Romance
  RomanticThemes = 'Romantic Themes',

  // Other
  InGamePurchases = 'In-Game Purchases',
  UserGeneratedContent = 'User Generated Content',
  SocialInteraction = 'Social Interaction',
  UnrestrictedChat = 'Unrestricted Chat',

  // Gambling
  SimulatedGambling = 'Simulated Gambling',
  PaidRandomItems = 'Paid Random Items',
}

/**
 * Roblox Age Group - Target demographic
 */
export enum RobloxAgeGroup {
  YoungKids = 'Young Kids (6-8)',
  Kids = 'Kids (9-12)',
  Teens = 'Teens (13-17)',
  Adults = 'Adults (17+)',
  AllAges = 'All Ages',
  FamilyFriendly = 'Family Friendly',
}

/**
 * Roblox Device Support
 */
export enum RobloxDevice {
  PC = 'PC',
  Mobile = 'Mobile',
  Tablet = 'Tablet',
  Console = 'Console',
  VR = 'VR',
  All = 'All Devices',
}

/**
 * Roblox Experience Type
 */
export enum RobloxExperienceType {
  Game = 'Game',
  Hangout = 'Hangout',
  Concert = 'Concert',
  Event = 'Event',
  BrandedExperience = 'Branded Experience',
  Educational = 'Educational',
  Portfolio = 'Portfolio',
}

/**
 * Core Game System (reusable mechanics)
 */
export enum CoreGameSystem {
  // Collection Systems
  PetSystem = 'Pet System',
  EggHatching = 'Egg Hatching',
  ItemCollection = 'Item Collection',
  CardCollection = 'Card Collection',
  MountSystem = 'Mount System',

  // Progression
  Rebirth = 'Rebirth/Prestige',
  Leveling = 'Leveling System',
  SkillTree = 'Skill Tree',
  Quests = 'Quest System',
  Achievements = 'Achievement System',
  DailyRewards = 'Daily Rewards',
  SeasonPass = 'Season/Battle Pass',

  // Economy
  MultipleCurrencies = 'Multiple Currencies',
  Trading = 'Trading System',
  Marketplace = 'Player Marketplace',
  Crafting = 'Crafting System',
  Upgrades = 'Upgrade System',

  // Social
  Multiplayer = 'Multiplayer',
  Guilds = 'Guilds/Clans',
  Leaderboards = 'Leaderboards',
  Chat = 'Chat System',
  Friends = 'Friend System',
  PvP = 'PvP Combat',
  Coop = 'Co-op Gameplay',

  // Engagement
  Events = 'Limited Events',
  DailyLogin = 'Daily Login Bonus',
  Codes = 'Promo Codes',
  Giveaways = 'Giveaways',
  Updates = 'Regular Updates',

  // Monetization
  GamePasses = 'Game Passes',
  DevProducts = 'Developer Products',
  RobuxPurchases = 'Robux Purchases',
  VIPServer = 'VIP Servers',
  PremiumBenefits = 'Premium Benefits',

  // World
  OpenWorld = 'Open World',
  Zones = 'Multiple Zones',
  Teleportation = 'Teleportation',
  Housing = 'Player Housing',
  Customization = 'Character Customization',
}

/**
 * Success Factor for games
 */
export interface GameSuccessFactorDto {
  factor: string;
  description: string;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  implementedBy: string[]; // Game names that have this
  howToImplement: string;
  estimatedEffort: 'Hours' | 'Days' | 'Weeks' | 'Months';
}

/**
 * Game Feature Analysis - How a specific feature works in a game
 */
export interface GameFeatureAnalysisDto extends AuditedEntityDto {
  gameId: string;
  featureName: string;
  systemType: CoreGameSystem;

  // Analysis
  description: string;
  howItWorks: string;
  userExperience: string;
  monetization?: string;

  // Rating
  executionQuality: number; // 1-10
  playerEngagement: number; // 1-10
  monetizationEffectiveness: number; // 1-10
  overallScore: number;

  // Learnings
  whatWorksWell: string[];
  whatCouldImprove: string[];
  keyTakeaways: string[];

  // Implementation notes
  implementationComplexity: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  estimatedDevTime: string;
  dependencies: string[];
  technicalNotes: string;

  // Screenshots/References
  screenshotUrls: string[];
  videoUrl?: string;
}

/**
 * Roblox Game Metrics
 */
export interface RobloxGameMetricsDto {
  // Player counts
  currentPlayers: number;
  peakPlayers: number;
  totalVisits: number;
  favoritesCount: number;

  // Engagement
  averagePlayTime: number; // minutes
  dayOneRetention: number; // percentage
  weeklyRetention: number;
  monthlyRetention: number;

  // Revenue estimates
  estimatedDailyRevenue: number; // USD
  estimatedMonthlyRevenue: number;
  robuxPerVisit: number;

  // Growth
  dailyNewPlayers: number;
  weeklyGrowthRate: number;

  // Social
  groupMembers: number;
  discordMembers: number;
  youtubeViews: number;

  // Quality
  likeRatio: number; // percentage
  lastUpdated: Date;
}

/**
 * Roblox Game DTO - Full competitor/reference game analysis
 */
export interface RobloxGameDto extends AuditedEntityDto {
  // Link to base product
  productId?: string;

  // Basic Info
  name: string;
  slug: string;
  robloxGameId: string;
  robloxUrl: string;
  thumbnailUrl?: string;
  iconUrl?: string;

  // Classification
  genre: RobloxGenre;
  subGenres: RobloxSubGenre[];
  experienceType: RobloxExperienceType;

  // Age & Content Ratings (Official Roblox Experience Guidelines)
  ageRating: RobloxAgeRating;
  targetAgeGroup: RobloxAgeGroup;
  contentDescriptors: RobloxContentDescriptor[];

  // Device Support
  supportedDevices: RobloxDevice[];
  optimizedFor?: RobloxDevice;

  // Studio
  developerName: string;
  developerGroupId?: string;
  studioSize: 'Solo' | 'Small Team' | 'Medium Studio' | 'Large Studio';

  // Release
  releaseDate: Date;
  lastUpdateDate: Date;
  updateFrequency: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Sporadic';

  // Core Systems Used
  coreSystems: CoreGameSystem[];

  // Features analyzed in detail
  featureAnalyses: GameFeatureAnalysisDto[];

  // Metrics
  metrics: RobloxGameMetricsDto;

  // Analysis
  relationship: 'Competitor' | 'Inspiration' | 'Reference' | 'Our Game';
  threatLevel: 'High' | 'Medium' | 'Low';

  // SWOT
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];

  // Key Insights
  whySuccessful: string[];
  uniqueFeatures: string[];
  playerFavorites: string[]; // What players love most
  commonComplaints: string[]; // From reviews

  // Monetization
  monetizationStrategies: string[];
  estimatedARPU: number;
  topGamePasses: string[];
  topDevProducts: string[];

  // For our development
  featuresToCopy: string[];
  featuresToImprove: string[];
  featuresToAvoid: string[];
  priorityForStudy: number; // 1-100

  // Notes
  researchNotes: string;
  lastResearchDate: Date;

  tags: string[];
}

/**
 * Feature Requirement - What we need to build
 */
export interface FeatureRequirementDto extends AuditedEntityDto {
  projectId: string;
  featureName: string;
  systemType: CoreGameSystem;

  // Priority (RICE)
  reach: number; // How many players affected (1-10)
  impact: number; // How much value (1-10)
  confidence: number; // How sure are we (1-100%)
  effort: number; // Dev weeks
  riceScore: number; // Calculated

  // Requirement
  description: string;
  userStory: string;
  acceptanceCriteria: string[];

  // Research
  inspiredBy: string[]; // Game names
  referenceUrls: string[];
  competitorImplementations: string;

  // Implementation
  status:
    | 'Backlog'
    | 'Planned'
    | 'In Progress'
    | 'Testing'
    | 'Done'
    | 'Cancelled';
  assignee?: string;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;

  // Estimation
  estimatedHours: number;
  actualHours?: number;
  complexity: 'Simple' | 'Medium' | 'Complex' | 'Epic';

  // Dependencies
  dependencies: string[];
  blockedBy: string[];

  // Technical
  technicalApproach: string;
  technicalRisks: string[];

  // Tags
  tags: string[];
}

/**
 * Game Development Project - Our game being built
 */
export interface GameProjectDto extends AuditedEntityDto {
  name: string;
  slug: string;
  codename: string;
  genre: RobloxGenre;

  // Vision
  elevatorPitch: string;
  targetAudience: string;
  coreLoop: string;
  uniqueSellingPoints: string[];

  // Research
  competitorGames: string[]; // RobloxGameDto IDs
  inspirationGames: string[];
  featureMatrix: Record<string, boolean>; // CoreSystem -> included

  // Planning
  targetRevenueMonthly: number;
  targetPlayers: number;
  launchDate?: Date;

  // Status
  phase:
    | 'Research'
    | 'Design'
    | 'Development'
    | 'Testing'
    | 'Soft Launch'
    | 'Live'
    | 'Maintenance';
  completionPercentage: number;

  // Features
  features: FeatureRequirementDto[];
  mvpFeatures: string[]; // Feature IDs for MVP
  postLaunchFeatures: string[];

  // Team
  teamMembers: string[];
  projectLead?: string;

  // Budget
  developmentBudget: number;
  marketingBudget: number;

  // Risks
  risks: {
    risk: string;
    mitigation: string;
    severity: 'High' | 'Medium' | 'Low';
  }[];

  // Links
  robloxGameId?: string;
  groupId?: string;
  discordUrl?: string;
  trelloUrl?: string;

  tags: string[];
}

/**
 * Marketing Plan for game launch
 */
export interface GameMarketingPlanDto extends AuditedEntityDto {
  projectId: string;
  name: string;

  // Overview
  goal: string;
  targetAudience: string;
  budget: number;
  startDate: Date;
  endDate: Date;

  // Channels
  channels: {
    channel:
      | 'YouTube'
      | 'TikTok'
      | 'Twitter'
      | 'Discord'
      | 'Reddit'
      | 'Roblox Ads'
      | 'Influencers'
      | 'Other';
    budget: number;
    targetReach: number;
    tactics: string[];
    kpis: string[];
  }[];

  // Pre-Launch
  preLaunchActivities: {
    activity: string;
    date: Date;
    status: 'Planned' | 'In Progress' | 'Done';
    notes: string;
  }[];

  // Launch
  launchActivities: {
    activity: string;
    date: Date;
    status: 'Planned' | 'In Progress' | 'Done';
    notes: string;
  }[];

  // Post-Launch
  postLaunchActivities: {
    activity: string;
    date: Date;
    status: 'Planned' | 'In Progress' | 'Done';
    notes: string;
  }[];

  // Influencer Strategy
  influencers: {
    name: string;
    platform: string;
    followers: number;
    status:
      | 'Identified'
      | 'Contacted'
      | 'Negotiating'
      | 'Confirmed'
      | 'Completed';
    cost: number;
    expectedViews: number;
    actualViews?: number;
  }[];

  // Content Plan
  contentPlan: {
    contentType: string;
    platform: string;
    scheduledDate: Date;
    status: 'Draft' | 'Ready' | 'Published';
    url?: string;
    metrics?: { views: number; engagement: number };
  }[];

  // Success Metrics
  successMetrics: {
    metric: string;
    target: number;
    current: number;
    status: 'On Track' | 'Behind' | 'Exceeded';
  }[];

  // Learnings
  whatWorked: string[];
  whatDidntWork: string[];
  lessonsLearned: string[];

  tags: string[];
}

/**
 * Implementation Tracker - Track what we're building
 */
export interface ImplementationTrackerDto extends AuditedEntityDto {
  projectId: string;
  featureId: string;

  // Progress
  phase: 'Design' | 'Development' | 'Testing' | 'Review' | 'Done';
  progressPercentage: number;

  // Work log
  workLogs: {
    date: Date;
    hoursWorked: number;
    description: string;
    blockers?: string;
  }[];

  // Quality
  testsWritten: boolean;
  codeReviewed: boolean;
  documentationWritten: boolean;

  // Issues
  bugs: {
    description: string;
    severity: 'Critical' | 'Major' | 'Minor';
    status: 'Open' | 'Fixing' | 'Fixed';
  }[];

  // Metrics after release
  postReleaseMetrics?: {
    playerUsage: number;
    bugsReported: number;
    playerFeedback: string[];
    performanceImpact: string;
  };
}

// Filter DTOs
export interface RobloxGameFilterDto extends PagedAndSortedResultRequestDto {
  filter?: string;
  genre?: RobloxGenre;
  relationship?: string;
  minPlayers?: number;
  minRevenue?: number;
  hasCoreSystem?: CoreGameSystem;
  priorityForStudy?: number;
}

export interface FeatureRequirementFilterDto
  extends PagedAndSortedResultRequestDto {
  filter?: string;
  projectId?: string;
  status?: string;
  systemType?: CoreGameSystem;
  minRiceScore?: number;
}
