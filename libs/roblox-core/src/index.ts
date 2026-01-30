// Roblox Core Library - Reusable game systems
// Import from "@aiawi/roblox-core" in roblox game apps

// ========== CONFIG ==========
export * from './config/gameConfig';
export * from './config/featureRegistry';
export * from './config/gameMetadata';

// ========== UI COMPONENTS ==========
export * from './ui/actionBar';
export * from './ui/panelSystem';

// ========== ECONOMY ==========
export * from './economy/economyTypes';

// ========== PERSISTENCE ==========
export * from './persistence/dataStoreHelpers';

// ========== PROGRESSION ==========
export * from './progression/battlePass';
export * from './progression/referralSystem';

// ========== MONETIZATION ==========
export * from './monetization/firstPurchase';
export * from './monetization/limitedOffers';
export * from './monetization/gifting';
export * from './monetization/starterPacks';
export * from './monetization/gachaSystem'; // NEW: Gacha/egg system

// ========== ANALYTICS ==========
export * from './analytics/analytics';
export * from './analytics/abTesting';

// ========== SECURITY ==========
export * from './security/antiCheat';
export * from './security/errorLogging';
export * from './security/moderation';

// ========== RETENTION ==========
export * from './retention/psychology';
export * from './retention/notifications';
export * from './retention/questSystem'; // Daily/weekly quests
export * from './retention/dailyRewards'; // NEW: Streak-based daily rewards

// ========== SOCIAL ==========
export * from './social/friends';
export * from './social/trading';
export * from './social/matchmaking'; // ELO matchmaking
export * from './social/clans'; // NEW: Clan/guild system
