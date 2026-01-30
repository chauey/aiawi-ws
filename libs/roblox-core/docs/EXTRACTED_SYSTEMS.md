# Roblox Core Extracted Systems

This document describes the reusable game systems extracted from Dragon Legends to `libs/roblox-core`.

## Overview

Three proven systems have been extracted and made reusable:

| System          | File                          | Purpose                                    |
| --------------- | ----------------------------- | ------------------------------------------ |
| Gacha System    | `monetization/gachaSystem.ts` | Weighted random item selection with pity   |
| ELO Matchmaking | `social/matchmaking.ts`       | Queue-based PvP matchmaking with ratings   |
| Quest System    | `retention/questSystem.ts`    | Daily/weekly quest generation and tracking |

---

## 1. Gacha System

**Location:** `libs/roblox-core/src/monetization/gachaSystem.ts`

A complete weighted random selection system for egg hatching, loot boxes, and item drops.

### Features

- Weighted random selection based on rarity tiers
- **Pity system**: Guaranteed rare+ after N pulls
- Drop rate calculation for UI display
- Configurable rarity tiers with colors
- Per-player pity state tracking

### Usage Example

```typescript
import { createPool, pullFromPool, getPoolDropRates, DEFAULT_RARITIES } from '@aiawi/roblox-core';

// Define dragons for the pool
const dragons = [
  { id: 'fire_drake', data: { name: 'Fire Drake', element: 'Fire' }, rarity: 'Common' },
  { id: 'inferno_wyrm', data: { name: 'Inferno Wyrm', element: 'Fire' }, rarity: 'Rare' },
  { id: 'phoenix', data: { name: 'Phoenix', element: 'Fire' }, rarity: 'Legendary' },
];

// Create a pool with pity enabled
const fireEggPool = createPool('fire_egg', dragons, {
  pityEnabled: true,
  pityThreshold: 100, // Guaranteed Epic+ after 100 pulls
  pityRarityMinimum: 'Epic',
});

// Perform a pull
const result = pullFromPool(fireEggPool, player.UserId);
print(`Got: ${result.item.data.name} (${result.item.rarity})`);
if (result.isPity) print('This was a pity pull!');

// Display drop rates to player
const rates = getPoolDropRates(fireEggPool);
rates.forEach((percent, rarity) => {
  print(`${rarity}: ${percent}%`);
});
```

### Types

```typescript
interface GachaItem<T> {
  id: string;
  data: T;
  rarity: string;
  weight?: number; // Override rarity weight
}

interface GachaPool<T> {
  name: string;
  items: GachaItem<T>[];
  rarities: RarityTier[];
  pityEnabled?: boolean;
  pityThreshold?: number;
  pityRarityMinimum?: string;
}

interface GachaResult<T> {
  item: GachaItem<T>;
  isPity: boolean;
  pullNumber: number;
}
```

---

## 2. ELO Matchmaking System

**Location:** `libs/roblox-core/src/social/matchmaking.ts`

A complete matchmaking system with ELO rating calculations and dynamic queue matching.

### Features

- **ELO Rating System**: Standard 1000 base, K-factor 32
- **Dynamic Queue**: Rating range expands over wait time
- **Rank Tiers**: Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster
- **Match Management**: Create, complete, and cancel matches
- **Rating Protection**: Floor at 0, no negative ratings

### Usage Example

```typescript
import { MatchmakingQueue, getStartingRating, getRankFromRating } from '@aiawi/roblox-core';

// Create a matchmaking queue
const arenaQueue = new MatchmakingQueue({
  kFactor: 32,
  initialRatingRange: 100,
  ratingRangeExpansionPerSecond: 10,
  maxRatingRange: 500,
});

// Add players to queue
arenaQueue.enqueue(player1.UserId, 1200);
arenaQueue.enqueue(player2.UserId, 1150);

// Process queue (call periodically)
const matches = arenaQueue.processQueue();
for (const match of matches) {
  print(`Match created: ${match.player1.playerId} vs ${match.player2.playerId}`);
  startArenaMatch(match);
}

// Complete a match
const result = arenaQueue.completeMatch(matchId, winnerId);
if (result) {
  print(`Winner new rating: ${result.winnerNewRating} (+${result.ratingChange})`);
  print(`Loser new rating: ${result.loserNewRating}`);

  // Update player displays
  print(`Winner rank: ${getRankFromRating(result.winnerNewRating)}`);
}
```

### Configuration

```typescript
interface MatchmakingConfig {
  baseRating: number; // Starting rating (default: 1000)
  kFactor: number; // ELO sensitivity (default: 32)
  initialRatingRange: number; // Starting match range (default: 100)
  ratingRangeExpansionPerSecond: number; // Range growth (default: 10)
  maxRatingRange: number; // Maximum range (default: 500)
  minQueueTimeForMatch: number; // Seconds before eligible (default: 3)
}
```

---

## 3. Quest System

**Location:** `libs/roblox-core/src/retention/questSystem.ts`

A complete daily/weekly quest system with automatic generation, progress tracking, and reward claiming.

### Features

- **Daily & Weekly Quests**: Separate pools with different reset times
- **Automatic Refresh**: Quests expire and regenerate automatically
- **Progress Tracking**: Track incremental progress by category
- **Reward System**: Multiple reward types (coins, gems, XP, items)
- **Quest Templates**: Pre-built templates for common quest types

### Usage Example

```typescript
import { QuestManager, QUEST_TEMPLATES } from '@aiawi/roblox-core';

// Create quest manager
const questManager = new QuestManager({
  dailyQuestCount: 3,
  weeklyQuestCount: 3,
  dailyRefreshHour: 0, // Midnight UTC
});

// Register quest definitions
questManager.registerQuest(
  QUEST_TEMPLATES.defeat(
    'defeat_fire_dragons',
    'Dragon Slayer',
    'Fire Dragons',
    10,
    [
      { type: 'coins', amount: 500 },
      { type: 'xp', amount: 100 },
    ],
    'daily',
  ),
);

questManager.registerQuest(QUEST_TEMPLATES.win('arena_wins', 'Arena Champion', 'Arena', 5, [{ type: 'gems', amount: 50 }], 'weekly'));

// Generate quests for a player
let playerQuests = questManager.generateDailyQuests();
playerQuests = [...playerQuests, ...questManager.generateWeeklyQuests()];

// Update progress when player defeats a dragon
playerQuests = questManager.updateProgressByCategory(playerQuests, 'defeat', 1);

// Check for claimable rewards
const claimable = questManager.getClaimableQuests(playerQuests);
for (const quest of claimable) {
  const { updatedQuests, rewards } = questManager.claimQuest(playerQuests, quest.questId);
  playerQuests = updatedQuests;
  if (rewards) {
    for (const reward of rewards) {
      grantReward(player, reward);
    }
  }
}

// Check if refresh needed
if (questManager.needsRefresh(playerQuests, 'daily')) {
  playerQuests = questManager.generateDailyQuests();
}
```

### Quest Templates

```typescript
QUEST_TEMPLATES.collect(id, name, itemName, target, rewards, type);
QUEST_TEMPLATES.defeat(id, name, enemyName, target, rewards, type);
QUEST_TEMPLATES.win(id, name, gameMode, target, rewards, type);
QUEST_TEMPLATES.spend(id, name, currency, target, rewards, type);
QUEST_TEMPLATES.level(id, name, thingToLevel, target, rewards, type);
```

---

## Integration Notes

### For roblox-ts Projects

These files use roblox-ts specific globals (`math`, `os`, `Color3`, `.size()`). They are designed to be used in roblox-ts projects via:

```typescript
import { createPool, MatchmakingQueue, QuestManager } from 'libs/roblox-core/src';
```

### TypeScript Errors in IDE

When viewing these files in a standard TypeScript IDE (not configured for roblox-ts), you may see errors about undefined globals. These are expected and will work correctly when compiled with `rbxtsc`.

### Future Extractions

The following systems are candidates for extraction in future updates:

- **Turn-Based Combat** → `combat/turnBasedCombat.ts`
- **Raid Boss** → `social/raidBoss.ts`
- **Enhanced Daily Rewards** → `retention/dailyRewards.ts`
