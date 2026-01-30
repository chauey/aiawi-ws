// Pet Fusion - Combine duplicate pets for stronger versions!
// PROVEN: Pet Simulator X uses this to create pet sinks and drive egg purchases
import { Players, ReplicatedStorage } from "@rbxts/services";

// Fusion tiers
export type FusionTier = "Normal" | "Golden" | "Rainbow" | "Dark Matter";

// Fusion requirements
const FUSION_REQUIREMENTS: { [key: string]: { count: number; result: FusionTier; multiplier: number } } = {
	Normal: { count: 3, result: "Golden", multiplier: 2.0 },
	Golden: { count: 3, result: "Rainbow", multiplier: 5.0 },
	Rainbow: { count: 3, result: "Dark Matter", multiplier: 15.0 },
};

// Track player pet inventories (simplified - normally use DataStore)
interface PetInventory {
	[petName: string]: { tier: FusionTier; count: number }[];
}

const playerPets = new Map<Player, PetInventory>();

export function setupPetFusion() {
	const getPetsRemote = new Instance("RemoteFunction");
	getPetsRemote.Name = "GetPetInventory";
	getPetsRemote.Parent = ReplicatedStorage;
	
	const fuseRemote = new Instance("RemoteFunction");
	fuseRemote.Name = "FusePets";
	fuseRemote.Parent = ReplicatedStorage;
	
	const fusionNotifyRemote = new Instance("RemoteEvent");
	fusionNotifyRemote.Name = "FusionNotify";
	fusionNotifyRemote.Parent = ReplicatedStorage;
	
	// Initialize players with some starter pets
	Players.PlayerAdded.Connect((player) => {
		playerPets.set(player, {
			dog: [{ tier: "Normal", count: 1 }],
			cat: [{ tier: "Normal", count: 1 }],
		});
	});
	
	Players.PlayerRemoving.Connect((player) => {
		playerPets.delete(player);
	});
	
	// Get pet inventory
	getPetsRemote.OnServerInvoke = (player) => {
		const inventory = playerPets.get(player);
		if (!inventory) return {};
		
		// Format for client
		const result: { name: string; tier: string; count: number; canFuse: boolean }[] = [];
		
		for (const [petName, tiers] of pairs(inventory)) {
			for (const item of tiers) {
				const req = FUSION_REQUIREMENTS[item.tier];
				result.push({
					name: petName as string,
					tier: item.tier,
					count: item.count,
					canFuse: req !== undefined && item.count >= req.count,
				});
			}
		}
		
		return result;
	};
	
	// Fuse pets
	fuseRemote.OnServerInvoke = (player, petName, tier) => {
		if (!typeIs(petName, "string") || !typeIs(tier, "string")) {
			return { success: false, message: "Invalid request!" };
		}
		
		const inventory = playerPets.get(player);
		if (!inventory) return { success: false, message: "No inventory!" };
		
		const petTiers = inventory[petName];
		if (!petTiers) return { success: false, message: "Pet not found!" };
		
		const tierItem = petTiers.find(t => t.tier === tier);
		if (!tierItem) return { success: false, message: "Tier not found!" };
		
		const req = FUSION_REQUIREMENTS[tier];
		if (!req) return { success: false, message: "Cannot fuse this tier!" };
		
		if (tierItem.count < req.count) {
			return { success: false, message: `Need ${req.count} ${tier} pets!` };
		}
		
		// Perform fusion!
		tierItem.count -= req.count;
		
		// Add new tier
		const existingNewTier = petTiers.find(t => t.tier === req.result);
		if (existingNewTier) {
			existingNewTier.count += 1;
		} else {
			petTiers.push({ tier: req.result, count: 1 });
		}
		
		// Notify client
		fusionNotifyRemote.FireClient(player, petName, req.result, req.multiplier);
		
		print(`✨ ${player.Name} fused ${req.count} ${tier} ${petName} into ${req.result}!`);
		
		return { 
			success: true, 
			newTier: req.result,
			multiplier: req.multiplier
		};
	};
	
	print("✨ Pet fusion ready! Combine pets for stronger versions!");
}

// Add pet to player inventory (call when hatching eggs)
export function addPetToInventory(player: Player, petName: string, tier: FusionTier = "Normal") {
	let inventory = playerPets.get(player);
	if (!inventory) {
		inventory = {};
		playerPets.set(player, inventory);
	}
	
	if (!inventory[petName]) {
		inventory[petName] = [];
	}
	
	const petTiers = inventory[petName];
	const existing = petTiers.find(t => t.tier === tier);
	if (existing) {
		existing.count += 1;
	} else {
		petTiers.push({ tier, count: 1 });
	}
}
