/**
 * Daily Rewards System - Streak-based daily login rewards
 * Game-agnostic logic for retention mechanics
 */

// ==================== TYPES ====================

export interface DailyRewardTier {
  day: number;
  coins: number;
  gems: number;
  specialReward?: string;
  multiplier?: number;
}

export interface DailyRewardConfig {
  rewards: DailyRewardTier[];
  streakResetHours: number; // Hours after which streak resets if not claimed
  maxStreak: number;
  missedDayGracePeriod: number; // Hours grace period before streak resets
  vipMultiplier: number;
}

export interface PlayerDailyRewardState {
  lastClaimTime: number;
  currentStreak: number;
  totalClaims: number;
  longestStreak: number;
}

export interface ClaimResult {
  success: boolean;
  reward?: DailyRewardTier;
  newStreak?: number;
  error?: string;
  code?: string;
  nextClaimTime?: number;
}

// ==================== DEFAULT CONFIG ====================

export const DEFAULT_DAILY_REWARDS: DailyRewardTier[] = [
  { day: 1, coins: 100, gems: 0 },
  { day: 2, coins: 150, gems: 0 },
  { day: 3, coins: 200, gems: 5 },
  { day: 4, coins: 250, gems: 0 },
  { day: 5, coins: 300, gems: 10 },
  { day: 6, coins: 400, gems: 0 },
  { day: 7, coins: 500, gems: 20, specialReward: 'weekly_chest' },
  {
    day: 14,
    coins: 1000,
    gems: 50,
    specialReward: 'legendary_chest',
    multiplier: 2,
  },
  {
    day: 30,
    coins: 2500,
    gems: 100,
    specialReward: 'monthly_mega_reward',
    multiplier: 3,
  },
];

export const DEFAULT_DAILY_REWARD_CONFIG: DailyRewardConfig = {
  rewards: DEFAULT_DAILY_REWARDS,
  streakResetHours: 48, // 48 hours to claim before streak resets
  maxStreak: 365,
  missedDayGracePeriod: 24,
  vipMultiplier: 2,
};

// ==================== CORE LOGIC ====================

export function getInitialRewardState(): PlayerDailyRewardState {
  return {
    lastClaimTime: 0,
    currentStreak: 0,
    totalClaims: 0,
    longestStreak: 0,
  };
}

export function getServerTime(): number {
  // Works in both Node.js and Roblox
  if (typeof Date !== 'undefined' && Date.now) {
    return Date.now();
  }
  // Roblox fallback
  return (
    (globalThis as { os?: { time: () => number } }).os?.time?.() ?? 0 * 1000
  );
}

export function getHoursSinceLastClaim(state: PlayerDailyRewardState): number {
  if (state.lastClaimTime === 0) return Infinity;
  const now = getServerTime();
  return (now - state.lastClaimTime) / (1000 * 60 * 60);
}

export function canClaimDailyReward(
  state: PlayerDailyRewardState,
  _config: DailyRewardConfig,
): ClaimResult {
  const hoursSince = getHoursSinceLastClaim(state);

  // First time claim
  if (state.lastClaimTime === 0) {
    return { success: true };
  }

  // Need to wait 24 hours between claims
  if (hoursSince < 24) {
    const nextClaimTime = state.lastClaimTime + 24 * 60 * 60 * 1000;
    return {
      success: false,
      error: 'Already claimed today',
      code: 'ALREADY_CLAIMED',
      nextClaimTime,
    };
  }

  return { success: true };
}

export function shouldResetStreak(
  state: PlayerDailyRewardState,
  config: DailyRewardConfig,
): boolean {
  if (state.lastClaimTime === 0) return false;

  const hoursSince = getHoursSinceLastClaim(state);
  return hoursSince > config.streakResetHours;
}

export function getRewardForDay(
  day: number,
  config: DailyRewardConfig,
): DailyRewardTier {
  // Find exact match or closest lower reward
  const sortedRewards = [...config.rewards].sort((a, b) => b.day - a.day);
  const reward = sortedRewards.find((r) => r.day <= day);

  if (reward) {
    // Scale up for days beyond defined rewards
    const baseTier = reward;
    const dayDiff = day - baseTier.day;

    if (dayDiff > 0) {
      // Every 7 days after last defined tier, small bonus
      const bonusCycles = Math.floor(dayDiff / 7);
      return {
        day,
        coins: baseTier.coins + bonusCycles * 100,
        gems: baseTier.gems + bonusCycles * 5,
        multiplier: baseTier.multiplier,
      };
    }
    return { ...baseTier, day };
  }

  // Fallback to day 1 reward
  return config.rewards[0] || { day: 1, coins: 100, gems: 0 };
}

export function claimDailyReward(
  state: PlayerDailyRewardState,
  config: DailyRewardConfig,
  isVip = false,
): ClaimResult {
  const canClaim = canClaimDailyReward(state, config);
  if (!canClaim.success) {
    return canClaim;
  }

  // Check if streak should reset
  const resetStreak = shouldResetStreak(state, config);

  // Calculate new streak
  let newStreak: number;
  if (resetStreak || state.currentStreak === 0) {
    newStreak = 1;
  } else {
    newStreak = Math.min(state.currentStreak + 1, config.maxStreak);
  }

  // Get reward for this day
  const baseReward = getRewardForDay(newStreak, config);

  // Apply VIP multiplier
  const multiplier = isVip ? config.vipMultiplier : 1;
  const finalMultiplier = multiplier * (baseReward.multiplier || 1);

  const finalReward: DailyRewardTier = {
    day: newStreak,
    coins: Math.floor(baseReward.coins * finalMultiplier),
    gems: Math.floor(baseReward.gems * finalMultiplier),
    specialReward: baseReward.specialReward,
    multiplier: finalMultiplier,
  };

  // Update state
  state.lastClaimTime = getServerTime();
  state.currentStreak = newStreak;
  state.totalClaims++;
  state.longestStreak = Math.max(state.longestStreak, newStreak);

  return {
    success: true,
    reward: finalReward,
    newStreak,
    nextClaimTime: state.lastClaimTime + 24 * 60 * 60 * 1000,
  };
}

// ==================== UTILITIES ====================

export function getStreakStatus(
  state: PlayerDailyRewardState,
  config: DailyRewardConfig,
): {
  streak: number;
  canClaim: boolean;
  hoursUntilClaim: number;
  hoursUntilReset: number;
  willResetIfNotClaimed: boolean;
} {
  const hoursSince = getHoursSinceLastClaim(state);
  const canClaim = hoursSince >= 24 || state.lastClaimTime === 0;
  const hoursUntilClaim = Math.max(0, 24 - hoursSince);
  const hoursUntilReset = Math.max(0, config.streakResetHours - hoursSince);
  const willResetIfNotClaimed =
    hoursSince > 24 && hoursSince < config.streakResetHours;

  return {
    streak: state.currentStreak,
    canClaim,
    hoursUntilClaim,
    hoursUntilReset,
    willResetIfNotClaimed,
  };
}

export function formatTimeUntil(hours: number): string {
  if (hours < 1) {
    const minutes = Math.ceil(hours * 60);
    return `${minutes}m`;
  }
  if (hours < 24) {
    return `${Math.ceil(hours)}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.ceil(hours % 24);
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

export function getNextMilestone(
  currentStreak: number,
  config: DailyRewardConfig,
): DailyRewardTier | undefined {
  const sortedRewards = [...config.rewards].sort((a, b) => a.day - b.day);
  return sortedRewards.find((r) => r.day > currentStreak);
}

export function getDaysUntilMilestone(
  currentStreak: number,
  config: DailyRewardConfig,
): number {
  const next = getNextMilestone(currentStreak, config);
  return next ? next.day - currentStreak : 0;
}

export function calculateStreakBonus(streak: number): number {
  // Bonus percentage based on streak
  // 0-6 days: 0%, 7-13: 10%, 14-29: 25%, 30+: 50%
  if (streak >= 30) return 50;
  if (streak >= 14) return 25;
  if (streak >= 7) return 10;
  return 0;
}

export function formatRewardPreview(reward: DailyRewardTier): string {
  const parts: string[] = [];
  if (reward.coins > 0) parts.push(`💰 ${reward.coins} coins`);
  if (reward.gems > 0) parts.push(`💎 ${reward.gems} gems`);
  if (reward.specialReward) parts.push(`🎁 ${reward.specialReward}`);
  return parts.join(' + ');
}
