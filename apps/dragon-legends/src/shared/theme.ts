// Dragon Legends Theme Configuration
// All visual theming for the Dragon game

export const GAME_THEME = {
  // Game identity
  name: 'Dragon Legends',
  emoji: '🐉',
  currency: 'Dragon Coins',
  currencyEmoji: '💎',
  secondaryCurrency: 'Dragon Gems',
  secondaryCurrencyEmoji: '✨',

  // Colors
  primary: Color3.fromRGB(255, 100, 50), // Dragon orange/red
  secondary: Color3.fromRGB(100, 150, 255), // Ice blue
  accent: Color3.fromRGB(180, 100, 255), // Purple magic
  background: Color3.fromRGB(20, 15, 30), // Dark purple
  success: Color3.fromRGB(80, 200, 80), // Green
  error: Color3.fromRGB(200, 60, 60), // Red
  gold: Color3.fromRGB(255, 215, 0), // Gold for legendaries

  // Element colors
  elements: {
    fire: Color3.fromRGB(255, 100, 50),
    water: Color3.fromRGB(50, 150, 255),
    ice: Color3.fromRGB(150, 220, 255),
    electric: Color3.fromRGB(255, 255, 100),
    nature: Color3.fromRGB(100, 200, 100),
    shadow: Color3.fromRGB(80, 50, 100),
    light: Color3.fromRGB(255, 255, 200),
  },
};

// Element type advantages (Fire > Ice > Electric > Water > Fire)
export const ELEMENT_ADVANTAGES: { [key: string]: string[] } = {
  fire: ['ice', 'nature'],
  water: ['fire'],
  ice: ['electric', 'water'],
  electric: ['water'],
  nature: ['water', 'electric'],
  shadow: ['light'],
  light: ['shadow'],
};

// Dragon emojis by element
export const DRAGON_EMOJIS: { [key: string]: string } = {
  fire_drake: '🔥',
  water_wyrm: '💧',
  earth_turtle: '🐢',
  wind_serpent: '🌪️',
  thunder_dragon: '⚡',
  frost_drake: '❄️',
  shadow_serpent: '🌑',
  crystal_dragon: '💎',
  solar_phoenix: '☀️',
  storm_king: '🌩️',
  cosmic_dragon: '🌌',
  void_dragon: '🕳️',
  rainbow_dragon: '🌈',
  galaxy_serpent: '🌠',
  time_dragon: '⏰',
  chaos_lord: '💀',
};

// Region themes
export const REGION_THEMES = [
  {
    id: 'starter_meadow',
    name: 'Starter Meadow',
    emoji: '🌿',
    color: Color3.fromRGB(100, 200, 100),
    unlockCost: 0,
  },
  {
    id: 'mystic_forest',
    name: 'Mystic Forest',
    emoji: '🌲',
    color: Color3.fromRGB(50, 100, 50),
    unlockCost: 500,
  },
  {
    id: 'volcanic_peaks',
    name: 'Volcanic Peaks',
    emoji: '🌋',
    color: Color3.fromRGB(255, 100, 50),
    unlockCost: 2000,
  },
  {
    id: 'frozen_tundra',
    name: 'Frozen Tundra',
    emoji: '❄️',
    color: Color3.fromRGB(150, 200, 255),
    unlockCost: 5000,
  },
  {
    id: 'storm_islands',
    name: 'Storm Islands',
    emoji: '⛈️',
    color: Color3.fromRGB(100, 100, 150),
    unlockCost: 10000,
  },
  {
    id: 'crystal_caverns',
    name: 'Crystal Caverns',
    emoji: '💎',
    color: Color3.fromRGB(200, 100, 255),
    unlockCost: 25000,
  },
  {
    id: 'shadow_realm',
    name: 'Shadow Realm',
    emoji: '🌑',
    color: Color3.fromRGB(50, 30, 70),
    unlockCost: 50000,
  },
  {
    id: 'celestial_sanctum',
    name: 'Celestial Sanctum',
    emoji: '✨',
    color: Color3.fromRGB(255, 220, 150),
    unlockCost: 100000,
  },
];
