// Limited-Time Items - FOMO drives 3-5x purchases
// Create urgency with expiring offers

export interface LimitedTimeOffer {
	id: string;
	name: string;
	description: string;
	icon: string;
	
	// Timing
	startTime: number;
	endTime: number;
	
	// Pricing
	originalPrice: number;
	salePrice: number;
	currency: "coins" | "gems" | "robux";
	
	// Limits
	maxPurchases?: number; // Per player
	globalLimit?: number; // Total available
	
	// Rewards
	rewards: {
		type: "pet" | "egg" | "coins" | "gems" | "multiplier" | "cosmetic";
		itemId?: string;
		amount?: number;
		duration?: number;
	}[];
	
	// Display
	rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
	featured?: boolean;
}

export interface LimitedItemPurchaseLog {
	offerId: string;
	playerId: number;
	purchaseTime: number;
	pricePaid: number;
}

// Calculate time remaining
export function getTimeRemaining(endTime: number): { hours: number; minutes: number; seconds: number; expired: boolean } {
	const now = os.time();
	const remaining = endTime - now;
	
	if (remaining <= 0) {
		return { hours: 0, minutes: 0, seconds: 0, expired: true };
	}
	
	const hours = math.floor(remaining / 3600);
	const minutes = math.floor((remaining % 3600) / 60);
	const seconds = remaining % 60;
	
	return { hours, minutes, seconds, expired: false };
}

export function formatTimeRemaining(endTime: number): string {
	const { hours, minutes, seconds, expired } = getTimeRemaining(endTime);
	
	if (expired) return "EXPIRED";
	if (hours > 24) return `${math.floor(hours / 24)}d ${hours % 24}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	if (minutes > 0) return `${minutes}m ${seconds}s`;
	return `${seconds}s`;
}

export function getDiscountPercent(original: number, sale: number): number {
	return math.floor(((original - sale) / original) * 100);
}

export function isOfferActive(offer: LimitedTimeOffer): boolean {
	const now = os.time();
	return now >= offer.startTime && now <= offer.endTime;
}

// Sample offers generator
export function generateDailyOffer(day: number): LimitedTimeOffer {
	const rarities: LimitedTimeOffer["rarity"][] = ["rare", "epic", "legendary"];
	const rarity = rarities[day % 3];
	
	return {
		id: `daily_${day}`,
		name: `Daily Special #${day}`,
		description: "Limited time offer - don't miss out!",
		icon: "🎁",
		startTime: os.time(),
		endTime: os.time() + 24 * 3600, // 24 hours
		originalPrice: 500,
		salePrice: 199,
		currency: "gems",
		maxPurchases: 1,
		rewards: [
			{ type: "gems", amount: 300 },
			{ type: "egg", itemId: `${rarity}_egg` },
		],
		rarity,
		featured: true,
	};
}
