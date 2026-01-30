// Re-export shared types for convenience
export * from '@aiawi-ws/game-types';

// Additional frontend-specific types
export interface GetGamesFilterDto {
  filter?: string;
  genre?: string;
  platform?: string;
  ownership?: string;
  ageGroup?: string;
  monetizationModel?: string;
  minPriorityScore?: number;
  recommendedOnly?: boolean;

  // Feature flag filters
  hasCollectionSystem?: boolean;
  hasTradingSystem?: boolean;
  hasProgressionSystem?: boolean;
  hasMultiplayer?: boolean;
  hasGachaSystem?: boolean;

  // Pagination
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
}
