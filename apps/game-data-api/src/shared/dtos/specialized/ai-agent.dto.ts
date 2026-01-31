import { AuditedEntityDto, PagedAndSortedResultRequestDto } from '../base.dto';

// ==========================================
// AI AGENT SPECIALIZED DTOs
// ABP-style DTOs for AI Agent products
// ==========================================

/**
 * AI Model Type
 */
export enum AIModelType {
  LLM = 'Large Language Model',
  MultiModal = 'Multi-Modal',
  ImageGeneration = 'Image Generation',
  AudioGeneration = 'Audio Generation',
  VideoGeneration = 'Video Generation',
  CodeGeneration = 'Code Generation',
  Embedding = 'Embedding',
  Classification = 'Classification',
  Other = 'Other',
}

/**
 * AI Capability
 */
export enum AICapability {
  TextGeneration = 'Text Generation',
  TextAnalysis = 'Text Analysis',
  CodeWriting = 'Code Writing',
  CodeReview = 'Code Review',
  ImageGeneration = 'Image Generation',
  ImageAnalysis = 'Image Analysis',
  VoiceSynthesis = 'Voice Synthesis',
  VoiceRecognition = 'Voice Recognition',
  Translation = 'Translation',
  Summarization = 'Summarization',
  QuestionAnswering = 'Question Answering',
  DataExtraction = 'Data Extraction',
  Reasoning = 'Reasoning',
  MathSolving = 'Math Solving',
  WebSearch = 'Web Search',
  ToolUse = 'Tool Use / Function Calling',
  FileAnalysis = 'File Analysis',
  Memory = 'Long-Term Memory',
}

/**
 * AI Pricing Model
 */
export enum AIPricingModel {
  PerToken = 'Per Token',
  PerRequest = 'Per Request',
  PerMinute = 'Per Minute (Audio/Video)',
  PerImage = 'Per Image',
  Subscription = 'Subscription',
  Credits = 'Credits',
  Free = 'Free',
  Enterprise = 'Enterprise',
}

/**
 * AI Model Specs DTO
 */
export interface AIModelSpecsDto {
  modelName: string;
  modelVersion: string;
  provider: string;

  // Context
  contextWindowTokens: number;
  maxOutputTokens: number;

  // Performance
  tokensPerSecond?: number;
  latencyMs?: number;

  // Training
  trainingCutoffDate?: string;
  parameterCount?: string; // e.g., "70B", "175B"

  // Modalities
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsAudio: boolean;
  supportsVideo: boolean;
  supportsFiles: boolean;
  supportsFunctionCalling: boolean;
  supportsStructuredOutput: boolean;
}

/**
 * AI Pricing Tier DTO - ABP AuditedEntityDto
 */
export interface AIPricingTierDto extends AuditedEntityDto {
  agentId: string;
  tierName: string;

  // Pricing
  pricingModel: AIPricingModel;
  inputPricePerMillion?: number; // tokens
  outputPricePerMillion?: number; // tokens
  pricePerRequest?: number;
  monthlySubscriptionPrice?: number;

  // Limits
  requestsPerMinute?: number;
  requestsPerDay?: number;
  tokensPerMinute?: number;
  tokensPerDay?: number;

  // Features
  featuresIncluded: string[];
  supportsFineTuning: boolean;
  supportsPriority: boolean;
}

/**
 * AI Benchmark DTO - ABP AuditedEntityDto
 */
export interface AIBenchmarkDto extends AuditedEntityDto {
  agentId: string;
  benchmarkName: string;
  benchmarkVersion?: string;
  score: number;
  maxScore: number;
  percentile?: number;
  category: string;
  testDate: Date;
  notes?: string;
}

/**
 * AI Integration DTO - ABP AuditedEntityDto
 */
export interface AIIntegrationDto extends AuditedEntityDto {
  agentId: string;
  integrationType: 'API' | 'SDK' | 'Plugin' | 'Native' | 'Webhook';
  platformName: string;
  description: string;
  documentationUrl?: string;
  isOfficial: boolean;
  setupComplexity: 'Easy' | 'Medium' | 'Hard';
}

/**
 * AI Agent Metrics DTO
 */
export interface AIAgentMetricsDto {
  // Usage
  totalRequests: number;
  dailyRequests: number;
  monthlyActiveUsers: number;
  totalTokensProcessed: number;

  // Quality
  averageResponseTime: number; // ms
  successRate: number; // percentage
  userSatisfactionScore: number; // 1-5

  // Market
  marketSharePercent?: number;
  enterpriseCustomers?: number;
}

/**
 * AI Agent DTO - ABP AuditedEntityDto
 * Specialized for AI Agent products
 */
export interface AIAgentDto extends AuditedEntityDto {
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
  documentationUrl?: string;

  // Model
  modelType: AIModelType;
  modelSpecs: AIModelSpecsDto;

  // Capabilities
  capabilities: AICapability[];
  primaryUseCase: string;
  useCases: string[];

  // Limitations
  limitations: string[];
  contentPolicies: string[];

  // API
  hasAPI: boolean;
  apiEndpoint?: string;
  authMethod: 'API Key' | 'OAuth' | 'None';
  sdkLanguages: string[]; // Python, JavaScript, etc.

  // Pricing
  pricingTiers: AIPricingTierDto[];
  hasFreeTier: boolean;

  // Benchmarks
  benchmarks: AIBenchmarkDto[];

  // Integrations
  integrations: AIIntegrationDto[];

  // Metrics
  metrics: AIAgentMetricsDto;

  // Analysis
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  notRecommendedFor: string[];

  // Comparison
  competitorIds: string[];
  differentiators: string[];

  // Tags
  tags: string[];
}

/**
 * Create AI Agent DTO - ABP convention
 */
export interface CreateAIAgentDto {
  name: string;
  slug?: string;
  tagline?: string;
  description: string;
  modelType: AIModelType;
  websiteUrl: string;
  capabilities?: AICapability[];
  hasAPI?: boolean;
  hasFreeTier?: boolean;
  companyId?: string;
  tags?: string[];
}

/**
 * Update AI Agent DTO - ABP convention
 */
export interface UpdateAIAgentDto extends Partial<CreateAIAgentDto> {
  modelSpecs?: Partial<AIModelSpecsDto>;
  metrics?: Partial<AIAgentMetricsDto>;
  limitations?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

/**
 * AI Agent Filter DTO - ABP PagedAndSortedResultRequestDto
 */
export interface AIAgentFilterDto extends PagedAndSortedResultRequestDto {
  filter?: string;
  modelType?: AIModelType;
  companyId?: string;
  capability?: AICapability;
  hasFreeTier?: boolean;
  hasAPI?: boolean;
  minContextWindow?: number;
  supportsFunctionCalling?: boolean;
  tags?: string[];
}
