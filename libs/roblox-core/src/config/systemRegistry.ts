/**
 * System Registry - Links UI features to CoreGameSystem enums
 * Provides a unified mapping between game systems and their implementations
 */

import {
  CoreGameSystem,
  GameSystemCategory,
  SYSTEM_CATEGORIES,
  getSystemsByCategory,
  getCategoryForSystem,
} from '@aiawi/shared-game-systems';

// Re-export shared game systems for convenience
export {
  CoreGameSystem,
  GameSystemCategory,
  SYSTEM_CATEGORIES,
  getSystemsByCategory,
  getCategoryForSystem,
} from '@aiawi/shared-game-systems';

/**
 * System Implementation Status
 */
export type SystemStatus =
  | 'not_started'
  | 'planned'
  | 'in_progress'
  | 'testing'
  | 'complete'
  | 'disabled';

/**
 * System Manifest Entry - Maps a CoreGameSystem to its implementation details
 */
export interface SystemManifest {
  system: CoreGameSystem;
  category: GameSystemCategory;

  // Implementation
  status: SystemStatus;
  featureId?: string; // Links to Feature in featureRegistry
  modulePath?: string; // e.g., 'gameplay/fishingSystem'
  isCore: boolean; // Core systems are always loaded

  // Dependencies
  requires?: CoreGameSystem[];
  optionalWith?: CoreGameSystem[]; // Enhanced when present

  // Progress tracking
  percentComplete: number;
  notes?: string;

  // Monetization link
  monetizesVia?: CoreGameSystem[]; // Which gamepasses/products affect this
}

/**
 * Complete System Manifest - All systems and their implementation status
 */
export const SYSTEM_MANIFEST: SystemManifest[] = [
  // ==================== GAMEPLAY ====================
  {
    system: CoreGameSystem.FishSystem,
    category: GameSystemCategory.Gameplay,
    status: 'complete',
    featureId: 'fishing',
    modulePath: 'gameplay/fishingSystem',
    isCore: true,
    percentComplete: 100,
    monetizesVia: [CoreGameSystem.RodUpgrades, CoreGameSystem.LuckGamepass],
  },
  {
    system: CoreGameSystem.PetSystem,
    category: GameSystemCategory.Gameplay,
    status: 'complete',
    featureId: 'pets',
    modulePath: 'gameplay/petSystem',
    isCore: true,
    percentComplete: 100,
    requires: [CoreGameSystem.EggHatching],
    monetizesVia: [CoreGameSystem.AutoHatch, CoreGameSystem.X2Hatch],
  },
  {
    system: CoreGameSystem.EggHatching,
    category: GameSystemCategory.Gameplay,
    status: 'complete',
    featureId: 'eggs',
    modulePath: 'monetization/gachaSystem',
    isCore: true,
    percentComplete: 100,
    monetizesVia: [
      CoreGameSystem.X2Hatch,
      CoreGameSystem.AutoHatch,
      CoreGameSystem.LuckGamepass,
    ],
  },
  {
    system: CoreGameSystem.RaritySystem,
    category: GameSystemCategory.Gameplay,
    status: 'complete',
    isCore: true,
    percentComplete: 100,
    notes: 'Common/Uncommon/Rare/Epic/Legendary/Mythic tiers',
  },
  {
    system: CoreGameSystem.MutationSystem,
    category: GameSystemCategory.Gameplay,
    status: 'planned',
    isCore: false,
    percentComplete: 0,
    notes: 'Shiny/Golden/Rainbow variants',
  },
  {
    system: CoreGameSystem.SellingSystem,
    category: GameSystemCategory.Gameplay,
    status: 'complete',
    isCore: true,
    percentComplete: 100,
    monetizesVia: [CoreGameSystem.AutoSell, CoreGameSystem.X2Coins],
  },
  {
    system: CoreGameSystem.BackpackSystem,
    category: GameSystemCategory.Gameplay,
    status: 'complete',
    isCore: true,
    percentComplete: 100,
    monetizesVia: [
      CoreGameSystem.BackpackUpgrades,
      CoreGameSystem.UnlimitedStorage,
    ],
  },
  {
    system: CoreGameSystem.IndexSystem,
    category: GameSystemCategory.Gameplay,
    status: 'planned',
    isCore: false,
    percentComplete: 0,
    notes: 'Collection completion tracking / Pokedex style',
  },
  {
    system: CoreGameSystem.ToolSystem,
    category: GameSystemCategory.Gameplay,
    status: 'in_progress',
    isCore: false,
    percentComplete: 50,
    notes: 'Tool switching and usage',
  },
  {
    system: CoreGameSystem.BoxCollecting,
    category: GameSystemCategory.Gameplay,
    status: 'planned',
    isCore: false,
    percentComplete: 0,
    monetizesVia: [CoreGameSystem.AutoCollect],
  },

  // ==================== UPGRADES ====================
  {
    system: CoreGameSystem.RodUpgrades,
    category: GameSystemCategory.Upgrades,
    status: 'complete',
    featureId: 'shop',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.BackpackUpgrades,
    category: GameSystemCategory.Upgrades,
    status: 'complete',
    featureId: 'shop',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.PetUpgrades,
    category: GameSystemCategory.Upgrades,
    status: 'complete',
    featureId: 'evolve',
    isCore: false,
    percentComplete: 100,
  },

  // ==================== PROGRESSION ====================
  {
    system: CoreGameSystem.RebirthSystem,
    category: GameSystemCategory.Progression,
    status: 'complete',
    featureId: 'rebirth',
    isCore: false,
    percentComplete: 100,
    monetizesVia: [CoreGameSystem.InstantRebirth],
  },
  {
    system: CoreGameSystem.QuestSystem,
    category: GameSystemCategory.Progression,
    status: 'complete',
    featureId: 'quests',
    modulePath: 'retention/questSystem',
    isCore: true,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.AchievementSystem,
    category: GameSystemCategory.Progression,
    status: 'complete',
    featureId: 'achievements',
    isCore: false,
    percentComplete: 100,
  },

  // ==================== RETENTION ====================
  {
    system: CoreGameSystem.DailyRewards,
    category: GameSystemCategory.Retention,
    status: 'complete',
    featureId: 'dailyRewards',
    modulePath: 'retention/dailyRewards',
    isCore: true,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.DailySpin,
    category: GameSystemCategory.Retention,
    status: 'complete',
    featureId: 'wheel',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.PromoCodes,
    category: GameSystemCategory.Retention,
    status: 'complete',
    featureId: 'codes',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.Events,
    category: GameSystemCategory.Retention,
    status: 'in_progress',
    featureId: 'events',
    isCore: false,
    percentComplete: 30,
    notes: 'Seasonal and limited-time events',
  },

  // ==================== ECONOMY ====================
  {
    system: CoreGameSystem.Trading,
    category: GameSystemCategory.Economy,
    status: 'complete',
    featureId: 'trading',
    modulePath: 'social/trading',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.MultipleCurrencies,
    category: GameSystemCategory.Economy,
    status: 'complete',
    isCore: true,
    percentComplete: 100,
    notes: 'Coins + Gems dual currency',
  },

  // ==================== SOCIAL ====================
  {
    system: CoreGameSystem.Leaderboards,
    category: GameSystemCategory.Social,
    status: 'complete',
    featureId: 'leaderboard',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.Guilds,
    category: GameSystemCategory.Social,
    status: 'complete',
    featureId: 'clans',
    modulePath: 'social/clans',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.PvP,
    category: GameSystemCategory.Social,
    status: 'complete',
    featureId: 'battles',
    isCore: false,
    percentComplete: 100,
  },

  // ==================== WORLD ====================
  {
    system: CoreGameSystem.Zones,
    category: GameSystemCategory.World,
    status: 'complete',
    featureId: 'maps',
    isCore: true,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.TeleportSystem,
    category: GameSystemCategory.World,
    status: 'complete',
    isCore: true,
    percentComplete: 100,
  },

  // ==================== GAMEPASSES ====================
  {
    system: CoreGameSystem.VIPGamepass,
    category: GameSystemCategory.Gamepasses,
    status: 'complete',
    featureId: 'vip',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.LuckGamepass,
    category: GameSystemCategory.Gamepasses,
    status: 'complete',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.SuperLuckGamepass,
    category: GameSystemCategory.Gamepasses,
    status: 'complete',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.X2Hatch,
    category: GameSystemCategory.Gamepasses,
    status: 'complete',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.X2Coins,
    category: GameSystemCategory.Gamepasses,
    status: 'complete',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.AutoCollect,
    category: GameSystemCategory.Gamepasses,
    status: 'planned',
    isCore: false,
    percentComplete: 0,
  },
  {
    system: CoreGameSystem.AutoSell,
    category: GameSystemCategory.Gamepasses,
    status: 'complete',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.AutoHatch,
    category: GameSystemCategory.Gamepasses,
    status: 'complete',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.Fly,
    category: GameSystemCategory.Gamepasses,
    status: 'planned',
    isCore: false,
    percentComplete: 0,
  },
  {
    system: CoreGameSystem.UnlimitedStorage,
    category: GameSystemCategory.Gamepasses,
    status: 'planned',
    isCore: false,
    percentComplete: 0,
  },

  // ==================== DEV PRODUCTS ====================
  {
    system: CoreGameSystem.SkipTimer,
    category: GameSystemCategory.Products,
    status: 'planned',
    isCore: false,
    percentComplete: 0,
    notes: 'Skip effect cooldown timers',
  },
  {
    system: CoreGameSystem.ForceSpawnLegendary,
    category: GameSystemCategory.Products,
    status: 'planned',
    isCore: false,
    percentComplete: 0,
  },
  {
    system: CoreGameSystem.ForceSpawnMythical,
    category: GameSystemCategory.Products,
    status: 'planned',
    isCore: false,
    percentComplete: 0,
  },
  {
    system: CoreGameSystem.StarterPack,
    category: GameSystemCategory.Products,
    status: 'complete',
    modulePath: 'monetization/starterPacks',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.ExoticPack,
    category: GameSystemCategory.Products,
    status: 'planned',
    isCore: false,
    percentComplete: 0,
  },
  {
    system: CoreGameSystem.CashProducts,
    category: GameSystemCategory.Products,
    status: 'complete',
    isCore: false,
    percentComplete: 100,
    notes: 'Buy coins/gems with Robux',
  },
  {
    system: CoreGameSystem.LimitedOffers,
    category: GameSystemCategory.Products,
    status: 'complete',
    modulePath: 'monetization/limitedOffers',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.FirstPurchaseBonus,
    category: GameSystemCategory.Products,
    status: 'complete',
    modulePath: 'monetization/firstPurchase',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.InstantRebirth,
    category: GameSystemCategory.Products,
    status: 'planned',
    isCore: false,
    percentComplete: 0,
  },

  // ==================== OTHER ====================
  {
    system: CoreGameSystem.VIPServer,
    category: GameSystemCategory.Monetization,
    status: 'complete',
    featureId: 'private',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.PremiumBenefits,
    category: GameSystemCategory.Monetization,
    status: 'complete',
    featureId: 'premium',
    isCore: false,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.ReferralSystem,
    category: GameSystemCategory.Monetization,
    status: 'planned',
    modulePath: 'progression/referralSystem',
    isCore: false,
    percentComplete: 0,
  },
  {
    system: CoreGameSystem.Analytics,
    category: GameSystemCategory.Monetization,
    status: 'complete',
    modulePath: 'analytics/analytics',
    isCore: true,
    percentComplete: 100,
  },
  {
    system: CoreGameSystem.ABTesting,
    category: GameSystemCategory.Monetization,
    status: 'complete',
    modulePath: 'analytics/abTesting',
    isCore: true,
    percentComplete: 100,
  },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get all systems by status
 */
export function getSystemsByStatus(status: SystemStatus): SystemManifest[] {
  return SYSTEM_MANIFEST.filter((s) => s.status === status);
}

/**
 * Get implementation progress by category
 */
export function getCategoryProgress(category: GameSystemCategory): {
  total: number;
  complete: number;
  inProgress: number;
  planned: number;
  percentComplete: number;
} {
  const systems = SYSTEM_MANIFEST.filter((s) => s.category === category);
  const complete = systems.filter((s) => s.status === 'complete').length;
  const inProgress = systems.filter((s) => s.status === 'in_progress').length;
  const planned = systems.filter(
    (s) => s.status === 'planned' || s.status === 'not_started',
  ).length;

  return {
    total: systems.length,
    complete,
    inProgress,
    planned,
    percentComplete:
      systems.length > 0 ? Math.round((complete / systems.length) * 100) : 0,
  };
}

/**
 * Get overall implementation progress
 */
export function getOverallProgress(): {
  total: number;
  complete: number;
  inProgress: number;
  percentComplete: number;
} {
  const complete = SYSTEM_MANIFEST.filter(
    (s) => s.status === 'complete',
  ).length;
  const inProgress = SYSTEM_MANIFEST.filter(
    (s) => s.status === 'in_progress',
  ).length;

  return {
    total: SYSTEM_MANIFEST.length,
    complete,
    inProgress,
    percentComplete: Math.round((complete / SYSTEM_MANIFEST.length) * 100),
  };
}

/**
 * Get systems that monetize a specific gameplay system
 */
export function getMonetizationForSystem(
  system: CoreGameSystem,
): CoreGameSystem[] {
  const manifest = SYSTEM_MANIFEST.find((s) => s.system === system);
  return manifest?.monetizesVia || [];
}

/**
 * Get system manifest by CoreGameSystem
 */
export function getSystemManifest(
  system: CoreGameSystem,
): SystemManifest | undefined {
  return SYSTEM_MANIFEST.find((s) => s.system === system);
}

/**
 * Get all core systems (always loaded)
 */
export function getCoreSystems(): SystemManifest[] {
  return SYSTEM_MANIFEST.filter((s) => s.isCore);
}

/**
 * Get system dependencies
 */
export function getSystemDependencies(
  system: CoreGameSystem,
): CoreGameSystem[] {
  const manifest = getSystemManifest(system);
  return manifest?.requires || [];
}

/**
 * Check if a system is implemented
 */
export function isSystemImplemented(system: CoreGameSystem): boolean {
  const manifest = getSystemManifest(system);
  return manifest?.status === 'complete';
}

/**
 * Get systems linked to a feature ID
 */
export function getSystemsForFeature(featureId: string): SystemManifest[] {
  return SYSTEM_MANIFEST.filter((s) => s.featureId === featureId);
}
