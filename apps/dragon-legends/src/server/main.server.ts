// Dragon Legends - Main Server Entry Point
// Initializes all game systems

import { Players, ReplicatedStorage } from '@rbxts/services';
import { GAME_THEME } from '../shared/theme';
import { GAME_CONFIG, DRAGONS, getDragonIds } from '../shared/config';

// Import core systems
import { setupDataStore, getPlayerData, loadPlayerData } from './dataStore';
import {
  setupDragonSystem,
  createPlayerDragon,
  spawnDragonForPlayer,
  getPlayerDragons,
} from './dragons';
import { setupEggSystem } from './eggHatching';
import { setupCombatSystem } from './combat';
import { setupBreedingSystem } from './breeding';
import { setupClanSystem } from './clans';
import { setupDailyRewards } from './dailyRewards';
import { setupWorldBoss } from './worldBoss';
import { setupArenaSystem } from './arena';
import { setupTradingSystem } from './trading';
import { setupQuestSystem, updateQuestProgress } from './quests';
import { setupRegionSystem } from './regions';
import { setupAnalytics } from './analytics';
import { setupAntiCheat } from './antiCheat';

// Create remote events folder
function createRemoteEvents(): void {
  let remotes = ReplicatedStorage.FindFirstChild('DragonRemotes') as Folder;
  if (!remotes) {
    remotes = new Instance('Folder');
    remotes.Name = 'DragonRemotes';
    remotes.Parent = ReplicatedStorage;
  }
}

// Setup leaderstats for player (visual display)
function setupLeaderstats(player: Player): void {
  const leaderstats = new Instance('Folder');
  leaderstats.Name = 'leaderstats';
  leaderstats.Parent = player;

  const coins = new Instance('IntValue');
  coins.Name = GAME_THEME.currency;
  coins.Value = GAME_CONFIG.STARTING_COINS;
  coins.Parent = leaderstats;

  const gems = new Instance('IntValue');
  gems.Name = GAME_THEME.secondaryCurrency;
  gems.Value = GAME_CONFIG.STARTING_GEMS;
  gems.Parent = leaderstats;

  const dragons = new Instance('IntValue');
  dragons.Name = 'Dragons';
  dragons.Value = 0;
  dragons.Parent = leaderstats;

  print(`📊 Created leaderstats for ${player.Name}`);
}

// Update leaderstats from player data
function updateLeaderstats(player: Player): void {
  const data = getPlayerData(player);
  if (!data) return;

  const leaderstats = player.FindFirstChild('leaderstats') as
    | Folder
    | undefined;
  if (!leaderstats) return;

  const coins = leaderstats.FindFirstChild(GAME_THEME.currency) as
    | IntValue
    | undefined;
  if (coins) coins.Value = data.coins;

  const gems = leaderstats.FindFirstChild(GAME_THEME.secondaryCurrency) as
    | IntValue
    | undefined;
  if (gems) gems.Value = data.gems;

  const dragonCount = leaderstats.FindFirstChild('Dragons') as
    | IntValue
    | undefined;
  if (dragonCount) dragonCount.Value = data.dragons.size();
}

// Give starter dragon to new player
function giveStarterDragon(player: Player): void {
  const dragons = getPlayerDragons(player);

  // Only give starter if player has no dragons
  if (dragons.size() === 0) {
    // List of possible starters
    const starters = [
      'fire_drake_baby',
      'water_wyrm_baby',
      'frost_drake_baby',
      'nature_spirit_baby',
    ];

    // Random starter
    const starterDragonId =
      starters[math.floor(math.random() * starters.size())];
    const dragon = createPlayerDragon(player, starterDragonId, false);

    if (dragon) {
      print(
        `🐣 ${player.Name} received starter dragon: ${DRAGONS[starterDragonId]?.name}`,
      );

      // Set as active
      const data = getPlayerData(player);
      if (data) {
        data.activeDragonSlots = [dragon.instanceId, undefined, undefined];
      }
    }
  }
}

// Spawn player's active dragon when they spawn
function onCharacterAdded(player: Player, character: Model): void {
  // Wait a bit for character to fully load
  task.delay(1, () => {
    const dragons = getPlayerDragons(player);
    const data = getPlayerData(player);

    if (data && dragons.size() > 0) {
      // Spawn first active dragon
      const activeDragon =
        dragons.find((d) => d.instanceId === data.activeDragonSlots[0]) ||
        dragons[0];

      spawnDragonForPlayer(player, activeDragon);
    }

    // Update leaderstats
    updateLeaderstats(player);
  });
}

// Handle player joining
async function onPlayerAdded(player: Player): Promise<void> {
  // Setup leaderstats immediately
  setupLeaderstats(player);

  // Load player data
  await loadPlayerData(player);

  // Give starter dragon if needed
  giveStarterDragon(player);

  // Connect to character spawn
  player.CharacterAdded.Connect((character) => {
    onCharacterAdded(player, character);
  });

  // Handle existing character
  if (player.Character) {
    onCharacterAdded(player, player.Character);
  }

  print(`👋 ${player.Name} joined ${GAME_THEME.name}!`);
}

// Track coins for quests
function setupCoinTracking(): void {
  // Periodically track coin changes for quests
  task.spawn(() => {
    const lastCoins = new Map<number, number>();

    while (true) {
      task.wait(5);

      for (const player of Players.GetPlayers()) {
        const data = getPlayerData(player);
        if (data) {
          const last = lastCoins.get(player.UserId) || 0;
          if (data.coins > last) {
            const gained = data.coins - last;
            updateQuestProgress(player, 'coins_collected', gained);
          }
          lastCoins.set(player.UserId, data.coins);

          // Update leaderstats
          updateLeaderstats(player);
        }
      }
    }
  });
}

// Initialize game
async function init(): Promise<void> {
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print(`🐉 ${GAME_THEME.name} - Server Starting!`);
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Create remote events folder first
  createRemoteEvents();

  // Initialize core systems
  setupDataStore();
  print('   ✓ Data Store');

  setupDragonSystem();
  print('   ✓ Dragon System');

  setupEggSystem();
  print('   ✓ Egg Hatching');

  setupCombatSystem();
  print('   ✓ Combat System');

  setupBreedingSystem();
  print('   ✓ Breeding System');

  setupClanSystem();
  print('   ✓ Clan System');

  setupDailyRewards();
  print('   ✓ Daily Rewards');

  setupWorldBoss();
  print('   ✓ World Boss');

  setupArenaSystem();
  print('   ✓ Arena PvP');

  setupTradingSystem();
  print('   ✓ Trading System');

  setupQuestSystem();
  print('   ✓ Quest System');

  setupRegionSystem();
  print('   ✓ Region System');

  // Production systems
  setupAnalytics();
  print('   ✓ Analytics');

  setupAntiCheat();
  print('   ✓ Anti-Cheat');

  // Setup coin tracking for quests
  setupCoinTracking();
  print('   ✓ Quest Tracking');

  // Handle existing players
  for (const player of Players.GetPlayers()) {
    task.spawn(async () => {
      await onPlayerAdded(player);
    });
  }

  // Handle new players
  Players.PlayerAdded.Connect((player) => {
    task.spawn(async () => {
      await onPlayerAdded(player);
    });
  });

  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print(`✅ ${GAME_THEME.name} Ready! 14 systems loaded!`);
  print(`   ${getDragonIds().size()} dragons available`);
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Start
init();
