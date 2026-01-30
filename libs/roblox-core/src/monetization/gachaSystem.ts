// Roblox Core - Gacha/Egg Hatching System
// Reusable weighted random selection system for gacha mechanics

// ==================== TYPES ====================

export interface RarityTier {
  name: string;
  weight: number; // Higher = more common
  color: Color3;
  displayOrder: number;
}

export interface GachaItem<T> {
  id: string;
  data: T;
  rarity: string;
  weight?: number; // Override rarity weight
}

export interface GachaPool<T> {
  name: string;
  items: GachaItem<T>[];
  rarities: RarityTier[];
  pityEnabled?: boolean;
  pityThreshold?: number; // Pulls before guaranteed rare+
  pityRarityMinimum?: string; // Minimum rarity for pity
}

export interface GachaResult<T> {
  item: GachaItem<T>;
  isPity: boolean;
  pullNumber: number;
}

export interface PlayerPityState {
  pullsSinceRare: Map<string, number>; // poolName -> pulls
}

// ==================== DEFAULT RARITIES ====================

export const DEFAULT_RARITIES: RarityTier[] = [
  {
    name: 'Common',
    weight: 50,
    color: Color3.fromRGB(200, 200, 200),
    displayOrder: 1,
  },
  {
    name: 'Uncommon',
    weight: 30,
    color: Color3.fromRGB(100, 255, 100),
    displayOrder: 2,
  },
  {
    name: 'Rare',
    weight: 15,
    color: Color3.fromRGB(100, 150, 255),
    displayOrder: 3,
  },
  {
    name: 'Epic',
    weight: 4,
    color: Color3.fromRGB(200, 100, 255),
    displayOrder: 4,
  },
  {
    name: 'Legendary',
    weight: 0.9,
    color: Color3.fromRGB(255, 215, 0),
    displayOrder: 5,
  },
  {
    name: 'Mythic',
    weight: 0.1,
    color: Color3.fromRGB(255, 50, 50),
    displayOrder: 6,
  },
];

// ==================== PITY STATE MANAGEMENT ====================

const playerPityStates = new Map<number, PlayerPityState>();

export function getPlayerPityState(playerId: number): PlayerPityState {
  let state = playerPityStates.get(playerId);
  if (!state) {
    state = { pullsSinceRare: new Map() };
    playerPityStates.set(playerId, state);
  }
  return state;
}

export function resetPlayerPity(playerId: number, poolName: string): void {
  const state = getPlayerPityState(playerId);
  state.pullsSinceRare.set(poolName, 0);
}

export function incrementPlayerPity(
  playerId: number,
  poolName: string,
): number {
  const state = getPlayerPityState(playerId);
  const current = state.pullsSinceRare.get(poolName) ?? 0;
  state.pullsSinceRare.set(poolName, current + 1);
  return current + 1;
}

// ==================== CORE GACHA LOGIC ====================

/**
 * Perform a single gacha pull from a pool
 */
export function pullFromPool<T>(
  pool: GachaPool<T>,
  playerId: number,
): GachaResult<T> {
  const pityState = getPlayerPityState(playerId);
  const pullsSinceRare = pityState.pullsSinceRare.get(pool.name) ?? 0;

  // Check if pity should activate
  const isPityActive =
    pool.pityEnabled &&
    pool.pityThreshold !== undefined &&
    pullsSinceRare >= pool.pityThreshold;

  // Build weighted item list
  let eligibleItems = pool.items;

  if (isPityActive && pool.pityRarityMinimum) {
    // Filter to only items at or above pity rarity
    const pityRarity = pool.rarities.find(
      (r) => r.name === pool.pityRarityMinimum,
    );
    if (pityRarity) {
      eligibleItems = pool.items.filter((item) => {
        const itemRarity = pool.rarities.find((r) => r.name === item.rarity);
        return itemRarity && itemRarity.displayOrder >= pityRarity.displayOrder;
      });
    }
  }

  // Calculate weights
  const weightedItems: Array<{ item: GachaItem<T>; weight: number }> = [];

  for (const item of eligibleItems) {
    let itemWeight = item.weight;

    if (itemWeight === undefined) {
      const rarity = pool.rarities.find((r) => r.name === item.rarity);
      itemWeight = rarity?.weight ?? 1;
    }

    weightedItems.push({ item, weight: itemWeight });
  }

  // Perform weighted random selection
  const selectedItem = weightedRandom(weightedItems);

  // Update pity counter
  const pullNumber = incrementPlayerPity(playerId, pool.name);

  // Check if we got a "rare" result (reset pity)
  if (pool.pityRarityMinimum) {
    const selectedRarity = pool.rarities.find(
      (r) => r.name === selectedItem.rarity,
    );
    const pityRarity = pool.rarities.find(
      (r) => r.name === pool.pityRarityMinimum,
    );

    if (
      selectedRarity &&
      pityRarity &&
      selectedRarity.displayOrder >= pityRarity.displayOrder
    ) {
      resetPlayerPity(playerId, pool.name);
    }
  }

  return {
    item: selectedItem,
    isPity: isPityActive,
    pullNumber,
  };
}

/**
 * Perform multiple pulls from a pool
 */
export function multiPull<T>(
  pool: GachaPool<T>,
  playerId: number,
  count: number,
): GachaResult<T>[] {
  const results: GachaResult<T>[] = [];

  for (let i = 0; i < count; i++) {
    results.push(pullFromPool(pool, playerId));
  }

  return results;
}

// ==================== WEIGHTED RANDOM ====================

/**
 * Server-side weighted random selection
 */
export function weightedRandom<T>(
  items: Array<{ item: T; weight: number }>,
): T {
  if (items.size() === 0) {
    error('Cannot select from empty weighted list');
  }

  let totalWeight = 0;
  for (const entry of items) {
    totalWeight += entry.weight;
  }

  let random = math.random() * totalWeight;

  for (const entry of items) {
    random -= entry.weight;
    if (random <= 0) {
      return entry.item;
    }
  }

  return items[items.size() - 1].item;
}

// ==================== POOL CREATION HELPERS ====================

/**
 * Create a pool with items distributed by rarity
 */
export function createPool<T>(
  name: string,
  items: Array<{ id: string; data: T; rarity: string }>,
  options?: {
    rarities?: RarityTier[];
    pityEnabled?: boolean;
    pityThreshold?: number;
    pityRarityMinimum?: string;
  },
): GachaPool<T> {
  return {
    name,
    items: items.map((i) => ({
      id: i.id,
      data: i.data,
      rarity: i.rarity,
    })),
    rarities: options?.rarities ?? DEFAULT_RARITIES,
    pityEnabled: options?.pityEnabled ?? false,
    pityThreshold: options?.pityThreshold ?? 100,
    pityRarityMinimum: options?.pityRarityMinimum ?? 'Epic',
  };
}

/**
 * Get drop rates for display
 */
export function getPoolDropRates(
  pool: GachaPool<unknown>,
): Map<string, number> {
  const rates = new Map<string, number>();
  let totalWeight = 0;

  for (const rarity of pool.rarities) {
    const itemsOfRarity = pool.items.filter((i) => i.rarity === rarity.name);
    const weight = rarity.weight * itemsOfRarity.size();
    totalWeight += weight;
  }

  for (const rarity of pool.rarities) {
    const itemsOfRarity = pool.items.filter((i) => i.rarity === rarity.name);
    const weight = rarity.weight * itemsOfRarity.size();
    const percent = (weight / totalWeight) * 100;
    rates.set(rarity.name, math.floor(percent * 100) / 100);
  }

  return rates;
}
