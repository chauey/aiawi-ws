// Feature Intelligence Models
// For competitive feature analysis matrix

export interface Feature {
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

  tags?: string[];
}

export interface ProductFeature {
  productId: string;
  featureId: string;
  status: FeatureStatus;
  implementationNotes?: string;
  implementationQuality?: QualityLevel;
  whyHave?: string;
  whyNotHave?: string;
  shouldHave?: boolean;
  priority?: FeaturePriority;
}

export interface FeatureMatrix {
  features: Feature[];
  products: ProductSummary[];
  matrix: ProductFeature[];
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  relationship: string;
  status: string;
  category: string;
}

export interface FeatureComparisonSummary {
  feature: Feature;
  ourImplementedCount: number;
  ourPlannedCount: number;
  competitorCount: number;
  gap: boolean;
  shouldPrioritize: boolean;
}

export interface FeatureComparisonResponse {
  items: FeatureComparisonSummary[];
  totalCount: number;
  stats: {
    totalFeatures: number;
    ourProductCount: number;
    competitorCount: number;
    gapCount: number;
    prioritizeCount: number;
  };
}

export type FeatureCategory =
  | 'Core Gameplay'
  | 'Retention & Engagement'
  | 'Monetization'
  | 'Social & Multiplayer'
  | 'Progression & Rewards'
  | 'Content & Variety'
  | 'User Experience'
  | 'Technical & Performance'
  | 'Safety & Moderation';

export type FeatureImportance = 'Critical' | 'High' | 'Medium' | 'Low';

export type FeaturePriority =
  | 'P0 - Launch Blocker'
  | 'P1 - Must Have'
  | 'P2 - Should Have'
  | 'P3 - Nice to Have'
  | 'P4 - Future Consider';

export type FeatureStatus =
  | 'Implemented'
  | 'In Progress'
  | 'Planned'
  | 'Not Planned'
  | 'N/A';

export type ComplexityLevel =
  | 'Trivial'
  | 'Simple'
  | 'Medium'
  | 'Complex'
  | 'Very Complex';

export type ImpactLevel = 'None' | 'Low' | 'Medium' | 'High' | 'Critical';

export type QualityLevel =
  | 'Excellent'
  | 'Good'
  | 'Adequate'
  | 'Poor'
  | 'Missing';
