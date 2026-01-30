-- Compiled with roblox-ts v3.0.0
-- Dragon Legends Theme Configuration
-- All visual theming for the Dragon game
local GAME_THEME = {
	name = "Dragon Legends",
	emoji = "🐉",
	currency = "Dragon Coins",
	currencyEmoji = "💎",
	secondaryCurrency = "Dragon Gems",
	secondaryCurrencyEmoji = "✨",
	primary = Color3.fromRGB(255, 100, 50),
	secondary = Color3.fromRGB(100, 150, 255),
	accent = Color3.fromRGB(180, 100, 255),
	background = Color3.fromRGB(20, 15, 30),
	success = Color3.fromRGB(80, 200, 80),
	error = Color3.fromRGB(200, 60, 60),
	gold = Color3.fromRGB(255, 215, 0),
	elements = {
		fire = Color3.fromRGB(255, 100, 50),
		water = Color3.fromRGB(50, 150, 255),
		ice = Color3.fromRGB(150, 220, 255),
		electric = Color3.fromRGB(255, 255, 100),
		nature = Color3.fromRGB(100, 200, 100),
		shadow = Color3.fromRGB(80, 50, 100),
		light = Color3.fromRGB(255, 255, 200),
	},
}
-- Element type advantages (Fire > Ice > Electric > Water > Fire)
local ELEMENT_ADVANTAGES = {
	fire = { "ice", "nature" },
	water = { "fire" },
	ice = { "electric", "water" },
	electric = { "water" },
	nature = { "water", "electric" },
	shadow = { "light" },
	light = { "shadow" },
}
-- Dragon emojis by element
local DRAGON_EMOJIS = {
	fire_drake = "🔥",
	water_wyrm = "💧",
	earth_turtle = "🐢",
	wind_serpent = "🌪️",
	thunder_dragon = "⚡",
	frost_drake = "❄️",
	shadow_serpent = "🌑",
	crystal_dragon = "💎",
	solar_phoenix = "☀️",
	storm_king = "🌩️",
	cosmic_dragon = "🌌",
	void_dragon = "🕳️",
	rainbow_dragon = "🌈",
	galaxy_serpent = "🌠",
	time_dragon = "⏰",
	chaos_lord = "💀",
}
-- Region themes
local REGION_THEMES = { {
	id = "starter_meadow",
	name = "Starter Meadow",
	emoji = "🌿",
	color = Color3.fromRGB(100, 200, 100),
	unlockCost = 0,
}, {
	id = "mystic_forest",
	name = "Mystic Forest",
	emoji = "🌲",
	color = Color3.fromRGB(50, 100, 50),
	unlockCost = 500,
}, {
	id = "volcanic_peaks",
	name = "Volcanic Peaks",
	emoji = "🌋",
	color = Color3.fromRGB(255, 100, 50),
	unlockCost = 2000,
}, {
	id = "frozen_tundra",
	name = "Frozen Tundra",
	emoji = "❄️",
	color = Color3.fromRGB(150, 200, 255),
	unlockCost = 5000,
}, {
	id = "storm_islands",
	name = "Storm Islands",
	emoji = "⛈️",
	color = Color3.fromRGB(100, 100, 150),
	unlockCost = 10000,
}, {
	id = "crystal_caverns",
	name = "Crystal Caverns",
	emoji = "💎",
	color = Color3.fromRGB(200, 100, 255),
	unlockCost = 25000,
}, {
	id = "shadow_realm",
	name = "Shadow Realm",
	emoji = "🌑",
	color = Color3.fromRGB(50, 30, 70),
	unlockCost = 50000,
}, {
	id = "celestial_sanctum",
	name = "Celestial Sanctum",
	emoji = "✨",
	color = Color3.fromRGB(255, 220, 150),
	unlockCost = 100000,
} }
return {
	GAME_THEME = GAME_THEME,
	ELEMENT_ADVANTAGES = ELEMENT_ADVANTAGES,
	DRAGON_EMOJIS = DRAGON_EMOJIS,
	REGION_THEMES = REGION_THEMES,
}
