/**
 * Pet Collection System - Core mechanics for pet/collectible games
 * Game-agnostic logic for pet hatching, evolution, and collection
 */

// ==================== TYPES ====================

export type PetRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'secret';

export type PetAttribute =
  | 'fire'
  | 'water'
  | 'earth'
  | 'air'
  | 'light'
  | 'dark'
  | 'neutral';

export interface PetSpecies {
  id: string;
  name: string;
  rarity: PetRarity;
  attribute: PetAttribute;
  basePower: number;
  evolveInto?: string; // ID of evolved form
  evolveLevel?: number;
  evolveCost?: number;
  description?: string;
  eggSource?: string; // Which egg can hatch this
  isShiny?: boolean;
  isFusion?: boolean;
}

export interface OwnedPet {
  uniqueId: string;
  speciesId: string;
  nickname?: string;
  level: number;
  experience: number;
  power: number;
  isShiny: boolean;
  isGolden: boolean;
  isRainbow: boolean;
  acquiredAt: number;
  isEquipped: boolean;
  isLocked: boolean; // Prevent accidental delete/trade
}

export interface EggType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'coins' | 'gems' | 'robux';
  hatchTime: number; // Seconds
  rarityChances: Record<PetRarity, number>;
  possiblePets: string[]; // Pet species IDs
  shinyChance: number;
  goldenChance: number;
  rainbowChance: number;
}

export interface PlayerPetState {
  pets: OwnedPet[];
  equippedPets: string[]; // uniqueIds
  maxEquipped: number;
  maxInventory: number;
  incubatingEggs: IncubatingEgg[];
  maxIncubators: number;
  totalPetsHatched: number;
  totalPetsEvolved: number;
  discoveredSpecies: string[];
  coinMultiplier: number;
}

export interface IncubatingEgg {
  id: string;
  eggTypeId: string;
  startTime: number;
  duration: number;
  isReady: boolean;
}

export interface PetConfig {
  baseXpPerLevel: number;
  levelMultiplier: number;
  maxPetLevel: number;
  shinyPowerBonus: number;
  goldenPowerBonus: number;
  rainbowPowerBonus: number;
  evolvePowerMultiplier: number;
}

export interface HatchResult {
  success: boolean;
  pet?: OwnedPet;
  species?: PetSpecies;
  isNew?: boolean;
  error?: string;
  code?: string;
}

export interface EvolveResult {
  success: boolean;
  newPet?: OwnedPet;
  newSpecies?: PetSpecies;
  error?: string;
  code?: string;
}

// ==================== DEFAULT CONFIG ====================

export const DEFAULT_PET_CONFIG: PetConfig = {
  baseXpPerLevel: 100,
  levelMultiplier: 1.5,
  maxPetLevel: 100,
  shinyPowerBonus: 1.5,
  goldenPowerBonus: 2.0,
  rainbowPowerBonus: 3.0,
  evolvePowerMultiplier: 2.5,
};

export const DEFAULT_PET_RARITY_CHANCES: Record<PetRarity, number> = {
  common: 0.45,
  uncommon: 0.25,
  rare: 0.15,
  epic: 0.08,
  legendary: 0.05,
  mythic: 0.018,
  secret: 0.002,
};

// ==================== SAMPLE DATA ====================

export const SAMPLE_PET_SPECIES: PetSpecies[] = [
  // Common pets
  {
    id: 'cat',
    name: 'Cat',
    rarity: 'common',
    attribute: 'neutral',
    basePower: 10,
    evolveInto: 'tiger',
    evolveLevel: 25,
    evolveCost: 1000,
    eggSource: 'basic_egg',
  },
  {
    id: 'dog',
    name: 'Dog',
    rarity: 'common',
    attribute: 'neutral',
    basePower: 12,
    evolveInto: 'wolf',
    evolveLevel: 25,
    evolveCost: 1000,
    eggSource: 'basic_egg',
  },
  {
    id: 'bunny',
    name: 'Bunny',
    rarity: 'common',
    attribute: 'earth',
    basePower: 8,
    eggSource: 'basic_egg',
  },

  // Uncommon pets
  {
    id: 'fox',
    name: 'Fox',
    rarity: 'uncommon',
    attribute: 'fire',
    basePower: 25,
    evolveInto: 'firefox',
    evolveLevel: 30,
    evolveCost: 2500,
    eggSource: 'forest_egg',
  },
  {
    id: 'owl',
    name: 'Owl',
    rarity: 'uncommon',
    attribute: 'air',
    basePower: 22,
    eggSource: 'forest_egg',
  },

  // Rare pets
  {
    id: 'wolf',
    name: 'Wolf',
    rarity: 'rare',
    attribute: 'dark',
    basePower: 50,
    evolveInto: 'direwolf',
    evolveLevel: 40,
    evolveCost: 5000,
    eggSource: 'rare_egg',
  },
  {
    id: 'tiger',
    name: 'Tiger',
    rarity: 'rare',
    attribute: 'fire',
    basePower: 55,
    eggSource: 'rare_egg',
  },

  // Epic pets
  {
    id: 'phoenix',
    name: 'Phoenix',
    rarity: 'epic',
    attribute: 'fire',
    basePower: 100,
    evolveInto: 'ancient_phoenix',
    evolveLevel: 50,
    evolveCost: 15000,
    eggSource: 'mythical_egg',
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    rarity: 'epic',
    attribute: 'light',
    basePower: 95,
    eggSource: 'mythical_egg',
  },

  // Legendary pets
  {
    id: 'dragon',
    name: 'Dragon',
    rarity: 'legendary',
    attribute: 'fire',
    basePower: 200,
    evolveInto: 'elder_dragon',
    evolveLevel: 75,
    evolveCost: 50000,
    eggSource: 'legendary_egg',
  },
  {
    id: 'direwolf',
    name: 'Direwolf',
    rarity: 'legendary',
    attribute: 'dark',
    basePower: 180,
    description: 'Evolved from Wolf',
  },
  {
    id: 'firefox',
    name: 'Firefox',
    rarity: 'legendary',
    attribute: 'fire',
    basePower: 175,
    description: 'Evolved from Fox',
  },

  // Mythic pets
  {
    id: 'ancient_phoenix',
    name: 'Ancient Phoenix',
    rarity: 'mythic',
    attribute: 'fire',
    basePower: 500,
    description: 'The immortal flame bird',
  },
  {
    id: 'elder_dragon',
    name: 'Elder Dragon',
    rarity: 'mythic',
    attribute: 'fire',
    basePower: 600,
    description: 'Ancient ruler of the skies',
  },

  // Secret pets
  {
    id: 'void_guardian',
    name: 'Void Guardian',
    rarity: 'secret',
    attribute: 'dark',
    basePower: 1000,
    description: 'A being from beyond reality',
    eggSource: 'void_egg',
  },
];

export const SAMPLE_EGG_TYPES: EggType[] = [
  {
    id: 'basic_egg',
    name: 'Basic Egg',
    description: 'A common egg with basic pets',
    price: 100,
    currency: 'coins',
    hatchTime: 10,
    rarityChances: {
      common: 0.7,
      uncommon: 0.2,
      rare: 0.08,
      epic: 0.02,
      legendary: 0,
      mythic: 0,
      secret: 0,
    },
    possiblePets: ['cat', 'dog', 'bunny'],
    shinyChance: 0.01,
    goldenChance: 0.001,
    rainbowChance: 0.0001,
  },
  {
    id: 'forest_egg',
    name: 'Forest Egg',
    description: 'Contains forest creatures',
    price: 500,
    currency: 'coins',
    hatchTime: 30,
    rarityChances: {
      common: 0.4,
      uncommon: 0.35,
      rare: 0.18,
      epic: 0.07,
      legendary: 0,
      mythic: 0,
      secret: 0,
    },
    possiblePets: ['fox', 'owl', 'bunny'],
    shinyChance: 0.02,
    goldenChance: 0.002,
    rainbowChance: 0.0002,
  },
  {
    id: 'rare_egg',
    name: 'Rare Egg',
    description: 'Higher chance for rare pets',
    price: 2500,
    currency: 'coins',
    hatchTime: 60,
    rarityChances: {
      common: 0.2,
      uncommon: 0.3,
      rare: 0.3,
      epic: 0.15,
      legendary: 0.05,
      mythic: 0,
      secret: 0,
    },
    possiblePets: ['wolf', 'tiger', 'fox', 'owl'],
    shinyChance: 0.03,
    goldenChance: 0.005,
    rainbowChance: 0.0005,
  },
  {
    id: 'mythical_egg',
    name: 'Mythical Egg',
    description: 'Contains legendary creatures',
    price: 500,
    currency: 'gems',
    hatchTime: 120,
    rarityChances: {
      common: 0,
      uncommon: 0.1,
      rare: 0.3,
      epic: 0.35,
      legendary: 0.2,
      mythic: 0.05,
      secret: 0,
    },
    possiblePets: ['phoenix', 'unicorn', 'dragon'],
    shinyChance: 0.05,
    goldenChance: 0.01,
    rainbowChance: 0.001,
  },
  {
    id: 'legendary_egg',
    name: 'Legendary Egg',
    description: 'Guaranteed legendary or better!',
    price: 199,
    currency: 'robux',
    hatchTime: 180,
    rarityChances: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0.3,
      legendary: 0.5,
      mythic: 0.18,
      secret: 0.02,
    },
    possiblePets: ['dragon', 'phoenix', 'unicorn'],
    shinyChance: 0.1,
    goldenChance: 0.03,
    rainbowChance: 0.005,
  },
];

// ==================== CORE LOGIC ====================

/**
 * Generate unique ID
 */
function generateUniqueId(): string {
  return `pet_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get current time
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
 * Initialize player pet state
 */
export function getInitialPetState(): PlayerPetState {
  return {
    pets: [],
    equippedPets: [],
    maxEquipped: 3,
    maxInventory: 100,
    incubatingEggs: [],
    maxIncubators: 3,
    totalPetsHatched: 0,
    totalPetsEvolved: 0,
    discoveredSpecies: [],
    coinMultiplier: 1,
  };
}

/**
 * Roll for pet rarity
 */
export function rollPetRarity(egg: EggType): PetRarity {
  const rarities: PetRarity[] = [
    'secret',
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
    cumulative += egg.rarityChances[rarity];
    if (random < cumulative) {
      return rarity;
    }
  }

  return 'common';
}

/**
 * Select a pet species from an egg based on rarity
 */
export function selectPetFromEgg(
  egg: EggType,
  allSpecies: PetSpecies[],
): PetSpecies | undefined {
  const rarity = rollPetRarity(egg);

  // Filter species that are in this egg and match the rarity
  const possibleSpecies = allSpecies.filter(
    (s) => egg.possiblePets.includes(s.id) && s.rarity === rarity,
  );

  if (possibleSpecies.length === 0) {
    // Fallback to any pet in the egg
    const anyPet = allSpecies.filter((s) => egg.possiblePets.includes(s.id));
    if (anyPet.length === 0) return undefined;
    return anyPet[Math.floor(Math.random() * anyPet.length)];
  }

  return possibleSpecies[Math.floor(Math.random() * possibleSpecies.length)];
}

/**
 * Start incubating an egg
 */
export function startIncubation(
  state: PlayerPetState,
  eggType: EggType,
): { success: boolean; egg?: IncubatingEgg; error?: string } {
  if (state.incubatingEggs.length >= state.maxIncubators) {
    return { success: false, error: 'No available incubators' };
  }

  const egg: IncubatingEgg = {
    id: generateUniqueId(),
    eggTypeId: eggType.id,
    startTime: getTime(),
    duration: eggType.hatchTime * 1000, // Convert to ms
    isReady: false,
  };

  state.incubatingEggs.push(egg);

  return { success: true, egg };
}

/**
 * Check if an egg is ready to hatch
 */
export function checkEggReady(egg: IncubatingEgg): boolean {
  const now = getTime();
  return now >= egg.startTime + egg.duration;
}

/**
 * Update incubating eggs status
 */
export function updateIncubatingEggs(state: PlayerPetState): void {
  for (const egg of state.incubatingEggs) {
    egg.isReady = checkEggReady(egg);
  }
}

/**
 * Hatch an egg
 */
export function hatchEgg(
  state: PlayerPetState,
  eggId: string,
  allEggTypes: EggType[],
  allSpecies: PetSpecies[],
  config: PetConfig = DEFAULT_PET_CONFIG,
): HatchResult {
  const eggIndex = state.incubatingEggs.findIndex((e) => e.id === eggId);

  if (eggIndex === -1) {
    return { success: false, error: 'Egg not found', code: 'NOT_FOUND' };
  }

  const incubatingEgg = state.incubatingEggs[eggIndex];

  if (!checkEggReady(incubatingEgg)) {
    return { success: false, error: 'Egg not ready', code: 'NOT_READY' };
  }

  if (state.pets.length >= state.maxInventory) {
    return { success: false, error: 'Inventory full', code: 'INVENTORY_FULL' };
  }

  const eggType = allEggTypes.find((e) => e.id === incubatingEgg.eggTypeId);
  if (!eggType) {
    return { success: false, error: 'Invalid egg type', code: 'INVALID_EGG' };
  }

  // Select pet species
  const species = selectPetFromEgg(eggType, allSpecies);
  if (!species) {
    return { success: false, error: 'No pet available', code: 'NO_PET' };
  }

  // Determine special variants
  const isShiny = Math.random() < eggType.shinyChance;
  const isGolden = Math.random() < eggType.goldenChance;
  const isRainbow = Math.random() < eggType.rainbowChance;

  // Calculate power with bonuses
  let power = species.basePower;
  if (isShiny) power *= config.shinyPowerBonus;
  if (isGolden) power *= config.goldenPowerBonus;
  if (isRainbow) power *= config.rainbowPowerBonus;

  // Create the pet
  const newPet: OwnedPet = {
    uniqueId: generateUniqueId(),
    speciesId: species.id,
    level: 1,
    experience: 0,
    power: Math.floor(power),
    isShiny,
    isGolden,
    isRainbow,
    acquiredAt: getTime(),
    isEquipped: false,
    isLocked: false,
  };

  // Update state
  state.pets.push(newPet);
  state.incubatingEggs.splice(eggIndex, 1);
  state.totalPetsHatched++;

  // Check for new discovery
  const isNew = !state.discoveredSpecies.includes(species.id);
  if (isNew) {
    state.discoveredSpecies.push(species.id);
  }

  // Update coin multiplier
  updateCoinMultiplier(state, allSpecies);

  return {
    success: true,
    pet: newPet,
    species,
    isNew,
  };
}

/**
 * Calculate XP needed for a level
 */
export function getPetXpForLevel(level: number, config: PetConfig): number {
  return Math.floor(
    config.baseXpPerLevel * Math.pow(config.levelMultiplier, level - 1),
  );
}

/**
 * Add XP to a pet and check for level up
 */
export function addPetXp(
  pet: OwnedPet,
  xp: number,
  species: PetSpecies,
  config: PetConfig = DEFAULT_PET_CONFIG,
): { leveledUp: boolean; newLevel: number } {
  pet.experience += xp;

  let leveledUp = false;

  while (
    pet.level < config.maxPetLevel &&
    pet.experience >= getPetXpForLevel(pet.level + 1, config)
  ) {
    pet.experience -= getPetXpForLevel(pet.level + 1, config);
    pet.level++;
    leveledUp = true;
  }

  // Update power based on level
  if (leveledUp) {
    const levelMultiplier = 1 + (pet.level - 1) * 0.1; // 10% per level
    let basePower = species.basePower * levelMultiplier;

    if (pet.isShiny) basePower *= config.shinyPowerBonus;
    if (pet.isGolden) basePower *= config.goldenPowerBonus;
    if (pet.isRainbow) basePower *= config.rainbowPowerBonus;

    pet.power = Math.floor(basePower);
  }

  return { leveledUp, newLevel: pet.level };
}

/**
 * Evolve a pet
 */
export function evolvePet(
  state: PlayerPetState,
  petUniqueId: string,
  allSpecies: PetSpecies[],
  config: PetConfig = DEFAULT_PET_CONFIG,
): EvolveResult {
  const petIndex = state.pets.findIndex((p) => p.uniqueId === petUniqueId);

  if (petIndex === -1) {
    return { success: false, error: 'Pet not found' };
  }

  const pet = state.pets[petIndex];
  const species = allSpecies.find((s) => s.id === pet.speciesId);

  if (!species) {
    return { success: false, error: 'Species not found' };
  }

  if (!species.evolveInto) {
    return { success: false, error: 'This pet cannot evolve' };
  }

  if (species.evolveLevel && pet.level < species.evolveLevel) {
    return {
      success: false,
      error: `Need level ${species.evolveLevel} to evolve`,
    };
  }

  const evolvedSpecies = allSpecies.find((s) => s.id === species.evolveInto);
  if (!evolvedSpecies) {
    return { success: false, error: 'Evolution form not found' };
  }

  // Update the pet to its evolved form
  pet.speciesId = evolvedSpecies.id;
  pet.power = Math.floor(pet.power * config.evolvePowerMultiplier);

  state.totalPetsEvolved++;

  // Check for new discovery
  if (!state.discoveredSpecies.includes(evolvedSpecies.id)) {
    state.discoveredSpecies.push(evolvedSpecies.id);
  }

  updateCoinMultiplier(state, allSpecies);

  return {
    success: true,
    newPet: pet,
    newSpecies: evolvedSpecies,
  };
}

/**
 * Equip a pet
 */
export function equipPet(
  state: PlayerPetState,
  petUniqueId: string,
): { success: boolean; error?: string } {
  const pet = state.pets.find((p) => p.uniqueId === petUniqueId);

  if (!pet) {
    return { success: false, error: 'Pet not found' };
  }

  if (pet.isEquipped) {
    return { success: false, error: 'Already equipped' };
  }

  if (state.equippedPets.length >= state.maxEquipped) {
    return { success: false, error: 'Max pets equipped' };
  }

  pet.isEquipped = true;
  state.equippedPets.push(petUniqueId);

  return { success: true };
}

/**
 * Unequip a pet
 */
export function unequipPet(
  state: PlayerPetState,
  petUniqueId: string,
): { success: boolean; error?: string } {
  const pet = state.pets.find((p) => p.uniqueId === petUniqueId);

  if (!pet) {
    return { success: false, error: 'Pet not found' };
  }

  if (!pet.isEquipped) {
    return { success: false, error: 'Not equipped' };
  }

  pet.isEquipped = false;
  state.equippedPets = state.equippedPets.filter((id) => id !== petUniqueId);

  return { success: true };
}

/**
 * Delete a pet
 */
export function deletePet(
  state: PlayerPetState,
  petUniqueId: string,
  allSpecies: PetSpecies[],
): { success: boolean; error?: string } {
  const petIndex = state.pets.findIndex((p) => p.uniqueId === petUniqueId);

  if (petIndex === -1) {
    return { success: false, error: 'Pet not found' };
  }

  const pet = state.pets[petIndex];

  if (pet.isLocked) {
    return { success: false, error: 'Pet is locked' };
  }

  if (pet.isEquipped) {
    unequipPet(state, petUniqueId);
  }

  state.pets.splice(petIndex, 1);
  updateCoinMultiplier(state, allSpecies);

  return { success: true };
}

/**
 * Update coin multiplier based on equipped pets
 */
function updateCoinMultiplier(
  state: PlayerPetState,
  _allSpecies: PetSpecies[], // Kept for future use
): void {
  let multiplier = 1;

  for (const petId of state.equippedPets) {
    const pet = state.pets.find((p) => p.uniqueId === petId);
    if (!pet) continue;

    // Each 100 power adds 0.1x multiplier
    multiplier += pet.power / 1000;
  }

  state.coinMultiplier = Number(multiplier.toFixed(2));
}

// ==================== UTILITIES ====================

/**
 * Get total power of equipped pets
 */
export function getTotalEquippedPower(state: PlayerPetState): number {
  return state.equippedPets.reduce((total, petId) => {
    const pet = state.pets.find((p) => p.uniqueId === petId);
    return total + (pet?.power ?? 0);
  }, 0);
}

/**
 * Get collection progress
 */
export function getPetCollectionProgress(
  state: PlayerPetState,
  allSpecies: PetSpecies[],
): {
  discovered: number;
  total: number;
  percentage: number;
  byRarity: Record<PetRarity, { discovered: number; total: number }>;
} {
  const byRarity: Record<PetRarity, { discovered: number; total: number }> = {
    common: { discovered: 0, total: 0 },
    uncommon: { discovered: 0, total: 0 },
    rare: { discovered: 0, total: 0 },
    epic: { discovered: 0, total: 0 },
    legendary: { discovered: 0, total: 0 },
    mythic: { discovered: 0, total: 0 },
    secret: { discovered: 0, total: 0 },
  };

  for (const species of allSpecies) {
    byRarity[species.rarity].total++;
    if (state.discoveredSpecies.includes(species.id)) {
      byRarity[species.rarity].discovered++;
    }
  }

  return {
    discovered: state.discoveredSpecies.length,
    total: allSpecies.length,
    percentage:
      allSpecies.length > 0
        ? Math.floor((state.discoveredSpecies.length / allSpecies.length) * 100)
        : 0,
    byRarity,
  };
}

/**
 * Get pet stats summary
 */
export function getPetStats(state: PlayerPetState): {
  totalPets: number;
  equippedPets: number;
  maxEquipped: number;
  totalPower: number;
  coinMultiplier: number;
  totalHatched: number;
  totalEvolved: number;
  discoveredSpecies: number;
} {
  return {
    totalPets: state.pets.length,
    equippedPets: state.equippedPets.length,
    maxEquipped: state.maxEquipped,
    totalPower: getTotalEquippedPower(state),
    coinMultiplier: state.coinMultiplier,
    totalHatched: state.totalPetsHatched,
    totalEvolved: state.totalPetsEvolved,
    discoveredSpecies: state.discoveredSpecies.length,
  };
}

/**
 * Format pet for display
 */
export function formatPetDisplay(pet: OwnedPet, species: PetSpecies): string {
  let name = species.name;

  if (pet.isRainbow) name = `🌈 Rainbow ${name}`;
  else if (pet.isGolden) name = `✨ Golden ${name}`;
  else if (pet.isShiny) name = `💎 Shiny ${name}`;

  return `${name} (Lv.${pet.level}) - ${pet.power} power`;
}

/**
 * Get rarity color
 */
export function getPetRarityColor(rarity: PetRarity): string {
  const colors: Record<PetRarity, string> = {
    common: '#808080',
    uncommon: '#2ecc71',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#f39c12',
    mythic: '#e74c3c',
    secret: '#1abc9c',
  };
  return colors[rarity];
}
