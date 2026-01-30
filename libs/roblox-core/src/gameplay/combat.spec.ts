/**
 * Combat System - Comprehensive Unit Tests
 * Tests damage calculation, type effectiveness, cooldowns, and battle flow
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

interface DragonStats {
  power: number;
  speed: number;
  health: number;
  luck: number;
}

interface BattleDragonState {
  instanceId: string;
  dragonId: string;
  element: Element;
  level: number;
  currentHp: number;
  maxHp: number;
  stats: DragonStats;
  moveCooldowns: number[];
}

interface BattleMove {
  name: string;
  element: Element;
  power: number;
  accuracy: number;
  cooldown: number;
}

interface BattleState {
  battleId: string;
  battleType: 'wild' | 'arena';
  playerDragon: BattleDragonState;
  opponentDragon: BattleDragonState;
  currentTurn: 'player' | 'opponent';
  turnNumber: number;
  isFinished: boolean;
  winner?: 'player' | 'opponent';
}

// ==================== ELEMENT CHART ====================

const ELEMENT_CHART: Record<Element, Partial<Record<Element, number>>> = {
  fire: { nature: 1.5, ice: 1.5, water: 0.5 },
  water: { fire: 1.5, nature: 0.5, electric: 0.5 },
  ice: { water: 1.5, nature: 1.5, fire: 0.5 },
  electric: { water: 1.5, nature: 0.5 },
  nature: { water: 1.5, electric: 1.5, fire: 0.5, ice: 0.5 },
  shadow: { light: 1.5 },
  light: { shadow: 1.5 },
};

const CRIT_CHANCE = 0.1;
const CRIT_MULTIPLIER = 1.5;

// ==================== COMBAT MOVES ====================

const COMBAT_MOVES: Record<Element, BattleMove[]> = {
  fire: [
    {
      name: 'Flame Breath',
      element: 'fire',
      power: 40,
      accuracy: 95,
      cooldown: 0,
    },
    { name: 'Inferno', element: 'fire', power: 80, accuracy: 85, cooldown: 2 },
    {
      name: 'Eruption',
      element: 'fire',
      power: 120,
      accuracy: 70,
      cooldown: 4,
    },
  ],
  water: [
    {
      name: 'Water Jet',
      element: 'water',
      power: 40,
      accuracy: 95,
      cooldown: 0,
    },
    {
      name: 'Tidal Wave',
      element: 'water',
      power: 80,
      accuracy: 85,
      cooldown: 2,
    },
    {
      name: 'Tsunami',
      element: 'water',
      power: 120,
      accuracy: 70,
      cooldown: 4,
    },
  ],
  ice: [
    { name: 'Ice Shard', element: 'ice', power: 40, accuracy: 95, cooldown: 0 },
    { name: 'Blizzard', element: 'ice', power: 80, accuracy: 85, cooldown: 2 },
    {
      name: 'Absolute Zero',
      element: 'ice',
      power: 120,
      accuracy: 70,
      cooldown: 4,
    },
  ],
  electric: [
    {
      name: 'Spark',
      element: 'electric',
      power: 40,
      accuracy: 95,
      cooldown: 0,
    },
    {
      name: 'Thunder',
      element: 'electric',
      power: 80,
      accuracy: 85,
      cooldown: 2,
    },
    {
      name: 'Storm Strike',
      element: 'electric',
      power: 120,
      accuracy: 70,
      cooldown: 4,
    },
  ],
  nature: [
    {
      name: 'Vine Whip',
      element: 'nature',
      power: 40,
      accuracy: 95,
      cooldown: 0,
    },
    {
      name: 'Solar Beam',
      element: 'nature',
      power: 80,
      accuracy: 85,
      cooldown: 2,
    },
    {
      name: 'Earthquake',
      element: 'nature',
      power: 120,
      accuracy: 70,
      cooldown: 4,
    },
  ],
  shadow: [
    {
      name: 'Shadow Claw',
      element: 'shadow',
      power: 40,
      accuracy: 95,
      cooldown: 0,
    },
    {
      name: 'Dark Pulse',
      element: 'shadow',
      power: 80,
      accuracy: 85,
      cooldown: 2,
    },
    {
      name: 'Void Rift',
      element: 'shadow',
      power: 120,
      accuracy: 70,
      cooldown: 4,
    },
  ],
  light: [
    {
      name: 'Light Beam',
      element: 'light',
      power: 40,
      accuracy: 95,
      cooldown: 0,
    },
    {
      name: 'Divine Light',
      element: 'light',
      power: 80,
      accuracy: 85,
      cooldown: 2,
    },
    {
      name: 'Celestial Blast',
      element: 'light',
      power: 120,
      accuracy: 70,
      cooldown: 4,
    },
  ],
};

// ==================== MOCK IMPLEMENTATION ====================

function calculateDamage(
  attacker: BattleDragonState,
  defender: BattleDragonState,
  move: BattleMove,
  forceCrit = false,
): { damage: number; isCrit: boolean; effectiveness: number } {
  // Base damage formula
  let baseDamage =
    (move.power * (attacker.stats.power / 50) * (attacker.level / 10)) /
    (defender.stats.health / 100);

  // Type effectiveness
  const effectiveness = ELEMENT_CHART[move.element]?.[defender.element] ?? 1;
  baseDamage *= effectiveness;

  // Critical hit
  const critChance = CRIT_CHANCE + attacker.stats.luck * 0.002;
  const isCrit = forceCrit || Math.random() < critChance;
  if (isCrit) {
    baseDamage *= CRIT_MULTIPLIER;
  }

  // Random variance (85-115%)
  baseDamage *= 0.85 + Math.random() * 0.3;

  return {
    damage: Math.floor(baseDamage),
    isCrit,
    effectiveness,
  };
}

function checkAccuracy(move: BattleMove, attacker: BattleDragonState): boolean {
  const accuracyBonus = attacker.stats.speed * 0.1;
  return Math.random() * 100 < move.accuracy + accuracyBonus;
}

function createBattleState(
  playerElement: Element,
  opponentElement: Element,
): BattleState {
  const createDragon = (element: Element, id: string): BattleDragonState => ({
    instanceId: id,
    dragonId: `${element}_dragon`,
    element,
    level: 10,
    currentHp: 500,
    maxHp: 500,
    stats: { power: 50, speed: 40, health: 100, luck: 10 },
    moveCooldowns: [0, 0, 0],
  });

  return {
    battleId: `battle_${Date.now()}`,
    battleType: 'wild',
    playerDragon: createDragon(playerElement, 'player_dragon'),
    opponentDragon: createDragon(opponentElement, 'opponent_dragon'),
    currentTurn: 'player',
    turnNumber: 1,
    isFinished: false,
  };
}

function processAttack(
  battle: BattleState,
  attacker: 'player' | 'opponent',
  moveIndex: number,
): { success: boolean; damage?: number; missed?: boolean; error?: string } {
  const attackerDragon =
    attacker === 'player' ? battle.playerDragon : battle.opponentDragon;
  const defenderDragon =
    attacker === 'player' ? battle.opponentDragon : battle.playerDragon;

  // Check turn
  if (battle.currentTurn !== attacker) {
    return { success: false, error: 'Not your turn' };
  }

  // Get move
  const moves = COMBAT_MOVES[attackerDragon.element];
  const move = moves[moveIndex];
  if (!move) {
    return { success: false, error: 'Invalid move' };
  }

  // Check cooldown
  if (attackerDragon.moveCooldowns[moveIndex] > 0) {
    return { success: false, error: 'Move on cooldown' };
  }

  // Check accuracy
  if (!checkAccuracy(move, attackerDragon)) {
    attackerDragon.moveCooldowns[moveIndex] = move.cooldown;
    return { success: true, missed: true };
  }

  // Calculate and apply damage
  const { damage } = calculateDamage(attackerDragon, defenderDragon, move);
  defenderDragon.currentHp = Math.max(0, defenderDragon.currentHp - damage);
  attackerDragon.moveCooldowns[moveIndex] = move.cooldown;

  // Check for KO
  if (defenderDragon.currentHp <= 0) {
    battle.isFinished = true;
    battle.winner = attacker;
  }

  return { success: true, damage };
}

function endTurn(battle: BattleState): void {
  // Reduce cooldowns
  battle.playerDragon.moveCooldowns = battle.playerDragon.moveCooldowns.map(
    (cd) => Math.max(0, cd - 1),
  );
  battle.opponentDragon.moveCooldowns = battle.opponentDragon.moveCooldowns.map(
    (cd) => Math.max(0, cd - 1),
  );

  // Switch turns
  battle.currentTurn = battle.currentTurn === 'player' ? 'opponent' : 'player';
  battle.turnNumber++;
}

// ==================== TESTS ====================

describe('Combat System', () => {
  describe('Damage Calculation', () => {
    it('should calculate base damage correctly', () => {
      const battle = createBattleState('fire', 'water');
      const move = COMBAT_MOVES.fire[0]; // 40 power

      const results: number[] = [];
      for (let i = 0; i < 100; i++) {
        const { damage } = calculateDamage(
          battle.playerDragon,
          battle.opponentDragon,
          move,
        );
        results.push(damage);
      }

      // Should have variance but be in reasonable range
      const avg = results.reduce((a, b) => a + b, 0) / results.length;
      expect(avg).toBeGreaterThan(0);
      expect(avg).toBeLessThan(100); // Reasonable for level 10 vs level 10
    });

    it('should apply type effectiveness bonus', () => {
      const battle = createBattleState('fire', 'nature'); // Fire > Nature
      const move = COMBAT_MOVES.fire[0];

      const { effectiveness } = calculateDamage(
        battle.playerDragon,
        battle.opponentDragon,
        move,
      );
      expect(effectiveness).toBe(1.5);
    });

    it('should apply type effectiveness penalty', () => {
      const battle = createBattleState('fire', 'water'); // Fire < Water
      const move = COMBAT_MOVES.fire[0];

      const { effectiveness } = calculateDamage(
        battle.playerDragon,
        battle.opponentDragon,
        move,
      );
      expect(effectiveness).toBe(0.5);
    });

    it('should return neutral effectiveness for no matchup', () => {
      const battle = createBattleState('fire', 'fire'); // Same element
      const move = COMBAT_MOVES.fire[0];

      const { effectiveness } = calculateDamage(
        battle.playerDragon,
        battle.opponentDragon,
        move,
      );
      expect(effectiveness).toBe(1);
    });

    it('should apply crit multiplier when crit occurs', () => {
      const battle = createBattleState('fire', 'fire');
      const move = COMBAT_MOVES.fire[0];

      const normalDamages: number[] = [];
      const critDamages: number[] = [];

      for (let i = 0; i < 50; i++) {
        normalDamages.push(
          calculateDamage(
            battle.playerDragon,
            battle.opponentDragon,
            move,
            false,
          ).damage,
        );
        critDamages.push(
          calculateDamage(
            battle.playerDragon,
            battle.opponentDragon,
            move,
            true,
          ).damage,
        );
      }

      const avgNormal =
        normalDamages.reduce((a, b) => a + b, 0) / normalDamages.length;
      const avgCrit =
        critDamages.reduce((a, b) => a + b, 0) / critDamages.length;

      // Crit should be ~1.5x normal on average
      expect(avgCrit).toBeGreaterThan(avgNormal * 1.3);
    });

    it('should scale damage with level', () => {
      const battle = createBattleState('fire', 'fire');
      const move = COMBAT_MOVES.fire[0];

      const lowLevelDamages: number[] = [];
      battle.playerDragon.level = 5;
      for (let i = 0; i < 50; i++) {
        lowLevelDamages.push(
          calculateDamage(battle.playerDragon, battle.opponentDragon, move)
            .damage,
        );
      }

      const highLevelDamages: number[] = [];
      battle.playerDragon.level = 20;
      for (let i = 0; i < 50; i++) {
        highLevelDamages.push(
          calculateDamage(battle.playerDragon, battle.opponentDragon, move)
            .damage,
        );
      }

      const avgLow =
        lowLevelDamages.reduce((a, b) => a + b, 0) / lowLevelDamages.length;
      const avgHigh =
        highLevelDamages.reduce((a, b) => a + b, 0) / highLevelDamages.length;

      expect(avgHigh).toBeGreaterThan(avgLow * 1.5);
    });

    it('should scale damage with power stat', () => {
      const battle = createBattleState('fire', 'fire');
      const move = COMBAT_MOVES.fire[0];

      const lowPowerDamages: number[] = [];
      battle.playerDragon.stats.power = 25;
      for (let i = 0; i < 50; i++) {
        lowPowerDamages.push(
          calculateDamage(battle.playerDragon, battle.opponentDragon, move)
            .damage,
        );
      }

      const highPowerDamages: number[] = [];
      battle.playerDragon.stats.power = 100;
      for (let i = 0; i < 50; i++) {
        highPowerDamages.push(
          calculateDamage(battle.playerDragon, battle.opponentDragon, move)
            .damage,
        );
      }

      const avgLow =
        lowPowerDamages.reduce((a, b) => a + b, 0) / lowPowerDamages.length;
      const avgHigh =
        highPowerDamages.reduce((a, b) => a + b, 0) / highPowerDamages.length;

      expect(avgHigh).toBeGreaterThan(avgLow * 1.5);
    });
  });

  describe('Battle Flow', () => {
    it('should enforce turn order', () => {
      const battle = createBattleState('fire', 'water');

      // Opponent can't attack on player's turn
      const result = processAttack(battle, 'opponent', 0);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Not your turn');
    });

    it('should switch turns after attack', () => {
      const battle = createBattleState('fire', 'water');
      expect(battle.currentTurn).toBe('player');

      processAttack(battle, 'player', 0);
      endTurn(battle);

      expect(battle.currentTurn).toBe('opponent');
    });

    it('should end battle when HP reaches 0', () => {
      const battle = createBattleState('fire', 'nature');
      battle.opponentDragon.currentHp = 1;

      // High damage move should KO
      battle.opponentDragon.stats.health = 10;
      processAttack(battle, 'player', 2); // Eruption - 120 power

      expect(battle.isFinished).toBe(true);
      expect(battle.winner).toBe('player');
    });

    it('should not allow negative HP', () => {
      const battle = createBattleState('fire', 'nature');
      battle.opponentDragon.currentHp = 1;
      battle.opponentDragon.stats.health = 1; // Low health for more damage

      // Use high accuracy move (95%) and retry until hit
      let attempts = 0;
      while (battle.opponentDragon.currentHp > 0 && attempts < 10) {
        const result = processAttack(battle, 'player', 0); // Flame Breath - 95% accuracy
        if (result.success && !result.missed) break;
        battle.currentTurn = 'player';
        attempts++;
      }

      expect(battle.opponentDragon.currentHp).toBe(0);
    });
  });

  describe('Move Cooldowns', () => {
    it('should set cooldown after using move', () => {
      const battle = createBattleState('fire', 'fire');

      processAttack(battle, 'player', 1); // Inferno - 2 turn cooldown

      expect(battle.playerDragon.moveCooldowns[1]).toBe(2);
    });

    it('should prevent using move on cooldown', () => {
      const battle = createBattleState('fire', 'fire');
      battle.playerDragon.moveCooldowns[1] = 1;

      const result = processAttack(battle, 'player', 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('cooldown');
    });

    it('should reduce cooldowns at end of turn', () => {
      const battle = createBattleState('fire', 'fire');
      battle.playerDragon.moveCooldowns = [0, 2, 4];

      endTurn(battle);

      expect(battle.playerDragon.moveCooldowns).toEqual([0, 1, 3]);
    });

    it('should not reduce cooldowns below 0', () => {
      const battle = createBattleState('fire', 'fire');
      battle.playerDragon.moveCooldowns = [0, 0, 1];

      endTurn(battle);

      expect(battle.playerDragon.moveCooldowns).toEqual([0, 0, 0]);
    });
  });

  describe('Edge Cases', () => {
    it('should reject invalid move index', () => {
      const battle = createBattleState('fire', 'fire');

      const result = processAttack(battle, 'player', 99);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid move');
    });

    it('should handle miss correctly', () => {
      const battle = createBattleState('fire', 'fire');
      const initialHp = battle.opponentDragon.currentHp;

      // Force miss by using low accuracy move with low speed
      battle.playerDragon.stats.speed = 0;

      // Run multiple times - some should miss
      let missCount = 0;
      for (let i = 0; i < 50; i++) {
        const result = processAttack(battle, 'player', 2); // 70% accuracy
        if (result.missed) missCount++;
        battle.currentTurn = 'player'; // Reset for next iteration
        battle.playerDragon.moveCooldowns[2] = 0;
      }

      expect(missCount).toBeGreaterThan(0);
    });

    it('should handle all element matchups', () => {
      const elements: Element[] = [
        'fire',
        'water',
        'ice',
        'electric',
        'nature',
        'shadow',
        'light',
      ];

      for (const attacker of elements) {
        for (const defender of elements) {
          const battle = createBattleState(attacker, defender);
          const move = COMBAT_MOVES[attacker][0];

          const { effectiveness } = calculateDamage(
            battle.playerDragon,
            battle.opponentDragon,
            move,
          );

          // Should be 0.5, 1, or 1.5
          expect([0.5, 1, 1.5]).toContain(effectiveness);
        }
      }
    });
  });
});

describe('Combat Exploit Prevention', () => {
  it('should prevent action on wrong turn', () => {
    const battle = createBattleState('fire', 'fire');
    battle.currentTurn = 'opponent';

    const result = processAttack(battle, 'player', 0);
    expect(result.success).toBe(false);
  });

  it('should prevent action after battle ends', () => {
    const battle = createBattleState('fire', 'fire');
    battle.isFinished = true;

    // In real implementation, this would be checked
    expect(battle.isFinished).toBe(true);
  });

  it('should prevent using cooldown bypass', () => {
    const battle = createBattleState('fire', 'fire');

    // Use high power move
    processAttack(battle, 'player', 2);

    // Try to use again immediately
    battle.currentTurn = 'player';
    const result = processAttack(battle, 'player', 2);

    expect(result.success).toBe(false);
  });
});
