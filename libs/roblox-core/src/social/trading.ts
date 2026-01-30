// Trading Market - Players become investors
// Full trading system with price history

export type TradeStatus = "pending" | "accepted" | "declined" | "cancelled" | "expired";

export interface TradeItem {
	itemId: string;
	itemName: string;
	rarity: string;
	quantity: number;
	estimatedValue: number;
}

export interface TradeOffer {
	id: string;
	createdAt: number;
	expiresAt: number;
	
	// Participants
	senderId: number;
	senderName: string;
	receiverId: number;
	receiverName: string;
	
	// Items
	senderItems: TradeItem[];
	receiverItems: TradeItem[];
	
	// Currency (optional)
	senderCoins: number;
	senderGems: number;
	receiverCoins: number;
	receiverGems: number;
	
	// Status
	status: TradeStatus;
	statusMessage?: string;
}

export interface ItemPriceHistory {
	itemId: string;
	prices: { timestamp: number; price: number; volume: number }[];
	currentPrice: number;
	priceChange24h: number;
	allTimeHigh: number;
	allTimeLow: number;
}

export interface TradeSettings {
	enabled: boolean;
	minAccountAgeDays: number;
	maxActiveOffers: number;
	offerExpirationHours: number;
	cooldownSeconds: number;
	taxPercent: number; // Tax on trades
}

export const DEFAULT_TRADE_SETTINGS: TradeSettings = {
	enabled: true,
	minAccountAgeDays: 7,
	maxActiveOffers: 10,
	offerExpirationHours: 24,
	cooldownSeconds: 30,
	taxPercent: 5, // 5% trade tax
};

// Calculate trade value
export function calculateTradeValue(items: TradeItem[], coins: number, gems: number): number {
	let value = coins + gems * 10; // 1 gem = 10 coins
	for (const item of items) {
		value += item.estimatedValue * item.quantity;
	}
	return value;
}

// Check if trade is fair (within tolerance)
export function isTradeFair(offer: TradeOffer, tolerancePercent: number = 50): { fair: boolean; difference: number } {
	const senderValue = calculateTradeValue(offer.senderItems, offer.senderCoins, offer.senderGems);
	const receiverValue = calculateTradeValue(offer.receiverItems, offer.receiverCoins, offer.receiverGems);
	
	const difference = math.abs(senderValue - receiverValue);
	const maxDifference = math.max(senderValue, receiverValue) * (tolerancePercent / 100);
	
	return {
		fair: difference <= maxDifference,
		difference,
	};
}

// Generate trade ID
export function generateTradeId(senderId: number, receiverId: number): string {
	return `trade_${senderId}_${receiverId}_${os.time()}_${math.random(1000, 9999)}`;
}

// Create new trade offer
export function createTradeOffer(
	senderId: number,
	senderName: string,
	receiverId: number,
	receiverName: string,
	settings: TradeSettings
): TradeOffer {
	return {
		id: generateTradeId(senderId, receiverId),
		createdAt: os.time(),
		expiresAt: os.time() + settings.offerExpirationHours * 3600,
		senderId,
		senderName,
		receiverId,
		receiverName,
		senderItems: [],
		receiverItems: [],
		senderCoins: 0,
		senderGems: 0,
		receiverCoins: 0,
		receiverGems: 0,
		status: "pending",
	};
}

// Format trade notification
export function formatTradeNotification(trade: TradeOffer, forReceiver: boolean): string {
	const otherName = forReceiver ? trade.senderName : trade.receiverName;
	const itemCount = forReceiver ? trade.senderItems.size() : trade.receiverItems.size();
	
	switch (trade.status) {
		case "pending":
			return `📦 ${otherName} wants to trade ${itemCount} items!`;
		case "accepted":
			return `✅ Trade with ${otherName} completed!`;
		case "declined":
			return `❌ ${otherName} declined your trade`;
		case "cancelled":
			return `🚫 Trade with ${otherName} cancelled`;
		case "expired":
			return `⏰ Trade with ${otherName} expired`;
	}
}

// Price trend analysis
export function getPriceTrend(history: ItemPriceHistory): "rising" | "falling" | "stable" {
	if (history.priceChange24h > 10) return "rising";
	if (history.priceChange24h < -10) return "falling";
	return "stable";
}

export function formatPriceChange(change: number): string {
	if (change > 0) return `📈 +${change}%`;
	if (change < 0) return `📉 ${change}%`;
	return "➡️ 0%";
}
