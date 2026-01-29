// Economy Types - Shared across all Roblox games

export interface Currency {
	name: string;
	icon: string;
	color: Color3;
}

export interface EconomySettings {
	currencies: {
		primary: Currency;
		secondary?: Currency;
	};
	startingBalance: {
		primary: number;
		secondary: number;
	};
	earnMultiplier: number;
	priceMultiplier: number;
}

export const DEFAULT_CURRENCIES = {
	coins: {
		name: "Coins",
		icon: "🪙",
		color: Color3.fromRGB(255, 215, 0),
	},
	gems: {
		name: "Gems",
		icon: "💎",
		color: Color3.fromRGB(100, 200, 255),
	},
};
