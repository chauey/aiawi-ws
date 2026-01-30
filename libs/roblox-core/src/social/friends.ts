// Social Features - Friends, invites, co-op
// Social = retention + viral growth

export interface FriendData {
	playerId: number;
	displayName: string;
	status: "online" | "offline" | "in_game";
	lastSeen: number;
	friendSince: number;
	gamesPlayedTogether: number;
}

export interface PartyData {
	id: string;
	leaderId: number;
	members: number[];
	maxSize: number;
	createdAt: number;
	status: "forming" | "in_game" | "disbanded";
}

export interface CoopBonus {
	partySize: number;
	coinMultiplier: number;
	xpMultiplier: number;
	dropRateBonus: number;
}

// Co-op bonuses scale with party size
export const COOP_BONUSES: CoopBonus[] = [
	{ partySize: 1, coinMultiplier: 1.0, xpMultiplier: 1.0, dropRateBonus: 0 },
	{ partySize: 2, coinMultiplier: 1.25, xpMultiplier: 1.25, dropRateBonus: 5 },
	{ partySize: 3, coinMultiplier: 1.5, xpMultiplier: 1.5, dropRateBonus: 10 },
	{ partySize: 4, coinMultiplier: 1.75, xpMultiplier: 1.75, dropRateBonus: 15 },
	{ partySize: 5, coinMultiplier: 2.0, xpMultiplier: 2.0, dropRateBonus: 20 },
];

export function getCoopBonus(partySize: number): CoopBonus {
	for (let i = COOP_BONUSES.size() - 1; i >= 0; i--) {
		if (partySize >= COOP_BONUSES[i].partySize) {
			return COOP_BONUSES[i];
		}
	}
	return COOP_BONUSES[0];
}

// Friend activity messages
export function formatFriendActivity(friend: FriendData): string {
	if (friend.status === "online") {
		return `🟢 ${friend.displayName} is online!`;
	}
	if (friend.status === "in_game") {
		return `🎮 ${friend.displayName} is playing!`;
	}
	
	const hoursSince = math.floor((os.time() - friend.lastSeen) / 3600);
	if (hoursSince < 1) {
		return `⚪ ${friend.displayName} was online recently`;
	}
	if (hoursSince < 24) {
		return `⚪ ${friend.displayName} - ${hoursSince}h ago`;
	}
	const days = math.floor(hoursSince / 24);
	return `⚪ ${friend.displayName} - ${days}d ago`;
}

// Invite link generation
export function generateInviteCode(playerId: number): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	let num = playerId + os.time();
	
	for (let i = 0; i < 8; i++) {
		code += chars[num % chars.size()];
		num = math.floor(num / 7) + i;
	}
	
	return code;
}

// Invite rewards
export interface InviteReward {
	milestone: number;
	rewards: { type: string; amount: number }[];
	title: string;
}

export const INVITE_MILESTONES: InviteReward[] = [
	{ milestone: 1, rewards: [{ type: "gems", amount: 50 }], title: "First Friend" },
	{ milestone: 5, rewards: [{ type: "gems", amount: 200 }, { type: "rare_egg", amount: 1 }], title: "Social Butterfly" },
	{ milestone: 10, rewards: [{ type: "gems", amount: 500 }, { type: "epic_egg", amount: 1 }], title: "Party Starter" },
	{ milestone: 25, rewards: [{ type: "gems", amount: 1500 }, { type: "legendary_egg", amount: 1 }], title: "Influencer" },
	{ milestone: 50, rewards: [{ type: "gems", amount: 5000 }, { type: "exclusive_pet", amount: 1 }], title: "Community Leader" },
	{ milestone: 100, rewards: [{ type: "gems", amount: 15000 }, { type: "mythic_pet", amount: 1 }], title: "Legend" },
];

export function getInviteReward(inviteCount: number): InviteReward | undefined {
	for (const milestone of INVITE_MILESTONES) {
		if (inviteCount === milestone.milestone) {
			return milestone;
		}
	}
	return undefined;
}

export function getNextInviteMilestone(inviteCount: number): InviteReward | undefined {
	for (const milestone of INVITE_MILESTONES) {
		if (inviteCount < milestone.milestone) {
			return milestone;
		}
	}
	return undefined;
}

// Party creation
export function createParty(leaderId: number, maxSize: number = 5): PartyData {
	return {
		id: `party_${leaderId}_${os.time()}`,
		leaderId,
		members: [leaderId],
		maxSize,
		createdAt: os.time(),
		status: "forming",
	};
}

export function canJoinParty(party: PartyData): boolean {
	return party.status === "forming" && party.members.size() < party.maxSize;
}
