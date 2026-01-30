/**
 * Base Entity DTO following ABP Framework patterns
 */
export interface EntityDto {
  id: string;
}

/**
 * Base Audit DTO with creation and modification tracking
 */
export interface AuditedEntityDto extends EntityDto {
  creationTime: Date;
  creatorId?: string;
  lastModificationTime?: Date;
  lastModifierId?: string;
}

/**
 * Paged Result DTO for list endpoints
 */
export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
}

/**
 * List Result DTO
 */
export interface ListResultDto<T> {
  items: T[];
}

/**
 * Paged and Sorted Request DTO
 */
export interface PagedAndSortedResultRequestDto {
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

/**
 * Filter DTO for search functionality
 */
export interface FilterDto extends PagedAndSortedResultRequestDto {
  filter?: string;
}
