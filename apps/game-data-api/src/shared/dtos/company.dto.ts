import { AuditedEntityDto, EntityDto } from './base.dto';

// ==========================================
// COMPANY ENTITY
// ==========================================

/**
 * Company Type - What kind of company
 */
export enum CompanyType {
  SoftwareCompany = 'Software Company',
  EdTech = 'EdTech',
  SaaS = 'SaaS',
  GameStudio = 'Game Studio',
  AICompany = 'AI Company',
  Productivity = 'Productivity',
  FamilyTech = 'Family Tech',
  Fintech = 'Fintech',
  HealthTech = 'Health Tech',
  Enterprise = 'Enterprise',
  Consumer = 'Consumer',
  Startup = 'Startup',
  Marketplace = 'Marketplace',
  Agency = 'Agency',
  Other = 'Other',
}

/**
 * Company Size
 */
export enum CompanySize {
  Solo = 'Solo (1)',
  Micro = 'Micro (2-10)',
  Small = 'Small (11-50)',
  Medium = 'Medium (51-200)',
  Large = 'Large (201-1000)',
  Enterprise = 'Enterprise (1000+)',
}

/**
 * Company Stage
 */
export enum CompanyStage {
  Idea = 'Idea',
  PreSeed = 'Pre-Seed',
  Seed = 'Seed',
  SeriesA = 'Series A',
  SeriesB = 'Series B',
  SeriesC = 'Series C+',
  Profitable = 'Profitable',
  PubliclyTraded = 'Publicly Traded',
  Acquired = 'Acquired',
  Bootstrapped = 'Bootstrapped',
}

/**
 * Company Relationship (to us)
 */
export enum CompanyRelationship {
  OurCompany = 'Our Company',
  Competitor = 'Competitor',
  Partner = 'Partner',
  Reference = 'Reference',
  Prospect = 'Prospect',
  Vendor = 'Vendor',
}

/**
 * Company Contact Information
 */
export interface CompanyContactDto {
  website: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  twitter?: string;
  crunchbase?: string;
  headquarters?: string;
  country?: string;
}

/**
 * Company Funding Information
 */
export interface CompanyFundingDto {
  totalFunding: number;
  lastRoundAmount?: number;
  lastRoundDate?: Date;
  lastRoundType?: CompanyStage;
  investors?: string[];
  valuation?: number;
  valuationDate?: Date;
  isPublic: boolean;
  stockSymbol?: string;
  annualRevenue?: number;
  employees?: number;
}

/**
 * Company Metrics
 */
export interface CompanyMetricsDto {
  monthlyActiveUsers?: number;
  dailyActiveUsers?: number;
  totalUsers?: number;
  totalCustomers?: number;
  netPromoterScore?: number;
  churnRate?: number;
  customerAcquisitionCost?: number;
  lifetimeValue?: number;
  growthRateMonthly?: number;
  marketSharePercent?: number;
}

/**
 * Main Company DTO
 */
export interface CompanyDto extends AuditedEntityDto {
  name: string;
  slug: string; // URL-friendly name
  description: string;
  tagline?: string;
  logoUrl?: string;

  // Classification
  companyType: CompanyType;
  relationship: CompanyRelationship;
  size: CompanySize;
  stage: CompanyStage;

  // Details
  foundedYear?: number;
  founders?: string[];
  ceo?: string;

  // Contact & Links
  contact: CompanyContactDto;

  // Financials
  funding: CompanyFundingDto;

  // Metrics
  metrics: CompanyMetricsDto;

  // Products
  productIds: string[]; // Links to products

  // Analysis
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];

  // Market Intelligence
  targetMarkets: string[];
  primaryAudience: string;
  competitorIds: string[]; // Links to other companies

  // Strategic Info
  strategicNotes: string;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical'; // How much of a threat they are
  partnershipPotential: number; // 1-10
  acquisitionTarget: boolean;

  // Tags
  tags: string[];
}

/**
 * Create Company DTO
 */
export interface CreateCompanyDto {
  name: string;
  slug?: string;
  description: string;
  tagline?: string;
  logoUrl?: string;
  companyType: CompanyType;
  relationship: CompanyRelationship;
  size?: CompanySize;
  stage?: CompanyStage;
  foundedYear?: number;
  contact?: Partial<CompanyContactDto>;
  funding?: Partial<CompanyFundingDto>;
  tags?: string[];
}

/**
 * Update Company DTO
 */
export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {
  metrics?: Partial<CompanyMetricsDto>;
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  threats?: string[];
  targetMarkets?: string[];
  competitorIds?: string[];
  threatLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  partnershipPotential?: number;
  acquisitionTarget?: boolean;
}

/**
 * Company Filter DTO
 */
export interface CompanyFilterDto {
  filter?: string; // Text search
  companyType?: CompanyType;
  relationship?: CompanyRelationship;
  size?: CompanySize;
  stage?: CompanyStage;
  minFunding?: number;
  maxFunding?: number;
  minEmployees?: number;
  maxEmployees?: number;
  country?: string;
  tags?: string[];
  isPublic?: boolean;
  threatLevelMin?: 'Low' | 'Medium' | 'High' | 'Critical';
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}
