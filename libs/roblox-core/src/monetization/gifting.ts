// Gifting System - Social spending = 2x revenue
// Let players gift items to friends

export interface GiftableItem {
	id: string;
	name: string;
	icon: string;
	price: number;
	currency: "coins" | "gems" | "robux";
	category: "pet" | "egg" | "boost" | "cosmetic" | "currency";
}

export interface GiftTransaction {
	id: string;
	senderId: number;
	senderName: string;
	receiverId: number;
	receiverName: string;
	itemId: string;
	itemName: string;
	price: number;
	currency: string;
	timestamp: number;
	message?: string;
}

export interface GiftSettings {
	enabled: boolean;
	minAccountAge: number; // Days
	maxGiftsPerDay: number;
	cooldownSeconds: number;
	allowedCategories: string[];
}

export const DEFAULT_GIFT_SETTINGS: GiftSettings = {
	enabled: true,
	minAccountAge: 3, // 3 days old account
	maxGiftsPerDay: 10,
	cooldownSeconds: 60,
	allowedCategories: ["pet", "egg", "boost", "cosmetic"],
};

export function canSendGift(
	senderAccountAge: number,
	giftsSentToday: number,
	lastGiftTime: number,
	settings: GiftSettings
): { allowed: boolean; reason?: string } {
	if (!settings.enabled) {
		return { allowed: false, reason: "Gifting is currently disabled" };
	}
	
	if (senderAccountAge < settings.minAccountAge) {
		return { allowed: false, reason: `Account must be ${settings.minAccountAge}+ days old` };
	}
	
	if (giftsSentToday >= settings.maxGiftsPerDay) {
		return { allowed: false, reason: `Max ${settings.maxGiftsPerDay} gifts per day` };
	}
	
	const cooldownRemaining = (lastGiftTime + settings.cooldownSeconds) - os.time();
	if (cooldownRemaining > 0) {
		return { allowed: false, reason: `Wait ${cooldownRemaining}s before sending another gift` };
	}
	
	return { allowed: true };
}

export function formatGiftNotification(senderName: string, itemName: string, message?: string): string {
	let notification = `🎁 ${senderName} sent you a gift: ${itemName}!`;
	if (message) {
		notification += `\n"${message}"`;
	}
	return notification;
}

export function generateGiftId(): string {
	return `gift_${os.time()}_${math.random(1000, 9999)}`;
}
