// Roblox Core - Quest System
// Reusable daily/weekly quest generation and tracking

// ==================== TYPES ====================

export type QuestType = 'daily' | 'weekly' | 'event';

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  targetValue: number;
  rewards: QuestReward[];
  icon?: string;
  category?: string;
}

export interface QuestReward {
  type: 'coins' | 'gems' | 'xp' | 'item' | 'custom';
  amount: number;
  itemId?: string;
  customData?: unknown;
}

export interface PlayerQuest {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  expiresAt?: number;
  startedAt: number;
}

export interface QuestSystemConfig {
  dailyQuestCount: number;
  weeklyQuestCount: number;
  dailyRefreshHour: number; // UTC hour for daily reset
  weeklyRefreshDay: number; // 0 = Sunday, 6 = Saturday
}

// ==================== DEFAULT CONFIG ====================

export const DEFAULT_QUEST_CONFIG: QuestSystemConfig = {
  dailyQuestCount: 3,
  weeklyQuestCount: 3,
  dailyRefreshHour: 0, // Midnight UTC
  weeklyRefreshDay: 1, // Monday
};

// ==================== QUEST MANAGER ====================

export class QuestManager {
  private definitions: Map<string, QuestDefinition> = new Map();
  private dailyPool: string[] = [];
  private weeklyPool: string[] = [];
  private config: QuestSystemConfig;

  constructor(config: Partial<QuestSystemConfig> = {}) {
    this.config = { ...DEFAULT_QUEST_CONFIG, ...config };
  }

  /**
   * Register a quest definition
   */
  registerQuest(definition: QuestDefinition): void {
    this.definitions.set(definition.id, definition);

    if (definition.type === 'daily') {
      this.dailyPool.push(definition.id);
    } else if (definition.type === 'weekly') {
      this.weeklyPool.push(definition.id);
    }
  }

  /**
   * Get a quest definition by ID
   */
  getQuestDefinition(questId: string): QuestDefinition | undefined {
    return this.definitions.get(questId);
  }

  /**
   * Generate random daily quests for a player
   */
  generateDailyQuests(): PlayerQuest[] {
    const selected = this.selectRandom(
      this.dailyPool,
      this.config.dailyQuestCount,
    );
    const expiresAt = this.getNextDailyReset();
    const now = os.time();

    return selected.map((questId) => ({
      questId,
      progress: 0,
      completed: false,
      claimed: false,
      expiresAt,
      startedAt: now,
    }));
  }

  /**
   * Generate random weekly quests for a player
   */
  generateWeeklyQuests(): PlayerQuest[] {
    const selected = this.selectRandom(
      this.weeklyPool,
      this.config.weeklyQuestCount,
    );
    const expiresAt = this.getNextWeeklyReset();
    const now = os.time();

    return selected.map((questId) => ({
      questId,
      progress: 0,
      completed: false,
      claimed: false,
      expiresAt,
      startedAt: now,
    }));
  }

  /**
   * Update quest progress
   */
  updateProgress(
    quests: PlayerQuest[],
    questId: string,
    amount: number,
  ): PlayerQuest[] {
    return quests.map((quest) => {
      if (quest.questId !== questId || quest.completed) {
        return quest;
      }

      const definition = this.getQuestDefinition(questId);
      if (!definition) return quest;

      const newProgress = quest.progress + amount;
      const completed = newProgress >= definition.targetValue;

      return {
        ...quest,
        progress: math.min(newProgress, definition.targetValue),
        completed,
      };
    });
  }

  /**
   * Update progress for all quests matching criteria
   */
  updateProgressByCategory(
    quests: PlayerQuest[],
    category: string,
    amount: number,
  ): PlayerQuest[] {
    let updatedQuests = [...quests];

    for (const quest of quests) {
      const definition = this.getQuestDefinition(quest.questId);
      if (definition?.category === category && !quest.completed) {
        updatedQuests = this.updateProgress(
          updatedQuests,
          quest.questId,
          amount,
        );
      }
    }

    return updatedQuests;
  }

  /**
   * Claim rewards for a completed quest
   */
  claimQuest(
    quests: PlayerQuest[],
    questId: string,
  ): {
    updatedQuests: PlayerQuest[];
    rewards: QuestReward[] | undefined;
  } {
    const quest = quests.find((q) => q.questId === questId);
    if (!quest || !quest.completed || quest.claimed) {
      return { updatedQuests: quests, rewards: undefined };
    }

    const definition = this.getQuestDefinition(questId);
    if (!definition) {
      return { updatedQuests: quests, rewards: undefined };
    }

    const updatedQuests = quests.map((q) => {
      if (q.questId === questId) {
        return { ...q, claimed: true };
      }
      return q;
    });

    return { updatedQuests, rewards: definition.rewards };
  }

  /**
   * Check if quests need refresh
   */
  needsRefresh(quests: PlayerQuest[], questType: QuestType): boolean {
    const now = os.time();
    const typeQuests = quests.filter((q) => {
      const def = this.getQuestDefinition(q.questId);
      return def?.type === questType;
    });

    if (typeQuests.size() === 0) return true;

    return typeQuests.some(
      (q) => q.expiresAt !== undefined && q.expiresAt < now,
    );
  }

  /**
   * Get completed but unclaimed quests
   */
  getClaimableQuests(quests: PlayerQuest[]): PlayerQuest[] {
    return quests.filter((q) => q.completed && !q.claimed);
  }

  /**
   * Get total rewards value for display
   */
  getTotalRewards(quests: PlayerQuest[]): Map<string, number> {
    const totals = new Map<string, number>();

    for (const quest of quests) {
      const definition = this.getQuestDefinition(quest.questId);
      if (!definition) continue;

      for (const reward of definition.rewards) {
        const key =
          reward.type === 'item' ? (reward.itemId ?? 'item') : reward.type;
        const current = totals.get(key) ?? 0;
        totals.set(key, current + reward.amount);
      }
    }

    return totals;
  }

  // ==================== PRIVATE HELPERS ====================

  private selectRandom(pool: string[], count: number): string[] {
    if (pool.size() <= count) {
      return [...pool];
    }

    const selected: string[] = [];
    const available = [...pool];

    for (let i = 0; i < count && available.size() > 0; i++) {
      const index = math.floor(math.random() * available.size());
      selected.push(available[index]);
      available.remove(index);
    }

    return selected;
  }

  private getNextDailyReset(): number {
    const now = os.date('!*t') as {
      hour: number;
      min: number;
      sec: number;
      year: number;
      month: number;
      day: number;
    };
    let resetTime = os.time({
      year: now.year,
      month: now.month,
      day: now.day,
      hour: this.config.dailyRefreshHour,
      min: 0,
      sec: 0,
    });

    if (os.time() >= resetTime) {
      resetTime += 86400; // Add 24 hours
    }

    return resetTime;
  }

  private getNextWeeklyReset(): number {
    const now = os.date('!*t') as {
      wday: number;
      hour: number;
      min: number;
      sec: number;
      year: number;
      month: number;
      day: number;
    };
    const daysUntilReset =
      (this.config.weeklyRefreshDay - now.wday + 7) % 7 || 7;

    return (
      os.time() +
      daysUntilReset * 86400 -
      now.hour * 3600 -
      now.min * 60 -
      now.sec
    );
  }
}

// ==================== COMMON QUEST TEMPLATES ====================

export const QUEST_TEMPLATES = {
  collect: (
    id: string,
    name: string,
    itemName: string,
    targetValue: number,
    rewards: QuestReward[],
    questType: QuestType = 'daily',
  ): QuestDefinition => ({
    id,
    name,
    description: `Collect ${targetValue} ${itemName}`,
    type: questType,
    targetValue,
    rewards,
    category: 'collect',
  }),

  defeat: (
    id: string,
    name: string,
    enemyName: string,
    targetValue: number,
    rewards: QuestReward[],
    questType: QuestType = 'daily',
  ): QuestDefinition => ({
    id,
    name,
    description: `Defeat ${targetValue} ${enemyName}`,
    type: questType,
    targetValue,
    rewards,
    category: 'defeat',
  }),

  win: (
    id: string,
    name: string,
    gameMode: string,
    targetValue: number,
    rewards: QuestReward[],
    questType: QuestType = 'daily',
  ): QuestDefinition => ({
    id,
    name,
    description: `Win ${targetValue} ${gameMode} matches`,
    type: questType,
    targetValue,
    rewards,
    category: 'win',
  }),

  spend: (
    id: string,
    name: string,
    currency: string,
    targetValue: number,
    rewards: QuestReward[],
    questType: QuestType = 'daily',
  ): QuestDefinition => ({
    id,
    name,
    description: `Spend ${targetValue} ${currency}`,
    type: questType,
    targetValue,
    rewards,
    category: 'spend',
  }),

  level: (
    id: string,
    name: string,
    thingToLevel: string,
    targetValue: number,
    rewards: QuestReward[],
    questType: QuestType = 'weekly',
  ): QuestDefinition => ({
    id,
    name,
    description: `Level up ${targetValue} ${thingToLevel}`,
    type: questType,
    targetValue,
    rewards,
    category: 'level',
  }),
};
