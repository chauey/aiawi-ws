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

## 4. Feature Priority (Money-Making)

| Priority | Feature              | Impact     | Status  |
| -------- | -------------------- | ---------- | ------- |
| 1        | Egg Hatching (Gacha) | 🔥🔥🔥🔥🔥 | ✅ Done |
| 2        | Rebirth System       | 🔥🔥🔥🔥   | ✅ Done |
| 3        | Daily Quests         | 🔥🔥🔥     | ✅ Done |
| 4        | Lucky Wheel          | 🔥🔥🔥     | ✅ Done |
| 5        | Pet Evolution        | 🔥🔥🔥🔥   | ⬜ TODO |
| 6        | VIP Zone             | 🔥🔥🔥     | ⬜ TODO |
| 7        | Clans/Teams          | 🔥🔥🔥     | ⬜ TODO |
| 8        | Pet Battles          | 🔥🔥🔥     | ⬜ TODO |
| 9        | Seasonal Events      | 🔥🔥🔥     | ⬜ TODO |
| 10       | Private Servers      | 🔥🔥       | ⬜ TODO |

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
