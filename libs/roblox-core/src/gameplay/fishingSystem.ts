/**
 * Fishing System - Core mechanics for fishing games
 * Game-agnostic logic that can be used by any fishing-based game
 */

// ==================== TYPES ====================

export type FishRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export interface FishSpecies {
  id: string;
  name: string;
  rarity: FishRarity;
  baseWeight: number; // in kg
  weightVariance: number; // +/- percentage
  basePrice: number;
  locations: string[]; // Location IDs where this fish can be caught
  minLevel: number;
  description?: string;
  isSeasonal?: boolean;
  seasonMonths?: number[]; // 1-12 for months when available
}

export interface FishingLocation {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  fishMultiplier: number;
  rarityBoost: Partial<Record<FishRarity, number>>; // Boost chance for specific rarities
  availableSpecies: string[]; // Fish species IDs
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
}

export interface FishingRod {
  id: string;
  name: string;
  tier: number;
  catchSpeedBonus: number; // Percentage reduction in catch time
  rarityBonus: number; // Percentage boost to rare fish
  durability: number; // 0-100
  maxDurability: number;
}

export interface Bait {
  id: string;
  name: string;
  rarityBoost: Partial<Record<FishRarity, number>>;
  catchSpeedBonus: number;
  uses: number;
  targetSpecies?: string[]; // Specific fish this bait attracts
}

export interface CaughtFish {
  speciesId: string;
  weight: number;
  quality: 'poor' | 'normal' | 'good' | 'perfect';
  caughtAt: number; // Timestamp
  locationId: string;
  isRecord?: boolean; // Personal record for this species
}

export interface PlayerFishingState {
  level: number;
  experience: number;
  totalFishCaught: number;
  totalWeight: number; // Total kg caught
  totalEarnings: number;
  currentRod: FishingRod | null;
  currentBait: Bait | null;
  inventory: CaughtFish[];
  recordCatches: Record<string, number>; // speciesId -> heaviest weight
  discoveredSpecies: string[]; // Species IDs player has caught
  currentLocationId: string | null;
  isFishing: boolean;
  fishingStartTime: number;
}

export interface FishingConfig {
  rarityChances: Record<FishRarity, number>;
  baseCatchTimeMs: number;
  levelXpRequired: number[]; // XP needed for each level
  qualityChances: Record<CaughtFish['quality'], number>;
  sellMultipliers: Record<CaughtFish['quality'], number>;
  weightBonusPerLevel: number; // Percentage per level
  xpPerCatch: Record<FishRarity, number>;
}

export interface CastResult {
  success: boolean;
  error?: string;
  code?: string;
  estimatedCatchTime?: number;
}

export interface CatchResult {
  success: boolean;
  fish?: CaughtFish;
  species?: FishSpecies;
  xpGained?: number;
  levelUp?: boolean;
  newLevel?: number;
  isNewDiscovery?: boolean;
  isPersonalRecord?: boolean;
  error?: string;
  code?: string;
}

// ==================== DEFAULT CONFIG ====================

export const DEFAULT_RARITY_CHANCES: Record<FishRarity, number> = {
  common: 0.5,
  uncommon: 0.25,
  rare: 0.15,
  epic: 0.07,
  legendary: 0.025,
  mythic: 0.005,
};

export const DEFAULT_QUALITY_CHANCES: Record<CaughtFish['quality'], number> = {
  poor: 0.15,
  normal: 0.5,
  good: 0.25,
  perfect: 0.1,
};

export const DEFAULT_SELL_MULTIPLIERS: Record<CaughtFish['quality'], number> = {
  poor: 0.5,
  normal: 1.0,
  good: 1.5,
  perfect: 2.5,
};

export const DEFAULT_XP_PER_CATCH: Record<FishRarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 250,
  mythic: 1000,
};

// Level XP requirements (level 1-50)
export const DEFAULT_LEVEL_XP: number[] = Array.from({ length: 50 }, (_, i) =>
  Math.floor(100 * Math.pow(1.5, i)),
);

export const DEFAULT_FISHING_CONFIG: FishingConfig = {
  rarityChances: DEFAULT_RARITY_CHANCES,
  baseCatchTimeMs: 3000,
  levelXpRequired: DEFAULT_LEVEL_XP,
  qualityChances: DEFAULT_QUALITY_CHANCES,
  sellMultipliers: DEFAULT_SELL_MULTIPLIERS,
  weightBonusPerLevel: 0.02, // 2% per level
  xpPerCatch: DEFAULT_XP_PER_CATCH,
};

// ==================== SAMPLE DATA ====================

export const SAMPLE_FISH_SPECIES: FishSpecies[] = [
  // Common fish
  {
    id: 'goldfish',
    name: 'Goldfish',
    rarity: 'common',
    baseWeight: 0.2,
    weightVariance: 0.3,
    basePrice: 5,
    locations: ['starter_pond', 'river', 'lake'],
    minLevel: 1,
  },
  {
    id: 'minnow',
    name: 'Minnow',
    rarity: 'common',
    baseWeight: 0.1,
    weightVariance: 0.2,
    basePrice: 3,
    locations: ['starter_pond', 'river'],
    minLevel: 1,
  },
  {
    id: 'carp',
    name: 'Carp',
    rarity: 'common',
    baseWeight: 2.5,
    weightVariance: 0.4,
    basePrice: 15,
    locations: ['lake', 'river'],
    minLevel: 1,
  },

  // Uncommon fish
  {
    id: 'bass',
    name: 'Bass',
    rarity: 'uncommon',
    baseWeight: 3.0,
    weightVariance: 0.35,
    basePrice: 30,
    locations: ['lake', 'river'],
    minLevel: 5,
  },
  {
    id: 'trout',
    name: 'Rainbow Trout',
    rarity: 'uncommon',
    baseWeight: 2.0,
    weightVariance: 0.3,
    basePrice: 35,
    locations: ['river', 'lake'],
    minLevel: 5,
  },

  // Rare fish
  {
    id: 'salmon',
    name: 'Salmon',
    rarity: 'rare',
    baseWeight: 5.0,
    weightVariance: 0.4,
    basePrice: 75,
    locations: ['river', 'ocean'],
    minLevel: 10,
  },
  {
    id: 'catfish',
    name: 'Giant Catfish',
    rarity: 'rare',
    baseWeight: 15.0,
    weightVariance: 0.5,
    basePrice: 100,
    locations: ['lake', 'river'],
    minLevel: 15,
  },

  // Epic fish
  {
    id: 'swordfish',
    name: 'Swordfish',
    rarity: 'epic',
    baseWeight: 50.0,
    weightVariance: 0.3,
    basePrice: 500,
    locations: ['ocean', 'deep_sea'],
    minLevel: 20,
  },
  {
    id: 'tuna',
    name: 'Bluefin Tuna',
    rarity: 'epic',
    baseWeight: 100.0,
    weightVariance: 0.4,
    basePrice: 750,
    locations: ['ocean', 'deep_sea'],
    minLevel: 25,
  },

  // Legendary fish
  {
    id: 'marlin',
    name: 'Blue Marlin',
    rarity: 'legendary',
    baseWeight: 200.0,
    weightVariance: 0.5,
    basePrice: 2500,
    locations: ['deep_sea'],
    minLevel: 35,
  },
  {
    id: 'oarfish',
    name: 'Giant Oarfish',
    rarity: 'legendary',
    baseWeight: 150.0,
    weightVariance: 0.4,
    basePrice: 3000,
    locations: ['deep_sea', 'abyss'],
    minLevel: 40,
  },

  // Mythic fish
  {
    id: 'dragon_koi',
    name: 'Dragon Koi',
    rarity: 'mythic',
    baseWeight: 25.0,
    weightVariance: 0.2,
    basePrice: 10000,
    locations: ['crystal_cavern'],
    minLevel: 45,
    description: 'A legendary fish said to bring fortune',
  },
  {
    id: 'leviathan',
    name: 'Baby Leviathan',
    rarity: 'mythic',
    baseWeight: 500.0,
    weightVariance: 0.5,
    basePrice: 25000,
    locations: ['abyss'],
    minLevel: 50,
    description: 'A creature from the deepest depths',
  },
];

export const SAMPLE_LOCATIONS: FishingLocation[] = [
  {
    id: 'starter_pond',
    name: 'Starter Pond',
    description: 'A peaceful pond perfect for beginners',
    unlockLevel: 1,
    fishMultiplier: 1.0,
    rarityBoost: {},
    availableSpecies: ['goldfish', 'minnow', 'carp'],
  },
  {
    id: 'river',
    name: 'River Rapids',
    description: 'A flowing river with diverse fish',
    unlockLevel: 5,
    fishMultiplier: 1.3,
    rarityBoost: { uncommon: 0.05 },
    availableSpecies: [
      'goldfish',
      'minnow',
      'carp',
      'bass',
      'trout',
      'salmon',
      'catfish',
    ],
  },
  {
    id: 'lake',
    name: 'Deep Lake',
    description: 'A serene lake hiding large fish',
    unlockLevel: 10,
    fishMultiplier: 1.5,
    rarityBoost: { rare: 0.03 },
    availableSpecies: ['carp', 'bass', 'trout', 'catfish'],
  },
  {
    id: 'ocean',
    name: 'Ocean Shore',
    description: 'The vast ocean with saltwater species',
    unlockLevel: 20,
    fishMultiplier: 2.0,
    rarityBoost: { rare: 0.05, epic: 0.02 },
    availableSpecies: ['salmon', 'swordfish', 'tuna'],
  },
  {
    id: 'deep_sea',
    name: 'Deep Sea',
    description: 'Dangerous waters with epic catches',
    unlockLevel: 30,
    fishMultiplier: 3.0,
    rarityBoost: { epic: 0.05, legendary: 0.02 },
    availableSpecies: ['swordfish', 'tuna', 'marlin', 'oarfish'],
  },
  {
    id: 'crystal_cavern',
    name: 'Crystal Cavern',
    description: 'A mystical underwater cave',
    unlockLevel: 40,
    fishMultiplier: 4.0,
    rarityBoost: { legendary: 0.03, mythic: 0.01 },
    availableSpecies: ['dragon_koi'],
  },
  {
    id: 'abyss',
    name: 'The Abyss',
    description: 'The deepest, darkest waters',
    unlockLevel: 50,
    fishMultiplier: 5.0,
    rarityBoost: { legendary: 0.05, mythic: 0.02 },
    availableSpecies: ['oarfish', 'leviathan'],
  },
];

export const SAMPLE_RODS: FishingRod[] = [
  {
    id: 'basic_rod',
    name: 'Basic Rod',
    tier: 1,
    catchSpeedBonus: 0,
    rarityBonus: 0,
    durability: 100,
    maxDurability: 100,
  },
  {
    id: 'improved_rod',
    name: 'Improved Rod',
    tier: 2,
    catchSpeedBonus: 0.1,
    rarityBonus: 0.05,
    durability: 100,
    maxDurability: 100,
  },
  {
    id: 'professional_rod',
    name: 'Professional Rod',
    tier: 3,
    catchSpeedBonus: 0.2,
    rarityBonus: 0.1,
    durability: 100,
    maxDurability: 100,
  },
  {
    id: 'master_rod',
    name: 'Master Rod',
    tier: 4,
    catchSpeedBonus: 0.3,
    rarityBonus: 0.15,
    durability: 100,
    maxDurability: 100,
  },
  {
    id: 'legendary_rod',
    name: 'Legendary Rod',
    tier: 5,
    catchSpeedBonus: 0.5,
    rarityBonus: 0.25,
    durability: 100,
    maxDurability: 100,
  },
];

export const SAMPLE_BAITS: Bait[] = [
  {
    id: 'worm',
    name: 'Earthworm',
    rarityBoost: {},
    catchSpeedBonus: 0,
    uses: 10,
  },
  {
    id: 'shrimp',
    name: 'Fresh Shrimp',
    rarityBoost: { uncommon: 0.05, rare: 0.02 },
    catchSpeedBonus: 0.1,
    uses: 5,
  },
  {
    id: 'special_bait',
    name: 'Special Lure',
    rarityBoost: { rare: 0.1, epic: 0.05 },
    catchSpeedBonus: 0.2,
    uses: 3,
  },
  {
    id: 'legendary_bait',
    name: 'Golden Bait',
    rarityBoost: { epic: 0.1, legendary: 0.05, mythic: 0.01 },
    catchSpeedBonus: 0.3,
    uses: 1,
  },
];

// ==================== CORE LOGIC ====================

/**
 * Initialize a new player fishing state
 */
export function getInitialFishingState(): PlayerFishingState {
  return {
    level: 1,
    experience: 0,
    totalFishCaught: 0,
    totalWeight: 0,
    totalEarnings: 0,
    currentRod: SAMPLE_RODS[0], // Start with basic rod
    currentBait: null,
    inventory: [],
    recordCatches: {},
    discoveredSpecies: [],
    currentLocationId: null,
    isFishing: false,
    fishingStartTime: 0,
  };
}

/**
 * Get current time (works in Node.js and Roblox)
 */
function getTime(): number {
  if (typeof Date !== 'undefined' && Date.now) {
    return Date.now();
  }
  return (
    (globalThis as { os?: { time: () => number } }).os?.time?.() ?? 0 * 1000
  );
}

/**
 * Check if player can fish at a location
 */
export function canFishAtLocation(
  state: PlayerFishingState,
  location: FishingLocation,
): { canFish: boolean; error?: string; code?: string } {
  if (state.isFishing) {
    return {
      canFish: false,
      error: 'Already fishing',
      code: 'ALREADY_FISHING',
    };
  }

  if (state.level < location.unlockLevel) {
    return {
      canFish: false,
      error: `Need level ${location.unlockLevel} to fish here`,
      code: 'LEVEL_TOO_LOW',
    };
  }

  if (!state.currentRod) {
    return { canFish: false, error: 'No rod equipped', code: 'NO_ROD' };
  }

  return { canFish: true };
}

/**
 * Start a fishing session (cast the line)
 */
export function castLine(
  state: PlayerFishingState,
  location: FishingLocation,
  config: FishingConfig = DEFAULT_FISHING_CONFIG,
): CastResult {
  const canFish = canFishAtLocation(state, location);
  if (!canFish.canFish) {
    return {
      success: false,
      error: canFish.error,
      code: canFish.code,
    };
  }

  // Calculate catch time with bonuses
  let catchTime = config.baseCatchTimeMs;

  if (state.currentRod) {
    catchTime *= 1 - state.currentRod.catchSpeedBonus;
  }

  if (state.currentBait) {
    catchTime *= 1 - state.currentBait.catchSpeedBonus;
  }

  // Update state
  state.isFishing = true;
  state.fishingStartTime = getTime();
  state.currentLocationId = location.id;

  return {
    success: true,
    estimatedCatchTime: catchTime,
  };
}

/**
 * Roll for fish rarity based on config and bonuses
 */
export function rollRarity(
  config: FishingConfig,
  location: FishingLocation,
  rod: FishingRod | null,
  bait: Bait | null,
): FishRarity {
  const rarities: FishRarity[] = [
    'mythic',
    'legendary',
    'epic',
    'rare',
    'uncommon',
    'common',
  ];
  const random = Math.random();
  let cumulative = 0;

  for (const rarity of rarities) {
    let chance = config.rarityChances[rarity];

    // Apply location boost
    if (location.rarityBoost[rarity]) {
      chance += location.rarityBoost[rarity]!;
    }

    // Apply rod bonus (flat increase to rare+)
    if (rod && rarity !== 'common' && rarity !== 'uncommon') {
      chance *= 1 + rod.rarityBonus;
    }

    // Apply bait boost
    if (bait?.rarityBoost[rarity]) {
      chance += bait.rarityBoost[rarity]!;
    }

    cumulative += chance;

    if (random < cumulative) {
      return rarity;
    }
  }

  return 'common'; // Fallback
}

/**
 * Roll for fish quality
 */
export function rollQuality(config: FishingConfig): CaughtFish['quality'] {
  const qualities: CaughtFish['quality'][] = [
    'perfect',
    'good',
    'normal',
    'poor',
  ];
  const random = Math.random();
  let cumulative = 0;

  for (const quality of qualities) {
    cumulative += config.qualityChances[quality];
    if (random < cumulative) {
      return quality;
    }
  }

  return 'normal';
}

/**
 * Calculate fish weight with variance
 */
export function calculateWeight(
  species: FishSpecies,
  state: PlayerFishingState,
  config: FishingConfig,
): number {
  const variance = 1 + (Math.random() * 2 - 1) * species.weightVariance;
  const levelBonus = 1 + state.level * config.weightBonusPerLevel;
  return Number((species.baseWeight * variance * levelBonus).toFixed(2));
}

/**
 * Get available fish for a location based on player level
 */
export function getAvailableFish(
  location: FishingLocation,
  allSpecies: FishSpecies[],
  playerLevel: number,
): FishSpecies[] {
  return allSpecies.filter(
    (species) =>
      location.availableSpecies.includes(species.id) &&
      species.minLevel <= playerLevel,
  );
}

/**
 * Select a random fish based on rolled rarity
 */
export function selectFish(
  rarity: FishRarity,
  availableFish: FishSpecies[],
): FishSpecies | undefined {
  const fishOfRarity = availableFish.filter((f) => f.rarity === rarity);

  if (fishOfRarity.length === 0) {
    // Fallback to any available fish
    return availableFish[Math.floor(Math.random() * availableFish.length)];
  }

  return fishOfRarity[Math.floor(Math.random() * fishOfRarity.length)];
}

/**
 * Calculate XP required for a level
 */
export function getXpForLevel(level: number, config: FishingConfig): number {
  if (level <= 0) return 0;
  if (level > config.levelXpRequired.length) {
    return config.levelXpRequired[config.levelXpRequired.length - 1];
  }
  return config.levelXpRequired[level - 1];
}

/**
 * Check if player should level up
 */
export function checkLevelUp(
  state: PlayerFishingState,
  config: FishingConfig,
): { levelUp: boolean; newLevel: number } {
  const xpNeeded = getXpForLevel(state.level + 1, config);

  if (
    state.experience >= xpNeeded &&
    state.level < config.levelXpRequired.length
  ) {
    state.experience -= xpNeeded;
    state.level++;
    return { levelUp: true, newLevel: state.level };
  }

  return { levelUp: false, newLevel: state.level };
}

/**
 * Complete the catch (reel in the fish)
 */
export function reelIn(
  state: PlayerFishingState,
  allSpecies: FishSpecies[],
  allLocations: FishingLocation[],
  config: FishingConfig = DEFAULT_FISHING_CONFIG,
): CatchResult {
  if (!state.isFishing) {
    return { success: false, error: 'Not fishing', code: 'NOT_FISHING' };
  }

  const location = allLocations.find((l) => l.id === state.currentLocationId);
  if (!location) {
    state.isFishing = false;
    return {
      success: false,
      error: 'Invalid location',
      code: 'INVALID_LOCATION',
    };
  }

  // Reset fishing state
  state.isFishing = false;

  // Roll for rarity
  const rarity = rollRarity(
    config,
    location,
    state.currentRod,
    state.currentBait,
  );

  // Get available fish
  const availableFish = getAvailableFish(location, allSpecies, state.level);

  if (availableFish.length === 0) {
    return { success: false, error: 'No fish available', code: 'NO_FISH' };
  }

  // Select fish
  const species = selectFish(rarity, availableFish);
  if (!species) {
    return {
      success: false,
      error: 'Failed to select fish',
      code: 'SELECT_FAILED',
    };
  }

  // Calculate weight and quality
  const weight = calculateWeight(species, state, config);
  const quality = rollQuality(config);

  // Check for personal record
  const previousRecord = state.recordCatches[species.id] || 0;
  const isPersonalRecord = weight > previousRecord;

  if (isPersonalRecord) {
    state.recordCatches[species.id] = weight;
  }

  // Check for new discovery
  const isNewDiscovery = !state.discoveredSpecies.includes(species.id);
  if (isNewDiscovery) {
    state.discoveredSpecies.push(species.id);
  }

  // Create caught fish
  const caughtFish: CaughtFish = {
    speciesId: species.id,
    weight,
    quality,
    caughtAt: getTime(),
    locationId: location.id,
    isRecord: isPersonalRecord,
  };

  // Update state
  state.inventory.push(caughtFish);
  state.totalFishCaught++;
  state.totalWeight += weight;

  // Calculate and add XP
  let xpGained = config.xpPerCatch[species.rarity];
  if (isNewDiscovery) xpGained *= 2; // Double XP for new discoveries
  if (isPersonalRecord) xpGained *= 1.5; // 50% bonus for records

  state.experience += Math.floor(xpGained);

  // Consume bait
  if (state.currentBait) {
    state.currentBait.uses--;
    if (state.currentBait.uses <= 0) {
      state.currentBait = null;
    }
  }

  // Check level up
  const levelResult = checkLevelUp(state, config);

  return {
    success: true,
    fish: caughtFish,
    species,
    xpGained: Math.floor(xpGained),
    levelUp: levelResult.levelUp,
    newLevel: levelResult.newLevel,
    isNewDiscovery,
    isPersonalRecord,
  };
}

// ==================== UTILITIES ====================

/**
 * Calculate sell price for a caught fish
 */
export function calculateSellPrice(
  fish: CaughtFish,
  species: FishSpecies,
  config: FishingConfig = DEFAULT_FISHING_CONFIG,
): number {
  const qualityMultiplier = config.sellMultipliers[fish.quality];
  const weightMultiplier = fish.weight / species.baseWeight;
  return Math.floor(species.basePrice * qualityMultiplier * weightMultiplier);
}

/**
 * Sell fish from inventory
 */
export function sellFish(
  state: PlayerFishingState,
  fishIndex: number,
  allSpecies: FishSpecies[],
  config: FishingConfig = DEFAULT_FISHING_CONFIG,
): { success: boolean; earnings?: number; error?: string } {
  if (fishIndex < 0 || fishIndex >= state.inventory.length) {
    return { success: false, error: 'Invalid fish index' };
  }

  const fish = state.inventory[fishIndex];
  const species = allSpecies.find((s) => s.id === fish.speciesId);

  if (!species) {
    return { success: false, error: 'Unknown species' };
  }

  const price = calculateSellPrice(fish, species, config);

  state.inventory.splice(fishIndex, 1);
  state.totalEarnings += price;

  return { success: true, earnings: price };
}

/**
 * Get collection progress
 */
export function getCollectionProgress(
  state: PlayerFishingState,
  allSpecies: FishSpecies[],
): {
  discovered: number;
  total: number;
  percentage: number;
  byRarity: Record<FishRarity, { discovered: number; total: number }>;
} {
  const byRarity: Record<FishRarity, { discovered: number; total: number }> = {
    common: { discovered: 0, total: 0 },
    uncommon: { discovered: 0, total: 0 },
    rare: { discovered: 0, total: 0 },
    epic: { discovered: 0, total: 0 },
    legendary: { discovered: 0, total: 0 },
    mythic: { discovered: 0, total: 0 },
  };

  for (const species of allSpecies) {
    byRarity[species.rarity].total++;
    if (state.discoveredSpecies.includes(species.id)) {
      byRarity[species.rarity].discovered++;
    }
  }

  const discovered = state.discoveredSpecies.length;
  const total = allSpecies.length;

  return {
    discovered,
    total,
    percentage: total > 0 ? Math.floor((discovered / total) * 100) : 0,
    byRarity,
  };
}

/**
 * Get player stats summary
 */
export function getPlayerStats(state: PlayerFishingState): {
  level: number;
  xp: number;
  totalFishCaught: number;
  totalWeight: string;
  totalEarnings: number;
  discoveredSpecies: number;
  inventorySize: number;
} {
  return {
    level: state.level,
    xp: state.experience,
    totalFishCaught: state.totalFishCaught,
    totalWeight: state.totalWeight.toFixed(2) + ' kg',
    totalEarnings: state.totalEarnings,
    discoveredSpecies: state.discoveredSpecies.length,
    inventorySize: state.inventory.length,
  };
}

/**
 * Format fish for display
 */
export function formatFishDisplay(
  fish: CaughtFish,
  species: FishSpecies,
): string {
  const qualityEmoji: Record<CaughtFish['quality'], string> = {
    poor: '⬜',
    normal: '🟢',
    good: '🔵',
    perfect: '🟣',
  };

  const rarityEmoji: Record<FishRarity, string> = {
    common: '⚪',
    uncommon: '🟢',
    rare: '🔵',
    epic: '🟣',
    legendary: '🟡',
    mythic: '🔴',
  };

  return `${rarityEmoji[species.rarity]} ${species.name} ${qualityEmoji[fish.quality]} - ${fish.weight}kg${fish.isRecord ? ' 🏆' : ''}`;
}
