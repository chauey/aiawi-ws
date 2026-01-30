/**
 * ValidationService - Comprehensive Unit Tests
 * Tests centralized validation for all game security checks
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ValidationService,
  PlayerData,
  setTime,
  clearRateLimits,
} from './validationService';

// ==================== TEST SETUP ====================

const playerDataStore = new Map<number, PlayerData>();

function createTestData(
  playerId: number,
  overrides: Partial<PlayerData> = {},
): void {
  playerDataStore.set(playerId, {
    coins: 1000,
    gems: 50,
    dragons: [
      {
        instanceId: 'd1',
        dragonId: 'fire_drake',
        element: 'fire',
        level: 10,
        evolutionStage: 3,
        breedCount: 0,
        isFavorite: false,
      },
      {
        instanceId: 'd2',
        dragonId: 'water_wyrm',
        element: 'water',
        level: 10,
        evolutionStage: 3,
        breedCount: 0,
        isFavorite: false,
      },
    ],
    activeDragonSlots: [],
    level: 10,
    ...overrides,
  });
}

describe('ValidationService', () => {
  let validator: ValidationService;

  beforeEach(() => {
    playerDataStore.clear();
    clearRateLimits();
    setTime(0);
    validator = new ValidationService((id) => playerDataStore.get(id));
  });

  describe('Rate Limiting', () => {
    it('should allow requests under limit', () => {
      for (let i = 0; i < 10; i++) {
        expect(validator.checkRateLimit(100, 'egg_hatch').valid).toBe(true);
      }
    });

    it('should block requests over limit', () => {
      for (let i = 0; i < 10; i++) {
        validator.checkRateLimit(100, 'egg_hatch');
      }
      const result = validator.checkRateLimit(100, 'egg_hatch');
      expect(result.valid).toBe(false);
      expect(result.code).toBe('RATE_LIMITED');
    });

    it('should reset after window', () => {
      for (let i = 0; i < 10; i++) {
        validator.checkRateLimit(100, 'egg_hatch');
      }
      setTime(61);
      expect(validator.checkRateLimit(100, 'egg_hatch').valid).toBe(true);
    });

    it('should track per player', () => {
      for (let i = 0; i < 10; i++) {
        validator.checkRateLimit(100, 'egg_hatch');
      }
      expect(validator.checkRateLimit(100, 'egg_hatch').valid).toBe(false);
      expect(validator.checkRateLimit(200, 'egg_hatch').valid).toBe(true);
    });

    it('should track per action', () => {
      for (let i = 0; i < 10; i++) {
        validator.checkRateLimit(100, 'egg_hatch');
      }
      expect(validator.checkRateLimit(100, 'egg_hatch').valid).toBe(false);
      expect(validator.checkRateLimit(100, 'breed').valid).toBe(true);
    });

    it('should allow unknown actions', () => {
      for (let i = 0; i < 100; i++) {
        expect(validator.checkRateLimit(100, 'unknown_action').valid).toBe(
          true,
        );
      }
    });
  });

  describe('Currency Validation', () => {
    beforeEach(() => {
      createTestData(100, { coins: 1000, gems: 50 });
    });

    it('should validate exact balance', () => {
      expect(validator.validateCoins(100, 1000).valid).toBe(true);
      expect(validator.validateGems(100, 50).valid).toBe(true);
    });

    it('should validate under balance', () => {
      expect(validator.validateCoins(100, 500).valid).toBe(true);
      expect(validator.validateGems(100, 25).valid).toBe(true);
    });

    it('should reject over balance', () => {
      const result = validator.validateCoins(100, 1001);
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INSUFFICIENT_FUNDS');
    });

    it('should reject negative amounts', () => {
      const result = validator.validateCoins(100, -100);
      expect(result.valid).toBe(false);
      expect(result.code).toBe('NEGATIVE_AMOUNT');
    });

    it('should reject NaN', () => {
      const result = validator.validateCoins(100, NaN);
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_AMOUNT');
    });

    it('should reject Infinity', () => {
      const result = validator.validateCoins(100, Infinity);
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_AMOUNT');
    });

    it('should reject unknown player', () => {
      const result = validator.validateCoins(999, 100);
      expect(result.valid).toBe(false);
      expect(result.code).toBe('NO_DATA');
    });
  });

  describe('Dragon Ownership Validation', () => {
    beforeEach(() => {
      createTestData(100);
    });

    it('should validate owned dragon', () => {
      expect(validator.validateDragonOwnership(100, 'd1').valid).toBe(true);
    });

    it('should reject unowned dragon', () => {
      const result = validator.validateDragonOwnership(100, 'd999');
      expect(result.valid).toBe(false);
      expect(result.code).toBe('NOT_OWNED');
    });

    it('should reject empty ID', () => {
      const result = validator.validateDragonOwnership(100, '');
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_ID');
    });
  });

  describe('Dragon Tradeable Validation', () => {
    beforeEach(() => {
      createTestData(100);
    });

    it('should validate tradeable dragon', () => {
      expect(validator.validateDragonTradeable(100, 'd1').valid).toBe(true);
    });

    it('should reject favorited dragon', () => {
      playerDataStore.get(100)!.dragons[0].isFavorite = true;
      const result = validator.validateDragonTradeable(100, 'd1');
      expect(result.valid).toBe(false);
      expect(result.code).toBe('FAVORITED');
    });

    it('should reject active slot dragon', () => {
      playerDataStore.get(100)!.activeDragonSlots = ['d1'];
      const result = validator.validateDragonTradeable(100, 'd1');
      expect(result.valid).toBe(false);
      expect(result.code).toBe('ACTIVE_SLOT');
    });
  });

  describe('Dragon Breedable Validation', () => {
    beforeEach(() => {
      createTestData(100);
    });

    it('should validate breedable dragon', () => {
      expect(validator.validateDragonBreedable(100, 'd1').valid).toBe(true);
    });

    it('should reject non-adult dragon', () => {
      playerDataStore.get(100)!.dragons[0].evolutionStage = 2;
      const result = validator.validateDragonBreedable(100, 'd1');
      expect(result.valid).toBe(false);
      expect(result.code).toBe('NOT_ADULT');
    });

    it('should reject max breed count', () => {
      playerDataStore.get(100)!.dragons[0].breedCount = 3;
      const result = validator.validateDragonBreedable(100, 'd1');
      expect(result.valid).toBe(false);
      expect(result.code).toBe('MAX_BREEDS');
    });
  });

  describe('Input Validation', () => {
    it('should validate string length', () => {
      expect(validator.validateString('test', 1, 10).valid).toBe(true);
      expect(validator.validateString('', 1, 10).valid).toBe(false);
      expect(validator.validateString('a'.repeat(20), 1, 10).valid).toBe(false);
    });

    it('should reject non-strings', () => {
      expect(validator.validateString(123, 1, 10).valid).toBe(false);
      expect(validator.validateString(null, 1, 10).valid).toBe(false);
    });

    it('should validate number range', () => {
      expect(validator.validateNumber(5, 0, 10).valid).toBe(true);
      expect(validator.validateNumber(-1, 0, 10).valid).toBe(false);
      expect(validator.validateNumber(11, 0, 10).valid).toBe(false);
    });

    it('should reject non-numbers', () => {
      expect(validator.validateNumber('5', 0, 10).valid).toBe(false);
      expect(validator.validateNumber(NaN, 0, 10).valid).toBe(false);
    });

    it('should validate elements', () => {
      expect(validator.validateElement('fire').valid).toBe(true);
      expect(validator.validateElement('water').valid).toBe(true);
      expect(validator.validateElement('invalid').valid).toBe(false);
      expect(validator.validateElement(123).valid).toBe(false);
    });
  });

  describe('Composite Validations', () => {
    beforeEach(() => {
      createTestData(100, { coins: 1000, gems: 50 });
      createTestData(200, { coins: 500, gems: 25 });
    });

    describe('Trade Offer Validation', () => {
      it('should validate complete trade offer', () => {
        const result = validator.validateTradeOffer(100, 200, ['d1'], 100, 0);
        expect(result.valid).toBe(true);
      });

      it('should reject self-trade', () => {
        const result = validator.validateTradeOffer(100, 100, ['d1'], 0, 0);
        expect(result.valid).toBe(false);
        expect(result.code).toBe('SELF_TRADE');
      });

      it('should reject insufficient currency', () => {
        const result = validator.validateTradeOffer(100, 200, [], 2000, 0);
        expect(result.valid).toBe(false);
        expect(result.code).toBe('INSUFFICIENT_FUNDS');
      });

      it('should reject non-tradeable dragon', () => {
        playerDataStore.get(100)!.dragons[0].isFavorite = true;
        const result = validator.validateTradeOffer(100, 200, ['d1'], 0, 0);
        expect(result.valid).toBe(false);
        expect(result.code).toBe('FAVORITED');
      });

      it('should apply rate limiting', () => {
        for (let i = 0; i < 10; i++) {
          validator.validateTradeOffer(100, 200, [], 0, 0);
        }
        const result = validator.validateTradeOffer(100, 200, [], 0, 0);
        expect(result.valid).toBe(false);
        expect(result.code).toBe('RATE_LIMITED');
      });
    });

    describe('Breeding Pair Validation', () => {
      it('should validate valid breeding pair', () => {
        const result = validator.validateBreedingPair(100, 'd1', 'd2');
        expect(result.valid).toBe(true);
      });

      it('should reject self-breed', () => {
        const result = validator.validateBreedingPair(100, 'd1', 'd1');
        expect(result.valid).toBe(false);
        expect(result.code).toBe('SELF_BREED');
      });

      it('should reject non-adult', () => {
        playerDataStore.get(100)!.dragons[0].evolutionStage = 2;
        const result = validator.validateBreedingPair(100, 'd1', 'd2');
        expect(result.valid).toBe(false);
        expect(result.code).toBe('NOT_ADULT');
      });

      it('should apply rate limiting', () => {
        for (let i = 0; i < 5; i++) {
          validator.validateBreedingPair(100, 'd1', 'd2');
        }
        const result = validator.validateBreedingPair(100, 'd1', 'd2');
        expect(result.valid).toBe(false);
        expect(result.code).toBe('RATE_LIMITED');
      });
    });

    describe('Egg Hatch Validation', () => {
      it('should validate valid hatch', () => {
        const result = validator.validateEggHatch(100, 10);
        expect(result.valid).toBe(true);
      });

      it('should reject insufficient gems', () => {
        const result = validator.validateEggHatch(100, 100);
        expect(result.valid).toBe(false);
        expect(result.code).toBe('INSUFFICIENT_FUNDS');
      });

      it('should apply rate limiting', () => {
        for (let i = 0; i < 10; i++) {
          validator.validateEggHatch(100, 0);
        }
        const result = validator.validateEggHatch(100, 0);
        expect(result.valid).toBe(false);
        expect(result.code).toBe('RATE_LIMITED');
      });
    });
  });
});
