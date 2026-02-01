/**
 * Feature Intelligence DTOs
 * Tracks game/product features for competitive analysis
 */

export interface FeatureDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: FeatureCategory;
  importance: FeatureImportance;
  priority: FeaturePriority;
  notes?: string;

  // Implementation guidance
  implementationComplexity: ComplexityLevel;
  estimatedDevDays?: number;

  // Impact metrics
  retentionImpact: ImpactLevel;
  monetizationImpact: ImpactLevel;
  viralityImpact: ImpactLevel;

  // Examples from competitors
  bestPracticeExample?: string;
  bestPracticeProductId?: string;

  // Tags for filtering
  tags?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductFeatureDto {
  productId: string;
  featureId: string;
  status: FeatureStatus;
  implementationNotes?: string;
  implementationQuality?: QualityLevel;
  whyHave?: string; // Why we have this feature
  whyNotHave?: string; // Why we don't have it (if missing)
  shouldHave?: boolean; // Recommendation for new games
  priority?: FeaturePriority;
}

export enum FeatureCategory {
  Core = 'Core Gameplay',
  Retention = 'Retention & Engagement',
  Monetization = 'Monetization',
  Social = 'Social & Multiplayer',
  Progression = 'Progression & Rewards',
  Content = 'Content & Variety',
  UX = 'User Experience',
  Technical = 'Technical & Performance',
  Safety = 'Safety & Moderation',
}

export enum FeatureImportance {
  Critical = 'Critical', // Game won't work without it
  High = 'High', // Major competitive advantage
  Medium = 'Medium', // Nice to have
  Low = 'Low', // Optional enhancement
}

export enum FeaturePriority {
  P0 = 'P0 - Launch Blocker',
  P1 = 'P1 - Must Have',
  P2 = 'P2 - Should Have',
  P3 = 'P3 - Nice to Have',
  P4 = 'P4 - Future Consider',
}

export enum FeatureStatus {
  Implemented = 'Implemented',
  InProgress = 'In Progress',
  Planned = 'Planned',
  NotPlanned = 'Not Planned',
  NotApplicable = 'N/A',
}

export enum ComplexityLevel {
  Trivial = 'Trivial', // < 1 day
  Simple = 'Simple', // 1-3 days
  Medium = 'Medium', // 3-7 days
  Complex = 'Complex', // 1-2 weeks
  VeryComplex = 'Very Complex', // 2+ weeks
}

export enum ImpactLevel {
  None = 'None',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum QualityLevel {
  Excellent = 'Excellent',
  Good = 'Good',
  Adequate = 'Adequate',
  Poor = 'Poor',
  Missing = 'Missing',
}

// Feature Matrix Response
export interface FeatureMatrixDto {
  features: FeatureDto[];
  products: ProductSummaryDto[];
  matrix: ProductFeatureDto[];
}

export interface ProductSummaryDto {
  id: string;
  name: string;
  slug: string;
  relationship: string;
  status: string;
  category: string;
}
