// Dragon Legends - Arena PvP System (Server)
// Ranked 1v1 dragon battles with ELO matchmaking

import { Players, ReplicatedStorage } from '@rbxts/services';
import {
  PlayerDragon,
  BattleState,
  BattleDragonState,
  BattleResult,
} from '../shared/types';
import { ELEMENT_CHART, GAME_CONFIG } from '../shared/config';
import { getPlayerDragons, addDragonXP } from './dragons';
import { getPlayerData, updatePlayerData, addCoins } from './dataStore';

// Matchmaking queue
interface QueueEntry {
  player: Player;
  dragon: PlayerDragon;
  rating: number;
  queueTime: number;
}

const matchmakingQueue: QueueEntry[] = [];
const activeArenaMatches = new Map<
  string,
  { player1: Player; player2: Player; battle: BattleState }
>();
const playerArenaMatches = new Map<number, string>(); // UserId -> matchId

// ELO calculation
const K_FACTOR = 32;

function calculateEloChange(
  winnerRating: number,
  loserRating: number,
): { winnerGain: number; loserLoss: number } {
  const expectedWin =
    1 / (1 + math.pow(10, (loserRating - winnerRating) / 400));
  const winnerGain = math.floor(K_FACTOR * (1 - expectedWin));
  const loserLoss = math.floor(K_FACTOR * expectedWin);
  return { winnerGain, loserLoss };
}

// Join matchmaking queue
export function joinArenaQueue(
  player: Player,
  dragonInstanceId: string,
): { success: boolean; error?: string } {
  // Check if already in queue
  if (matchmakingQueue.some((e) => e.player.UserId === player.UserId)) {
    return { success: false, error: 'Already in queue' };
  }

  // Check if in match
  if (playerArenaMatches.has(player.UserId)) {
    return { success: false, error: 'Already in a match' };
  }

  const dragons = getPlayerDragons(player);
  const dragon = dragons.find((d) => d.instanceId === dragonInstanceId);
  if (!dragon) {
    return { success: false, error: 'Dragon not found' };
  }

  const playerData = getPlayerData(player);
  if (!playerData) {
    return { success: false, error: 'Player data not found' };
  }

  matchmakingQueue.push({
    player,
    dragon,
    rating: playerData.arenaRating,
    queueTime: os.time(),
  });

  print(
    `⚔️ ${player.Name} joined arena queue (Rating: ${playerData.arenaRating})`,
  );

  // Try to find a match
  findMatch();

  return { success: true };
}

// Leave matchmaking queue
export function leaveArenaQueue(player: Player): { success: boolean } {
  const index = matchmakingQueue.findIndex(
    (e) => e.player.UserId === player.UserId,
  );
  if (index >= 0) {
    matchmakingQueue.remove(index);
    print(`🚶 ${player.Name} left arena queue`);
    return { success: true };
  }
  return { success: false };
}

// Find a match from the queue
function findMatch(): void {
  if (matchmakingQueue.size() < 2) return;

  // Sort by rating (bubble sort for roblox-ts)
  const sorted: QueueEntry[] = [];
  for (const item of matchmakingQueue) {
    sorted.push(item);
  }
  for (let i = 0; i < sorted.size(); i++) {
    for (let j = i + 1; j < sorted.size(); j++) {
      if (sorted[j].rating < sorted[i].rating) {
        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      }
    }
  }

  // Find closest rating match
  let bestPair: [QueueEntry, QueueEntry] | undefined;
  let bestDiff = math.huge;

  for (let i = 0; i < sorted.size() - 1; i++) {
    const diff = math.abs(sorted[i].rating - sorted[i + 1].rating);
    // Also consider wait time - expand range over time
    const avgWait =
      (os.time() - sorted[i].queueTime + os.time() - sorted[i + 1].queueTime) /
      2;
    const adjustedDiff = diff - avgWait * 2; // +2 rating range per second waited

    if (adjustedDiff < bestDiff) {
      bestDiff = adjustedDiff;
      bestPair = [sorted[i], sorted[i + 1]];
    }
  }

  if (!bestPair) return;

  // Create match
  const [entry1, entry2] = bestPair;

  // Remove from queue
  const idx1 = matchmakingQueue.findIndex(
    (e) => e.player.UserId === entry1.player.UserId,
  );
  const idx2 = matchmakingQueue.findIndex(
    (e) => e.player.UserId === entry2.player.UserId,
  );
  if (idx1 >= 0) matchmakingQueue.remove(idx1);
  if (idx2 >= 0) matchmakingQueue.remove(idx2 > idx1 ? idx2 - 1 : idx2);

  // Start the match
  startArenaMatch(entry1, entry2);
}

// Create battle state from dragon
function createArenaBattleState(dragon: PlayerDragon): BattleDragonState {
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

// Start arena match
function startArenaMatch(entry1: QueueEntry, entry2: QueueEntry): void {
  const matchId = `arena_${os.time()}_${math.random(1000, 9999)}`;

  const battle: BattleState = {
    battleId: matchId,
    battleType: 'arena',
    playerDragons: [createArenaBattleState(entry1.dragon)],
    opponentDragons: [createArenaBattleState(entry2.dragon)],
    currentTurn: math.random() > 0.5 ? 'player' : 'opponent',
    turnNumber: 1,
    isFinished: false,
  };

  activeArenaMatches.set(matchId, {
    player1: entry1.player,
    player2: entry2.player,
    battle,
  });

  playerArenaMatches.set(entry1.player.UserId, matchId);
  playerArenaMatches.set(entry2.player.UserId, matchId);

  print(
    `⚔️ Arena match started: ${entry1.player.Name} vs ${entry2.player.Name}!`,
  );

  // Notify players (would use remote events)
}

// Process arena action
export function processArenaAction(
  player: Player,
  actionType: string,
  moveIndex?: number,
): {
  success: boolean;
  battleState?: BattleState;
  result?: BattleResult;
  error?: string;
} {
  const matchId = playerArenaMatches.get(player.UserId);
  if (!matchId) {
    return { success: false, error: 'Not in a match' };
  }

  const match = activeArenaMatches.get(matchId);
  if (!match) {
    return { success: false, error: 'Match not found' };
  }

  const { player1, player2, battle } = match;
  const isPlayer1 = player.UserId === player1.UserId;

  // Determine if it's this player's turn
  const isPlayerTurn =
    (isPlayer1 && battle.currentTurn === 'player') ||
    (!isPlayer1 && battle.currentTurn === 'opponent');

  if (!isPlayerTurn) {
    return { success: false, error: 'Not your turn' };
  }

  // Get attacker and defender
  const attacker = isPlayer1
    ? battle.playerDragons[0]
    : battle.opponentDragons[0];
  const defender = isPlayer1
    ? battle.opponentDragons[0]
    : battle.playerDragons[0];

  if (actionType === 'attack' && moveIndex !== undefined) {
    // Simple damage calculation for PvP
    const baseDamage = 20 + attacker.stats.power / 2;
    const effectiveness =
      ELEMENT_CHART[attacker.element]?.[defender.element] ?? 1;
    const damage = math.floor(
      baseDamage * effectiveness * (0.9 + math.random() * 0.2),
    );

    defender.currentHp = math.max(0, defender.currentHp - damage);

    print(
      `⚔️ ${isPlayer1 ? player1.Name : player2.Name}'s dragon dealt ${damage} damage!`,
    );
  }

  // Check for winner
  if (
    battle.playerDragons[0].currentHp <= 0 ||
    battle.opponentDragons[0].currentHp <= 0
  ) {
    const winner =
      battle.playerDragons[0].currentHp > 0 ? 'player1' : 'player2';
    return endArenaMatch(matchId, winner);
  }

  // Switch turns
  battle.currentTurn = battle.currentTurn === 'player' ? 'opponent' : 'player';
  battle.turnNumber++;

  return { success: true, battleState: battle };
}

// End arena match
function endArenaMatch(
  matchId: string,
  winner: 'player1' | 'player2',
): {
  success: boolean;
  battleState: BattleState;
  result: BattleResult;
  error?: string;
} {
  const match = activeArenaMatches.get(matchId);
  if (!match) {
    return {
      success: false,
      battleState: undefined!,
      result: undefined!,
      error: 'Match not found',
    };
  }

  const { player1, player2, battle } = match;
  battle.isFinished = true;

  const winningPlayer = winner === 'player1' ? player1 : player2;
  const losingPlayer = winner === 'player1' ? player2 : player1;

  // Get player data
  const winnerData = getPlayerData(winningPlayer);
  const loserData = getPlayerData(losingPlayer);

  if (!winnerData || !loserData) {
    return {
      success: false,
      battleState: battle,
      result: undefined!,
      error: 'Player data not found',
    };
  }

  // Calculate ELO change
  const { winnerGain, loserLoss } = calculateEloChange(
    winnerData.arenaRating,
    loserData.arenaRating,
  );

  // Apply rating changes
  winnerData.arenaRating += winnerGain;
  loserData.arenaRating = math.max(0, loserData.arenaRating - loserLoss);

  // Update stats
  winnerData.arenaWins++;
  if (winnerData.arenaRating > winnerData.bestArenaRank) {
    winnerData.bestArenaRank = winnerData.arenaRating;
  }
  loserData.arenaLosses++;

  // Rewards
  const coinReward = 100 + winnerGain * 5;
  addCoins(winningPlayer, coinReward);

  // XP for dragons
  const winnerDragons = getPlayerDragons(winningPlayer);
  const winnerDragon = winnerDragons.find(
    (d) => d.instanceId === battle.playerDragons[0].instanceId,
  );
  if (winnerDragon) {
    addDragonXP(winningPlayer, winnerDragon, GAME_CONFIG.XP_PER_BATTLE * 2);
    winnerDragon.battleWins++;
  }

  const loserDragons = getPlayerDragons(losingPlayer);
  const loserDragon = loserDragons.find(
    (d) => d.instanceId === battle.opponentDragons[0].instanceId,
  );
  if (loserDragon) {
    addDragonXP(losingPlayer, loserDragon, GAME_CONFIG.XP_PER_BATTLE);
    loserDragon.battleLosses++;
  }

  updatePlayerData(winningPlayer, winnerData);
  updatePlayerData(losingPlayer, loserData);

  const result: BattleResult = {
    winner: winner === 'player1' ? 'player' : 'opponent',
    xpGained: GAME_CONFIG.XP_PER_BATTLE * 2,
    coinsGained: coinReward,
    dragonXpGained: GAME_CONFIG.XP_PER_BATTLE * 2,
    ratingChange: winnerGain,
  };

  battle.result = result;

  print(
    `🏆 ${winningPlayer.Name} wins! +${winnerGain} rating, +${coinReward} coins`,
  );
  print(`💔 ${losingPlayer.Name} loses! -${loserLoss} rating`);

  // Cleanup
  activeArenaMatches.delete(matchId);
  playerArenaMatches.delete(player1.UserId);
  playerArenaMatches.delete(player2.UserId);

  return { success: true, battleState: battle, result };
}

// Get arena leaderboard
export function getArenaLeaderboard(): {
  playerId: number;
  playerName: string;
  rating: number;
}[] {
  const leaderboard: {
    playerId: number;
    playerName: string;
    rating: number;
  }[] = [];

  for (const player of Players.GetPlayers()) {
    const data = getPlayerData(player);
    if (data) {
      leaderboard.push({
        playerId: player.UserId,
        playerName: player.Name,
        rating: data.arenaRating,
      });
    }
  }

  // Sort and take top 100
  for (let i = 0; i < leaderboard.size(); i++) {
    for (let j = i + 1; j < leaderboard.size(); j++) {
      if (leaderboard[j].rating > leaderboard[i].rating) {
        [leaderboard[i], leaderboard[j]] = [leaderboard[j], leaderboard[i]];
      }
    }
  }
  const result: typeof leaderboard = [];
  for (let i = 0; i < math.min(100, leaderboard.size()); i++) {
    result.push(leaderboard[i]);
  }
  return result;
}

// Setup arena system
export function setupArenaSystem(): void {
  const remotes =
    (ReplicatedStorage.FindFirstChild('DragonRemotes') as Folder) ||
    new Instance('Folder');
  remotes.Name = 'DragonRemotes';
  remotes.Parent = ReplicatedStorage;

  const joinQueueRemote = new Instance('RemoteFunction');
  joinQueueRemote.Name = 'JoinArenaQueue';
  joinQueueRemote.Parent = remotes;

  const leaveQueueRemote = new Instance('RemoteFunction');
  leaveQueueRemote.Name = 'LeaveArenaQueue';
  leaveQueueRemote.Parent = remotes;

  const arenaActionRemote = new Instance('RemoteFunction');
  arenaActionRemote.Name = 'ArenaAction';
  arenaActionRemote.Parent = remotes;

  const getArenaLeaderboardRemote = new Instance('RemoteFunction');
  getArenaLeaderboardRemote.Name = 'GetArenaLeaderboard';
  getArenaLeaderboardRemote.Parent = remotes;

  joinQueueRemote.OnServerInvoke = (player, dragonInstanceId) => {
    if (!typeIs(dragonInstanceId, 'string')) {
      return { success: false, error: 'Invalid dragon' };
    }
    return joinArenaQueue(player, dragonInstanceId);
  };

  leaveQueueRemote.OnServerInvoke = (player) => {
    return leaveArenaQueue(player);
  };

  arenaActionRemote.OnServerInvoke = (player, actionType, moveIndex) => {
    if (!typeIs(actionType, 'string')) {
      return { success: false, error: 'Invalid action' };
    }
    return processArenaAction(
      player,
      actionType,
      typeIs(moveIndex, 'number') ? moveIndex : undefined,
    );
  };

  getArenaLeaderboardRemote.OnServerInvoke = () => {
    return getArenaLeaderboard();
  };

  // Clean up on player leave
  Players.PlayerRemoving.Connect((player) => {
    leaveArenaQueue(player);

    const matchId = playerArenaMatches.get(player.UserId);
    if (matchId) {
      const match = activeArenaMatches.get(matchId);
      if (match) {
        // Player disconnected, opponent wins
        const winner =
          match.player1.UserId === player.UserId ? 'player2' : 'player1';
        endArenaMatch(matchId, winner);
      }
    }
  });

  print('🏟️ Arena PvP System initialized!');
}
