# 🎣 Lucky Fish Legends

A relaxing yet competitive fishing simulator built on Roblox.

## 🎮 Game Concept

Fish, collect, and compete in **Lucky Fish Legends**! Explore beautiful fishing locations, catch rare and legendary fish, complete your collection album, and compete in fishing tournaments.

### Target Audience

- Ages 8-16
- Casual players who enjoy collecting
- Competitive players who want leaderboard glory
- Social players who like trading with friends

### Genre

- **Primary:** Simulator
- **Secondary:** Collection, Social, Competitive

---

## ⭐ Core Mechanics

### 1. Fishing Loop

- Cast your line at fishing spots
- Wait for a bite (timing minigame)
- Reel in the fish (skill check)
- Catch depends on location, rod, bait, and luck

### 2. Fish Rarities

| Rarity    | Chance | Coin Multiplier |
| --------- | ------ | --------------- |
| Common    | 50%    | 1x              |
| Uncommon  | 25%    | 2x              |
| Rare      | 15%    | 5x              |
| Epic      | 7%     | 15x             |
| Legendary | 2.5%   | 50x             |
| Mythic    | 0.5%   | 200x            |

### 3. Fishing Locations

1. **Starter Pond** (Level 1) - Tutorial area
2. **River Rapids** (Level 5) - Faster current, better fish
3. **Deep Lake** (Level 10) - Deep water species
4. **Ocean Shore** (Level 15) - Saltwater fish
5. **Volcanic Pool** (Level 25) - Fire-themed rare fish
6. **Crystal Cavern** (Level 40) - Mythic fish territory

### 4. Collection Album

- 150+ fish species to collect
- Category completion bonuses
- Album rewards for milestones
- Limited-time seasonal fish

---

## 🛠️ Systems from roblox-core

This game uses the following shared systems:

| System             | Purpose                                      |
| ------------------ | -------------------------------------------- |
| Daily Rewards      | Login streaks with fishing-themed rewards    |
| Quest System       | Daily/weekly fishing challenges              |
| Trading System     | Trade fish with other players                |
| Battle Pass        | Seasonal fishing pass with exclusive content |
| Anti-Cheat         | Prevent fishing exploits                     |
| Validation Service | Secure player actions                        |
| DataStore Helpers  | Safe player data persistence                 |
| Friends System     | Fishing bonuses with friends                 |
| Starter Packs      | New player bundle deals                      |

---

## 💰 Monetization

### Free-to-Play Friendly

- All fish catchable without paying
- Premium speeds up progression
- Cosmetics are premium-focused

### Revenue Streams

1. **Fishing Pass** (Battle Pass) - 499 Robux/season
2. **Premium Rods** - Cosmetic + slight speed boost
3. **Bait Packs** - Skip farming time
4. **Location VIP** - Double XP in specific areas
5. **Starter Pack** - Best value for new players

---

## 📁 Project Structure

```
apps/lucky-fish-legends/
├── src/
│   ├── client/           # Client-side scripts
│   │   └── main.client.ts
│   ├── server/           # Server-side scripts
│   │   └── main.server.ts
│   └── shared/           # Shared between client/server
│       ├── gameConfig.ts  # Game-specific config
│       └── config.ts      # Legacy config
├── default.project.json   # Rojo project config
├── project.json           # Nx project config
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

---

## 🚀 Development

### Build

```bash
npx nx run lucky-fish-legends:build
```

### Watch Mode

```bash
npx nx run lucky-fish-legends:watch
```

### Serve (Build + Rojo)

```bash
npx nx run lucky-fish-legends:serve
```

---

## 📋 Development Roadmap

- [ ] Core fishing mechanic
- [ ] Fish collection system
- [ ] 6 fishing locations
- [ ] 50 fish species (MVP)
- [ ] Daily rewards integration
- [ ] Quest system integration
- [ ] Trading system
- [ ] Battle pass (Season 1)
- [ ] UI polish
- [ ] Sound design
- [ ] Launch!

---

## 📊 Success Metrics

| Metric              | Target      |
| ------------------- | ----------- |
| Day 1 Retention     | 40%+        |
| Day 7 Retention     | 20%+        |
| Average Session     | 20+ minutes |
| ARPDAU              | $0.05+      |
| Fish Caught/Session | 30+         |

---

_Part of the AI AWI Studios game portfolio_
