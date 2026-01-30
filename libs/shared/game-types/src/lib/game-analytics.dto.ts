import { AuditedEntityDto } from './base.dto';

/**
 * Game Analytics DTO - Comprehensive metrics for game success analysis
 * Used to calculate optimal game formulas and identify patterns
 */
export interface GameAnalyticsDto extends AuditedEntityDto {
  gameId: string;

  // ==================== GROWTH METRICS ====================
  growthMetrics: {
    // Player Growth
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    playerGrowthRate30d: number; // percentage growth over 30 days
    playerGrowthRate90d: number; // percentage growth over 90 days
    viralCoefficient: number; // K-factor (users inviting users)

    // Trending Analysis
    trendingScore: number; // 1-100, how "hot" the game is right now
    momentumDirection: 'rising' | 'stable' | 'declining';
    daysAtTrend: number; // How long it's been trending
    peakPositionReached: number; // Best chart position ever
    currentChartPosition: number;
  };

  // ==================== REVENUE METRICS ====================
  revenueMetrics: {
    // Core Revenue
    estimatedMonthlyRevenue: number;
    estimatedLifetimeRevenue: number;
    revenueGrowthRate30d: number; // percentage

    // Unit Economics
    arpu: number; // Average Revenue Per User
    arppu: number; // Average Revenue Per Paying User
    arpdau: number; // Average Revenue Per Daily Active User
    ltv: number; // Lifetime Value per user
    cac: number; // Customer Acquisition Cost (if known)
    ltvCacRatio: number; // LTV/CAC ratio (>3 is great)

    // Conversion
    conversionRate: number; // Free to paid percentage
    firstPurchaseConversion: number; // % who make first purchase
    repeatPurchaseRate: number; // % who make second purchase
    whalePercentage: number; // % of top spenders

    // Monetization Efficiency
    revenuePerConcurrentPlayer: number; // Revenue/$1000 concurrent
    marginScore: number; // 1-100, overall monetization efficiency
  };

  // ==================== RETENTION METRICS ====================
  retentionMetrics: {
    // Day-based retention
    d1Retention: number;
    d3Retention: number;
    d7Retention: number;
    d14Retention: number;
    d30Retention: number;
    d60Retention: number;
    d90Retention: number;

    // Session Metrics
    averageSessionLength: number; // minutes
    sessionsPerDay: number;
    medianSessionLength: number;
    peakPlaytimeHour: number; // 0-23 UTC

    // Stickiness
    dauMauRatio: number; // DAU/MAU ratio (>20% is great)
    stickinessScore: number; // 1-100, overall stickiness

    // Churn
    churnRate30d: number; // % who left in 30 days
    resurrectionRate: number; // % who come back after churning
    averageLifespan: number; // days before churning
    retentionScore: number; // 1-100, overall retention health
  };

  // ==================== ENGAGEMENT METRICS ====================
  engagementMetrics: {
    // In-Game Actions
    actionsPerSession: number;
    purchasesPerSession: number;
    socialActionsPerSession: number; // trades, chats, shares

    // Content Consumption
    contentCompletionRate: number; // % who complete main loop
    featureAdoptionRate: number; // % using core features
    eventParticipationRate: number; // % joining special events

    // Social
    friendsPerPlayer: number;
    guildMembershipRate: number; // % in guilds/clans
    tradeVolumePerPlayer: number;
    chatMessagesPerSession: number;

    // Engagement Score
    engagementScore: number; // 1-100, overall engagement
  };

  // ==================== COMPOSITE SCORES ====================
  compositeScores: {
    // Overall Success Scores (1-100)
    overallSuccessScore: number; // Weighted combination of all metrics
    replicationWorthiness: number; // How worth it is to clone/study
    marketFitScore: number; // Product-market fit indicator

    // Category Rankings
    growthRank: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
    marginRank: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
    retentionRank: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
    engagementRank: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

    // Investment Score
    developmentEffort: 'Low' | 'Medium' | 'High' | 'Expert';
    roiPotential: number; // 1-100, expected return on investment
    riskLevel: 'Low' | 'Medium' | 'High';
  };

  // ==================== FEATURE IMPACT ANALYSIS ====================
  featureImpact: {
    // Which features drive which metrics
    retentionDrivers: { feature: string; impact: number }[];
    revenueDrivers: { feature: string; impact: number }[];
    growthDrivers: { feature: string; impact: number }[];
    engagementDrivers: { feature: string; impact: number }[];
  };

  // ==================== TREND DATA ====================
  historicalData?: {
    date: string;
    concurrentPlayers: number;
    revenue: number;
    newUsers: number;
  }[];
}

/**
 * Genre Analytics - Aggregate data for game genres
 */
export interface GenreAnalyticsDto {
  genre: string;

  // Sample Size
  gamesAnalyzed: number;
  totalPlayers: number;

  // Averages
  averageRetention: {
    d1: number;
    d7: number;
    d30: number;
  };
  averageArpu: number;
  averageSessionLength: number;
  averageConversionRate: number;

  // Rankings (compared to other genres)
  growthPotential: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  marginPotential: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  retentionPotential: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  developmentComplexity: 'Low' | 'Medium' | 'High' | 'Expert';

  // Market Analysis
  marketSaturation: 'Low' | 'Medium' | 'High' | 'Oversaturated';
  competitorCount: number;
  trendDirection: 'rising' | 'stable' | 'declining';

  // Best Practices
  topFeatures: string[];
  bestMonetizationModels: string[];
  successFactors: string[];
  commonMistakes: string[];
}

/**
 * Feature Analytics - Success data for individual features
 */
export interface FeatureAnalyticsDto {
  featureName: string;
  featureCategory: string;

  // Adoption
  gamesWithFeature: number;
  adoptionRate: number; // % of top games using this

  // Impact Scores (1-10)
  retentionImpact: number;
  revenueImpact: number;
  engagementImpact: number;
  growthImpact: number;

  // Implementation
  implementationComplexity: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  developmentTimeWeeks: number;
  maintenanceBurden: 'Low' | 'Medium' | 'High';

  // ROI Analysis
  roiScore: number; // 1-100, impact per effort
  priorityRank: number; // Rank against all features

  // Synergies
  bestPairedWith: string[];
  conflictsWith: string[];
}

/**
 * Perfect Game Formula - Data-driven optimal game configuration
 */
export interface PerfectGameFormulaDto extends AuditedEntityDto {
  // Goal Configuration
  optimizeFor: 'growth' | 'revenue' | 'retention' | 'balanced';
  targetAudience: string;
  developmentBudget: 'Low' | 'Medium' | 'High';

  // Recommended Configuration
  recommendedGenre: string;
  recommendedFeatures: {
    feature: string;
    priority: 'Must-Have' | 'Should-Have' | 'Nice-to-Have';
    expectedImpact: string;
    implementationOrder: number;
  }[];

  // Monetization Strategy
  recommendedMonetization: {
    model: string;
    pricePoints: { item: string; price: number; rationale: string }[];
    expectedArpu: number;
    expectedConversion: number;
  };

  // Projected Metrics
  projectedMetrics: {
    d1Retention: number;
    d7Retention: number;
    d30Retention: number;
    monthlyRevenue: number;
    concurrentPlayers: number;
    viralCoefficient: number;
  };

  // Risk Analysis
  riskFactors: {
    risk: string;
    mitigation: string;
    severity: 'Low' | 'Medium' | 'High';
  }[];
  successProbability: number; // 1-100

  // Implementation Timeline
  developmentPhases: {
    phase: string;
    duration: string;
    features: string[];
    milestones: string[];
  }[];

  // Reference Games
  modelAfter: { gameId: string; gameName: string; takeaway: string }[];
}
