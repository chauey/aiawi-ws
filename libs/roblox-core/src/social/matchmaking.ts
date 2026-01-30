// Roblox Core - ELO Matchmaking System
// Reusable matchmaking with ELO rating calculations

// ==================== TYPES ====================

export interface MatchmakingPlayer {
  playerId: number;
  rating: number;
  queuedAt: number;
  metadata?: Record<string, unknown>;
}

export interface Match<T = unknown> {
  id: string;
  player1: MatchmakingPlayer;
  player2: MatchmakingPlayer;
  createdAt: number;
  metadata?: T;
}

export interface MatchResult {
  matchId: string;
  winnerId: number;
  loserId: number;
  winnerNewRating: number;
  loserNewRating: number;
  ratingChange: number;
}

export interface MatchmakingConfig {
  baseRating: number;
  kFactor: number;
  initialRatingRange: number;
  ratingRangeExpansionPerSecond: number;
  maxRatingRange: number;
  minQueueTimeForMatch: number; // seconds
}

// ==================== DEFAULT CONFIG ====================

export const DEFAULT_MATCHMAKING_CONFIG: MatchmakingConfig = {
  baseRating: 1000,
  kFactor: 32,
  initialRatingRange: 100,
  ratingRangeExpansionPerSecond: 10,
  maxRatingRange: 500,
  minQueueTimeForMatch: 3,
};

// ==================== MATCHMAKING QUEUE ====================

export class MatchmakingQueue {
  private queue: MatchmakingPlayer[] = [];
  private matches: Map<string, Match> = new Map();
  private config: MatchmakingConfig;
  private matchCounter = 0;

  constructor(config: Partial<MatchmakingConfig> = {}) {
    this.config = { ...DEFAULT_MATCHMAKING_CONFIG, ...config };
  }

  /**
   * Add a player to the matchmaking queue
   */
  enqueue(
    playerId: number,
    rating: number,
    metadata?: Record<string, unknown>,
  ): void {
    // Remove if already in queue
    this.dequeue(playerId);

    this.queue.push({
      playerId,
      rating,
      queuedAt: os.time(),
      metadata,
    });
  }

  /**
   * Remove a player from the queue
   */
  dequeue(playerId: number): boolean {
    const index = this.queue.findIndex((p) => p.playerId === playerId);
    if (index !== -1) {
      this.queue.remove(index);
      return true;
    }
    return false;
  }

  /**
   * Check if a player is in queue
   */
  isInQueue(playerId: number): boolean {
    return this.queue.find((p) => p.playerId === playerId) !== undefined;
  }

  /**
   * Get queue position for a player
   */
  getQueuePosition(playerId: number): number {
    const index = this.queue.findIndex((p) => p.playerId === playerId);
    return index + 1; // 1-indexed, 0 if not found
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.size();
  }

  /**
   * Attempt to create matches from the queue
   */
  processQueue(): Match[] {
    const now = os.time();
    const newMatches: Match[] = [];
    const matchedPlayerIds = new Set<number>();

    // Sort by queue time (oldest first)
    const sortedQueue = [...this.queue];
    for (let i = 0; i < sortedQueue.size(); i++) {
      for (let j = i + 1; j < sortedQueue.size(); j++) {
        if (sortedQueue[j].queuedAt < sortedQueue[i].queuedAt) {
          [sortedQueue[i], sortedQueue[j]] = [sortedQueue[j], sortedQueue[i]];
        }
      }
    }

    for (const player of sortedQueue) {
      if (matchedPlayerIds.has(player.playerId)) continue;

      const waitTime = now - player.queuedAt;
      if (waitTime < this.config.minQueueTimeForMatch) continue;

      // Calculate acceptable rating range
      const expansion = waitTime * this.config.ratingRangeExpansionPerSecond;
      const ratingRange = math.min(
        this.config.initialRatingRange + expansion,
        this.config.maxRatingRange,
      );

      // Find best opponent
      let bestOpponent: MatchmakingPlayer | undefined;
      let bestRatingDiff = ratingRange;

      for (const other of sortedQueue) {
        if (other.playerId === player.playerId) continue;
        if (matchedPlayerIds.has(other.playerId)) continue;

        const ratingDiff = math.abs(player.rating - other.rating);
        if (ratingDiff <= ratingRange && ratingDiff < bestRatingDiff) {
          bestOpponent = other;
          bestRatingDiff = ratingDiff;
        }
      }

      if (bestOpponent) {
        const match: Match = {
          id: `match_${this.matchCounter++}`,
          player1: player,
          player2: bestOpponent,
          createdAt: now,
        };

        this.matches.set(match.id, match);
        newMatches.push(match);
        matchedPlayerIds.add(player.playerId);
        matchedPlayerIds.add(bestOpponent.playerId);
      }
    }

    // Remove matched players from queue
    for (const playerId of matchedPlayerIds) {
      this.dequeue(playerId);
    }

    return newMatches;
  }

  /**
   * Get an active match by ID
   */
  getMatch(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }

  /**
   * Complete a match and calculate new ratings
   */
  completeMatch(matchId: string, winnerId: number): MatchResult | undefined {
    const match = this.matches.get(matchId);
    if (!match) return undefined;

    const isPlayer1Winner = match.player1.playerId === winnerId;
    const winner = isPlayer1Winner ? match.player1 : match.player2;
    const loser = isPlayer1Winner ? match.player2 : match.player1;

    const { winnerNewRating, loserNewRating, ratingChange } =
      this.calculateEloChange(winner.rating, loser.rating);

    this.matches.delete(matchId);

    return {
      matchId,
      winnerId: winner.playerId,
      loserId: loser.playerId,
      winnerNewRating,
      loserNewRating,
      ratingChange,
    };
  }

  /**
   * Cancel a match without affecting ratings
   */
  cancelMatch(matchId: string): boolean {
    return this.matches.delete(matchId);
  }

  /**
   * Calculate ELO rating changes
   */
  private calculateEloChange(
    winnerRating: number,
    loserRating: number,
  ): {
    winnerNewRating: number;
    loserNewRating: number;
    ratingChange: number;
  } {
    const expectedWinner =
      1 / (1 + math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 - expectedWinner;

    const ratingChange = math.floor(this.config.kFactor * (1 - expectedWinner));
    const winnerNewRating = math.max(0, winnerRating + ratingChange);
    const loserNewRating = math.max(
      0,
      loserRating - math.floor(this.config.kFactor * expectedLoser),
    );

    return { winnerNewRating, loserNewRating, ratingChange };
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get starting rating for new players
 */
export function getStartingRating(
  config: MatchmakingConfig = DEFAULT_MATCHMAKING_CONFIG,
): number {
  return config.baseRating;
}

/**
 * Get rank tier based on rating
 */
export function getRankFromRating(rating: number): string {
  if (rating >= 2500) return 'Grandmaster';
  if (rating >= 2000) return 'Master';
  if (rating >= 1700) return 'Diamond';
  if (rating >= 1400) return 'Platinum';
  if (rating >= 1100) return 'Gold';
  if (rating >= 800) return 'Silver';
  if (rating >= 500) return 'Bronze';
  return 'Unranked';
}

/**
 * Get rank color based on tier
 */
export function getRankColor(rank: string): Color3 {
  switch (rank) {
    case 'Grandmaster':
      return Color3.fromRGB(255, 0, 0);
    case 'Master':
      return Color3.fromRGB(255, 100, 100);
    case 'Diamond':
      return Color3.fromRGB(100, 200, 255);
    case 'Platinum':
      return Color3.fromRGB(0, 255, 200);
    case 'Gold':
      return Color3.fromRGB(255, 215, 0);
    case 'Silver':
      return Color3.fromRGB(192, 192, 192);
    case 'Bronze':
      return Color3.fromRGB(205, 127, 50);
    default:
      return Color3.fromRGB(128, 128, 128);
  }
}
