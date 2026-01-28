# Roblox Coin Game - Viral Features Roadmap

> **Goal**: Transform the coin collection game into a viral hit by adding proven engagement mechanics from top Roblox games.

## Phase 1: Core Engagement Loop (High Priority)

### 1.1 Pet System 🐕

- Pets follow player and help collect coins
- Multiple pet types with different abilities
- Pet trading between players

### 1.2 Obby Tower 🗼

- Parkour challenge tower in center of map
- Bonus coins at top
- Leaderboard for fastest completion

### 1.3 Daily Rewards 📅

- Login streak system
- Escalating rewards (more coins, rare pets)
- FOMO timer display

---

## Phase 2: Monetization (Medium Priority)

### 2.1 Game Passes 💎

- 2x Coin Multiplier (R$99)
- VIP Pet (R$199)
- Speed Boost (R$49)

### 2.2 Shop System 🏪

- Buy pets with coins
- Buy cosmetics/trails
- Limited-time items

---

## Phase 3: Social & Retention (Lower Priority)

### 3.1 Trading System 🔄

- Trade pets between players
- Trade coins
- Scam protection UI

### 3.2 Leaderboards 📊

- All-time coins
- Daily coins
- Obby speed records

---

## Implementation Order

| #   | Feature       | Effort   | Impact   | Status  |
| --- | ------------- | -------- | -------- | ------- |
| 1   | Pet follower  | ⭐⭐     | 🔥🔥🔥   | ✅ DONE |
| 2   | Obby tower    | ⭐⭐     | 🔥🔥🔥   | ✅ DONE |
| 3   | Daily rewards | ⭐⭐     | 🔥🔥🔥   | ✅ DONE |
| 4   | 2x coin pass  | ⭐       | 🔥🔥     | ✅ DONE |
| 5   | Pet shop      | ⭐⭐⭐   | 🔥🔥🔥   | ✅ DONE |
| 6   | Map shop      | ⭐⭐⭐   | 🔥🔥🔥   | ✅ DONE |
| 7   | Leaderboard   | ⭐⭐     | 🔥🔥     | 🔲 TODO |
| 8   | Trading       | ⭐⭐⭐⭐ | 🔥🔥🔥🔥 | 🔲 TODO |

---

## Technical Notes

- All features use roblox-ts + Rojo workflow
- Server handles: pets, rewards, shop, trading
- Client handles: UI, effects, input
- DataStore for persistence (coins, pets, streaks)
