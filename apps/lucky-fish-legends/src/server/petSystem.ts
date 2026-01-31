/**
 * Pet System Server - Lucky Fish Legends
 * Manages pet ownership, hatching, and bonuses
 */

import { Players, ReplicatedStorage } from '@rbxts/services';
import {
  OwnedPet,
  PET_SPECIES,
  EGG_TYPES,
  getSpeciesById,
  getEggById,
  VARIANT_CHANCES,
  PetVariant,
  PetRarity,
  getXpForLevel,
} from '../shared/petData';
import { HttpService } from '@rbxts/services';

// Player pet state
interface PlayerPetState {
  pets: OwnedPet[];
  equippedPets: string[]; // uniqueIds
  maxEquipped: number;
  coins: number;
  incubatingEggs: IncubatingEgg[];
}

interface IncubatingEgg {
  eggId: string;
  startTime: number;
  hatchTime: number;
}

// In-memory player data
const playerPetData = new Map<Player, PlayerPetState>();

// Remotes
let petsFolder: Folder;
let buyEggRemote: RemoteFunction;
let hatchEggRemote: RemoteFunction;
let equipPetRemote: RemoteFunction;
let getPetsRemote: RemoteFunction;
let releasePetRemote: RemoteFunction;

export function setupPetSystem() {
  // Create remotes folder
  petsFolder = new Instance('Folder');
  petsFolder.Name = 'PetRemotes';
  petsFolder.Parent = ReplicatedStorage;

  // Buy Egg
  buyEggRemote = new Instance('RemoteFunction');
  buyEggRemote.Name = 'BuyEgg';
  buyEggRemote.Parent = petsFolder;
  buyEggRemote.OnServerInvoke = handleBuyEgg;

  // Hatch Egg
  hatchEggRemote = new Instance('RemoteFunction');
  hatchEggRemote.Name = 'HatchEgg';
  hatchEggRemote.Parent = petsFolder;
  hatchEggRemote.OnServerInvoke = handleHatchEgg;

  // Equip Pet
  equipPetRemote = new Instance('RemoteFunction');
  equipPetRemote.Name = 'EquipPet';
  equipPetRemote.Parent = petsFolder;
  equipPetRemote.OnServerInvoke = handleEquipPet;

  // Get Pets
  getPetsRemote = new Instance('RemoteFunction');
  getPetsRemote.Name = 'GetPets';
  getPetsRemote.Parent = petsFolder;
  getPetsRemote.OnServerInvoke = handleGetPets;

  // Release Pet
  releasePetRemote = new Instance('RemoteFunction');
  releasePetRemote.Name = 'ReleasePet';
  releasePetRemote.Parent = petsFolder;
  releasePetRemote.OnServerInvoke = handleReleasePet;

  // Initialize players
  Players.PlayerAdded.Connect(initPlayerPets);
  for (const player of Players.GetPlayers()) {
    initPlayerPets(player);
  }

  // Cleanup on leave
  Players.PlayerRemoving.Connect((player) => {
    playerPetData.delete(player);
  });

  print('🐾 Pet System initialized!');
}

function initPlayerPets(player: Player) {
  // Give starter pet to new players
  const starterPet = createPet('fishy_friend', 'normal');
  starterPet.isEquipped = true;

  playerPetData.set(player, {
    pets: [starterPet],
    equippedPets: [starterPet.uniqueId],
    maxEquipped: 3,
    coins: 1000, // Starter coins
    incubatingEggs: [],
  });

  print(`🐾 ${player.Name} joined with starter pet!`);
}

function handleBuyEgg(
  player: Player,
  eggId: unknown,
): { success: boolean; message: string; egg?: IncubatingEgg } {
  if (!typeIs(eggId, 'string')) {
    return { success: false, message: 'Invalid egg ID' };
  }

  const egg = getEggById(eggId);
  if (!egg) {
    return { success: false, message: 'Egg type not found' };
  }

  const state = playerPetData.get(player);
  if (!state) {
    return { success: false, message: 'Player data not found' };
  }

  if (state.coins < egg.cost) {
    return {
      success: false,
      message: `Need ${egg.cost} coins (you have ${state.coins})`,
    };
  }

  // Max 3 eggs incubating
  if (state.incubatingEggs.size() >= 3) {
    return { success: false, message: 'Max 3 eggs can incubate at once!' };
  }

  // Deduct coins
  state.coins -= egg.cost;

  // Start incubation
  const incubatingEgg: IncubatingEgg = {
    eggId: eggId,
    startTime: tick(),
    hatchTime: egg.hatchTime,
  };
  state.incubatingEggs.push(incubatingEgg);

  print(`🥚 ${player.Name} bought ${egg.name}!`);

  return { success: true, message: `Bought ${egg.name}!`, egg: incubatingEgg };
}

function handleHatchEgg(
  player: Player,
  eggIndex: unknown,
): { success: boolean; message: string; pet?: OwnedPet } {
  if (!typeIs(eggIndex, 'number')) {
    return { success: false, message: 'Invalid egg index' };
  }

  const state = playerPetData.get(player);
  if (!state) {
    return { success: false, message: 'Player data not found' };
  }

  const incubatingEgg = state.incubatingEggs[eggIndex];
  if (!incubatingEgg) {
    return { success: false, message: 'No egg at that index' };
  }

  // Check if ready
  const elapsed = tick() - incubatingEgg.startTime;
  if (elapsed < incubatingEgg.hatchTime) {
    const remaining = math.ceil(incubatingEgg.hatchTime - elapsed);
    return { success: false, message: `${remaining}s remaining!` };
  }

  const eggType = getEggById(incubatingEgg.eggId);
  if (!eggType) {
    return { success: false, message: 'Invalid egg type' };
  }

  // Roll for pet
  const pet = rollPetFromEgg(eggType);
  state.pets.push(pet);

  // Remove from incubating
  state.incubatingEggs.remove(eggIndex);

  const species = getSpeciesById(pet.speciesId);
  print(
    `🐣 ${player.Name} hatched ${pet.variant} ${species?.name ?? pet.speciesId}!`,
  );

  return { success: true, message: `Hatched ${species?.name}!`, pet };
}

function rollPetFromEgg(egg: (typeof EGG_TYPES)[0]): OwnedPet {
  // Roll rarity
  const rarityRoll = math.random();
  let cumulative = 0;
  let rolledRarity: PetRarity = 'common';

  for (const [rarity, chance] of pairs(egg.rarityChances)) {
    cumulative += chance;
    if (rarityRoll <= cumulative) {
      rolledRarity = rarity as PetRarity;
      break;
    }
  }

  // Get possible pets of this rarity from the egg
  const possiblePets: (typeof PET_SPECIES)[0][] = [];
  for (const id of egg.possiblePets) {
    const species = getSpeciesById(id);
    if (species && species.rarity === rolledRarity) {
      possiblePets.push(species);
    }
  }

  // Fallback to any pet in egg if none match rarity
  let selectedSpecies =
    possiblePets[math.random(0, math.max(0, possiblePets.size() - 1))];
  if (!selectedSpecies) {
    const allPets: (typeof PET_SPECIES)[0][] = [];
    for (const id of egg.possiblePets) {
      const species = getSpeciesById(id);
      if (species) {
        allPets.push(species);
      }
    }
    selectedSpecies = allPets[math.random(0, math.max(0, allPets.size() - 1))];
  }

  // Roll variant
  let variant: PetVariant = 'normal';
  const variantRoll = math.random();
  if (variantRoll <= VARIANT_CHANCES.rainbow) {
    variant = 'rainbow';
  } else if (variantRoll <= VARIANT_CHANCES.golden) {
    variant = 'golden';
  } else if (variantRoll <= VARIANT_CHANCES.shiny) {
    variant = 'shiny';
  }

  return createPet(selectedSpecies?.id ?? 'fishy_friend', variant);
}

function createPet(speciesId: string, variant: PetVariant): OwnedPet {
  const species = getSpeciesById(speciesId);
  return {
    uniqueId: HttpService.GenerateGUID(false),
    speciesId,
    name: species?.name ?? 'Unknown Pet',
    level: 1,
    xp: 0,
    variant,
    isEquipped: false,
    obtainedAt: tick(),
    totalFishCaught: 0,
  };
}

function handleEquipPet(
  player: Player,
  petId: unknown,
): { success: boolean; message: string } {
  if (!typeIs(petId, 'string')) {
    return { success: false, message: 'Invalid pet ID' };
  }

  const state = playerPetData.get(player);
  if (!state) {
    return { success: false, message: 'Player data not found' };
  }

  const pet = state.pets.find((p) => p.uniqueId === petId);
  if (!pet) {
    return { success: false, message: 'Pet not found' };
  }

  if (pet.isEquipped) {
    // Unequip
    pet.isEquipped = false;
    state.equippedPets = state.equippedPets.filter((id) => id !== petId);
    return { success: true, message: `Unequipped ${pet.name}` };
  } else {
    // Check max equipped
    if (state.equippedPets.size() >= state.maxEquipped) {
      return {
        success: false,
        message: `Max ${state.maxEquipped} pets equipped!`,
      };
    }
    pet.isEquipped = true;
    state.equippedPets.push(petId);
    return { success: true, message: `Equipped ${pet.name}!` };
  }
}

function handleGetPets(player: Player): PlayerPetState | undefined {
  return playerPetData.get(player);
}

function handleReleasePet(
  player: Player,
  petId: unknown,
): { success: boolean; message: string; coinsGained?: number } {
  if (!typeIs(petId, 'string')) {
    return { success: false, message: 'Invalid pet ID' };
  }

  const state = playerPetData.get(player);
  if (!state) {
    return { success: false, message: 'Player data not found' };
  }

  const petIndex = state.pets.findIndex((p) => p.uniqueId === petId);
  if (petIndex === -1) {
    return { success: false, message: 'Pet not found' };
  }

  const pet = state.pets[petIndex];

  // Can't release last pet
  if (state.pets.size() <= 1) {
    return { success: false, message: "Can't release your last pet!" };
  }

  // Unequip if equipped
  if (pet.isEquipped) {
    state.equippedPets = state.equippedPets.filter((id) => id !== petId);
  }

  // Give coins based on rarity
  const species = getSpeciesById(pet.speciesId);
  const baseCoins = species ? species.basePower * 2 : 10;
  state.coins += baseCoins;

  state.pets.remove(petIndex);

  return {
    success: true,
    message: `Released ${pet.name}`,
    coinsGained: baseCoins,
  };
}

// Export for fishing system integration
export function getPlayerPetBonuses(player: Player): {
  fishingBonus: number;
  coinBonus: number;
} {
  const state = playerPetData.get(player);
  if (!state) return { fishingBonus: 0, coinBonus: 0 };

  let fishingBonus = 0;
  let coinBonus = 0;

  for (const petId of state.equippedPets) {
    const pet = state.pets.find((p) => p.uniqueId === petId);
    if (!pet) continue;

    const species = getSpeciesById(pet.speciesId);
    if (species) {
      fishingBonus += species.fishingBonus;
      coinBonus += species.coinBonus;
    }
  }

  return { fishingBonus, coinBonus };
}

export function addPetXp(player: Player, amount: number): void {
  const state = playerPetData.get(player);
  if (!state) return;

  for (const petId of state.equippedPets) {
    const pet = state.pets.find((p) => p.uniqueId === petId);
    if (!pet) continue;

    pet.xp += amount;
    pet.totalFishCaught += 1;

    // Check level up
    const xpNeeded = getXpForLevel(pet.level + 1);
    while (pet.xp >= xpNeeded) {
      pet.xp -= xpNeeded;
      pet.level += 1;
      print(`🎉 ${player.Name}'s ${pet.name} leveled up to ${pet.level}!`);
    }
  }
}
