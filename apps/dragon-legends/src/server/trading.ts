// Dragon Legends - Trading System (Server)
// Secure dragon trading between players

import { Players, ReplicatedStorage } from '@rbxts/services';
import { TradeOffer, PlayerDragon } from '../shared/types';
import { DRAGONS } from '../shared/config';
import { getPlayerDragons } from './dragons';
import { getPlayerData, updatePlayerData } from './dataStore';

// Active trades storage
const activeTrades = new Map<string, TradeOffer>();
const playerTrades = new Map<number, string>(); // UserId -> TradeId

// Trade expiration time (5 minutes)
const TRADE_EXPIRATION = 5 * 60;

// Generate trade ID
function generateTradeId(): string {
  return `trade_${os.time()}_${math.random(1000, 9999)}`;
}

// Create a trade offer
export function createTradeOffer(
  offerer: Player,
  receiver: Player,
  offeredDragonIds: string[],
  offeredCoins: number,
  offeredGems: number,
  requestedDragonIds: string[],
  requestedCoins: number,
  requestedGems: number,
): { success: boolean; trade?: TradeOffer; error?: string } {
  // Validate players
  if (offerer.UserId === receiver.UserId) {
    return { success: false, error: 'Cannot trade with yourself' };
  }

  // Check if either player is in an active trade
  if (playerTrades.has(offerer.UserId)) {
    return { success: false, error: 'You are already in a trade' };
  }
  if (playerTrades.has(receiver.UserId)) {
    return { success: false, error: 'That player is already trading' };
  }

  // Validate offerer has the dragons
  const offererDragons = getPlayerDragons(offerer);
  for (const id of offeredDragonIds) {
    if (!offererDragons.find((d) => d.instanceId === id)) {
      return { success: false, error: "You don't own that dragon" };
    }
  }

  // Validate receiver has the requested dragons
  const receiverDragons = getPlayerDragons(receiver);
  for (const id of requestedDragonIds) {
    if (!receiverDragons.find((d) => d.instanceId === id)) {
      return { success: false, error: "They don't own that dragon" };
    }
  }

  // Validate offerer has enough coins/gems
  const offererData = getPlayerData(offerer);
  if (!offererData) {
    return { success: false, error: 'Player data not found' };
  }
  if (offererData.coins < offeredCoins) {
    return { success: false, error: 'Not enough coins' };
  }
  if (offererData.gems < offeredGems) {
    return { success: false, error: 'Not enough gems' };
  }

  // Create trade
  const tradeId = generateTradeId();
  const trade: TradeOffer = {
    tradeId,
    offererPlayerId: offerer.UserId,
    receiverPlayerId: receiver.UserId,
    offeredDragons: offeredDragonIds,
    offeredCoins,
    offeredGems,
    requestedDragons: requestedDragonIds,
    requestedCoins,
    requestedGems,
    status: 'pending',
    createdAt: os.time(),
    expiresAt: os.time() + TRADE_EXPIRATION,
  };

  activeTrades.set(tradeId, trade);
  playerTrades.set(offerer.UserId, tradeId);
  playerTrades.set(receiver.UserId, tradeId);

  print(`🔄 Trade offer created: ${offerer.Name} -> ${receiver.Name}`);

  return { success: true, trade };
}

// Accept a trade
export function acceptTrade(
  player: Player,
  tradeId: string,
): { success: boolean; error?: string } {
  const trade = activeTrades.get(tradeId);
  if (!trade) {
    return { success: false, error: 'Trade not found' };
  }

  // Only receiver can accept
  if (trade.receiverPlayerId !== player.UserId) {
    return { success: false, error: 'Only the receiver can accept' };
  }

  if (trade.status !== 'pending') {
    return { success: false, error: 'Trade is no longer pending' };
  }

  // Check expiration
  if (os.time() > trade.expiresAt) {
    cancelTrade(tradeId);
    return { success: false, error: 'Trade has expired' };
  }

  // Get both players
  const offerer = Players.GetPlayerByUserId(trade.offererPlayerId);
  const receiver = Players.GetPlayerByUserId(trade.receiverPlayerId);

  if (!offerer || !receiver) {
    cancelTrade(tradeId);
    return { success: false, error: 'Player not found' };
  }

  // Final validation - recheck ownership and currency
  const offererData = getPlayerData(offerer);
  const receiverData = getPlayerData(receiver);

  if (!offererData || !receiverData) {
    cancelTrade(tradeId);
    return { success: false, error: 'Player data not found' };
  }

  // Check currency again
  if (
    offererData.coins < trade.offeredCoins ||
    offererData.gems < trade.offeredGems
  ) {
    cancelTrade(tradeId);
    return { success: false, error: "Offerer doesn't have enough currency" };
  }

  if (
    receiverData.coins < trade.requestedCoins ||
    receiverData.gems < trade.requestedGems
  ) {
    cancelTrade(tradeId);
    return { success: false, error: "You don't have enough currency" };
  }

  // Execute trade
  // 1. Transfer currency
  offererData.coins -= trade.offeredCoins;
  offererData.gems -= trade.offeredGems;
  offererData.coins += trade.requestedCoins;
  offererData.gems += trade.requestedGems;

  receiverData.coins -= trade.requestedCoins;
  receiverData.gems -= trade.requestedGems;
  receiverData.coins += trade.offeredCoins;
  receiverData.gems += trade.offeredGems;

  // 2. Transfer dragons
  const offererDragons = getPlayerDragons(offerer);
  const receiverDragons = getPlayerDragons(receiver);

  // Remove offered dragons from offerer
  for (const dragonId of trade.offeredDragons) {
    const idx = offererDragons.findIndex((d) => d.instanceId === dragonId);
    if (idx >= 0) {
      const dragon = offererDragons[idx];
      offererDragons.remove(idx);
      receiverDragons.push(dragon);
    }
  }

  // Remove requested dragons from receiver
  for (const dragonId of trade.requestedDragons) {
    const idx = receiverDragons.findIndex((d) => d.instanceId === dragonId);
    if (idx >= 0) {
      const dragon = receiverDragons[idx];
      receiverDragons.remove(idx);
      offererDragons.push(dragon);
    }
  }

  // Update stats
  offererData.dragonsTraded += trade.offeredDragons.size();
  receiverData.dragonsTraded += trade.requestedDragons.size();

  updatePlayerData(offerer, offererData);
  updatePlayerData(receiver, receiverData);

  // Mark trade as complete
  trade.status = 'accepted';
  cleanupTrade(tradeId);

  print(`✅ Trade completed: ${offerer.Name} <-> ${receiver.Name}`);

  return { success: true };
}

// Reject a trade
export function rejectTrade(
  player: Player,
  tradeId: string,
): { success: boolean; error?: string } {
  const trade = activeTrades.get(tradeId);
  if (!trade) {
    return { success: false, error: 'Trade not found' };
  }

  if (trade.receiverPlayerId !== player.UserId) {
    return { success: false, error: 'Only the receiver can reject' };
  }

  trade.status = 'rejected';
  cleanupTrade(tradeId);

  print(`❌ Trade rejected`);

  return { success: true };
}

// Cancel a trade
function cancelTrade(tradeId: string): void {
  const trade = activeTrades.get(tradeId);
  if (trade) {
    trade.status = 'cancelled';
    cleanupTrade(tradeId);
    print(`🚫 Trade cancelled`);
  }
}

// Clean up trade
function cleanupTrade(tradeId: string): void {
  const trade = activeTrades.get(tradeId);
  if (trade) {
    playerTrades.delete(trade.offererPlayerId);
    playerTrades.delete(trade.receiverPlayerId);
    activeTrades.delete(tradeId);
  }
}

// Get player's active trade
export function getPlayerTrade(player: Player): TradeOffer | undefined {
  const tradeId = playerTrades.get(player.UserId);
  if (!tradeId) return undefined;
  return activeTrades.get(tradeId);
}

// Get tradeable dragons (not in active team)
export function getTradeableDragons(player: Player): PlayerDragon[] {
  const dragons = getPlayerDragons(player);
  const data = getPlayerData(player);
  if (!data) return dragons;

  return dragons.filter((d) => {
    // Check if this dragon is NOT in active slots and NOT a favorite
    // Manual check to avoid tuple type issues with find/includes
    const slots = data.activeDragonSlots;
    const inActiveSlots =
      slots[0] === d.instanceId ||
      slots[1] === d.instanceId ||
      slots[2] === d.instanceId;
    return !inActiveSlots && !d.isFavorite;
  });
}

// Setup trading system
export function setupTradingSystem(): void {
  const remotes =
    (ReplicatedStorage.FindFirstChild('DragonRemotes') as Folder) ||
    new Instance('Folder');
  remotes.Name = 'DragonRemotes';
  remotes.Parent = ReplicatedStorage;

  const createTradeRemote = new Instance('RemoteFunction');
  createTradeRemote.Name = 'CreateTrade';
  createTradeRemote.Parent = remotes;

  const acceptTradeRemote = new Instance('RemoteFunction');
  acceptTradeRemote.Name = 'AcceptTrade';
  acceptTradeRemote.Parent = remotes;

  const rejectTradeRemote = new Instance('RemoteFunction');
  rejectTradeRemote.Name = 'RejectTrade';
  rejectTradeRemote.Parent = remotes;

  const getTradeRemote = new Instance('RemoteFunction');
  getTradeRemote.Name = 'GetPlayerTrade';
  getTradeRemote.Parent = remotes;

  createTradeRemote.OnServerInvoke = (
    player,
    receiverUserId,
    offeredDragonIds,
    offeredCoins,
    offeredGems,
    requestedDragonIds,
    requestedCoins,
    requestedGems,
  ) => {
    if (!typeIs(receiverUserId, 'number')) {
      return { success: false, error: 'Invalid receiver' };
    }

    const receiver = Players.GetPlayerByUserId(receiverUserId);
    if (!receiver) {
      return { success: false, error: 'Player not found' };
    }

    if (
      !typeIs(offeredDragonIds, 'table') ||
      !typeIs(requestedDragonIds, 'table')
    ) {
      return { success: false, error: 'Invalid dragon lists' };
    }

    return createTradeOffer(
      player,
      receiver,
      offeredDragonIds as string[],
      typeIs(offeredCoins, 'number') ? offeredCoins : 0,
      typeIs(offeredGems, 'number') ? offeredGems : 0,
      requestedDragonIds as string[],
      typeIs(requestedCoins, 'number') ? requestedCoins : 0,
      typeIs(requestedGems, 'number') ? requestedGems : 0,
    );
  };

  acceptTradeRemote.OnServerInvoke = (player, tradeId) => {
    if (!typeIs(tradeId, 'string')) {
      return { success: false, error: 'Invalid trade ID' };
    }
    return acceptTrade(player, tradeId);
  };

  rejectTradeRemote.OnServerInvoke = (player, tradeId) => {
    if (!typeIs(tradeId, 'string')) {
      return { success: false, error: 'Invalid trade ID' };
    }
    return rejectTrade(player, tradeId);
  };

  getTradeRemote.OnServerInvoke = (player) => {
    return getPlayerTrade(player);
  };

  // Clean up on player leave
  Players.PlayerRemoving.Connect((player) => {
    const tradeId = playerTrades.get(player.UserId);
    if (tradeId) {
      cancelTrade(tradeId);
    }
  });

  // Periodic cleanup of expired trades
  task.spawn(() => {
    while (true) {
      task.wait(30);
      for (const [tradeId, trade] of activeTrades) {
        if (os.time() > trade.expiresAt && trade.status === 'pending') {
          cancelTrade(tradeId);
        }
      }
    }
  });

  print('🔄 Trading System initialized!');
}
