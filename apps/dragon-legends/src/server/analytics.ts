// Dragon Legends - Analytics Event Tracking
// Integrates with roblox-core analytics system

import { Players } from '@rbxts/services';

// ==================== EVENT TYPES ====================

export type AnalyticsEvent =
  | 'game_start'
  | 'game_end'
  | 'egg_purchase'
  | 'egg_hatch'
  | 'dragon_obtained'
  | 'dragon_evolved'
  | 'breeding_started'
  | 'breeding_complete'
  | 'battle_start'
  | 'battle_end'
  | 'arena_match'
  | 'world_boss_joined'
  | 'world_boss_complete'
  | 'clan_joined'
  | 'clan_created'
  | 'trade_completed'
  | 'quest_completed'
  | 'daily_reward_claimed'
  | 'level_up'
  | 'region_unlocked'
  | 'purchase_completed'
  | 'purchase_failed';

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  playerId: number;
  timestamp: number;
  sessionId: string;
  properties: Record<string, unknown>;
}

// ==================== SESSION TRACKING ====================

const playerSessions = new Map<
  number,
  { sessionId: string; startTime: number }
>();

function generateSessionId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    const index = math.floor(math.random() * chars.size()) + 1;
    result += string.sub(chars, index, index);
  }
  return result;
}

export function startSession(player: Player): void {
  const sessionId = generateSessionId();
  playerSessions.set(player.UserId, {
    sessionId,
    startTime: os.time(),
  });

  trackEvent(player, 'game_start', {
    firstJoin: player.AccountAge < 1,
  });
}

export function endSession(player: Player): void {
  const session = playerSessions.get(player.UserId);
  if (session) {
    const duration = os.time() - session.startTime;
    trackEvent(player, 'game_end', {
      sessionDuration: duration,
    });
    playerSessions.delete(player.UserId);
  }
}

// ==================== EVENT TRACKING ====================

const eventQueue: AnalyticsEventData[] = [];
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 30; // seconds

export function trackEvent(
  player: Player,
  event: AnalyticsEvent,
  properties: Record<string, unknown> = {},
): void {
  const session = playerSessions.get(player.UserId);

  const eventData: AnalyticsEventData = {
    event,
    playerId: player.UserId,
    timestamp: os.time(),
    sessionId: session?.sessionId ?? 'unknown',
    properties: {
      ...properties,
      playerName: player.Name,
      accountAge: player.AccountAge,
    },
  };

  eventQueue.push(eventData);

  // Log locally for debugging
  print(
    `[Analytics] ${event} - Player: ${player.Name} - Props: ${tostring(properties)}`,
  );

  // Batch send when queue is full
  if (eventQueue.size() >= BATCH_SIZE) {
    flushEvents();
  }
}

function flushEvents(): void {
  if (eventQueue.size() === 0) return;

  // In production, send to analytics service (e.g., GameAnalytics, Amplitude, custom backend)
  // For now, just clear the queue
  const eventsToSend = [...eventQueue];
  eventQueue.clear();

  // TODO: Send to analytics backend
  // HttpService.PostAsync(ANALYTICS_URL, HttpService.JSONEncode(eventsToSend));

  print(`[Analytics] Flushed ${eventsToSend.size()} events`);
}

// ==================== SPECIFIC TRACKING HELPERS ====================

export function trackEggPurchase(
  player: Player,
  eggType: string,
  robuxSpent: number,
): void {
  trackEvent(player, 'egg_purchase', {
    eggType,
    robuxSpent,
    currency: 'robux',
  });
}

export function trackEggHatch(
  player: Player,
  eggType: string,
  dragonId: string,
  rarity: string,
  isShiny: boolean,
): void {
  trackEvent(player, 'egg_hatch', {
    eggType,
    dragonId,
    rarity,
    isShiny,
  });

  trackEvent(player, 'dragon_obtained', {
    dragonId,
    rarity,
    isShiny,
    source: 'egg',
  });
}

export function trackBreeding(
  player: Player,
  parent1Id: string,
  parent2Id: string,
  resultId: string,
  resultRarity: string,
  isMutation: boolean,
): void {
  trackEvent(player, 'breeding_complete', {
    parent1Id,
    parent2Id,
    resultId,
    resultRarity,
    isMutation,
  });
}

export function trackBattle(
  player: Player,
  battleType: 'wild' | 'arena' | 'worldboss',
  won: boolean,
  dragonUsed: string,
  enemyType: string,
): void {
  trackEvent(player, 'battle_end', {
    battleType,
    won,
    dragonUsed,
    enemyType,
  });
}

export function trackArenaMatch(
  player: Player,
  won: boolean,
  ratingChange: number,
  newRating: number,
  opponentRating: number,
): void {
  trackEvent(player, 'arena_match', {
    won,
    ratingChange,
    newRating,
    opponentRating,
  });
}

export function trackWorldBoss(
  player: Player,
  bossId: string,
  damageDealt: number,
  rank: number,
  rewards: string[],
): void {
  trackEvent(player, 'world_boss_complete', {
    bossId,
    damageDealt,
    rank,
    rewardCount: rewards.size(),
  });
}

export function trackPurchase(
  player: Player,
  productName: string,
  robuxSpent: number,
  success: boolean,
): void {
  trackEvent(player, success ? 'purchase_completed' : 'purchase_failed', {
    productName,
    robuxSpent,
  });
}

// ==================== RETENTION METRICS ====================

export function trackDailyReward(
  player: Player,
  day: number,
  reward: string,
): void {
  trackEvent(player, 'daily_reward_claimed', {
    streakDay: day,
    reward,
  });
}

export function trackQuestComplete(
  player: Player,
  questType: 'daily' | 'weekly',
  questName: string,
  rewards: Record<string, number>,
): void {
  trackEvent(player, 'quest_completed', {
    questType,
    questName,
    rewards,
  });
}

// ==================== SETUP ====================

export function setupAnalytics(): void {
  // Track player joins
  Players.PlayerAdded.Connect((player) => {
    startSession(player);
  });

  // Track player leaves
  Players.PlayerRemoving.Connect((player) => {
    endSession(player);
  });

  // Periodic flush
  task.spawn(() => {
    while (true) {
      task.wait(BATCH_INTERVAL);
      flushEvents();
    }
  });

  print('[Analytics] Analytics system initialized');
}
