// Pet Evolution System - Level up pets for stronger abilities!
// Like Pet Simulator X - evolved pets are worth more and look cooler
import { Players, ReplicatedStorage } from "@rbxts/services";

// Evolution tiers
export type EvolutionTier = "Normal" | "Mega" | "Ultra" | "Cosmic";

interface PetData {
	name: string;
	xp: number;
	tier: EvolutionTier;
}

// XP required per tier
const TIER_XP: { [key: string]: number } = {
	Normal: 0,
	Mega: 100,    // 100 XP to evolve to Mega
	Ultra: 500,   // 500 total XP for Ultra
	Cosmic: 2000, // 2000 total XP for Cosmic (rare!)
};

// Stat multipliers per tier
export const TIER_MULTIPLIERS: { [key: string]: number } = {
	Normal: 1.0,
	Mega: 1.5,    // 50% bonus
	Ultra: 2.5,   // 150% bonus
	Cosmic: 5.0,  // 400% bonus!
};

// Tier colors for UI
export const TIER_COLORS: { [key: string]: Color3 } = {
	Normal: Color3.fromRGB(180, 180, 180),
	Mega: Color3.fromRGB(100, 200, 255),
	Ultra: Color3.fromRGB(255, 150, 255),
	Cosmic: Color3.fromRGB(255, 200, 50),
};

// Track player pet data
const playerPetData = new Map<Player, PetData>();

export function setupPetEvolution() {
	// Create remotes
	const getPetDataRemote = new Instance("RemoteFunction");
	getPetDataRemote.Name = "GetPetEvolution";
	getPetDataRemote.Parent = ReplicatedStorage;
	
	const evolveRemote = new Instance("RemoteFunction");
	evolveRemote.Name = "EvolvePet";
	evolveRemote.Parent = ReplicatedStorage;
	
	const xpGainedRemote = new Instance("RemoteEvent");
	xpGainedRemote.Name = "PetXPGained";
	xpGainedRemote.Parent = ReplicatedStorage;
	
	// Initialize players
	Players.PlayerAdded.Connect((player) => {
		playerPetData.set(player, {
			name: "dog", // Default pet
			xp: 0,
			tier: "Normal"
		});
	});
	
	Players.PlayerRemoving.Connect((player) => {
		playerPetData.delete(player);
	});
	
	// Get pet data
	getPetDataRemote.OnServerInvoke = (player) => {
		const data = playerPetData.get(player);
		if (!data) return { name: "dog", xp: 0, tier: "Normal", nextTier: "Mega", xpNeeded: 100 };
		
		const nextTier = getNextTier(data.tier);
		const xpNeeded = nextTier ? TIER_XP[nextTier] : -1;
		
		return {
			name: data.name,
			xp: data.xp,
			tier: data.tier,
			nextTier,
			xpNeeded,
			multiplier: TIER_MULTIPLIERS[data.tier]
		};
	};
	
	// Try to evolve
	evolveRemote.OnServerInvoke = (player) => {
		const data = playerPetData.get(player);
		if (!data) return { success: false, message: "No pet data!" };
		
		const nextTier = getNextTier(data.tier);
		if (!nextTier) return { success: false, message: "Max evolution!" };
		
		const xpNeeded = TIER_XP[nextTier];
		if (data.xp < xpNeeded) {
			return { success: false, message: `Need ${xpNeeded} XP!` };
		}
		
		// Evolve!
		data.tier = nextTier;
		playerPetData.set(player, data);
		
		print(`🌟 ${player.Name}'s ${data.name} evolved to ${nextTier}!`);
		
		return { 
			success: true, 
			newTier: nextTier,
			multiplier: TIER_MULTIPLIERS[nextTier]
		};
	};
	
	print("🌟 Pet evolution system ready!");
}

function getNextTier(current: EvolutionTier): EvolutionTier | undefined {
	const tiers: EvolutionTier[] = ["Normal", "Mega", "Ultra", "Cosmic"];
	const index = tiers.indexOf(current);
	if (index < tiers.size() - 1) {
		return tiers[index + 1];
	}
	return undefined;
}

// Add XP to player's pet (call when collecting coins)
export function addPetXP(player: Player, amount: number) {
	const data = playerPetData.get(player);
	if (!data) return;
	
	data.xp += amount;
	playerPetData.set(player, data);
	
	// Notify client
	const xpRemote = ReplicatedStorage.FindFirstChild("PetXPGained") as RemoteEvent | undefined;
	if (xpRemote) {
		xpRemote.FireClient(player, amount, data.xp);
	}
}

// Get multiplier for coin collection
export function getPetMultiplier(player: Player): number {
	const data = playerPetData.get(player);
	if (!data) return 1;
	return TIER_MULTIPLIERS[data.tier];
}

// Update player's active pet
export function setPlayerPet(player: Player, petName: string) {
	const data = playerPetData.get(player);
	if (data) {
		data.name = petName;
		data.xp = 0;
		data.tier = "Normal";
		playerPetData.set(player, data);
	}
}
