// Game Configuration System - Data-driven multi-game architecture
// Change settings here to create different games from the same codebase

// ========== TYPE DEFINITIONS ==========

export type MaturityRating = "kids" | "everyone" | "teen";

export type ThemeStyle = "cute" | "fantasy" | "scifi" | "horror" | "realistic";

export type EconomyDifficulty = "casual" | "balanced" | "hardcore";

export type Platform = "all" | "mobile" | "pc" | "console";

export interface FeatureFlags {
	// Core gameplay
	pets: boolean;
	eggs: boolean;
	evolution: boolean;
	fusion: boolean;
	
	// Social
	trading: boolean;
	clans: boolean;
	leaderboards: boolean;
	privateServers: boolean;
	
	// Competition
	battles: boolean;
	stealing: boolean;
	
	// Rewards
	dailyRewards: boolean;
	quests: boolean;
	achievements: boolean;
	luckyWheel: boolean;
	codes: boolean;
	
	// Monetization
	shop: boolean;
	vip: boolean;
	premium: boolean;
	rebirth: boolean;
	
	// Fun extras
	minigames: boolean;
	events: boolean;
	music: boolean;
}

export interface ThemeConfig {
	style: ThemeStyle;
	
	// Color palette
	primaryColor: Color3;
	secondaryColor: Color3;
	accentColor: Color3;
	backgroundColor: Color3;
	textColor: Color3;
	
	// Visual effects
	particles: boolean;
	glowEffects: boolean;
	darkMode: boolean;
	
	// Sounds
	musicVolume: number;
	sfxVolume: number;
}

export interface EconomyConfig {
	difficulty: EconomyDifficulty;
	
	// Starting values
	startingCoins: number;
	startingGems: number;
	
	// Earn rates
	coinMultiplier: number;
	gemMultiplier: number;
	
	// Prices
	eggPriceMultiplier: number;
	petPriceMultiplier: number;
	
	// Progression
	rebirthRequirement: number;
	rebirthMultiplier: number;
	maxRebirth: number;
}

export interface MaturityFilters {
	// Content restrictions by maturity
	allowStealing: boolean;      // Stealing from other players
	allowBattles: boolean;       // PvP combat
	allowTrading: boolean;       // Trading (scam risk for young)
	allowDarkThemes: boolean;    // Horror/dark visuals
	allowGambling: boolean;      // Lucky wheel, gacha mechanics
	allowCompetition: boolean;   // Leaderboards, rankings
	chatFilter: "strict" | "moderate" | "minimal";
}

export interface GameConfig {
	// Identity
	id: string;
	name: string;
	version: string;
	
	// Target audience
	maturity: MaturityRating;
	platform: Platform;
	
	// Configuration sections
	features: FeatureFlags;
	theme: ThemeConfig;
	economy: EconomyConfig;
	maturityFilters: MaturityFilters;
	
	// A/B Testing
	abTestGroup?: string;
	
	// Seasonal
	seasonalEvent?: string;
}

// ========== PRESETS BY MATURITY ==========

const KIDS_MATURITY_FILTERS: MaturityFilters = {
	allowStealing: false,
	allowBattles: false,
	allowTrading: false,
	allowDarkThemes: false,
	allowGambling: false,
	allowCompetition: false,
	chatFilter: "strict",
};

const EVERYONE_MATURITY_FILTERS: MaturityFilters = {
	allowStealing: false,
	allowBattles: true,
	allowTrading: false,
	allowDarkThemes: false,
	allowGambling: true, // Mild gacha OK
	allowCompetition: true,
	chatFilter: "moderate",
};

const TEEN_MATURITY_FILTERS: MaturityFilters = {
	allowStealing: true,
	allowBattles: true,
	allowTrading: true,
	allowDarkThemes: true,
	allowGambling: true,
	allowCompetition: true,
	chatFilter: "minimal",
};

// ========== THEME PRESETS ==========

const CUTE_THEME: ThemeConfig = {
	style: "cute",
	primaryColor: Color3.fromRGB(255, 150, 200),
	secondaryColor: Color3.fromRGB(150, 220, 255),
	accentColor: Color3.fromRGB(255, 220, 100),
	backgroundColor: Color3.fromRGB(40, 45, 60),
	textColor: Color3.fromRGB(255, 255, 255),
	particles: true,
	glowEffects: true,
	darkMode: true,
	musicVolume: 0.5,
	sfxVolume: 0.7,
};

const FANTASY_THEME: ThemeConfig = {
	style: "fantasy",
	primaryColor: Color3.fromRGB(100, 80, 180),
	secondaryColor: Color3.fromRGB(80, 200, 120),
	accentColor: Color3.fromRGB(255, 200, 50),
	backgroundColor: Color3.fromRGB(30, 35, 50),
	textColor: Color3.fromRGB(255, 255, 255),
	particles: true,
	glowEffects: true,
	darkMode: true,
	musicVolume: 0.6,
	sfxVolume: 0.7,
};

// ========== ECONOMY PRESETS ==========

const CASUAL_ECONOMY: EconomyConfig = {
	difficulty: "casual",
	startingCoins: 500,
	startingGems: 10,
	coinMultiplier: 2.0,
	gemMultiplier: 1.5,
	eggPriceMultiplier: 0.5,
	petPriceMultiplier: 0.5,
	rebirthRequirement: 5000,
	rebirthMultiplier: 2.0,
	maxRebirth: 50,
};

const BALANCED_ECONOMY: EconomyConfig = {
	difficulty: "balanced",
	startingCoins: 100,
	startingGems: 5,
	coinMultiplier: 1.0,
	gemMultiplier: 1.0,
	eggPriceMultiplier: 1.0,
	petPriceMultiplier: 1.0,
	rebirthRequirement: 10000,
	rebirthMultiplier: 1.5,
	maxRebirth: 100,
};

// ========== ALL FEATURES ENABLED ==========

const ALL_FEATURES: FeatureFlags = {
	pets: true,
	eggs: true,
	evolution: true,
	fusion: true,
	trading: true,
	clans: true,
	leaderboards: true,
	privateServers: true,
	battles: true,
	stealing: true,
	dailyRewards: true,
	quests: true,
	achievements: true,
	luckyWheel: true,
	codes: true,
	shop: true,
	vip: true,
	premium: true,
	rebirth: true,
	minigames: true,
	events: true,
	music: true,
};

// ========== CURRENT GAME CONFIG ==========
// Change this to deploy different games!

export const GAME_CONFIG: GameConfig = {
	id: "pet-simulator-x",
	name: "Ultimate Pet Simulator",
	version: "1.0.0",
	
	maturity: "everyone",
	platform: "all",
	
	features: ALL_FEATURES,
	theme: FANTASY_THEME,
	economy: BALANCED_ECONOMY,
	maturityFilters: EVERYONE_MATURITY_FILTERS,
	
	// Optional
	seasonalEvent: undefined, // e.g., "winter2024", "halloween"
	abTestGroup: undefined,
};

// ========== HELPER FUNCTIONS ==========

export function isFeatureEnabled(featureId: keyof FeatureFlags): boolean {
	return GAME_CONFIG.features[featureId];
}

export function getMaturityFilter<K extends keyof MaturityFilters>(key: K): MaturityFilters[K] {
	return GAME_CONFIG.maturityFilters[key];
}

export function getEconomyValue<K extends keyof EconomyConfig>(key: K): EconomyConfig[K] {
	return GAME_CONFIG.economy[key];
}

export function getThemeColor(colorName: "primary" | "secondary" | "accent" | "background" | "text"): Color3 {
	switch (colorName) {
		case "primary": return GAME_CONFIG.theme.primaryColor;
		case "secondary": return GAME_CONFIG.theme.secondaryColor;
		case "accent": return GAME_CONFIG.theme.accentColor;
		case "background": return GAME_CONFIG.theme.backgroundColor;
		case "text": return GAME_CONFIG.theme.textColor;
	}
}

export function applyMaturityToFeatures(): Partial<FeatureFlags> {
	const filters = GAME_CONFIG.maturityFilters;
	return {
		stealing: filters.allowStealing,
		battles: filters.allowBattles,
		trading: filters.allowTrading,
		luckyWheel: filters.allowGambling,
		leaderboards: filters.allowCompetition,
	};
}

// Game presets for quick switching
export const GAME_PRESETS = {
	kidsGame: {
		maturity: "kids" as MaturityRating,
		theme: CUTE_THEME,
		economy: CASUAL_ECONOMY,
		maturityFilters: KIDS_MATURITY_FILTERS,
	},
	familyGame: {
		maturity: "everyone" as MaturityRating,
		theme: FANTASY_THEME,
		economy: BALANCED_ECONOMY,
		maturityFilters: EVERYONE_MATURITY_FILTERS,
	},
	competitiveGame: {
		maturity: "teen" as MaturityRating,
		theme: FANTASY_THEME,
		economy: BALANCED_ECONOMY,
		maturityFilters: TEEN_MATURITY_FILTERS,
	},
};

print(`🎮 Game Config loaded: ${GAME_CONFIG.name} (${GAME_CONFIG.maturity})`);
