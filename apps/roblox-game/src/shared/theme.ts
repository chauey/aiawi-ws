// Theme Configuration - Change this to re-theme the entire game!
// This allows you to create multiple games from the same codebase

export const GAME_THEME = {
	// Game identity
	name: "Coin Collector",
	emoji: "🪙",
	currency: "Coins",
	currencyEmoji: "🪙",
	
	// Colors (change these to re-theme)
	primary: Color3.fromRGB(255, 215, 0),      // Gold
	secondary: Color3.fromRGB(100, 150, 255),   // Blue
	accent: Color3.fromRGB(255, 100, 150),      // Pink
	background: Color3.fromRGB(30, 30, 40),     // Dark
	success: Color3.fromRGB(80, 200, 80),       // Green
	error: Color3.fromRGB(200, 60, 60),         // Red
	
	// Alternative themes (uncomment to use)
	// SPACE THEME:
	// primary: Color3.fromRGB(100, 150, 255),
	// secondary: Color3.fromRGB(180, 100, 255),
	// accent: Color3.fromRGB(100, 255, 200),
	// currencyEmoji: "⭐",
	// currency: "Stars",
	
	// CANDY THEME:
	// primary: Color3.fromRGB(255, 150, 200),
	// secondary: Color3.fromRGB(150, 255, 200),
	// accent: Color3.fromRGB(255, 200, 100),
	// currencyEmoji: "🍬",
	// currency: "Candies",
};

// Pet theme names (change emojis for different game themes)
export const PET_EMOJIS: { [key: string]: string } = {
	cat: "🐱", dog: "🐕", bunny: "🐰", hamster: "🐹",
	bear: "🐻", panda: "🐼", penguin: "🐧", fox: "🦊",
	lion: "🦁", tiger: "🐯", elephant: "🐘", owl: "🦉",
	unicorn: "🦄", dragon: "🐉", phoenix: "🔥", crab: "🦀",
};

// Map themes (change names/colors for different games)
export const MAP_THEMES = [
	{ id: "beach", name: "Beach Paradise", emoji: "🏖️", color: Color3.fromRGB(255, 220, 150) },
	{ id: "volcano", name: "Volcano Island", emoji: "🌋", color: Color3.fromRGB(255, 100, 50) },
	{ id: "space", name: "Space Station", emoji: "🚀", color: Color3.fromRGB(50, 50, 100) },
	{ id: "candy", name: "Candy Land", emoji: "🍭", color: Color3.fromRGB(255, 150, 200) },
	{ id: "ice", name: "Ice Kingdom", emoji: "❄️", color: Color3.fromRGB(150, 200, 255) },
	{ id: "rainbow", name: "Rainbow Clouds", emoji: "🌈", color: Color3.fromRGB(255, 200, 255) },
];
