// Referral System - Invite friends for rewards

export interface ReferralConfig {
	rewardPerReferral: {
		referrer: { coins: number; gems: number };
		referee: { coins: number; gems: number };
	};
	maxReferrals: number;
	referralBonusTiers: { count: number; bonus: { type: string; amount: number } }[];
}

export interface PlayerReferralData {
	referralCode: string;
	referredBy?: string;
	referralCount: number;
	referredPlayers: number[];
	claimedBonuses: number[];
}

export const DEFAULT_REFERRAL_CONFIG: ReferralConfig = {
	rewardPerReferral: {
		referrer: { coins: 500, gems: 5 },
		referee: { coins: 200, gems: 2 },
	},
	maxReferrals: 50,
	referralBonusTiers: [
		{ count: 5, bonus: { type: "gems", amount: 25 } },
		{ count: 10, bonus: { type: "egg", amount: 1 } },
		{ count: 25, bonus: { type: "pet", amount: 1 } },
		{ count: 50, bonus: { type: "exclusive", amount: 1 } },
	],
};

export function generateReferralCode(userId: number): string {
	// Generate unique code from userId
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	let num = userId;
	
	for (let i = 0; i < 6; i++) {
		code += chars[num % chars.size()];
		num = math.floor(num / chars.size());
	}
	
	return code;
}

export function getReferralMilestoneReward(
	count: number,
	config: ReferralConfig
): { type: string; amount: number } | undefined {
	for (const tier of config.referralBonusTiers) {
		if (count === tier.count) {
			return tier.bonus;
		}
	}
	return undefined;
}
