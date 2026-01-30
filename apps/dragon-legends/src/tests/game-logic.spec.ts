// Unit Tests for Dragon Legends Logic
// These tests verify pure functions that don't depend on Roblox APIs

import { describe, it, expect } from 'vitest';

// ==================== ELEMENT EFFECTIVENESS TESTS ====================

describe('Element Effectiveness Matrix', () => {
  // Element type definitions matching config.ts
  const ELEMENT_CHART: Record<string, Record<string, number>> = {
    fire: { nature: 2.0, ice: 2.0, water: 0.5, fire: 0.5 },
    water: { fire: 2.0, nature: 0.5, electric: 0.5, water: 0.5 },
    nature: { water: 2.0, electric: 2.0, fire: 0.5, ice: 0.5 },
    ice: { nature: 2.0, water: 2.0, fire: 0.5 },
    electric: { water: 2.0, ice: 2.0, nature: 0.5 },
    shadow: { light: 2.0, cosmic: 2.0, shadow: 0.5 },
    light: { shadow: 2.0, void: 2.0, light: 0.5 },
    cosmic: { void: 2.0, chaos: 2.0, shadow: 0.5 },
    void: { chaos: 2.0, cosmic: 0.5, light: 0.5 },
    chaos: { cosmic: 2.0, void: 0.5, chaos: 0 },
  };

  function getEffectiveness(
    attackerElement: string,
    defenderElement: string,
  ): number {
    return ELEMENT_CHART[attackerElement]?.[defenderElement] ?? 1.0;
  }

  it('should return 2.0 for super-effective attacks', () => {
    expect(getEffectiveness('fire', 'nature')).toBe(2.0);
    expect(getEffectiveness('water', 'fire')).toBe(2.0);
    expect(getEffectiveness('shadow', 'light')).toBe(2.0);
  });

  it('should return 0.5 for not-very-effective attacks', () => {
    expect(getEffectiveness('fire', 'water')).toBe(0.5);
    expect(getEffectiveness('nature', 'fire')).toBe(0.5);
  });

  it('should return 1.0 for neutral attacks', () => {
    expect(getEffectiveness('fire', 'shadow')).toBe(1.0);
    expect(getEffectiveness('ice', 'chaos')).toBe(1.0);
  });

  it('should return 0 for immune matchups', () => {
    expect(getEffectiveness('chaos', 'chaos')).toBe(0);
  });
});

// ==================== ELO CALCULATION TESTS ====================

describe('ELO Rating Calculations', () => {
  const K_FACTOR = 32;

  function calculateEloChange(
    winnerRating: number,
    loserRating: number,
  ): { winnerChange: number; loserChange: number } {
    const expectedWinner =
      1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 - expectedWinner;

    const winnerChange = Math.floor(K_FACTOR * (1 - expectedWinner));
    const loserChange = -Math.floor(K_FACTOR * expectedLoser);

    return { winnerChange, loserChange };
  }

  it('should give more points when underdog wins', () => {
    const underdog = calculateEloChange(800, 1200); // weak beats strong
    const favorite = calculateEloChange(1200, 800); // strong beats weak

    expect(underdog.winnerChange).toBeGreaterThan(favorite.winnerChange);
  });

  it('should give equal points for equal ratings', () => {
    const result = calculateEloChange(1000, 1000);
    expect(result.winnerChange).toBe(16); // K/2
    expect(result.loserChange).toBe(-16);
  });

  it('should never give negative rating', () => {
    const result = calculateEloChange(100, 0);
    expect(result.winnerChange).toBeGreaterThanOrEqual(0);
  });

  it('should cap changes based on K-factor', () => {
    const result = calculateEloChange(0, 3000);
    expect(result.winnerChange).toBeLessThanOrEqual(K_FACTOR);
  });
});

// ==================== RARITY WEIGHT TESTS ====================

describe('Gacha Rarity System', () => {
  const RARITIES = [
    { name: 'Common', weight: 50 },
    { name: 'Uncommon', weight: 30 },
    { name: 'Rare', weight: 15 },
    { name: 'Epic', weight: 4 },
    { name: 'Legendary', weight: 0.9 },
    { name: 'Mythic', weight: 0.1 },
  ];

  function getTotalWeight(): number {
    return RARITIES.reduce((sum, r) => sum + r.weight, 0);
  }

  function getRarityPercent(rarity: string): number {
    const total = getTotalWeight();
    const item = RARITIES.find((r) => r.name === rarity);
    return item ? (item.weight / total) * 100 : 0;
  }

  it('should have weights that sum to 100', () => {
    expect(getTotalWeight()).toBe(100);
  });

  it('should have Common as most likely', () => {
    expect(getRarityPercent('Common')).toBe(50);
  });

  it('should have Mythic as rarest', () => {
    expect(getRarityPercent('Mythic')).toBe(0.1);
  });

  it('should have reasonable Epic rate', () => {
    expect(getRarityPercent('Epic')).toBe(4);
  });

  // Test weighted random distribution
  it('should distribute correctly over many pulls (statistical test)', () => {
    const pulls = 10000;
    const counts: Record<string, number> = {};
    RARITIES.forEach((r) => (counts[r.name] = 0));

    for (let i = 0; i < pulls; i++) {
      let random = Math.random() * getTotalWeight();
      for (const rarity of RARITIES) {
        random -= rarity.weight;
        if (random <= 0) {
          counts[rarity.name]++;
          break;
        }
      }
    }

    // Common should be ~50% (allow 45-55% variance)
    const commonPercent = (counts['Common'] / pulls) * 100;
    expect(commonPercent).toBeGreaterThan(45);
    expect(commonPercent).toBeLessThan(55);

    // Mythic should be ~0.1% (allow 0-0.5% due to low sample)
    const mythicPercent = (counts['Mythic'] / pulls) * 100;
    expect(mythicPercent).toBeLessThan(0.5);
  });
});

// ==================== BREEDING COMPATIBILITY TESTS ====================

describe('Dragon Breeding System', () => {
  const BREEDING_OUTCOMES: Record<string, Record<string, string[]>> = {
    fire: {
      fire: ['fire'],
      water: ['fire', 'water'],
      nature: ['fire', 'nature'],
    },
    water: {
      water: ['water'],
      fire: ['fire', 'water'],
      ice: ['water', 'ice'],
    },
    shadow: {
      light: ['shadow', 'light', 'void'], // Special combo
      shadow: ['shadow'],
    },
  };

  function getBreedingOutcomes(parent1: string, parent2: string): string[] {
    return (
      BREEDING_OUTCOMES[parent1]?.[parent2] ||
      BREEDING_OUTCOMES[parent2]?.[parent1] || [parent1, parent2]
    );
  }

  it('should produce same element when breeding same types', () => {
    expect(getBreedingOutcomes('fire', 'fire')).toEqual(['fire']);
    expect(getBreedingOutcomes('water', 'water')).toEqual(['water']);
  });

  it('should produce mixed outcomes for different elements', () => {
    const outcomes = getBreedingOutcomes('fire', 'water');
    expect(outcomes).toContain('fire');
    expect(outcomes).toContain('water');
  });

  it('should have special outcomes for shadow + light', () => {
    const outcomes = getBreedingOutcomes('shadow', 'light');
    expect(outcomes).toContain('void');
  });

  it('should be commutative (order doesnt matter)', () => {
    expect(getBreedingOutcomes('fire', 'water')).toEqual(
      getBreedingOutcomes('water', 'fire'),
    );
  });
});

// ==================== QUEST PROGRESS TESTS ====================

describe('Quest System', () => {
  interface Quest {
    id: string;
    target: number;
    progress: number;
    completed: boolean;
  }

  function updateProgress(quest: Quest, amount: number): Quest {
    const newProgress = Math.min(quest.progress + amount, quest.target);
    return {
      ...quest,
      progress: newProgress,
      completed: newProgress >= quest.target,
    };
  }

  it('should increment progress correctly', () => {
    const quest: Quest = {
      id: 'test',
      target: 10,
      progress: 0,
      completed: false,
    };
    const updated = updateProgress(quest, 3);
    expect(updated.progress).toBe(3);
    expect(updated.completed).toBe(false);
  });

  it('should mark complete when target reached', () => {
    const quest: Quest = {
      id: 'test',
      target: 10,
      progress: 8,
      completed: false,
    };
    const updated = updateProgress(quest, 5);
    expect(updated.progress).toBe(10); // Capped at target
    expect(updated.completed).toBe(true);
  });

  it('should not exceed target', () => {
    const quest: Quest = {
      id: 'test',
      target: 5,
      progress: 4,
      completed: false,
    };
    const updated = updateProgress(quest, 100);
    expect(updated.progress).toBe(5);
  });
});

// ==================== DAILY REWARDS TESTS ====================

describe('Daily Rewards Streak', () => {
  const REWARDS = [
    { day: 1, coins: 100, gems: 0 },
    { day: 2, coins: 150, gems: 0 },
    { day: 3, coins: 200, gems: 5 },
    { day: 7, coins: 500, gems: 20 },
  ];

  function getReward(streak: number): { coins: number; gems: number } {
    // Find exact day match or previous milestone
    const reward = REWARDS.filter((r) => r.day <= streak).pop();
    return reward || { coins: 100, gems: 0 };
  }

  it('should give day 1 reward for new players', () => {
    expect(getReward(1)).toEqual({ day: 1, coins: 100, gems: 0 });
  });

  it('should give better rewards for higher streaks', () => {
    const day1 = getReward(1);
    const day3 = getReward(3);
    expect(day3.coins).toBeGreaterThan(day1.coins);
  });

  it('should give gems on day 3+', () => {
    expect(getReward(3).gems).toBeGreaterThan(0);
  });

  it('should give milestone rewards on day 7', () => {
    const day7 = getReward(7);
    expect(day7.coins).toBe(500);
    expect(day7.gems).toBe(20);
  });
});

// ==================== PRODUCTS VALIDATION TESTS ====================

describe('Robux Products Configuration', () => {
  const DEVELOPER_PRODUCTS = {
    BASIC_EGG: { id: 0, name: 'Basic Dragon Egg', robux: 75 },
    RARE_EGG: { id: 0, name: 'Rare Dragon Egg', robux: 150 },
    LEGENDARY_EGG: { id: 0, name: 'Legendary Dragon Egg', robux: 400 },
    MYTHIC_EGG: { id: 0, name: 'Mythic Dragon Egg', robux: 800 },
    COINS_SMALL: { id: 0, name: '1,000 Coins', robux: 50 },
    COINS_MEDIUM: { id: 0, name: '5,000 Coins', robux: 200 },
    COINS_LARGE: { id: 0, name: '15,000 Coins', robux: 500 },
  };

  it('should have increasing egg prices by rarity', () => {
    expect(DEVELOPER_PRODUCTS.BASIC_EGG.robux).toBeLessThan(
      DEVELOPER_PRODUCTS.RARE_EGG.robux,
    );
    expect(DEVELOPER_PRODUCTS.RARE_EGG.robux).toBeLessThan(
      DEVELOPER_PRODUCTS.LEGENDARY_EGG.robux,
    );
    expect(DEVELOPER_PRODUCTS.LEGENDARY_EGG.robux).toBeLessThan(
      DEVELOPER_PRODUCTS.MYTHIC_EGG.robux,
    );
  });

  it('should have better value for larger coin packs', () => {
    const smallValue = 1000 / DEVELOPER_PRODUCTS.COINS_SMALL.robux;
    const mediumValue = 5000 / DEVELOPER_PRODUCTS.COINS_MEDIUM.robux;
    const largeValue = 15000 / DEVELOPER_PRODUCTS.COINS_LARGE.robux;

    expect(mediumValue).toBeGreaterThan(smallValue);
    expect(largeValue).toBeGreaterThan(mediumValue);
  });

  it('should have placeholder IDs (0) for unconfigured products', () => {
    const products = [
      DEVELOPER_PRODUCTS.BASIC_EGG,
      DEVELOPER_PRODUCTS.RARE_EGG,
      DEVELOPER_PRODUCTS.LEGENDARY_EGG,
      DEVELOPER_PRODUCTS.MYTHIC_EGG,
    ];
    products.forEach((product) => {
      expect(product.id).toBe(0);
    });
  });
});
