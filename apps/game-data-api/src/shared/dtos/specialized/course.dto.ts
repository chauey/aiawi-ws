import { AuditedEntityDto } from '../base.dto';
import { ProductDto } from '../product.dto';

// ==========================================
// ONLINE COURSE SPECIALIZED DTOs
// ABP-style DTOs for EdTech products
// ==========================================

/**
 * Course Difficulty Level
 */
export enum CourseDifficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
  AllLevels = 'All Levels',
}

/**
 * Course Format
 */
export enum CourseFormat {
  SelfPaced = 'Self-Paced',
  Cohort = 'Cohort-Based',
  Live = 'Live Sessions',
  Hybrid = 'Hybrid',
  Bootcamp = 'Bootcamp',
}

/**
 * Content Type
 */
export enum ContentType {
  Video = 'Video',
  Text = 'Text',
  Interactive = 'Interactive',
  Quiz = 'Quiz',
  Project = 'Project',
  Assignment = 'Assignment',
  Discussion = 'Discussion',
  LiveSession = 'Live Session',
}

/**
 * Certification Type
 */
export enum CertificationType {
  Completion = 'Completion Certificate',
  Professional = 'Professional Certificate',
  Specialization = 'Specialization',
  Degree = 'Degree',
  MicroCredential = 'Micro-Credential',
  Badge = 'Digital Badge',
  None = 'None',
}

/**
 * Course Module DTO - ABP AuditedEntityDto
 */
export interface CourseModuleDto extends AuditedEntityDto {
  courseId: string;
  order: number;
  title: string;
  description: string;
  durationMinutes: number;
  contentCount: number;

  // Content breakdown
  videoCount: number;
  readingCount: number;
  quizCount: number;
  assignmentCount: number;

  // Learning
  learningObjectives: string[];
  skills: string[];

  // Optional
  previewUrl?: string;
  isPreviewable: boolean;
}

/**
 * Course Instructor DTO - ABP AuditedEntityDto
 */
export interface CourseInstructorDto extends AuditedEntityDto {
  courseId: string;
  name: string;
  title: string;
  bio: string;
  photoUrl?: string;

  // Credentials
  organization?: string;
  credentials: string[];
  linkedInUrl?: string;

  // Stats
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
}

/**
 * Course Review DTO - ABP AuditedEntityDto
 */
export interface CourseReviewDto extends AuditedEntityDto {
  courseId: string;
  rating: number; // 1-5
  title?: string;
  content: string;

  // Reviewer
  reviewerName: string;
  reviewerLocation?: string;
  isVerifiedPurchase: boolean;

  // Helpful
  helpfulCount: number;
  reportCount: number;
}

/**
 * Course Pricing DTO
 */
export interface CoursePricingDto {
  originalPrice: number;
  currentPrice: number;
  currency: string;
  discountPercent?: number;

  // Subscription access
  includedInSubscription: boolean;
  subscriptionName?: string;
  subscriptionPrice?: number;

  // Bundles
  bundleId?: string;
  bundleDiscount?: number;

  // Financial aid
  hasFinancialAid: boolean;
  financialAidUrl?: string;

  // Money back
  refundPolicyDays: number;
}

/**
 * Course Metrics DTO
 */
export interface CourseMetricsDto {
  // Enrollment
  totalEnrollments: number;
  activeStudents: number;
  completions: number;
  completionRate: number;

  // Ratings
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<number, number>; // 1-5 -> count

  // Engagement
  averageTimeToComplete: number; // days
  averageModulesPerWeek: number;
  discussionPosts: number;

  // Revenue
  totalRevenue: number;
  averageRevenuePerStudent: number;
}

/**
 * Course DTO - Extends ProductDto for online courses
 * ABP-style with full audit fields
 */
export interface CourseDto extends AuditedEntityDto {
  // Link to base product
  productId?: string;

  // Basic Info
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  thumbnailUrl?: string;
  promoVideoUrl?: string;

  // Classification
  difficulty: CourseDifficulty;
  format: CourseFormat;
  language: string;
  subtitleLanguages: string[];

  // Content
  modules: CourseModuleDto[];
  totalDurationMinutes: number;
  totalModules: number;
  totalLessons: number;

  // Content breakdown
  videoHours: number;
  readingMinutes: number;
  quizCount: number;
  projectCount: number;

  // Learning
  learningObjectives: string[];
  skills: string[];
  prerequisites: string[];
  targetAudience: string[];

  // Instructors
  instructors: CourseInstructorDto[];

  // Certification
  certificationType: CertificationType;
  accreditingBody?: string;
  creditHours?: number;

  // Pricing
  pricing: CoursePricingDto;

  // Metrics
  metrics: CourseMetricsDto;

  // Platform
  platformName: string; // Coursera, Udemy, etc.
  platformCourseUrl: string;

  // Analysis
  strengths: string[];
  weaknesses: string[];
  competitiveAdvantages: string[];

  // Tags
  tags: string[];
}

/**
 * Create Course DTO - ABP convention
 */
export interface CreateCourseDto {
  title: string;
  slug?: string;
  subtitle?: string;
  description: string;
  difficulty: CourseDifficulty;
  format: CourseFormat;
  language: string;
  platformName: string;
  platformCourseUrl?: string;
  tags?: string[];
}

/**
 * Update Course DTO - ABP convention
 */
export interface UpdateCourseDto extends Partial<CreateCourseDto> {
  pricing?: Partial<CoursePricingDto>;
  metrics?: Partial<CourseMetricsDto>;
  learningObjectives?: string[];
  skills?: string[];
  prerequisites?: string[];
}

/**
 * Course Filter DTO - ABP PagedAndSortedResultRequestDto pattern
 */
export interface CourseFilterDto {
  filter?: string;
  difficulty?: CourseDifficulty;
  format?: CourseFormat;
  language?: string;
  platformName?: string;
  certificationType?: CertificationType;
  minRating?: number;
  maxPrice?: number;
  hasFreeOption?: boolean;
  hasFinancialAid?: boolean;
  tags?: string[];
  // ABP paging
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}
