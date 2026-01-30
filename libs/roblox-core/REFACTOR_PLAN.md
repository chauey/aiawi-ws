# Roblox Core Library - Refactoring Plan

## Executive Summary

Both games (`dragon-legends` and `roblox-game`) have **duplicated implementations** of core systems that should be shared via `@aiawi/roblox-core`. This document outlines which systems are game-specific vs. reusable and provides a migration plan.

---

## Current State Analysis

### Apps Overview

| Game               | Focus                        | Server Files | Game-Specific Features                           |
| ------------------ | ---------------------------- | ------------ | ------------------------------------------------ |
| **dragon-legends** | Dragon collection/battles    | 15 files     | Combat, breeding, world boss, regions, arena     |
| **roblox-game**    | Pet simulator/coin collector | 27 files     | Pets, pet battles, fusion, evolution, obby, maps |

### System Comparison

| System                | dragon-legends                | roblox-game                   | roblox-core              | Verdict                                       |
| --------------------- | ----------------------------- | ----------------------------- | ------------------------ | --------------------------------------------- |
| **Trading**           | `trading.ts` (381 lines)      | `trading.ts` (261 lines)      | `trading.ts` (152 lines) | ⚠️ Core needs enhancement, both should use it |
| **Clans**             | `clans.ts` (437 lines)        | `clans.ts` (224 lines)        | ❌ Missing               | 🔧 Extract and consolidate into core          |
| **Quests**            | `quests.ts` (304 lines)       | `quests.ts` (151 lines)       | `questSystem.ts` ✅      | ✅ Both should import from core               |
| **Egg Hatching**      | `eggHatching.ts` (130 lines)  | `eggHatching.ts` (149 lines)  | `gachaSystem.ts` ✅      | ✅ Both should import from core               |
| **Anti-Cheat**        | `antiCheat.ts` (208 lines)    | ❌ None                       | `antiCheat.ts` ✅        | ✅ roblox-game should import                  |
| **Daily Rewards**     | `dailyRewards.ts` (121 lines) | `dailyRewards.ts` (170 lines) | ❌ Missing               | 🔧 Extract and consolidate into core          |
| **Data Store**        | `dataStore.ts` (193 lines)    | `dataStore.ts` (192 lines)    | `dataStoreHelpers.ts` ✅ | ⚠️ Partial - enhance core helpers             |
| **Combat**            | `combat.ts` (467 lines)       | `petBattles.ts` (171 lines)   | ❌ Missing               | 🔧 Extract battle system base to core         |
| **Arena/Matchmaking** | `arena.ts` (403 lines)        | ❌ None                       | `matchmaking.ts` ✅      | ✅ dragon-legends should import               |
| **World Boss**        | `worldBoss.ts` (354 lines)    | ❌ None                       | ❌ Missing               | 🎮 Game-specific (keep in dragon-legends)     |
| **Breeding**          | `breeding.ts` (308 lines)     | ❌ None                       | ❌ Missing               | 🎮 Game-specific (keep in dragon-legends)     |
| **Regions**           | `regions.ts` (433 lines)      | `maps.ts` (829 lines)         | ❌ Missing               | 🔧 Extract map system base to core            |
| **Pets**              | ❌ None                       | `pets.ts` (1276 lines)        | ❌ Missing               | 🎮 Game-specific (keep in roblox-game)        |
| **Pet Evolution**     | ❌ None                       | `petEvolution.ts` (125 lines) | ❌ Missing               | 🎮 Game-specific (keep in roblox-game)        |
| **Pet Fusion**        | ❌ None                       | `petFusion.ts` (123 lines)    | ❌ Missing               | 🎮 Game-specific (keep in roblox-game)        |

---

## Classification Summary

### ✅ Already in Core (should be imported by both games)

1. `questSystem.ts` - Daily/weekly quests with progress tracking
2. `gachaSystem.ts` - Egg/lootbox system with rarity tiers
3. `antiCheat.ts` - Rate limiting, value validation, movement checks
4. `matchmaking.ts` - ELO-based arena matchmaking
5. `trading.ts` - Trade offers, fairness checks, price history

### 🔧 Should Be Extracted to Core

1. **Clans System** - Both games have similar implementations
   - Create, join, leave, contribute
   - Leaderboards, bonuses
   - Member management

2. **Daily Rewards System** - Both games have similar implementations
   - Streak tracking
   - Escalating rewards
   - Reset logic

3. **Battle System Base** - Extract common turn-based combat logic
   - Turn management
   - Damage calculation framework
   - Cooldown system

4. **Map/Region System Base** - Extract common area management
   - Teleportation
   - Region unlocking
   - Spawn management

### 🎮 Game-Specific (Keep in Apps)

**dragon-legends:**

- `breeding.ts` - Dragon breeding specific
- `worldBoss.ts` - Raid boss events
- `dragons.ts` - Dragon definitions
- `regions.ts` - Dragon world regions

**roblox-game:**

- `pets.ts` - Pet simulator specific
- `petEvolution.ts` - Pet evolution chains
- `petFusion.ts` - Pet combining
- `maps.ts` - Coin collector maps
- `obby.ts` - Obstacle courses
- `rollerCoaster.ts` - Unique minigame
- `coinStealing.ts` - Unique mechanic

---

## Migration Steps

### Phase 1: Type Alignment

1. Create shared types in `@aiawi/roblox-core`:
   - `ClanData`, `ClanMember`, `ClanRole`
   - `DailyRewardTier`, `DailyRewardState`
   - `BattleState`, `BattleDragon`, `BattleMove`
   - `MapRegion`, `RegionUnlock`

### Phase 2: Core Enhancements

#### 2.1 Add Clan System to Core

```typescript
// libs/roblox-core/src/social/clans.ts
export interface ClanConfig {
  createCost: number;
  maxMembers: number;
  bonusPercent: number;
  minNameLength: number;
  maxNameLength: number;
  minTagLength: number;
  maxTagLength: number;
}

export interface ClanData {
  id: string;
  name: string;
  tag: string;
  ownerId: number;
  members: ClanMember[];
  totalContributed: number;
  warScore: number;
  createdAt: number;
}

// Core logic (game-agnostic)
export function createClanLogic(config: ClanConfig, ...): ClanResult;
export function joinClanLogic(...): JoinResult;
export function contributeToClanLogic(...): ContributeResult;
```

#### 2.2 Add Daily Rewards to Core

```typescript
// libs/roblox-core/src/retention/dailyRewards.ts
export interface DailyRewardConfig {
  rewards: DailyRewardTier[];
  resetHour: number; // UTC hour for reset
  streakBonusMultiplier: number;
}

export function calculateDailyReward(streak: number, config: DailyRewardConfig): DailyReward;

export function shouldResetStreak(lastClaimTime: number, currentTime: number, config: DailyRewardConfig): boolean;
```

#### 2.3 Add Battle System Base to Core

```typescript
// libs/roblox-core/src/gameplay/battleSystem.ts
export interface BattleConfig {
  baseDamageMultiplier: number;
  critChance: number;
  critMultiplier: number;
  typeChart: Record<string, Record<string, number>>;
}

export function calculateDamage(attacker: BattleUnit, defender: BattleUnit, move: BattleMove, config: BattleConfig): DamageResult;
```

### Phase 3: Game Refactoring

#### 3.1 dragon-legends Changes

```typescript
// BEFORE (dragon-legends/src/server/clans.ts)
function createClan(...): Result { /* 100+ lines of logic */ }

// AFTER
import {
  createClanLogic,
  ClanConfig,
  DEFAULT_CLAN_CONFIG
} from '@aiawi/roblox-core';

const DRAGON_LEGENDS_CLAN_CONFIG: ClanConfig = {
  ...DEFAULT_CLAN_CONFIG,
  createCost: 5000, // Game-specific cost
  bonusPercent: 15, // 15% dragon power bonus
};

function createClan(player: Player, ...): Result {
  // Use core logic, add game-specific validation
  return createClanLogic(DRAGON_LEGENDS_CLAN_CONFIG, ...);
}
```

#### 3.2 roblox-game Changes

```typescript
// BEFORE (roblox-game/src/server/clans.ts)
function setupClanSystem() {
  /* 200+ lines */
}

// AFTER
import { createClanLogic, joinClanLogic, contributeToClanLogic, DEFAULT_CLAN_CONFIG } from '@aiawi/roblox-core';

const COIN_COLLECTOR_CLAN_CONFIG: ClanConfig = {
  ...DEFAULT_CLAN_CONFIG,
  createCost: 500, // Cheaper in this game
  bonusPercent: 10, // 10% coin bonus
};

function setupClanSystem() {
  // Wire up remotes to core logic
  // Add game-specific side effects (coins, stats)
}
```

### Phase 4: Testing

1. Run existing tests to ensure no regressions
2. Add integration tests for games using core
3. Verify both games still function correctly

---

## Files to Create/Modify

### New Core Files

```
libs/roblox-core/src/
├── social/
│   ├── clans.ts          # NEW - Clan system base
│   └── clans.spec.ts     # Already exists (tests)
├── retention/
│   ├── dailyRewards.ts   # NEW - Daily reward logic
│   └── dailyRewards.spec.ts # NEW - Tests
├── gameplay/
│   ├── battleSystem.ts   # NEW - Turn-based battle base
│   └── battleSystem.spec.ts # Already exists (tests)
└── world/
    ├── regions.ts        # NEW - Map/region system base
    └── regions.spec.ts   # NEW - Tests
```

### Game Files to Refactor

```
# dragon-legends - Import from core
- server/clans.ts       → Use @aiawi/roblox-core clans
- server/quests.ts      → Use @aiawi/roblox-core questSystem
- server/eggHatching.ts → Use @aiawi/roblox-core gachaSystem
- server/arena.ts       → Use @aiawi/roblox-core matchmaking
- server/dailyRewards.ts → Use @aiawi/roblox-core dailyRewards

# roblox-game - Import from core
- server/clans.ts       → Use @aiawi/roblox-core clans
- server/quests.ts      → Use @aiawi/roblox-core questSystem
- server/eggHatching.ts → Use @aiawi/roblox-core gachaSystem
- server/dailyRewards.ts → Use @aiawi/roblox-core dailyRewards
- server/trading.ts     → Use @aiawi/roblox-core trading
```

---

## Priority Order

| Priority | System        | Effort | Impact | Notes                                       |
| -------- | ------------- | ------ | ------ | ------------------------------------------- |
| 1        | Quests        | Low    | High   | Core already complete, just import          |
| 2        | Trading       | Low    | High   | Core already complete, just import          |
| 3        | Gacha/Eggs    | Low    | High   | Core already complete, just import          |
| 4        | Anti-Cheat    | Low    | High   | Core already complete, add to roblox-game   |
| 5        | Matchmaking   | Low    | Medium | Core already complete, dragon-legends arena |
| 6        | Clans         | Medium | High   | Need to create core version first           |
| 7        | Daily Rewards | Medium | Medium | Need to create core version first           |
| 8        | Battle System | High   | Medium | Complex extraction required                 |
| 9        | Regions/Maps  | High   | Low    | Significant game-specific logic             |

---

## Expected Benefits

1. **Code Reduction**: ~40% less duplicated code across games
2. **Test Coverage**: Core tests cover both games automatically
3. **Bug Fixes**: Fix once in core, both games benefit
4. **New Games**: Future games start with proven systems
5. **Consistency**: Same behavior for trading, quests, etc.
6. **Security**: Centralized anti-cheat and validation

---

## Next Steps

1. ✅ Create this migration plan
2. 🔄 Extract clans system to core (with tests)
3. 🔄 Extract daily rewards to core (with tests)
4. 🔄 Refactor dragon-legends to import from core
5. 🔄 Refactor roblox-game to import from core
6. 🔄 Add battle system base to core
7. 🔄 Final verification and cleanup
