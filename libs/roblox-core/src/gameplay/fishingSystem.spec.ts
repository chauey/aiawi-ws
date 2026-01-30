/**
 * Fishing System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Types
  FishSpecies,
  FishingLocation,
  PlayerFishingState,
  FishingConfig,
  // Core functions
  getInitialFishingState,
  canFishAtLocation,
  castLine,
  reelIn,
  rollRarity,
  rollQuality,
  calculateWeight,
  getAvailableFish,
  selectFish,
  checkLevelUp,
  // Utilities
  calculateSellPrice,
  sellFish,
  getCollectionProgress,
  getPlayerStats,
  formatFishDisplay,
  // Sample data
  SAMPLE_FISH_SPECIES,
  SAMPLE_LOCATIONS,
  SAMPLE_RODS,
  SAMPLE_BAITS,
  DEFAULT_FISHING_CONFIG,
} from './fishingSystem';

describe('Fishing System', () => {
  let playerState: PlayerFishingState;
  let config: FishingConfig;

  beforeEach(() => {
    playerState = getInitialFishingState();
    config = DEFAULT_FISHING_CONFIG;
  });

  describe('Initialization', () => {
    it('should create initial player state with correct defaults', () => {
      expect(playerState.level).toBe(1);
      expect(playerState.experience).toBe(0);
      expect(playerState.totalFishCaught).toBe(0);
      expect(playerState.inventory).toEqual([]);
      expect(playerState.discoveredSpecies).toEqual([]);
      expect(playerState.currentRod).not.toBeNull();
      expect(playerState.isFishing).toBe(false);
    });

    it('should start with basic rod', () => {
      expect(playerState.currentRod?.id).toBe('basic_rod');
      expect(playerState.currentRod?.tier).toBe(1);
    });
  });

  describe('Location Access', () => {
    it('should allow fishing at starter pond at level 1', () => {
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;
      const result = canFishAtLocation(playerState, starterPond);
      expect(result.canFish).toBe(true);
    });

    it('should block fishing at high-level locations', () => {
      const deepSea = SAMPLE_LOCATIONS.find((l) => l.id === 'deep_sea')!;
      const result = canFishAtLocation(playerState, deepSea);
      expect(result.canFish).toBe(false);
      expect(result.code).toBe('LEVEL_TOO_LOW');
    });

    it('should block fishing without a rod', () => {
      playerState.currentRod = null;
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;
      const result = canFishAtLocation(playerState, starterPond);
      expect(result.canFish).toBe(false);
      expect(result.code).toBe('NO_ROD');
    });

    it('should block fishing while already fishing', () => {
      playerState.isFishing = true;
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;
      const result = canFishAtLocation(playerState, starterPond);
      expect(result.canFish).toBe(false);
      expect(result.code).toBe('ALREADY_FISHING');
    });
  });

  describe('Casting Line', () => {
    it('should successfully cast at valid location', () => {
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;
      const result = castLine(playerState, starterPond, config);

      expect(result.success).toBe(true);
      expect(result.estimatedCatchTime).toBeDefined();
      expect(playerState.isFishing).toBe(true);
      expect(playerState.currentLocationId).toBe('starter_pond');
    });

    it('should reduce catch time with better rod', () => {
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;

      // With basic rod
      const result1 = castLine(playerState, starterPond, config);
      const basicTime = result1.estimatedCatchTime!;

      // Reset and use master rod
      playerState = getInitialFishingState();
      playerState.currentRod = SAMPLE_RODS.find((r) => r.id === 'master_rod')!;
      const result2 = castLine(playerState, starterPond, config);
      const masterTime = result2.estimatedCatchTime!;

      expect(masterTime).toBeLessThan(basicTime);
    });

    it('should reduce catch time with bait', () => {
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;

      // Without bait
      const result1 = castLine(playerState, starterPond, config);
      const noBaitTime = result1.estimatedCatchTime!;

      // Reset and use bait
      playerState = getInitialFishingState();
      playerState.currentBait = SAMPLE_BAITS.find(
        (b) => b.id === 'special_bait',
      )!;
      const result2 = castLine(playerState, starterPond, config);
      const withBaitTime = result2.estimatedCatchTime!;

      expect(withBaitTime).toBeLessThan(noBaitTime);
    });
  });

  describe('Rarity Rolling', () => {
    it('should return valid rarity', () => {
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;
      const validRarities = [
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
        'mythic',
      ];

      for (let i = 0; i < 100; i++) {
        const rarity = rollRarity(
          config,
          starterPond,
          playerState.currentRod,
          null,
        );
        expect(validRarities).toContain(rarity);
      }
    });

    it('should most commonly return common fish', () => {
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;
      let commonCount = 0;

      for (let i = 0; i < 1000; i++) {
        const rarity = rollRarity(
          config,
          starterPond,
          playerState.currentRod,
          null,
        );
        if (rarity === 'common') commonCount++;
      }

      // Common should be at least 40% of catches
      expect(commonCount).toBeGreaterThan(400);
    });
  });

  describe('Quality Rolling', () => {
    it('should return valid quality', () => {
      const validQualities = ['poor', 'normal', 'good', 'perfect'];

      for (let i = 0; i < 100; i++) {
        const quality = rollQuality(config);
        expect(validQualities).toContain(quality);
      }
    });

    it('should most commonly return normal quality', () => {
      let normalCount = 0;

      for (let i = 0; i < 1000; i++) {
        const quality = rollQuality(config);
        if (quality === 'normal') normalCount++;
      }

      // Normal should be at least 40% of catches
      expect(normalCount).toBeGreaterThan(400);
    });
  });

  describe('Catching Fish', () => {
    it('should fail to reel in if not fishing', () => {
      const result = reelIn(
        playerState,
        SAMPLE_FISH_SPECIES,
        SAMPLE_LOCATIONS,
        config,
      );
      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FISHING');
    });

    it('should successfully catch fish after casting', () => {
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;
      castLine(playerState, starterPond, config);

      const result = reelIn(
        playerState,
        SAMPLE_FISH_SPECIES,
        SAMPLE_LOCATIONS,
        config,
      );

      expect(result.success).toBe(true);
      expect(result.fish).toBeDefined();
      expect(result.species).toBeDefined();
      expect(result.xpGained).toBeGreaterThan(0);
      expect(playerState.isFishing).toBe(false);
      expect(playerState.inventory.length).toBe(1);
      expect(playerState.totalFishCaught).toBe(1);
    });

    it('should track first discovery bonus', () => {
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;
      castLine(playerState, starterPond, config);

      const result = reelIn(
        playerState,
        SAMPLE_FISH_SPECIES,
        SAMPLE_LOCATIONS,
        config,
      );

      expect(result.isNewDiscovery).toBe(true);
      expect(playerState.discoveredSpecies.length).toBe(1);
    });

    it('should consume bait uses', () => {
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;
      playerState.currentBait = { ...SAMPLE_BAITS[0], uses: 2 }; // Worm with 2 uses

      castLine(playerState, starterPond, config);
      reelIn(playerState, SAMPLE_FISH_SPECIES, SAMPLE_LOCATIONS, config);

      expect(playerState.currentBait?.uses).toBe(1);

      // Second catch should remove bait
      castLine(playerState, starterPond, config);
      reelIn(playerState, SAMPLE_FISH_SPECIES, SAMPLE_LOCATIONS, config);

      expect(playerState.currentBait).toBeNull();
    });
  });

  describe('Weight Calculation', () => {
    it('should calculate weight within variance', () => {
      const goldfish = SAMPLE_FISH_SPECIES.find((s) => s.id === 'goldfish')!;

      for (let i = 0; i < 100; i++) {
        const weight = calculateWeight(goldfish, playerState, config);
        const minWeight = goldfish.baseWeight * (1 - goldfish.weightVariance);
        const maxWeight =
          goldfish.baseWeight * (1 + goldfish.weightVariance) * 1.5; // With level bonus

        expect(weight).toBeGreaterThan(0);
        expect(weight).toBeLessThanOrEqual(maxWeight);
      }
    });

    it('should apply level bonus to weight', () => {
      const goldfish = SAMPLE_FISH_SPECIES.find((s) => s.id === 'goldfish')!;
      let lowLevelTotal = 0;
      let highLevelTotal = 0;

      // Level 1 weights
      for (let i = 0; i < 100; i++) {
        lowLevelTotal += calculateWeight(goldfish, playerState, config);
      }

      // Level 50 weights
      playerState.level = 50;
      for (let i = 0; i < 100; i++) {
        highLevelTotal += calculateWeight(goldfish, playerState, config);
      }

      expect(highLevelTotal).toBeGreaterThan(lowLevelTotal);
    });
  });

  describe('Available Fish Selection', () => {
    it('should filter fish by location', () => {
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;
      const available = getAvailableFish(starterPond, SAMPLE_FISH_SPECIES, 50);

      // Starter pond should only have goldfish, minnow, carp
      expect(available.length).toBe(3);
      expect(available.map((f) => f.id)).toContain('goldfish');
      expect(available.map((f) => f.id)).toContain('minnow');
      expect(available.map((f) => f.id)).toContain('carp');
      expect(available.map((f) => f.id)).not.toContain('salmon');
    });

    it('should filter fish by player level', () => {
      const ocean = SAMPLE_LOCATIONS.find((l) => l.id === 'ocean')!;

      // Level 10 can't catch tuna (requires 25)
      const availableLevel10 = getAvailableFish(ocean, SAMPLE_FISH_SPECIES, 10);
      expect(availableLevel10.map((f) => f.id)).not.toContain('tuna');

      // Level 30 can catch tuna
      const availableLevel30 = getAvailableFish(ocean, SAMPLE_FISH_SPECIES, 30);
      expect(availableLevel30.map((f) => f.id)).toContain('tuna');
    });
  });

  describe('Sell Fish', () => {
    it('should calculate sell price correctly', () => {
      const goldfish = SAMPLE_FISH_SPECIES.find((s) => s.id === 'goldfish')!;
      const caughtFish = {
        speciesId: 'goldfish',
        weight: 0.2,
        quality: 'normal' as const,
        caughtAt: Date.now(),
        locationId: 'starter_pond',
      };

      const price = calculateSellPrice(caughtFish, goldfish, config);
      expect(price).toBe(5); // Base price with normal quality
    });

    it('should apply quality multiplier', () => {
      const goldfish = SAMPLE_FISH_SPECIES.find((s) => s.id === 'goldfish')!;

      const normalFish = {
        speciesId: 'goldfish',
        weight: 0.2,
        quality: 'normal' as const,
        caughtAt: Date.now(),
        locationId: 'starter_pond',
      };

      const perfectFish = {
        speciesId: 'goldfish',
        weight: 0.2,
        quality: 'perfect' as const,
        caughtAt: Date.now(),
        locationId: 'starter_pond',
      };

      const normalPrice = calculateSellPrice(normalFish, goldfish, config);
      const perfectPrice = calculateSellPrice(perfectFish, goldfish, config);

      expect(perfectPrice).toBeGreaterThan(normalPrice);
    });

    it('should remove fish from inventory and add earnings', () => {
      // Catch a fish first
      const starterPond = SAMPLE_LOCATIONS.find(
        (l) => l.id === 'starter_pond',
      )!;
      castLine(playerState, starterPond, config);
      reelIn(playerState, SAMPLE_FISH_SPECIES, SAMPLE_LOCATIONS, config);

      expect(playerState.inventory.length).toBe(1);
      const initialEarnings = playerState.totalEarnings;

      const result = sellFish(playerState, 0, SAMPLE_FISH_SPECIES, config);

      expect(result.success).toBe(true);
      expect(result.earnings).toBeGreaterThan(0);
      expect(playerState.inventory.length).toBe(0);
      expect(playerState.totalEarnings).toBeGreaterThan(initialEarnings);
    });
  });

  describe('Leveling System', () => {
    it('should level up when enough XP', () => {
      // Level 2 requires 150 XP (100 * 1.5^1)
      playerState.experience = 200;

      const result = checkLevelUp(playerState, config);

      expect(result.levelUp).toBe(true);
      expect(result.newLevel).toBe(2);
      expect(playerState.level).toBe(2);
      expect(playerState.experience).toBe(50); // 200 - 150 = 50 remaining
    });

    it('should not level up without enough XP', () => {
      playerState.experience = 50;

      const result = checkLevelUp(playerState, config);

      expect(result.levelUp).toBe(false);
      expect(result.newLevel).toBe(1);
      expect(playerState.level).toBe(1);
    });
  });

  describe('Collection Progress', () => {
    it('should track collection progress', () => {
      const progress = getCollectionProgress(playerState, SAMPLE_FISH_SPECIES);

      expect(progress.discovered).toBe(0);
      expect(progress.total).toBe(SAMPLE_FISH_SPECIES.length);
      expect(progress.percentage).toBe(0);
    });

    it('should update progress when fish discovered', () => {
      playerState.discoveredSpecies = ['goldfish', 'minnow'];

      const progress = getCollectionProgress(playerState, SAMPLE_FISH_SPECIES);

      expect(progress.discovered).toBe(2);
      expect(progress.byRarity.common.discovered).toBe(2);
    });
  });

  describe('Player Stats', () => {
    it('should return correct stats summary', () => {
      playerState.totalFishCaught = 10;
      playerState.totalWeight = 15.5;
      playerState.totalEarnings = 500;
      playerState.discoveredSpecies = ['goldfish', 'minnow'];

      const stats = getPlayerStats(playerState);

      expect(stats.level).toBe(1);
      expect(stats.totalFishCaught).toBe(10);
      expect(stats.totalWeight).toBe('15.50 kg');
      expect(stats.totalEarnings).toBe(500);
      expect(stats.discoveredSpecies).toBe(2);
    });
  });

  describe('Display Formatting', () => {
    it('should format fish display correctly', () => {
      const goldfish = SAMPLE_FISH_SPECIES.find((s) => s.id === 'goldfish')!;
      const caughtFish = {
        speciesId: 'goldfish',
        weight: 0.25,
        quality: 'good' as const,
        caughtAt: Date.now(),
        locationId: 'starter_pond',
        isRecord: true,
      };

      const display = formatFishDisplay(caughtFish, goldfish);

      expect(display).toContain('Goldfish');
      expect(display).toContain('0.25kg');
      expect(display).toContain('🏆'); // Record marker
    });
  });

  describe('Sample Data Integrity', () => {
    it('should have valid fish species', () => {
      expect(SAMPLE_FISH_SPECIES.length).toBeGreaterThan(0);

      for (const species of SAMPLE_FISH_SPECIES) {
        expect(species.id).toBeDefined();
        expect(species.name).toBeDefined();
        expect(species.basePrice).toBeGreaterThan(0);
        expect(species.baseWeight).toBeGreaterThan(0);
        expect(species.locations.length).toBeGreaterThan(0);
      }
    });

    it('should have valid locations', () => {
      expect(SAMPLE_LOCATIONS.length).toBeGreaterThan(0);

      for (const location of SAMPLE_LOCATIONS) {
        expect(location.id).toBeDefined();
        expect(location.name).toBeDefined();
        expect(location.unlockLevel).toBeGreaterThan(0);
        expect(location.availableSpecies.length).toBeGreaterThan(0);
      }
    });

    it('should have matching fish-location relationships', () => {
      for (const species of SAMPLE_FISH_SPECIES) {
        for (const locationId of species.locations) {
          const location = SAMPLE_LOCATIONS.find((l) => l.id === locationId);
          if (location) {
            expect(location.availableSpecies).toContain(species.id);
          }
        }
      }
    });
  });
});
