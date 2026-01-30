// Moderation System - Player safety and reporting
// Essential for community management

export type ReportReason = 
	| "harassment"
	| "inappropriate_content"
	| "cheating"
	| "scamming"
	| "spam"
	| "real_world_trading"
	| "other";

export type ModerationAction = 
	| "warn"
	| "mute"
	| "kick"
	| "ban_temp"
	| "ban_permanent";

export interface PlayerReport {
	id: string;
	timestamp: number;
	
	// Reporter
	reporterId: number;
	reporterName: string;
	
	// Reported
	reportedId: number;
	reportedName: string;
	
	// Details
	reason: ReportReason;
	description: string;
	evidence?: string[]; // Screenshot IDs, chat logs, etc.
	
	// Status
	status: "pending" | "reviewed" | "actioned" | "dismissed";
	reviewedBy?: string;
	actionTaken?: ModerationAction;
}

export interface PlayerModerationRecord {
	playerId: number;
	warnings: number;
	mutes: { until: number; reason: string }[];
	bans: { until: number; reason: string; permanent: boolean }[];
	reports: string[]; // Report IDs
}

export interface ChatFilter {
	bannedWords: string[];
	allowedPatterns: string[];
	maxMessageLength: number;
	minTimeBetweenMessages: number;
}

export const DEFAULT_CHAT_FILTER: ChatFilter = {
	bannedWords: [],  // Add your filtered words
	allowedPatterns: [],
	maxMessageLength: 200,
	minTimeBetweenMessages: 1,
};

// Check if player is muted
export function isPlayerMuted(record: PlayerModerationRecord): boolean {
	const now = os.time();
	for (const mute of record.mutes) {
		if (mute.until > now) {
			return true;
		}
	}
	return false;
}

// Check if player is banned
export function isPlayerBanned(record: PlayerModerationRecord): { banned: boolean; permanent: boolean; until?: number; reason?: string } {
	const now = os.time();
	for (const ban of record.bans) {
		if (ban.permanent || ban.until > now) {
			return { banned: true, permanent: ban.permanent, until: ban.until, reason: ban.reason };
		}
	}
	return { banned: false, permanent: false };
}

// Filter chat message
export function filterChatMessage(message: string, filter: ChatFilter): { allowed: boolean; filtered: string; reason?: string } {
	// Check length
	if (message.size() > filter.maxMessageLength) {
		return { allowed: false, filtered: "", reason: "Message too long" };
	}
	
	// Check banned words (simple filter)
	let filteredMessage = message;
	for (const word of filter.bannedWords) {
		const pattern = word.lower();
		if (message.lower().find(pattern)[0]) {
			// Replace with asterisks
			const replacement = string.rep("*", word.size());
			filteredMessage = filteredMessage.gsub(word, replacement)[0];
		}
	}
	
	return { allowed: true, filtered: filteredMessage };
}

// Generate report ID
export function generateReportId(): string {
	return `report_${os.time()}_${math.random(10000, 99999)}`;
}

// Create new report
export function createReport(
	reporterId: number,
	reporterName: string,
	reportedId: number,
	reportedName: string,
	reason: ReportReason,
	description: string
): PlayerReport {
	return {
		id: generateReportId(),
		timestamp: os.time(),
		reporterId,
		reporterName,
		reportedId,
		reportedName,
		reason,
		description,
		status: "pending",
	};
}

// Get suggested action based on report reason and history
export function getSuggestedAction(
	reason: ReportReason,
	previousWarnings: number
): ModerationAction {
	// Serious offenses
	if (reason === "cheating" || reason === "real_world_trading") {
		return previousWarnings >= 1 ? "ban_permanent" : "ban_temp";
	}
	
	// Moderate offenses
	if (reason === "harassment" || reason === "scamming") {
		if (previousWarnings >= 3) return "ban_temp";
		if (previousWarnings >= 1) return "mute";
		return "warn";
	}
	
	// Minor offenses
	if (previousWarnings >= 5) return "ban_temp";
	if (previousWarnings >= 2) return "mute";
	return "warn";
}
