/**
 * Breeding System - Comprehensive Unit Tests
 * Tests breeding validation, outcomes, cooldowns, and exploit prevention
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ==================== TYPES ====================

type Element =
  | 'fire'
  | 'water'
  | 'ice'
  | 'electric'
  | 'nature'
  | 'shadow'
  | 'light';
type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

interface DragonStats {
  health: number;
  power: number;
  defense: number;
  speed: number;
  luck: number;
}

interface PlayerDragon {
  instanceId: string;
  dragonId: string;
  element: Element;
  level: number;
  evolutionStage: number;
  breedCount: number;
  stats: DragonStats;
}

interface BreedingSlot {
  slotId: number;
  dragon1InstanceId: string;
  dragon2InstanceId: string;
  startTime: number;
  endTime: number;
  resultDragonId: string;
  isShiny: boolean;
}

interface PlayerData {
  gems: number;
  dragons: PlayerDragon[];
  dragonsHatched: number;
}

// ==================== MOCK IMPLEMENTATION ====================

const playerBreedingSlots = new Map<number, BreedingSlot[]>();
const playerDataStore = new Map<number, PlayerData>();
const BREEDING_TIME = 30 * 60; // 30 minutes in seconds
const MAX_BREED_COUNT = 3;

let currentTime = 0;
let slotIdCounter = 0;

function setTime(t: number) {
  currentTime = t;
}
function osTime() {
  return currentTime;
}

function getPlayerData(playerId: number): PlayerData | undefined {
  return playerDataStore.get(playerId);
}

// Hybrid outcomes based on element combinations
const HYBRID_OUTCOMES: Record<string, string[]> = {
  'fire+water': ['fire_drake_baby', 'water_wyrm_baby'],
  'fire+ice': ['fire_drake_baby', 'frost_drake_baby', 'crystal_dragon'],
  'shadow+light': ['shadow_serpent_baby', 'light_sprite_baby', 'cosmic_dragon'],
};

function getBreedingKey(elem1: Element, elem2: Element): string {
  const sorted = [elem1, elem2].sort();
  return `${sorted[0]}+${sorted[1]}`;
}

function getBreedingSlots(playerId: number): BreedingSlot[] {
  return playerBreedingSlots.get(playerId) || [];
}

function startBreeding(
  playerId: number,
  dragon1Id: string,
  dragon2Id: string,
): { success: boolean; slot?: BreedingSlot; error?: string } {
  const data = getPlayerData(playerId);
  if (!data) return { success: false, error: 'Player data not found' };

  const dragon1 = data.dragons.find((d) => d.instanceId === dragon1Id);
  const dragon2 = data.dragons.find((d) => d.instanceId === dragon2Id);

  if (!dragon1 || !dragon2) {
    return { success: false, error: 'Dragons not found' };
  }

  if (dragon1.instanceId === dragon2.instanceId) {
    return { success: false, error: 'Cannot breed dragon with itself' };
  }

  // Must be adults (stage 3+)
  if (dragon1.evolutionStage < 3 || dragon2.evolutionStage < 3) {
    return { success: false, error: 'Dragons must be adults to breed' };
  }

  // Check breed count
  if (dragon1.breedCount >= MAX_BREED_COUNT) {
    return { success: false, error: 'Dragon 1 has reached max breed count' };
  }
  if (dragon2.breedCount >= MAX_BREED_COUNT) {
    return { success: false, error: 'Dragon 2 has reached max breed count' };
  }

  // Get/create slots
  let slots = playerBreedingSlots.get(playerId);
  if (!slots) {
    slots = [];
    playerBreedingSlots.set(playerId, slots);
  }

  // Check if already breeding
  const alreadyBreeding = slots.some(
    (s) =>
      s.dragon1InstanceId === dragon1Id ||
      s.dragon2InstanceId === dragon2Id ||
      s.dragon1InstanceId === dragon2Id ||
      s.dragon2InstanceId === dragon1Id,
  );

  if (alreadyBreeding) {
    return {
      success: false,
      error: 'One of these dragons is already breeding',
    };
  }

  // Determine result
  const key = getBreedingKey(dragon1.element, dragon2.element);
  const outcomes = HYBRID_OUTCOMES[key] || ['fire_drake_baby'];
  const resultDragonId =
    outcomes[Math.floor(Math.random() * Math.min(2, outcomes.length))];
  const isShiny =
    Math.random() < 0.01 + (dragon1.stats.luck + dragon2.stats.luck) * 0.001;

  const slot: BreedingSlot = {
    slotId: ++slotIdCounter,
    dragon1InstanceId: dragon1Id,
    dragon2InstanceId: dragon2Id,
    startTime: osTime(),
    endTime: osTime() + BREEDING_TIME,
    resultDragonId,
    isShiny,
  };

  slots.push(slot);
  dragon1.breedCount++;
  dragon2.breedCount++;

  return { success: true, slot };
}

function collectBreedingResult(
  playerId: number,
  slotId: number,
): { success: boolean; dragonId?: string; error?: string } {
  const slots = playerBreedingSlots.get(playerId);
  if (!slots) return { success: false, error: 'No breeding slots' };

  const slotIndex = slots.findIndex((s) => s.slotId === slotId);
  if (slotIndex === -1) {
    return { success: false, error: 'Slot not found' };
  }

  const slot = slots[slotIndex];

  // Check if ready
  if (osTime() < slot.endTime) {
    return { success: false, error: 'Not ready yet' };
  }

  // Remove slot and create dragon
  slots.splice(slotIndex, 1);
  const data = getPlayerData(playerId);
  if (data) {
    data.dragonsHatched++;
  }

  return { success: true, dragonId: slot.resultDragonId };
}

function speedUpBreeding(
  playerId: number,
  slotId: number,
  gemCost: number,
): { success: boolean; error?: string } {
  const slots = playerBreedingSlots.get(playerId);
  if (!slots) return { success: false, error: 'No breeding slots' };

  const slot = slots.find((s) => s.slotId === slotId);
  if (!slot) return { success: false, error: 'Slot not found' };

  const data = getPlayerData(playerId);
  if (!data || data.gems < gemCost) {
    return { success: false, error: 'Not enough gems' };
  }

  if (gemCost < 0) {
    return { success: false, error: 'Invalid gem cost' };
  }

  data.gems -= gemCost;
  slot.endTime = osTime(); // Complete immediately

  return { success: true };
}

// ==================== TEST HELPERS ====================

function createTestDragon(overrides: Partial<PlayerDragon> = {}): PlayerDragon {
  return {
    instanceId: `dragon_${Math.random()}`,
    dragonId: 'fire_drake',
    element: 'fire',
    level: 10,
    evolutionStage: 3, // Adult
    breedCount: 0,
    stats: { health: 100, power: 50, defense: 30, speed: 40, luck: 10 },
    ...overrides,
  };
}

// ==================== TESTS ====================

describe('Breeding System', () => {
  beforeEach(() => {
    playerBreedingSlots.clear();
    playerDataStore.clear();
    setTime(0);
    slotIdCounter = 0;
  });

  describe('Breeding Validation', () => {
    beforeEach(() => {
      const dragon1 = createTestDragon({ instanceId: 'd1', element: 'fire' });
      const dragon2 = createTestDragon({ instanceId: 'd2', element: 'water' });
      playerDataStore.set(100, {
        gems: 100,
        dragons: [dragon1, dragon2],
        dragonsHatched: 0,
      });
    });

    it('should allow valid breeding', () => {
      const result = startBreeding(100, 'd1', 'd2');
      expect(result.success).toBe(true);
      expect(result.slot).toBeDefined();
    });

    it('should prevent self-breeding', () => {
      const result = startBreeding(100, 'd1', 'd1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('itself');
    });

    it('should prevent breeding non-existent dragons', () => {
      const result = startBreeding(100, 'd1', 'd999');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should prevent breeding non-adult dragons', () => {
      const data = getPlayerData(100);
      if (data) {
        data.dragons[0].evolutionStage = 2; // Teen
      }
      const result = startBreeding(100, 'd1', 'd2');
      expect(result.success).toBe(false);
      expect(result.error).toContain('adults');
    });

    it('should prevent breeding when at max breed count', () => {
      const data = getPlayerData(100);
      if (data) {
        data.dragons[0].breedCount = 3;
      }
      const result = startBreeding(100, 'd1', 'd2');
      expect(result.success).toBe(false);
      expect(result.error).toContain('max breed count');
    });

    it('should prevent double-breeding same dragon', () => {
      const dragon3 = createTestDragon({ instanceId: 'd3', element: 'ice' });
      const data = getPlayerData(100);
      if (data) data.dragons.push(dragon3);

      startBreeding(100, 'd1', 'd2');
      const result = startBreeding(100, 'd1', 'd3');
      expect(result.success).toBe(false);
      expect(result.error).toContain('already breeding');
    });

    it('should increment breed count on breeding', () => {
      const data = getPlayerData(100);
      startBreeding(100, 'd1', 'd2');
      expect(data?.dragons[0].breedCount).toBe(1);
      expect(data?.dragons[1].breedCount).toBe(1);
    });
  });

  describe('Breeding Outcomes', () => {
    beforeEach(() => {
      const dragon1 = createTestDragon({ instanceId: 'd1', element: 'fire' });
      const dragon2 = createTestDragon({ instanceId: 'd2', element: 'ice' });
      playerDataStore.set(100, {
        gems: 100,
        dragons: [dragon1, dragon2],
        dragonsHatched: 0,
      });
    });

    it('should create breeding slot with result', () => {
      const result = startBreeding(100, 'd1', 'd2');
      expect(result.slot?.resultDragonId).toBeDefined();
    });

    it('should set correct end time', () => {
      setTime(1000);
      const result = startBreeding(100, 'd1', 'd2');
      expect(result.slot?.startTime).toBe(1000);
      expect(result.slot?.endTime).toBe(1000 + BREEDING_TIME);
    });

    it('should sometimes produce shiny with high luck', () => {
      const data = getPlayerData(100);
      if (data) {
        data.dragons[0].stats.luck = 500;
        data.dragons[1].stats.luck = 500;
      }
      // With 1000 combined luck: 1% + 1% = 2% chance
      // Run multiple times to verify it's possible
      let anyShiny = false;
      for (let i = 0; i < 100; i++) {
        playerBreedingSlots.clear();
        const result = startBreeding(100, 'd1', 'd2');
        if (result.slot?.isShiny) anyShiny = true;
      }
      // With 2% chance, should get at least 1 in 100
      expect(anyShiny).toBe(true);
    });
  });

  describe('Breeding Collection', () => {
    let slot: BreedingSlot;

    beforeEach(() => {
      const dragon1 = createTestDragon({ instanceId: 'd1', element: 'fire' });
      const dragon2 = createTestDragon({ instanceId: 'd2', element: 'water' });
      playerDataStore.set(100, {
        gems: 100,
        dragons: [dragon1, dragon2],
        dragonsHatched: 0,
      });
      const result = startBreeding(100, 'd1', 'd2');
      slot = result.slot!;
    });

    it('should not collect before ready', () => {
      const result = collectBreedingResult(100, slot.slotId);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Not ready');
    });

    it('should collect when ready', () => {
      setTime(BREEDING_TIME + 1);
      const result = collectBreedingResult(100, slot.slotId);
      expect(result.success).toBe(true);
      expect(result.dragonId).toBeDefined();
    });

    it('should remove slot after collection', () => {
      setTime(BREEDING_TIME + 1);
      collectBreedingResult(100, slot.slotId);
      expect(getBreedingSlots(100)).toHaveLength(0);
    });

    it('should increment hatched count', () => {
      setTime(BREEDING_TIME + 1);
      collectBreedingResult(100, slot.slotId);
      expect(getPlayerData(100)?.dragonsHatched).toBe(1);
    });

    it('should reject non-existent slot', () => {
      setTime(BREEDING_TIME + 1);
      const result = collectBreedingResult(100, 9999);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Slot not found');
    });
  });

  describe('Speed Up Breeding', () => {
    let slot: BreedingSlot;

    beforeEach(() => {
      const dragon1 = createTestDragon({ instanceId: 'd1', element: 'fire' });
      const dragon2 = createTestDragon({ instanceId: 'd2', element: 'water' });
      playerDataStore.set(100, {
        gems: 100,
        dragons: [dragon1, dragon2],
        dragonsHatched: 0,
      });
      const result = startBreeding(100, 'd1', 'd2');
      slot = result.slot!;
    });

    it('should speed up with gems', () => {
      const result = speedUpBreeding(100, slot.slotId, 50);
      expect(result.success).toBe(true);
      expect(getPlayerData(100)?.gems).toBe(50); // 100 - 50
    });

    it('should make breeding ready immediately', () => {
      speedUpBreeding(100, slot.slotId, 50);
      const collectResult = collectBreedingResult(100, slot.slotId);
      expect(collectResult.success).toBe(true);
    });

    it('should reject if not enough gems', () => {
      const result = speedUpBreeding(100, slot.slotId, 200);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Not enough gems');
    });

    it('should reject negative gem cost', () => {
      const result = speedUpBreeding(100, slot.slotId, -50);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });
});

// ==================== EXPLOIT SCENARIOS ====================

describe('Breeding Exploit Prevention', () => {
  beforeEach(() => {
    playerBreedingSlots.clear();
    playerDataStore.clear();
    setTime(0);
    slotIdCounter = 0;
  });

  it('should prevent breeding unowned dragons', () => {
    playerDataStore.set(100, {
      gems: 100,
      dragons: [createTestDragon({ instanceId: 'd1' })],
      dragonsHatched: 0,
    });
    playerDataStore.set(200, {
      gems: 100,
      dragons: [createTestDragon({ instanceId: 'd2' })],
      dragonsHatched: 0,
    });

    // Player 100 tries to breed with player 200's dragon
    const result = startBreeding(100, 'd1', 'd2');
    expect(result.success).toBe(false);
  });

  it('should prevent circumventing breed count by simultaneous requests', () => {
    const dragons = [
      createTestDragon({ instanceId: 'd1', breedCount: 2 }),
      createTestDragon({ instanceId: 'd2', breedCount: 0 }),
      createTestDragon({ instanceId: 'd3', breedCount: 0 }),
    ];
    playerDataStore.set(100, { gems: 100, dragons, dragonsHatched: 0 });

    // Start breeding - d1 now at count 3
    startBreeding(100, 'd1', 'd2');

    // Try again - d1 should be at max count
    const result = startBreeding(100, 'd1', 'd3');
    expect(result.success).toBe(false);
  });

  it('should prevent collecting same slot twice', () => {
    const dragons = [
      createTestDragon({ instanceId: 'd1' }),
      createTestDragon({ instanceId: 'd2' }),
    ];
    playerDataStore.set(100, { gems: 100, dragons, dragonsHatched: 0 });

    const { slot } = startBreeding(100, 'd1', 'd2');
    setTime(BREEDING_TIME + 1);

    const result1 = collectBreedingResult(100, slot!.slotId);
    expect(result1.success).toBe(true);

    const result2 = collectBreedingResult(100, slot!.slotId);
    expect(result2.success).toBe(false);
  });

  it('should prevent speed up with gem manipulation', () => {
    const dragons = [
      createTestDragon({ instanceId: 'd1' }),
      createTestDragon({ instanceId: 'd2' }),
    ];
    playerDataStore.set(100, { gems: 10, dragons, dragonsHatched: 0 });

    const { slot } = startBreeding(100, 'd1', 'd2');

    // Try to speed up with more gems than owned
    const result = speedUpBreeding(100, slot!.slotId, 50);
    expect(result.success).toBe(false);
    expect(getPlayerData(100)?.gems).toBe(10); // Unchanged
  });
});
