// Leaderboard System - Track top players
import { Players, ReplicatedStorage, DataStoreService } from "@rbxts/services";

// DataStore for persistent leaderboard
let leaderboardStore: DataStore | undefined;
try {
	leaderboardStore = DataStoreService.GetDataStore("LeaderboardData");
} catch (e) {
	print("⚠️ DataStore not available (Studio mode)");
}

// In-memory leaderboard for current session
const sessionScores = new Map<string, { name: string; coins: number }>();

export function setupLeaderboardSystem() {
	// Create remote for client to request leaderboard
	const getLeaderboardRemote = new Instance("RemoteFunction");
	getLeaderboardRemote.Name = "GetLeaderboard";
	getLeaderboardRemote.Parent = ReplicatedStorage;
	
	// Handle leaderboard requests
	getLeaderboardRemote.OnServerInvoke = (player) => {
		return getTopPlayers(10);
	};
	
	// Track coin changes
	Players.PlayerAdded.Connect((player) => {
		player.CharacterAdded.Connect(() => {
			// Wait for leaderstats
			const leaderstats = player.WaitForChild("leaderstats", 10) as Folder | undefined;
			const coinsValue = leaderstats?.WaitForChild("Coins", 5) as IntValue | undefined;
			
			if (coinsValue) {
				// Update session score when coins change
				coinsValue.Changed.Connect((newValue) => {
					updatePlayerScore(player.Name, newValue);
				});
				
				// Initial update
				updatePlayerScore(player.Name, coinsValue.Value);
			}
		});
	});
	
	// Save score when player leaves
	Players.PlayerRemoving.Connect((player) => {
		const score = sessionScores.get(player.Name);
		if (score && leaderboardStore) {
			try {
				leaderboardStore.SetAsync(player.Name, score.coins);
			} catch (e) {
				print(`⚠️ Failed to save ${player.Name}'s score`);
			}
		}
	});
	
	print("🏆 Leaderboard system ready!");
}

function updatePlayerScore(playerName: string, coins: number) {
	const existing = sessionScores.get(playerName);
	if (!existing || coins > existing.coins) {
		sessionScores.set(playerName, { name: playerName, coins });
	}
}

function getTopPlayers(count: number): { name: string; coins: number }[] {
	// Get all scores and sort
	const allScores: { name: string; coins: number }[] = [];
	
	sessionScores.forEach((score) => {
		allScores.push(score);
	});
	
	// Sort by coins descending (roblox-ts uses boolean return)
	allScores.sort((a, b) => a.coins < b.coins);
	
	// Return top N
	const result: { name: string; coins: number }[] = [];
	for (let i = 0; i < math.min(count, allScores.size()); i++) {
		result.push(allScores[i]);
	}
	return result;
}
