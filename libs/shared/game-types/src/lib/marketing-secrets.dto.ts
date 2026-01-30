import { AuditedEntityDto } from './base.dto';

/**
 * Marketing Secrets - Complete marketing playbook for maximum reach & conversion
 */
export interface MarketingSecretsDto extends AuditedEntityDto {
  gameId: string;

  // 🎯 Pre-Launch Marketing
  preLaunchStrategies: string[]; // Building hype before launch
  betaMarketingTactics: string[]; // Leveraging early access
  influencerOutreach: InfluencerStrategyDto[];
  communityBuilding: string[]; // Discord, Reddit, forums
  waitlistStrategies: string[]; // Generating pre-launch signups
  preLaunchContent: string[]; // Teasers, trailers, dev logs

  // 🚀 Launch Marketing
  launchDayChecklist: string[]; // Everything for launch day
  launchWeekStrategies: string[]; // Critical first week
  pressKitEssentials: string[]; // What media needs
  launchPartners: string[]; // Who to partner with
  initialUserAcquisition: string[]; // Getting first 1000 users
  launchMomentum: string[]; // Keeping the buzz going

  // 📱 Social Media Secrets
  platformStrategy: SocialPlatformStrategyDto[]; // Platform-specific tactics
  contentCalendar: string; // What to post when
  viralContentFormulas: string[]; // Content that spreads
  engagementTactics: string[]; // Getting likes, shares, comments
  hashtagStrategy: string[]; // Getting discovered
  socialListening: string[]; // Monitoring conversations

  // 🎬 Content Marketing
  youtubeSeoSecrets: string[]; // Getting views
  tiktokGrowthHacks: string[]; // Going viral on TikTok
  streamMarketingTactics: string[]; // Leveraging Twitch/YouTube Live
  contentCreatorProgram: string[]; // Supporting content creators
  ugcStrategy: string[]; // User-generated content
  clipableMoments: string[]; // Creating shareable moments

  // 🤝 Influencer Marketing
  microInfluencerStrategy: string[]; // Small but mighty influencers
  megaInfluencerTactics: string[]; // Big name partnerships
  influencerActivation: string[]; // Getting influencers to promote
  affiliatePrograms: string[]; // Revenue sharing programs
  creatorTools: string[]; // Tools for content creators
  sponsorshipDeals: string[]; // What to offer influencers

  // 💰 Paid Advertising
  facebookAdsSecrets: string[]; // FB/Instagram ads that work
  tiktokAdsFormulas: string[]; // TikTok advertising
  youtubeAdsStrategy: string[]; // Pre-roll ads
  adCreativeFormulas: string[]; // Ad copy & visuals that convert
  targetingSecrets: string[]; // Who to target
  budgetAllocation: string[]; // Where to spend money
  roasOptimization: string[]; // Return on ad spend

  // 📧 Email & Retention Marketing
  emailCampaignSecrets: string[]; // Email that gets opened
  retargetingStrategies: string[]; // Bringing back visitors
  winbackCampaigns: string[]; // Re-engaging lapsed users
  pushNotificationTactics: string[]; // Notifications that work
  smsMarketingStrategy: string[]; // Text marketing
  notificationTiming: string[]; // Best times to send

  // 🔍 ASO & SEO
  appStoreOptimization: string[]; // Getting featured
  keywordStrategy: string[]; // What keywords to target
  screenshotOptimization: string[]; // Screenshots that convert
  descriptionFormulas: string[]; // App description best practices
  reviewStrategy: string[]; // Getting 5-star reviews
  platformAlgorithmHacks: string[]; // Platform discovery

  // 🎁 Growth & Referral Marketing
  referralProgramDesign: string[]; // Friend invite systems
  incentiveStructure: string[]; // What to offer for referrals
  socialSharingHooks: string[]; // When to ask for shares
  viralLoops: string[]; // Built-in viral mechanics
  crossPromotion: string[]; // Promoting other games
  partnershipOpportunities: string[]; // Who to partner with

  // 📊 Analytics & Optimization
  marketingMetrics: string[]; // What to measure
  attributionModeling: string[]; // Knowing what works
  abTestingPlaybook: string[]; // Testing everything
  conversionOptimization: string[]; // Improving conversions
  cohortAnalysis: string[]; // Understanding user segments
  ltvcacRatio: string; // Lifetime value vs acquisition cost

  // 🌍 Regional Marketing
  localizationStrategy: string[]; // Adapting for markets
  regionalTactics: { region: string; tactics: string[] }[];
  culturalConsiderations: string[]; // Avoiding mistakes
  regionalPartners: string[]; // Local partnerships
  languageStrategy: string[]; // Which languages to support

  // 🎯 Niche Marketing
  communityTargeting: string[]; // Finding your audience
  subRedditStrategies: string[]; // Reddit marketing
  discordGrowth: string[]; // Building Discord communities
  forumMarketing: string[]; // Forum participation
  nichePlatforms: string[]; // Platform-specific approaches

  // 🚫 Marketing Mistakes to Avoid
  commonMarketingFails: string[]; // What NOT to do
  reputationRisks: string[]; // Protecting your brand
  overMarketingPitfalls: string[]; // When to pull back
  contentMistakes: string[]; // Bad content to avoid
  budgetWaste: string[]; // Where NOT to spend money
}

/**
 * Social Platform Strategy DTO
 */
export interface SocialPlatformStrategyDto {
  platform: 'YouTube' | 'TikTok' | 'Instagram' | 'Twitter' | 'Discord' | 'Reddit' | 'Twitch' | 'Other';
  postingFrequency: string;
  contentTypes: string[]; // What to post
  bestPractices: string[];
  growthTactics: string[];
  engagementSecrets: string[];
  algorithmHacks: string[];
  mistakes: string[]; // What not to do
}

/**
 * Influencer Strategy DTO
 */
export interface InfluencerStrategyDto {
  influencerTier: 'Nano' | 'Micro' | 'Mid' | 'Macro' | 'Mega';
  approach: string;
  compensation: string;
  expectedReach: number;
  expectedConversion: number;
  bestPractices: string[];
  outreachTemplate: string;
}

/**
 * Growth Hacking Secrets - Explosive growth tactics
 */
export interface GrowthHackingSecretsDto extends AuditedEntityDto {
  gameId: string;

  // 🚀 Proven Growth Hacks
  top10GrowthHacks: { hack: string; effectiveness: number; implementation: string }[];
  quickWins: string[]; // Easy tactics with big impact
  experimentIdeas: string[]; // Things to try
  unconventionalTactics: string[]; // Outside-the-box ideas

  // 📈 Viral Mechanics
  viralLoopDesign: string[]; // Built-in virality
  sharingIncentives: string[]; // Why users share
  spreadMechanisms: string[]; // How it spreads
  networkEffects: string[]; // Value from more users

  // 🎯 Acquisition Channels
  channelPerformance: { channel: string; cost: number; quality: number; volume: number }[];
  channelOptimization: string[]; // Optimizing each channel
  newChannelTesting: string[]; // Testing new channels
  channelMix: string; // Optimal channel allocation

  // 💡 Product-Led Growth
  productViralHooks: string[]; // Built-in viral features
  frictionRemoval: string[]; // Making signup easier
  activationOptimization: string[]; // Getting users to "aha moment"
  retentionHacks: string[]; // Keeping users engaged

  // 🔄 Retention & Resurrection
  dayOneRetention: string[]; // Keeping users on day 1
  weekOneRetention: string[]; // Critical first week
  longTermRetention: string[]; // Months-long engagement
  winBackStrategies: string[]; // Bringing back lapsed users
  churnPrevention: string[]; // Stopping churn before it happens

  // 🎁 Incentive Systems
  onboardingIncentives: string[]; // Rewards for new users
  progressionIncentives: string[]; // Rewards for advancing
  socialIncentives: string[]; // Rewards for social actions
  purchaseIncentives: string[]; // Rewards for spending

  // 🚫 Growth Killers
  growthBlockers: string[]; // Things that prevent growth
  scalingChallenges: string[]; // Problems at scale
  mistakesToAvoid: string[]; // What NOT to do
}

/**
 * Community Building Secrets
 */
export interface CommunitySecretsDto extends AuditedEntityDto {
  gameId: string;

  // 👥 Community Foundation
  communityValues: string[]; // Core community principles
  moderationStrategy: string[]; // Managing behavior
  communityGuidelines: string[]; // Rules & expectations
  onboardingNewMembers: string[]; // Welcoming new users
  communityLeaders: string[]; // Identifying & empowering leaders

  // 💬 Engagement Tactics
  discussionPrompts: string[]; // Starting conversations
  eventIdeas: string[]; // Community events
  contestStrategies: string[]; // Running contests
  rewardPrograms: string[]; // Rewarding active members
  recognitionSystems: string[]; // Highlighting contributors

  // 🎮 Player-to-Player Value
  mentorshipPrograms: string[]; // Veterans helping newbies
  guildSystems: string[]; // Social structures
  cooperativeMechanics: string[]; // Working together
  competitiveMechanics: string[]; // Competing healthily
  tradingSystems: string[]; // Player-to-player economy

  // 📢 Communication Channels
  discordManagement: string[]; // Running Discord successfully
  forumStrategies: string[]; // Active forums
  inGameChat: string[]; // Chat best practices
  socialMediaIntegration: string[]; // Connecting platforms
  communicationCadence: string; // How often to communicate

  // 🔒 Trust & Safety
  toxicityPrevention: string[]; // Preventing toxic behavior
  conflictResolution: string[]; // Handling disputes
  reportingSystems: string[]; // Easy reporting
  moderatorTraining: string[]; // Training moderators
  appealProcess: string[]; // Handling bans fairly

  // 🚫 Community Mistakes
  communityKillers: string[]; // Things that destroy communities
  moderationMistakes: string[]; // Common mod errors
  communicationFailures: string[]; // Bad communication
}

/**
 * Live Operations Playbook
 */
export interface LiveOpsPlaybookDto extends AuditedEntityDto {
  gameId: string;

  // 📅 Content Calendar
  dailyActivities: string[]; // Daily refresh content
  weeklyEvents: string[]; // Weekly special events
  monthlyUpdates: string[]; // Monthly content drops
  seasonalContent: string[]; // Holiday/seasonal content
  specialEvents: string[]; // One-time big events

  // 🎪 Event Design
  eventFormulas: EventFormulaDto[]; // Proven event structures
  eventTiming: string[]; // Best times to run events
  eventRewards: string[]; // What to offer
  eventDifficulty: string[]; // Balancing challenge
  eventPromotion: string[]; // Marketing events

  // 🔄 Update Strategy
  updateFrequency: string; // How often to update
  patchNotes Optimization: string[]; // Communication updates
  featureRollout: string[]; // Releasing new features
  contentPipeline: string; // Planning ahead
  playerFeedbackIntegration: string[]; // Acting on feedback

  // 💰 Monetization Events
  saleStrategies: string[]; // When/how to run sales
  limitedOffers: string[]; // Time-limited deals
  bundleRotation: string; // Rotating bundles
  flashSales: string[]; // Short-term sales
  vipEvents: string[]; // Exclusive for spenders

  // 📊 Performance Monitoring
  realTimeMetrics: string[]; // What to watch live
  alertSystems: string[]; // When to get notified
  quickResponses: string[]; // Reacting to issues
  optimizationCycle: string; // Continuous improvement

  // 🚨 Crisis Management
  crisisPreparation: string[]; // Being ready
  communicationProtocol: string[]; // What to say when
  issueResolution: string[]; // Fixing problems fast
  reputationRecovery: string[]; // Bouncing back
  playerCompensation: string[]; // Making it right

  // 🚫 Live Ops Mistakes
  updateMistakes: string[]; // Bad update practices
  eventFailures: string[]; // What kills events
  communicationErrors: string[]; // PR disasters to avoid
}

/**
 * Event Formula DTO
 */
export interface EventFormulaDto {
  eventType: string;
  duration: string;
  structure: string;
  rewards: string[];
  marketing: string[];
  successMetrics: string[];
  commonPitfalls: string[];
}

/**
 * Monetization Playbook - The complete money-making guide
 */
export interface MonetizationPlaybookDto extends AuditedEntityDto {
  gameId: string;

  // 💎 Pricing Mastery
  pricePointPsychology: string[]; // Why prices work
  bundleScience: string[]; // Perfect bundle formulas
  discountStrategy: string[]; // When/how to discount
  urgencyTactics: string[]; // Creating buying pressure
  valuePerception: string[]; // Making items feel valuable

  // 🎯 Conversion Optimization
  firstPurchaseStrategies: string[]; // Converting free users
  starterPackFormulas: string[]; // Irresistible first offers
  salesTiming: string[]; // Best conversion moments
  offerPlacement: string[]; // Where to show offers
  checkoutOptimization: string[]; // Reducing cart abandon

  // 🐋 Whale Strategies
  whaleIdentification: string[]; // Finding high spenders
  vipTreatment: string[]; // Keeping whales happy
  exclusiveContent: string[]; // Premium-only features
  personalizedOffers: string[]; // Tailored to big spenders
  whaleRetention: string[]; // Preventing whale churn

  // 🆓 Free-to-Play Balance
  generosityFormula: string; // How much free content
  progressionBalance: string; // Free vs paid advantage
  fairnessMetrics: string[]; // Avoiding pay-to-win
  freePlayerValue: string[]; // Why free players matter
  conversionPressure: string; // Not being too pushy

  // 💳 Payment Psychology
  anchoringEffects: string[]; // Price comparison tactics
  decoyPricing: string[]; // Adding strategic options
  scarcityTactics: string[]; // Limited availability
  socialProof: string[]; // "Others are buying"
  lossAversion: string[]; // Fear of missing out

  // 📊 Segmentation
  playerSegments: PlayerSegmentDto[]; // Different player types
  personalizedOffers: string[]; // Offers per segment
  behavioralTargeting: string[]; // Based on actions
  spendingPatterns: string[]; // Understanding spending

  // 🎁 Retention Monetization
  repeatPurchaseStrategies: string[]; // Keeping them buying
  subscriptionModels: string[]; // Recurring revenue
  seasonPassFormula: string; // Battle pass design
  loyaltyPrograms: string[]; // Rewarding repeat buyers

  // 🚫 Monetization Mistakes
  predatoryPractices: string[]; // Never do these
  balanceBreakers: string[]; // Pay-to-win traps
  playerBacklash: string[]; // What causes outrage
  regulationRisks: string[]; // Legal considerations
  ethicalBoundaries: string; // Responsible monetization
}

/**
 * Player Segment DTO
 */
export interface PlayerSegmentDto {
  segmentName: string;
  characteristics: string[];
  size: number; // Percentage of player base
  monetizationPotential: number; // 1-10 scale
  bestOffers: string[];
  retentionStrategies: string[];
  engagementTactics: string[];
}

/**
 * Ultimate Success Checklist - DO's and DON'Ts for everything
 */
export interface UltimateSuccessChecklistDto extends AuditedEntityDto {
  gameId: string;

  // ✅ Critical DO's - Must-haves for success
  preProductionDos: string[];
  productionDos: string[];
  preLaunchDos: string[];
  launchDos: string[];
  postLaunchDos: string[];
  growthPhaseDos: string[];
  maturityPhaseDos: string[];

  // ❌ Critical DON'Ts - Game killers to avoid
  preProductionDonts: string[];
  productionDonts: string[];
  preLaunchDonts: string[];
  launchDonts: string[];
  postLaunchDonts: string[];
  growthPhaseDonts: string[];
  maturityPhaseDonts: string[];

  // 🎯 Phase-Specific Priorities
  conceptPhase: PhaseChecklistDto;
  prototyping Phase: PhaseChecklistDto;
  preProduction: PhaseChecklistDto;
  production: PhaseChecklistDto;
  alphaPhase: PhaseChecklistDto;
  betaPhase: PhaseChecklistDto;
  softLaunch: PhaseChecklistDto;
  fullLaunch: PhaseChecklistDto;
  liveOps: PhaseChecklistDto;

  // 🏆 Success Guarantees
  nonNegotiables: string[]; // Must-haves for any successful game
  quickWins: string[]; // Easy wins with big impact
  gameChangers: string[]; // Features that transform a game
  differentiators: string[]; // What makes you unique

  // 💀 Fatal Mistakes
  careerEndingMistakes: string[]; // Mistakes that kill studios
  reputationDestroyers: string[]; // PR disasters
  communityKillers: string[]; // Things that lose players
  monetizationBackfires: string[]; // Money grabs that backfire

  // 🔄 Continuous Improvement
  weeklyChecklist: string[]; // What to do every week
  monthlyChecklist: string[]; // Monthly priorities
  quarterlyChecklist: string[]; // Quarterly goals
  annualChecklist: string[]; // Yearly strategic review
}

/**
 * Phase Checklist DTO
 */
export interface PhaseChecklistDto {
  phaseName: string;
  mustCompleteItems: string[];
  successMetrics: string[];
  exitCriteria: string[];
  commonBlockers: string[];
  timeAllocation: string;
  budgetConsiderations: string[];
}
