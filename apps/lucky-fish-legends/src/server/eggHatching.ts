// Egg Hatching System - Gacha-style pet collection
// Like Pet Simulator, Adopt Me - proven to drive engagement and revenue!
import { Players, ReplicatedStorage } from "@rbxts/services";

// Egg types with rarity weights
interface EggType {
	name: string;
	price: number;
	color: Color3;
	pets: { pet: string; weight: number; rarity: string }[];
}

// Egg configurations
export const EGG_TYPES: { [key: string]: EggType } = {
	basic: {
		name: "Basic Egg",
		price: 50,
		color: Color3.fromRGB(200, 200, 200),
		pets: [
			{ pet: "cat", weight: 30, rarity: "Common" },
			{ pet: "dog", weight: 30, rarity: "Common" },
			{ pet: "bunny", weight: 20, rarity: "Uncommon" },
			{ pet: "hamster", weight: 15, rarity: "Uncommon" },
			{ pet: "fox", weight: 5, rarity: "Rare" },
		]
	},
	premium: {
		name: "Premium Egg",
		price: 250,
		color: Color3.fromRGB(180, 130, 255),
		pets: [
			{ pet: "bear", weight: 25, rarity: "Uncommon" },
			{ pet: "panda", weight: 25, rarity: "Uncommon" },
			{ pet: "penguin", weight: 20, rarity: "Rare" },
			{ pet: "owl", weight: 15, rarity: "Rare" },
			{ pet: "lion", weight: 10, rarity: "Epic" },
			{ pet: "tiger", weight: 5, rarity: "Epic" },
		]
	},
	legendary: {
		name: "Legendary Egg",
		price: 1000,
		color: Color3.fromRGB(255, 200, 50),
		pets: [
			{ pet: "lion", weight: 25, rarity: "Epic" },
			{ pet: "tiger", weight: 25, rarity: "Epic" },
			{ pet: "elephant", weight: 20, rarity: "Epic" },
			{ pet: "unicorn", weight: 15, rarity: "Legendary" },
			{ pet: "dragon", weight: 10, rarity: "Legendary" },
			{ pet: "phoenix", weight: 5, rarity: "Mythic" },
		]
	},
	mythic: {
		name: "Mythic Egg",
		price: 5000,
		color: Color3.fromRGB(255, 100, 150),
		pets: [
			{ pet: "unicorn", weight: 30, rarity: "Legendary" },
			{ pet: "dragon", weight: 30, rarity: "Legendary" },
			{ pet: "phoenix", weight: 25, rarity: "Mythic" },
			{ pet: "crab", weight: 15, rarity: "Mythic" }, // Golden crab is rare!
		]
	}
};

// Rarity colors for UI
export const RARITY_COLORS: { [key: string]: Color3 } = {
	Common: Color3.fromRGB(180, 180, 180),
	Uncommon: Color3.fromRGB(100, 200, 100),
	Rare: Color3.fromRGB(100, 150, 255),
	Epic: Color3.fromRGB(180, 100, 255),
	Legendary: Color3.fromRGB(255, 200, 50),
	Mythic: Color3.fromRGB(255, 100, 150),
};

// Player's owned pets from eggs
const playerOwnedPets = new Map<Player, string[]>();

export function setupEggSystem() {
	// Create remotes
	const buyEggRemote = new Instance("RemoteFunction");
	buyEggRemote.Name = "BuyEgg";
	buyEggRemote.Parent = ReplicatedStorage;
	
	const getOwnedPetsRemote = new Instance("RemoteFunction");
	getOwnedPetsRemote.Name = "GetEggPets";
	getOwnedPetsRemote.Parent = ReplicatedStorage;
	
	const hatchResultRemote = new Instance("RemoteEvent");
	hatchResultRemote.Name = "HatchResult";
	hatchResultRemote.Parent = ReplicatedStorage;
	
	// Initialize player inventories
	Players.PlayerAdded.Connect((player) => {
		playerOwnedPets.set(player, []);
	});
	
	Players.PlayerRemoving.Connect((player) => {
		playerOwnedPets.delete(player);
	});
	
	// Handle egg purchase
	buyEggRemote.OnServerInvoke = (player, eggType) => {
		if (!typeIs(eggType, "string")) return { success: false, message: "Invalid egg type" };
		
		const egg = EGG_TYPES[eggType];
		if (!egg) return { success: false, message: "Unknown egg" };
		
		// Check coins
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		if (!coins || coins.Value < egg.price) {
			return { success: false, message: "Not enough coins!" };
		}
		
		// Deduct coins
		coins.Value -= egg.price;
		
		// Roll for pet using weighted random
		const pet = rollForPet(egg.pets);
		
		// Add to player's collection
		const owned = playerOwnedPets.get(player) ?? [];
		owned.push(pet.pet);
		playerOwnedPets.set(player, owned);
		
		// Send hatch result to client for animation
		hatchResultRemote.FireClient(player, pet.pet, pet.rarity);
		
		print(`🥚 ${player.Name} hatched a ${pet.rarity} ${pet.pet} from ${egg.name}!`);
		
		return { success: true, pet: pet.pet, rarity: pet.rarity };
	};
	
	// Get owned pets
	getOwnedPetsRemote.OnServerInvoke = (player) => {
		return playerOwnedPets.get(player) ?? [];
	};
	
	print("🥚 Egg hatching system ready!");
}

function rollForPet(pets: { pet: string; weight: number; rarity: string }[]): { pet: string; rarity: string } {
	// Calculate total weight
	let totalWeight = 0;
	for (const p of pets) {
		totalWeight += p.weight;
	}
	
	// Roll
	let roll = math.random() * totalWeight;
	
	for (const p of pets) {
		roll -= p.weight;
		if (roll <= 0) {
			return { pet: p.pet, rarity: p.rarity };
		}
	}
	
	// Fallback to first pet
	return { pet: pets[0].pet, rarity: pets[0].rarity };
}

// Export egg types for UI
export function getEggTypes() {
	return EGG_TYPES;
}
