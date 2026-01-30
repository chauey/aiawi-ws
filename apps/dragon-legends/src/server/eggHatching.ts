// Dragon Legends - Egg Hatching System (Server)
// Gacha-based egg hatching with rarity tiers

import { Players, ReplicatedStorage } from '@rbxts/services';
import {
  DRAGONS,
  DragonDefinition,
  RARITIES,
  Rarity,
  EGG_TYPES,
  getHatchableDragons,
} from '../shared/config';
import { createPlayerDragon, getPlayerDragons } from './dragons';
import { getPlayerData, updatePlayerData } from './dataStore';

// Weighted random selection based on rarity rates
function selectRarity(rates: { [key: string]: number }): Rarity {
  let total = 0;
  for (const [, v] of pairs(rates)) {
    total += v as number;
  }
  let random = math.random() * total;

  for (const [rarity, weight] of pairs(rates)) {
    random -= weight as number;
    if (random <= 0) {
      return rarity as Rarity;
    }
  }

  return 'Common'; // Fallback
}

// Select random dragon of specified rarity
function selectDragon(rarity: Rarity): DragonDefinition | undefined {
  const dragons = getHatchableDragons(rarity);
  if (dragons.size() === 0) {
    // If no dragons of this rarity, try common
    const commonDragons = getHatchableDragons('Common');
    if (commonDragons.size() === 0) return undefined;
    return commonDragons[math.floor(math.random() * commonDragons.size())];
  }
  return dragons[math.floor(math.random() * dragons.size())];
}

// Determine if shiny (1% base chance, luck increases it)
function rollShiny(luck: number): boolean {
  const shinyChance = 0.01 + luck * 0.001; // 1% base + 0.1% per luck
  return math.random() < shinyChance;
}

// Hatch an egg for a player
export function hatchEgg(
  player: Player,
  eggType: 'basic' | 'premium' | 'legendary',
): { success: boolean; dragonId?: string; isShiny?: boolean; error?: string } {
  const eggConfig = EGG_TYPES[eggType];
  if (!eggConfig) {
    return { success: false, error: 'Invalid egg type' };
  }

  // Get player data
  const playerData = getPlayerData(player);
  if (!playerData) {
    return { success: false, error: 'Player data not found' };
  }

  // Check currency
  if (eggConfig.currency === 'coins') {
    if (playerData.coins < eggConfig.cost) {
      return { success: false, error: 'Not enough coins' };
    }
    playerData.coins -= eggConfig.cost;
  } else if (eggConfig.currency === 'gems') {
    if (playerData.gems < eggConfig.cost) {
      return { success: false, error: 'Not enough gems' };
    }
    playerData.gems -= eggConfig.cost;
  }

  // Roll for rarity
  const rarity = selectRarity(eggConfig.rates);

  // Select dragon
  const dragon = selectDragon(rarity);
  if (!dragon) {
    // Refund on error
    if (eggConfig.currency === 'coins') {
      playerData.coins += eggConfig.cost;
    } else {
      playerData.gems += eggConfig.cost;
    }
    return { success: false, error: 'No dragons available' };
  }

  // Roll for shiny
  const isShiny = rollShiny(0); // TODO: Use player's active dragon luck

  // Create the dragon
  const newDragon = createPlayerDragon(player, dragon.id, isShiny);
  if (!newDragon) {
    // Refund on error
    if (eggConfig.currency === 'coins') {
      playerData.coins += eggConfig.cost;
    } else {
      playerData.gems += eggConfig.cost;
    }
    return { success: false, error: 'Failed to create dragon' };
  }

  // Update stats
  playerData.dragonsHatched++;
  updatePlayerData(player, playerData);

  print(
    `🥚 ${player.Name} hatched a ${isShiny ? '✨SHINY ' : ''}${rarity} ${dragon.name}!`,
  );

  return {
    success: true,
    dragonId: dragon.id,
    isShiny: isShiny,
  };
}

// Setup egg system
export function setupEggSystem(): void {
  const remotes =
    (ReplicatedStorage.FindFirstChild('DragonRemotes') as Folder) ||
    new Instance('Folder');
  remotes.Name = 'DragonRemotes';
  remotes.Parent = ReplicatedStorage;

  const hatchRemote = new Instance('RemoteFunction');
  hatchRemote.Name = 'HatchEgg';
  hatchRemote.Parent = remotes;

  hatchRemote.OnServerInvoke = (player, eggType) => {
    if (!typeIs(eggType, 'string')) {
      return { success: false, error: 'Invalid egg type' };
    }

    if (
      eggType !== 'basic' &&
      eggType !== 'premium' &&
      eggType !== 'legendary'
    ) {
      return { success: false, error: 'Invalid egg type' };
    }

    return hatchEgg(player, eggType);
  };

  print('🥚 Egg Hatching System initialized!');
}
