import { AuditedEntityDto } from './base.dto';

/**
 * ROI (Return on Investment) Analysis - Know what's worth it
 */
export interface ROIAnalysisDto extends AuditedEntityDto {
  gameId: string;
  itemType:
    | 'Feature'
    | 'Marketing Tactic'
    | 'System'
    | 'Content'
    | 'Update'
    | 'Tool'
    | 'Other';
  itemName: string;

  // 💰 Investment Required
  developmentCost: number; // In USD
  developmentTime: number; // In hours
  maintenanceCost: number; // Monthly cost
  marketingCost?: number; // If applicable
  totalInvestment: number; // All costs combined

  // 📈 Expected Returns
  expectedRevenueIncrease: MoneyEstimateDto;
  expectedRetentionImpact: PercentageEstimateDto;
  expectedEngagementLift: PercentageEstimateDto;
  expectedUserGrowth: NumberEstimateDto;
  expectedConversionLift: PercentageEstimateDto;

  // 🎯 ROI Metrics
  estimatedROI: number; // Percentage (200% = 2x return)
  paybackPeriod: number; // Months to break even
  netPresentValue: number; // NPV over 12 months
  confidenceLevel: 'Low' | 'Medium' | 'High' | 'Very High'; // How sure are we?

  // ⏱️ Timeline
  timeToImplement: number; // Days
  timeToImpact: number; // Days until you see results
  impactDuration: 'Short-Term' | 'Medium-Term' | 'Long-Term' | 'Permanent';

  // 📊 Success Probability
  successProbability: number; // Percentage (0-100)
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskFactors: string[];
  mitigationStrategies: string[];

  // 🎯 Priority Score
  priorityScore: number; // 1-100 calculated score
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  strategicImportance: number; // 1-10 scale
  competitiveNecessity: 'Optional' | 'Recommended' | 'Important' | 'Critical';

  // 📈 Historical Data
  industryBenchmark?: string; // What others achieved
  similarCaseStudies: CaseStudyDto[];
  provenResults: boolean;

  // 💡 Recommendation
  recommended: boolean;
  reasoning: string;
  alternativeSolutions: string[];
}

/**
 * Money Estimate DTO - Range-based financial estimates
 */
export interface MoneyEstimateDto {
  minimum: number; // Worst case
  expected: number; // Most likely
  maximum: number; // Best case
  currency: string; // USD, EUR, etc.
  timeframe:
    | 'Daily'
    | 'Weekly'
    | 'Monthly'
    | 'Quarterly'
    | 'Yearly'
    | 'Lifetime';
  confidenceLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  assumptions: string[]; // What we're assuming
}

/**
 * Percentage Estimate DTO
 */
export interface PercentageEstimateDto {
  minimum: number; // Worst case %
  expected: number; // Most likely %
  maximum: number; // Best case %
  baseline: number; // Current value
  confidenceLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  evidenceSource: string; // Where this estimate comes from
}

/**
 * Number Estimate DTO
 */
export interface NumberEstimateDto {
  minimum: number;
  expected: number;
  maximum: number;
  unit: string; // Users, downloads, sessions, etc.
  confidenceLevel: 'Low' | 'Medium' | 'High' | 'Very High';
}

/**
 * Case Study DTO
 */
export interface CaseStudyDto {
  gameName: string;
  implementation: string;
  investment: number;
  result: string;
  roi: number; // Percentage
  timeframe: string;
  source: string; // Where this data comes from
  relevance: number; // 1-10 how similar to your game
}

/**
 * Feature Impact Estimation
 */
export interface FeatureImpactEstimateDto extends AuditedEntityDto {
  featureId: string;
  gameId: string;
  featureName: string;

  // 💰 Revenue Impact
  revenueImpact: MoneyEstimateDto;
  monetizationPotential: number; // 1-10 scale
  arpdauLift: PercentageEstimateDto; // Avg revenue per daily active user
  conversionRateImpact: PercentageEstimateDto;

  // 👥 User Growth Impact
  userAcquisitionLift: NumberEstimateDto;
  viralCoefficient: number; // How many new users per existing user
  organicGrowthLift: PercentageEstimateDto;

  // 🔄 Retention Impact
  day1RetentionLift: PercentageEstimateDto;
  day7RetentionLift: PercentageEstimateDto;
  day30RetentionLift: PercentageEstimateDto;
  churnReduction: PercentageEstimateDto;
  sessionLengthIncrease: PercentageEstimateDto;
  sessionsPerDayIncrease: PercentageEstimateDto;

  // 🎮 Engagement Impact
  dailyActiveUsersLift: PercentageEstimateDto;
  monthlyActiveUsersLift: PercentageEstimateDto;
  engagementScore: number; // 1-10 scale
  addictionPotential: number; // 1-10 scale

  // ⏱️ Implementation
  developmentEffort: DevelopmentEffortDto;
  technicalRisk: TechnicalRiskDto;
  maintenanceBurden: 'Low' | 'Medium' | 'High' | 'Very High';

  // 🎯 Overall Assessment
  worthDoingScore: number; // 1-100
  recommendation: 'Skip' | 'Consider' | 'Recommended' | 'Must-Have';
  reasoning: string;
  competitorComparison: string; // How competitors handle this
}

/**
 * Development Effort DTO
 */
export interface DevelopmentEffortDto {
  estimatedHours: { min: number; expected: number; max: number };
  estimatedCost: MoneyEstimateDto;
  teamSize: number;
  complexity: 'Trivial' | 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Extreme';
  dependencies: string[];
  unknowns: string[]; // Things that could increase effort
  effortJustification: string;
}

/**
 * Technical Risk DTO
 */
export interface TechnicalRiskDto {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  potentialIssues: string[];
  performanceImpact: 'Negligible' | 'Minor' | 'Moderate' | 'Significant';
  scalabilityConcerns: string[];
  mitigationPlan: string[];
  fallbackOptions: string[];
}

/**
 * Marketing Tactic ROI
 */
export interface MarketingTacticROIDto extends AuditedEntityDto {
  tacticId: string;
  gameId: string;
  tacticName: string;
  channel: string;

  // 💰 Investment
  budget: MoneyEstimateDto;
  timeInvestment: number; // Hours
  resourcesRequired: string[];

  // 📊 Expected Results
  expectedReach: NumberEstimateDto; // Impressions
  expectedEngagement: NumberEstimateDto; // Clicks, likes, shares
  expectedConversions: NumberEstimateDto; // Installs, signups
  expectedRevenue: MoneyEstimateDto;

  // 🎯 Performance Metrics
  costPerThousandImpressions: MoneyEstimateDto; // CPM
  costPerClick: MoneyEstimateDto; // CPC
  costPerInstall: MoneyEstimateDto; // CPI
  costPerAcquisition: MoneyEstimateDto; // CPA
  returnOnAdSpend: number; // ROAS (300% = 3x return)

  // 📈 Impact
  brandAwarenessLift: PercentageEstimateDto;
  userAcquisitionCount: NumberEstimateDto;
  qualityScore: number; // 1-10 user quality
  ltv: MoneyEstimateDto; // Lifetime value of acquired users

  // ⭐ Recommendation
  recommended: boolean;
  bestFor: string[]; // When to use this tactic
  avoidIf: string[]; // When NOT to use
  optimizationTips: string[];
}

/**
 * System Investment Analysis
 */
export interface SystemInvestmentDto extends AuditedEntityDto {
  systemId: string;
  gameId: string;
  systemName: string;
  systemType: string;

  // 💰 Build vs Buy Analysis
  buildCost: MoneyEstimateDto;
  buildTime: { min: number; expected: number; max: number }; // Days
  buyCost: MoneyEstimateDto;
  buySetupTime: number; // Days
  recommendation: 'Build' | 'Buy' | 'Hybrid' | 'Skip';

  // 🔧 Ongoing Costs
  maintenanceCost: MoneyEstimateDto; // Monthly
  scalingCost: ScalingCostDto;
  serverCost?: MoneyEstimateDto; // If applicable

  // 📈 Value Delivered
  performanceGain: PercentageEstimateDto;
  scalabilityGain: number; // 1-10 scale
  maintenabilityGain: number; // 1-10 scale
  developerProductivityGain: PercentageEstimateDto;

  // 🎯 Strategic Value
  competitiveAdvantage: string;
  futureProofing: number; // 1-10 scale
  technicalDebtReduction: number; // 1-10 scale
  platformRequirement: boolean; // Must-have for platform?
}

/**
 * Scaling Cost DTO
 */
export interface ScalingCostDto {
  at1kUsers: number;
  at10kUsers: number;
  at100kUsers: number;
  at1mUsers: number;
  costPerThousandUsers: number;
  scalingStrategy: string;
}

/**
 * Content ROI Analysis
 */
export interface ContentROIDto extends AuditedEntityDto {
  contentId: string;
  gameId: string;
  contentName: string;
  contentType:
    | 'Map'
    | 'Level'
    | 'Quest'
    | 'Character'
    | 'Item'
    | 'Event'
    | 'Mode'
    | 'Other';

  // 💰 Creation Cost
  creationCost: MoneyEstimateDto;
  creationTime: number; // Days
  assetCosts: MoneyEstimateDto; // Art, sound, etc.

  // 📊 Player Engagement
  expectedPlaytime: number; // Hours
  replayability: number; // 1-10 scale
  playerSatisfaction: number; // 1-10 scale estimated
  completionRate: PercentageEstimateDto;

  // 💰 Monetization Potential
  directRevenue: MoneyEstimateDto; // If sold
  indirectRevenue: MoneyEstimateDto; // Retention value
  retentionValue: MoneyEstimateDto; // Value of keeping players

  // 🎯 Impact
  engagementLift: PercentageEstimateDto;
  retentionLift: PercentageEstimateDto;
  socialMediaBuzz: number; // 1-10 estimated viral potential

  // ⏱️ Lifespan
  contentLifespan: number; // Days before players exhaust it
  updateRequirements: 'None' | 'Occasional' | 'Regular' | 'Constant';
  seasonalRelevance: string; // When it's most relevant
}

/**
 * Update Impact Prediction
 */
export interface UpdateImpactDto extends AuditedEntityDto {
  updateId: string;
  gameId: string;
  updateName: string;
  updateType: 'Patch' | 'Content' | 'Feature' | 'Balance' | 'Major' | 'Event';

  // 💰 Investment
  developmentCost: MoneyEstimateDto;
  qaCost: MoneyEstimateDto;
  marketingCost: MoneyEstimateDto;
  totalUpdateCost: MoneyEstimateDto;

  // 📈 Expected Impact
  playerReturnRate: PercentageEstimateDto; // Lapsed users coming back
  engagementLift: PercentageEstimateDto;
  revenueBoost: MoneyEstimateDto;
  mediaAttention: number; // 1-10 scale
  socialBuzz: number; // 1-10 scale

  // ⏱️ Impact Duration
  immediateImpact: string; // First 24 hours
  weekOneImpact: string;
  monthOneImpact: string;
  longTermImpact: string;

  // 🚨 Risk Assessment
  bugRisk: 'Low' | 'Medium' | 'High';
  balanceRisk: 'Low' | 'Medium' | 'High';
  playerBacklashRisk: 'Low' | 'Medium' | 'High';
  controversyPotential: string[];

  // 🎯 Recommendation
  worthDoing: boolean;
  optimalTiming: string;
  bundleWith: string[]; // Other updates to combine with
}

/**
 * A/B Test Prediction
 */
export interface ABTestPredictionDto extends AuditedEntityDto {
  testId: string;
  gameId: string;
  testName: string;
  hypothesis: string;

  // 🧪 Test Setup
  variants: TestVariantDto[];
  sampleSizeNeeded: number;
  testDuration: number; // Days
  testCost: MoneyEstimateDto;

  // 📊 Expected Outcome
  expectedWinner: string; // Which variant
  expectedLift: PercentageEstimateDto;
  expectedRevenueImpact: MoneyEstimateDto;
  confidenceLevel: number; // Statistical confidence %

  // 🎯 Value of Information
  potentialUpside: MoneyEstimateDto; // If test wins
  potentialDownside: MoneyEstimateDto; // If test fails
  learningValue: number; // 1-10 scale
  decisiveness: number; // 1-10 will this significantly change strategy?

  // ⚡ Priority
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  runThisTest: boolean;
  runItWhen: string;
}

/**
 * Test Variant DTO
 */
export interface TestVariantDto {
  name: string;
  description: string;
  implementationCost: number;
  expectedPerformance: number; // Relative to control
  riskLevel: 'Low' | 'Medium' | 'High';
}

/**
 * Competitive Analysis ROI
 */
export interface CompetitiveStrategyROIDto extends AuditedEntityDto {
  strategyId: string;
  gameId: string;
  strategyName: string;
  competitorInspiration: string; // Which game does this

  // 💰 Investment
  implementationCost: MoneyEstimateDto;
  timeToCopy: number; // Days
  improvementCost?: MoneyEstimateDto; // Making it better

  // 📊 Expected Benefit
  marketShareGain: PercentageEstimateDto;
  userAcquisitionLift: NumberEstimateDto;
  retentionParity: boolean; // Match competitor retention?
  revenueEquivalence: PercentageEstimateDto; // Of competitor's revenue

  // 🎯 Strategic Value
  tableStakes: boolean; // Must-have to compete?
  differentiator: boolean; // Sets you apart?
  innovationOpportunity: number; // 1-10 scale
  firstMoverAdvantage: boolean;

  // ⚖️ Recommendation
  copyExactly: boolean;
  improveUpon: string[]; // How to beat them
  skipItBecause: string[]; // Why might skip
  priorityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

/**
 * Financial Projections - Complete revenue/cost forecasting
 */
export interface FinancialProjectionsDto extends AuditedEntityDto {
  gameId: string;
  projectionDate: Date;
  projectionPeriod: number; // Months

  // 💰 Revenue Projections
  monthlyRevenue: MonthlyProjectionDto[];
  revenueStreams: RevenueStreamDto[];
  totalProjectedRevenue: MoneyEstimateDto;

  // 💸 Cost Projections
  monthlyCosts: MonthlyProjectionDto[];
  costCategories: CostCategoryDto[];
  totalProjectedCosts: MoneyEstimateDto;

  // 📊 Profitability
  monthlyProfit: MonthlyProjectionDto[];
  breakEvenMonth: number; // When profitable
  cumulativeProfit: MoneyEstimateDto;
  profitMargin: PercentageEstimateDto;

  // 👥 User Projections
  monthlyUserGrowth: MonthlyProjectionDto[];
  projectedDAU: NumberEstimateDto;
  projectedMAU: NumberEstimateDto;
  churnRate: PercentageEstimateDto;

  // 🎯 Key Metrics
  ltv: MoneyEstimateDto; // Lifetime value
  cac: MoneyEstimateDto; // Customer acquisition cost
  ltvCacRatio: number; // LTV/CAC (>3 is healthy)
  paybackPeriod: number; // Months
  arpu: MoneyEstimateDto; // Avg revenue per user
  arppu: MoneyEstimateDto; // Avg revenue per paying user

  // 📈 Growth Scenarios
  conservativeCase: ScenarioDto;
  baseCase: ScenarioDto;
  optimisticCase: ScenarioDto;

  // 🎯 Success Probability
  probabilityOfBreakeven: number; // Percentage
  probabilityOfProfit: number; // Percentage
  probabilityOf1MRevenue: number; // Percentage
  probabilityOf10MRevenue: number; // Percentage
}

/**
 * Monthly Projection DTO
 */
export interface MonthlyProjectionDto {
  month: number;
  minimum: number;
  expected: number;
  maximum: number;
}

/**
 * Revenue Stream DTO
 */
export interface RevenueStreamDto {
  name: string; // IAP, Ads, Subscriptions, etc.
  percentage: number; // % of total revenue
  monthlyRevenue: MoneyEstimateDto;
  growthRate: number; // Monthly growth %
}

/**
 * Cost Category DTO
 */
export interface CostCategoryDto {
  name: string; // Development, Marketing, Server, etc.
  percentage: number; // % of total costs
  monthlyCost: MoneyEstimateDto;
  scalability: 'Fixed' | 'Variable' | 'Semi-Variable';
}

/**
 * Scenario DTO
 */
export interface ScenarioDto {
  name: string;
  probability: number; // Percentage
  year1Revenue: number;
  year1Profit: number;
  year1Users: number;
  assumptions: string[];
}
