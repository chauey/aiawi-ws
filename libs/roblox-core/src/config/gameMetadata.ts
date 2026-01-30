// Game Metadata - Genres and Age Groups
// Uses exact Roblox categories

/**
 * Official Roblox Genres (as of 2024)
 * Games can have multiple genres
 */
export enum RobloxGenre {
	// Main Genres
	All = "All",
	Adventure = "Adventure",
	Building = "Building",
	Comedy = "Comedy",
	Fighting = "Fighting",
	FPS = "FPS",
	Horror = "Horror",
	Medieval = "Medieval",
	Military = "Military",
	Naval = "Naval",
	RPG = "RPG",
	SciFi = "Sci-Fi",
	Social = "Social",
	Sports = "Sports",
	TownAndCity = "Town and City",
	Western = "Western",
	
	// Popular Sub-categories
	Simulator = "Simulator",
	Tycoon = "Tycoon",
	Obby = "Obby",
	Roleplay = "Roleplay",
	Survival = "Survival",
	PVP = "PVP",
	Racing = "Racing",
	Puzzle = "Puzzle",
}

/**
 * Roblox Experience Guidelines Age Ratings
 * https://en.help.roblox.com/hc/en-us/articles/8862768451604
 */
export enum RobloxAgeGroup {
	All = "All Ages", // Suitable for all ages
	Age9Plus = "9+",  // Suitable for ages 9+
	Age13Plus = "13+", // Suitable for ages 13+
	Age17Plus = "17+", // Mature content, 17+
}

/**
 * Content descriptors that affect age rating
 */
export enum ContentDescriptor {
	None = "None",
	MildViolence = "Mild Violence",
	Fear = "Fear",
	Blood = "Blood",
	Gambling = "Simulated Gambling",
	Alcohol = "Alcohol Reference",
	RomanticThemes = "Romantic Themes",
	CrudeHumor = "Crude Humor",
	StrongLanguage = "Strong Language",
}

/**
 * Game metadata configuration
 * Store this in your gameConfig.ts
 */
export interface GameMetadata {
	// Basic Info
	name: string;
	description: string;
	version: string;
	
	// Classification
	genres: RobloxGenre[];
	primaryGenre: RobloxGenre;
	ageGroup: RobloxAgeGroup;
	contentDescriptors: ContentDescriptor[];
	
	// Monetization
	hasPaidAccess: boolean;
	paidAccessPrice?: number;
	hasGamePasses: boolean;
	hasDeveloperProducts: boolean;
	
	// Social
	maxPlayers: number;
	allowPrivateServers: boolean;
	privateServerPrice?: number;
	
	// Platform
	supportsMobile: boolean;
	supportsConsole: boolean;
	supportsVR: boolean;
}

/**
 * Example metadata for Pet Simulator game
 */
export const PET_SIMULATOR_METADATA: GameMetadata = {
	name: "Ultimate Pet Simulator",
	description: "Collect coins, hatch eggs, and raise powerful pets!",
	version: "1.0.0",
	
	genres: [
		RobloxGenre.Simulator,
		RobloxGenre.Adventure,
		RobloxGenre.Social,
		RobloxGenre.RPG,
	],
	primaryGenre: RobloxGenre.Simulator,
	ageGroup: RobloxAgeGroup.All,
	contentDescriptors: [ContentDescriptor.None],
	
	hasPaidAccess: false,
	hasGamePasses: true,
	hasDeveloperProducts: true,
	
	maxPlayers: 20,
	allowPrivateServers: true,
	privateServerPrice: 100,
	
	supportsMobile: true,
	supportsConsole: true,
	supportsVR: false,
};

/**
 * Helper to check if game is suitable for an age
 */
export function isSuitableForAge(metadata: GameMetadata, playerAge: number): boolean {
	switch (metadata.ageGroup) {
		case RobloxAgeGroup.All:
			return true;
		case RobloxAgeGroup.Age9Plus:
			return playerAge >= 9;
		case RobloxAgeGroup.Age13Plus:
			return playerAge >= 13;
		case RobloxAgeGroup.Age17Plus:
			return playerAge >= 17;
		default:
			return true;
	}
}

/**
 * Format genres for display
 */
export function formatGenres(genres: RobloxGenre[]): string {
	return genres.join(", ");
}

/**
 * Get emoji for genre
 */
export function getGenreEmoji(genre: RobloxGenre): string {
	const emojiMap: Partial<Record<RobloxGenre, string>> = {
		[RobloxGenre.Adventure]: "🗺️",
		[RobloxGenre.Simulator]: "🎮",
		[RobloxGenre.RPG]: "⚔️",
		[RobloxGenre.Horror]: "👻",
		[RobloxGenre.Fighting]: "🥊",
		[RobloxGenre.Racing]: "🏎️",
		[RobloxGenre.Sports]: "⚽",
		[RobloxGenre.Social]: "👥",
		[RobloxGenre.Tycoon]: "💰",
		[RobloxGenre.Obby]: "🏃",
		[RobloxGenre.Building]: "🏗️",
		[RobloxGenre.Survival]: "🏕️",
		[RobloxGenre.FPS]: "🔫",
	};
	return emojiMap[genre] ?? "🎮";
}
