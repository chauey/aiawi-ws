/**
 * Fishing Server System - Lucky Fish Legends
 * Server-side fishing mechanics using roblox-core fishing system
 */

import {
  Players,
  ReplicatedStorage,
  ServerScriptService,
} from '@rbxts/services';
import {
  getInitialFishingState,
  PlayerFishingState,
  castLine,
  reelIn,
  sellFish,
  getPlayerStats,
  getCollectionProgress,
  SAMPLE_FISH_SPECIES,
  SAMPLE_LOCATIONS,
  SAMPLE_RODS,
  SAMPLE_BAITS,
  DEFAULT_FISHING_CONFIG,
  FishingRod,
  Bait,
  calculateSellPrice,
  FishSpecies,
} from '@aiawi/roblox-core';

// Player fishing states
const playerStates = new Map<Player, PlayerFishingState>();

// Remote events for client-server communication
const remotes = {
  castLine: new Instance('RemoteEvent'),
  reelIn: new Instance('RemoteEvent'),
  sellFish: new Instance('RemoteEvent'),
  equipRod: new Instance('RemoteEvent'),
  equipBait: new Instance('RemoteEvent'),
  getStats: new Instance('RemoteFunction'),
  getCollection: new Instance('RemoteFunction'),
  getInventory: new Instance('RemoteFunction'),
  purchaseRod: new Instance('RemoteEvent'),
  purchaseBait: new Instance('RemoteEvent'),
  changeLocation: new Instance('RemoteEvent'),
};

// Set up remotes in ReplicatedStorage
function setupRemotes(): void {
  let fishingFolder = ReplicatedStorage.FindFirstChild(
    'FishingRemotes',
  ) as Folder;
  if (!fishingFolder) {
    fishingFolder = new Instance('Folder');
    fishingFolder.Name = 'FishingRemotes';
    fishingFolder.Parent = ReplicatedStorage;
  }

  remotes.castLine.Name = 'CastLine';
  remotes.castLine.Parent = fishingFolder;

  remotes.reelIn.Name = 'ReelIn';
  remotes.reelIn.Parent = fishingFolder;

  remotes.sellFish.Name = 'SellFish';
  remotes.sellFish.Parent = fishingFolder;

  remotes.equipRod.Name = 'EquipRod';
  remotes.equipRod.Parent = fishingFolder;

  remotes.equipBait.Name = 'EquipBait';
  remotes.equipBait.Parent = fishingFolder;

  remotes.getStats.Name = 'GetStats';
  remotes.getStats.Parent = fishingFolder;

  remotes.getCollection.Name = 'GetCollection';
  remotes.getCollection.Parent = fishingFolder;

  remotes.getInventory.Name = 'GetInventory';
  remotes.getInventory.Parent = fishingFolder;

  remotes.purchaseRod.Name = 'PurchaseRod';
  remotes.purchaseRod.Parent = fishingFolder;

  remotes.purchaseBait.Name = 'PurchaseBait';
  remotes.purchaseBait.Parent = fishingFolder;

  remotes.changeLocation.Name = 'ChangeLocation';
  remotes.changeLocation.Parent = fishingFolder;
}

// Get or create player state
function getPlayerState(player: Player): PlayerFishingState {
  let state = playerStates.get(player);
  if (!state) {
    state = getInitialFishingState();
    playerStates.set(player, state);
  }
  return state;
}

// Handle cast line request
function handleCastLine(player: Player, locationId: string): void {
  const state = getPlayerState(player);
  const location = SAMPLE_LOCATIONS.find((l) => l.id === locationId);

  if (!location) {
    warn(`[Fishing] Invalid location: ${locationId}`);
    return;
  }

  const result = castLine(state, location, DEFAULT_FISHING_CONFIG);

  if (result.success) {
    print(`[Fishing] ${player.Name} cast line at ${location.name}`);

    // Notify client of cast success
    remotes.castLine.FireClient(player, {
      success: true,
      estimatedCatchTime: result.estimatedCatchTime,
      locationId,
    });

    // Schedule auto-bite after estimated time (with some variance)
    const catchTime = result.estimatedCatchTime ?? 3000;
    const variance = math.random(-500, 500);
    const actualTime = math.max(1000, catchTime + variance);

    task.delay(actualTime / 1000, () => {
      // Check if player is still fishing
      const currentState = playerStates.get(player);
      if (
        currentState?.isFishing &&
        currentState.currentLocationId === locationId
      ) {
        // Notify client that fish is biting
        remotes.castLine.FireClient(player, {
          event: 'bite',
          message: 'A fish is biting!',
        });
      }
    });
  } else {
    remotes.castLine.FireClient(player, {
      success: false,
      error: result.error,
      code: result.code,
    });
  }
}

// Handle reel in request
function handleReelIn(player: Player): void {
  const state = getPlayerState(player);

  const result = reelIn(
    state,
    SAMPLE_FISH_SPECIES,
    SAMPLE_LOCATIONS,
    DEFAULT_FISHING_CONFIG,
  );

  if (result.success && result.fish && result.species) {
    const message = formatCatchMessage(result);
    print(`[Fishing] ${player.Name} caught: ${message}`);

    remotes.reelIn.FireClient(player, {
      success: true,
      fish: result.fish,
      species: {
        id: result.species.id,
        name: result.species.name,
        rarity: result.species.rarity,
      },
      xpGained: result.xpGained,
      levelUp: result.levelUp,
      newLevel: result.newLevel,
      isNewDiscovery: result.isNewDiscovery,
      isPersonalRecord: result.isPersonalRecord,
    });

    // Play celebration effects for rare catches
    if (
      result.species.rarity === 'legendary' ||
      result.species.rarity === 'mythic'
    ) {
      playCelebrationEffect(player, result.species.rarity);
    }
  } else {
    remotes.reelIn.FireClient(player, {
      success: false,
      error: result.error,
      code: result.code,
    });
  }
}

// Handle sell fish request
function handleSellFish(player: Player, fishIndex: number): void {
  const state = getPlayerState(player);

  const result = sellFish(
    state,
    fishIndex,
    SAMPLE_FISH_SPECIES,
    DEFAULT_FISHING_CONFIG,
  );

  if (result.success) {
    print(`[Fishing] ${player.Name} sold fish for ${result.earnings} coins`);

    remotes.sellFish.FireClient(player, {
      success: true,
      earnings: result.earnings,
      totalEarnings: state.totalEarnings,
      inventorySize: state.inventory.length,
    });

    // Award coins to player (integrate with economy system)
    awardCoins(player, result.earnings ?? 0);
  } else {
    remotes.sellFish.FireClient(player, {
      success: false,
      error: result.error,
    });
  }
}

// Handle equip rod request
function handleEquipRod(player: Player, rodId: string): void {
  const state = getPlayerState(player);
  const rod = SAMPLE_RODS.find((r) => r.id === rodId);

  if (!rod) {
    remotes.equipRod.FireClient(player, {
      success: false,
      error: 'Invalid rod',
    });
    return;
  }

  // Check if player owns rod (TODO: integrate with inventory system)
  state.currentRod = rod;
  print(`[Fishing] ${player.Name} equipped ${rod.name}`);

  remotes.equipRod.FireClient(player, {
    success: true,
    rod: {
      id: rod.id,
      name: rod.name,
      tier: rod.tier,
      catchSpeedBonus: rod.catchSpeedBonus,
      rarityBonus: rod.rarityBonus,
    },
  });
}

// Handle equip bait request
function handleEquipBait(player: Player, baitId: string | undefined): void {
  const state = getPlayerState(player);

  if (!baitId) {
    state.currentBait = undefined as unknown as Bait | null;
    remotes.equipBait.FireClient(player, {
      success: true,
      bait: undefined,
    });
    return;
  }

  const bait = SAMPLE_BAITS.find((b) => b.id === baitId);

  if (!bait) {
    remotes.equipBait.FireClient(player, {
      success: false,
      error: 'Invalid bait',
    });
    return;
  }

  // Create a copy with uses
  state.currentBait = { ...bait };
  print(`[Fishing] ${player.Name} equipped ${bait.name}`);

  remotes.equipBait.FireClient(player, {
    success: true,
    bait: {
      id: bait.id,
      name: bait.name,
      uses: bait.uses,
    },
  });
}

// Handle get stats request
function handleGetStats(player: Player): unknown {
  const state = getPlayerState(player);
  return getPlayerStats(state);
}

// Handle get collection request
function handleGetCollection(player: Player): unknown {
  const state = getPlayerState(player);
  const progress = getCollectionProgress(state, SAMPLE_FISH_SPECIES);

  // Return with species details for discovered fish
  return {
    ...progress,
    allSpecies: SAMPLE_FISH_SPECIES.map((species) => ({
      id: species.id,
      name: species.name,
      rarity: species.rarity,
      discovered: state.discoveredSpecies.includes(species.id),
      personalRecord: state.recordCatches[species.id] ?? 0,
    })),
  };
}

// Handle get inventory request
function handleGetInventory(player: Player): unknown {
  const state = getPlayerState(player);

  return state.inventory.map((fish, index) => {
    const species = SAMPLE_FISH_SPECIES.find((s) => s.id === fish.speciesId);
    const sellPrice = species
      ? calculateSellPrice(fish, species, DEFAULT_FISHING_CONFIG)
      : 0;

    return {
      index,
      speciesId: fish.speciesId,
      speciesName: species?.name ?? 'Unknown',
      rarity: species?.rarity ?? 'common',
      weight: fish.weight,
      quality: fish.quality,
      sellPrice,
      isRecord: fish.isRecord,
    };
  });
}

// Handle location change request
function handleChangeLocation(player: Player, locationId: string): void {
  const state = getPlayerState(player);
  const location = SAMPLE_LOCATIONS.find((l) => l.id === locationId);

  if (!location) {
    remotes.changeLocation.FireClient(player, {
      success: false,
      error: 'Invalid location',
    });
    return;
  }

  if (state.level < location.unlockLevel) {
    remotes.changeLocation.FireClient(player, {
      success: false,
      error: `Need level ${location.unlockLevel} to access ${location.name}`,
    });
    return;
  }

  // Stop any current fishing
  state.isFishing = false;
  state.currentLocationId = locationId;

  print(`[Fishing] ${player.Name} moved to ${location.name}`);

  remotes.changeLocation.FireClient(player, {
    success: true,
    location: {
      id: location.id,
      name: location.name,
      description: location.description,
      unlockLevel: location.unlockLevel,
      fishMultiplier: location.fishMultiplier,
      availableSpeciesCount: location.availableSpecies.length,
    },
  });
}

// Helper: Format catch message
function formatCatchMessage(result: {
  fish?: { weight: number; quality: string };
  species?: { name: string; rarity: string };
  isNewDiscovery?: boolean;
  isPersonalRecord?: boolean;
}): string {
  if (!result.fish || !result.species) return 'Unknown fish';

  let msg = `${result.species.name} (${result.species.rarity}) - ${result.fish.weight}kg [${result.fish.quality}]`;

  if (result.isNewDiscovery) msg += ' 🆕';
  if (result.isPersonalRecord) msg += ' 🏆';

  return msg;
}

// Helper: Award coins to player
function awardCoins(player: Player, amount: number): void {
  // TODO: Integrate with actual economy system
  // For now, just log
  print(`[Economy] Awarding ${amount} coins to ${player.Name}`);
}

// Helper: Play celebration effect for rare catches
function playCelebrationEffect(player: Player, rarity: string): void {
  // TODO: Play particles, sounds, etc.
  print(`[Effects] Playing ${rarity} celebration for ${player.Name}`);
}

// Initialize fishing system
export function initFishingSystem(): void {
  print('[Fishing] Initializing fishing system...');

  // Setup remote events
  setupRemotes();

  // Connect event handlers
  remotes.castLine.OnServerEvent.Connect((player, locationId) => {
    handleCastLine(player, locationId as string);
  });

  remotes.reelIn.OnServerEvent.Connect((player) => {
    handleReelIn(player);
  });

  remotes.sellFish.OnServerEvent.Connect((player, fishIndex) => {
    handleSellFish(player, fishIndex as number);
  });

  remotes.equipRod.OnServerEvent.Connect((player, rodId) => {
    handleEquipRod(player, rodId as string);
  });

  remotes.equipBait.OnServerEvent.Connect((player, baitId) => {
    handleEquipBait(player, baitId as string | undefined);
  });

  remotes.changeLocation.OnServerEvent.Connect((player, locationId) => {
    handleChangeLocation(player, locationId as string);
  });

  // Connect function handlers
  remotes.getStats.OnServerInvoke = handleGetStats;
  remotes.getCollection.OnServerInvoke = handleGetCollection;
  remotes.getInventory.OnServerInvoke = handleGetInventory;

  // Handle player joining
  Players.PlayerAdded.Connect((player) => {
    const state = getInitialFishingState();
    playerStates.set(player, state);
    print(`[Fishing] Initialized fishing state for ${player.Name}`);

    // Load saved data (TODO: integrate with DataStore)
  });

  // Handle player leaving
  Players.PlayerRemoving.Connect((player) => {
    const state = playerStates.get(player);

    if (state) {
      // Save data (TODO: integrate with DataStore)
      print(`[Fishing] Saving fishing data for ${player.Name}`);
      print(`  Level: ${state.level}, Fish Caught: ${state.totalFishCaught}`);
    }

    playerStates.delete(player);
  });

  print(`[Fishing] System initialized with:`);
  print(`  - ${SAMPLE_FISH_SPECIES.length} fish species`);
  print(`  - ${SAMPLE_LOCATIONS.length} fishing locations`);
  print(`  - ${SAMPLE_RODS.length} rod types`);
  print(`  - ${SAMPLE_BAITS.length} bait types`);
}

// Export locations and species for client reference
export const FishingData = {
  species: SAMPLE_FISH_SPECIES,
  locations: SAMPLE_LOCATIONS,
  rods: SAMPLE_RODS,
  baits: SAMPLE_BAITS,
  config: DEFAULT_FISHING_CONFIG,
};
