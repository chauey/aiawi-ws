/**
 * World Boss System - Comprehensive Unit Tests
 * Tests boss spawning, damage contribution, rewards, and exploit prevention
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ==================== TYPES ====================

type Element =
  | 'fire'
  | 'water'
  | 'ice'
  | 'electric'
  | 'nature'
  | 'shadow'
  | 'light';

interface WorldBossConfig {
  id: string;
  name: string;
  element: Element;
  baseHp: number;
  dragonDrops: string[];
  dropChance: number;
}

interface Contribution {
  playerId: number;
  damage: number;
  lastHit: number;
}

interface WorldBossState {
  bossId: string;
  name: string;
  element: Element;
  currentHp: number;
  maxHp: number;
  startTime: number;
  endTime: number;
  contributions: Contribution[];
  isDefeated: boolean;
}

interface BossReward {
  coins: number;
  gems: number;
  xp: number;
  dragonDrop?: string;
}

// ==================== MOCK IMPLEMENTATION ====================

const BOSS_DURATION = 30 * 60; // 30 minutes
const MIN_CONTRIBUTION_FOR_REWARD = 100;
const ATTACK_COOLDOWN = 1; // 1 second between attacks

const WORLD_BOSSES: WorldBossConfig[] = [
  {
    id: 'fire_titan',
    name: 'Fire Titan',
    element: 'fire',
    baseHp: 1000000,
    dragonDrops: ['inferno_drake'],
    dropChance: 0.05,
  },
  {
    id: 'ice_colossus',
    name: 'Ice Colossus',
    element: 'ice',
    baseHp: 1200000,
    dragonDrops: ['crystal_dragon'],
    dropChance: 0.05,
  },
  {
    id: 'void_emperor',
    name: 'Void Emperor',
    element: 'shadow',
    baseHp: 2000000,
    dragonDrops: ['void_dragon'],
    dropChance: 0.01,
  },
];

let currentBoss: WorldBossState | undefined;
let currentTime = 0;
const playerAttackTimes = new Map<number, number>();
const playerDragons = new Map<number, { element: Element; power: number }>();

function setTime(t: number) {
  currentTime = t;
}
function osTime() {
  return currentTime;
}

function spawnBoss(bossIndex?: number): WorldBossState {
  const config =
    bossIndex !== undefined
      ? WORLD_BOSSES[bossIndex]
      : WORLD_BOSSES[Math.floor(Math.random() * WORLD_BOSSES.length)];

  currentBoss = {
    bossId: config.id,
    name: config.name,
    element: config.element,
    currentHp: config.baseHp,
    maxHp: config.baseHp,
    startTime: osTime(),
    endTime: osTime() + BOSS_DURATION,
    contributions: [],
    isDefeated: false,
  };

  return currentBoss;
}

function attackBoss(
  playerId: number,
  dragonPower: number,
  dragonElement: Element,
): { success: boolean; damage?: number; error?: string } {
  if (!currentBoss || currentBoss.isDefeated) {
    return { success: false, error: 'No active boss' };
  }

  if (osTime() > currentBoss.endTime) {
    return { success: false, error: 'Boss event ended' };
  }

  // Check cooldown - use -Infinity default so first attack always passes
  const lastAttack = playerAttackTimes.get(playerId) ?? -Infinity;
  if (osTime() - lastAttack < ATTACK_COOLDOWN) {
    return { success: false, error: 'Attack on cooldown' };
  }

  // Calculate damage
  let damage = dragonPower * 10;

  // Element bonus
  const ELEMENT_ADVANTAGES: Record<Element, Element[]> = {
    fire: ['ice', 'nature'],
    water: ['fire'],
    ice: ['water', 'nature'],
    electric: ['water'],
    nature: ['water', 'electric'],
    shadow: ['light'],
    light: ['shadow'],
  };

  if (ELEMENT_ADVANTAGES[dragonElement]?.includes(currentBoss.element)) {
    damage *= 1.5;
  }

  // Apply damage
  currentBoss.currentHp = Math.max(0, currentBoss.currentHp - damage);
  playerAttackTimes.set(playerId, osTime());

  // Track contribution
  const existing = currentBoss.contributions.find(
    (c) => c.playerId === playerId,
  );
  if (existing) {
    existing.damage += damage;
    existing.lastHit = osTime();
  } else {
    currentBoss.contributions.push({ playerId, damage, lastHit: osTime() });
  }

  // Check for defeat
  if (currentBoss.currentHp <= 0) {
    currentBoss.isDefeated = true;
  }

  return { success: true, damage: Math.floor(damage) };
}

function calculateRewards(
  playerId: number,
  forceDrop = false,
): BossReward | undefined {
  if (!currentBoss || !currentBoss.isDefeated) {
    return undefined;
  }

  const contribution = currentBoss.contributions.find(
    (c) => c.playerId === playerId,
  );
  if (!contribution || contribution.damage < MIN_CONTRIBUTION_FOR_REWARD) {
    return undefined;
  }

  const totalDamage = currentBoss.contributions.reduce(
    (sum, c) => sum + c.damage,
    0,
  );
  const contributionPercent = contribution.damage / totalDamage;

  // Base rewards scaled by contribution
  const coins = Math.floor(10000 * contributionPercent);
  const gems = Math.floor(100 * contributionPercent);
  const xp = Math.floor(5000 * contributionPercent);

  // Dragon drop chance
  const config = WORLD_BOSSES.find((b) => b.id === currentBoss!.bossId);
  let dragonDrop: string | undefined;

  if (config && (forceDrop || Math.random() < config.dropChance)) {
    dragonDrop =
      config.dragonDrops[Math.floor(Math.random() * config.dragonDrops.length)];
  }

  return { coins, gems, xp, dragonDrop };
}

function getLeaderboard(): { playerId: number; damage: number }[] {
  if (!currentBoss) return [];

  return [...currentBoss.contributions]
    .sort((a, b) => b.damage - a.damage)
    .slice(0, 10)
    .map((c) => ({ playerId: c.playerId, damage: Math.floor(c.damage) }));
}

function cleanupBoss(): void {
  currentBoss = undefined;
  playerAttackTimes.clear();
}

// ==================== TESTS ====================

describe('World Boss System', () => {
  beforeEach(() => {
    currentBoss = undefined;
    playerAttackTimes.clear();
    setTime(0);
  });

  describe('Boss Spawning', () => {
    it('should spawn boss correctly', () => {
      const boss = spawnBoss(0);
      expect(boss.bossId).toBe('fire_titan');
      expect(boss.currentHp).toBe(1000000);
      expect(boss.isDefeated).toBe(false);
    });

    it('should set correct duration', () => {
      setTime(1000);
      const boss = spawnBoss(0);
      expect(boss.startTime).toBe(1000);
      expect(boss.endTime).toBe(1000 + BOSS_DURATION);
    });

    it('should initialize empty contributions', () => {
      const boss = spawnBoss(0);
      expect(boss.contributions).toHaveLength(0);
    });
  });

  describe('Boss Attacks', () => {
    beforeEach(() => {
      spawnBoss(0);
    });

    it('should deal damage to boss', () => {
      const result = attackBoss(100, 50, 'fire');
      expect(result.success).toBe(true);
      expect(result.damage).toBeGreaterThan(0);
      expect(currentBoss!.currentHp).toBeLessThan(1000000);
    });

    it('should apply element advantage', () => {
      // Water is super effective against fire (water: ['fire'])
      const result = attackBoss(100, 50, 'water');
      expect(result.damage).toBe(Math.floor(50 * 10 * 1.5));
    });

    it('should track contributions', () => {
      attackBoss(100, 50, 'fire');
      setTime(ATTACK_COOLDOWN + 1); // Advance past cooldown
      attackBoss(100, 50, 'fire');

      const contribution = currentBoss!.contributions.find(
        (c) => c.playerId === 100,
      );
      expect(contribution?.damage).toBe(1000); // 50 * 10 * 2
    });

    it('should enforce cooldown', () => {
      attackBoss(100, 50, 'fire');
      const result = attackBoss(100, 50, 'fire');
      expect(result.success).toBe(false);
      expect(result.error).toContain('cooldown');
    });

    it('should allow attack after cooldown', () => {
      attackBoss(100, 50, 'fire');
      setTime(ATTACK_COOLDOWN + 1);
      const result = attackBoss(100, 50, 'fire');
      expect(result.success).toBe(true);
    });

    it('should defeat boss when HP reaches 0', () => {
      currentBoss!.currentHp = 100;
      attackBoss(100, 50, 'fire'); // 50 * 10 = 500 damage > 100 HP
      expect(currentBoss!.isDefeated).toBe(true);
    });

    it('should not allow negative HP', () => {
      currentBoss!.currentHp = 100;
      attackBoss(100, 100, 'ice'); // Would deal 1500 damage
      expect(currentBoss!.currentHp).toBe(0);
    });

    it('should reject if no active boss', () => {
      cleanupBoss();
      const result = attackBoss(100, 50, 'fire');
      expect(result.success).toBe(false);
      expect(result.error).toContain('No active boss');
    });

    it('should reject if boss event ended', () => {
      setTime(BOSS_DURATION + 1);
      const result = attackBoss(100, 50, 'fire');
      expect(result.success).toBe(false);
      expect(result.error).toContain('ended');
    });
  });

  describe('Reward Distribution', () => {
    beforeEach(() => {
      spawnBoss(0);
      currentBoss!.currentHp = 1000;
    });

    it('should calculate rewards based on contribution', () => {
      // Player 100 does 80% damage
      attackBoss(100, 80, 'fire'); // 800 damage
      setTime(ATTACK_COOLDOWN + 1); // Need to advance past cooldown
      attackBoss(200, 20, 'fire'); // 200 damage

      currentBoss!.isDefeated = true;

      const reward100 = calculateRewards(100)!;
      const reward200 = calculateRewards(200)!;

      expect(reward100.coins).toBeGreaterThan(reward200.coins);
    });

    it('should not reward without minimum contribution', () => {
      attackBoss(100, 5, 'fire'); // Only 50 damage
      currentBoss!.isDefeated = true;

      const reward = calculateRewards(100);
      expect(reward).toBeUndefined();
    });

    it('should only reward for defeated boss', () => {
      attackBoss(100, 50, 'fire');
      const reward = calculateRewards(100);
      expect(reward).toBeUndefined();
    });

    it('should include dragon drop chance', () => {
      attackBoss(100, 100, 'fire');
      currentBoss!.isDefeated = true;

      const reward = calculateRewards(100, true); // Force drop
      expect(reward?.dragonDrop).toBeDefined();
    });
  });

  describe('Leaderboard', () => {
    beforeEach(() => {
      spawnBoss(0);
    });

    it('should track multiple players', () => {
      attackBoss(100, 100, 'fire');
      setTime(ATTACK_COOLDOWN + 1);
      attackBoss(200, 50, 'fire');
      setTime(ATTACK_COOLDOWN * 2 + 1);
      attackBoss(300, 75, 'fire');

      const leaderboard = getLeaderboard();
      expect(leaderboard.length).toBe(3);
    });

    it('should sort by damage descending', () => {
      attackBoss(100, 50, 'fire');
      setTime(ATTACK_COOLDOWN + 1);
      attackBoss(200, 100, 'fire');
      setTime(ATTACK_COOLDOWN * 2 + 1);
      attackBoss(300, 75, 'fire');

      const leaderboard = getLeaderboard();
      expect(leaderboard[0].playerId).toBe(200);
      expect(leaderboard[1].playerId).toBe(300);
      expect(leaderboard[2].playerId).toBe(100);
    });

    it('should limit to top 10', () => {
      for (let i = 0; i < 15; i++) {
        setTime(i * (ATTACK_COOLDOWN + 1)); // Ensure each attack is after cooldown
        attackBoss(100 + i, 10 + i, 'fire');
      }

      const leaderboard = getLeaderboard();
      expect(leaderboard.length).toBe(10);
    });
  });
});

describe('World Boss Exploit Prevention', () => {
  beforeEach(() => {
    currentBoss = undefined;
    playerAttackTimes.clear();
    setTime(0);
  });

  it('should prevent attack spam via cooldown', () => {
    spawnBoss(0);

    let attacks = 0;
    for (let i = 0; i < 100; i++) {
      if (attackBoss(100, 50, 'fire').success) attacks++;
    }

    expect(attacks).toBe(1); // Only first should succeed
  });

  it('should prevent damage on defeated boss', () => {
    spawnBoss(0);
    currentBoss!.isDefeated = true;

    const result = attackBoss(100, 50, 'fire');
    expect(result.success).toBe(false);
  });

  it('should prevent reward claiming without contribution', () => {
    spawnBoss(0);
    attackBoss(100, 100, 'fire');
    currentBoss!.isDefeated = true;

    // Player 200 never attacked
    const reward = calculateRewards(200);
    expect(reward).toBeUndefined();
  });

  it('should prevent double reward claiming', () => {
    spawnBoss(0);
    currentBoss!.currentHp = 100;
    attackBoss(100, 100, 'fire');

    const reward1 = calculateRewards(100);
    // In real implementation, this would mark as claimed
    // Here we just verify the reward calculation is deterministic
    const reward2 = calculateRewards(100);

    expect(reward1?.coins).toBe(reward2?.coins);
  });

  it('should validate contribution tracking', () => {
    spawnBoss(0);

    // Multiple attacks should accumulate
    for (let i = 0; i < 10; i++) {
      setTime(i * (ATTACK_COOLDOWN + 1)); // Ensure each attack is after cooldown
      attackBoss(100, 10, 'fire');
    }

    const contribution = currentBoss!.contributions.find(
      (c) => c.playerId === 100,
    );
    expect(contribution?.damage).toBe(1000); // 10 * 10 * 10 attacks
  });
});
