// Dragon Legends - Breeding System (Server)
// Dragon breeding with genetic inheritance and mutation

import { Players, ReplicatedStorage } from '@rbxts/services';
import {
  DRAGONS,
  DragonDefinition,
  GAME_CONFIG,
  Element,
  Rarity,
} from '../shared/config';
import { PlayerDragon, BreedingSlot, BreedingResult } from '../shared/types';
import { createPlayerDragon, getPlayerDragons } from './dragons';
import { getPlayerData, updatePlayerData } from './dataStore';

// Active breeding slots per player
const playerBreedingSlots = new Map<number, BreedingSlot[]>();

// Breeding outcomes based on parent elements
const HYBRID_OUTCOMES: { [key: string]: string[] } = {
  'fire+water': ['fire_drake_baby', 'water_wyrm_baby'], // Steam element future?
  'fire+ice': ['fire_drake_baby', 'frost_drake_baby', 'crystal_dragon'], // Crystal is rare hybrid
  'water+ice': ['water_wyrm_baby', 'frost_drake_baby'],
  'electric+water': ['thunder_dragon_baby', 'water_wyrm_baby'],
  'nature+water': ['nature_spirit_baby', 'water_wyrm_baby'],
  'shadow+light': ['shadow_serpent_baby', 'light_sprite_baby', 'cosmic_dragon'], // Cosmic rare hybrid
  'fire+nature': ['fire_drake_baby', 'nature_spirit_baby'],
  'electric+nature': ['thunder_dragon_baby', 'nature_spirit_baby'],
};

// Get breeding key (sorted to handle both directions)
function getBreedingKey(elem1: Element, elem2: Element): string {
  const sorted = [elem1, elem2].sort();
  return `${sorted[0]}+${sorted[1]}`;
}

// Determine breeding result
function determineBreedingResult(
  dragon1: PlayerDragon,
  dragon2: PlayerDragon,
): { dragonId: string; isShiny: boolean; isMutation: boolean } {
  // Check for mutation (rare hybrid)
  const isMutation = math.random() < GAME_CONFIG.MUTATION_CHANCE;

  // Get hybrid key
  const key = getBreedingKey(dragon1.element, dragon2.element);
  let possibleOutcomes = HYBRID_OUTCOMES[key];

  // If same element, offspring is same element
  if (dragon1.element === dragon2.element) {
    // Find baby version of this element using pairs iteration
    const babyDragons: DragonDefinition[] = [];
    for (const [, d] of pairs(DRAGONS)) {
      if (d.element === dragon1.element && d.evolutionStage === 1) {
        babyDragons.push(d);
      }
    }
    if (babyDragons.size() > 0) {
      possibleOutcomes = babyDragons.map((d: DragonDefinition) => d.id);
    }
  }

  // Default to fire if no outcomes
  if (!possibleOutcomes || possibleOutcomes.size() === 0) {
    possibleOutcomes = ['fire_drake_baby'];
  }

  // If mutation, try for rare hybrid
  let selectedDragonId: string;
  if (isMutation && possibleOutcomes.size() > 2) {
    // Pick the rare option (usually last in list)
    selectedDragonId = possibleOutcomes[possibleOutcomes.size() - 1];
  } else {
    // Pick random from common options
    const commonOutcomes = possibleOutcomes.filter((id) => {
      const def = DRAGONS[id];
      return def && (def.rarity === 'Common' || def.rarity === 'Rare');
    });
    if (commonOutcomes.size() > 0) {
      selectedDragonId =
        commonOutcomes[math.floor(math.random() * commonOutcomes.size())];
    } else {
      selectedDragonId = possibleOutcomes[0];
    }
  }

  // Shiny chance increases with parent luck
  const combinedLuck = dragon1.stats.luck + dragon2.stats.luck;
  const shinyChance = 0.01 + combinedLuck * 0.001; // 1% + luck bonus
  const isShiny = math.random() < shinyChance;

  return {
    dragonId: selectedDragonId,
    isShiny,
    isMutation,
  };
}

// Start breeding two dragons
export function startBreeding(
  player: Player,
  dragon1InstanceId: string,
  dragon2InstanceId: string,
): {
  success: boolean;
  slot?: BreedingSlot;
  error?: string;
} {
  const dragons = getPlayerDragons(player);
  const dragon1 = dragons.find((d) => d.instanceId === dragon1InstanceId);
  const dragon2 = dragons.find((d) => d.instanceId === dragon2InstanceId);

  if (!dragon1 || !dragon2) {
    return { success: false, error: 'Dragons not found' };
  }

  if (dragon1.instanceId === dragon2.instanceId) {
    return { success: false, error: 'Cannot breed dragon with itself' };
  }

  // Check evolution stage (must be adult or higher)
  if (dragon1.evolutionStage < 3 || dragon2.evolutionStage < 3) {
    return { success: false, error: 'Dragons must be adults to breed' };
  }

  // Check breeding cooldown (max 3 breeds per dragon)
  if (dragon1.breedCount >= 3 || dragon2.breedCount >= 3) {
    return { success: false, error: 'Dragon has reached max breed count' };
  }

  // Get or create breeding slots
  let slots = playerBreedingSlots.get(player.UserId);
  if (!slots) {
    slots = [];
    playerBreedingSlots.set(player.UserId, slots);
  }

  // Check if already breeding
  const alreadyBreeding = slots.some(
    (s) =>
      s.dragon1InstanceId === dragon1InstanceId ||
      s.dragon2InstanceId === dragon2InstanceId ||
      s.dragon1InstanceId === dragon2InstanceId ||
      s.dragon2InstanceId === dragon1InstanceId,
  );

  if (alreadyBreeding) {
    return {
      success: false,
      error: 'One of these dragons is already breeding',
    };
  }

  // Calculate breeding time (minutes to seconds)
  const breedingTime = GAME_CONFIG.BREEDING_TIME_MINUTES * 60;
  const startTime = os.time();
  const endTime = startTime + breedingTime;

  // Determine result ahead of time
  const result = determineBreedingResult(dragon1, dragon2);

  const slot: BreedingSlot = {
    slotId: slots.size() + 1,
    dragon1InstanceId,
    dragon2InstanceId,
    startTime,
    endTime,
    resultDragonId: result.dragonId,
    isShiny: result.isShiny,
  };

  slots.push(slot);

  // Increment breed counts
  dragon1.breedCount++;
  dragon2.breedCount++;

  print(
    `🥚 ${player.Name} started breeding! Result ready in ${GAME_CONFIG.BREEDING_TIME_MINUTES} minutes.`,
  );

  return { success: true, slot };
}

// Collect breeding result
export function collectBreedingResult(
  player: Player,
  slotId: number,
): {
  success: boolean;
  dragon?: PlayerDragon;
  error?: string;
} {
  const slots = playerBreedingSlots.get(player.UserId);
  if (!slots) {
    return { success: false, error: 'No breeding slots' };
  }

  const slotIndex = slots.findIndex((s) => s.slotId === slotId);
  if (slotIndex === -1) {
    return { success: false, error: 'Slot not found' };
  }

  const slot = slots[slotIndex];

  // Check if ready
  if (os.time() < slot.endTime) {
    const remaining = slot.endTime - os.time();
    const minutes = math.floor(remaining / 60);
    const seconds = remaining % 60;
    return {
      success: false,
      error: `Not ready yet! ${minutes}m ${seconds}s remaining`,
    };
  }

  // Create the dragon
  if (!slot.resultDragonId) {
    return { success: false, error: 'No result dragon' };
  }

  const newDragon = createPlayerDragon(
    player,
    slot.resultDragonId,
    slot.isShiny,
  );
  if (!newDragon) {
    return { success: false, error: 'Failed to create dragon' };
  }

  // Remove slot
  slots.remove(slotIndex);

  // Update stats
  const playerData = getPlayerData(player);
  if (playerData) {
    playerData.dragonsHatched++;
    updatePlayerData(player, playerData);
  }

  print(
    `🐣 ${player.Name} collected ${slot.isShiny ? '✨SHINY ' : ''}${DRAGONS[slot.resultDragonId]?.name}!`,
  );

  return { success: true, dragon: newDragon };
}

// Get active breeding slots
export function getBreedingSlots(player: Player): BreedingSlot[] {
  return playerBreedingSlots.get(player.UserId) || [];
}

// Speed up breeding with gems
export function speedUpBreeding(
  player: Player,
  slotId: number,
  gemCost: number,
): { success: boolean; error?: string } {
  const slots = playerBreedingSlots.get(player.UserId);
  if (!slots) {
    return { success: false, error: 'No breeding slots' };
  }

  const slot = slots.find((s) => s.slotId === slotId);
  if (!slot) {
    return { success: false, error: 'Slot not found' };
  }

  // Check gems
  const playerData = getPlayerData(player);
  if (!playerData || playerData.gems < gemCost) {
    return { success: false, error: 'Not enough gems' };
  }

  // Deduct gems and complete instantly
  playerData.gems -= gemCost;
  slot.endTime = os.time(); // Ready now
  updatePlayerData(player, playerData);

  print(`⚡ ${player.Name} sped up breeding for ${gemCost} gems!`);

  return { success: true };
}

// Setup breeding system
export function setupBreedingSystem(): void {
  const remotes =
    (ReplicatedStorage.FindFirstChild('DragonRemotes') as Folder) ||
    new Instance('Folder');
  remotes.Name = 'DragonRemotes';
  remotes.Parent = ReplicatedStorage;

  const startBreedingRemote = new Instance('RemoteFunction');
  startBreedingRemote.Name = 'StartBreeding';
  startBreedingRemote.Parent = remotes;

  const collectBreedingRemote = new Instance('RemoteFunction');
  collectBreedingRemote.Name = 'CollectBreeding';
  collectBreedingRemote.Parent = remotes;

  const getBreedingSlotsRemote = new Instance('RemoteFunction');
  getBreedingSlotsRemote.Name = 'GetBreedingSlots';
  getBreedingSlotsRemote.Parent = remotes;

  const speedUpBreedingRemote = new Instance('RemoteFunction');
  speedUpBreedingRemote.Name = 'SpeedUpBreeding';
  speedUpBreedingRemote.Parent = remotes;

  startBreedingRemote.OnServerInvoke = (player, dragon1Id, dragon2Id) => {
    if (!typeIs(dragon1Id, 'string') || !typeIs(dragon2Id, 'string')) {
      return { success: false, error: 'Invalid parameters' };
    }
    return startBreeding(player, dragon1Id, dragon2Id);
  };

  collectBreedingRemote.OnServerInvoke = (player, slotId) => {
    if (!typeIs(slotId, 'number')) {
      return { success: false, error: 'Invalid slot ID' };
    }
    return collectBreedingResult(player, slotId);
  };

  getBreedingSlotsRemote.OnServerInvoke = (player) => {
    return getBreedingSlots(player);
  };

  speedUpBreedingRemote.OnServerInvoke = (player, slotId, gemCost) => {
    if (!typeIs(slotId, 'number') || !typeIs(gemCost, 'number')) {
      return { success: false, error: 'Invalid parameters' };
    }
    return speedUpBreeding(player, slotId, gemCost);
  };

  // Clean up on player leave
  Players.PlayerRemoving.Connect((player) => {
    playerBreedingSlots.delete(player.UserId);
  });

  print('🧬 Breeding System initialized!');
}
