// Daily Rewards System - Login streaks and escalating rewards
import { Players, DataStoreService, ReplicatedStorage } from "@rbxts/services";

// DataStore for persistence (works in published games, mock in Studio)
let playerDataStore: DataStore | undefined;
try {
	playerDataStore = DataStoreService.GetDataStore("PlayerData");
} catch (e) {
	warn("DataStore not available (Studio mode) - using session data only");
}

// Daily reward tiers (coins per login streak day)
const DAILY_REWARDS = [
	50,   // Day 1
	75,   // Day 2
	100,  // Day 3
	150,  // Day 4
	200,  // Day 5
	300,  // Day 6
	500,  // Day 7 (weekly bonus!)
];

interface PlayerData {
	coins: number;
	lastLoginTime: number;
	loginStreak: number;
	totalLogins: number;
	claimedToday: boolean;
}

const playerDataCache = new Map<Player, PlayerData>();

// One day in seconds
const ONE_DAY = 86400;
const STREAK_GRACE_PERIOD = 36 * 3600; // 36 hours to maintain streak

export function setupDailyRewards() {
	// Create remotes
	const claimRemote = createRemote("ClaimDailyReward");
	const dataRemote = createRemote("GetPlayerData");
	
	// Handle reward claim
	claimRemote.OnServerEvent.Connect((player) => {
		claimDailyReward(player);
	});
	
	// Handle data request (for UI)
	dataRemote.OnServerEvent.Connect((player) => {
		const data = playerDataCache.get(player);
		if (data) {
			// Send back player data for UI
			const responseRemote = ReplicatedStorage.FindFirstChild("DailyRewardData") as RemoteEvent | undefined;
			if (responseRemote) {
				responseRemote.FireClient(player, data.loginStreak, data.claimedToday, getRewardForStreak(data.loginStreak));
			}
		}
	});
	
	// Create response remote
	const responseRemote = createRemote("DailyRewardData");
	
	// Load player data on join
	Players.PlayerAdded.Connect((player) => {
		loadPlayerData(player);
	});
	
	// Save on leave
	Players.PlayerRemoving.Connect((player) => {
		savePlayerData(player);
		playerDataCache.delete(player);
	});
	
	// Handle existing players
	for (const player of Players.GetPlayers()) {
		loadPlayerData(player);
	}
	
	print("📅 Daily Rewards system ready!");
}

function createRemote(name: string): RemoteEvent {
	const existing = ReplicatedStorage.FindFirstChild(name);
	if (existing) existing.Destroy();
	
	const remote = new Instance("RemoteEvent");
	remote.Name = name;
	remote.Parent = ReplicatedStorage;
	return remote;
}

function getRewardForStreak(streak: number): number {
	const dayIndex = (streak - 1) % DAILY_REWARDS.size();
	return DAILY_REWARDS[dayIndex];
}

async function loadPlayerData(player: Player) {
	const now = os.time();
	let data: PlayerData = {
		coins: 0,
		lastLoginTime: 0,
		loginStreak: 0,
		totalLogins: 0,
		claimedToday: false,
	};
	
	// Try to load from DataStore
	if (playerDataStore) {
		try {
			const [result] = playerDataStore.GetAsync(`player_${player.UserId}`);
			const saved = result as PlayerData | undefined;
			if (saved) {
				data = saved;
			}
		} catch (e) {
			warn(`Failed to load data for ${player.Name}: ${e}`);
		}
	}
	
	// Check if this is a new day
	const timeSinceLastLogin = now - data.lastLoginTime;
	
	if (timeSinceLastLogin >= ONE_DAY) {
		// It's a new day!
		data.claimedToday = false;
		
		if (timeSinceLastLogin <= STREAK_GRACE_PERIOD) {
			// Within grace period - continue streak
			data.loginStreak++;
		} else if (data.lastLoginTime > 0) {
			// Broke streak - reset to 1
			data.loginStreak = 1;
		} else {
			// First login ever
			data.loginStreak = 1;
		}
		
		data.totalLogins++;
		data.lastLoginTime = now;
	}
	
	playerDataCache.set(player, data);
	
	// Sync leaderstats coins
	syncCoinsWithLeaderstats(player, data);
	
	print(`📅 ${player.Name} - Day ${data.loginStreak} streak, claimed: ${data.claimedToday}`);
}

function syncCoinsWithLeaderstats(player: Player, data: PlayerData) {
	const ls = player.FindFirstChild("leaderstats") as Folder | undefined;
	const coinsValue = ls?.FindFirstChild("Coins") as IntValue | undefined;
	
	if (coinsValue) {
		// If DataStore has more coins, use that
		if (data.coins > coinsValue.Value) {
			coinsValue.Value = data.coins;
		} else {
			// Otherwise update data with leaderstats
			data.coins = coinsValue.Value;
		}
	}
}

function claimDailyReward(player: Player) {
	const data = playerDataCache.get(player);
	if (!data) {
		warn(`No data for ${player.Name}`);
		return;
	}
	
	if (data.claimedToday) {
		print(`${player.Name} already claimed today's reward!`);
		return;
	}
	
	// Calculate reward
	const reward = getRewardForStreak(data.loginStreak);
	
	// Give coins
	const ls = player.FindFirstChild("leaderstats") as Folder | undefined;
	const coinsValue = ls?.FindFirstChild("Coins") as IntValue | undefined;
	
	if (coinsValue) {
		coinsValue.Value += reward;
		data.coins = coinsValue.Value;
	}
	
	data.claimedToday = true;
	
	print(`🎁 ${player.Name} claimed Day ${data.loginStreak} reward: +${reward} coins!`);
	
	// Notify client of success
	const responseRemote = ReplicatedStorage.FindFirstChild("DailyRewardData") as RemoteEvent | undefined;
	if (responseRemote) {
		responseRemote.FireClient(player, data.loginStreak, true, reward);
	}
	
	// Save immediately
	savePlayerData(player);
}

async function savePlayerData(player: Player) {
	const data = playerDataCache.get(player);
	if (!data || !playerDataStore) return;
	
	// Sync coins before saving
	syncCoinsWithLeaderstats(player, data);
	
	try {
		playerDataStore.SetAsync(`player_${player.UserId}`, data);
		print(`💾 Saved data for ${player.Name}`);
	} catch (e) {
		warn(`Failed to save data for ${player.Name}: ${e}`);
	}
}
