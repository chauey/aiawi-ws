// Dragon Legends - Combat System (Server)
// Turn-based elemental combat with type advantages

import { Players, ReplicatedStorage } from '@rbxts/services';
import {
  DRAGONS,
  Element,
  ELEMENT_CHART,
  GAME_CONFIG,
  DragonStats,
} from '../shared/config';
import {
  PlayerDragon,
  BattleState,
  BattleDragonState,
  BattleAction,
  BattleResult,
  BattleMove,
} from '../shared/types';
import { getPlayerDragons, addDragonXP } from './dragons';
import { getPlayerData, updatePlayerData } from './dataStore';

// Active battles storage
const activeBattles = new Map<string, BattleState>();
const playerBattles = new Map<number, string>(); // Player userId -> battleId

// Combat moves by element
const COMBAT_MOVES: { [element: string]: BattleMove[] } = {
  fire: [
    {
      name: 'Flame Breath',
      element: 'fire',
      power: 40,
      accuracy: 95,
      cooldown: 0,
      description: 'Basic fire attack',
    },
    {
      name: 'Inferno',
      element: 'fire',
      power: 80,
      accuracy: 85,
      cooldown: 2,
      description: 'Powerful fire blast',
    },
    {
      name: 'Eruption',
      element: 'fire',
      power: 120,
      accuracy: 70,
      cooldown: 4,
      description: 'Devastating volcanic attack',
    },
  ],
  water: [
    {
      name: 'Water Jet',
      element: 'water',
      power: 40,
      accuracy: 95,
      cooldown: 0,
      description: 'Basic water attack',
    },
    {
      name: 'Tidal Wave',
      element: 'water',
      power: 80,
      accuracy: 85,
      cooldown: 2,
      description: 'Powerful wave attack',
    },
    {
      name: 'Tsunami',
      element: 'water',
      power: 120,
      accuracy: 70,
      cooldown: 4,
      description: 'Devastating ocean attack',
    },
  ],
  ice: [
    {
      name: 'Ice Shard',
      element: 'ice',
      power: 40,
      accuracy: 95,
      cooldown: 0,
      description: 'Basic ice attack',
    },
    {
      name: 'Blizzard',
      element: 'ice',
      power: 80,
      accuracy: 85,
      cooldown: 2,
      description: 'Freezing storm attack',
    },
    {
      name: 'Absolute Zero',
      element: 'ice',
      power: 120,
      accuracy: 70,
      cooldown: 4,
      description: 'Ultimate freeze attack',
    },
  ],
  electric: [
    {
      name: 'Spark',
      element: 'electric',
      power: 40,
      accuracy: 95,
      cooldown: 0,
      description: 'Basic electric attack',
    },
    {
      name: 'Thunder',
      element: 'electric',
      power: 80,
      accuracy: 85,
      cooldown: 2,
      description: 'Powerful lightning bolt',
    },
    {
      name: 'Storm Strike',
      element: 'electric',
      power: 120,
      accuracy: 70,
      cooldown: 4,
      description: 'Ultimate lightning attack',
    },
  ],
  nature: [
    {
      name: 'Vine Whip',
      element: 'nature',
      power: 40,
      accuracy: 95,
      cooldown: 0,
      description: 'Basic nature attack',
    },
    {
      name: 'Solar Beam',
      element: 'nature',
      power: 80,
      accuracy: 85,
      cooldown: 2,
      description: 'Powerful sun attack',
    },
    {
      name: 'Earthquake',
      element: 'nature',
      power: 120,
      accuracy: 70,
      cooldown: 4,
      description: 'Ground-shaking attack',
    },
  ],
  shadow: [
    {
      name: 'Shadow Claw',
      element: 'shadow',
      power: 40,
      accuracy: 95,
      cooldown: 0,
      description: 'Basic shadow attack',
    },
    {
      name: 'Dark Pulse',
      element: 'shadow',
      power: 80,
      accuracy: 85,
      cooldown: 2,
      description: 'Wave of darkness',
    },
    {
      name: 'Void Rift',
      element: 'shadow',
      power: 120,
      accuracy: 70,
      cooldown: 4,
      description: 'Opens a tear in reality',
    },
  ],
  light: [
    {
      name: 'Light Beam',
      element: 'light',
      power: 40,
      accuracy: 95,
      cooldown: 0,
      description: 'Basic light attack',
    },
    {
      name: 'Divine Light',
      element: 'light',
      power: 80,
      accuracy: 85,
      cooldown: 2,
      description: 'Holy radiance attack',
    },
    {
      name: 'Celestial Blast',
      element: 'light',
      power: 120,
      accuracy: 70,
      cooldown: 4,
      description: 'Ultimate heavenly attack',
    },
  ],
};

// Generate battle ID
function generateBattleId(): string {
  return `battle_${os.time()}_${math.random(1000, 9999)}`;
}

// Create battle state from dragon
function createBattleState(dragon: PlayerDragon): BattleDragonState {
  const maxHp = dragon.stats.health * 5 + dragon.level * 10;
  return {
    instanceId: dragon.instanceId,
    dragonId: dragon.dragonId,
    currentHp: maxHp,
    maxHp: maxHp,
    element: dragon.element,
    level: dragon.level,
    stats: { ...dragon.stats },
    moveCooldowns: [0, 0, 0],
    statusEffects: [],
  };
}

// Calculate damage with type effectiveness
function calculateDamage(
  attacker: BattleDragonState,
  defender: BattleDragonState,
  move: BattleMove,
): { damage: number; isCrit: boolean; effectiveness: number } {
  // Base damage formula
  let baseDamage =
    (move.power * (attacker.stats.power / 50) * (attacker.level / 10)) /
    (defender.stats.health / 100);

  // Type effectiveness
  const effectiveness = ELEMENT_CHART[move.element]?.[defender.element] ?? 1;
  baseDamage *= effectiveness;

  // Critical hit
  const critChance = GAME_CONFIG.CRIT_CHANCE + attacker.stats.luck * 0.002;
  const isCrit = math.random() < critChance;
  if (isCrit) {
    baseDamage *= GAME_CONFIG.CRIT_MULTIPLIER;
  }

  // Random variance (85-115%)
  baseDamage *= 0.85 + math.random() * 0.3;

  return {
    damage: math.floor(baseDamage),
    isCrit,
    effectiveness,
  };
}

// Check accuracy
function checkAccuracy(move: BattleMove, attacker: BattleDragonState): boolean {
  const accuracyBonus = attacker.stats.speed * 0.1;
  return math.random() * 100 < move.accuracy + accuracyBonus;
}

// Start a wild dragon battle
export function startWildBattle(
  player: Player,
  playerDragon: PlayerDragon,
  wildDragonId: string,
  wildLevel: number,
): BattleState | undefined {
  // Check if player already in battle
  if (playerBattles.has(player.UserId)) {
    return undefined;
  }

  const wildDef = DRAGONS[wildDragonId];
  if (!wildDef) return undefined;

  // Create wild dragon stats
  const wildStats: DragonStats = {
    power: wildDef.baseStats.power + wildLevel * 2,
    speed: wildDef.baseStats.speed + wildLevel,
    health: wildDef.baseStats.health + wildLevel * 3,
    luck: wildDef.baseStats.luck + wildLevel,
  };

  const wildDragon: PlayerDragon = {
    instanceId: `wild_${os.time()}`,
    dragonId: wildDragonId,
    level: wildLevel,
    experience: 0,
    stats: wildStats,
    element: wildDef.element,
    rarity: wildDef.rarity,
    evolutionStage: wildDef.evolutionStage,
    isShiny: math.random() < 0.01, // 1% shiny chance for wild
    obtainedAt: 0,
    breedCount: 0,
    battleWins: 0,
    battleLosses: 0,
    isFavorite: false,
  };

  const battleId = generateBattleId();
  const battleState: BattleState = {
    battleId,
    battleType: 'wild',
    playerDragons: [createBattleState(playerDragon)],
    opponentDragons: [createBattleState(wildDragon)],
    currentTurn: 'player',
    turnNumber: 1,
    isFinished: false,
  };

  activeBattles.set(battleId, battleState);
  playerBattles.set(player.UserId, battleId);

  print(`⚔️ ${player.Name} started a wild battle with ${wildDef.name}!`);

  return battleState;
}

// Process a battle action
export function processBattleAction(
  player: Player,
  action: BattleAction,
): {
  success: boolean;
  battleState?: BattleState;
  message?: string;
} {
  const battleId = playerBattles.get(player.UserId);
  if (!battleId) {
    return { success: false, message: 'Not in battle' };
  }

  const battle = activeBattles.get(battleId);
  if (!battle || battle.isFinished) {
    return { success: false, message: 'Battle not found or finished' };
  }

  if (battle.currentTurn !== 'player') {
    return { success: false, message: 'Not your turn' };
  }

  const playerDragon = battle.playerDragons[0];
  const opponentDragon = battle.opponentDragons[0];

  // Handle player action
  if (action.type === 'attack' && action.moveIndex !== undefined) {
    const moves = COMBAT_MOVES[playerDragon.element] || COMBAT_MOVES['fire'];
    const move = moves[action.moveIndex];

    if (!move) {
      return { success: false, message: 'Invalid move' };
    }

    // Check cooldown
    if (playerDragon.moveCooldowns[action.moveIndex] > 0) {
      return { success: false, message: 'Move on cooldown' };
    }

    // Process attack
    if (checkAccuracy(move, playerDragon)) {
      const { damage, isCrit, effectiveness } = calculateDamage(
        playerDragon,
        opponentDragon,
        move,
      );

      opponentDragon.currentHp = math.max(0, opponentDragon.currentHp - damage);

      let msg = `${move.name} dealt ${damage} damage!`;
      if (isCrit) msg += ' Critical hit!';
      if (effectiveness > 1) msg += ' Super effective!';
      if (effectiveness < 1) msg += ' Not very effective...';

      print(`⚔️ ${msg}`);

      // Set cooldown
      playerDragon.moveCooldowns[action.moveIndex] = move.cooldown;
    } else {
      print(`⚔️ ${move.name} missed!`);
    }
  } else if (action.type === 'flee') {
    // End battle with flee
    battle.isFinished = true;
    battle.result = {
      winner: 'opponent',
      xpGained: 0,
      coinsGained: 0,
      dragonXpGained: 0,
    };
    return { success: true, battleState: battle, message: 'Fled from battle!' };
  }

  // Check if opponent defeated
  if (opponentDragon.currentHp <= 0) {
    return endBattle(player, battle, 'player');
  }

  // Opponent turn (AI)
  battle.currentTurn = 'opponent';
  const opponentMoves =
    COMBAT_MOVES[opponentDragon.element] || COMBAT_MOVES['fire'];

  // Simple AI: pick random available move
  const availableMoves = opponentMoves.filter(
    (_, i) => opponentDragon.moveCooldowns[i] <= 0,
  );
  const opponentMove =
    availableMoves[math.floor(math.random() * availableMoves.size())] ||
    opponentMoves[0];

  if (checkAccuracy(opponentMove, opponentDragon)) {
    const { damage, isCrit } = calculateDamage(
      opponentDragon,
      playerDragon,
      opponentMove,
    );

    playerDragon.currentHp = math.max(0, playerDragon.currentHp - damage);

    let msg = `Enemy ${opponentMove.name} dealt ${damage} damage!`;
    if (isCrit) msg += ' Critical hit!';
    print(`⚔️ ${msg}`);
  } else {
    print(`⚔️ Enemy ${opponentMove.name} missed!`);
  }

  // Set opponent cooldowns
  const moveIndex = opponentMoves.indexOf(opponentMove);
  if (moveIndex >= 0) {
    opponentDragon.moveCooldowns[moveIndex] = opponentMove.cooldown;
  }

  // Check if player defeated
  if (playerDragon.currentHp <= 0) {
    return endBattle(player, battle, 'opponent');
  }

  // Reduce cooldowns
  playerDragon.moveCooldowns = playerDragon.moveCooldowns.map((cd) =>
    math.max(0, cd - 1),
  );
  opponentDragon.moveCooldowns = opponentDragon.moveCooldowns.map((cd) =>
    math.max(0, cd - 1),
  );

  // Next turn
  battle.currentTurn = 'player';
  battle.turnNumber++;

  return { success: true, battleState: battle };
}

// End battle and calculate rewards
function endBattle(
  player: Player,
  battle: BattleState,
  winner: 'player' | 'opponent',
): { success: boolean; battleState: BattleState; message: string } {
  battle.isFinished = true;

  const playerData = getPlayerData(player);
  const playerDragons = getPlayerDragons(player);
  const battleDragon = playerDragons.find(
    (d) => d.instanceId === battle.playerDragons[0].instanceId,
  );

  if (winner === 'player') {
    // Calculate rewards
    const opponentLevel = battle.opponentDragons[0].level;
    const xpGained = GAME_CONFIG.XP_PER_BATTLE * opponentLevel;
    const coinsGained = 50 + opponentLevel * 10;

    battle.result = {
      winner: 'player',
      xpGained: xpGained,
      coinsGained: coinsGained,
      dragonXpGained: xpGained,
    };

    // Award XP to dragon
    if (battleDragon) {
      addDragonXP(player, battleDragon, xpGained);
      battleDragon.battleWins++;
    }

    // Award coins
    if (playerData) {
      playerData.coins += coinsGained;
      playerData.totalBattlesWon++;
      updatePlayerData(player, playerData);
    }

    print(
      `🏆 ${player.Name} won! Earned ${coinsGained} coins and ${xpGained} XP!`,
    );

    return {
      success: true,
      battleState: battle,
      message: `Victory! +${coinsGained} coins, +${xpGained} XP`,
    };
  } else {
    battle.result = {
      winner: 'opponent',
      xpGained: 0,
      coinsGained: 0,
      dragonXpGained: GAME_CONFIG.XP_PER_BATTLE / 2, // Half XP on loss
    };

    if (battleDragon) {
      addDragonXP(player, battleDragon, GAME_CONFIG.XP_PER_BATTLE / 2);
      battleDragon.battleLosses++;
    }

    if (playerData) {
      playerData.totalBattlesLost++;
      updatePlayerData(player, playerData);
    }

    print(`💔 ${player.Name} lost the battle!`);

    return {
      success: true,
      battleState: battle,
      message: 'Defeated! Your dragon needs rest.',
    };
  }
}

// Clean up after battle
function cleanupBattle(player: Player): void {
  const battleId = playerBattles.get(player.UserId);
  if (battleId) {
    activeBattles.delete(battleId);
    playerBattles.delete(player.UserId);
  }
}

// Setup combat system
export function setupCombatSystem(): void {
  const remotes =
    (ReplicatedStorage.FindFirstChild('DragonRemotes') as Folder) ||
    new Instance('Folder');
  remotes.Name = 'DragonRemotes';
  remotes.Parent = ReplicatedStorage;

  const startBattleRemote = new Instance('RemoteFunction');
  startBattleRemote.Name = 'StartBattle';
  startBattleRemote.Parent = remotes;

  const battleActionRemote = new Instance('RemoteFunction');
  battleActionRemote.Name = 'BattleAction';
  battleActionRemote.Parent = remotes;

  const endBattleRemote = new Instance('RemoteEvent');
  endBattleRemote.Name = 'EndBattle';
  endBattleRemote.Parent = remotes;

  // Start wild battle
  startBattleRemote.OnServerInvoke = (
    player,
    dragonInstanceId,
    wildDragonId,
    wildLevel,
  ) => {
    if (
      !typeIs(dragonInstanceId, 'string') ||
      !typeIs(wildDragonId, 'string') ||
      !typeIs(wildLevel, 'number')
    ) {
      return { success: false, error: 'Invalid parameters' };
    }

    const dragons = getPlayerDragons(player);
    const dragon = dragons.find((d) => d.instanceId === dragonInstanceId);
    if (!dragon) {
      return { success: false, error: 'Dragon not found' };
    }

    const battle = startWildBattle(player, dragon, wildDragonId, wildLevel);
    if (!battle) {
      return { success: false, error: 'Failed to start battle' };
    }

    return { success: true, battleState: battle };
  };

  // Process battle action
  battleActionRemote.OnServerInvoke = (player, actionType, moveIndex) => {
    const action: BattleAction = {
      type: actionType as 'attack' | 'flee',
      moveIndex: typeIs(moveIndex, 'number') ? moveIndex : undefined,
    };

    return processBattleAction(player, action);
  };

  // Clean up on player leave
  Players.PlayerRemoving.Connect((player) => {
    cleanupBattle(player);
  });

  print('⚔️ Combat System initialized!');
}
