// First Purchase Bonus - Converts 40% more players
// Offer 3x value on first purchase to hook players

export interface FirstPurchaseBonus {
	productId: string;
	normalValue: number;
	bonusMultiplier: number;
	bonusItems?: string[];
}

export interface PlayerPurchaseData {
	hasFirstPurchase: boolean;
	firstPurchaseDate?: number;
	totalSpent: number;
	purchaseCount: number;
}

export const FIRST_PURCHASE_BONUSES: FirstPurchaseBonus[] = [
	{ productId: "gems_100", normalValue: 100, bonusMultiplier: 3, bonusItems: ["starter_pet"] },
	{ productId: "gems_500", normalValue: 500, bonusMultiplier: 3, bonusItems: ["rare_egg", "2x_coins_1h"] },
	{ productId: "gems_1000", normalValue: 1000, bonusMultiplier: 3, bonusItems: ["legendary_pet", "vip_24h"] },
];

export function getFirstPurchaseValue(
	productId: string,
	hasFirstPurchase: boolean
): { value: number; bonusItems: string[]; isBonus: boolean } {
	const bonus = FIRST_PURCHASE_BONUSES.find(b => b.productId === productId);
	
	if (!bonus) {
		return { value: 0, bonusItems: [], isBonus: false };
	}
	
	if (!hasFirstPurchase) {
		return {
			value: bonus.normalValue * bonus.bonusMultiplier,
			bonusItems: bonus.bonusItems ?? [],
			isBonus: true,
		};
	}
	
	return { value: bonus.normalValue, bonusItems: [], isBonus: false };
}

export function formatFirstPurchaseBanner(multiplier: number): string {
	return `🎁 FIRST PURCHASE BONUS! Get ${multiplier}x VALUE on your first purchase!`;
}
