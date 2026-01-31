/**
 * Pet Data - Lucky Fish Legends
 * Defines all pet species, rarities, and bonuses
 */

// Pet rarities
export type PetRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

// Pet variant types
export type PetVariant = 'normal' | 'shiny' | 'golden' | 'rainbow';

// Pet species definition
export interface PetSpecies {
  id: string;
  name: string;
  description: string;
  rarity: PetRarity;
  basePower: number;
  fishingBonus: number; // % bonus to fish catch rate
  coinBonus: number; // % bonus to coin earnings
  xpBonus: number; // % bonus to XP gains
  eggId: string; // Which egg hatches this pet
  evolvesTo?: string; // Species ID of evolution
  evolveLevel?: number; // Level required to evolve
  modelParts: PetModelParts; // Visual configuration
}

// Visual model configuration
export interface PetModelParts {
  bodyColor: Color3;
  bodyShape: 'sphere' | 'cube' | 'cylinder' | 'wedge';
  bodySize: Vector3;
  hasWings?: boolean;
  wingColor?: Color3;
  hasHalo?: boolean;
  haloColor?: Color3;
  trailColor?: Color3;
  eyeStyle: 'cute' | 'fierce' | 'happy' | 'sleepy';
}

// Owned pet instance
export interface OwnedPet {
  uniqueId: string;
  speciesId: string;
  name: string;
  level: number;
  xp: number;
  variant: PetVariant;
  isEquipped: boolean;
  obtainedAt: number;
  totalFishCaught: number;
}

// Egg types
export interface EggType {
  id: string;
  name: string;
  description: string;
  cost: number;
  hatchTime: number; // seconds
  possiblePets: string[]; // species IDs
  rarityChances: Record<PetRarity, number>;
}

// Rarity colors
export const PET_RARITY_COLORS: Record<PetRarity, Color3> = {
  common: new Color3(0.6, 0.6, 0.6),
  uncommon: new Color3(0.2, 0.8, 0.2),
  rare: new Color3(0.2, 0.4, 1),
  epic: new Color3(0.6, 0.2, 0.8),
  legendary: new Color3(1, 0.6, 0.1),
  mythic: new Color3(1, 0.2, 0.4),
};

// Variant multipliers
export const VARIANT_MULTIPLIERS: Record<PetVariant, number> = {
  normal: 1.0,
  shiny: 1.5,
  golden: 2.0,
  rainbow: 3.0,
};

// Variant roll chances
export const VARIANT_CHANCES = {
  shiny: 0.05, // 5%
  golden: 0.01, // 1%
  rainbow: 0.001, // 0.1%
};

// XP required per level
export function getXpForLevel(level: number): number {
  return math.floor(100 * math.pow(1.2, level - 1));
}

// ==========================================
// PET SPECIES DEFINITIONS
// ==========================================

export const PET_SPECIES: PetSpecies[] = [
  // === COMMON PETS (Starter Egg) ===
  {
    id: 'fishy_friend',
    name: 'Fishy Friend',
    description: 'A tiny fish companion that loves water!',
    rarity: 'common',
    basePower: 10,
    fishingBonus: 5,
    coinBonus: 2,
    xpBonus: 0,
    eggId: 'starter_egg',
    evolvesTo: 'aqua_guardian',
    evolveLevel: 15,
    modelParts: {
      bodyColor: new Color3(0.3, 0.6, 1),
      bodyShape: 'sphere',
      bodySize: new Vector3(1, 0.8, 1.2),
      eyeStyle: 'cute',
      trailColor: new Color3(0.4, 0.7, 1),
    },
  },
  {
    id: 'pond_puppy',
    name: 'Pond Puppy',
    description: 'An adorable puppy that loves splashing in ponds.',
    rarity: 'common',
    basePower: 12,
    fishingBonus: 3,
    coinBonus: 5,
    xpBonus: 2,
    eggId: 'starter_egg',
    evolvesTo: 'water_hound',
    evolveLevel: 15,
    modelParts: {
      bodyColor: new Color3(0.7, 0.5, 0.3),
      bodyShape: 'sphere',
      bodySize: new Vector3(1, 1, 1.3),
      eyeStyle: 'happy',
    },
  },
  {
    id: 'lucky_cat',
    name: 'Lucky Cat',
    description: 'Brings good fortune when fishing.',
    rarity: 'common',
    basePower: 8,
    fishingBonus: 8,
    coinBonus: 0,
    xpBonus: 0,
    eggId: 'starter_egg',
    modelParts: {
      bodyColor: new Color3(1, 0.9, 0.7),
      bodyShape: 'sphere',
      bodySize: new Vector3(0.9, 1, 1),
      eyeStyle: 'sleepy',
    },
  },

  // === UNCOMMON PETS (Pond Egg) ===
  {
    id: 'river_sprite',
    name: 'River Sprite',
    description: 'A magical sprite from flowing rivers.',
    rarity: 'uncommon',
    basePower: 25,
    fishingBonus: 10,
    coinBonus: 5,
    xpBonus: 5,
    eggId: 'pond_egg',
    evolvesTo: 'stream_spirit',
    evolveLevel: 20,
    modelParts: {
      bodyColor: new Color3(0.5, 1, 0.8),
      bodyShape: 'sphere',
      bodySize: new Vector3(0.6, 0.8, 0.6),
      hasWings: true,
      wingColor: new Color3(0.7, 1, 0.9),
      eyeStyle: 'cute',
      trailColor: new Color3(0.6, 1, 0.9),
    },
  },
  {
    id: 'bubble_buddy',
    name: 'Bubble Buddy',
    description: 'Rides inside a magical bubble!',
    rarity: 'uncommon',
    basePower: 22,
    fishingBonus: 5,
    coinBonus: 10,
    xpBonus: 5,
    eggId: 'pond_egg',
    modelParts: {
      bodyColor: new Color3(0.8, 0.9, 1),
      bodyShape: 'sphere',
      bodySize: new Vector3(1.2, 1.2, 1.2),
      eyeStyle: 'happy',
      trailColor: new Color3(0.9, 0.95, 1),
    },
  },

  // === RARE PETS (Ocean Egg) ===
  {
    id: 'coral_dragon',
    name: 'Coral Dragon',
    description: 'A baby dragon born from coral reefs.',
    rarity: 'rare',
    basePower: 50,
    fishingBonus: 15,
    coinBonus: 10,
    xpBonus: 10,
    eggId: 'ocean_egg',
    evolvesTo: 'reef_emperor',
    evolveLevel: 25,
    modelParts: {
      bodyColor: new Color3(1, 0.5, 0.4),
      bodyShape: 'wedge',
      bodySize: new Vector3(1.2, 1, 1.5),
      hasWings: true,
      wingColor: new Color3(1, 0.3, 0.3),
      eyeStyle: 'fierce',
      trailColor: new Color3(1, 0.4, 0.3),
    },
  },
  {
    id: 'aqua_guardian',
    name: 'Aqua Guardian',
    description: 'Evolved Fishy Friend - Protector of waters.',
    rarity: 'rare',
    basePower: 45,
    fishingBonus: 12,
    coinBonus: 8,
    xpBonus: 5,
    eggId: 'ocean_egg',
    modelParts: {
      bodyColor: new Color3(0.2, 0.5, 1),
      bodyShape: 'sphere',
      bodySize: new Vector3(1.5, 1.2, 1.8),
      eyeStyle: 'fierce',
      trailColor: new Color3(0.3, 0.6, 1),
    },
  },

  // === EPIC PETS (Treasure Egg) ===
  {
    id: 'golden_koi',
    name: 'Golden Koi',
    description: 'A mystical koi fish made of pure gold.',
    rarity: 'epic',
    basePower: 100,
    fishingBonus: 25,
    coinBonus: 20,
    xpBonus: 15,
    eggId: 'treasure_egg',
    modelParts: {
      bodyColor: new Color3(1, 0.8, 0.2),
      bodyShape: 'sphere',
      bodySize: new Vector3(1.3, 0.9, 1.8),
      hasHalo: true,
      haloColor: new Color3(1, 0.9, 0.4),
      eyeStyle: 'happy',
      trailColor: new Color3(1, 0.85, 0.3),
    },
  },
  {
    id: 'reef_emperor',
    name: 'Reef Emperor',
    description: 'Evolved Coral Dragon - Rules the reef.',
    rarity: 'epic',
    basePower: 120,
    fishingBonus: 30,
    coinBonus: 15,
    xpBonus: 10,
    eggId: 'treasure_egg',
    modelParts: {
      bodyColor: new Color3(0.8, 0.2, 0.4),
      bodyShape: 'wedge',
      bodySize: new Vector3(2, 1.5, 2.5),
      hasWings: true,
      wingColor: new Color3(1, 0.3, 0.5),
      hasHalo: true,
      haloColor: new Color3(1, 0.5, 0.6),
      eyeStyle: 'fierce',
      trailColor: new Color3(1, 0.3, 0.4),
    },
  },

  // === LEGENDARY PETS (Mythic Egg) ===
  {
    id: 'poseidon_spirit',
    name: "Poseidon's Spirit",
    description: 'An ancient spirit blessed by the sea god.',
    rarity: 'legendary',
    basePower: 250,
    fishingBonus: 50,
    coinBonus: 40,
    xpBonus: 30,
    eggId: 'mythic_egg',
    modelParts: {
      bodyColor: new Color3(0.1, 0.4, 0.8),
      bodyShape: 'sphere',
      bodySize: new Vector3(2, 2.5, 2),
      hasWings: true,
      wingColor: new Color3(0.3, 0.6, 1),
      hasHalo: true,
      haloColor: new Color3(0.5, 0.8, 1),
      eyeStyle: 'fierce',
      trailColor: new Color3(0.2, 0.5, 1),
    },
  },

  // === MYTHIC PETS (Exclusive) ===
  {
    id: 'ocean_titan',
    name: 'Ocean Titan',
    description: 'The legendary ruler of all seas.',
    rarity: 'mythic',
    basePower: 500,
    fishingBonus: 100,
    coinBonus: 75,
    xpBonus: 50,
    eggId: 'mythic_egg',
    modelParts: {
      bodyColor: new Color3(0, 0.3, 0.6),
      bodyShape: 'sphere',
      bodySize: new Vector3(3, 3.5, 3),
      hasWings: true,
      wingColor: new Color3(0.2, 0.5, 0.8),
      hasHalo: true,
      haloColor: new Color3(1, 0.9, 0.5),
      eyeStyle: 'fierce',
      trailColor: new Color3(0.1, 0.4, 0.8),
    },
  },
];

// ==========================================
// EGG DEFINITIONS
// ==========================================

export const EGG_TYPES: EggType[] = [
  {
    id: 'starter_egg',
    name: 'Starter Egg',
    description: 'A basic egg for new fishers.',
    cost: 100,
    hatchTime: 5,
    possiblePets: ['fishy_friend', 'pond_puppy', 'lucky_cat'],
    rarityChances: {
      common: 0.85,
      uncommon: 0.12,
      rare: 0.03,
      epic: 0,
      legendary: 0,
      mythic: 0,
    },
  },
  {
    id: 'pond_egg',
    name: 'Pond Egg',
    description: 'Found near peaceful ponds.',
    cost: 500,
    hatchTime: 30,
    possiblePets: [
      'river_sprite',
      'bubble_buddy',
      'fishy_friend',
      'pond_puppy',
    ],
    rarityChances: {
      common: 0.5,
      uncommon: 0.35,
      rare: 0.13,
      epic: 0.02,
      legendary: 0,
      mythic: 0,
    },
  },
  {
    id: 'ocean_egg',
    name: 'Ocean Egg',
    description: 'Washed ashore from deep waters.',
    cost: 2500,
    hatchTime: 120,
    possiblePets: [
      'coral_dragon',
      'aqua_guardian',
      'river_sprite',
      'bubble_buddy',
    ],
    rarityChances: {
      common: 0.25,
      uncommon: 0.4,
      rare: 0.25,
      epic: 0.08,
      legendary: 0.02,
      mythic: 0,
    },
  },
  {
    id: 'treasure_egg',
    name: 'Treasure Egg',
    description: 'A golden egg from sunken treasure.',
    cost: 10000,
    hatchTime: 300,
    possiblePets: ['golden_koi', 'reef_emperor', 'coral_dragon'],
    rarityChances: {
      common: 0.1,
      uncommon: 0.25,
      rare: 0.35,
      epic: 0.22,
      legendary: 0.07,
      mythic: 0.01,
    },
  },
  {
    id: 'mythic_egg',
    name: 'Mythic Egg',
    description: 'A legendary egg of incredible power.',
    cost: 50000,
    hatchTime: 600,
    possiblePets: [
      'poseidon_spirit',
      'ocean_titan',
      'golden_koi',
      'reef_emperor',
    ],
    rarityChances: {
      common: 0,
      uncommon: 0.15,
      rare: 0.3,
      epic: 0.35,
      legendary: 0.15,
      mythic: 0.05,
    },
  },
];

// Helper functions
export function getSpeciesById(id: string): PetSpecies | undefined {
  return PET_SPECIES.find((s) => s.id === id);
}

export function getEggById(id: string): EggType | undefined {
  return EGG_TYPES.find((e) => e.id === id);
}

export function calculatePetPower(pet: OwnedPet): number {
  const species = getSpeciesById(pet.speciesId);
  if (!species) return 0;

  const levelMultiplier = 1 + (pet.level - 1) * 0.1;
  let power = species.basePower * levelMultiplier;
  power *= VARIANT_MULTIPLIERS[pet.variant];

  return math.floor(power);
}

export function getTotalFishingBonus(equippedPets: OwnedPet[]): number {
  let bonus = 0;
  for (const pet of equippedPets) {
    const species = getSpeciesById(pet.speciesId);
    if (species) {
      const variantMult = VARIANT_MULTIPLIERS[pet.variant];
      bonus += species.fishingBonus * variantMult;
    }
  }
  return bonus;
}

export function getTotalCoinBonus(equippedPets: OwnedPet[]): number {
  let bonus = 0;
  for (const pet of equippedPets) {
    const species = getSpeciesById(pet.speciesId);
    if (species) {
      const variantMult = VARIANT_MULTIPLIERS[pet.variant];
      bonus += species.coinBonus * variantMult;
    }
  }
  return bonus;
}
