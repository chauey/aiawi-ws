// Dragon Legends - Shared Configuration
// Core game balance and dragon data

// ============ RARITY SYSTEM ============
export const RARITIES = {
  Common: { color: Color3.fromRGB(180, 180, 180), chance: 50, multiplier: 1 },
  Rare: { color: Color3.fromRGB(100, 150, 255), chance: 30, multiplier: 1.5 },
  Epic: { color: Color3.fromRGB(180, 100, 255), chance: 15, multiplier: 2 },
  Legendary: { color: Color3.fromRGB(255, 200, 50), chance: 4, multiplier: 3 },
  Mythic: { color: Color3.fromRGB(255, 100, 150), chance: 1, multiplier: 5 },
};

export type Rarity = keyof typeof RARITIES;

// ============ ELEMENTS ============
export const ELEMENTS = [
  'fire',
  'water',
  'ice',
  'electric',
  'nature',
  'shadow',
  'light',
] as const;

export type Element = (typeof ELEMENTS)[number];

// Element effectiveness multipliers
export const ELEMENT_CHART: {
  [attacker: string]: { [defender: string]: number };
} = {
  fire: {
    ice: 2,
    nature: 2,
    water: 0.5,
    fire: 1,
    electric: 1,
    shadow: 1,
    light: 1,
  },
  water: {
    fire: 2,
    water: 1,
    ice: 0.5,
    electric: 0.5,
    nature: 1,
    shadow: 1,
    light: 1,
  },
  ice: {
    water: 2,
    electric: 2,
    fire: 0.5,
    ice: 1,
    nature: 1,
    shadow: 1,
    light: 1,
  },
  electric: {
    water: 2,
    ice: 0.5,
    nature: 0.5,
    fire: 1,
    electric: 1,
    shadow: 1,
    light: 1,
  },
  nature: {
    water: 2,
    electric: 2,
    fire: 0.5,
    ice: 0.5,
    nature: 1,
    shadow: 1,
    light: 1,
  },
  shadow: {
    light: 2,
    shadow: 0.5,
    fire: 1,
    water: 1,
    ice: 1,
    electric: 1,
    nature: 1,
  },
  light: {
    shadow: 2,
    light: 0.5,
    fire: 1,
    water: 1,
    ice: 1,
    electric: 1,
    nature: 1,
  },
};

// ============ DRAGON DEFINITIONS ============
export interface DragonStats {
  power: number;
  speed: number;
  health: number;
  luck: number;
}

export interface DragonDefinition {
  id: string;
  name: string;
  element: Element;
  rarity: Rarity;
  baseStats: DragonStats;
  evolutionStage: 1 | 2 | 3 | 4; // Baby, Teen, Adult, Legendary
  evolvesFrom?: string;
  evolvesTo?: string;
  description: string;
}

// All dragon definitions
export const DRAGONS: { [id: string]: DragonDefinition } = {
  // ===== FIRE DRAGONS =====
  fire_drake_baby: {
    id: 'fire_drake_baby',
    name: 'Fire Drake (Baby)',
    element: 'fire',
    rarity: 'Common',
    baseStats: { power: 10, speed: 8, health: 12, luck: 5 },
    evolutionStage: 1,
    evolvesTo: 'fire_drake_teen',
    description: 'A small but feisty fire dragon with a warm personality.',
  },
  fire_drake_teen: {
    id: 'fire_drake_teen',
    name: 'Fire Drake (Teen)',
    element: 'fire',
    rarity: 'Common',
    baseStats: { power: 25, speed: 20, health: 30, luck: 10 },
    evolutionStage: 2,
    evolvesFrom: 'fire_drake_baby',
    evolvesTo: 'fire_drake_adult',
    description: 'Now with larger wings and a hotter flame.',
  },
  fire_drake_adult: {
    id: 'fire_drake_adult',
    name: 'Fire Drake',
    element: 'fire',
    rarity: 'Rare',
    baseStats: { power: 50, speed: 40, health: 60, luck: 20 },
    evolutionStage: 3,
    evolvesFrom: 'fire_drake_teen',
    evolvesTo: 'inferno_drake',
    description: 'A fully grown fire dragon, master of flames.',
  },
  inferno_drake: {
    id: 'inferno_drake',
    name: 'Inferno Drake',
    element: 'fire',
    rarity: 'Legendary',
    baseStats: { power: 100, speed: 80, health: 120, luck: 40 },
    evolutionStage: 4,
    evolvesFrom: 'fire_drake_adult',
    description: 'The legendary form, wreathed in eternal flames.',
  },

  // ===== WATER DRAGONS =====
  water_wyrm_baby: {
    id: 'water_wyrm_baby',
    name: 'Water Wyrm (Baby)',
    element: 'water',
    rarity: 'Common',
    baseStats: { power: 8, speed: 10, health: 15, luck: 5 },
    evolutionStage: 1,
    evolvesTo: 'water_wyrm_teen',
    description: 'A playful water serpent that loves to splash.',
  },
  water_wyrm_teen: {
    id: 'water_wyrm_teen',
    name: 'Water Wyrm (Teen)',
    element: 'water',
    rarity: 'Common',
    baseStats: { power: 20, speed: 25, health: 35, luck: 10 },
    evolutionStage: 2,
    evolvesFrom: 'water_wyrm_baby',
    evolvesTo: 'water_wyrm_adult',
    description: 'Growing more serpentine and graceful.',
  },
  water_wyrm_adult: {
    id: 'water_wyrm_adult',
    name: 'Water Wyrm',
    element: 'water',
    rarity: 'Rare',
    baseStats: { power: 45, speed: 50, health: 70, luck: 20 },
    evolutionStage: 3,
    evolvesFrom: 'water_wyrm_teen',
    evolvesTo: 'ocean_leviathan',
    description: 'A majestic aquatic dragon controlling the tides.',
  },
  ocean_leviathan: {
    id: 'ocean_leviathan',
    name: 'Ocean Leviathan',
    element: 'water',
    rarity: 'Legendary',
    baseStats: { power: 90, speed: 100, health: 140, luck: 40 },
    evolutionStage: 4,
    evolvesFrom: 'water_wyrm_adult',
    description: 'The legendary sea serpent, ruler of the oceans.',
  },

  // ===== ICE DRAGONS =====
  frost_drake_baby: {
    id: 'frost_drake_baby',
    name: 'Frost Drake (Baby)',
    element: 'ice',
    rarity: 'Common',
    baseStats: { power: 9, speed: 7, health: 14, luck: 5 },
    evolutionStage: 1,
    evolvesTo: 'frost_drake_teen',
    description: 'A cute ice dragon that leaves frost wherever it goes.',
  },
  frost_drake_teen: {
    id: 'frost_drake_teen',
    name: 'Frost Drake (Teen)',
    element: 'ice',
    rarity: 'Common',
    baseStats: { power: 22, speed: 18, health: 32, luck: 10 },
    evolutionStage: 2,
    evolvesFrom: 'frost_drake_baby',
    evolvesTo: 'frost_drake_adult',
    description: 'Now capable of creating small blizzards.',
  },
  frost_drake_adult: {
    id: 'frost_drake_adult',
    name: 'Frost Drake',
    element: 'ice',
    rarity: 'Rare',
    baseStats: { power: 48, speed: 38, health: 65, luck: 20 },
    evolutionStage: 3,
    evolvesFrom: 'frost_drake_teen',
    evolvesTo: 'blizzard_king',
    description: 'A powerful ice dragon that commands the cold.',
  },
  blizzard_king: {
    id: 'blizzard_king',
    name: 'Blizzard King',
    element: 'ice',
    rarity: 'Legendary',
    baseStats: { power: 95, speed: 75, health: 130, luck: 40 },
    evolutionStage: 4,
    evolvesFrom: 'frost_drake_adult',
    description: 'The legendary ice dragon, master of eternal winter.',
  },

  // ===== ELECTRIC DRAGONS =====
  thunder_dragon_baby: {
    id: 'thunder_dragon_baby',
    name: 'Thunder Dragon (Baby)',
    element: 'electric',
    rarity: 'Rare',
    baseStats: { power: 12, speed: 15, health: 10, luck: 8 },
    evolutionStage: 1,
    evolvesTo: 'thunder_dragon_teen',
    description: 'A sparky little dragon that crackles with energy.',
  },
  thunder_dragon_teen: {
    id: 'thunder_dragon_teen',
    name: 'Thunder Dragon (Teen)',
    element: 'electric',
    rarity: 'Rare',
    baseStats: { power: 30, speed: 35, health: 25, luck: 15 },
    evolutionStage: 2,
    evolvesFrom: 'thunder_dragon_baby',
    evolvesTo: 'thunder_dragon_adult',
    description: 'Now generating lightning with each wingbeat.',
  },
  thunder_dragon_adult: {
    id: 'thunder_dragon_adult',
    name: 'Thunder Dragon',
    element: 'electric',
    rarity: 'Epic',
    baseStats: { power: 60, speed: 70, health: 50, luck: 25 },
    evolutionStage: 3,
    evolvesFrom: 'thunder_dragon_teen',
    evolvesTo: 'storm_emperor',
    description: 'A fearsome dragon that calls down lightning storms.',
  },
  storm_emperor: {
    id: 'storm_emperor',
    name: 'Storm Emperor',
    element: 'electric',
    rarity: 'Legendary',
    baseStats: { power: 120, speed: 140, health: 100, luck: 50 },
    evolutionStage: 4,
    evolvesFrom: 'thunder_dragon_adult',
    description: 'The legendary storm dragon, commanding all weather.',
  },

  // ===== NATURE DRAGONS =====
  nature_spirit_baby: {
    id: 'nature_spirit_baby',
    name: 'Nature Spirit (Baby)',
    element: 'nature',
    rarity: 'Common',
    baseStats: { power: 7, speed: 9, health: 16, luck: 6 },
    evolutionStage: 1,
    evolvesTo: 'nature_spirit_teen',
    description: "A leafy dragon born from the forest's heart.",
  },
  nature_spirit_teen: {
    id: 'nature_spirit_teen',
    name: 'Nature Spirit (Teen)',
    element: 'nature',
    rarity: 'Common',
    baseStats: { power: 18, speed: 22, health: 40, luck: 12 },
    evolutionStage: 2,
    evolvesFrom: 'nature_spirit_baby',
    evolvesTo: 'nature_spirit_adult',
    description: 'Growing vines and flowers bloom in its presence.',
  },
  nature_spirit_adult: {
    id: 'nature_spirit_adult',
    name: 'Nature Guardian',
    element: 'nature',
    rarity: 'Rare',
    baseStats: { power: 40, speed: 45, health: 80, luck: 25 },
    evolutionStage: 3,
    evolvesFrom: 'nature_spirit_teen',
    evolvesTo: 'ancient_treant',
    description: 'A powerful nature dragon protecting the forests.',
  },
  ancient_treant: {
    id: 'ancient_treant',
    name: 'Ancient Treant',
    element: 'nature',
    rarity: 'Legendary',
    baseStats: { power: 80, speed: 70, health: 160, luck: 50 },
    evolutionStage: 4,
    evolvesFrom: 'nature_spirit_adult',
    description: 'The legendary forest dragon, one with all nature.',
  },

  // ===== SHADOW DRAGONS =====
  shadow_serpent_baby: {
    id: 'shadow_serpent_baby',
    name: 'Shadow Serpent (Baby)',
    element: 'shadow',
    rarity: 'Rare',
    baseStats: { power: 14, speed: 12, health: 11, luck: 10 },
    evolutionStage: 1,
    evolvesTo: 'shadow_serpent_teen',
    description: 'A mysterious dragon born from darkness itself.',
  },
  shadow_serpent_teen: {
    id: 'shadow_serpent_teen',
    name: 'Shadow Serpent (Teen)',
    element: 'shadow',
    rarity: 'Rare',
    baseStats: { power: 35, speed: 30, health: 28, luck: 20 },
    evolutionStage: 2,
    evolvesFrom: 'shadow_serpent_baby',
    evolvesTo: 'shadow_serpent_adult',
    description: 'Now able to phase through shadows.',
  },
  shadow_serpent_adult: {
    id: 'shadow_serpent_adult',
    name: 'Shadow Drake',
    element: 'shadow',
    rarity: 'Epic',
    baseStats: { power: 70, speed: 60, health: 55, luck: 35 },
    evolutionStage: 3,
    evolvesFrom: 'shadow_serpent_teen',
    evolvesTo: 'void_dragon',
    description: 'A fearsome shadow dragon that strikes from darkness.',
  },
  void_dragon: {
    id: 'void_dragon',
    name: 'Void Dragon',
    element: 'shadow',
    rarity: 'Mythic',
    baseStats: { power: 140, speed: 120, health: 110, luck: 70 },
    evolutionStage: 4,
    evolvesFrom: 'shadow_serpent_adult',
    description: 'The mythic void dragon, commander of the abyss.',
  },

  // ===== LIGHT DRAGONS =====
  light_sprite_baby: {
    id: 'light_sprite_baby',
    name: 'Light Sprite (Baby)',
    element: 'light',
    rarity: 'Rare',
    baseStats: { power: 11, speed: 14, health: 13, luck: 12 },
    evolutionStage: 1,
    evolvesTo: 'light_sprite_teen',
    description: 'A glowing dragon that radiates warmth and hope.',
  },
  light_sprite_teen: {
    id: 'light_sprite_teen',
    name: 'Light Sprite (Teen)',
    element: 'light',
    rarity: 'Rare',
    baseStats: { power: 28, speed: 35, health: 32, luck: 25 },
    evolutionStage: 2,
    evolvesFrom: 'light_sprite_baby',
    evolvesTo: 'light_sprite_adult',
    description: 'Now shining bright enough to banish shadows.',
  },
  light_sprite_adult: {
    id: 'light_sprite_adult',
    name: 'Solar Phoenix',
    element: 'light',
    rarity: 'Epic',
    baseStats: { power: 55, speed: 70, health: 65, luck: 45 },
    evolutionStage: 3,
    evolvesFrom: 'light_sprite_teen',
    evolvesTo: 'celestial_dragon',
    description: 'A radiant dragon bringing light to the darkest places.',
  },
  celestial_dragon: {
    id: 'celestial_dragon',
    name: 'Celestial Dragon',
    element: 'light',
    rarity: 'Mythic',
    baseStats: { power: 110, speed: 140, health: 130, luck: 80 },
    evolutionStage: 4,
    evolvesFrom: 'light_sprite_adult',
    description: 'The mythic celestial dragon, blessed by the heavens.',
  },

  // ===== SPECIAL/HYBRID DRAGONS =====
  crystal_dragon: {
    id: 'crystal_dragon',
    name: 'Crystal Dragon',
    element: 'ice',
    rarity: 'Epic',
    baseStats: { power: 65, speed: 55, health: 75, luck: 40 },
    evolutionStage: 3,
    description: 'A rare hybrid born from ice and earth. Breeding only.',
  },
  cosmic_dragon: {
    id: 'cosmic_dragon',
    name: 'Cosmic Dragon',
    element: 'light',
    rarity: 'Legendary',
    baseStats: { power: 100, speed: 100, health: 100, luck: 60 },
    evolutionStage: 4,
    description: 'An extremely rare dragon from the stars. Raid boss drop.',
  },
  rainbow_dragon: {
    id: 'rainbow_dragon',
    name: 'Rainbow Dragon',
    element: 'light',
    rarity: 'Legendary',
    baseStats: { power: 85, speed: 85, health: 85, luck: 85 },
    evolutionStage: 4,
    description:
      'A mythical dragon with mastery over all elements. Event exclusive.',
  },
  chaos_lord: {
    id: 'chaos_lord',
    name: 'Chaos Lord',
    element: 'shadow',
    rarity: 'Mythic',
    baseStats: { power: 150, speed: 130, health: 140, luck: 100 },
    evolutionStage: 4,
    description: 'The ultimate boss dragon. Only from world boss raids.',
  },
};

// ============ GAME BALANCE ============
export const GAME_CONFIG = {
  // Currency
  STARTING_COINS: 100,
  STARTING_GEMS: 10,

  // Experience
  XP_PER_BATTLE: 25,
  XP_PER_LEVEL: 100, // Base XP needed, scales with level
  MAX_DRAGON_LEVEL: 50,
  EVOLUTION_LEVELS: [10, 25, 50], // Baby->Teen, Teen->Adult, Adult->Legendary

  // Breeding
  BREEDING_TIME_MINUTES: 30,
  MUTATION_CHANCE: 0.05, // 5% chance for rare mutation

  // Combat
  BASE_DAMAGE_MULTIPLIER: 1,
  CRIT_CHANCE: 0.1, // 10% base crit
  CRIT_MULTIPLIER: 1.5,

  // Daily rewards
  DAILY_REWARDS: [50, 100, 150, 250, 400, 600, 1000],

  // Eggs
  BASIC_EGG_COST: 100,
  PREMIUM_EGG_COST: 500,
  LEGENDARY_EGG_COST: 2000,
};

// ============ EGG TYPES ============
export const EGG_TYPES = {
  basic: {
    name: 'Basic Dragon Egg',
    cost: GAME_CONFIG.BASIC_EGG_COST,
    currency: 'coins',
    rates: { Common: 70, Rare: 25, Epic: 4, Legendary: 1, Mythic: 0 },
  },
  premium: {
    name: 'Premium Dragon Egg',
    cost: GAME_CONFIG.PREMIUM_EGG_COST,
    currency: 'coins',
    rates: { Common: 40, Rare: 40, Epic: 15, Legendary: 5, Mythic: 0 },
  },
  legendary: {
    name: 'Legendary Dragon Egg',
    cost: GAME_CONFIG.LEGENDARY_EGG_COST,
    currency: 'gems',
    rates: { Common: 0, Rare: 30, Epic: 45, Legendary: 20, Mythic: 5 },
  },
};

// Get all dragons of a specific rarity that can hatch from eggs
export function getHatchableDragons(rarity: Rarity): DragonDefinition[] {
  const result: DragonDefinition[] = [];
  for (const [, d] of pairs(DRAGONS)) {
    if (d.rarity === rarity && d.evolutionStage === 1) {
      result.push(d);
    }
  }
  return result;
}

// Get dragon type IDs for use elsewhere
export function getDragonIds(): string[] {
  const result: string[] = [];
  for (const [id] of pairs(DRAGONS)) {
    result.push(id as string);
  }
  return result;
}
