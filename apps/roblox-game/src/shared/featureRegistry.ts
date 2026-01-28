// Feature Registry - Central config for all game features
// Controls: visibility, zone placement, ordering, tutorial, colors

export type FeatureZone = "actionBar" | "leftMenu" | "rightPanel" | "topBar" | "hidden";

export interface Feature {
	id: string;
	name: string;
	icon: string;
	enabled: boolean;
	zone: FeatureZone;
	order: number;
	color: Color3;
	panelName: string; // e.g., "ShopPanel"
	uiName: string;    // e.g., "ShopUI"
	tutorialStep?: {
		title: string;
		description: string;
	};
}

// ============================================
// FEATURE DEFINITIONS - All 24 systems
// ============================================

export const FEATURES: Feature[] = [
	// ========== ACTION BAR (Core Gameplay) ==========
	{
		id: "shop",
		name: "Shop",
		icon: "🛒",
		enabled: true,
		zone: "actionBar",
		order: 1,
		color: Color3.fromRGB(80, 150, 220),
		panelName: "ShopPanel",
		uiName: "ShopUI",
		tutorialStep: {
			title: "🛒 Shop",
			description: "Buy upgrades, boosts, and special items!",
		},
	},
	{
		id: "eggs",
		name: "Eggs",
		icon: "🥚",
		enabled: true,
		zone: "actionBar",
		order: 2,
		color: Color3.fromRGB(255, 200, 80),
		panelName: "EggPanel",
		uiName: "EggShopUI",
		tutorialStep: {
			title: "🥚 Eggs",
			description: "Hatch eggs to get new pets!",
		},
	},
	{
		id: "maps",
		name: "Maps",
		icon: "🗺️",
		enabled: true,
		zone: "actionBar",
		order: 3,
		color: Color3.fromRGB(100, 180, 255),
		panelName: "MapPanel",
		uiName: "MapShopUI",
		tutorialStep: {
			title: "🗺️ Worlds",
			description: "Unlock new worlds with better coins!",
		},
	},
	{
		id: "pets",
		name: "Pets",
		icon: "🐾",
		enabled: true,
		zone: "actionBar",
		order: 4,
		color: Color3.fromRGB(255, 150, 80),
		panelName: "PetContainer",
		uiName: "PetUI",
		tutorialStep: {
			title: "🐾 Pets",
			description: "Select and equip your pets!",
		},
	},
	{
		id: "battles",
		name: "Fight",
		icon: "⚔️",
		enabled: true,
		zone: "actionBar",
		order: 5,
		color: Color3.fromRGB(220, 80, 100),
		panelName: "BattlePanel",
		uiName: "BattlesUI",
		tutorialStep: {
			title: "⚔️ Battles",
			description: "Challenge other players to pet battles!",
		},
	},
	{
		id: "wheel",
		name: "Spin",
		icon: "🎡",
		enabled: true,
		zone: "actionBar",
		order: 6,
		color: Color3.fromRGB(180, 100, 220),
		panelName: "WheelPanel",
		uiName: "LuckyWheelUI",
		tutorialStep: {
			title: "🎡 Lucky Wheel",
			description: "Spin daily for free rewards!",
		},
	},
	{
		id: "evolve",
		name: "Evolve",
		icon: "✨",
		enabled: true,
		zone: "actionBar",
		order: 7,
		color: Color3.fromRGB(100, 220, 150),
		panelName: "EvoPanel",
		uiName: "EvolutionUI",
		tutorialStep: {
			title: "✨ Evolution",
			description: "Level up your pets for bonus power!",
		},
	},
	{
		id: "fuse",
		name: "Fuse",
		icon: "🔥",
		enabled: true,
		zone: "actionBar",
		order: 8,
		color: Color3.fromRGB(255, 100, 50),
		panelName: "FusionPanel",
		uiName: "FusionUI",
		tutorialStep: {
			title: "🔥 Fusion",
			description: "Combine pets to make them stronger!",
		},
	},
	{
		id: "minigames",
		name: "Games",
		icon: "🎮",
		enabled: true,
		zone: "actionBar",
		order: 9,
		color: Color3.fromRGB(80, 180, 150),
		panelName: "GamesPanel",
		uiName: "MinigamesUI",
		tutorialStep: {
			title: "🎮 Minigames",
			description: "Play games to earn extra coins!",
		},
	},

	// ========== LEFT MENU (Rewards & Progression) ==========
	{
		id: "dailyRewards",
		name: "Daily",
		icon: "📅",
		enabled: true,
		zone: "leftMenu",
		order: 1,
		color: Color3.fromRGB(255, 150, 50),
		panelName: "RewardsCard",
		uiName: "DailyRewardsUI",
		tutorialStep: {
			title: "📅 Daily Rewards",
			description: "Login daily for streak bonuses!",
		},
	},
	{
		id: "quests",
		name: "Quests",
		icon: "📋",
		enabled: true,
		zone: "leftMenu",
		order: 2,
		color: Color3.fromRGB(80, 150, 220),
		panelName: "QuestsPanel",
		uiName: "QuestUI",
		tutorialStep: {
			title: "📋 Quests",
			description: "Complete quests for rewards!",
		},
	},
	{
		id: "codes",
		name: "Codes",
		icon: "🎁",
		enabled: true,
		zone: "leftMenu",
		order: 3,
		color: Color3.fromRGB(220, 80, 150),
		panelName: "CodesPanel",
		uiName: "CodesUI",
		tutorialStep: {
			title: "🎁 Codes",
			description: "Redeem codes for free stuff!",
		},
	},
	{
		id: "vip",
		name: "VIP",
		icon: "👑",
		enabled: true,
		zone: "leftMenu",
		order: 4,
		color: Color3.fromRGB(255, 200, 50),
		panelName: "VIPPanel",
		uiName: "VIPUI",
		tutorialStep: {
			title: "👑 VIP",
			description: "Get exclusive VIP benefits!",
		},
	},
	{
		id: "clans",
		name: "Clans",
		icon: "👥",
		enabled: true,
		zone: "leftMenu",
		order: 5,
		color: Color3.fromRGB(50, 180, 200),
		panelName: "ClansPanel",
		uiName: "ClansUI",
	},
	{
		id: "private",
		name: "Private",
		icon: "🔒",
		enabled: true,
		zone: "leftMenu",
		order: 6,
		color: Color3.fromRGB(150, 100, 200),
		panelName: "PrivatePanel",
		uiName: "PrivateServerUI",
	},

	// ========== RIGHT PANEL (Social/Info) ==========
	{
		id: "leaderboard",
		name: "Ranks",
		icon: "🏆",
		enabled: true,
		zone: "rightPanel",
		order: 1,
		color: Color3.fromRGB(255, 200, 50),
		panelName: "LeaderboardPanel",
		uiName: "LeaderboardUI",
	},
	{
		id: "achievements",
		name: "Badges",
		icon: "🎖️",
		enabled: true,
		zone: "rightPanel",
		order: 2,
		color: Color3.fromRGB(200, 150, 50),
		panelName: "AchievementsPanel",
		uiName: "AchievementsUI",
	},

	// ========== TOP BAR (Meta/Premium) ==========
	{
		id: "premium",
		name: "Premium",
		icon: "⭐",
		enabled: true,
		zone: "topBar",
		order: 1,
		color: Color3.fromRGB(255, 180, 50),
		panelName: "PremiumPanel",
		uiName: "PremiumUI",
		tutorialStep: {
			title: "⭐ Premium",
			description: "Get 2x coins and exclusive pets!",
		},
	},
	{
		id: "rebirth",
		name: "Rebirth",
		icon: "🔄",
		enabled: true,
		zone: "topBar",
		order: 2,
		color: Color3.fromRGB(100, 200, 255),
		panelName: "RebirthPanel",
		uiName: "RebirthUI",
		tutorialStep: {
			title: "🔄 Rebirth",
			description: "Reset for permanent multipliers!",
		},
	},
	{
		id: "music",
		name: "Music",
		icon: "🎵",
		enabled: true,
		zone: "topBar",
		order: 3,
		color: Color3.fromRGB(180, 100, 200),
		panelName: "MusicPanel",
		uiName: "MusicSystem",
	},

	// ========== HIDDEN (Available but not shown) ==========
	{
		id: "trading",
		name: "Trade",
		icon: "🤝",
		enabled: true,
		zone: "hidden",
		order: 1,
		color: Color3.fromRGB(100, 180, 100),
		panelName: "TradePanel",
		uiName: "TradingUI",
	},
	{
		id: "stealing",
		name: "Steal",
		icon: "🦹",
		enabled: true,
		zone: "hidden",
		order: 2,
		color: Color3.fromRGB(80, 60, 100),
		panelName: "StealPanel",
		uiName: "StealingUI",
	},
	{
		id: "events",
		name: "Events",
		icon: "🎉",
		enabled: true,
		zone: "hidden",
		order: 3,
		color: Color3.fromRGB(255, 100, 150),
		panelName: "EventsPanel",
		uiName: "EventsUI",
	},
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getFeaturesByZone(zone: FeatureZone): Feature[] {
	return FEATURES
		.filter(f => f.enabled && f.zone === zone)
		.sort((a, b) => a.order < b.order);
}

export function getActionBarFeatures(): Feature[] {
	return getFeaturesByZone("actionBar");
}

export function getLeftMenuFeatures(): Feature[] {
	return getFeaturesByZone("leftMenu");
}

export function getRightPanelFeatures(): Feature[] {
	return getFeaturesByZone("rightPanel");
}

export function getTopBarFeatures(): Feature[] {
	return getFeaturesByZone("topBar");
}

export function getFeatureById(id: string): Feature | undefined {
	return FEATURES.find(f => f.id === id);
}

export function isFeatureEnabled(id: string): boolean {
	const feature = getFeatureById(id);
	return feature?.enabled ?? false;
}

export function getTutorialSteps(): { title: string; description: string }[] {
	return FEATURES
		.filter(f => f.enabled && f.tutorialStep !== undefined)
		.sort((a, b) => {
			// Sort by zone priority, then order
			const zonePriority: Record<FeatureZone, number> = {
				actionBar: 1,
				leftMenu: 2,
				topBar: 3,
				rightPanel: 4,
				hidden: 99,
			};
			const zoneA = zonePriority[a.zone];
			const zoneB = zonePriority[b.zone];
			if (zoneA !== zoneB) return zoneA < zoneB;
			return a.order < b.order;
		})
		.map(f => f.tutorialStep as { title: string; description: string });
}
