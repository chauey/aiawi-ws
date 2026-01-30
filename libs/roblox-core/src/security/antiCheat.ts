// Anti-Cheat Validation - Never trust client
// Server-side validation for all critical actions

export type ValidationResult = { valid: true } | { valid: false; reason: string };

export interface RateLimitConfig {
	maxActions: number;
	windowSeconds: number;
}

// Rate limiting per player per action type
const playerActionLog = new Map<string, number[]>();

export function checkRateLimit(
	playerId: number,
	actionType: string,
	config: RateLimitConfig
): ValidationResult {
	const key = `${playerId}_${actionType}`;
	const now = os.time();
	const windowStart = now - config.windowSeconds;
	
	// Get or create action log
	let actions = playerActionLog.get(key) ?? [];
	
	// Filter to only actions in window
	actions = actions.filter(t => t > windowStart);
	
	// Check limit
	if (actions.size() >= config.maxActions) {
		return { valid: false, reason: `Rate limited: max ${config.maxActions} per ${config.windowSeconds}s` };
	}
	
	// Log this action
	actions.push(now);
	playerActionLog.set(key, actions);
	
	return { valid: true };
}

// Currency validation
export function validateCurrencyTransaction(
	currentBalance: number,
	amount: number,
	isSpend: boolean
): ValidationResult {
	if (amount <= 0) {
		return { valid: false, reason: "Invalid amount: must be positive" };
	}
	
	if (amount > 1000000000) {
		return { valid: false, reason: "Invalid amount: exceeds maximum" };
	}
	
	if (isSpend && currentBalance < amount) {
		return { valid: false, reason: "Insufficient balance" };
	}
	
	return { valid: true };
}

// Item ownership validation
export function validateItemOwnership(
	playerItems: string[],
	requiredItem: string
): ValidationResult {
	if (!playerItems.includes(requiredItem)) {
		return { valid: false, reason: "Player doesn't own this item" };
	}
	return { valid: true };
}

// Trade validation
export function validateTrade(
	senderItems: string[],
	receiverItems: string[],
	senderOffering: string[],
	receiverOffering: string[]
): ValidationResult {
	// Check sender has items
	for (const item of senderOffering) {
		if (!senderItems.includes(item)) {
			return { valid: false, reason: `Sender doesn't own: ${item}` };
		}
	}
	
	// Check receiver has items
	for (const item of receiverOffering) {
		if (!receiverItems.includes(item)) {
			return { valid: false, reason: `Receiver doesn't own: ${item}` };
		}
	}
	
	// Check for duplicates
	const senderSet = new Set(senderOffering);
	if (senderSet.size !== senderOffering.size()) {
		return { valid: false, reason: "Duplicate items in offer" };
	}
	
	return { valid: true };
}

// Speed/teleport detection
export function validateMovement(
	lastPosition: Vector3,
	currentPosition: Vector3,
	deltaTime: number,
	maxSpeed: number
): ValidationResult {
	const distance = currentPosition.sub(lastPosition).Magnitude;
	const speed = distance / deltaTime;
	
	// Allow some tolerance for lag
	const tolerance = 1.5;
	if (speed > maxSpeed * tolerance) {
		return { valid: false, reason: `Speed violation: ${math.floor(speed)} > ${maxSpeed}` };
	}
	
	return { valid: true };
}

// Value sanity check
export function validateValue(value: number, min: number, max: number, name: string): ValidationResult {
	if (value < min || value > max) {
		return { valid: false, reason: `${name} out of range: ${value} (${min}-${max})` };
	}
	return { valid: true };
}

// Pre-configured rate limits
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
	coinCollect: { maxActions: 60, windowSeconds: 10 },
	eggHatch: { maxActions: 10, windowSeconds: 60 },
	trade: { maxActions: 5, windowSeconds: 60 },
	chat: { maxActions: 10, windowSeconds: 10 },
	purchase: { maxActions: 20, windowSeconds: 60 },
	skillUse: { maxActions: 30, windowSeconds: 10 },
};

export function isRateLimited(playerId: number, action: keyof typeof RATE_LIMITS): boolean {
	const config = RATE_LIMITS[action];
	const result = checkRateLimit(playerId, action, config);
	return !result.valid;
}
