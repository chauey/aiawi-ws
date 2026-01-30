import { AuditedEntityDto } from './base.dto';

/**
 * Game Success Secrets - The "secret sauce" that makes games viral and profitable
 */
export interface GameSuccessSecretsDto extends AuditedEntityDto {
  gameId: string;

  // 🔥 Viral Loops
  viralMechanics: ViralMechanicDto[];
  socialSharingHooks: string[]; // When/why players share
  wordOfMouthTriggers: string[]; // What makes people talk about it
  viralCoefficient: number; // How many new users each user brings

  // 🎯 Retention Hooks
  firstSessionHooks: string[]; // What hooks players in first 5 minutes
  dailyHabits: string[]; // What brings them back daily
  longTermGoals: string[]; // What keeps them playing for months
  fomo: FOMOTechniqueDto[]; // Fear of missing out mechanics
  progressionPsychology: string[]; // Why they feel compelled to advance

  // 💰 Monetization Psychology
  monetizationTriggers: MonetizationTriggerDto[];
  pricingPsychology: string[]; // Anchoring, bundles, perceived value
  whaleOptimization: string[]; // How to convert high spenders
  conversionMoments: string[]; // Best times to show offers
  valuePerception: string[]; // How to make items feel valuable

  // 🎮 Core Engagement Loops
  coreGameLoop: string; // The addictive 30-second loop
  sessionGoals: string[]; // What players accomplish per session
  dopamineHits: string[]; // When/how players get satisfaction
  variableRewards: VariableRewardDto[]; // Unpredictable rewards
  progressionSatisfaction: string[]; // Why leveling feels good

  // 🏆 Competition & Achievement
  competitiveHooks: string[]; // Why players compete
  statusSymbols: string[]; // How players show off
  leaderboardPsychology: string[]; // Why rankings matter
  achievementDesign: string[]; // How achievements drive behavior

  // 👥 Social Dynamics
  communityBuilding: string[]; // How to foster community
  cooperationIncentives: string[]; // Why players team up
  socialProof: string[]; // How popularity breeds popularity
  influencerStrategy: string[]; // Leveraging content creators

  // 🎨 Polish & Feel
  juiciness: string[]; // Visual/audio feedback that feels amazing
  flowState: string[]; // How to keep players in "the zone"
  satisfactionMoments: string[]; // When players feel awesome
  frustrationMitigation: string[]; // How to prevent rage-quit

  // 📊 Data-Driven Secrets
  keyMetrics: string[]; // What to measure
  abTestingWins: string[]; // Proven optimization strategies
  playerSegmentation: string[]; // How different players behave
  churnPrediction: string[]; // Warning signs to watch

  // 🚀 Growth Hacks
  onboardingMagic: string[]; // Perfect first-time user experience
  tutorialSecrets: string[]; // Teaching without boring
  retentionTactics: string[]; // Bringing back lapsed users
  crossPromotionStrategies: string[]; // Leveraging other games

  // 🎁 Reward Economy
  rewardSchedule: string; // When to give rewards
  giftingStrategy: string[]; // Free stuff that drives behavior
  earnedVsPaid: string; // Balance of free vs purchased items
  rarityPsychology: string[]; // How scarcity drives desire

  // 🔄 Update Strategy
  contentCalendar: string; // How often to update
  liveOpsFormula: string[]; // Running live events
  seasonalStrategies: string[]; // Holiday/seasonal content
  metaProgression: string[]; // Long-term progression beyond core

  // ⚡ Quick Wins
  lowHangingFruit: string[]; // Easy changes = big impact
  mustHaves: string[]; // Non-negotiable features
  niceToHaves: string[]; // Features that boost but aren't critical
  avoidAtAllCosts: string[]; // Things that kill games
}

/**
 * Viral Mechanic DTO
 */
export interface ViralMechanicDto {
  name: string;
  description: string;
  effectiveness: number; // 1-10 scale
  implementation: string;
  examples: string[]; // Games that do this well
}

/**
 * FOMO (Fear Of Missing Out) Technique DTO
 */
export interface FOMOTechniqueDto {
  name: string;
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  effectiveness: number; // 1-10 scale
  implementation: string;
  ethicalConsiderations: string; // Important for responsible game design
}

/**
 * Monetization Trigger DTO
 */
export interface MonetizationTriggerDto {
  trigger: string;
  timing: string; // When in player journey
  effectiveness: number; // 1-10 scale
  conversionRate: number; // % of players who convert
  implementation: string;
  responsibleDesign: string; // Avoiding predatory practices
}

/**
 * Variable Reward DTO
 */
export interface VariableRewardDto {
  rewardType: string;
  frequency: 'Rare' | 'Uncommon' | 'Common' | 'Frequent';
  impactOnRetention: number; // 1-10 scale
  implementation: string;
  psychologyPrinciple: string; // Why this works
}

/**
 * Code Optimization Secrets - Performance & Architecture Best Practices
 */
export interface CodeOptimizationSecretsDto extends AuditedEntityDto {
  gameId: string;

  // 🚀 Performance Secrets
  renderingOptimizations: string[]; // FPS optimization tricks
  memoryManagement: string[]; // Preventing memory leaks
  networkOptimization: string[]; // Reducing latency
  loadingStrategies: string[]; // Fast startup times
  assetOptimization: string[]; // Smaller, faster assets

  // 🏗️ Architecture Patterns
  scalableArchitecture: string[]; // Patterns that scale
  codeOrganization: string[]; // Clean, maintainable structure
  designPatterns: string[]; // Which patterns to use where
  antiPatterns: string[]; // What NOT to do
  refactoringTriggers: string[]; // When to refactor

  // 🔒 Security Secrets
  cheatPrevention: string[]; // Anti-cheat strategies
  dataValidation: string[]; // Server-side validation
  exploitPrevention: string[]; // Common exploits to prevent
  accountSecurity: string[]; // Protecting user accounts

  // 🐛 Debug & Testing Secrets
  testingStrategies: string[]; // What/how to test
  debuggingTools: string[]; // Essential debug tools
  crashPrevention: string[]; // Avoiding crashes
  errorHandling: string[]; // Graceful failures

  // 📡 Multiplayer Secrets
  syncStrategies: string[]; // Keeping clients in sync
  lagCompensation: string[]; // Handling network lag
  serverArchitecture: string[]; // Scalable server design
  matchmakingAlgorithms: string[]; // Fair, fast matching

  // 💾 Data Management
  saveSystemDesign: string[]; // Reliable save/load
  cloudSyncStrategies: string[]; // Cross-device play
  dataCompression: string[]; // Reducing data size
  migrationStrategies: string[]; // Updating old data

  // 🔧 Tools & Workflow
  developmentTools: string[]; // Best tools to use
  automationScripts: string[]; // Time-saving automations
  cicdPipeline: string[]; // Continuous deployment
  monitoringTools: string[]; // Production monitoring

  // ⚡ Quick Code Wins
  performanceQuickFixes: string[]; // Easy optimizations
  commonBugFixes: string[]; // Frequent issues & solutions
  codeSmells: string[]; // Warning signs of bad code
  refactoringPriorities: string[]; // What to fix first
}

/**
 * Platform-Specific Secrets (Roblox, Mobile, etc.)
 */
export interface PlatformSecretsDto extends AuditedEntityDto {
  gameId: string;
  platform: string; // Roblox, Mobile, PC, etc.

  // 🎮 Platform Quirks
  platformLimitations: string[]; // Technical constraints
  platformStrengths: string[]; // What this platform does best
  bestPractices: string[]; // Platform-specific best practices
  commonMistakes: string[]; // Platform-specific pitfalls

  // 💸 Platform Monetization
  monetizationRules: string[]; // Platform policies
  revenueShare: string; // Platform's cut
  paymentMethods: string[]; // Available payment options
  regionConsiderations: string[]; // Regional differences

  // 📢 Platform Discovery
  algorithmSecrets: string[]; // How platform promotes games
  seoStrategies: string[]; // Getting discovered
  featuredStrategies: string[]; // Getting featured
  updateTiming: string[]; // Best times to update

  // 👥 Platform Community
  communityGuidelines: string[]; // What's allowed
  moderationTools: string[]; // Managing player behavior
  reportingSystems: string[]; // Handling reports
  platformEvents: string[]; // Platform-wide events to leverage
}

/**
 * Monetization Deep Dive - Advanced strategies
 */
export interface MonetizationDeepDiveDto extends AuditedEntityDto {
  gameId: string;

  // 💳 Pricing Strategies
  pricePoints: { price: number; conversionRate: number; reasoning: string }[];
  bundleFormulas: string[]; // How to create irresistible bundles
  limitedOffers: string[]; // Time-limited deal strategies
  urgencyTactics: string[]; // Creating urgency ethically

  // 🐋 Whale Management
  whaleIdentification: string[]; // How to spot high-value players
  whaleRetention: string[]; // Keeping high spenders happy
  vipPrograms: string[]; // Rewarding top spenders
  exclusiveContent: string[]; // Premium-only features

  // 🎁 Free-to-Play Balance
  generosityStrategy: string; // How much to give free
  paidAdvantages: string[]; // What paid players get
  payToWinLine: string; // Avoiding pay-to-win
  fairness: string[]; // Keeping non-payers engaged

  // 📊 Revenue Optimization
  abTestingResults: { test: string; winner: string; lift: number }[];
  conversionFunnelOptimization: string[]; // Improving conversion
  cartAbandonmentTactics: string[]; // Recovering lost sales
  upsellStrategies: string[]; // Getting larger purchases

  // 🎯 Targeting & Personalization
  segmentationStrategy: string[]; // Different offers for different players
  dynamicPricing: string; // Personalized pricing (ethical considerations)
  recommendationEngine: string; // Suggesting relevant items
  behavioralTriggers: string[]; // Showing offers based on behavior
}
