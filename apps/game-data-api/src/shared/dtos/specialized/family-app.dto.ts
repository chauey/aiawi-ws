import { AuditedEntityDto, PagedAndSortedResultRequestDto } from '../base.dto';

// ==========================================
// FAMILY APP SPECIALIZED DTOs
// ABP-style DTOs for Family Tech products
// ==========================================

/**
 * Family Role
 */
export enum FamilyRole {
  Parent = 'Parent',
  Guardian = 'Guardian',
  Child = 'Child',
  Teen = 'Teen',
  Grandparent = 'Grandparent',
  Caregiver = 'Caregiver',
  Other = 'Other',
}

/**
 * Family Feature Category
 */
export enum FamilyFeatureCategory {
  LocationSharing = 'Location Sharing',
  SafetyAlerts = 'Safety Alerts',
  ScreenTime = 'Screen Time Management',
  ContentFiltering = 'Content Filtering',
  Communication = 'Family Communication',
  Calendar = 'Shared Calendar',
  Tasks = 'Tasks & Chores',
  Rewards = 'Rewards System',
  Finances = 'Family Finances',
  MealPlanning = 'Meal Planning',
  Shopping = 'Shopping Lists',
  Photos = 'Photo Sharing',
  Health = 'Health Tracking',
  Education = 'Educational',
  Entertainment = 'Entertainment',
}

/**
 * Age Appropriateness
 */
export enum AgeAppropriateness {
  ToddlerSafe = 'Toddler Safe (2-4)',
  KidFriendly = 'Kid Friendly (5-8)',
  Tween = 'Tween (9-12)',
  Teen = 'Teen (13-17)',
  AllAges = 'All Ages',
  ParentOnly = 'Parent Only',
}

/**
 * Privacy Level
 */
export enum PrivacyLevel {
  Minimal = 'Minimal Data Collection',
  Standard = 'Standard',
  Extensive = 'Extensive Tracking',
  COPPA = 'COPPA Compliant',
  GDPR = 'GDPR Compliant',
}

/**
 * Parental Control DTO - ABP AuditedEntityDto
 */
export interface ParentalControlDto extends AuditedEntityDto {
  appId: string;
  controlName: string;
  description: string;
  category: FamilyFeatureCategory;

  // Configuration
  isConfigurable: boolean;
  defaultEnabled: boolean;
  requiresParentPin: boolean;

  // Granularity
  perChildSettings: boolean;
  ageBasedDefaults: boolean;
  timeBasedRules: boolean;

  // Effectiveness
  bypassDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  effectivenessRating: number; // 1-10
}

/**
 * Screen Time Rule DTO - ABP AuditedEntityDto
 */
export interface ScreenTimeRuleDto extends AuditedEntityDto {
  appId: string;
  ruleName: string;

  // Limits
  dailyLimitMinutes?: number;
  weekdayLimitMinutes?: number;
  weekendLimitMinutes?: number;

  // Scheduling
  allowedStartTime?: string; // "09:00"
  allowedEndTime?: string; // "21:00"
  bedtimeEnabled: boolean;
  bedtimeStart?: string;

  // Apps
  appCategories?: string[];
  blockedApps?: string[];
  alwaysAllowedApps?: string[];

  // Rewards
  bonusTimeEarnable: boolean;
  maxBonusMinutes?: number;
}

/**
 * Location Feature DTO - ABP AuditedEntityDto
 */
export interface LocationFeatureDto extends AuditedEntityDto {
  appId: string;
  featureName: string;

  // Tracking
  realTimeTracking: boolean;
  locationHistoryDays: number;
  refreshIntervalSeconds: number;

  // Geofencing
  supportsGeofencing: boolean;
  maxGeofences: number;
  geofenceRadiusMin: number; // meters
  geofenceRadiusMax: number;

  // Alerts
  arrivalAlerts: boolean;
  departureAlerts: boolean;
  sosButton: boolean;
  crashDetection: boolean;

  // Battery
  batteryImpact: 'Low' | 'Medium' | 'High';
  lowBatteryAlerts: boolean;
}

/**
 * Family App Metrics DTO
 */
export interface FamilyAppMetricsDto {
  // Users
  totalFamilies: number;
  totalUsers: number;
  averageFamilySize: number;

  // Engagement
  dailyActiveUsers: number;
  averageSessionsPerDay: number;
  featureUsageBreakdown: Record<string, number>;

  // Satisfaction
  parentSatisfaction: number; // 1-5
  childSatisfaction: number; // 1-5

  // Safety
  alertsSentDaily: number;
  sosActivationsMonthly: number;
}

/**
 * Family Pricing DTO
 */
export interface FamilyPricingDto {
  hasFreeTier: boolean;
  freeTierLimits: string[];

  // Subscription
  monthlyPrice: number;
  annualPrice: number;
  familyPlanPrice?: number;
  maxFamilyMembers?: number;
  pricePerAdditionalMember?: number;

  // Hardware
  requiresHardware: boolean;
  hardwareName?: string;
  hardwarePrice?: number;
  hardwareIncluded: boolean;
}

/**
 * Family App DTO - ABP AuditedEntityDto
 * Specialized for Family Tech products
 */
export interface FamilyAppDto extends AuditedEntityDto {
  // Link to base product
  productId?: string;
  companyId?: string;

  // Basic Info
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl: string;

  // Platforms
  platforms: string[];
  minIOSVersion?: string;
  minAndroidVersion?: string;

  // Classification
  primaryCategory: FamilyFeatureCategory;
  secondaryCategories: FamilyFeatureCategory[];
  ageAppropriateness: AgeAppropriateness;

  // Privacy
  privacyLevel: PrivacyLevel;
  dataCollected: string[];
  dataSharedWith: string[];
  dataRetentionDays?: number;

  // Features
  parentalControls: ParentalControlDto[];
  screenTimeRules?: ScreenTimeRuleDto[];
  locationFeatures?: LocationFeatureDto[];

  // Pricing
  pricing: FamilyPricingDto;

  // Metrics
  metrics: FamilyAppMetricsDto;

  // Analysis
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  notRecommendedFor: string[];

  // Safety
  coppaCompliant: boolean;
  kidsPrivacyCompliant: boolean;
  expertReviewed: boolean;

  // Ratings
  appStoreRating: number;
  playStoreRating: number;
  parentReviewScore: number;

  // Competitors
  competitorIds: string[];
  differentiators: string[];

  // Tags
  tags: string[];
}

/**
 * Create Family App DTO - ABP convention
 */
export interface CreateFamilyAppDto {
  name: string;
  slug?: string;
  tagline?: string;
  description: string;
  primaryCategory: FamilyFeatureCategory;
  ageAppropriateness: AgeAppropriateness;
  websiteUrl: string;
  platforms?: string[];
  companyId?: string;
  tags?: string[];
}

/**
 * Update Family App DTO - ABP convention
 */
export interface UpdateFamilyAppDto extends Partial<CreateFamilyAppDto> {
  pricing?: Partial<FamilyPricingDto>;
  metrics?: Partial<FamilyAppMetricsDto>;
  secondaryCategories?: FamilyFeatureCategory[];
  privacyLevel?: PrivacyLevel;
  dataCollected?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

/**
 * Family App Filter DTO - ABP PagedAndSortedResultRequestDto
 */
export interface FamilyAppFilterDto extends PagedAndSortedResultRequestDto {
  filter?: string;
  primaryCategory?: FamilyFeatureCategory;
  ageAppropriateness?: AgeAppropriateness;
  privacyLevel?: PrivacyLevel;
  platform?: string;
  hasFreeTier?: boolean;
  coppaCompliant?: boolean;
  hasLocationTracking?: boolean;
  hasScreenTimeControls?: boolean;
  minRating?: number;
  tags?: string[];
}
