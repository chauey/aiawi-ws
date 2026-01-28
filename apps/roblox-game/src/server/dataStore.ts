// DataStore System - Persistent player data
// CRITICAL: Required for production - saves all player progress
import { Players, DataStoreService } from "@rbxts/services";

// Create main data store
const playerDataStore = DataStoreService.GetDataStore("PlayerData_v1");

// Stored data structure (for DataStore serialization)
interface StoredPlayerData {
	coins: number;
	rebirths: number;
	pets: string[];
	equippedPet: string | undefined;
	dailyStreak: number;
	lastDailyReward: number;
	unlockedMaps: string[];
	achievements: string[];
	questProgress: { [key: string]: number };
	vipAccess: boolean;
	premiumPass: boolean;
	clanId: string | undefined;
	totalCoinsEarned: number;
	playTime: number;
}

// Default data for new players
const DEFAULT_DATA: StoredPlayerData = {
	coins: 0,
	rebirths: 0,
	pets: [],
	equippedPet: undefined,
	dailyStreak: 0,
	lastDailyReward: 0,
	unlockedMaps: ["starter"],
	achievements: [],
	questProgress: {},
	vipAccess: false,
	premiumPass: false,
	clanId: undefined,
	totalCoinsEarned: 0,
	playTime: 0,
};

// Cache loaded data
const playerDataCache = new Map<Player, StoredPlayerData>();

// Load player data
export function loadPlayerData(player: Player): StoredPlayerData {
	const key = `Player_${player.UserId}`;
	
	const [success, result] = pcall(() => {
		return playerDataStore.GetAsync(key);
	});
	
	if (success && result) {
		const loadedData = result as Partial<StoredPlayerData>;
		const mergedData: StoredPlayerData = {
			coins: loadedData.coins ?? DEFAULT_DATA.coins,
			rebirths: loadedData.rebirths ?? DEFAULT_DATA.rebirths,
			pets: loadedData.pets ?? DEFAULT_DATA.pets,
			equippedPet: loadedData.equippedPet,
			dailyStreak: loadedData.dailyStreak ?? DEFAULT_DATA.dailyStreak,
			lastDailyReward: loadedData.lastDailyReward ?? DEFAULT_DATA.lastDailyReward,
			unlockedMaps: loadedData.unlockedMaps ?? DEFAULT_DATA.unlockedMaps,
			achievements: loadedData.achievements ?? DEFAULT_DATA.achievements,
			questProgress: loadedData.questProgress ?? DEFAULT_DATA.questProgress,
			vipAccess: loadedData.vipAccess ?? DEFAULT_DATA.vipAccess,
			premiumPass: loadedData.premiumPass ?? DEFAULT_DATA.premiumPass,
			clanId: loadedData.clanId,
			totalCoinsEarned: loadedData.totalCoinsEarned ?? DEFAULT_DATA.totalCoinsEarned,
			playTime: loadedData.playTime ?? DEFAULT_DATA.playTime,
		};
		
		playerDataCache.set(player, mergedData);
		print(`✅ Loaded data for ${player.Name}`);
		return mergedData;
	}
	
	// Return default data for new players
	const newData = { ...DEFAULT_DATA };
	playerDataCache.set(player, newData);
	print(`🆕 New player: ${player.Name}`);
	return newData;
}

// Save player data
export function savePlayerData(player: Player): boolean {
	const data = playerDataCache.get(player);
	if (!data) return false;
	
	const key = `Player_${player.UserId}`;
	
	const [success] = pcall(() => {
		playerDataStore.SetAsync(key, data);
	});
	
	if (success) {
		print(`💾 Saved data for ${player.Name}`);
		return true;
	}
	
	warn(`❌ Failed to save data for ${player.Name}`);
	return false;
}

// Get cached data (fast, for frequent access)
export function getPlayerData(player: Player): StoredPlayerData | undefined {
	return playerDataCache.get(player);
}

// Update specific fields
export function updatePlayerData(player: Player, updates: Partial<StoredPlayerData>): void {
	const data = playerDataCache.get(player);
	if (data) {
		if (updates.coins !== undefined) data.coins = updates.coins;
		if (updates.rebirths !== undefined) data.rebirths = updates.rebirths;
		if (updates.pets !== undefined) data.pets = updates.pets;
		if (updates.equippedPet !== undefined) data.equippedPet = updates.equippedPet;
		if (updates.dailyStreak !== undefined) data.dailyStreak = updates.dailyStreak;
		if (updates.vipAccess !== undefined) data.vipAccess = updates.vipAccess;
		if (updates.premiumPass !== undefined) data.premiumPass = updates.premiumPass;
	}
}

export function setupDataStore() {
	// Load data when player joins
	Players.PlayerAdded.Connect((player) => {
		const data = loadPlayerData(player);
		
		// Sync coins to leaderstats after they're created
		task.delay(2, () => {
			const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
			if (leaderstats) {
				const coins = leaderstats.FindFirstChild("Coins") as IntValue | undefined;
				if (coins) {
					coins.Value = data.coins;
				}
				const rebirths = leaderstats.FindFirstChild("Rebirths") as IntValue | undefined;
				if (rebirths) {
					rebirths.Value = data.rebirths;
				}
			}
		});
	});
	
	// Save data when player leaves
	Players.PlayerRemoving.Connect((player) => {
		// Sync from leaderstats before saving
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		if (leaderstats) {
			const coins = leaderstats.FindFirstChild("Coins") as IntValue | undefined;
			if (coins) {
				updatePlayerData(player, { coins: coins.Value });
			}
			const rebirths = leaderstats.FindFirstChild("Rebirths") as IntValue | undefined;
			if (rebirths) {
				updatePlayerData(player, { rebirths: rebirths.Value });
			}
		}
		
		savePlayerData(player);
		playerDataCache.delete(player);
	});
	
	// Auto-save every 60 seconds
	task.spawn(() => {
		while (true) {
			task.wait(60);
			for (const player of Players.GetPlayers()) {
				// Sync coins
				const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
				if (leaderstats) {
					const coins = leaderstats.FindFirstChild("Coins") as IntValue | undefined;
					if (coins) {
						updatePlayerData(player, { coins: coins.Value });
					}
				}
				savePlayerData(player);
			}
			print("💾 Auto-saved all player data");
		}
	});
	
	// Save all on server shutdown
	game.BindToClose(() => {
		print("🛑 Server shutting down, saving all data...");
		for (const player of Players.GetPlayers()) {
			savePlayerData(player);
		}
	});
	
	print("💾 DataStore system ready!");
}
