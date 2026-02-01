/**
 * Shared Game Systems Library
 * Used by both Product Intelligence Platform and Roblox game code
 *
 * Import: import { CoreGameSystem, GameSystemCategory } from '@aiawi/shared-game-systems';
 */

/**
 * Game System Category - High-level groupings for organizing game systems
 */
export enum GameSystemCategory {
  // Core Mechanics
  Gameplay = 'Gameplay',
  Upgrades = 'Upgrades',
  Progression = 'Progression',
  Economy = 'Economy',

  // Engagement
  Retention = 'Retention',
  Social = 'Social',

  // Revenue
  Monetization = 'Monetization',
  Gamepasses = 'Gamepasses',
  Products = 'Products',

  // World & UX
  World = 'World',
  UI = 'UI',
}

/**
 * Core Game System - Comprehensive list of reusable game mechanics
 * Organized by category for feature tracking, analysis, and game development
 */
export enum CoreGameSystem {
  // ==================== GAMEPLAY SYSTEMS ====================
  // Core mechanics that define the game loop
  PlotSystem = 'Plot System',
  SlotSystem = 'Slot System',
  EggSystem = 'Egg System',
  ItemSystem = 'Item System',
  RodSystem = 'Rod System',
  FishSystem = 'Fish System',
  SellingSystem = 'Selling System',
  BoxCollecting = 'Box Collecting',
  ToolSystem = 'Tool System',
  ConveyorSystem = 'Conveyor System',
  RarityTimers = 'Rarity Timers',
  BackpackSystem = 'Backpack/Satchel',

  // Collection Systems
  PetSystem = 'Pet System',
  PetCollection = 'Pet Collection',
  ItemCollection = 'Item Collection',
  CardCollection = 'Card Collection',
  MountSystem = 'Mount System',
  IndexSystem = 'Index/Codex',

  // Gacha/RNG Systems
  EggHatching = 'Egg Hatching',
  RaritySystem = 'Rarity System',
  MutationSystem = 'Mutation System',
  GachaRolls = 'Gacha/RNG Rolls',

  // ==================== UPGRADE SYSTEMS ====================
  FloorUpgrades = 'Floor Upgrades',
  SlotUpgrades = 'Slot Upgrades',
  RodUpgrades = 'Rod Upgrades',
  ConveyorUpgrades = 'Conveyor Upgrades',
  ToolUpgrades = 'Tool Upgrades',
  PetUpgrades = 'Pet Upgrades',
  BackpackUpgrades = 'Backpack Upgrades',
  StatUpgrades = 'Stat Upgrades',

  // ==================== PROGRESSION SYSTEMS ====================
  RebirthSystem = 'Rebirth/Prestige',
  LevelingSystem = 'Leveling System',
  SkillTree = 'Skill Tree',
  QuestSystem = 'Quest System',
  AchievementSystem = 'Achievement System',
  SeasonPass = 'Season/Battle Pass',
  MilestoneRewards = 'Milestone Rewards',
  Mastery = 'Mastery System',

  // ==================== RETENTION SYSTEMS ====================
  DailyRewards = 'Daily Rewards',
  DailySpin = 'Daily Spin/Wheel',
  DailyLogin = 'Daily Login Bonus',
  Streaks = 'Login Streaks',
  Events = 'Limited Events',
  PromoCodes = 'Promo Codes',
  Giveaways = 'Giveaway System',
  RegularUpdates = 'Regular Updates',
  Notifications = 'Push Notifications',

  // ==================== ECONOMY SYSTEMS ====================
  MultipleCurrencies = 'Multiple Currencies',
  Trading = 'Trading System',
  Marketplace = 'Player Marketplace',
  Crafting = 'Crafting System',
  Recycling = 'Recycling/Salvage',
  Gifting = 'Gifting System',
  Auction = 'Auction System',

  // ==================== SOCIAL SYSTEMS ====================
  Multiplayer = 'Multiplayer',
  Guilds = 'Guilds/Clans',
  Leaderboards = 'Leaderboards',
  Chat = 'Chat System',
  Friends = 'Friend System',
  PvP = 'PvP Combat',
  Coop = 'Co-op Gameplay',
  PartySystem = 'Party/Group System',

  // ==================== WORLD SYSTEMS ====================
  TeleportSystem = 'Teleport System',
  Zones = 'Multiple Zones/Areas',
  OpenWorld = 'Open World',
  Housing = 'Player Housing',
  CharacterCustomization = 'Character Customization',

  // ==================== MONETIZATION - GAMEPASSES ====================
  VIPGamepass = 'VIP Gamepass',
  LuckGamepass = 'Luck Gamepass',
  SuperLuckGamepass = 'Super Luck Gamepass',
  X2Speed = 'x2 Speed Gamepass',
  X2Hatch = 'x2 Hatch Speed',
  X2Coins = 'x2 Coins Gamepass',
  AutoCollect = 'Auto Collect Gamepass',
  AutoSell = 'Auto Sell Gamepass',
  AutoHatch = 'Auto Hatch Gamepass',
  Fly = 'Fly Gamepass',
  UnlimitedStorage = 'Unlimited Storage',
  NoAds = 'No Ads Gamepass',

  // ==================== MONETIZATION - DEV PRODUCTS ====================
  SkipTimer = 'Skip Effect Timer',
  ForceSpawnLegendary = 'Force Spawn Legendary',
  ForceSpawnMythical = 'Force Spawn Mythical',
  StarterPack = 'Starter Pack',
  ExoticPack = 'Exotic Pack',
  ItemProducts = 'Item Products',
  CashProducts = 'Cash/Coin Products',
  RobuxCurrency = 'Robux Currency Packs',
  LimitedOffers = 'Limited Time Offers',
  FirstPurchaseBonus = 'First Purchase Bonus',
  InstantRebirth = 'Instant Rebirth',
  InventoryExpansion = 'Inventory Expansion',

  // ==================== OTHER SYSTEMS ====================
  VIPServer = 'VIP Servers',
  PremiumBenefits = 'Premium Benefits',
  ReferralSystem = 'Referral System',
  ABTesting = 'A/B Testing',
  Analytics = 'Analytics Integration',
}

/**
 * System to Category mapping
 */
export const SYSTEM_CATEGORIES: Record<CoreGameSystem, GameSystemCategory> = {
  // Gameplay
  [CoreGameSystem.PlotSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.SlotSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.EggSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.ItemSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.RodSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.FishSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.SellingSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.BoxCollecting]: GameSystemCategory.Gameplay,
  [CoreGameSystem.ToolSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.ConveyorSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.RarityTimers]: GameSystemCategory.Gameplay,
  [CoreGameSystem.BackpackSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.PetSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.PetCollection]: GameSystemCategory.Gameplay,
  [CoreGameSystem.ItemCollection]: GameSystemCategory.Gameplay,
  [CoreGameSystem.CardCollection]: GameSystemCategory.Gameplay,
  [CoreGameSystem.MountSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.IndexSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.EggHatching]: GameSystemCategory.Gameplay,
  [CoreGameSystem.RaritySystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.MutationSystem]: GameSystemCategory.Gameplay,
  [CoreGameSystem.GachaRolls]: GameSystemCategory.Gameplay,

  // Upgrades
  [CoreGameSystem.FloorUpgrades]: GameSystemCategory.Upgrades,
  [CoreGameSystem.SlotUpgrades]: GameSystemCategory.Upgrades,
  [CoreGameSystem.RodUpgrades]: GameSystemCategory.Upgrades,
  [CoreGameSystem.ConveyorUpgrades]: GameSystemCategory.Upgrades,
  [CoreGameSystem.ToolUpgrades]: GameSystemCategory.Upgrades,
  [CoreGameSystem.PetUpgrades]: GameSystemCategory.Upgrades,
  [CoreGameSystem.BackpackUpgrades]: GameSystemCategory.Upgrades,
  [CoreGameSystem.StatUpgrades]: GameSystemCategory.Upgrades,

  // Progression
  [CoreGameSystem.RebirthSystem]: GameSystemCategory.Progression,
  [CoreGameSystem.LevelingSystem]: GameSystemCategory.Progression,
  [CoreGameSystem.SkillTree]: GameSystemCategory.Progression,
  [CoreGameSystem.QuestSystem]: GameSystemCategory.Progression,
  [CoreGameSystem.AchievementSystem]: GameSystemCategory.Progression,
  [CoreGameSystem.SeasonPass]: GameSystemCategory.Progression,
  [CoreGameSystem.MilestoneRewards]: GameSystemCategory.Progression,
  [CoreGameSystem.Mastery]: GameSystemCategory.Progression,

  // Retention
  [CoreGameSystem.DailyRewards]: GameSystemCategory.Retention,
  [CoreGameSystem.DailySpin]: GameSystemCategory.Retention,
  [CoreGameSystem.DailyLogin]: GameSystemCategory.Retention,
  [CoreGameSystem.Streaks]: GameSystemCategory.Retention,
  [CoreGameSystem.Events]: GameSystemCategory.Retention,
  [CoreGameSystem.PromoCodes]: GameSystemCategory.Retention,
  [CoreGameSystem.Giveaways]: GameSystemCategory.Retention,
  [CoreGameSystem.RegularUpdates]: GameSystemCategory.Retention,
  [CoreGameSystem.Notifications]: GameSystemCategory.Retention,

  // Economy
  [CoreGameSystem.MultipleCurrencies]: GameSystemCategory.Economy,
  [CoreGameSystem.Trading]: GameSystemCategory.Economy,
  [CoreGameSystem.Marketplace]: GameSystemCategory.Economy,
  [CoreGameSystem.Crafting]: GameSystemCategory.Economy,
  [CoreGameSystem.Recycling]: GameSystemCategory.Economy,
  [CoreGameSystem.Gifting]: GameSystemCategory.Economy,
  [CoreGameSystem.Auction]: GameSystemCategory.Economy,

  // Social
  [CoreGameSystem.Multiplayer]: GameSystemCategory.Social,
  [CoreGameSystem.Guilds]: GameSystemCategory.Social,
  [CoreGameSystem.Leaderboards]: GameSystemCategory.Social,
  [CoreGameSystem.Chat]: GameSystemCategory.Social,
  [CoreGameSystem.Friends]: GameSystemCategory.Social,
  [CoreGameSystem.PvP]: GameSystemCategory.Social,
  [CoreGameSystem.Coop]: GameSystemCategory.Social,
  [CoreGameSystem.PartySystem]: GameSystemCategory.Social,

  // World
  [CoreGameSystem.TeleportSystem]: GameSystemCategory.World,
  [CoreGameSystem.Zones]: GameSystemCategory.World,
  [CoreGameSystem.OpenWorld]: GameSystemCategory.World,
  [CoreGameSystem.Housing]: GameSystemCategory.World,
  [CoreGameSystem.CharacterCustomization]: GameSystemCategory.World,

  // Gamepasses
  [CoreGameSystem.VIPGamepass]: GameSystemCategory.Gamepasses,
  [CoreGameSystem.LuckGamepass]: GameSystemCategory.Gamepasses,
  [CoreGameSystem.SuperLuckGamepass]: GameSystemCategory.Gamepasses,
  [CoreGameSystem.X2Speed]: GameSystemCategory.Gamepasses,
  [CoreGameSystem.X2Hatch]: GameSystemCategory.Gamepasses,
  [CoreGameSystem.X2Coins]: GameSystemCategory.Gamepasses,
  [CoreGameSystem.AutoCollect]: GameSystemCategory.Gamepasses,
  [CoreGameSystem.AutoSell]: GameSystemCategory.Gamepasses,
  [CoreGameSystem.AutoHatch]: GameSystemCategory.Gamepasses,
  [CoreGameSystem.Fly]: GameSystemCategory.Gamepasses,
  [CoreGameSystem.UnlimitedStorage]: GameSystemCategory.Gamepasses,
  [CoreGameSystem.NoAds]: GameSystemCategory.Gamepasses,

  // Products
  [CoreGameSystem.SkipTimer]: GameSystemCategory.Products,
  [CoreGameSystem.ForceSpawnLegendary]: GameSystemCategory.Products,
  [CoreGameSystem.ForceSpawnMythical]: GameSystemCategory.Products,
  [CoreGameSystem.StarterPack]: GameSystemCategory.Products,
  [CoreGameSystem.ExoticPack]: GameSystemCategory.Products,
  [CoreGameSystem.ItemProducts]: GameSystemCategory.Products,
  [CoreGameSystem.CashProducts]: GameSystemCategory.Products,
  [CoreGameSystem.RobuxCurrency]: GameSystemCategory.Products,
  [CoreGameSystem.LimitedOffers]: GameSystemCategory.Products,
  [CoreGameSystem.FirstPurchaseBonus]: GameSystemCategory.Products,
  [CoreGameSystem.InstantRebirth]: GameSystemCategory.Products,
  [CoreGameSystem.InventoryExpansion]: GameSystemCategory.Products,

  // Monetization (Other)
  [CoreGameSystem.VIPServer]: GameSystemCategory.Monetization,
  [CoreGameSystem.PremiumBenefits]: GameSystemCategory.Monetization,
  [CoreGameSystem.ReferralSystem]: GameSystemCategory.Monetization,
  [CoreGameSystem.ABTesting]: GameSystemCategory.Monetization,
  [CoreGameSystem.Analytics]: GameSystemCategory.Monetization,
};

/**
 * Get all systems in a category
 */
export function getSystemsByCategory(
  category: GameSystemCategory,
): CoreGameSystem[] {
  return Object.entries(SYSTEM_CATEGORIES)
    .filter(([, cat]) => cat === category)
    .map(([system]) => system as CoreGameSystem);
}

/**
 * Get the category for a system
 */
export function getCategoryForSystem(
  system: CoreGameSystem,
): GameSystemCategory {
  return SYSTEM_CATEGORIES[system];
}

/**
 * Get all categories
 */
export function getAllCategories(): GameSystemCategory[] {
  return Object.values(GameSystemCategory);
}

/**
 * Get all systems
 */
export function getAllSystems(): CoreGameSystem[] {
  return Object.values(CoreGameSystem);
}
