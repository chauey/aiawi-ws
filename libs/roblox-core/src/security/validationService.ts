/**
 * ValidationService - Centralized Security Validation Layer
 *
 * This service consolidates all validation logic to ensure consistent security
 * checks across the entire game. All server-side handlers should use this service.
 */

// ==================== TYPES ====================

export type Element =
  | 'fire'
  | 'water'
  | 'ice'
  | 'electric'
  | 'nature'
  | 'shadow'
  | 'light';
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface PlayerDragon {
  instanceId: string;
  dragonId: string;
  element: Element;
  level: number;
  evolutionStage: number;
  breedCount: number;
  isFavorite: boolean;
}

export interface PlayerData {
  coins: number;
  gems: number;
  dragons: PlayerDragon[];
  activeDragonSlots: string[];
  level: number;
  clanId?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

// ==================== RATE LIMITING ====================

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  egg_hatch: { maxRequests: 10, windowSeconds: 60 },
  breed: { maxRequests: 5, windowSeconds: 60 },
  trade_request: { maxRequests: 10, windowSeconds: 60 },
  trade_accept: { maxRequests: 5, windowSeconds: 60 },
  arena_queue: { maxRequests: 5, windowSeconds: 30 },
  world_boss_attack: { maxRequests: 60, windowSeconds: 60 },
  clan_create: { maxRequests: 1, windowSeconds: 300 },
  coin_collect: { maxRequests: 100, windowSeconds: 10 },
};

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();
let currentTime = 0;

export function setTime(t: number): void {
  currentTime = t;
}

export function getTime(): number {
  return currentTime;
}

export function clearRateLimits(): void {
  rateLimits.clear();
}

// ==================== VALIDATION SERVICE ====================

export class ValidationService {
  private playerDataProvider: (playerId: number) => PlayerData | undefined;

  constructor(dataProvider: (playerId: number) => PlayerData | undefined) {
    this.playerDataProvider = dataProvider;
  }

  // ========== RATE LIMITING ==========

  checkRateLimit(playerId: number, action: string): ValidationResult {
    const config = RATE_LIMITS[action];
    if (!config) {
      return { valid: true };
    }

    const limitKey = `${playerId}_${action}`;
    const now = getTime();
    const entry = rateLimits.get(limitKey);

    if (!entry || now >= entry.resetTime) {
      rateLimits.set(limitKey, {
        count: 1,
        resetTime: now + config.windowSeconds,
      });
      return { valid: true };
    }

    if (entry.count >= config.maxRequests) {
      return {
        valid: false,
        error: `Rate limited. Try again in ${entry.resetTime - now}s`,
        code: 'RATE_LIMITED',
      };
    }

    entry.count++;
    return { valid: true };
  }

  // ========== CURRENCY VALIDATION ==========

  validateCoins(playerId: number, amount: number): ValidationResult {
    if (!Number.isFinite(amount) || Number.isNaN(amount)) {
      return {
        valid: false,
        error: 'Invalid coin amount',
        code: 'INVALID_AMOUNT',
      };
    }

    if (amount < 0) {
      return {
        valid: false,
        error: 'Negative coin amount',
        code: 'NEGATIVE_AMOUNT',
      };
    }

    const data = this.playerDataProvider(playerId);
    if (!data) {
      return { valid: false, error: 'Player data not found', code: 'NO_DATA' };
    }

    if (amount > data.coins) {
      return {
        valid: false,
        error: 'Insufficient coins',
        code: 'INSUFFICIENT_FUNDS',
      };
    }

    return { valid: true };
  }

  validateGems(playerId: number, amount: number): ValidationResult {
    if (!Number.isFinite(amount) || Number.isNaN(amount)) {
      return {
        valid: false,
        error: 'Invalid gem amount',
        code: 'INVALID_AMOUNT',
      };
    }

    if (amount < 0) {
      return {
        valid: false,
        error: 'Negative gem amount',
        code: 'NEGATIVE_AMOUNT',
      };
    }

    const data = this.playerDataProvider(playerId);
    if (!data) {
      return { valid: false, error: 'Player data not found', code: 'NO_DATA' };
    }

    if (amount > data.gems) {
      return {
        valid: false,
        error: 'Insufficient gems',
        code: 'INSUFFICIENT_FUNDS',
      };
    }

    return { valid: true };
  }

  // ========== DRAGON VALIDATION ==========

  validateDragonOwnership(
    playerId: number,
    dragonInstanceId: string,
  ): ValidationResult {
    if (!dragonInstanceId || typeof dragonInstanceId !== 'string') {
      return { valid: false, error: 'Invalid dragon ID', code: 'INVALID_ID' };
    }

    const data = this.playerDataProvider(playerId);
    if (!data) {
      return { valid: false, error: 'Player data not found', code: 'NO_DATA' };
    }

    const dragon = data.dragons.find((d) => d.instanceId === dragonInstanceId);
    if (!dragon) {
      return { valid: false, error: 'Dragon not owned', code: 'NOT_OWNED' };
    }

    return { valid: true };
  }

  validateDragonTradeable(
    playerId: number,
    dragonInstanceId: string,
  ): ValidationResult {
    const ownershipResult = this.validateDragonOwnership(
      playerId,
      dragonInstanceId,
    );
    if (!ownershipResult.valid) return ownershipResult;

    const data = this.playerDataProvider(playerId)!;
    const dragon = data.dragons.find((d) => d.instanceId === dragonInstanceId)!;

    // Can't trade favorited dragons
    if (dragon.isFavorite) {
      return {
        valid: false,
        error: 'Cannot trade favorited dragon',
        code: 'FAVORITED',
      };
    }

    // Can't trade dragons in active slots
    if (data.activeDragonSlots.includes(dragonInstanceId)) {
      return {
        valid: false,
        error: 'Cannot trade active dragon',
        code: 'ACTIVE_SLOT',
      };
    }

    return { valid: true };
  }

  validateDragonBreedable(
    playerId: number,
    dragonInstanceId: string,
  ): ValidationResult {
    const ownershipResult = this.validateDragonOwnership(
      playerId,
      dragonInstanceId,
    );
    if (!ownershipResult.valid) return ownershipResult;

    const data = this.playerDataProvider(playerId)!;
    const dragon = data.dragons.find((d) => d.instanceId === dragonInstanceId)!;

    // Must be adult
    if (dragon.evolutionStage < 3) {
      return { valid: false, error: 'Dragon must be adult', code: 'NOT_ADULT' };
    }

    // Check breed count
    if (dragon.breedCount >= 3) {
      return {
        valid: false,
        error: 'Max breed count reached',
        code: 'MAX_BREEDS',
      };
    }

    return { valid: true };
  }

  // ========== PLAYER VALIDATION ==========

  validatePlayerLevel(
    playerId: number,
    requiredLevel: number,
  ): ValidationResult {
    const data = this.playerDataProvider(playerId);
    if (!data) {
      return { valid: false, error: 'Player data not found', code: 'NO_DATA' };
    }

    if (data.level < requiredLevel) {
      return {
        valid: false,
        error: `Requires level ${requiredLevel}`,
        code: 'LEVEL_TOO_LOW',
      };
    }

    return { valid: true };
  }

  validatePlayerInClan(playerId: number): ValidationResult {
    const data = this.playerDataProvider(playerId);
    if (!data) {
      return { valid: false, error: 'Player data not found', code: 'NO_DATA' };
    }

    if (!data.clanId) {
      return { valid: false, error: 'Not in a clan', code: 'NO_CLAN' };
    }

    return { valid: true };
  }

  // ========== INPUT VALIDATION ==========

  validateString(
    value: unknown,
    minLength: number,
    maxLength: number,
  ): ValidationResult {
    if (typeof value !== 'string') {
      return { valid: false, error: 'Must be a string', code: 'INVALID_TYPE' };
    }

    if (value.length < minLength) {
      return {
        valid: false,
        error: `Minimum ${minLength} characters`,
        code: 'TOO_SHORT',
      };
    }

    if (value.length > maxLength) {
      return {
        valid: false,
        error: `Maximum ${maxLength} characters`,
        code: 'TOO_LONG',
      };
    }

    return { valid: true };
  }

  validateNumber(value: unknown, min: number, max: number): ValidationResult {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return {
        valid: false,
        error: 'Must be a valid number',
        code: 'INVALID_TYPE',
      };
    }

    if (value < min) {
      return {
        valid: false,
        error: `Minimum value is ${min}`,
        code: 'TOO_LOW',
      };
    }

    if (value > max) {
      return {
        valid: false,
        error: `Maximum value is ${max}`,
        code: 'TOO_HIGH',
      };
    }

    return { valid: true };
  }

  validateElement(value: unknown): ValidationResult {
    const validElements: Element[] = [
      'fire',
      'water',
      'ice',
      'electric',
      'nature',
      'shadow',
      'light',
    ];

    if (
      typeof value !== 'string' ||
      !validElements.includes(value as Element)
    ) {
      return {
        valid: false,
        error: 'Invalid element',
        code: 'INVALID_ELEMENT',
      };
    }

    return { valid: true };
  }

  // ========== COMPOSITE VALIDATION ==========

  validateTradeOffer(
    offererId: number,
    receiverId: number,
    dragonIds: string[],
    coins: number,
    gems: number,
  ): ValidationResult {
    // Self-trade check
    if (offererId === receiverId) {
      return {
        valid: false,
        error: 'Cannot trade with yourself',
        code: 'SELF_TRADE',
      };
    }

    // Rate limit
    const rateResult = this.checkRateLimit(offererId, 'trade_request');
    if (!rateResult.valid) return rateResult;

    // Currency validation
    if (coins > 0) {
      const coinsResult = this.validateCoins(offererId, coins);
      if (!coinsResult.valid) return coinsResult;
    }

    if (gems > 0) {
      const gemsResult = this.validateGems(offererId, gems);
      if (!gemsResult.valid) return gemsResult;
    }

    // Dragon validation
    for (const dragonId of dragonIds) {
      const dragonResult = this.validateDragonTradeable(offererId, dragonId);
      if (!dragonResult.valid) return dragonResult;
    }

    return { valid: true };
  }

  validateBreedingPair(
    playerId: number,
    dragon1Id: string,
    dragon2Id: string,
  ): ValidationResult {
    // Rate limit
    const rateResult = this.checkRateLimit(playerId, 'breed');
    if (!rateResult.valid) return rateResult;

    // Self-breed check
    if (dragon1Id === dragon2Id) {
      return {
        valid: false,
        error: 'Cannot breed dragon with itself',
        code: 'SELF_BREED',
      };
    }

    // Validate each dragon
    const dragon1Result = this.validateDragonBreedable(playerId, dragon1Id);
    if (!dragon1Result.valid) return dragon1Result;

    const dragon2Result = this.validateDragonBreedable(playerId, dragon2Id);
    if (!dragon2Result.valid) return dragon2Result;

    return { valid: true };
  }

  validateEggHatch(playerId: number, gemCost: number): ValidationResult {
    const rateResult = this.checkRateLimit(playerId, 'egg_hatch');
    if (!rateResult.valid) return rateResult;

    const gemsResult = this.validateGems(playerId, gemCost);
    if (!gemsResult.valid) return gemsResult;

    return { valid: true };
  }
}
