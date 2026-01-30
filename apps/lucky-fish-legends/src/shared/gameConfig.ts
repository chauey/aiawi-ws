/**
 * Lucky Fish Legends - Game Configuration
 * 🎣 A fishing simulator with collection mechanics, breeding, and competitive fishing tournaments
 */

export const GAME_CONFIG = {
  // Game Identity
  gameName: 'Lucky Fish Legends',
  gameId: 'lkfy-lgnd-0000-0000-000000000002',
  version: '0.1.0',
  developer: 'AI AWI Studios',

  // Core Systems to Enable (from roblox-core)
  systems: {
    dailyRewards: true,
    questSystem: true,
    gachaSystem: false, // No gacha - fish are caught, not rolled
    tradingSystem: true, // Trade fish with other players
    clanSystem: false, // Maybe later - fishing clubs
    battlePass: true, // Seasonal fishing pass
    antiCheat: true,
    validationService: true,
    dataStoreHelpers: true,
  },

  // Economy Settings
  economy: {
    startingCurrency: 50,
    currencyName: 'Coins',
    premiumCurrencyName: 'Pearls',
    fishSellMultiplier: 1.0,
  },

  // Fishing Settings
  fishing: {
    baseCatchTime: 3000, // ms
    rarityMultiplier: 1.5, // Time increase per rarity
    maxRodLevel: 10,
    baitTypes: ['Worm', 'Shrimp', 'Special'],
  },

  // Fish Categories
  fishRarities: {
    common: { chance: 0.5, coinMultiplier: 1 },
    uncommon: { chance: 0.25, coinMultiplier: 2 },
    rare: { chance: 0.15, coinMultiplier: 5 },
    epic: { chance: 0.07, coinMultiplier: 15 },
    legendary: { chance: 0.025, coinMultiplier: 50 },
    mythic: { chance: 0.005, coinMultiplier: 200 },
  },

  // Locations
  fishingLocations: [
    { name: 'Starter Pond', unlockLevel: 1, fishMultiplier: 1.0 },
    { name: 'River Rapids', unlockLevel: 5, fishMultiplier: 1.3 },
    { name: 'Deep Lake', unlockLevel: 10, fishMultiplier: 1.6 },
    { name: 'Ocean Shore', unlockLevel: 15, fishMultiplier: 2.0 },
    { name: 'Volcanic Pool', unlockLevel: 25, fishMultiplier: 3.0 },
    { name: 'Crystal Cavern', unlockLevel: 40, fishMultiplier: 5.0 },
  ],

  // Collection System
  collection: {
    totalFishSpecies: 150,
    bonusPerComplete: 1000, // Coins per completed category
    albumRewards: true,
  },

  // Daily Rewards (overrides from roblox-core)
  dailyRewards: {
    baseReward: 25,
    streakMultiplier: 1.2,
    maxStreakDays: 30,
    day7Bonus: 'Rare Bait Pack',
    day30Bonus: 'Legendary Rod',
  },

  // Quests
  questConfig: {
    dailyQuestCount: 3,
    weeklyQuestCount: 5,
    questTypes: ['Catch', 'Sell', 'Collect', 'Explore', 'Trade'],
  },

  // Battle Pass
  battlePass: {
    tierCount: 50,
    xpPerTier: 1000,
    seasonDurationDays: 60,
    premiumPrice: 499, // Robux
  },
};

export type GameConfig = typeof GAME_CONFIG;
