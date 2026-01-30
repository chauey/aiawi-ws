// Analytics System - Track EVERYTHING
// Essential for optimization and understanding players

export type EventCategory = 
	| "session" 
	| "economy" 
	| "progression" 
	| "social" 
	| "monetization" 
	| "gameplay" 
	| "ui" 
	| "error";

export interface AnalyticsEvent {
	eventName: string;
	category: EventCategory;
	playerId: number;
	timestamp: number;
	sessionId: string;
	properties: Record<string, string | number | boolean>;
}

export interface PlayerMetrics {
	// Session
	sessionCount: number;
	totalPlaytime: number;
	lastSessionDate: number;
	averageSessionLength: number;
	
	// Retention
	daysPlayed: number;
	consecutiveDays: number;
	churnRisk: "low" | "medium" | "high";
	
	// Economy
	totalCoinsEarned: number;
	totalCoinsSpent: number;
	totalGemsEarned: number;
	totalGemsSpent: number;
	
	// Monetization
	totalRobuxSpent: number;
	purchaseCount: number;
	isWhale: boolean;
	isDolphin: boolean;
	isMinnow: boolean;
	
	// Progression
	level: number;
	rebirths: number;
	petsOwned: number;
	achievementsUnlocked: number;
}

// Event queue for batching
const eventQueue: AnalyticsEvent[] = [];
let currentSessionId = "";

export function initSession(playerId: number): string {
	currentSessionId = `${playerId}_${os.time()}_${math.random(1000, 9999)}`;
	trackEvent("session_start", "session", playerId, {});
	return currentSessionId;
}

export function endSession(playerId: number, playtime: number) {
	trackEvent("session_end", "session", playerId, { playtime });
}

export function trackEvent(
	eventName: string,
	category: EventCategory,
	playerId: number,
	properties: Record<string, string | number | boolean>
) {
	const event: AnalyticsEvent = {
		eventName,
		category,
		playerId,
		timestamp: os.time(),
		sessionId: currentSessionId,
		properties,
	};
	
	eventQueue.push(event);
	
	// Log for debugging
	print(`📊 [Analytics] ${category}/${eventName}: ${playerId}`);
}

// Pre-defined tracking helpers
export function trackPurchase(playerId: number, productId: string, price: number, currency: string) {
	trackEvent("purchase", "monetization", playerId, { productId, price, currency });
}

export function trackLevelUp(playerId: number, newLevel: number, timeToLevel: number) {
	trackEvent("level_up", "progression", playerId, { newLevel, timeToLevel });
}

export function trackCurrencyEarned(playerId: number, currency: string, amount: number, source: string) {
	trackEvent("currency_earned", "economy", playerId, { currency, amount, source });
}

export function trackCurrencySpent(playerId: number, currency: string, amount: number, item: string) {
	trackEvent("currency_spent", "economy", playerId, { currency, amount, item });
}

export function trackUIAction(playerId: number, uiElement: string, action: string) {
	trackEvent("ui_action", "ui", playerId, { uiElement, action });
}

export function trackError(playerId: number, errorType: string, errorMessage: string, context: string) {
	trackEvent("error", "error", playerId, { errorType, errorMessage, context });
}

// Whale classification (based on total Robux spent)
export function classifyPlayer(totalRobuxSpent: number): { isWhale: boolean; isDolphin: boolean; isMinnow: boolean } {
	return {
		isWhale: totalRobuxSpent >= 10000, // $100+
		isDolphin: totalRobuxSpent >= 1000 && totalRobuxSpent < 10000, // $10-$100
		isMinnow: totalRobuxSpent > 0 && totalRobuxSpent < 1000, // $0-$10
	};
}

// Churn risk calculation
export function calculateChurnRisk(
	daysSinceLastPlay: number,
	totalPlaytime: number,
	purchaseCount: number
): "low" | "medium" | "high" {
	if (daysSinceLastPlay > 14) return "high";
	if (daysSinceLastPlay > 7 && purchaseCount === 0) return "high";
	if (daysSinceLastPlay > 3 && totalPlaytime < 3600) return "medium";
	if (daysSinceLastPlay > 7) return "medium";
	return "low";
}

// Flush events (call periodically or on session end)
export function flushEvents(): AnalyticsEvent[] {
	const events = [...eventQueue];
	eventQueue.length = 0;
	return events;
}
