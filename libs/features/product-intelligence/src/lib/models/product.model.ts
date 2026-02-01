// Product Intelligence Models
// Mirrors the backend DTOs for type safety

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: ProductCategory;
  subcategory?: string;
  relationship: ProductRelationship;
  status: ProductStatus;
  platform?: string;
  monetization?: string;
  priorityScore?: number;
  recommendedForStudy?: boolean;
  hasFreeTier?: boolean;
  tags?: string[];
  url?: string;
  companyId?: string;
  metrics?: ProductMetrics;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductMetrics {
  activeUsers?: number;
  revenueMonthly?: number;
  rating?: number;
  downloads?: number;
}

export type ProductCategory =
  | 'Game'
  | 'AI Agent'
  | 'Online Course'
  | 'SaaS Application'
  | 'Mobile App'
  | 'Web Application'
  | 'Family App';

export type ProductRelationship =
  | 'Our Product'
  | 'Competitor'
  | 'Reference'
  | 'Inspiration';

export type ProductStatus =
  | 'Growing'
  | 'Mature'
  | 'Beta'
  | 'In Development'
  | 'Concept'
  | 'Launched'
  | 'Deprecated';

export interface ProductFilter {
  search: string;
  category: ProductCategory | null;
  relationship: ProductRelationship | null;
  status: ProductStatus | null;
  platform: string | null;
  monetization: string | null;
  recommendedOnly: boolean;
  hasFreeTier: boolean;
  sort: ProductSort;
}

export type ProductSort =
  | 'priority-desc'
  | 'priority-asc'
  | 'name-asc'
  | 'name-desc'
  | 'users-desc'
  | 'revenue-desc';

export type QuickView = 'all' | 'our-products' | 'competitors' | 'recommended';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}
