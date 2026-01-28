// Achievements System - Unlock badges for milestones
// PROVEN: Badges give players goals and bragging rights, increases retention
import { Players, ReplicatedStorage } from "@rbxts/services";

interface Achievement {
	id: string;
	name: string;
	description: string;
	emoji: string;
	requirement: number;
	reward: number;
	type: "coins" | "rebirths" | "pets" | "eggs" | "steals" | "trades";
}

// All achievements
const ACHIEVEMENTS: Achievement[] = [
	// Coin milestones
	{ id: "coins_100", name: "Starter", description: "Collect 100 coins", emoji: "🪙", requirement: 100, reward: 25, type: "coins" },
	{ id: "coins_1000", name: "Collector", description: "Collect 1,000 coins", emoji: "💰", requirement: 1000, reward: 100, type: "coins" },
	{ id: "coins_10000", name: "Rich", description: "Collect 10,000 coins", emoji: "🤑", requirement: 10000, reward: 500, type: "coins" },
	{ id: "coins_100000", name: "Wealthy", description: "Collect 100,000 coins", emoji: "👑", requirement: 100000, reward: 2500, type: "coins" },
	
	// Rebirth milestones
	{ id: "rebirth_1", name: "Reborn", description: "Rebirth 1 time", emoji: "🔄", requirement: 1, reward: 200, type: "rebirths" },
	{ id: "rebirth_5", name: "Prestige", description: "Rebirth 5 times", emoji: "⭐", requirement: 5, reward: 1000, type: "rebirths" },
	{ id: "rebirth_10", name: "Legend", description: "Rebirth 10 times", emoji: "🏆", requirement: 10, reward: 5000, type: "rebirths" },
	
	// Pet milestones
	{ id: "pets_5", name: "Pet Lover", description: "Hatch 5 eggs", emoji: "🥚", requirement: 5, reward: 150, type: "eggs" },
	{ id: "pets_25", name: "Pet Master", description: "Hatch 25 eggs", emoji: "🐣", requirement: 25, reward: 750, type: "eggs" },
	{ id: "pets_100", name: "Pet King", description: "Hatch 100 eggs", emoji: "🐉", requirement: 100, reward: 3000, type: "eggs" },
	
	// Social milestones
	{ id: "steals_10", name: "Thief", description: "Steal 10 times", emoji: "😈", requirement: 10, reward: 200, type: "steals" },
	{ id: "trades_5", name: "Trader", description: "Complete 5 trades", emoji: "🤝", requirement: 5, reward: 300, type: "trades" },
];

// Track player progress
interface PlayerProgress {
	coins: number;
	rebirths: number;
	eggs: number;
	steals: number;
	trades: number;
	unlockedAchievements: Set<string>;
}

const playerProgress = new Map<Player, PlayerProgress>();

export function setupAchievements() {
	const getAchievementsRemote = new Instance("RemoteFunction");
	getAchievementsRemote.Name = "GetAchievements";
	getAchievementsRemote.Parent = ReplicatedStorage;
	
	const claimAchievementRemote = new Instance("RemoteFunction");
	claimAchievementRemote.Name = "ClaimAchievement";
	claimAchievementRemote.Parent = ReplicatedStorage;
	
	const achievementNotifyRemote = new Instance("RemoteEvent");
	achievementNotifyRemote.Name = "AchievementUnlocked";
	achievementNotifyRemote.Parent = ReplicatedStorage;
	
	// Initialize players
	Players.PlayerAdded.Connect((player) => {
		playerProgress.set(player, {
			coins: 0,
			rebirths: 0,
			eggs: 0,
			steals: 0,
			trades: 0,
			unlockedAchievements: new Set<string>(),
		});
	});
	
	Players.PlayerRemoving.Connect((player) => {
		playerProgress.delete(player);
	});
	
	// Get achievements
	getAchievementsRemote.OnServerInvoke = (player) => {
		const progress = playerProgress.get(player);
		if (!progress) return [];
		
		return ACHIEVEMENTS.map(a => ({
			id: a.id,
			name: a.name,
			description: a.description,
			emoji: a.emoji,
			requirement: a.requirement,
			reward: a.reward,
			progress: getProgressValue(progress, a.type),
			unlocked: progress.unlockedAchievements.has(a.id),
			canClaim: getProgressValue(progress, a.type) >= a.requirement && !progress.unlockedAchievements.has(a.id),
		}));
	};
	
	// Claim achievement
	claimAchievementRemote.OnServerInvoke = (player, achievementId) => {
		if (!typeIs(achievementId, "string")) return { success: false };
		
		const progress = playerProgress.get(player);
		if (!progress) return { success: false };
		
		const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
		if (!achievement) return { success: false, message: "Not found!" };
		
		if (progress.unlockedAchievements.has(achievementId)) {
			return { success: false, message: "Already claimed!" };
		}
		
		const currentProgress = getProgressValue(progress, achievement.type);
		if (currentProgress < achievement.requirement) {
			return { success: false, message: "Not complete!" };
		}
		
		// Claim!
		progress.unlockedAchievements.add(achievementId);
		
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		if (coins) {
			coins.Value += achievement.reward;
		}
		
		print(`🏆 ${player.Name} unlocked: ${achievement.name}! +${achievement.reward} coins`);
		
		return { success: true, reward: achievement.reward };
	};
	
	print("🏆 Achievements ready! Complete goals for rewards!");
}

function getProgressValue(progress: PlayerProgress, progressType: Achievement["type"]): number {
	switch (progressType) {
		case "coins": return progress.coins;
		case "rebirths": return progress.rebirths;
		case "eggs": return progress.eggs;
		case "steals": return progress.steals;
		case "trades": return progress.trades;
		default: return 0;
	}
}

// Update progress (call from other systems)
export function updateAchievementProgress(player: Player, progressType: Achievement["type"], amount = 1) {
	const progress = playerProgress.get(player);
	if (!progress) return;
	
	switch (progressType) {
		case "coins": progress.coins += amount; break;
		case "rebirths": progress.rebirths += amount; break;
		case "eggs": progress.eggs += amount; break;
		case "steals": progress.steals += amount; break;
		case "trades": progress.trades += amount; break;
	}
	
	// Check for newly unlocked achievements
	for (const achievement of ACHIEVEMENTS) {
		if (achievement.type === progressType && 
			!progress.unlockedAchievements.has(achievement.id) &&
			getProgressValue(progress, progressType) >= achievement.requirement) {
			
			// Notify client of unlock
			const notifyRemote = ReplicatedStorage.FindFirstChild("AchievementUnlocked") as RemoteEvent | undefined;
			if (notifyRemote) {
				notifyRemote.FireClient(player, achievement.name, achievement.emoji);
			}
		}
	}
}
