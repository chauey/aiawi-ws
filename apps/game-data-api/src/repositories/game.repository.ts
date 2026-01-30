import {
  GameDto,
  CreateGameDto,
  UpdateGameDto,
  GameFilterDto,
  GameFeatureDto,
  GameSystemDto,
  GameFeatureFlags,
  SuccessMetricDto,
} from '../shared/dtos/game.dto';
import { PagedResultDto } from '../shared/dtos/base.dto';
import {
  generateId,
  getCurrentTimestamp,
  JsonStorageService,
} from '../database/json-storage.service';

export class GameRepository {
  constructor(private storage: JsonStorageService) {}

  /**
   * Create a new game
   */
  create(dto: CreateGameDto, creatorId?: string): GameDto {
    const id = generateId();
    const now = getCurrentTimestamp();

    const game: GameDto = {
      id,
      ...dto,
      featureFlags: {
        ...this.getDefaultFeatureFlags(),
        ...(dto.featureFlags || {}),
      },
      priorityScore: 50,
      recommendedForReplication: false,
      strengths: [],
      weaknesses: [],
      uniqueSellingPoints: [],
      lessonsLearned: [],
      features: [],
      systems: [],
      rewards: [],
      mechanics: [],
      successFactors: [],
      requirements: [],
      settings: [],
      tutorials: [],
      documentation: [],
      successMetrics: this.getDefaultSuccessMetrics(),
      creationTime: now,
      creatorId,
    };

    this.storage.addGame(game);
    return game;
  }

  /**
   * Update a game
   */
  update(id: string, dto: UpdateGameDto, _modifierId?: string): GameDto | null {
    const game = this.storage.getGameById(id);
    if (!game) return null;

    const success = this.storage.updateGame(id, dto as Partial<GameDto>);

    return success ? (this.storage.getGameById(id) ?? null) : null;
  }

  /**
   * Delete a game
   */
  delete(id: string): boolean {
    return this.storage.deleteGame(id);
  }

  /**
   * Get game by ID
   */
  getById(id: string): GameDto | null {
    return this.storage.getGameById(id) || null;
  }

  /**
   * Get games with filtering and paging
   */
  getList(filter: GameFilterDto): PagedResultDto<GameDto> {
    let games = this.storage.getGames();

    // Apply filters
    if (filter.filter) {
      const searchTerm = filter.filter.toLowerCase();
      games = games.filter(
        (g) =>
          g.name.toLowerCase().includes(searchTerm) ||
          g.developer.toLowerCase().includes(searchTerm) ||
          g.description.toLowerCase().includes(searchTerm),
      );
    }

    if (filter.genre) {
      games = games.filter((g) => g.genre === filter.genre);
    }

    if (filter.monetizationModel) {
      games = games.filter(
        (g) => g.monetizationModel === filter.monetizationModel,
      );
    }

    if (filter.minPriorityScore !== undefined) {
      games = games.filter((g) => g.priorityScore >= filter.minPriorityScore!);
    }

    if (filter.recommendedOnly) {
      games = games.filter((g) => g.recommendedForReplication);
    }

    if (filter.tags && filter.tags.length > 0) {
      games = games.filter((g) =>
        filter.tags!.some((tag) => g.tags.includes(tag)),
      );
    }

    // Filter by new enum fields
    if (filter.platform) {
      games = games.filter((g) => g.platform === filter.platform);
    }

    if (filter.ageGroup) {
      games = games.filter((g) => g.ageGroup === filter.ageGroup);
    }

    if (filter.ownership) {
      games = games.filter((g) => g.ownership === filter.ownership);
    }

    // Filter by feature flags
    if (filter.hasCollectionSystem !== undefined) {
      games = games.filter(
        (g) =>
          g.featureFlags.hasCollectionSystem === filter.hasCollectionSystem,
      );
    }

    if (filter.hasTradingSystem !== undefined) {
      games = games.filter(
        (g) => g.featureFlags.hasTradingSystem === filter.hasTradingSystem,
      );
    }

    if (filter.hasProgressionSystem !== undefined) {
      games = games.filter(
        (g) =>
          g.featureFlags.hasProgressionSystem === filter.hasProgressionSystem,
      );
    }

    if (filter.hasMultiplayer !== undefined) {
      games = games.filter(
        (g) => g.featureFlags.hasMultiplayer === filter.hasMultiplayer,
      );
    }

    const totalCount = games.length;

    // Apply sorting
    const sorting = filter.sorting || 'priorityScore DESC';
    const [sortField, sortOrder] = sorting.split(' ');
    games.sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortOrder === 'DESC' ? -comparison : comparison;
    });

    // Apply paging
    const skipCount = filter.skipCount || 0;
    const maxResultCount = filter.maxResultCount || 100; // Default to 100 to show all games
    const items = games.slice(skipCount, skipCount + maxResultCount);

    return {
      items,
      totalCount,
    };
  }

  /**
   * Add a feature to a game
   */
  addFeature(
    gameId: string,
    feature: Omit<
      GameFeatureDto,
      'id' | 'gameId' | 'creationTime' | 'lastModificationTime'
    >,
  ): GameFeatureDto {
    const game = this.storage.getGameById(gameId);
    if (!game) throw new Error('Game not found');

    const newFeature: GameFeatureDto = {
      id: generateId(),
      gameId,
      ...feature,
      creationTime: getCurrentTimestamp(),
    };

    game.features.push(newFeature);
    this.storage.updateGame(gameId, { features: game.features });

    return newFeature;
  }

  /**
   * Add a system to a game
   */
  addSystem(
    gameId: string,
    system: Omit<
      GameSystemDto,
      'id' | 'gameId' | 'creationTime' | 'lastModificationTime'
    >,
  ): GameSystemDto {
    const game = this.storage.getGameById(gameId);
    if (!game) throw new Error('Game not found');

    const newSystem: GameSystemDto = {
      id: generateId(),
      gameId,
      ...system,
      creationTime: getCurrentTimestamp(),
    };

    game.systems.push(newSystem);
    this.storage.updateGame(gameId, { systems: game.systems });

    return newSystem;
  }

  /**
   * Update success metrics
   */
  updateSuccessMetrics(
    gameId: string,
    metrics: Partial<SuccessMetricDto>,
  ): void {
    const game = this.storage.getGameById(gameId);
    if (!game) throw new Error('Game not found');

    game.successMetrics = {
      ...game.successMetrics,
      ...metrics,
    };

    this.storage.updateGame(gameId, { successMetrics: game.successMetrics });
  }

  /**
   * Get default feature flags
   */
  private getDefaultFeatureFlags(): GameFeatureFlags {
    return {
      hasCollectionSystem: false,
      hasTradingSystem: false,
      hasProgressionSystem: false,
      hasCraftingSystem: false,
      hasBuildingSystem: false,
      hasMultiplayer: false,
      hasGuilds: false,
      hasChat: false,
      hasFriendSystem: false,
      hasLeaderboards: false,
      hasInAppPurchases: false,
      hasGachaSystem: false,
      hasSeasonPass: false,
      hasAds: false,
      hasVIPSystem: false,
      hasLevelSystem: false,
      hasSkillTree: false,
      hasAchievements: false,
      hasQuests: false,
      hasDailies: false,
      hasProcGeneratedContent: false,
      hasStoryMode: false,
      hasPvP: false,
      hasPvE: false,
      hasRaids: false,
      hasCharacterCustomization: false,
      hasHousingCustomization: false,
      hasSkinSystem: false,
      hasEmotes: false,
      hasVirtualCurrency: false,
      hasMarketplace: false,
      hasAuctions: false,
      hasCrossPlatform: false,
      hasCloudSaves: false,
      hasOfflineProgress: false,
    };
  }

  /**
   * Get default success metrics
   */
  private getDefaultSuccessMetrics(): SuccessMetricDto {
    return {
      totalPlays: 0,
      concurrentPlayers: 0,
      peakConcurrentPlayers: 0,
      averageSessionLength: 0,
      retentionRateDay1: 0,
      retentionRateDay7: 0,
      retentionRateDay30: 0,
      revenueTotal: 0,
      revenueMonthly: 0,
      conversionRate: 0,
      averageRevenuePerUser: 0,
    };
  }
}
