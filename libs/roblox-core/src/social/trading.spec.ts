/**
 * Trading System - Comprehensive Unit Tests
 * Tests trade creation, validation, execution, and exploit prevention
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ==================== TYPES ====================

interface TradeOffer {
  tradeId: string;
  offererPlayerId: number;
  receiverPlayerId: number;
  offeredDragons: string[];
  offeredCoins: number;
  offeredGems: number;
  requestedDragons: string[];
  requestedCoins: number;
  requestedGems: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: number;
  expiresAt: number;
}

interface PlayerData {
  coins: number;
  gems: number;
  dragons: Array<{
    instanceId: string;
    dragonId: string;
    isFavorite?: boolean;
  }>;
  activeDragonSlots: (string | undefined)[];
  dragonsTraded: number;
}

// ==================== MOCK IMPLEMENTATION ====================

const playerDataStore = new Map<number, PlayerData>();
const activeTrades = new Map<string, TradeOffer>();
const playerTrades = new Map<number, string>();

let currentTime = 0;
let tradeCounter = 0;

function setTime(t: number) {
  currentTime = t;
}
function osTime() {
  return currentTime;
}

const TRADE_EXPIRATION = 5 * 60; // 5 minutes

function getPlayerData(playerId: number): PlayerData | undefined {
  return playerDataStore.get(playerId);
}

function generateTradeId(): string {
  return `trade_${currentTime}_${++tradeCounter}`;
}

function createTradeOffer(
  offererId: number,
  receiverId: number,
  offeredDragonIds: string[],
  offeredCoins: number,
  offeredGems: number,
  requestedDragonIds: string[],
  requestedCoins: number,
  requestedGems: number,
): { success: boolean; trade?: TradeOffer; error?: string } {
  // Self-trade check
  if (offererId === receiverId) {
    return { success: false, error: 'Cannot trade with yourself' };
  }

  // Already trading check
  if (playerTrades.has(offererId)) {
    return { success: false, error: 'You are already in a trade' };
  }
  if (playerTrades.has(receiverId)) {
    return { success: false, error: 'That player is already trading' };
  }

  // Get player data
  const offererData = getPlayerData(offererId);
  const receiverData = getPlayerData(receiverId);

  if (!offererData) return { success: false, error: 'Offerer data not found' };
  if (!receiverData)
    return { success: false, error: 'Receiver data not found' };

  // Validate offerer owns dragons
  for (const id of offeredDragonIds) {
    if (!offererData.dragons.some((d) => d.instanceId === id)) {
      return { success: false, error: "You don't own that dragon" };
    }
  }

  // Validate receiver owns requested dragons
  for (const id of requestedDragonIds) {
    if (!receiverData.dragons.some((d) => d.instanceId === id)) {
      return { success: false, error: "They don't own that dragon" };
    }
  }

  // Validate currency
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
    offererPlayerId: offererId,
    receiverPlayerId: receiverId,
    offeredDragons: offeredDragonIds,
    offeredCoins,
    offeredGems,
    requestedDragons: requestedDragonIds,
    requestedCoins,
    requestedGems,
    status: 'pending',
    createdAt: osTime(),
    expiresAt: osTime() + TRADE_EXPIRATION,
  };

  activeTrades.set(tradeId, trade);
  playerTrades.set(offererId, tradeId);
  playerTrades.set(receiverId, tradeId);

  return { success: true, trade };
}

function acceptTrade(
  accepterId: number,
  tradeId: string,
): { success: boolean; error?: string } {
  const trade = activeTrades.get(tradeId);
  if (!trade) return { success: false, error: 'Trade not found' };

  // Only receiver can accept
  if (trade.receiverPlayerId !== accepterId) {
    return { success: false, error: 'Only the receiver can accept' };
  }

  if (trade.status !== 'pending') {
    return { success: false, error: 'Trade is no longer pending' };
  }

  // Check expiration
  if (osTime() > trade.expiresAt) {
    cleanupTrade(tradeId);
    return { success: false, error: 'Trade has expired' };
  }

  // Re-validate everything at execution time
  const offererData = getPlayerData(trade.offererPlayerId);
  const receiverData = getPlayerData(trade.receiverPlayerId);

  if (!offererData || !receiverData) {
    cleanupTrade(tradeId);
    return { success: false, error: 'Player data not found' };
  }

  // Re-check dragon ownership
  for (const id of trade.offeredDragons) {
    if (!offererData.dragons.some((d) => d.instanceId === id)) {
      cleanupTrade(tradeId);
      return { success: false, error: 'Offerer no longer owns dragon' };
    }
  }

  for (const id of trade.requestedDragons) {
    if (!receiverData.dragons.some((d) => d.instanceId === id)) {
      cleanupTrade(tradeId);
      return { success: false, error: 'Receiver no longer owns dragon' };
    }
  }

  // Re-check currency
  if (
    offererData.coins < trade.offeredCoins ||
    offererData.gems < trade.offeredGems
  ) {
    cleanupTrade(tradeId);
    return { success: false, error: "Offerer doesn't have enough currency" };
  }

  if (
    receiverData.coins < trade.requestedCoins ||
    receiverData.gems < trade.requestedGems
  ) {
    cleanupTrade(tradeId);
    return { success: false, error: "Receiver doesn't have enough currency" };
  }

  // Execute trade
  // Transfer currency
  offererData.coins -= trade.offeredCoins;
  offererData.gems -= trade.offeredGems;
  offererData.coins += trade.requestedCoins;
  offererData.gems += trade.requestedGems;

  receiverData.coins -= trade.requestedCoins;
  receiverData.gems -= trade.requestedGems;
  receiverData.coins += trade.offeredCoins;
  receiverData.gems += trade.offeredGems;

  // Transfer dragons
  for (const dragonId of trade.offeredDragons) {
    const idx = offererData.dragons.findIndex((d) => d.instanceId === dragonId);
    if (idx >= 0) {
      const dragon = offererData.dragons.splice(idx, 1)[0];
      receiverData.dragons.push(dragon);
    }
  }

  for (const dragonId of trade.requestedDragons) {
    const idx = receiverData.dragons.findIndex(
      (d) => d.instanceId === dragonId,
    );
    if (idx >= 0) {
      const dragon = receiverData.dragons.splice(idx, 1)[0];
      offererData.dragons.push(dragon);
    }
  }

  // Update stats
  offererData.dragonsTraded += trade.offeredDragons.length;
  receiverData.dragonsTraded += trade.requestedDragons.length;

  trade.status = 'accepted';
  cleanupTrade(tradeId);

  return { success: true };
}

function rejectTrade(
  rejecterId: number,
  tradeId: string,
): { success: boolean; error?: string } {
  const trade = activeTrades.get(tradeId);
  if (!trade) return { success: false, error: 'Trade not found' };

  if (trade.receiverPlayerId !== rejecterId) {
    return { success: false, error: 'Only the receiver can reject' };
  }

  trade.status = 'rejected';
  cleanupTrade(tradeId);
  return { success: true };
}

function cancelTrade(tradeId: string): void {
  const trade = activeTrades.get(tradeId);
  if (trade) {
    trade.status = 'cancelled';
    cleanupTrade(tradeId);
  }
}

function cleanupTrade(tradeId: string): void {
  const trade = activeTrades.get(tradeId);
  if (trade) {
    playerTrades.delete(trade.offererPlayerId);
    playerTrades.delete(trade.receiverPlayerId);
    activeTrades.delete(tradeId);
  }
}

function getTradeableDragons(
  playerId: number,
): Array<{ instanceId: string; dragonId: string }> {
  const data = getPlayerData(playerId);
  if (!data) return [];

  return data.dragons.filter((d) => {
    // Not in active slots
    const inSlots = data.activeDragonSlots.includes(d.instanceId);
    // Not a favorite
    const isFavorite = d.isFavorite === true;
    return !inSlots && !isFavorite;
  });
}

function getPlayerTrade(playerId: number): TradeOffer | undefined {
  const tradeId = playerTrades.get(playerId);
  if (!tradeId) return undefined;
  return activeTrades.get(tradeId);
}

// ==================== TESTS ====================

describe('Trading System', () => {
  beforeEach(() => {
    playerDataStore.clear();
    activeTrades.clear();
    playerTrades.clear();
    setTime(0);
    tradeCounter = 0;
  });

  describe('Trade Creation', () => {
    beforeEach(() => {
      playerDataStore.set(100, {
        coins: 1000,
        gems: 50,
        dragons: [
          { instanceId: 'd1', dragonId: 'fire_drake' },
          { instanceId: 'd2', dragonId: 'ember' },
        ],
        activeDragonSlots: [undefined, undefined, undefined],
        dragonsTraded: 0,
      });
      playerDataStore.set(200, {
        coins: 500,
        gems: 25,
        dragons: [{ instanceId: 'd3', dragonId: 'water_wyrm' }],
        activeDragonSlots: [undefined, undefined, undefined],
        dragonsTraded: 0,
      });
    });

    // HAPPY PATH
    it('should create valid trade offer', () => {
      const result = createTradeOffer(100, 200, ['d1'], 100, 0, ['d3'], 0, 0);
      expect(result.success).toBe(true);
      expect(result.trade).toBeDefined();
      expect(result.trade?.status).toBe('pending');
    });

    it('should create coin-only trade', () => {
      const result = createTradeOffer(100, 200, [], 500, 0, [], 250, 0);
      expect(result.success).toBe(true);
    });

    it('should create dragon-only trade', () => {
      const result = createTradeOffer(100, 200, ['d1'], 0, 0, ['d3'], 0, 0);
      expect(result.success).toBe(true);
    });

    // SAD PATH
    it('should prevent self-trade', () => {
      const result = createTradeOffer(100, 100, ['d1'], 0, 0, [], 0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot trade with yourself');
    });

    it('should prevent trading unowned dragon', () => {
      const result = createTradeOffer(100, 200, ['d999'], 0, 0, [], 0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBe("You don't own that dragon");
    });

    it('should prevent requesting unowned dragon', () => {
      const result = createTradeOffer(100, 200, [], 0, 0, ['d999'], 0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBe("They don't own that dragon");
    });

    it('should prevent trading with insufficient coins', () => {
      const result = createTradeOffer(100, 200, [], 2000, 0, [], 0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not enough coins');
    });

    it('should prevent trading with insufficient gems', () => {
      const result = createTradeOffer(100, 200, [], 0, 100, [], 0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not enough gems');
    });

    it('should prevent multiple active trades', () => {
      createTradeOffer(100, 200, ['d1'], 0, 0, [], 0, 0);
      const result = createTradeOffer(100, 300, ['d2'], 0, 0, [], 0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('You are already in a trade');
    });

    it('should prevent trading with player in trade', () => {
      createTradeOffer(100, 200, ['d1'], 0, 0, [], 0, 0);
      playerDataStore.set(300, {
        coins: 100,
        gems: 10,
        dragons: [{ instanceId: 'd4', dragonId: 'phoenix' }],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });
      const result = createTradeOffer(300, 200, ['d4'], 0, 0, [], 0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('That player is already trading');
    });
  });

  describe('Trade Acceptance', () => {
    let tradeId: string;

    beforeEach(() => {
      playerDataStore.set(100, {
        coins: 1000,
        gems: 50,
        dragons: [{ instanceId: 'd1', dragonId: 'fire_drake' }],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });
      playerDataStore.set(200, {
        coins: 500,
        gems: 25,
        dragons: [{ instanceId: 'd3', dragonId: 'water_wyrm' }],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });
      const result = createTradeOffer(100, 200, ['d1'], 100, 0, ['d3'], 50, 0);
      tradeId = result.trade!.tradeId;
    });

    it('should allow receiver to accept', () => {
      const result = acceptTrade(200, tradeId);
      expect(result.success).toBe(true);
    });

    it('should transfer dragons correctly', () => {
      acceptTrade(200, tradeId);
      const offererData = getPlayerData(100)!;
      const receiverData = getPlayerData(200)!;

      expect(
        offererData.dragons.find((d) => d.instanceId === 'd1'),
      ).toBeUndefined();
      expect(
        offererData.dragons.find((d) => d.instanceId === 'd3'),
      ).toBeDefined();
      expect(
        receiverData.dragons.find((d) => d.instanceId === 'd3'),
      ).toBeUndefined();
      expect(
        receiverData.dragons.find((d) => d.instanceId === 'd1'),
      ).toBeDefined();
    });

    it('should transfer currency correctly', () => {
      acceptTrade(200, tradeId);
      const offererData = getPlayerData(100)!;
      const receiverData = getPlayerData(200)!;

      // Offerer: 1000 - 100 + 50 = 950
      expect(offererData.coins).toBe(950);
      // Receiver: 500 - 50 + 100 = 550
      expect(receiverData.coins).toBe(550);
    });

    it('should update trade stats', () => {
      acceptTrade(200, tradeId);
      expect(getPlayerData(100)!.dragonsTraded).toBe(1);
      expect(getPlayerData(200)!.dragonsTraded).toBe(1);
    });

    it('should cleanup after acceptance', () => {
      acceptTrade(200, tradeId);
      expect(getPlayerTrade(100)).toBeUndefined();
      expect(getPlayerTrade(200)).toBeUndefined();
    });

    // SAD PATH
    it('should prevent offerer from accepting', () => {
      const result = acceptTrade(100, tradeId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Only the receiver can accept');
    });

    it('should prevent accepting expired trade', () => {
      setTime(301); // Past 5 minute expiration
      const result = acceptTrade(200, tradeId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Trade has expired');
    });

    it('should prevent accepting if dragon was traded away', () => {
      // Simulate dragon being removed somehow
      const offererData = getPlayerData(100)!;
      offererData.dragons = [];

      const result = acceptTrade(200, tradeId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Offerer no longer owns dragon');
    });

    it('should prevent accepting if currency was spent', () => {
      const offererData = getPlayerData(100)!;
      offererData.coins = 0;

      const result = acceptTrade(200, tradeId);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Offerer doesn't have enough currency");
    });
  });

  describe('Trade Rejection', () => {
    let tradeId: string;

    beforeEach(() => {
      playerDataStore.set(100, {
        coins: 1000,
        gems: 50,
        dragons: [{ instanceId: 'd1', dragonId: 'fire_drake' }],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });
      playerDataStore.set(200, {
        coins: 500,
        gems: 25,
        dragons: [],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });
      const result = createTradeOffer(100, 200, ['d1'], 0, 0, [], 0, 0);
      tradeId = result.trade!.tradeId;
    });

    it('should allow receiver to reject', () => {
      const result = rejectTrade(200, tradeId);
      expect(result.success).toBe(true);
    });

    it('should prevent offerer from rejecting', () => {
      const result = rejectTrade(100, tradeId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Only the receiver can reject');
    });

    it('should cleanup after rejection', () => {
      rejectTrade(200, tradeId);
      expect(getPlayerTrade(100)).toBeUndefined();
      expect(getPlayerTrade(200)).toBeUndefined();
    });

    it('should not transfer anything', () => {
      rejectTrade(200, tradeId);
      expect(getPlayerData(100)!.dragons.length).toBe(1);
      expect(getPlayerData(100)!.coins).toBe(1000);
    });
  });

  describe('Tradeable Dragons Filter', () => {
    it('should exclude active slot dragons', () => {
      playerDataStore.set(100, {
        coins: 1000,
        gems: 50,
        dragons: [
          { instanceId: 'd1', dragonId: 'fire_drake' },
          { instanceId: 'd2', dragonId: 'ember' },
        ],
        activeDragonSlots: ['d1', undefined, undefined],
        dragonsTraded: 0,
      });

      const tradeable = getTradeableDragons(100);
      expect(tradeable.length).toBe(1);
      expect(tradeable[0].instanceId).toBe('d2');
    });

    it('should exclude favorite dragons', () => {
      playerDataStore.set(100, {
        coins: 1000,
        gems: 50,
        dragons: [
          { instanceId: 'd1', dragonId: 'fire_drake', isFavorite: true },
          { instanceId: 'd2', dragonId: 'ember' },
        ],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });

      const tradeable = getTradeableDragons(100);
      expect(tradeable.length).toBe(1);
      expect(tradeable[0].instanceId).toBe('d2');
    });
  });
});

// ==================== EXPLOIT SCENARIOS ====================

describe('Trading Exploit Prevention', () => {
  beforeEach(() => {
    playerDataStore.clear();
    activeTrades.clear();
    playerTrades.clear();
    setTime(0);
  });

  describe('Dragon Duplication Exploit', () => {
    it('should prevent trading same dragon to multiple players', () => {
      playerDataStore.set(100, {
        coins: 1000,
        gems: 50,
        dragons: [{ instanceId: 'd1', dragonId: 'rare_dragon' }],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });
      playerDataStore.set(200, {
        coins: 500,
        gems: 25,
        dragons: [],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });
      playerDataStore.set(300, {
        coins: 500,
        gems: 25,
        dragons: [],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });

      // Create trade with player 200
      createTradeOffer(100, 200, ['d1'], 0, 0, [], 0, 0);

      // Attempt to create another trade with same dragon
      const result = createTradeOffer(100, 300, ['d1'], 0, 0, [], 0, 0);
      expect(result.success).toBe(false); // Should fail - already in trade
    });
  });

  describe('Currency Manipulation Exploit', () => {
    it('should validate currency at acceptance time', () => {
      playerDataStore.set(100, {
        coins: 1000,
        gems: 50,
        dragons: [],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });
      playerDataStore.set(200, {
        coins: 500,
        gems: 25,
        dragons: [],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });

      // Create trade offering 900 coins
      const { trade } = createTradeOffer(100, 200, [], 900, 0, [], 0, 0);

      // Spend coins before acceptance
      const offererData = getPlayerData(100)!;
      offererData.coins = 100;

      // Acceptance should fail
      const result = acceptTrade(200, trade!.tradeId);
      expect(result.success).toBe(false);
    });
  });

  describe('Race Condition Prevention', () => {
    it('should prevent double-acceptance', () => {
      playerDataStore.set(100, {
        coins: 1000,
        gems: 50,
        dragons: [{ instanceId: 'd1', dragonId: 'fire' }],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });
      playerDataStore.set(200, {
        coins: 500,
        gems: 25,
        dragons: [],
        activeDragonSlots: [],
        dragonsTraded: 0,
      });

      const { trade } = createTradeOffer(100, 200, ['d1'], 0, 0, [], 0, 0);

      // First acceptance
      const result1 = acceptTrade(200, trade!.tradeId);
      expect(result1.success).toBe(true);

      // Second acceptance should fail - trade gone
      const result2 = acceptTrade(200, trade!.tradeId);
      expect(result2.success).toBe(false);
    });
  });
});
