// Rebirth System - Reset coins for permanent multipliers
// Like Pet Simulator X - endless progression keeps players hooked!
import { Players, ReplicatedStorage, DataStoreService } from "@rbxts/services";

const REBIRTH_BASE_COST = 10000; // First rebirth costs 10k
const REBIRTH_COST_MULTIPLIER = 1.5; // Each rebirth costs 50% more
const REBIRTH_BONUS = 0.25; // +25% coin gain per rebirth

// Track player rebirths (in production, save to DataStore)
const playerRebirths = new Map<Player, number>();

export function setupRebirthSystem() {
	// Create remotes
	const rebirthRemote = new Instance("RemoteFunction");
	rebirthRemote.Name = "Rebirth";
	rebirthRemote.Parent = ReplicatedStorage;
	
	const getRebirthInfoRemote = new Instance("RemoteFunction");
	getRebirthInfoRemote.Name = "GetRebirthInfo";
	getRebirthInfoRemote.Parent = ReplicatedStorage;
	
	const rebirthNotifyRemote = new Instance("RemoteEvent");
	rebirthNotifyRemote.Name = "RebirthNotify";
	rebirthNotifyRemote.Parent = ReplicatedStorage;
	
	// Initialize players
	Players.PlayerAdded.Connect((player) => {
		playerRebirths.set(player, 0);
		setupRebirthMultiplier(player);
	});
	
	Players.PlayerRemoving.Connect((player) => {
		playerRebirths.delete(player);
	});
	
	// Get rebirth info
	getRebirthInfoRemote.OnServerInvoke = (player) => {
		const rebirths = playerRebirths.get(player) ?? 0;
		const cost = getRebirthCost(rebirths);
		const multiplier = getMultiplier(rebirths);
		const nextMultiplier = getMultiplier(rebirths + 1);
		
		return {
			rebirths,
			cost,
			multiplier,
			nextMultiplier
		};
	};
	
	// Perform rebirth
	rebirthRemote.OnServerInvoke = (player) => {
		const rebirths = playerRebirths.get(player) ?? 0;
		const cost = getRebirthCost(rebirths);
		
		// Check coins
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		
		if (!coins || coins.Value < cost) {
			return { success: false, message: `Need ${cost} coins to rebirth!` };
		}
		
		// Perform rebirth
		coins.Value = 0; // Reset coins
		const newRebirths = rebirths + 1;
		playerRebirths.set(player, newRebirths);
		
		// Update rebirth display
		const rebirthStat = leaderstats?.FindFirstChild("Rebirths") as IntValue | undefined;
		if (rebirthStat) {
			rebirthStat.Value = newRebirths;
		}
		
		// Notify client
		rebirthNotifyRemote.FireClient(player, newRebirths, getMultiplier(newRebirths));
		
		print(`🔄 ${player.Name} rebirthed! Now at ${newRebirths}x (${math.floor(getMultiplier(newRebirths) * 100)}% bonus)`);
		
		return { 
			success: true, 
			rebirths: newRebirths,
			multiplier: getMultiplier(newRebirths)
		};
	};
	
	print("🔄 Rebirth system ready! Reset coins for permanent multipliers!");
}

function getRebirthCost(currentRebirths: number): number {
	return math.floor(REBIRTH_BASE_COST * math.pow(REBIRTH_COST_MULTIPLIER, currentRebirths));
}

function getMultiplier(rebirths: number): number {
	return 1 + (rebirths * REBIRTH_BONUS);
}

function setupRebirthMultiplier(player: Player) {
	// Add Rebirths stat to leaderstats
	player.CharacterAdded.Connect(() => {
		wait(0.5);
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		if (leaderstats && !leaderstats.FindFirstChild("Rebirths")) {
			const rebirthStat = new Instance("IntValue");
			rebirthStat.Name = "Rebirths";
			rebirthStat.Value = playerRebirths.get(player) ?? 0;
			rebirthStat.Parent = leaderstats;
		}
	});
}

// Apply rebirth multiplier to coins (call this when giving coins)
export function applyRebirthMultiplier(player: Player, baseCoins: number): number {
	const rebirths = playerRebirths.get(player) ?? 0;
	const multiplier = getMultiplier(rebirths);
	return math.floor(baseCoins * multiplier);
}

// Get player's current multiplier
export function getPlayerMultiplier(player: Player): number {
	const rebirths = playerRebirths.get(player) ?? 0;
	return getMultiplier(rebirths);
}
