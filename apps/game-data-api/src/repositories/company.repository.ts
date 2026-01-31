import {
  CompanyDto,
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyFilterDto,
  CompanyType,
  CompanySize,
  CompanyStage,
  CompanyRelationship,
  CompanyContactDto,
  CompanyFundingDto,
  CompanyMetricsDto,
} from '../shared/dtos/company.dto';
import { PagedResultDto } from '../shared/dtos/base.dto';
import {
  generateId,
  getCurrentTimestamp,
  JsonStorageService,
} from '../database/json-storage.service';

export class CompanyRepository {
  constructor(private storage: JsonStorageService) {}

  // Create a new company
  create(dto: CreateCompanyDto, creatorId?: string): CompanyDto {
    const now = getCurrentTimestamp();
    const company: CompanyDto = {
      id: generateId(),
      creationTime: now,
      lastModificationTime: now,
      creatorId: creatorId || 'system',
      lastModifierId: creatorId || 'system',

      // Basic Info
      name: dto.name,
      slug: dto.slug || this.generateSlug(dto.name),
      description: dto.description,
      tagline: dto.tagline,
      logoUrl: dto.logoUrl,

      // Classification
      companyType: dto.companyType,
      relationship: dto.relationship,
      size: dto.size || CompanySize.Small,
      stage: dto.stage || CompanyStage.Seed,

      // Details
      foundedYear: dto.foundedYear,

      // Contact
      contact: {
        website: dto.contact?.website || '',
        email: dto.contact?.email,
        phone: dto.contact?.phone,
        linkedIn: dto.contact?.linkedIn,
        twitter: dto.contact?.twitter,
        crunchbase: dto.contact?.crunchbase,
        headquarters: dto.contact?.headquarters,
        country: dto.contact?.country,
      },

      // Funding
      funding: {
        totalFunding: dto.funding?.totalFunding || 0,
        lastRoundAmount: dto.funding?.lastRoundAmount,
        lastRoundDate: dto.funding?.lastRoundDate,
        lastRoundType: dto.funding?.lastRoundType,
        investors: dto.funding?.investors || [],
        valuation: dto.funding?.valuation,
        valuationDate: dto.funding?.valuationDate,
        isPublic: dto.funding?.isPublic || false,
        stockSymbol: dto.funding?.stockSymbol,
        annualRevenue: dto.funding?.annualRevenue,
        employees: dto.funding?.employees,
      },

      // Metrics
      metrics: this.getDefaultMetrics(),

      // Products
      productIds: [],

      // Analysis
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],

      // Market
      targetMarkets: [],
      primaryAudience: '',
      competitorIds: [],

      // Strategic
      strategicNotes: '',
      threatLevel: 'Low',
      partnershipPotential: 5,
      acquisitionTarget: false,

      // Tags
      tags: dto.tags || [],
    };

    this.storage.create('companies', company);
    return company;
  }

  // Update a company
  update(
    id: string,
    dto: UpdateCompanyDto,
    modifierId?: string,
  ): CompanyDto | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const updated: CompanyDto = {
      ...existing,
      ...dto,
      lastModificationTime: getCurrentTimestamp(),
      lastModifierId: modifierId || existing.lastModifierId,
      contact: dto.contact
        ? { ...existing.contact, ...dto.contact }
        : existing.contact,
      funding: dto.funding
        ? { ...existing.funding, ...dto.funding }
        : existing.funding,
      metrics: dto.metrics
        ? { ...existing.metrics, ...dto.metrics }
        : existing.metrics,
    };

    this.storage.update('companies', id, updated);
    return updated;
  }

  // Delete a company
  delete(id: string): boolean {
    return this.storage.delete('companies', id);
  }

  // Get company by ID
  getById(id: string): CompanyDto | null {
    return this.storage.getById<CompanyDto>('companies', id);
  }

  // Get company by slug
  getBySlug(slug: string): CompanyDto | null {
    const companies = this.storage.getAll<CompanyDto>('companies');
    return companies.find((c) => c.slug === slug) || null;
  }

  // Get companies with filtering and paging
  getList(filter: CompanyFilterDto): PagedResultDto<CompanyDto> {
    let companies = this.storage.getAll<CompanyDto>('companies');

    // Apply text filter
    if (filter.filter) {
      const searchTerm = filter.filter.toLowerCase();
      companies = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm) ||
          c.description.toLowerCase().includes(searchTerm) ||
          c.tagline?.toLowerCase().includes(searchTerm) ||
          c.tags.some((t) => t.toLowerCase().includes(searchTerm)),
      );
    }

    // Apply company type filter
    if (filter.companyType) {
      companies = companies.filter((c) => c.companyType === filter.companyType);
    }

    // Apply relationship filter
    if (filter.relationship) {
      companies = companies.filter(
        (c) => c.relationship === filter.relationship,
      );
    }

    // Apply size filter
    if (filter.size) {
      companies = companies.filter((c) => c.size === filter.size);
    }

    // Apply stage filter
    if (filter.stage) {
      companies = companies.filter((c) => c.stage === filter.stage);
    }

    // Apply funding filters
    if (filter.minFunding !== undefined) {
      companies = companies.filter(
        (c) => c.funding.totalFunding >= filter.minFunding!,
      );
    }
    if (filter.maxFunding !== undefined) {
      companies = companies.filter(
        (c) => c.funding.totalFunding <= filter.maxFunding!,
      );
    }

    // Apply employee filters
    if (filter.minEmployees !== undefined) {
      companies = companies.filter(
        (c) => (c.funding.employees || 0) >= filter.minEmployees!,
      );
    }
    if (filter.maxEmployees !== undefined) {
      companies = companies.filter(
        (c) => (c.funding.employees || 0) <= filter.maxEmployees!,
      );
    }

    // Apply country filter
    if (filter.country) {
      companies = companies.filter(
        (c) =>
          c.contact.country?.toLowerCase() === filter.country!.toLowerCase(),
      );
    }

    // Apply public filter
    if (filter.isPublic !== undefined) {
      companies = companies.filter(
        (c) => c.funding.isPublic === filter.isPublic,
      );
    }

    // Apply tags filter
    if (filter.tags && filter.tags.length > 0) {
      companies = companies.filter((c) =>
        filter.tags!.some((tag) => c.tags.includes(tag)),
      );
    }

    // Get total count before paging
    const totalCount = companies.length;

    // Apply sorting
    if (filter.sorting) {
      const [field, direction] = filter.sorting.split(' ');
      companies.sort((a, b) => {
        const aVal = (a as any)[field];
        const bVal = (b as any)[field];
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return direction === 'desc' ? -cmp : cmp;
      });
    } else {
      // Default sort by name
      companies.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Apply paging
    const skip = filter.skipCount || 0;
    const take = filter.maxResultCount || 10;
    companies = companies.slice(skip, skip + take);

    return {
      items: companies,
      totalCount,
    };
  }

  // Link a product to company
  addProduct(companyId: string, productId: string): boolean {
    const company = this.getById(companyId);
    if (!company) return false;

    if (!company.productIds.includes(productId)) {
      company.productIds.push(productId);
      this.storage.update('companies', companyId, company);
    }
    return true;
  }

  // Remove product link
  removeProduct(companyId: string, productId: string): boolean {
    const company = this.getById(companyId);
    if (!company) return false;

    company.productIds = company.productIds.filter((id) => id !== productId);
    this.storage.update('companies', companyId, company);
    return true;
  }

  // Add competitor
  addCompetitor(companyId: string, competitorId: string): boolean {
    const company = this.getById(companyId);
    if (!company) return false;

    if (!company.competitorIds.includes(competitorId)) {
      company.competitorIds.push(competitorId);
      this.storage.update('companies', companyId, company);
    }
    return true;
  }

  // Get competitors
  getCompetitors(companyId: string): CompanyDto[] {
    const company = this.getById(companyId);
    if (!company) return [];

    return company.competitorIds
      .map((id) => this.getById(id))
      .filter((c): c is CompanyDto => c !== null);
  }

  // Update metrics
  updateMetrics(companyId: string, metrics: Partial<CompanyMetricsDto>): void {
    const company = this.getById(companyId);
    if (!company) return;

    company.metrics = { ...company.metrics, ...metrics };
    company.lastModificationTime = getCurrentTimestamp();
    this.storage.update('companies', companyId, company);
  }

  // Helper: Generate URL slug
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Get default metrics
  private getDefaultMetrics(): CompanyMetricsDto {
    return {
      monthlyActiveUsers: undefined,
      dailyActiveUsers: undefined,
      totalUsers: undefined,
      totalCustomers: undefined,
      netPromoterScore: undefined,
      churnRate: undefined,
      customerAcquisitionCost: undefined,
      lifetimeValue: undefined,
      growthRateMonthly: undefined,
      marketSharePercent: undefined,
    };
  }
}
