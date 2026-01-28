---
description: Systematic code review workflow for Roblox game - check all systems for best practices
---

# Roblox Game Review Workflow

> Use this workflow to systematically review all code, features, logic, and UI for best practices.

## Pre-Review Checklist

- [ ] Build passes: `npx rbxtsc`
- [ ] No TypeScript errors
- [ ] Git is clean (no uncommitted changes)

---

## 1. Security Review (Server-Side)

// turbo

```bash
# Check all server files exist
ls apps/roblox-game/src/server/*.ts
```

**For each server file, verify:**

- [ ] All game logic runs on server, not client
- [ ] RemoteFunctions validate ALL input with `typeIs()`
- [ ] No trusting client-sent data (coins, pet values, etc.)
- [ ] Rate limiting on expensive operations
- [ ] Player cleanup in `PlayerRemoving` event

**Files to review:**

- `main.server.ts` - Entry point, system initialization
- `pets.ts` - Pet creation and management
- `eggHatching.ts` - Gacha system, randomization
- `rebirth.ts` - Prestige mechanics
- `trading.ts` - Trade validation
- `coinStealing.ts` - PvP stealing logic
- `achievements.ts` - Progress tracking
- `clans.ts` - Social features
- `petBattles.ts` - PvP combat
- `minigames.ts` - Quick games

---

## 2. Performance Review

**Check for:**

- [ ] No `wait()` in tight loops
- [ ] Object pooling for frequently created/destroyed objects
- [ ] Efficient coin spawning (batch operations)
- [ ] LOD (Level of Detail) for distant objects
- [ ] Limited particle effects
- [ ] Proper cleanup of connections and instances

// turbo

```bash
# Search for potential performance issues
grep -rn "while.*true" apps/roblox-game/src/
grep -rn "\.connect" apps/roblox-game/src/ | head -20
```

---

## 3. UI/UX Review (Client-Side)

**For each UI file, verify:**

- [ ] Consistent styling (colors, fonts, sizes)
- [ ] Responsive positioning (UDim2 with scale, not just offset)
- [ ] Clear visual feedback on actions
- [ ] Loading states for async operations
- [ ] Error messages for failures
- [ ] Animations/tweens for polish

**Files to review:**

- `main.client.ts` - Entry point, core UI
- `shopUI.ts` - Purchase interface
- `eggShopUI.ts` - Gacha UI
- `rebirthUI.ts` - Prestige UI
- `tradingUI.ts` - Trade interface
- `achievementsUI.ts` - Badge display
- `clansUI.ts` - Clan management
- `battlesUI.ts` - PvP interface
- `minigamesUI.ts` - Quick games UI

---

## 4. Game Balance Review

**Check configuration values:**

- [ ] Egg rates are fair but encourage spending
- [ ] Rebirth costs scale appropriately
- [ ] Daily rewards ramp up correctly
- [ ] Pet multipliers are balanced
- [ ] Map unlock costs match progression

// turbo

```bash
# Review config files
cat apps/roblox-game/src/shared/config.ts
```

---

## 5. Code Quality Review

**For all files, check:**

- [ ] No magic numbers (use constants)
- [ ] Descriptive variable names
- [ ] Functions are small and focused
- [ ] Comments explain WHY, not WHAT
- [ ] Consistent code style
- [ ] No duplicate code (DRY principle)
- [ ] Proper error handling

// turbo

```bash
# Run linter
cd apps/roblox-game && npx eslint src/ --ext .ts 2>&1 | head -50
```

---

## 6. Monetization Review

**Verify revenue mechanics:**

- [ ] Game passes provide value
- [ ] Premium benefits are attractive
- [ ] VIP zone has exclusive content
- [ ] Events create FOMO
- [ ] Codes drive social sharing
- [ ] Private servers are appealing

---

## 7. Retention Review

**Check engagement hooks:**

- [ ] Daily login streak rewards
- [ ] Quest variety and rewards
- [ ] Achievement progression
- [ ] Social features (trading, clans)
- [ ] Regular content updates plan
- [ ] Leaderboard incentives

---

## 8. Documentation Review

**Verify docs are complete:**

- [ ] FEATURES.md is up to date
- [ ] THEMES.md has 50 themes
- [ ] SUCCESS_SECRETS.md has formulas
- [ ] GAMEPLAY.md explains mechanics
- [ ] README has setup instructions

// turbo

```bash
# List all documentation
ls apps/roblox-game/*.md
```

---

## 9. Integration Testing

**Test each system manually:**

1. Join game, collect coins
2. Open egg shop, hatch egg
3. Equip pet, verify multiplier
4. Complete quests
5. Claim daily rewards
6. Spin lucky wheel
7. Trade with player
8. Battle another player
9. Join/create clan
10. Play minigames
11. Check achievements
12. Test rebirth

---

## 10. Final Build & Deploy

// turbo

```bash
# Clean build
cd apps/roblox-game && npx rbxtsc --verbose
```

// turbo

```bash
# Sync to Roblox Studio
cd apps/roblox-game && npx rojo serve
```

---

## Review Completion Checklist

- [ ] All security issues fixed
- [ ] Performance optimized
- [ ] UI polished
- [ ] Balance tuned
- [ ] Code quality improved
- [ ] Monetization verified
- [ ] Retention hooks in place
- [ ] Documentation complete
- [ ] All systems tested
- [ ] Build successful

---

_Last updated: 2026-01-28_
