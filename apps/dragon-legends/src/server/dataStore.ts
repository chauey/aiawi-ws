// Dragon Legends - Data Store (Server)
// Player data persistence using DataStoreService

import { DataStoreService, Players } from '@rbxts/services';
import { PlayerData, PlayerDragon } from '../shared/types';
import { GAME_CONFIG, DRAGONS } from '../shared/config';

// Data stores
let playerDataStore: DataStore;
try {
  playerDataStore = DataStoreService.GetDataStore('DragonLegendsPlayerData_v1');
} catch (e) {
  warn('DataStore not available (Studio mode or offline)');
}

// In-memory cache for faster access
const playerDataCache = new Map<number, PlayerData>();

// Default player data
function createDefaultPlayerData(): PlayerData {
  return {
    coins: GAME_CONFIG.STARTING_COINS,
    gems: GAME_CONFIG.STARTING_GEMS,
    dragons: [],
    activeDragonSlots: [undefined, undefined, undefined],
    playerLevel: 1,
    playerXp: 0,
    unlockedRegions: ['starter_meadow'],
    lastLoginDate: '',
    loginStreak: 0,
    dailyQuestsCompleted: [],
    lastDailyReset: 0,
    totalBattlesWon: 0,
    totalBattlesLost: 0,
    dragonsHatched: 0,
    dragonsEvolved: 0,
    dragonsTraded: 0,
    arenaRating: 1000,
    arenaWins: 0,
    arenaLosses: 0,
    bestArenaRank: 0,
    achievements: [],
    musicEnabled: true,
    sfxEnabled: true,
  };
}

// Load player data
export async function loadPlayerData(player: Player): Promise<PlayerData> {
  // Check cache first
  const cached = playerDataCache.get(player.UserId);
  if (cached) return cached;

  let data = createDefaultPlayerData();

  if (playerDataStore) {
    try {
      const result = playerDataStore.GetAsync(`player_${player.UserId}`);
      const savedData = result as unknown as PlayerData | undefined;

      if (savedData) {
        // Merge with defaults to handle new fields
        data = { ...data, ...savedData };
      }
    } catch (e) {
      warn(`Failed to load data for ${player.Name}: ${e}`);
    }
  }

  playerDataCache.set(player.UserId, data);
  return data;
}

// Save player data
export async function savePlayerData(player: Player): Promise<boolean> {
  const data = playerDataCache.get(player.UserId);
  if (!data) return false;

  if (playerDataStore) {
    try {
      playerDataStore.SetAsync(`player_${player.UserId}`, data);
      return true;
    } catch (e) {
      warn(`Failed to save data for ${player.Name}: ${e}`);
      return false;
    }
  }

  return true; // Return true in studio mode
}

// Get player data (sync)
export function getPlayerData(player: Player): PlayerData | undefined {
  return playerDataCache.get(player.UserId);
}

// Update player data
export function updatePlayerData(
  player: Player,
  data: Partial<PlayerData>,
): void {
  const existing = playerDataCache.get(player.UserId);
  if (existing) {
    const updated = { ...existing, ...data };
    playerDataCache.set(player.UserId, updated);
  }
}

// Add coins
export function addCoins(player: Player, amount: number): void {
  const data = getPlayerData(player);
  if (data) {
    data.coins += amount;
    print(`💰 ${player.Name} +${amount} coins! Total: ${data.coins}`);
  }
}

// Add gems
export function addGems(player: Player, amount: number): void {
  const data = getPlayerData(player);
  if (data) {
    data.gems += amount;
    print(`💎 ${player.Name} +${amount} gems! Total: ${data.gems}`);
  }
}

// Spend coins
export function spendCoins(player: Player, amount: number): boolean {
  const data = getPlayerData(player);
  if (!data || data.coins < amount) return false;
  data.coins -= amount;
  return true;
}

// Spend gems
export function spendGems(player: Player, amount: number): boolean {
  const data = getPlayerData(player);
  if (!data || data.gems < amount) return false;
  data.gems -= amount;
  return true;
}

// Add player XP
export function addPlayerXP(player: Player, amount: number): boolean {
  const data = getPlayerData(player);
  if (!data) return false;

  data.playerXp += amount;

  // Check for level up
  const xpNeeded = data.playerLevel * 1000;
  if (data.playerXp >= xpNeeded) {
    data.playerLevel++;
    data.playerXp -= xpNeeded;
    print(`⬆️ ${player.Name} leveled up to ${data.playerLevel}!`);
    return true; // Level up occurred
  }

  return false;
}

// Unlock region
export function unlockRegion(player: Player, regionId: string): boolean {
  const data = getPlayerData(player);
  if (!data) return false;

  if (!data.unlockedRegions.includes(regionId)) {
    data.unlockedRegions.push(regionId);
    print(`🗺️ ${player.Name} unlocked ${regionId}!`);
    return true;
  }

  return false;
}

// Add dragon to player data
export function addDragonToData(player: Player, dragon: PlayerDragon): void {
  const data = getPlayerData(player);
  if (data) {
    data.dragons.push(dragon);
  }
}

// Get player dragons from data
export function getDragonsFromData(player: Player): PlayerDragon[] {
  const data = getPlayerData(player);
  return data?.dragons || [];
}

// Auto-save interval
const AUTO_SAVE_INTERVAL = 60; // seconds

// Setup data store system
export function setupDataStore(): void {
  // Load data for existing players
  Players.GetPlayers().forEach((player) => {
    task.spawn(async () => {
      await loadPlayerData(player);
      print(`📁 Loaded data for ${player.Name}`);
    });
  });

  // Load data for new players
  Players.PlayerAdded.Connect((player) => {
    task.spawn(async () => {
      await loadPlayerData(player);
      print(`📁 Loaded data for ${player.Name}`);
    });
  });

  // Save data when player leaves
  Players.PlayerRemoving.Connect((player) => {
    task.spawn(async () => {
      await savePlayerData(player);
      playerDataCache.delete(player.UserId);
      print(`💾 Saved data for ${player.Name}`);
    });
  });

  // Auto-save loop
  task.spawn(() => {
    while (true) {
      task.wait(AUTO_SAVE_INTERVAL);
      for (const player of Players.GetPlayers()) {
        task.spawn(async () => {
          await savePlayerData(player);
        });
      }
    }
  });

  // Save all on shutdown
  game.BindToClose(() => {
    for (const player of Players.GetPlayers()) {
      const data = playerDataCache.get(player.UserId);
      if (data && playerDataStore) {
        try {
          playerDataStore.SetAsync(`player_${player.UserId}`, data);
        } catch (e) {
          warn(`Failed to save on close: ${e}`);
        }
      }
    }
  });

  print('💾 Data Store System initialized!');
}
