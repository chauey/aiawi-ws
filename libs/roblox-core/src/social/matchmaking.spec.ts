/**
 * Matchmaking System - Comprehensive Unit Tests
 * Tests ELO calculations, queue management, and match creation
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ==================== TYPES ====================

interface MatchmakingPlayer {
  playerId: number;
  rating: number;
  queuedAt: number;
}

interface Match {
  id: string;
  player1: MatchmakingPlayer;
  player2: MatchmakingPlayer;
  createdAt: number;
}

// ==================== MATCHMAKING QUEUE CLASS ====================

class MatchmakingQueue {
  private queue: MatchmakingPlayer[] = [];
  private matches: Map<string, Match> = new Map();
  private kFactor = 32;
  private initialRange = 100;
  private expansionRate = 10;
  private maxRange = 500;
  private minQueueTime = 3;
  private matchCounter = 0;
  private nowTime = 1000;

  setNow(t: number) {
    this.nowTime = t;
  }

  enqueue(playerId: number, rating: number) {
    this.dequeue(playerId);
    this.queue.push({ playerId, rating, queuedAt: this.nowTime });
  }

  dequeue(playerId: number): boolean {
    const idx = this.queue.findIndex((p) => p.playerId === playerId);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
      return true;
    }
    return false;
  }

  isInQueue(playerId: number) {
    return this.queue.some((p) => p.playerId === playerId);
  }
  getQueueSize() {
    return this.queue.length;
  }
  getQueuePosition(playerId: number) {
    const i = this.queue.findIndex((p) => p.playerId === playerId);
    return i + 1;
  }

  processQueue(): Match[] {
    const matches: Match[] = [];
    const matched = new Set<number>();
    const sorted = [...this.queue].sort((a, b) => a.queuedAt - b.queuedAt);

    for (const p of sorted) {
      if (matched.has(p.playerId)) continue;
      const wait = this.nowTime - p.queuedAt;
      if (wait < this.minQueueTime) continue;
      const range = Math.min(
        this.initialRange + wait * this.expansionRate,
        this.maxRange,
      );

      let best: MatchmakingPlayer | undefined;
      let bestDiff = range;
      for (const o of sorted) {
        if (o.playerId === p.playerId || matched.has(o.playerId)) continue;
        const diff = Math.abs(p.rating - o.rating);
        if (diff <= range && diff < bestDiff) {
          best = o;
          bestDiff = diff;
        }
      }

      if (best) {
        const m: Match = {
          id: `m_${this.matchCounter++}`,
          player1: p,
          player2: best,
          createdAt: this.nowTime,
        };
        this.matches.set(m.id, m);
        matches.push(m);
        matched.add(p.playerId);
        matched.add(best.playerId);
      }
    }
    matched.forEach((id) => this.dequeue(id));
    return matches;
  }

  getMatch(id: string) {
    return this.matches.get(id);
  }
  cancelMatch(id: string) {
    return this.matches.delete(id);
  }

  completeMatch(matchId: string, winnerId: number) {
    const m = this.matches.get(matchId);
    if (!m) return undefined;
    const isP1 = m.player1.playerId === winnerId;
    const winner = isP1 ? m.player1 : m.player2;
    const loser = isP1 ? m.player2 : m.player1;
    const exp = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
    const change = Math.floor(this.kFactor * (1 - exp));
    this.matches.delete(matchId);
    return {
      matchId,
      winnerId: winner.playerId,
      loserId: loser.playerId,
      winnerNewRating: Math.max(0, winner.rating + change),
      loserNewRating: Math.max(0, loser.rating - change),
      ratingChange: change,
    };
  }
}

function getRankFromRating(r: number): string {
  if (r >= 2500) return 'Grandmaster';
  if (r >= 2000) return 'Master';
  if (r >= 1700) return 'Diamond';
  if (r >= 1400) return 'Platinum';
  if (r >= 1100) return 'Gold';
  if (r >= 800) return 'Silver';
  if (r >= 500) return 'Bronze';
  return 'Unranked';
}

// ==================== TESTS ====================

describe('Matchmaking System', () => {
  let q: MatchmakingQueue;
  beforeEach(() => {
    q = new MatchmakingQueue();
    q.setNow(1000);
  });

  describe('Queue Management', () => {
    it('should enqueue player', () => {
      q.enqueue(1, 1000);
      expect(q.isInQueue(1)).toBe(true);
    });
    it('should dequeue player', () => {
      q.enqueue(1, 1000);
      expect(q.dequeue(1)).toBe(true);
      expect(q.isInQueue(1)).toBe(false);
    });
    it('should return queue position', () => {
      q.enqueue(1, 1000);
      q.enqueue(2, 1000);
      expect(q.getQueuePosition(2)).toBe(2);
    });
    it('should prevent duplicates', () => {
      q.enqueue(1, 1000);
      q.enqueue(1, 1200);
      expect(q.getQueueSize()).toBe(1);
    });
    it('should return false for non-existent dequeue', () => {
      expect(q.dequeue(999)).toBe(false);
    });
    it('should handle empty queue', () => {
      expect(q.getQueueSize()).toBe(0);
    });
  });

  describe('Match Creation', () => {
    it('should match compatible players', () => {
      q.enqueue(1, 1000);
      q.enqueue(2, 1050);
      q.setNow(1010);
      expect(q.processQueue()).toHaveLength(1);
    });
    it('should remove matched from queue', () => {
      q.enqueue(1, 1000);
      q.enqueue(2, 1050);
      q.setNow(1010);
      q.processQueue();
      expect(q.getQueueSize()).toBe(0);
    });
    it('should prefer closer ratings', () => {
      q.enqueue(1, 1000);
      q.enqueue(2, 1010);
      q.enqueue(3, 1090);
      q.setNow(1010);
      const m = q.processQueue();
      expect(m[0].player2.playerId).toBe(2);
    });
    it('should not match before min time', () => {
      q.enqueue(1, 1000);
      q.enqueue(2, 1010);
      expect(q.processQueue()).toHaveLength(0);
    });
    it('should not match outside range', () => {
      q.enqueue(1, 500);
      q.enqueue(2, 2000);
      q.setNow(1010);
      expect(q.processQueue()).toHaveLength(0);
    });
    it('should expand range over time', () => {
      q.enqueue(1, 1000);
      q.enqueue(2, 1400);
      q.setNow(1031); // After 31 seconds: range = 100 + 31*10 = 410, diff = 400
      expect(q.processQueue()).toHaveLength(1);
    });
    it('should handle odd players', () => {
      q.enqueue(1, 1000);
      q.enqueue(2, 1010);
      q.enqueue(3, 1020);
      q.setNow(1010);
      q.processQueue();
      expect(q.getQueueSize()).toBe(1);
    });
  });

  describe('ELO Calculations', () => {
    it('should award winner points', () => {
      q.enqueue(1, 1000);
      q.enqueue(2, 1000);
      q.setNow(1010);
      const m = q.processQueue();
      const r = q.completeMatch(m[0].id, 1);
      expect(r!.winnerNewRating).toBeGreaterThan(1000);
    });
    it('should give more when underdog wins', () => {
      q.enqueue(1, 800);
      q.enqueue(2, 1200);
      q.setNow(1050);
      const m = q.processQueue();
      const r = q.completeMatch(m[0].id, 1);
      const q2 = new MatchmakingQueue();
      q2.setNow(1000);
      q2.enqueue(3, 1200);
      q2.enqueue(4, 800);
      q2.setNow(1050);
      const m2 = q2.processQueue();
      const r2 = q2.completeMatch(m2[0].id, 3);
      expect(r!.ratingChange).toBeGreaterThan(r2!.ratingChange);
    });
    it('should give 16 for equal ratings', () => {
      q.enqueue(1, 1000);
      q.enqueue(2, 1000);
      q.setNow(1010);
      const m = q.processQueue();
      expect(q.completeMatch(m[0].id, 1)!.ratingChange).toBe(16);
    });
    it('should never give negative rating', () => {
      q.enqueue(1, 0);
      q.enqueue(2, 50);
      q.setNow(1050);
      const m = q.processQueue();
      const r = q.completeMatch(m[0].id, 2);
      expect(r!.loserNewRating).toBeGreaterThanOrEqual(0);
    });
    it('should return undefined for fake match', () => {
      expect(q.completeMatch('fake', 1)).toBeUndefined();
    });
  });

  describe('Match Management', () => {
    it('should get match', () => {
      q.enqueue(1, 1000);
      q.enqueue(2, 1000);
      q.setNow(1010);
      const m = q.processQueue();
      expect(q.getMatch(m[0].id)).toBeDefined();
    });
    it('should cancel match', () => {
      q.enqueue(1, 1000);
      q.enqueue(2, 1000);
      q.setNow(1010);
      const m = q.processQueue();
      expect(q.cancelMatch(m[0].id)).toBe(true);
    });
    it('should return undefined for fake', () => {
      expect(q.getMatch('fake')).toBeUndefined();
    });
  });

  describe('Rank Tiers', () => {
    it('should return correct ranks', () => {
      expect(getRankFromRating(2500)).toBe('Grandmaster');
      expect(getRankFromRating(2000)).toBe('Master');
      expect(getRankFromRating(1700)).toBe('Diamond');
      expect(getRankFromRating(1100)).toBe('Gold');
      expect(getRankFromRating(500)).toBe('Bronze');
      expect(getRankFromRating(0)).toBe('Unranked');
    });
    it('should handle edge values', () => {
      expect(getRankFromRating(2499)).toBe('Master');
      expect(getRankFromRating(-100)).toBe('Unranked');
    });
  });
});
