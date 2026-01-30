// Retention Psychology - Variable rewards, loss aversion, social proof
// Psychological patterns that keep players engaged

export interface VariableReward {
	id: string;
	name: string;
	weights: { item: string; weight: number; rarity: string }[];
}

export interface StreakBonus {
	day: number;
	multiplier: number;
	bonusReward?: string;
}

export interface SocialProof {
	type: "purchase" | "achievement" | "drop" | "level";
	message: string;
	count: number;
	timeWindowHours: number;
}

// Variable Reward System (better than fixed rewards)
export function rollVariableReward(reward: VariableReward): { item: string; rarity: string } {
	let totalWeight = 0;
	for (const option of reward.weights) {
		totalWeight += option.weight;
	}
	
	const roll = math.random(1, totalWeight);
	let cumulative = 0;
	
	for (const option of reward.weights) {
		cumulative += option.weight;
		if (roll <= cumulative) {
			return { item: option.item, rarity: option.rarity };
		}
	}
	
	return { item: reward.weights[0].item, rarity: reward.weights[0].rarity };
}

// Sample loot tables
export const LOOT_TABLES: Record<string, VariableReward> = {
	daily_box: {
		id: "daily_box",
		name: "Daily Mystery Box",
		weights: [
			{ item: "coins_100", weight: 40, rarity: "common" },
			{ item: "coins_500", weight: 25, rarity: "uncommon" },
			{ item: "gems_10", weight: 20, rarity: "rare" },
			{ item: "rare_egg", weight: 10, rarity: "epic" },
			{ item: "legendary_pet", weight: 4, rarity: "legendary" },
			{ item: "mythic_pet", weight: 1, rarity: "mythic" },
		],
	},
	boss_drop: {
		id: "boss_drop",
		name: "Boss Loot",
		weights: [
			{ item: "coins_1000", weight: 30, rarity: "common" },
			{ item: "gems_50", weight: 25, rarity: "uncommon" },
			{ item: "epic_egg", weight: 20, rarity: "rare" },
			{ item: "legendary_egg", weight: 15, rarity: "epic" },
			{ item: "exclusive_pet", weight: 8, rarity: "legendary" },
			{ item: "mythic_weapon", weight: 2, rarity: "mythic" },
		],
	},
};

// Streak Bonuses (loss aversion)
export const STREAK_BONUSES: StreakBonus[] = [
	{ day: 1, multiplier: 1.0 },
	{ day: 2, multiplier: 1.25 },
	{ day: 3, multiplier: 1.5 },
	{ day: 4, multiplier: 1.75 },
	{ day: 5, multiplier: 2.0, bonusReward: "rare_egg" },
	{ day: 6, multiplier: 2.25 },
	{ day: 7, multiplier: 3.0, bonusReward: "legendary_egg" },
	{ day: 14, multiplier: 4.0, bonusReward: "mythic_egg" },
	{ day: 30, multiplier: 5.0, bonusReward: "exclusive_pet" },
];

export function getStreakBonus(consecutiveDays: number): StreakBonus {
	// Find the highest applicable bonus
	let best = STREAK_BONUSES[0];
	for (const bonus of STREAK_BONUSES) {
		if (consecutiveDays >= bonus.day) {
			best = bonus;
		}
	}
	return best;
}

export function formatStreakWarning(hoursUntilReset: number): string {
	if (hoursUntilReset <= 2) {
		return `⚠️ Your ${hoursUntilReset}h left to keep your streak!`;
	}
	if (hoursUntilReset <= 6) {
		return `🔥 ${hoursUntilReset}h until streak reset!`;
	}
	return "";
}

// Social Proof Messages
export function formatSocialProof(proof: SocialProof): string {
	switch (proof.type) {
		case "purchase":
			return `🛒 ${proof.count} players bought this today!`;
		case "achievement":
			return `🏆 ${proof.count} players unlocked this!`;
		case "drop":
			return `✨ ${proof.count} players got this drop today!`;
		case "level":
			return `📈 ${proof.count} players reached this level!`;
	}
}

// Scarcity Messages
export function formatScarcity(remaining: number, total: number): string {
	const percent = (remaining / total) * 100;
	
	if (remaining <= 10) {
		return `🔥 Only ${remaining} left!`;
	}
	if (percent <= 20) {
		return `⚡ ${math.floor(percent)}% remaining!`;
	}
	return "";
}

// Sunk Cost Display
export function formatSunkCost(totalPlaytime: number, totalSpent: number, achievements: number): string[] {
	const hours = math.floor(totalPlaytime / 3600);
	const messages: string[] = [];
	
	if (hours > 0) {
		messages.push(`⏱️ ${hours} hours played`);
	}
	if (totalSpent > 0) {
		messages.push(`💎 ${totalSpent} gems invested`);
	}
	if (achievements > 0) {
		messages.push(`🏆 ${achievements} achievements earned`);
	}
	
	return messages;
}

// Comeback Bonus (for lapsed players)
export function getComebBackBonus(daysSinceLastPlay: number): { multiplier: number; message: string } | undefined {
	if (daysSinceLastPlay >= 30) {
		return { multiplier: 5, message: "🎉 WELCOME BACK! 5x rewards for returning!" };
	}
	if (daysSinceLastPlay >= 14) {
		return { multiplier: 3, message: "🎁 We missed you! 3x rewards today!" };
	}
	if (daysSinceLastPlay >= 7) {
		return { multiplier: 2, message: "👋 Welcome back! 2x rewards!" };
	}
	return undefined;
}
