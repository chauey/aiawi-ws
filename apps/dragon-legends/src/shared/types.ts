// Dragon Legends - Shared Types and Interfaces

import type { Element, Rarity, DragonStats } from './config';

// ============ PLAYER DATA TYPES ============

export interface PlayerDragon {
  instanceId: string; // Unique per dragon instance
  dragonId: string; // References DRAGONS config
  nickname?: string;
  level: number;
  experience: number;
  stats: DragonStats;
  element: Element;
  rarity: Rarity;
  evolutionStage: 1 | 2 | 3 | 4;
  isShiny: boolean;
  obtainedAt: number; // Unix timestamp
  breedCount: number; // Times used in breeding
  battleWins: number;
  battleLosses: number;
  isFavorite: boolean;
  equippedSlot?: number; // 1-3 for active team
}

export interface PlayerData {
  // Currency
  coins: number;
  gems: number;

  // Dragons
  dragons: PlayerDragon[];
  activeDragonSlots: [string?, string?, string?]; // Up to 3 active dragons

  // Progression
  playerLevel: number;
  playerXp: number;
  unlockedRegions: string[];

  // Clan
  clanId?: string;
  clanRole?: 'leader' | 'officer' | 'member';

  // Daily
  lastLoginDate: string; // YYYY-MM-DD
  loginStreak: number;
  dailyQuestsCompleted: string[];
  lastDailyReset: number;

  // Stats
  totalBattlesWon: number;
  totalBattlesLost: number;
  dragonsHatched: number;
  dragonsEvolved: number;
  dragonsTraded: number;

  // Arena
  arenaRating: number;
  arenaWins: number;
  arenaLosses: number;
  bestArenaRank: number;

  // Achievements
  achievements: string[];

  // Settings
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

// ============ COMBAT TYPES ============

export interface BattleMove {
  name: string;
  element: Element;
  power: number;
  accuracy: number;
  cooldown: number;
  description: string;
}

export interface BattleAction {
  type: 'attack' | 'defend' | 'special' | 'switch' | 'flee';
  moveIndex?: number;
  targetIndex?: number;
  switchToInstanceId?: string;
}

export interface BattleResult {
  winner: 'player' | 'opponent' | 'draw';
  xpGained: number;
  coinsGained: number;
  dragonXpGained: number;
  ratingChange?: number;
}

export interface BattleDragonState {
  instanceId: string;
  dragonId: string;
  currentHp: number;
  maxHp: number;
  element: Element;
  level: number;
  stats: DragonStats;
  moveCooldowns: number[];
  statusEffects: string[];
}

export interface BattleState {
  battleId: string;
  battleType: 'wild' | 'pvp' | 'boss' | 'arena';
  playerDragons: BattleDragonState[];
  opponentDragons: BattleDragonState[];
  currentTurn: 'player' | 'opponent';
  turnNumber: number;
  isFinished: boolean;
  result?: BattleResult;
}

// ============ BREEDING TYPES ============

export interface BreedingSlot {
  slotId: number;
  dragon1InstanceId: string;
  dragon2InstanceId: string;
  startTime: number;
  endTime: number;
  resultDragonId?: string;
  isShiny?: boolean;
}

export interface BreedingResult {
  success: boolean;
  dragonId: string;
  rarity: Rarity;
  isShiny: boolean;
  isMutation: boolean;
}

// ============ CLAN TYPES ============

export interface ClanMember {
  playerId: number;
  playerName: string;
  role: 'leader' | 'officer' | 'member';
  joinedAt: number;
  contribution: number;
  lastActive: number;
}

export interface ClanData {
  clanId: string;
  name: string;
  tag: string; // 3-5 char tag
  description: string;
  level: number;
  experience: number;
  members: ClanMember[];
  maxMembers: number;
  createdAt: number;
  leaderPlayerId: number;
  weeklyWarScore: number;
  territoryCount: number;
  perks: string[];
}

// ============ QUEST TYPES ============

export interface Quest {
  questId: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement';
  requirements: {
    type: string;
    target: number;
    current: number;
  }[];
  rewards: {
    coins?: number;
    gems?: number;
    dragonId?: string;
    eggType?: string;
    xp?: number;
  };
  isCompleted: boolean;
  expiresAt?: number;
}

// ============ WORLD BOSS TYPES ============

export interface WorldBossState {
  bossId: string;
  name: string;
  element: Element;
  currentHp: number;
  maxHp: number;
  phase: number;
  participants: { playerId: number; damage: number }[];
  startTime: number;
  isDefeated: boolean;
  nextSpawnTime?: number;
}

// ============ TRADING TYPES ============

export interface TradeOffer {
  tradeId: string;
  offererPlayerId: number;
  receiverPlayerId: number;
  offeredDragons: string[]; // Instance IDs
  offeredCoins: number;
  offeredGems: number;
  requestedDragons: string[]; // Instance IDs
  requestedCoins: number;
  requestedGems: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: number;
  expiresAt: number;
}

// ============ EVENTS ============

export interface GameEvent {
  eventId: string;
  name: string;
  description: string;
  type: 'seasonal' | 'weekend' | 'limited';
  startTime: number;
  endTime: number;
  bonuses: {
    type: string;
    multiplier: number;
  }[];
  exclusiveDragons: string[];
  isActive: boolean;
}

// ============ UTILITY TYPES ============

export interface RemoteEventData {
  eventName: string;
  data: unknown;
}

export type NetworkMessage<T = unknown> = {
  type: string;
  payload: T;
  timestamp: number;
};
