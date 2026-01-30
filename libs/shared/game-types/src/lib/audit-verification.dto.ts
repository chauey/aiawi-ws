import { AuditedEntityDto } from './base.dto';

/**
 * Game Quality Audit - Comprehensive health check for every aspect
 */
export interface GameQualityAuditDto extends AuditedEntityDto {
  gameId: string;
  auditDate: Date;
  auditType: 'Comprehensive' | 'Performance' | 'Fun' | 'Monetization' | 'Technical' | 'UX';
  
  // 🎮 Fun Factor Analysis
  funFactorAudit: FunFactorAuditDto;
  
  // ⚡ Performance Analysis
  performanceAudit: PerformanceAuditDto;
  
  // 💰 Cost & Budget Analysis
  costAudit: CostAuditDto;
  
  // 🎨 UX/UI Analysis
  uxAudit: UXAuditDto;
  
  // 🔧 Technical Health
  technicalAudit: TechnicalAuditDto;
  
  // 💸 Monetization Health
  monetizationAudit: MonetizationAuditDto;
  
  // 📊 Metrics Health
  metricsAudit: MetricsAuditDto;
  
  // 🎯 Overall Score
  overallHealthScore: number; // 0-100
  criticalIssues: AuditIssueDto[];
  warnings: AuditIssueDto[];
  recommendations: AuditRecommendationDto[];
  
  // 🚦 Status
  auditStatus: 'Pass' | 'Pass with Warnings' | 'Fail' | 'Critical';
  signOffRequired: boolean;
  nextAuditDate: Date;
}

/**
 * Fun Factor Audit - Is the game actually fun?
 */
export interface FunFactorAuditDto {
  overallFunScore: number; // 0-100
  
  // 📊 Player Satisfaction Metrics
  playerRatings: {
    average: number; // 1-5 stars
    distribution: { stars: number; percentage: number }[];
    trendDirection: 'Improving' | 'Stable' | 'Declining';
  };
  
  // 🎮 Core Loop Analysis
  coreLoopEngagement: number; // 0-100
  coreLoopAddictiveness: number; // 0-100
  coreLoopFrustration: number; // 0-100 (lower is better)
  flowStateAchievement: number; // 0-100
  
  // ⏱️ Engagement Signals
  sessionLengthTrend: 'Increasing' | 'Stable' | 'Decreasing';
  sessionsPerDayTrend: 'Increasing' | 'Stable' | 'Decreasing';
  dropOffPoints: DropOffPointDto[];
  
  // 💀 Churn Signals
  churnReasons: { reason: string; percentage: number }[];
  exitSurveyFeedback: string[];
  negativeReviewThemes: string[];
  
  // ✅ What's Working
  mostLovedFeatures: { feature: string; loveScore: number }[];
  addictiveMechanics: string[];
  emotionalHighPoints: string[];
  
  // ❌ What's Not Working
  mostHatedFeatures: { feature: string; hateScore: number }[];
  frustratingMechanics: string[];
  boringSegments: string[];
  
  // 🎯 Recommendations
  quickFunBoosts: string[]; // Easy changes = more fun
  balanceIssues: string[];
  contentGaps: string[];
  difficultyProblems: string[];
}

/**
 * Drop Off Point DTO
 */
export interface DropOffPointDto {
  location: string; // Where in game
  dropOffRate: number; // Percentage
  timeToReach: number; // Minutes
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  likelyCause: string;
  suggestedFix: string;
}

/**
 * Performance Audit - Technical performance analysis
 */
export interface PerformanceAuditDto {
  overallPerformanceScore: number; // 0-100
  
  // 🖥️ Client Performance
  frameRate: {
    average: number;
    p50: number; // 50th percentile
    p95: number; // 95th percentile
    p99: number; // 99th percentile
    target: number;
    meets Target: boolean;
  };
  
  loadTimes: {
    initial: number; // Seconds
    levelLoad: number;
    assetLoad: number;
    target: number;
    meetsTarget: boolean;
  };
  
  memoryUsage: {
    average: number; // MB
    peak: number;
    leaksDetected: boolean;
    target: number;
    meetsTarget: boolean;
  };
  
  // 🌐 Network Performance
  networkMetrics: {
    latency: { avg: number; p95: number; target: number };
    packetLoss: { avg: number; target: number };
    bandwidth: { avg: number; peak: number };
  };
  
  // 💾 Server Performance
  serverMetrics?: {
    cpu: { avg: number; peak: number; target: number };
    memory: { avg: number; peak: number; target: number };
    responseTime: { avg: number; p95: number; target: number };
    errorRate: { percentage: number; target: number };
  };
  
  // 🔥 Hot Spots
  performanceBottlenecks: BottleneckDto[];
  memoryHogs: { feature: string; memoryMB: number }[];
  slowFunctions: { function: string; avgTimeMs: number }[];
  
  // 📱 Platform-Specific
  platformPerformance: {
    platform: string;
    score: number;
    issues: string[];
  }[];
  
  // 🎯 Recommendations
  optimizationPriorities: string[];
  quickWins: string[];
  longTermImprovements: string[];
}

/**
 * Bottleneck DTO
 */
export interface BottleneckDto {
  name: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedUsers: number; // Percentage
  performanceDrop: number; // Percentage
  suggestedFix: string;
  estimatedEffort: number; // Hours
}

/**
 * Cost Audit - Is it too expensive?
 */
export interface CostAuditDto {
  overallCostHealth: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  
  // 💰 Development Costs
  developmentCosts: {
    totalSpent: number;
    monthlyBurn: number;
    budgetRemaining: number;
    projectedTotal: number;
    budgetStatus: 'Under' | 'On Track' | 'Over';
  };
  
  // 🖥️ Infrastructure Costs
  infrastructureCosts: {
    serverCosts: number; // Monthly
    cdnCosts: number;
    databaseCosts: number;
    otherServices: number;
    totalMonthly: number;
    costPerUser: number;
    scalabilityProjection: { at100k: number; at1m: number };
  };
  
  // 📢 Marketing Costs
  marketingCosts: {
    totalSpent: number;
    monthlySpend: number;
    cpi: number; // Cost per install
    cac: number; // Customer acquisition cost
    roi: number; // Return on investment
    efficiency: 'Excellent' | 'Good' | 'Poor' | 'Terrible';
  };
  
  // 💸 Revenue vs Cost
  financial Health: {
    revenue: number; // Monthly
    costs: number; // Monthly
    profit: number; // Monthly
    profitMargin: number; // Percentage
    breakEvenStatus: 'Not Yet' | 'Break-Even' | 'Profitable';
  };
  
  // 🚨 Cost Red Flags
  expensiveFeatures: { feature: string; cost: number; worthIt: boolean }[];
  inefficientSystems: { system: string; wastedCost: number; optimization: string }[];
  unnecessaryServices: { service: string; cost: number; alternative: string }[];
  
  // 💡 Cost Optimization
  costSavingOpportunities: CostSavingDto[];
  budgetReallocation: string[];
  scaleOptimizations: string[];
}

/**
 * Cost Saving DTO
 */
export interface CostSavingDto {
  opportunity: string;
  currentCost: number; // Monthly
  potentialSaving: number; // Monthly
  effort: 'Easy' | 'Medium' | 'Hard';
  risk: 'Low' | 'Medium' | 'High';
  priority: number; // 1-10
}

/**
 * UX Audit - User experience quality
 */
export interface UXAuditDto {
  overallUXScore: number; // 0-100
  
  // 🎨 UI Quality
  uiQuality: {
    visualAppeal: number; // 0-100
    consistency: number; // 0-100
    modernness: number; // 0-100
    responsiveness: number; // 0-100
  };
  
  // 🚪 Onboarding
  onboardingQuality: {
    completionRate: number; // Percentage
    timeToComplete: number; // Minutes
    confusionPoints: string[];
    dropOffRate: number; // Percentage
    clarity: number; // 0-100
  };
  
  // 🎮 Usability
  usabilityIssues: {
    issue: string;
    severity: 'Minor' | 'Moderate' | 'Major' | 'Critical';
    affectedUsers: number; // Percentage
    suggestedFix: string;
  }[];
  
  // 📱 Accessibility
  accessibilityScore: number; // 0-100
  accessibilityIssues: string[];
  
  // 🎯 User Journey
  userJourneyAnalysis: {
    stage: string;
    friction: number; // 0-100 (lower is better)
    dropOff: number; // Percentage
    improvements: string[];
  }[];
  
  // 🚦 Major UX Problems
  criticalUXIssues: string[];
  userComplaints: { complaint: string; frequency: number }[];
  
  // ✅ UX Wins
  bestUXElements: string[];
  userPraise: string[];
}

/**
 * Technical Audit - Code & architecture health
 */
export interface TechnicalAuditDto {
  overallTechnicalHealth: number; // 0-100
  
  // 💻 Code Quality
  codeQuality: {
    maintainability: number; // 0-100
    testCoverage: number; // Percentage
    codeSmells: number; // Count
    technicalDebt: 'Low' | 'Medium' | 'High' | 'Critical';
    documentationQuality: number; // 0-100
  };
  
  // 🏗️ Architecture
  architectureHealth: {
    scalability: number; // 0-100
    modularity: number; // 0-100
    coupling: 'Loose' | 'Moderate' | 'Tight';
    complexity: 'Low' | 'Medium' | 'High' | 'Extreme';
  };
  
  // 🐛 Bugs & Stability
  bugMetrics: {
    totalOpenBugs: number;
    criticalBugs: number;
    averageFixTime: number; // Days
    crashRate: number; // Per 1000 sessions
    errorRate: number; // Percentage
  };
  
  // 🔐 Security
  securityAudit: {
    vulnerabilities: { severity: string; count: number }[];
    lastSecurityAudit: Date;
    complianceStatus: string[];
  };
  
  // 📊 Technical Debt
  technicalDebtItems: {
    item: string;
    impact: 'Low' | 'Medium' | 'High' | 'Critical';
    effort: number; // Hours to fix
    priority: number; // 1-10
  }[];
  
  // 🎯 Recommendations
  refactoringPriorities: string[];
  architectureImprovements: string[];
  testingImprovements: string[];
}

/**
 * Monetization Audit - Revenue health check
 */
export interface MonetizationAuditDto {
  overallMonetizationHealth: number; // 0-100
  
  // 💰 Revenue Performance
  revenueMetrics: {
    arpu: number; // Average revenue per user
    arppu: number; // Average revenue per paying user
    conversionRate: number; // Percentage
    ltv: number; // Lifetime value
    trending: 'Up' | 'Stable' | 'Down';
  };
  
  // 🎯 Conversion Analysis
  conversionFunnel: {
    stage: string;
    users: number;
    conversionRate: number;
    dropOff: number;
    improvements: string[];
  }[];
  
  // 💸 Pricing Analysis
  pricingHealth: {
    competitiveness: 'Too Low' | 'Competitive' | 'Too High';
    valuePerception: number; // 0-100
    priceResistance: number; // 0-100 (lower is better)
    bundlePerformance: { bundle: string; sales: number; satisfaction: number }[];
  };
  
  // 🐋 Whale Analysis
  whaleMetrics: {
    whaleCount: number;
    whalePercentage: number;
    whaleRevenue: number; // Percentage of total
    whaleRetention: number; // Percentage
    whaleHealthy: boolean;
  };
  
  // 🚨 Monetization Problems
  monetizationIssues: {
    issue: string;
    revenueImpact: number; // Lost $ per month
    severity: 'Minor' | 'Moderate' | 'Major' | 'Critical';
    solution: string;
  }[];
  
  // 💡 Monetization Opportunities
  revenueOpportunities: {
    opportunity: string;
    potentialRevenue: number; // Per month
    effort: 'Low' | 'Medium' | 'High';
    risk: 'Low' | 'Medium' | 'High';
  }[];
  
  // ⚖️ Balance Check
  balanceIssues: {
    issue: string; // e.g., "Too pay-to-win"
    impact: string;
    playerSentiment: 'Positive' | 'Neutral' | 'Negative';
    recommendation: string;
  }[];
}

/**
 * Metrics Audit - Are we tracking the right things?
 */
export interface MetricsAuditDto {
  overallMetricsHealth: number; // 0-100
  
  // 📊 Metric Coverage
  essentialMetrics: {
    name: string;
    tracked: boolean;
    accuracy: number; // 0-100
    actionable: boolean;
  }[];
  
  // 🚨 Missing Metrics
  missingMetrics: string[];
  lowQualityMetrics: string[];
  unusedMetrics: string[];
  
  // 📈 Trending
  metricsHealth: {
    retention: 'Healthy' | 'Warning' | 'Critical';
    engagement: 'Healthy' | 'Warning' | 'Critical';
    monetization: 'Healthy' | 'Warning' | 'Critical';
    growth: 'Healthy' | 'Warning' | 'Critical';
  };
  
  // 🎯 Recommendations
  metricImprovements: string[];
  newMetricsToTrack: string[];
  dashboardImprovements: string[];
}

/**
 * A/B Test Recommendations - What to test next
 */
export interface ABTestRecommendationsDto extends AuditedEntityDto {
  gameId: string;
  
  // 🧪 High-Priority Tests
  highPriorityTests: ABTestSuggestionDto[];
  
  // 🎯 Medium-Priority Tests
  mediumPriorityTests: ABTestSuggestionDto[];
  
  // 💡 Experimental Tests
  experimentalTests: ABTestSuggestionDto[];
  
  // 📊 Ongoing Tests
  currentTests: {
    testName: string;
    startDate: Date;
    expectedEndDate: Date;
    earlyResults: string;
    continueOrStop: 'Continue' | 'Stop - Winner Found' | 'Stop - No Effect';
  }[];
  
  // 🏆 Past Test Learnings
  testLearnings: {
    testName: string;
    result: string;
    lift: number; // Percentage
    implemented: boolean;
    lesson: string;
  }[];
}

/**
 * A/B Test Suggestion DTO
 */
export interface ABTestSuggestionDto {
  testName: string;
  hypothesis: string;
  primaryMetric: string;
  secondaryMetrics: string[];
  variants: string[];
  estimatedImpact: { metric: string; expectedLift: number }[];
  confidence: number; // 0-100
  requiredSampleSize: number;
  estimatedDuration: number; // Days
  implementationEffort: 'Easy' | 'Medium' | 'Hard';
  risk: 'Low' | 'Medium' | 'High';
  priority: number; // 1-10
  reasoning: string;
}

/**
 * Audit Issue DTO
 */
export interface AuditIssueDto {
  category: string;
  issue: string;
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
  impact: string;
  affectedUsers: number; // Percentage
  estimatedCost: number; // $ impact
  detectedDate: Date;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Wont Fix';
}

/**
 * Audit Recommendation DTO
 */
export interface AuditRecommendationDto {
  category: string;
  recommendation: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  expectedBenefit: string;
  estimatedEffort: number; // Hours
  estimatedCost: number; // $
  expectedROI: number; // Percentage
  quickWin: boolean;
}

/**
 * Automated Health Check - Run regularly
 */
export interface AutomatedHealthCheckDto extends AuditedEntityDto {
  gameId: string;
  checkDate: Date;
  checkType: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
  
  // 🚦 Health Status
  overallStatus: 'Healthy' | 'Warning' | 'Critical' | 'Down';
  
  // ⚡ Quick Checks
  serverStatus: 'Up' | 'Degraded' | 'Down';
  errorRate: number; // Percentage
  responseTime: number; //  Ms
  activeUsers: number;
  crashRate: number; // Per 1000 sessions
  
  // 🚨 Alerts Triggered
  alerts: {
    alert: string;
    severity: 'Info' | 'Warning' | 'Critical';
    value: number;
    threshold: number;
    actionRequired: string;
  }[];
  
  // 📊 Key Metrics Snapshot
  metricsSnapshot: {
    dau: number;
    engagement: number; // Minutes
    revenue: number; // Daily
    churn: number; // Percentage
    nps: number; // Net Promoter Score
  };
  
  // 🎯 Anomalies Detected
  anomalies: {
    metric: string;
    expected: number;
    actual: number;
    deviation: number; // Percentage
    investigation: string;
  }[];
}

/**
 * Verification Checklist - Before shipping
 */
export interface VerificationChecklistDto extends AuditedEntityDto {
  gameId: string;
  version: string;
  verificationDate: Date;
  
  // ✅ Must-Pass Checks
  criticalChecks: CheckItemDto[];
  
  // ⚠️ Should-Pass Checks
  importantChecks: CheckItemDto[];
  
  // 💡 Nice-to-Pass Checks
  optionalChecks: CheckItemDto[];
  
  // 🚦 Overall Status
  readyToShip: boolean;
  blockers: string[];
  warnings: string[];
  signedOffBy: string[];
  signedOffDate?: Date;
}

/**
 * Check Item DTO
 */
export interface CheckItemDto {
  check: string;
  status: 'Pass' | 'Fail' | 'N/A' | 'Pending';
  verifiedBy?: string;
  verifiedDate?: Date;
  notes?: string;
  evidence?: string; // URL, screenshot, etc.
}
