// Battle Pass System - Tiered progression rewards
// Core gamification feature for engagement

export interface BattlePassTier {
	level: number;
	xpRequired: number;
	freeReward: Reward;
	premiumReward?: Reward;
}

export interface Reward {
	type: "coins" | "gems" | "pet" | "egg" | "cosmetic" | "multiplier";
	amount?: number;
	itemId?: string;
	duration?: number; // For temporary rewards
}

export interface BattlePassConfig {
	seasonName: string;
	seasonNumber: number;
	startDate: number;
	endDate: number;
	totalTiers: number;
	xpPerAction: {
		coinCollect: number;
		questComplete: number;
		dailyLogin: number;
		eggHatch: number;
		battleWin: number;
		minigamePlay: number;
	};
	tiers: BattlePassTier[];
}

export interface PlayerBattlePassData {
	currentTier: number;
	currentXP: number;
	totalXP: number;
	claimedFreeTiers: number[];
	claimedPremiumTiers: number[];
	hasPremiumPass: boolean;
}

// Default 50-tier Battle Pass
export function generateDefaultTiers(): BattlePassTier[] {
	const tiers: BattlePassTier[] = [];
	
	for (let i = 1; i <= 50; i++) {
		const xpRequired = i * 100 + (i > 25 ? (i - 25) * 50 : 0);
		
		tiers.push({
			level: i,
			xpRequired,
			freeReward: getFreeReward(i),
			premiumReward: getPremiumReward(i),
		});
	}
	
	return tiers;
}

function getFreeReward(tier: number): Reward {
	// Every 5 tiers = better reward
	if (tier % 10 === 0) {
		return { type: "egg", itemId: "rare_egg" };
	} else if (tier % 5 === 0) {
		return { type: "gems", amount: 10 };
	} else {
		return { type: "coins", amount: tier * 50 };
	}
}

function getPremiumReward(tier: number): Reward {
	// Premium rewards are better
	if (tier === 50) {
		return { type: "pet", itemId: "exclusive_pet" };
	} else if (tier % 10 === 0) {
		return { type: "pet", itemId: `tier${tier}_pet` };
	} else if (tier % 5 === 0) {
		return { type: "multiplier", amount: 2, duration: 3600 };
	} else {
		return { type: "gems", amount: tier * 2 };
	}
}

export const DEFAULT_BATTLE_PASS_CONFIG: BattlePassConfig = {
	seasonName: "Season 1: Origins",
	seasonNumber: 1,
	startDate: os.time(),
	endDate: os.time() + 30 * 24 * 60 * 60, // 30 days
	totalTiers: 50,
	xpPerAction: {
		coinCollect: 1,
		questComplete: 50,
		dailyLogin: 100,
		eggHatch: 25,
		battleWin: 30,
		minigamePlay: 20,
	},
	tiers: generateDefaultTiers(),
};

export function calculateTierFromXP(totalXP: number, tiers: BattlePassTier[]): number {
	let accumulatedXP = 0;
	for (const tier of tiers) {
		accumulatedXP += tier.xpRequired;
		if (totalXP < accumulatedXP) {
			return tier.level - 1;
		}
	}
	return tiers.size();
}

export function getXPForNextTier(currentTier: number, currentXP: number, tiers: BattlePassTier[]): { needed: number; progress: number } {
	if (currentTier >= tiers.size()) {
		return { needed: 0, progress: 100 };
	}
	
	const nextTier = tiers[currentTier];
	const needed = nextTier.xpRequired;
	const progress = math.floor((currentXP / needed) * 100);
	
	return { needed, progress };
}
