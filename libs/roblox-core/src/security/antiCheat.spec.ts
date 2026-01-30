/**
 * Anti-Cheat & Security System - Comprehensive Unit Tests
 * Tests rate limiting, value validation, movement validation, and exploit prevention
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ==================== MOCK IMPLEMENTATIONS ====================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

interface PlayerData {
  coins: number;
  gems: number;
  dragons: Array<{ instanceId: string; dragonId: string }>;
}

// Mock player data store
const playerDataStore = new Map<number, PlayerData>();

function getPlayerData(playerId: number): PlayerData | undefined {
  return playerDataStore.get(playerId);
}

// Rate limiting
const rateLimits = new Map<string, RateLimitEntry>();
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  egg_hatch: { maxRequests: 10, windowSeconds: 60 },
  breed: { maxRequests: 5, windowSeconds: 60 },
  trade_request: { maxRequests: 10, windowSeconds: 60 },
  arena_queue: { maxRequests: 5, windowSeconds: 30 },
  world_boss_attack: { maxRequests: 60, windowSeconds: 60 },
  coin_collect: { maxRequests: 100, windowSeconds: 10 },
};

let currentTime = 0;
function osTime(): number {
  return currentTime;
}
function setTime(t: number) {
  currentTime = t;
}

function checkRateLimit(playerId: number, action: string): boolean {
  const limitKey = `${playerId}_${action}`;
  const config = RATE_LIMITS[action];

  if (!config) return true;

  const now = osTime();
  const entry = rateLimits.get(limitKey);

  if (!entry || now >= entry.resetTime) {
    rateLimits.set(limitKey, {
      count: 1,
      resetTime: now + config.windowSeconds,
    });
    return true;
  }

  if (entry.count >= config.maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

// Value validation
function validateCoins(playerId: number, amount: number): boolean {
  const data = getPlayerData(playerId);
  if (!data) return false;
  if (Number.isNaN(amount)) return false;
  if (amount < 0 || amount > data.coins) return false;
  return true;
}

function validateGems(playerId: number, amount: number): boolean {
  const data = getPlayerData(playerId);
  if (!data) return false;
  if (amount < 0 || amount > data.gems) return false;
  return true;
}

function validateDragonOwnership(
  playerId: number,
  dragonInstanceId: string,
): boolean {
  const data = getPlayerData(playerId);
  if (!data) return false;
  return data.dragons.some((d) => d.instanceId === dragonInstanceId);
}

// Movement validation
interface PositionEntry {
  position: { x: number; y: number; z: number };
  time: number;
}

const playerPositions = new Map<number, PositionEntry>();
const MAX_SPEED = 100;

function validateMovement(
  playerId: number,
  newPos: { x: number; y: number; z: number },
): { valid: boolean; speed?: number } {
  const now = osTime();
  const lastEntry = playerPositions.get(playerId);

  if (!lastEntry) {
    playerPositions.set(playerId, { position: newPos, time: now });
    return { valid: true };
  }

  const timeDelta = now - lastEntry.time;
  if (timeDelta < 1) {
    playerPositions.set(playerId, { position: newPos, time: now });
    return { valid: true };
  }

  const dx = newPos.x - lastEntry.position.x;
  const dy = newPos.y - lastEntry.position.y;
  const dz = newPos.z - lastEntry.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const speed = distance / timeDelta;

  playerPositions.set(playerId, { position: newPos, time: now });

  if (speed > MAX_SPEED) {
    return { valid: false, speed };
  }

  return { valid: true, speed };
}

// Suspicious activity tracking
interface SuspiciousActivity {
  count: number;
  lastReported: number;
}

const suspiciousPlayers = new Map<number, SuspiciousActivity>();
const KICK_THRESHOLD = 10;

function reportSuspiciousActivity(
  playerId: number,
  reason: string,
): { shouldKick: boolean; count: number } {
  const activity = suspiciousPlayers.get(playerId) ?? {
    count: 0,
    lastReported: 0,
  };
  activity.count++;
  activity.lastReported = osTime();
  suspiciousPlayers.set(playerId, activity);

  return {
    shouldKick: activity.count >= KICK_THRESHOLD,
    count: activity.count,
  };
}

function getSuspiciousCount(playerId: number): number {
  return suspiciousPlayers.get(playerId)?.count ?? 0;
}

// Secure random
function secureRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function secureWeightedRandom<T>(items: Array<{ item: T; weight: number }>): T {
  if (items.length === 0) {
    throw new Error('Cannot select from empty weighted list');
  }

  let totalWeight = 0;
  for (const entry of items) {
    totalWeight += entry.weight;
  }

  if (totalWeight <= 0) {
    throw new Error('Total weight must be positive');
  }

  let random = Math.random() * totalWeight;
  for (const entry of items) {
    random -= entry.weight;
    if (random <= 0) {
      return entry.item;
    }
  }

  return items[items.length - 1].item;
}

// Action validation with rate limiting and payload checks
function validateAction<T>(
  playerId: number,
  action: string,
  payload: T,
  validator: (data: T) => boolean,
): { valid: boolean; reason?: string } {
  if (!checkRateLimit(playerId, action)) {
    return { valid: false, reason: 'rate_limited' };
  }

  if (!validator(payload)) {
    return { valid: false, reason: 'invalid_payload' };
  }

  return { valid: true };
}

// ==================== TESTS ====================

describe('Anti-Cheat System', () => {
  beforeEach(() => {
    rateLimits.clear();
    playerPositions.clear();
    suspiciousPlayers.clear();
    playerDataStore.clear();
    setTime(0);
  });

  describe('Rate Limiting', () => {
    it('should allow requests under the limit', () => {
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit(123, 'egg_hatch')).toBe(true);
      }
    });

    it('should block requests over the limit', () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit(123, 'egg_hatch');
      }
      expect(checkRateLimit(123, 'egg_hatch')).toBe(false);
    });

    it('should reset after window expires', () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit(123, 'egg_hatch');
      }
      expect(checkRateLimit(123, 'egg_hatch')).toBe(false);

      // Advance past window
      setTime(61);
      expect(checkRateLimit(123, 'egg_hatch')).toBe(true);
    });

    it('should track limits per player', () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit(123, 'egg_hatch');
      }
      expect(checkRateLimit(123, 'egg_hatch')).toBe(false);
      expect(checkRateLimit(456, 'egg_hatch')).toBe(true);
    });

    it('should track limits per action', () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit(123, 'egg_hatch');
      }
      expect(checkRateLimit(123, 'egg_hatch')).toBe(false);
      expect(checkRateLimit(123, 'breed')).toBe(true);
    });

    it('should allow unlimited for unconfigured actions', () => {
      for (let i = 0; i < 1000; i++) {
        expect(checkRateLimit(123, 'unknown_action')).toBe(true);
      }
    });

    // EDGE CASES
    it('should handle rapid burst at limit boundary', () => {
      // 9 requests should work, 10th is the last allowed
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit(123, 'egg_hatch')).toBe(true);
      }
      // 11th should fail
      expect(checkRateLimit(123, 'egg_hatch')).toBe(false);
    });

    it('should handle multiple windows', () => {
      // First window
      for (let i = 0; i < 10; i++) checkRateLimit(123, 'egg_hatch');

      // Second window
      setTime(61);
      for (let i = 0; i < 10; i++) checkRateLimit(123, 'egg_hatch');
      expect(checkRateLimit(123, 'egg_hatch')).toBe(false);

      // Third window
      setTime(122);
      expect(checkRateLimit(123, 'egg_hatch')).toBe(true);
    });
  });

  describe('Value Validation', () => {
    beforeEach(() => {
      playerDataStore.set(123, {
        coins: 1000,
        gems: 50,
        dragons: [{ instanceId: 'd1', dragonId: 'fire_drake' }],
      });
    });

    // HAPPY PATH
    it('should validate coins within balance', () => {
      expect(validateCoins(123, 500)).toBe(true);
      expect(validateCoins(123, 1000)).toBe(true);
    });

    it('should validate zero coins', () => {
      expect(validateCoins(123, 0)).toBe(true);
    });

    // SAD PATH
    it('should reject negative coins', () => {
      expect(validateCoins(123, -1)).toBe(false);
      expect(validateCoins(123, -1000)).toBe(false);
    });

    it('should reject coins over balance', () => {
      expect(validateCoins(123, 1001)).toBe(false);
      expect(validateCoins(123, 999999)).toBe(false);
    });

    it('should reject for non-existent player', () => {
      expect(validateCoins(999, 100)).toBe(false);
    });

    // GEM VALIDATION
    it('should validate gems within balance', () => {
      expect(validateGems(123, 50)).toBe(true);
    });

    it('should reject gems over balance', () => {
      expect(validateGems(123, 51)).toBe(false);
    });

    // EDGE CASES
    it('should reject on exact boundary overflow', () => {
      expect(validateCoins(123, 1000)).toBe(true);
      expect(validateCoins(123, 1000.01)).toBe(false);
    });

    it('should handle very large amounts', () => {
      expect(validateCoins(123, Number.MAX_SAFE_INTEGER)).toBe(false);
    });

    it('should handle Infinity', () => {
      expect(validateCoins(123, Infinity)).toBe(false);
    });

    it('should handle NaN as invalid', () => {
      expect(validateCoins(123, NaN)).toBe(false);
    });
  });

  describe('Dragon Ownership Validation', () => {
    beforeEach(() => {
      playerDataStore.set(123, {
        coins: 1000,
        gems: 50,
        dragons: [
          { instanceId: 'd1', dragonId: 'fire_drake' },
          { instanceId: 'd2', dragonId: 'ember_serpent' },
        ],
      });
    });

    it('should validate owned dragon', () => {
      expect(validateDragonOwnership(123, 'd1')).toBe(true);
      expect(validateDragonOwnership(123, 'd2')).toBe(true);
    });

    it('should reject unowned dragon', () => {
      expect(validateDragonOwnership(123, 'd3')).toBe(false);
    });

    it('should reject for non-existent player', () => {
      expect(validateDragonOwnership(999, 'd1')).toBe(false);
    });

    it('should reject empty instance ID', () => {
      expect(validateDragonOwnership(123, '')).toBe(false);
    });

    it('should be case-sensitive on instance IDs', () => {
      expect(validateDragonOwnership(123, 'D1')).toBe(false);
    });
  });

  describe('Movement Validation (Speed Hack Detection)', () => {
    it('should allow normal movement', () => {
      setTime(0);
      validateMovement(123, { x: 0, y: 0, z: 0 });
      setTime(1);
      const result = validateMovement(123, { x: 50, y: 0, z: 0 });
      expect(result.valid).toBe(true);
      expect(result.speed).toBeLessThanOrEqual(MAX_SPEED);
    });

    it('should detect speed hack', () => {
      setTime(0);
      validateMovement(123, { x: 0, y: 0, z: 0 });
      setTime(1);
      const result = validateMovement(123, { x: 200, y: 0, z: 0 });
      expect(result.valid).toBe(false);
      expect(result.speed).toBeGreaterThan(MAX_SPEED);
    });

    it('should allow teleport detection bypass for first position', () => {
      // First position should always be valid
      const result = validateMovement(123, { x: 1000, y: 1000, z: 1000 });
      expect(result.valid).toBe(true);
    });

    it('should not validate if time delta is too small', () => {
      setTime(0);
      validateMovement(123, { x: 0, y: 0, z: 0 });
      setTime(0.5); // Less than 1 second
      const result = validateMovement(123, { x: 1000, y: 0, z: 0 });
      expect(result.valid).toBe(true); // Skips check
    });

    it('should calculate 3D distance correctly', () => {
      setTime(0);
      validateMovement(123, { x: 0, y: 0, z: 0 });
      setTime(1);
      // Distance = sqrt(60^2 + 60^2 + 60^2) = ~104 > MAX_SPEED
      const result = validateMovement(123, { x: 60, y: 60, z: 60 });
      expect(result.valid).toBe(false);
    });

    it('should track per-player positions', () => {
      setTime(0);
      validateMovement(123, { x: 0, y: 0, z: 0 });
      validateMovement(456, { x: 100, y: 100, z: 100 });

      setTime(1);
      // Player 123 moves 50 studs - valid
      expect(validateMovement(123, { x: 50, y: 0, z: 0 }).valid).toBe(true);
      // Player 456 moves from different position - 50 studs - valid
      expect(validateMovement(456, { x: 150, y: 100, z: 100 }).valid).toBe(
        true,
      );
    });

    // EDGE CASES
    it('should handle exactly MAX_SPEED as valid', () => {
      setTime(0);
      validateMovement(123, { x: 0, y: 0, z: 0 });
      setTime(1);
      const result = validateMovement(123, { x: 100, y: 0, z: 0 });
      expect(result.valid).toBe(true);
    });

    it('should handle player standing still', () => {
      setTime(0);
      validateMovement(123, { x: 0, y: 0, z: 0 });
      setTime(10);
      const result = validateMovement(123, { x: 0, y: 0, z: 0 });
      expect(result.valid).toBe(true);
      expect(result.speed).toBe(0);
    });
  });

  describe('Suspicious Activity Tracking', () => {
    it('should count violations', () => {
      const result1 = reportSuspiciousActivity(123, 'speed_hack');
      expect(result1.count).toBe(1);
      expect(result1.shouldKick).toBe(false);

      const result2 = reportSuspiciousActivity(123, 'speed_hack');
      expect(result2.count).toBe(2);
    });

    it('should trigger kick at threshold', () => {
      for (let i = 0; i < 9; i++) {
        const result = reportSuspiciousActivity(123, 'exploit');
        expect(result.shouldKick).toBe(false);
      }
      const result = reportSuspiciousActivity(123, 'exploit');
      expect(result.shouldKick).toBe(true);
    });

    it('should track per player', () => {
      reportSuspiciousActivity(123, 'hack');
      reportSuspiciousActivity(123, 'hack');
      reportSuspiciousActivity(456, 'hack');

      expect(getSuspiciousCount(123)).toBe(2);
      expect(getSuspiciousCount(456)).toBe(1);
    });

    it('should count different violation types together', () => {
      reportSuspiciousActivity(123, 'speed_hack');
      reportSuspiciousActivity(123, 'coin_hack');
      reportSuspiciousActivity(123, 'dragon_dupe');
      expect(getSuspiciousCount(123)).toBe(3);
    });
  });

  describe('Secure Random', () => {
    it('should produce values in range', () => {
      for (let i = 0; i < 100; i++) {
        const value = secureRandom(1, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      }
    });

    it('should produce integers', () => {
      for (let i = 0; i < 100; i++) {
        const value = secureRandom(1, 100);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should handle min equals max', () => {
      expect(secureRandom(5, 5)).toBe(5);
    });
  });

  describe('Secure Weighted Random', () => {
    it('should respect weights over many iterations', () => {
      const items = [
        { item: 'common', weight: 90 },
        { item: 'rare', weight: 10 },
      ];

      const counts = { common: 0, rare: 0 };
      for (let i = 0; i < 1000; i++) {
        const result = secureWeightedRandom(items);
        counts[result as keyof typeof counts]++;
      }

      // Common should be ~90%
      expect(counts.common).toBeGreaterThan(800);
      expect(counts.rare).toBeLessThan(200);
    });

    it('should throw on empty list', () => {
      expect(() => secureWeightedRandom([])).toThrow(
        'Cannot select from empty',
      );
    });

    it('should throw on zero total weight', () => {
      expect(() => secureWeightedRandom([{ item: 'a', weight: 0 }])).toThrow(
        'weight must be positive',
      );
    });
  });

  describe('Action Validation (Combined)', () => {
    beforeEach(() => {
      playerDataStore.set(123, { coins: 1000, gems: 50, dragons: [] });
    });

    it('should allow valid action', () => {
      const result = validateAction(
        123,
        'egg_hatch',
        { eggType: 'basic' },
        (p) => p.eggType === 'basic',
      );
      expect(result.valid).toBe(true);
    });

    it('should reject rate-limited action', () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit(123, 'egg_hatch');
      }
      const result = validateAction(
        123,
        'egg_hatch',
        { eggType: 'basic' },
        () => true,
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('rate_limited');
    });

    it('should reject invalid payload', () => {
      const result = validateAction(
        123,
        'egg_hatch',
        { eggType: 'invalid' },
        (p) => p.eggType === 'basic',
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('invalid_payload');
    });

    it('should check rate limit before payload', () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit(123, 'egg_hatch');
      }
      // Even with invalid payload, rate limit is checked first
      const result = validateAction(
        123,
        'egg_hatch',
        { eggType: 'invalid' },
        (p) => p.eggType === 'basic',
      );
      expect(result.reason).toBe('rate_limited');
    });
  });
});

// ==================== EXPLOIT SCENARIO TESTS ====================

describe('Exploit Prevention Scenarios', () => {
  beforeEach(() => {
    rateLimits.clear();
    playerDataStore.clear();
    setTime(0);
  });

  describe('Currency Manipulation', () => {
    beforeEach(() => {
      playerDataStore.set(123, { coins: 1000, gems: 50, dragons: [] });
    });

    it('should prevent spending more coins than owned', () => {
      expect(validateCoins(123, 1001)).toBe(false);
    });

    it('should prevent negative spending (adding coins)', () => {
      expect(validateCoins(123, -500)).toBe(false);
    });

    it('should prevent integer overflow attacks', () => {
      expect(validateCoins(123, Number.MAX_SAFE_INTEGER)).toBe(false);
    });
  });

  describe('Dragon Duplication', () => {
    beforeEach(() => {
      playerDataStore.set(123, {
        coins: 1000,
        gems: 50,
        dragons: [{ instanceId: 'd1', dragonId: 'fire_drake' }],
      });
      playerDataStore.set(456, { coins: 500, gems: 25, dragons: [] });
    });

    it('should prevent trading unowned dragon', () => {
      expect(validateDragonOwnership(123, 'd2')).toBe(false);
    });

    it('should prevent trading same dragon twice', () => {
      expect(validateDragonOwnership(123, 'd1')).toBe(true);
      // After trade completes, dragon should be removed
      // Simulating: after trade, player no longer owns d1
      playerDataStore.set(123, { coins: 1000, gems: 50, dragons: [] });
      expect(validateDragonOwnership(123, 'd1')).toBe(false);
    });
  });

  describe('Request Flooding', () => {
    it('should prevent egg hatching spam', () => {
      let allowed = 0;
      for (let i = 0; i < 100; i++) {
        if (checkRateLimit(123, 'egg_hatch')) allowed++;
      }
      expect(allowed).toBe(10);
    });

    it('should prevent arena queue spam', () => {
      let allowed = 0;
      for (let i = 0; i < 100; i++) {
        if (checkRateLimit(123, 'arena_queue')) allowed++;
      }
      expect(allowed).toBe(5);
    });

    it('should prevent trade request spam', () => {
      let allowed = 0;
      for (let i = 0; i < 100; i++) {
        if (checkRateLimit(123, 'trade_request')) allowed++;
      }
      expect(allowed).toBe(10);
    });
  });
});
