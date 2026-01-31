import { AuditedEntityDto, PagedAndSortedResultRequestDto } from '../base.dto';

// ==========================================
// PRODUCTIVITY APP SPECIALIZED DTOs
// ABP-style DTOs for Productivity products
// ==========================================

/**
 * Productivity Category
 */
export enum ProductivityCategory {
  NoteTaking = 'Note Taking',
  TaskManagement = 'Task Management',
  ProjectManagement = 'Project Management',
  Calendar = 'Calendar',
  TimeTracking = 'Time Tracking',
  Documentation = 'Documentation',
  Collaboration = 'Collaboration',
  Whiteboard = 'Whiteboard',
  Database = 'Database',
  Automation = 'Automation',
  Email = 'Email',
  FileStorage = 'File Storage',
  PasswordManager = 'Password Manager',
  ReadLater = 'Read Later',
  PKM = 'Personal Knowledge Management',
}

/**
 * Data Storage Type
 */
export enum DataStorageType {
  CloudOnly = 'Cloud Only',
  LocalOnly = 'Local Only',
  Hybrid = 'Hybrid (Cloud + Local)',
  SelfHosted = 'Self-Hosted Option',
  E2EEncrypted = 'End-to-End Encrypted',
}

/**
 * Sync Capability
 */
export enum SyncCapability {
  RealTime = 'Real-Time Sync',
  Periodic = 'Periodic Sync',
  Manual = 'Manual Sync',
  None = 'No Sync',
}

/**
 * Export Format
 */
export enum ExportFormat {
  Markdown = 'Markdown',
  PDF = 'PDF',
  HTML = 'HTML',
  JSON = 'JSON',
  CSV = 'CSV',
  PlainText = 'Plain Text',
  Word = 'Word/DOCX',
  Notion = 'Notion Export',
  Roam = 'Roam Export',
  Obsidian = 'Obsidian Vault',
}

/**
 * Integration DTO - ABP AuditedEntityDto
 */
export interface ProductivityIntegrationDto extends AuditedEntityDto {
  appId: string;
  integrationName: string;
  integrationType: 'Native' | 'API' | 'Zapier' | 'IFTTT' | 'Webhook' | 'Plugin';
  description: string;

  // Connection
  setupComplexity: 'Easy' | 'Medium' | 'Hard';
  requiresAccount: boolean;
  isPremiumOnly: boolean;

  // Capabilities
  supportsImport: boolean;
  supportsExport: boolean;
  supportsTwoWaySync: boolean;
  supportsAutomation: boolean;

  // Quality
  reliability: number; // 1-10
  lastUpdated: Date;
}

/**
 * Collaboration Feature DTO - ABP AuditedEntityDto
 */
export interface CollaborationFeatureDto extends AuditedEntityDto {
  appId: string;
  featureName: string;

  // Real-time
  realTimeEditing: boolean;
  maxConcurrentEditors?: number;
  cursorPresence: boolean;

  // Sharing
  sharingLinkTypes: string[]; // view, edit, comment
  passwordProtection: boolean;
  expiringLinks: boolean;

  // Permissions
  granularPermissions: boolean;
  roleBasedAccess: boolean;
  workspaceSupport: boolean;

  // Communication
  inlineComments: boolean;
  threadedComments: boolean;
  mentionsSupport: boolean;
  notificationOptions: string[];
}

/**
 * Productivity Pricing DTO
 */
export interface ProductivityPricingDto {
  hasFreeTier: boolean;
  freeTierLimits: Record<string, string | number>;

  // Personal
  personalMonthly?: number;
  personalAnnual?: number;

  // Team
  teamMonthly?: number;
  teamAnnual?: number;
  minTeamSize?: number;

  // Enterprise
  hasEnterprise: boolean;
  enterpriseFeatures: string[];

  // Lifetime
  hasLifetime: boolean;
  lifetimePrice?: number;

  // Education
  hasEducationDiscount: boolean;
  educationDiscount?: number;
}

/**
 * Productivity Metrics DTO
 */
export interface ProductivityMetricsDto {
  // Users
  totalUsers: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;

  // Content
  totalDocuments: number;
  averageDocsPerUser: number;

  // Collaboration
  teamWorkspaces?: number;
  averageTeamSize?: number;

  // Engagement
  averageSessionMinutes: number;
  weeklyActiveDays: number;

  // Ratings
  appStoreRating: number;
  g2Rating?: number;
  capterra?: number;
  trustpilot?: number;
}

/**
 * Productivity App DTO - ABP AuditedEntityDto
 */
export interface ProductivityAppDto extends AuditedEntityDto {
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
  hasWebApp: boolean;
  hasDesktopApp: boolean;
  hasMobileApp: boolean;
  hasBrowserExtension: boolean;

  // Classification
  primaryCategory: ProductivityCategory;
  secondaryCategories: ProductivityCategory[];

  // Data
  dataStorage: DataStorageType;
  syncCapability: SyncCapability;
  offlineSupport: boolean;

  // Export/Import
  exportFormats: ExportFormat[];
  importFormats: ExportFormat[];
  apiAccess: boolean;

  // Features
  integrations: ProductivityIntegrationDto[];
  collaborationFeatures?: CollaborationFeatureDto[];

  // AI
  hasAIFeatures: boolean;
  aiFeatures: string[];

  // Customization
  hasTemplates: boolean;
  templateCount?: number;
  hasPlugins: boolean;
  pluginCount?: number;
  hasThemes: boolean;

  // Pricing
  pricing: ProductivityPricingDto;

  // Metrics
  metrics: ProductivityMetricsDto;

  // Analysis
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  notRecommendedFor: string[];

  // Competitors
  competitorIds: string[];
  differentiators: string[];

  // Community
  hasActiveCommunity: boolean;
  discordMembers?: number;
  redditMembers?: number;

  // Tags
  tags: string[];
}

/**
 * Create Productivity App DTO - ABP convention
 */
export interface CreateProductivityAppDto {
  name: string;
  slug?: string;
  tagline?: string;
  description: string;
  primaryCategory: ProductivityCategory;
  dataStorage: DataStorageType;
  websiteUrl: string;
  platforms?: string[];
  companyId?: string;
  tags?: string[];
}

/**
 * Update Productivity App DTO - ABP convention
 */
export interface UpdateProductivityAppDto
  extends Partial<CreateProductivityAppDto> {
  pricing?: Partial<ProductivityPricingDto>;
  metrics?: Partial<ProductivityMetricsDto>;
  secondaryCategories?: ProductivityCategory[];
  syncCapability?: SyncCapability;
  exportFormats?: ExportFormat[];
  hasAIFeatures?: boolean;
  aiFeatures?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

/**
 * Productivity App Filter DTO - ABP PagedAndSortedResultRequestDto
 */
export interface ProductivityAppFilterDto
  extends PagedAndSortedResultRequestDto {
  filter?: string;
  primaryCategory?: ProductivityCategory;
  dataStorage?: DataStorageType;
  syncCapability?: SyncCapability;
  platform?: string;
  hasFreeTier?: boolean;
  hasOfflineSupport?: boolean;
  hasAIFeatures?: boolean;
  hasPlugins?: boolean;
  exportFormat?: ExportFormat;
  minRating?: number;
  tags?: string[];
}
