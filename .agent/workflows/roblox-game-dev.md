---
description: Roblox game development workflow - add features, review code, optimize performance
---

# Roblox Game Development Workflow

// turbo-all

## 1. Check Current Status

```bash
cd apps/roblox-game && npx rbxtsc
```

Review any build errors before proceeding.

## 2. Review Code Quality

Check file sizes for refactoring needs:

```bash
cd apps/roblox-game && dir src\server /S | findstr ".ts"
cd apps/roblox-game && dir src\client /S | findstr ".ts"
```

**Refactor if:**

- Any file > 30KB (split into modules)
- Duplicate code across files (extract to shared)

## 3. Check Performance Best Practices

Review `ROBLOX_BEST_PRACTICES.md` and verify:

- [ ] Coins per map: 3-5 max
- [ ] Main world coins: 8 max
- [ ] Active pets: 1 per player
- [ ] No `wait()` in tight loops
- [ ] Proper `RunService` usage

## 4. Feature Priority (PROVEN Revenue Mechanics)

> **ALWAYS prioritize in this order - these are proven by Pet Simulator X, Adopt Me, Blox Fruits:**

| Priority | Feature                 | Revenue Model             | Retention  | Status  |
| -------- | ----------------------- | ------------------------- | ---------- | ------- |
| 1        | **Gacha/Eggs**          | RNG addiction, rare chase | 🔥🔥🔥🔥🔥 | ✅ Done |
| 2        | **Rebirth/Prestige**    | Endless progression loop  | 🔥🔥🔥🔥   | ✅ Done |
| 3        | **Daily Login Rewards** | Streak FOMO               | 🔥🔥🔥🔥   | ✅ Done |
| 4        | **Daily Quests**        | Goals = engagement        | 🔥🔥🔥     | ✅ Done |
| 5        | **Lucky Wheel/Spins**   | Gambling excitement       | 🔥🔥🔥🔥   | ✅ Done |
| 6        | **Pet Evolution**       | Investment = value        | 🔥🔥🔥🔥   | ✅ Done |
| 7        | **Codes System**        | Marketing + virality      | 🔥🔥🔥🔥   | ⬜ NEXT |
| 8        | **VIP/Premium Pass**    | Direct revenue            | 💰💰💰     | ⬜ TODO |
| 9        | **Limited Time Events** | FOMO urgency              | 🔥🔥🔥🔥   | ⬜ TODO |
| 10       | **Trading**             | Player economy            | 🔥🔥🔥     | ✅ Done |

### Proven Algorithms/Formulas:

**Gacha Rates (Pet Simulator X):**

- Common: 50-60%
- Uncommon: 25-30%
- Rare: 10-15%
- Epic: 3-5%
- Legendary: 0.5-1%
- Mythic: 0.01-0.1%

**Rebirth Cost Scaling:**

```
cost = baseCost * (multiplier ^ rebirthCount)
multiplier = 1.5 to 2.0
```

**Daily Reward Curve:**

```
Day 1: 10, Day 2: 25, Day 3: 50, Day 4: 100, Day 5: 200, Day 6: 350, Day 7: 500
```

**Lucky Wheel Weights:**

- Small prize: 30-40%
- Medium: 20-25%
- Large: 10-15%
- Jackpot: 1-5%

## 5. Add New Feature

1. Create server file: `src/server/[feature].ts`
2. Create client UI: `src/client/[feature]UI.ts`
3. Add imports to `main.server.ts` and `main.client.ts`
4. Add setup calls in `init()` function
5. Build and test:

```bash
cd apps/roblox-game && npx rbxtsc
```

## 6. Test in Roblox Studio

1. Open Roblox Studio
2. Run Rojo sync: `rojo serve`
3. Connect in Studio via Rojo plugin
4. Test all features manually

## 7. Commit Changes

```bash
git add -A
git commit -m "feat(roblox-game): [description]"
```

## 8. Update Documentation

Update these files as needed:

- `GAMEPLAY.md` - Player-facing docs
- `ROBLOX_BEST_PRACTICES.md` - Performance rules
- `docs/plans/plan1-roblox-viral-features.md` - Feature status

---

## Quick Reference

**Key Files:**

- Server entry: `src/server/main.server.ts`
- Client entry: `src/client/main.client.ts`
- Shared config: `src/shared/config.ts`

**Current Systems (15+):**

- Coins, Pets, Eggs, Maps, Obby, Coasters
- Trading, Stealing, Leaderboard
- Daily Rewards, Quests, Lucky Wheel
- Rebirth, Music, NPCs, Game Passes
