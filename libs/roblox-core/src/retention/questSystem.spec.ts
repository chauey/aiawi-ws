/**
 * Quest System - Comprehensive Unit Tests
 * Tests quest generation, progress tracking, and reward claiming
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ==================== TYPES ====================

interface QuestReward {
  type: string;
  amount: number;
}
interface Quest {
  questId: string;
  templateId: string;
  type: 'daily' | 'weekly' | 'event';
  name: string;
  description: string;
  category: string;
  target: number;
  progress: number;
  rewards: QuestReward[];
  completed: boolean;
  claimed: boolean;
  expiresAt: number;
  generatedAt: number;
}

interface QuestTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  target: number;
  rewards: QuestReward[];
  type: 'daily' | 'weekly' | 'event';
}

// ==================== QUEST MANAGER ====================

class QuestManager {
  private templates: Map<string, QuestTemplate> = new Map();
  private dailyCount = 3;
  private weeklyCount = 3;
  private nowTime = 0;

  setNow(t: number) {
    this.nowTime = t;
  }
  private now() {
    return this.nowTime;
  }

  registerQuest(template: QuestTemplate) {
    this.templates.set(template.id, template);
  }

  generateQuests(type: 'daily' | 'weekly'): Quest[] {
    const templates = [...this.templates.values()].filter(
      (t) => t.type === type,
    );
    const count = type === 'daily' ? this.dailyCount : this.weeklyCount;
    const selected = this.shuffle(templates).slice(0, count);
    const duration = type === 'daily' ? 86400 : 604800;

    return selected.map((t) => ({
      questId: `${t.id}_${this.now()}`,
      templateId: t.id,
      type,
      name: t.name,
      description: t.description,
      category: t.category,
      target: t.target,
      progress: 0,
      rewards: [...t.rewards],
      completed: false,
      claimed: false,
      expiresAt: this.now() + duration,
      generatedAt: this.now(),
    }));
  }

  updateProgress(quests: Quest[], questId: string, amount: number): Quest[] {
    return quests.map((q) => {
      if (q.questId !== questId || q.claimed) return q;
      const newProgress = Math.min(q.progress + amount, q.target);
      return {
        ...q,
        progress: newProgress,
        completed: newProgress >= q.target,
      };
    });
  }

  updateProgressByCategory(
    quests: Quest[],
    category: string,
    amount: number,
  ): Quest[] {
    return quests.map((q) => {
      if (q.category !== category || q.claimed) return q;
      const newProgress = Math.min(q.progress + amount, q.target);
      return {
        ...q,
        progress: newProgress,
        completed: newProgress >= q.target,
      };
    });
  }

  claimQuest(
    quests: Quest[],
    questId: string,
  ): { updatedQuests: Quest[]; rewards?: QuestReward[] } {
    const quest = quests.find((q) => q.questId === questId);
    if (!quest || !quest.completed || quest.claimed) {
      return { updatedQuests: quests };
    }
    const updatedQuests = quests.map((q) =>
      q.questId === questId ? { ...q, claimed: true } : q,
    );
    return { updatedQuests, rewards: quest.rewards };
  }

  getClaimable(quests: Quest[]): Quest[] {
    return quests.filter((q) => q.completed && !q.claimed);
  }

  getExpired(quests: Quest[]): Quest[] {
    return quests.filter((q) => q.expiresAt <= this.now() && !q.claimed);
  }

  needsRefresh(quests: Quest[], type: 'daily' | 'weekly'): boolean {
    const typeQuests = quests.filter((q) => q.type === type);
    if (typeQuests.length === 0) return true;
    return typeQuests.some((q) => q.expiresAt <= this.now());
  }

  private shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

// ==================== TEST TEMPLATES ====================

const templates: QuestTemplate[] = [
  {
    id: 'defeat_10',
    name: 'Defeat 10 Enemies',
    description: 'Defeat 10 enemies',
    category: 'defeat',
    target: 10,
    rewards: [{ type: 'coins', amount: 100 }],
    type: 'daily',
  },
  {
    id: 'defeat_50',
    name: 'Defeat 50 Enemies',
    description: 'Defeat 50 enemies',
    category: 'defeat',
    target: 50,
    rewards: [{ type: 'coins', amount: 500 }],
    type: 'weekly',
  },
  {
    id: 'collect_5',
    name: 'Collect 5 Items',
    description: 'Collect 5 items',
    category: 'collect',
    target: 5,
    rewards: [{ type: 'gems', amount: 10 }],
    type: 'daily',
  },
  {
    id: 'collect_20',
    name: 'Collect 20 Items',
    description: 'Collect 20 items',
    category: 'collect',
    target: 20,
    rewards: [{ type: 'gems', amount: 50 }],
    type: 'weekly',
  },
  {
    id: 'win_3',
    name: 'Win 3 Battles',
    description: 'Win 3 battles',
    category: 'win',
    target: 3,
    rewards: [{ type: 'xp', amount: 200 }],
    type: 'daily',
  },
  {
    id: 'win_10',
    name: 'Win 10 Battles',
    description: 'Win 10 battles',
    category: 'win',
    target: 10,
    rewards: [{ type: 'xp', amount: 1000 }],
    type: 'weekly',
  },
  {
    id: 'spend_1000',
    name: 'Spend 1000 Coins',
    description: 'Spend 1000 coins',
    category: 'spend',
    target: 1000,
    rewards: [{ type: 'coins', amount: 200 }],
    type: 'daily',
  },
];

// ==================== TESTS ====================

describe('Quest System', () => {
  let manager: QuestManager;

  beforeEach(() => {
    manager = new QuestManager();
    manager.setNow(0);
    templates.forEach((t) => manager.registerQuest(t));
  });

  describe('Quest Generation', () => {
    it('should generate daily quests', () => {
      const quests = manager.generateQuests('daily');
      expect(quests).toHaveLength(3);
      quests.forEach((q) => expect(q.type).toBe('daily'));
    });

    it('should generate weekly quests', () => {
      const quests = manager.generateQuests('weekly');
      expect(quests).toHaveLength(3);
      quests.forEach((q) => expect(q.type).toBe('weekly'));
    });

    it('should set correct expiry times', () => {
      const daily = manager.generateQuests('daily');
      const weekly = manager.generateQuests('weekly');
      expect(daily[0].expiresAt).toBe(86400);
      expect(weekly[0].expiresAt).toBe(604800);
    });

    it('should initialize progress to 0', () => {
      const quests = manager.generateQuests('daily');
      quests.forEach((q) => {
        expect(q.progress).toBe(0);
        expect(q.completed).toBe(false);
        expect(q.claimed).toBe(false);
      });
    });

    it('should generate unique quest IDs', () => {
      const q1 = manager.generateQuests('daily');
      manager.setNow(1);
      const q2 = manager.generateQuests('daily');
      const ids1 = q1.map((q) => q.questId);
      const ids2 = q2.map((q) => q.questId);
      expect(new Set([...ids1, ...ids2]).size).toBe(ids1.length + ids2.length);
    });
  });

  describe('Progress Tracking', () => {
    it('should update progress by ID', () => {
      let quests = manager.generateQuests('daily');
      const id = quests[0].questId;
      quests = manager.updateProgress(quests, id, 5);
      expect(quests.find((q) => q.questId === id)!.progress).toBe(5);
    });

    it('should mark complete at target', () => {
      let quests = manager.generateQuests('daily');
      const q = quests[0];
      quests = manager.updateProgress(quests, q.questId, q.target);
      expect(quests.find((qst) => qst.questId === q.questId)!.completed).toBe(
        true,
      );
    });

    it('should cap progress at target', () => {
      let quests = manager.generateQuests('daily');
      const q = quests[0];
      quests = manager.updateProgress(quests, q.questId, q.target + 100);
      expect(quests.find((qst) => qst.questId === q.questId)!.progress).toBe(
        q.target,
      );
    });

    it('should update by category', () => {
      let quests = manager.generateQuests('daily');
      const defeatQuests = quests.filter((q) => q.category === 'defeat');
      quests = manager.updateProgressByCategory(quests, 'defeat', 3);
      defeatQuests.forEach((dq) => {
        const updated = quests.find((q) => q.questId === dq.questId);
        if (updated) expect(updated.progress).toBe(3);
      });
    });

    it('should not update claimed quests', () => {
      let quests = manager.generateQuests('daily');
      const q = quests[0];
      quests = manager.updateProgress(quests, q.questId, q.target);
      const { updatedQuests } = manager.claimQuest(quests, q.questId);
      const afterUpdate = manager.updateProgress(updatedQuests, q.questId, 5);
      expect(
        afterUpdate.find((qst) => qst.questId === q.questId)!.progress,
      ).toBe(q.target);
    });

    it('should handle 0 amount', () => {
      let quests = manager.generateQuests('daily');
      const id = quests[0].questId;
      quests = manager.updateProgress(quests, id, 0);
      expect(quests.find((q) => q.questId === id)!.progress).toBe(0);
    });

    it('should handle non-existent quest ID', () => {
      let quests = manager.generateQuests('daily');
      const originalProgress = quests.map((q) => q.progress);
      quests = manager.updateProgress(quests, 'fake_id', 100);
      expect(quests.map((q) => q.progress)).toEqual(originalProgress);
    });
  });

  describe('Reward Claiming', () => {
    it('should claim completed quest', () => {
      let quests = manager.generateQuests('daily');
      const q = quests[0];
      quests = manager.updateProgress(quests, q.questId, q.target);
      const { updatedQuests, rewards } = manager.claimQuest(quests, q.questId);
      expect(rewards).toBeDefined();
      expect(
        updatedQuests.find((qst) => qst.questId === q.questId)!.claimed,
      ).toBe(true);
    });

    it('should return correct rewards', () => {
      let quests = manager.generateQuests('daily');
      const q = quests[0];
      quests = manager.updateProgress(quests, q.questId, q.target);
      const { rewards } = manager.claimQuest(quests, q.questId);
      expect(rewards).toEqual(q.rewards);
    });

    it('should not claim incomplete quest', () => {
      let quests = manager.generateQuests('daily');
      const { rewards } = manager.claimQuest(quests, quests[0].questId);
      expect(rewards).toBeUndefined();
    });

    it('should not claim already claimed', () => {
      let quests = manager.generateQuests('daily');
      const q = quests[0];
      quests = manager.updateProgress(quests, q.questId, q.target);
      const { updatedQuests } = manager.claimQuest(quests, q.questId);
      const { rewards } = manager.claimQuest(updatedQuests, q.questId);
      expect(rewards).toBeUndefined();
    });

    it('should return claimable quests', () => {
      let quests = manager.generateQuests('daily');
      quests = manager.updateProgress(
        quests,
        quests[0].questId,
        quests[0].target,
      );
      expect(manager.getClaimable(quests)).toHaveLength(1);
    });
  });

  describe('Expiration', () => {
    it('should detect expired quests', () => {
      const quests = manager.generateQuests('daily');
      manager.setNow(86400);
      expect(manager.getExpired(quests).length).toBeGreaterThan(0);
    });

    it('should needsRefresh when expired', () => {
      const quests = manager.generateQuests('daily');
      manager.setNow(86400);
      expect(manager.needsRefresh(quests, 'daily')).toBe(true);
    });

    it('should needsRefresh when empty', () => {
      expect(manager.needsRefresh([], 'daily')).toBe(true);
    });

    it('should not needsRefresh when fresh', () => {
      const quests = manager.generateQuests('daily');
      expect(manager.needsRefresh(quests, 'daily')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle no templates', () => {
      const empty = new QuestManager();
      expect(empty.generateQuests('daily')).toHaveLength(0);
    });

    it('should handle fewer templates than count', () => {
      const m = new QuestManager();
      m.registerQuest(templates[0]);
      expect(m.generateQuests('daily')).toHaveLength(1);
    });

    it('should handle negative progress amount', () => {
      let quests = manager.generateQuests('daily');
      const questId = quests[0].questId;
      quests = manager.updateProgress(quests, questId, 5);
      quests = manager.updateProgress(quests, questId, -3);
      const quest = quests.find((q) => q.questId === questId);
      expect(quest?.progress).toBe(2);
    });
  });
});
