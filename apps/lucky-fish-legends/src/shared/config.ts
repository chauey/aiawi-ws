// Shared game configuration
// Used by both server and client

// Rarity system (used by eggs, pets, etc.)
export const RARITIES = {
	Common: { color: Color3.fromRGB(180, 180, 180), chance: 50 },
	Uncommon: { color: Color3.fromRGB(100, 200, 100), chance: 30 },
	Rare: { color: Color3.fromRGB(100, 150, 255), chance: 15 },
	Epic: { color: Color3.fromRGB(180, 100, 255), chance: 4 },
	Legendary: { color: Color3.fromRGB(255, 200, 50), chance: 0.9 },
	Mythic: { color: Color3.fromRGB(255, 100, 150), chance: 0.1 },
};

// Game balance settings
export const GAME_CONFIG = {
	// Coins
	COIN_SPAWN_COUNT: 8,
	COIN_RESPAWN_TIME: 5,
	BASE_COIN_VALUE: 1,
	
	// Stealing
	STEAL_PERCENTAGE: 0.25,
	STEAL_COOLDOWN: 5,
	STEAL_PROTECTION: 3,
	
	// Daily rewards
	DAILY_REWARDS: [10, 25, 50, 100, 200, 350, 500],
	
	// Rebirth
	REBIRTH_COST: 10000,
	REBIRTH_MULTIPLIER: 0.25, // +25% per rebirth
};

// Pet types list
export const PET_NAMES = [
	"cat", "dog", "bunny", "hamster",
	"bear", "panda", "penguin", "fox",
	"lion", "tiger", "elephant", "owl",
	"unicorn", "dragon", "phoenix", "crab"
] as const;

export type PetName = typeof PET_NAMES[number];
