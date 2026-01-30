// Dragon Legends - Quest System (Server)
// Daily and weekly quests with progress tracking

import { Players, ReplicatedStorage } from '@rbxts/services';
import { Quest } from '../shared/types';
import {
  getPlayerData,
  updatePlayerData,
  addCoins,
  addGems,
} from './dataStore';
import { createPlayerDragon } from './dragons';

// Quest templates
const DAILY_QUEST_TEMPLATES: Omit<Quest, 'isCompleted' | 'expiresAt'>[] = [
  {
    questId: 'daily_battle_3',
    name: 'Combat Training',
    description: 'Win 3 battles',
    type: 'daily',
    requirements: [{ type: 'battles_won', target: 3, current: 0 }],
    rewards: { coins: 200 },
  },
  {
    questId: 'daily_hatch_1',
    name: 'Dragon Breeder',
    description: 'Hatch 1 dragon egg',
    type: 'daily',
    requirements: [{ type: 'eggs_hatched', target: 1, current: 0 }],
    rewards: { coins: 150 },
  },
  {
    questId: 'daily_boss_damage',
    name: 'Boss Hunter',
    description: 'Deal 10,000 damage to World Boss',
    type: 'daily',
    requirements: [{ type: 'boss_damage', target: 10000, current: 0 }],
    rewards: { coins: 300, gems: 5 },
  },
  {
    questId: 'daily_arena_1',
    name: 'Arena Challenger',
    description: 'Complete 1 arena battle',
    type: 'daily',
    requirements: [{ type: 'arena_battles', target: 1, current: 0 }],
    rewards: { coins: 250 },
  },
  {
    questId: 'daily_collect_coins',
    name: 'Treasure Hunter',
    description: 'Collect 1,000 coins',
    type: 'daily',
    requirements: [{ type: 'coins_collected', target: 1000, current: 0 }],
    rewards: { gems: 10 },
  },
];

const WEEKLY_QUEST_TEMPLATES: Omit<Quest, 'isCompleted' | 'expiresAt'>[] = [
  {
    questId: 'weekly_battle_20',
    name: 'Battle Master',
    description: 'Win 20 battles this week',
    type: 'weekly',
    requirements: [{ type: 'battles_won', target: 20, current: 0 }],
    rewards: { coins: 2000, gems: 20 },
  },
  {
    questId: 'weekly_evolve_1',
    name: 'Evolution Expert',
    description: 'Evolve 1 dragon',
    type: 'weekly',
    requirements: [{ type: 'dragons_evolved', target: 1, current: 0 }],
    rewards: { gems: 50 },
  },
  {
    questId: 'weekly_breed_3',
    name: 'Master Breeder',
    description: 'Breed 3 dragons',
    type: 'weekly',
    requirements: [{ type: 'dragons_bred', target: 3, current: 0 }],
    rewards: { coins: 1500, gems: 15 },
  },
  {
    questId: 'weekly_arena_10',
    name: 'Arena Champion',
    description: 'Win 10 arena matches',
    type: 'weekly',
    requirements: [{ type: 'arena_wins', target: 10, current: 0 }],
    rewards: { coins: 3000, gems: 30 },
  },
  {
    questId: 'weekly_login_7',
    name: 'Dedicated Trainer',
    description: 'Log in 7 days in a row',
    type: 'weekly',
    requirements: [{ type: 'login_streak', target: 7, current: 0 }],
    rewards: { dragonId: 'thunder_dragon_baby' },
  },
];

// Player quest storage
const playerQuests = new Map<number, Quest[]>();

// Get today's date key
function getDateKey(): string {
  const date = os.date('!*t') as { year: number; month: number; day: number };
  return `${date.year}-${date.month}-${date.day}`;
}

// Get week key
function getWeekKey(): string {
  const date = os.date('!*t') as { year: number; yday: number };
  return `${date.year}-${math.floor(date.yday / 7)}`;
}

// Generate quests for player
function generateQuests(player: Player): Quest[] {
  const quests: Quest[] = [];
  const now = os.time();

  // Pick 3 random daily quests
  const shuffledDaily = [...DAILY_QUEST_TEMPLATES];
  for (let i = shuffledDaily.size() - 1; i > 0; i--) {
    const j = math.floor(math.random() * (i + 1));
    [shuffledDaily[i], shuffledDaily[j]] = [shuffledDaily[j], shuffledDaily[i]];
  }

  for (let i = 0; i < 3 && i < shuffledDaily.size(); i++) {
    const template = shuffledDaily[i];
    quests.push({
      ...template,
      requirements: template.requirements.map((r) => ({ ...r })),
      isCompleted: false,
      expiresAt: now + 24 * 60 * 60, // 24 hours
    });
  }

  // Pick 2 random weekly quests
  const shuffledWeekly = [...WEEKLY_QUEST_TEMPLATES];
  for (let i = shuffledWeekly.size() - 1; i > 0; i--) {
    const j = math.floor(math.random() * (i + 1));
    [shuffledWeekly[i], shuffledWeekly[j]] = [
      shuffledWeekly[j],
      shuffledWeekly[i],
    ];
  }

  for (let i = 0; i < 2 && i < shuffledWeekly.size(); i++) {
    const template = shuffledWeekly[i];
    quests.push({
      ...template,
      requirements: template.requirements.map((r) => ({ ...r })),
      isCompleted: false,
      expiresAt: now + 7 * 24 * 60 * 60, // 7 days
    });
  }

  return quests;
}

// Get or generate player quests
export function getPlayerQuests(player: Player): Quest[] {
  const playerData = getPlayerData(player);
  if (!playerData) return [];

  let quests = playerQuests.get(player.UserId);

  // Check if quests need refresh
  const now = os.time();
  const needsRefresh =
    !quests ||
    quests.some((q) =>
      q.expiresAt !== undefined && q.expiresAt < now ? true : undefined,
    );

  if (needsRefresh || !quests) {
    // Filter out expired quests
    if (quests) {
      quests = quests.filter((q) => !q.expiresAt || q.expiresAt >= now);
    }

    // Generate new quests if needed
    if (!quests || quests.size() < 3) {
      quests = generateQuests(player);
      playerQuests.set(player.UserId, quests);
    }
  }

  return quests;
}

// Update quest progress
export function updateQuestProgress(
  player: Player,
  progressType: string,
  amount: number,
): void {
  const quests = getPlayerQuests(player);

  for (const quest of quests) {
    if (quest.isCompleted) continue;

    for (const req of quest.requirements) {
      if (req.type === progressType) {
        req.current = math.min(req.target, req.current + amount);
      }
    }

    // Check if quest is now complete
    const allComplete = quest.requirements.every((r) => r.current >= r.target);
    if (allComplete && !quest.isCompleted) {
      quest.isCompleted = true;
      print(`✅ ${player.Name} completed quest: ${quest.name}!`);
    }
  }
}

// Claim quest reward
export function claimQuestReward(
  player: Player,
  questId: string,
): { success: boolean; error?: string } {
  const quests = getPlayerQuests(player);
  const quest = quests.find((q) => q.questId === questId);

  if (!quest) {
    return { success: false, error: 'Quest not found' };
  }

  if (!quest.isCompleted) {
    return { success: false, error: 'Quest not completed' };
  }

  // Check if already claimed (quest would be removed)
  const playerData = getPlayerData(player);
  if (!playerData) {
    return { success: false, error: 'Player data not found' };
  }

  if (playerData.dailyQuestsCompleted.includes(questId)) {
    return { success: false, error: 'Already claimed' };
  }

  // Award rewards
  if (quest.rewards.coins) {
    addCoins(player, quest.rewards.coins);
  }
  if (quest.rewards.gems) {
    addGems(player, quest.rewards.gems);
  }
  if (quest.rewards.dragonId) {
    createPlayerDragon(player, quest.rewards.dragonId, false);
  }

  // Mark as claimed
  playerData.dailyQuestsCompleted.push(questId);
  updatePlayerData(player, playerData);

  // Remove from active quests
  const idx = quests.findIndex((q) => q.questId === questId);
  if (idx >= 0) {
    quests.remove(idx);
  }

  print(`🎁 ${player.Name} claimed reward for ${quest.name}`);

  return { success: true };
}

// Setup quest system
export function setupQuestSystem(): void {
  const remotes =
    (ReplicatedStorage.FindFirstChild('DragonRemotes') as Folder) ||
    new Instance('Folder');
  remotes.Name = 'DragonRemotes';
  remotes.Parent = ReplicatedStorage;

  const getQuestsRemote = new Instance('RemoteFunction');
  getQuestsRemote.Name = 'GetQuests';
  getQuestsRemote.Parent = remotes;

  const claimQuestRemote = new Instance('RemoteFunction');
  claimQuestRemote.Name = 'ClaimQuestReward';
  claimQuestRemote.Parent = remotes;

  getQuestsRemote.OnServerInvoke = (player) => {
    return getPlayerQuests(player);
  };

  claimQuestRemote.OnServerInvoke = (player, questId) => {
    if (!typeIs(questId, 'string')) {
      return { success: false, error: 'Invalid quest ID' };
    }
    return claimQuestReward(player, questId);
  };

  // Clean up on player leave
  Players.PlayerRemoving.Connect((player) => {
    playerQuests.delete(player.UserId);
  });

  print('📋 Quest System initialized!');
}
