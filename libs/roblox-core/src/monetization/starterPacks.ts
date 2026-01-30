// Starter Pack - 80% of whale revenue starts here
// Best value pack to convert free players

export interface StarterPack {
	id: string;
	name: string;
	description: string;
	robuxPrice: number;
	
	// Contents
	gems: number;
	coins: number;
	pets: string[];
	eggs: string[];
	boosts: { type: string; duration: number }[];
	cosmetics: string[];
	
	// Display
	valueMultiplier: number; // "10x VALUE!"
	iconAssetId?: string;
	
	// Availability
	oneTimePurchase: boolean;
	availableUntilLevel?: number; // Only show to new players
}

export const STARTER_PACKS: StarterPack[] = [
	{
		id: "starter_basic",
		name: "Starter Pack",
		description: "Perfect for beginners!",
		robuxPrice: 99, // ~$1
		gems: 500,
		coins: 5000,
		pets: ["starter_dog"],
		eggs: ["rare_egg"],
		boosts: [{ type: "2x_coins", duration: 3600 }],
		cosmetics: [],
		valueMultiplier: 5,
		oneTimePurchase: true,
		availableUntilLevel: 10,
	},
	{
		id: "starter_pro",
		name: "Pro Starter Pack",
		description: "Best value for new players!",
		robuxPrice: 399, // ~$5
		gems: 3000,
		coins: 25000,
		pets: ["epic_dragon", "rare_unicorn"],
		eggs: ["legendary_egg", "legendary_egg"],
		boosts: [
			{ type: "2x_coins", duration: 7200 },
			{ type: "2x_luck", duration: 7200 },
		],
		cosmetics: ["golden_trail"],
		valueMultiplier: 10,
		oneTimePurchase: true,
		availableUntilLevel: 20,
	},
	{
		id: "starter_ultimate",
		name: "Ultimate Starter Pack",
		description: "Everything you need to dominate!",
		robuxPrice: 799, // ~$10
		gems: 8000,
		coins: 100000,
		pets: ["mythic_phoenix", "legendary_dragon", "epic_unicorn"],
		eggs: ["mythic_egg", "mythic_egg", "legendary_egg"],
		boosts: [
			{ type: "3x_coins", duration: 14400 },
			{ type: "2x_luck", duration: 14400 },
			{ type: "auto_collect", duration: 14400 },
		],
		cosmetics: ["diamond_trail", "legendary_aura"],
		valueMultiplier: 15,
		oneTimePurchase: true,
		availableUntilLevel: 30,
	},
];

export function getAvailableStarterPacks(
	playerLevel: number,
	purchasedPacks: string[]
): StarterPack[] {
	return STARTER_PACKS.filter(pack => {
		// Check if already purchased (one-time only)
		if (pack.oneTimePurchase && purchasedPacks.includes(pack.id)) {
			return false;
		}
		// Check level requirement
		if (pack.availableUntilLevel && playerLevel > pack.availableUntilLevel) {
			return false;
		}
		return true;
	});
}

export function formatStarterPackBanner(pack: StarterPack): string {
	return `🌟 ${pack.valueMultiplier}x VALUE! ${pack.name} - Only R$${pack.robuxPrice}!`;
}
