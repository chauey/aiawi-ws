# Roblox Game - Master Feature List

> **Priority order based on proven revenue mechanics from Pet Simulator X, Adopt Me, Blox Fruits**

---

## ✅ IMPLEMENTED FEATURES

| #   | Feature                  | Priority    | Difficulty | Revenue        | Retention  | Status  |
| --- | ------------------------ | ----------- | ---------- | -------------- | ---------- | ------- |
| 1   | **Egg Hatching (Gacha)** | 🔴 CRITICAL | Medium     | 💰💰💰💰💰     | 🔥🔥🔥🔥🔥 | ✅ Done |
| 2   | **Rebirth/Prestige**     | 🔴 CRITICAL | Easy       | 💰💰💰         | 🔥🔥🔥🔥🔥 | ✅ Done |
| 3   | **Daily Login Rewards**  | 🔴 CRITICAL | Easy       | 💰💰           | 🔥🔥🔥🔥🔥 | ✅ Done |
| 4   | **Daily Quests**         | 🟠 HIGH     | Medium     | 💰💰           | 🔥🔥🔥🔥   | ✅ Done |
| 5   | **Lucky Wheel**          | 🟠 HIGH     | Easy       | 💰💰💰         | 🔥🔥🔥🔥   | ✅ Done |
| 6   | **Pet Evolution**        | 🟠 HIGH     | Medium     | 💰💰💰         | 🔥🔥🔥🔥   | ✅ Done |
| 7   | **Codes System**         | 🟠 HIGH     | Easy       | 💰 (marketing) | 🔥🔥🔥🔥   | ✅ Done |
| 8   | **Trading**              | 🟡 MEDIUM   | Hard       | 💰💰           | 🔥🔥🔥     | ✅ Done |
| 9   | **Coin Stealing**        | 🟡 MEDIUM   | Easy       | 💰             | 🔥🔥🔥     | ✅ Done |
| 10  | **Leaderboard**          | 🟡 MEDIUM   | Easy       | 💰             | 🔥🔥🔥     | ✅ Done |
| 11  | **Pet System (16 pets)** | 🔴 CRITICAL | Hard       | 💰💰💰💰       | 🔥🔥🔥🔥🔥 | ✅ Done |
| 12  | **Maps (6 worlds)**      | 🟠 HIGH     | Medium     | 💰💰💰         | 🔥🔥🔥     | ✅ Done |
| 13  | **Obby Tower**           | 🟢 LOW      | Easy       | 💰             | 🔥🔥       | ✅ Done |
| 14  | **Roller Coasters**      | 🟢 LOW      | Medium     | 💰             | 🔥🔥       | ✅ Done |
| 15  | **Game Passes**          | 🟠 HIGH     | Easy       | 💰💰💰💰💰     | 🔥         | ✅ Done |
| 16  | **Music Toggle**         | 🟢 LOW      | Easy       | -              | 🔥         | ✅ Done |
| 17  | **NPC Companions**       | 🟢 LOW      | Easy       | 💰             | 🔥🔥       | ✅ Done |
| 18  | **Tutorial**             | 🟡 MEDIUM   | Easy       | -              | 🔥🔥🔥     | ✅ Done |

---

## ⬜ PLANNED FEATURES (In Priority Order)

| #   | Feature             | Priority    | Difficulty | Revenue    | Retention  | Description                        |
| --- | ------------------- | ----------- | ---------- | ---------- | ---------- | ---------------------------------- |
| 19  | **VIP Zone**        | 🔴 CRITICAL | Medium     | 💰💰💰💰💰 | 🔥🔥🔥🔥   | Exclusive area for premium players |
| 20  | **Limited Events**  | 🔴 CRITICAL | Hard       | 💰💰💰💰   | 🔥🔥🔥🔥🔥 | FOMO-driven seasonal content       |
| 21  | **Premium Pass**    | 🔴 CRITICAL | Easy       | 💰💰💰💰💰 | 🔥🔥🔥     | Monthly subscription benefits      |
| 22  | **Pet Fusion**      | 🟠 HIGH     | Medium     | 💰💰💰     | 🔥🔥🔥🔥   | Combine pets for new ones          |
| 23  | **Achievements**    | 🟡 MEDIUM   | Easy       | 💰         | 🔥🔥🔥     | Badges and rewards                 |
| 24  | **Clans/Teams**     | 🟡 MEDIUM   | Hard       | 💰💰       | 🔥🔥🔥🔥   | Social group features              |
| 25  | **Pet Battles**     | 🟡 MEDIUM   | Hard       | 💰💰💰     | 🔥🔥🔥     | PvP with pets                      |
| 26  | **Private Servers** | 🟡 MEDIUM   | Easy       | 💰💰💰     | 🔥🔥       | Robux purchase                     |
| 27  | **Minigames**       | 🟢 LOW      | Medium     | 💰💰       | 🔥🔥🔥     | Variety activities                 |

---

## 💡 PROVEN ALGORITHMS

**Gacha/Egg Rates:**

- Common: 50-60%, Uncommon: 25-30%, Rare: 10-15%
- Epic: 3-5%, Legendary: 0.5-1%, Mythic: 0.01-0.1%

**Rebirth Scaling:** `cost = base * (1.5 ^ count)`

**Daily Rewards:** 10 → 25 → 50 → 100 → 200 → 350 → 500

---

## 📁 FILE STRUCTURE

```
src/
├── server/           # Server-side logic
│   ├── pets.ts       # Pet system
│   ├── eggHatching.ts # Gacha
│   ├── rebirth.ts    # Prestige
│   ├── quests.ts     # Daily quests
│   ├── luckyWheel.ts # Spin wheel
│   ├── petEvolution.ts # Evolution
│   ├── codes.ts      # Codes
│   └── ...
├── client/           # Client UI
│   ├── eggShopUI.ts
│   ├── rebirthUI.ts
│   ├── questUI.ts
│   └── ...
└── shared/           # Shared config
    ├── config.ts     # Game balance
    └── theme.ts      # Re-theming
```

---

_Updated: 2026-01-28 | Total Systems: 18+_
