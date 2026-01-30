// Notification System - Re-engage players
// Push notifications, in-game alerts, urgent messages

export type NotificationType = 
	| "streak_warning"
	| "limited_offer"
	| "friend_online"
	| "gift_received"
	| "event_starting"
	| "reward_ready"
	| "achievement"
	| "trade_request";

export interface GameNotification {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	icon: string;
	
	// Timing
	createdAt: number;
	expiresAt?: number;
	
	// Urgency
	priority: "low" | "medium" | "high" | "urgent";
	
	// Action
	actionButton?: string;
	actionCallback?: string;
	
	// Status
	read: boolean;
	dismissed: boolean;
}

export interface NotificationSettings {
	enabled: boolean;
	pauseDuringGameplay: boolean;
	maxVisible: number;
	displayDuration: number; // seconds
	priorities: Record<NotificationType, "low" | "medium" | "high" | "urgent">;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
	enabled: true,
	pauseDuringGameplay: true,
	maxVisible: 3,
	displayDuration: 5,
	priorities: {
		streak_warning: "urgent",
		limited_offer: "high",
		friend_online: "low",
		gift_received: "high",
		event_starting: "high",
		reward_ready: "medium",
		achievement: "medium",
		trade_request: "high",
	},
};

// Generate notification ID
function generateNotificationId(): string {
	return `notif_${os.time()}_${math.random(1000, 9999)}`;
}

// Create notifications
export function createStreakWarning(hoursRemaining: number): GameNotification {
	return {
		id: generateNotificationId(),
		type: "streak_warning",
		title: "⚠️ Streak Ending!",
		message: `Your ${hoursRemaining}h streak ends in ${hoursRemaining} hours!`,
		icon: "🔥",
		createdAt: os.time(),
		expiresAt: os.time() + hoursRemaining * 3600,
		priority: "urgent",
		actionButton: "Claim Reward",
		actionCallback: "claimDailyReward",
		read: false,
		dismissed: false,
	};
}

export function createLimitedOfferNotification(offerName: string, discount: number, endsIn: string): GameNotification {
	return {
		id: generateNotificationId(),
		type: "limited_offer",
		title: "🔥 Limited Offer!",
		message: `${offerName} - ${discount}% OFF! Ends in ${endsIn}`,
		icon: "💰",
		createdAt: os.time(),
		priority: "high",
		actionButton: "View Offer",
		actionCallback: "openShop",
		read: false,
		dismissed: false,
	};
}

export function createGiftNotification(senderName: string, itemName: string): GameNotification {
	return {
		id: generateNotificationId(),
		type: "gift_received",
		title: "🎁 Gift Received!",
		message: `${senderName} sent you ${itemName}!`,
		icon: "🎁",
		createdAt: os.time(),
		priority: "high",
		actionButton: "Open Gift",
		actionCallback: "openInventory",
		read: false,
		dismissed: false,
	};
}

export function createEventNotification(eventName: string, startsIn: string): GameNotification {
	return {
		id: generateNotificationId(),
		type: "event_starting",
		title: "🎉 Event Starting!",
		message: `${eventName} starts in ${startsIn}!`,
		icon: "🎊",
		createdAt: os.time(),
		priority: "high",
		actionButton: "Learn More",
		actionCallback: "openEvents",
		read: false,
		dismissed: false,
	};
}

export function createAchievementNotification(achievementName: string, reward: string): GameNotification {
	return {
		id: generateNotificationId(),
		type: "achievement",
		title: "🏆 Achievement Unlocked!",
		message: `${achievementName} - Reward: ${reward}`,
		icon: "🏆",
		createdAt: os.time(),
		priority: "medium",
		actionButton: "View",
		actionCallback: "openAchievements",
		read: false,
		dismissed: false,
	};
}

// Sort notifications by priority
export function sortByPriority(notifications: GameNotification[]): GameNotification[] {
	const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
	return notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Get icon color by priority
export function getPriorityColor(priority: GameNotification["priority"]): Color3 {
	switch (priority) {
		case "urgent": return Color3.fromRGB(255, 80, 80);
		case "high": return Color3.fromRGB(255, 180, 50);
		case "medium": return Color3.fromRGB(100, 200, 255);
		case "low": return Color3.fromRGB(150, 150, 150);
	}
}
