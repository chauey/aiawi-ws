/**
 * Daily Rewards System - Unit Tests
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  PlayerDailyRewardState,
  DailyRewardConfig,
  DEFAULT_DAILY_REWARD_CONFIG,
  getInitialRewardState,
  canClaimDailyReward,
  shouldResetStreak,
  getRewardForDay,
  claimDailyReward,
  getStreakStatus,
  formatTimeUntil,
  getNextMilestone,
  getDaysUntilMilestone,
  calculateStreakBonus,
  formatRewardPreview,
} from './dailyRewards';

// Mock time for testing
let mockTime = 0;
const originalDateNow = Date.now;

function setMockTime(time: number) {
  mockTime = time;
  Date.now = () => mockTime;
}

function advanceTime(hours: number) {
  mockTime += hours * 60 * 60 * 1000;
}

describe('Daily Rewards System', () => {
  let state: PlayerDailyRewardState;
  let config: DailyRewardConfig;

  beforeEach(() => {
    state = getInitialRewardState();
    config = { ...DEFAULT_DAILY_REWARD_CONFIG };
    setMockTime(1000000000000); // Jan 2001 or so
  });

  afterAll(() => {
    Date.now = originalDateNow;
  });

  describe('Initial State', () => {
    it('should create initial state correctly', () => {
      expect(state.lastClaimTime).toBe(0);
      expect(state.currentStreak).toBe(0);
      expect(state.totalClaims).toBe(0);
      expect(state.longestStreak).toBe(0);
    });
  });

  describe('canClaimDailyReward', () => {
    it('should allow first claim', () => {
      const result = canClaimDailyReward(state, config);
      expect(result.success).toBe(true);
    });

    it('should block claim within 24 hours', () => {
      state.lastClaimTime = mockTime;
      advanceTime(12); // 12 hours later

      const result = canClaimDailyReward(state, config);
      expect(result.success).toBe(false);
      expect(result.code).toBe('ALREADY_CLAIMED');
    });

    it('should allow claim after 24 hours', () => {
      state.lastClaimTime = mockTime;
      advanceTime(25); // 25 hours later

      const result = canClaimDailyReward(state, config);
      expect(result.success).toBe(true);
    });

    it('should include next claim time on rejection', () => {
      state.lastClaimTime = mockTime;
      advanceTime(12);

      const result = canClaimDailyReward(state, config);
      expect(result.nextClaimTime).toBeDefined();
      expect(result.nextClaimTime).toBeGreaterThan(mockTime);
    });
  });

  describe('shouldResetStreak', () => {
    it('should not reset on first claim', () => {
      expect(shouldResetStreak(state, config)).toBe(false);
    });

    it('should not reset within grace period', () => {
      state.lastClaimTime = mockTime;
      advanceTime(40); // Within 48 hour reset window

      expect(shouldResetStreak(state, config)).toBe(false);
    });

    it('should reset after grace period', () => {
      state.lastClaimTime = mockTime;
      advanceTime(50); // Beyond 48 hour reset window

      expect(shouldResetStreak(state, config)).toBe(true);
    });
  });

  describe('getRewardForDay', () => {
    it('should return day 1 reward', () => {
      const reward = getRewardForDay(1, config);
      expect(reward.day).toBe(1);
      expect(reward.coins).toBe(100);
      expect(reward.gems).toBe(0);
    });

    it('should return day 7 reward with special', () => {
      const reward = getRewardForDay(7, config);
      expect(reward.day).toBe(7);
      expect(reward.coins).toBe(500);
      expect(reward.gems).toBe(20);
      expect(reward.specialReward).toBe('weekly_chest');
    });

    it('should scale rewards for high streaks', () => {
      const reward = getRewardForDay(45, config); // Beyond day 30
      expect(reward.coins).toBeGreaterThan(2500); // Should be scaled up
    });
  });

  describe('claimDailyReward', () => {
    it('should claim first reward successfully', () => {
      const result = claimDailyReward(state, config);

      expect(result.success).toBe(true);
      expect(result.newStreak).toBe(1);
      expect(result.reward).toBeDefined();
      expect(result.reward?.coins).toBe(100);
      expect(state.lastClaimTime).toBe(mockTime);
      expect(state.totalClaims).toBe(1);
    });

    it('should increment streak on consecutive claims', () => {
      claimDailyReward(state, config);
      advanceTime(25);
      const result = claimDailyReward(state, config);

      expect(result.newStreak).toBe(2);
      expect(state.currentStreak).toBe(2);
    });

    it('should reset streak after too long', () => {
      claimDailyReward(state, config);
      state.currentStreak = 10;
      advanceTime(50); // Beyond reset window

      const result = claimDailyReward(state, config);
      expect(result.newStreak).toBe(1); // Reset to 1
    });

    it('should apply VIP multiplier', () => {
      const normalResult = claimDailyReward({ ...state }, config, false);
      const vipResult = claimDailyReward({ ...state }, config, true);

      expect(vipResult.reward?.coins).toBe(
        normalResult.reward!.coins * config.vipMultiplier,
      );
    });

    it('should track longest streak', () => {
      // Build up streak
      for (let i = 0; i < 10; i++) {
        claimDailyReward(state, config);
        advanceTime(25);
      }

      expect(state.longestStreak).toBe(10);

      // Reset streak
      advanceTime(50);
      claimDailyReward(state, config);

      expect(state.currentStreak).toBe(1);
      expect(state.longestStreak).toBe(10); // Should remember longest
    });

    it('should cap streak at max', () => {
      state.currentStreak = config.maxStreak;
      state.lastClaimTime = mockTime;
      advanceTime(25);

      const result = claimDailyReward(state, config);
      expect(result.newStreak).toBe(config.maxStreak);
    });
  });

  describe('Streak Status', () => {
    it('should report correct status for new player', () => {
      const status = getStreakStatus(state, config);

      expect(status.streak).toBe(0);
      expect(status.canClaim).toBe(true);
    });

    it('should report cannot claim after recent claim', () => {
      claimDailyReward(state, config);

      const status = getStreakStatus(state, config);
      expect(status.canClaim).toBe(false);
      expect(status.hoursUntilClaim).toBeGreaterThan(0);
    });

    it('should warn about impending reset', () => {
      state.lastClaimTime = mockTime;
      advanceTime(30); // Can claim but near reset

      const status = getStreakStatus(state, config);
      expect(status.canClaim).toBe(true);
      expect(status.willResetIfNotClaimed).toBe(true);
    });
  });

  describe('Utilities', () => {
    it('should format time correctly', () => {
      expect(formatTimeUntil(0.5)).toBe('30m');
      expect(formatTimeUntil(3)).toBe('3h');
      expect(formatTimeUntil(25)).toBe('1d 1h');
      expect(formatTimeUntil(48)).toBe('2d');
    });

    it('should find next milestone', () => {
      const milestone = getNextMilestone(3, config);
      expect(milestone?.day).toBe(4);
    });

    it('should calculate days until milestone', () => {
      expect(getDaysUntilMilestone(5, config)).toBe(1); // Next is day 6
    });

    it('should calculate streak bonus', () => {
      expect(calculateStreakBonus(3)).toBe(0);
      expect(calculateStreakBonus(7)).toBe(10);
      expect(calculateStreakBonus(14)).toBe(25);
      expect(calculateStreakBonus(30)).toBe(50);
    });

    it('should format reward preview', () => {
      const preview = formatRewardPreview({
        day: 7,
        coins: 500,
        gems: 20,
        specialReward: 'weekly_chest',
      });

      expect(preview).toContain('500 coins');
      expect(preview).toContain('20 gems');
      expect(preview).toContain('weekly_chest');
    });
  });
});
