# 🐉 Dragon Legends - Game Design Document

> **Concept:** Pet collection meets anime-style combat with dragon breeding, evolution, and elemental battles

---

## 🎯 Core Concept

**Dragon Legends** combines the proven success formulas:

- **Pet Collection** (Adopt Me, Pet Simulator X) → Dragon collecting
- **Anime Combat** (Blox Fruits) → Elemental dragon battles
- **Gacha/Breeding** → Egg hatching + dragon breeding for rare hybrids
- **Progression** → Dragon evolution, player levels, skill trees

**Target Audience:** Ages 8-16 (sweet spot for Roblox monetization)

---

## ✨ Unique Selling Points

1. **Dragon Breeding System** - Combine two dragons to create unique hybrids
2. **Elemental Combat** - Fire beats Ice, Ice beats Electric, Electric beats Water, etc.
3. **Dragon Evolution** - 3-stage evolution paths (Baby → Teen → Adult → Legendary form)
4. **Clan Wars** - Weekly clan battles with exclusive rewards
5. **World Bosses** - Server-wide boss fights that drop rare dragons

---

## 🐲 Dragon System (Core Feature)

### Dragon Types (50+ planned)

| Tier       | Dragons                                     | Obtain Method       |
| ---------- | ------------------------------------------- | ------------------- |
| **Common** | Fire Drake, Water Wyrm, Earth Turtle, Wind  | Basic eggs (free)   |
| **Rare**   | Thunder Dragon, Frost Drake, Shadow Serpent | Premium eggs        |
| **Epic**   | Crystal Dragon, Solar Phoenix, Storm King   | Breeding/Events     |
| **Legend** | Cosmic Dragon, Void Dragon, Rainbow Dragon  | Ultra-rare breeding |
| **Mythic** | Galaxy Serpent, Time Dragon, Chaos Lord     | 0.1% drop rate      |

### Dragon Stats

- **Power** - Combat strength
- **Speed** - Attack priority
- **Health** - Survivability
- **Luck** - Bonus drops, crit chance
- **Elemental Affinity** - Type advantages

### Evolution System

```
Baby Dragon (Lv 1-10) → Teen Dragon (Lv 11-25) → Adult Dragon (Lv 26-50)
                                                        ↓
                                            Legendary Form (Lv 50 + Special Item)
```

---

## ⚔️ Combat System

### Battle Types

1. **Wild Dragon Battles** - Catch wild dragons in the world
2. **PvP Arena** - 1v1 and 3v3 ranked battles
3. **Clan Wars** - Weekly team battles
4. **Boss Raids** - Server-wide cooperative battles
5. **Tower Challenge** - 100-floor gauntlet with increasingly difficult fights

### Elemental Wheel

```
       🔥 Fire
      ↗     ↘
   ⚡Electric   ❄️Ice
      ↖     ↙
       💧 Water

   🌿Nature ↔ 🌙Shadow ↔ ⭐Light
```

---

## 🗺️ World Maps (8 Regions)

| Region                | Theme            | Dragons Found        | Unlock Cost |
| --------------------- | ---------------- | -------------------- | ----------- |
| **Starter Meadow**    | Grassy, peaceful | Common fire/water    | Free        |
| **Mystic Forest**     | Dark, magical    | Nature, shadow types | 500 coins   |
| **Volcanic Peaks**    | Lava, dangerous  | Fire, magma dragons  | 2,000 coins |
| **Frozen Tundra**     | Snow, ice caves  | Ice, frost dragons   | 5,000 coins |
| **Storm Islands**     | Floating, clouds | Electric, wind types | 10,000      |
| **Crystal Caverns**   | Underground gems | Crystal, rare breeds | 25,000      |
| **Shadow Realm**      | Dark dimension   | Shadow, void dragons | 50,000      |
| **Celestial Sanctum** | Heavenly, stars  | Cosmic, legendary    | 100,000     |

---

## 💎 Monetization Strategy

### Primary Revenue Streams (Robux)

| Product                 | Price | Value                            |
| ----------------------- | ----- | -------------------------------- |
| **Daily Egg Pass**      | 99R   | 1 premium egg/day for 30 days    |
| **VIP Dragon Rider**    | 399R  | 2x coins, exclusive dragon mount |
| **Legendary Starter**   | 799R  | Guaranteed legendary dragon      |
| **Breeding Boost**      | 149R  | 50% faster breeding for 7 days   |
| **Private Dragon Lair** | 499R  | Private server with bonus spawns |

### Gacha Rates (Egg Hatching)

- **Common:** 50%
- **Rare:** 30%
- **Epic:** 15%
- **Legendary:** 4%
- **Mythic:** 1%

### Limited Events

- **Seasonal Dragons** - Halloween, Christmas, Summer exclusives
- **Collaboration Events** - Special themed crossovers
- **Weekend Raids** - Double drops, rare boss spawns

---

## 📊 Retention Mechanics

### Daily Systems

- **Daily Login Streak** - Escalating rewards (10 → 25 → 50 → 100 → 250 → 500 → 1000)
- **Daily Quests** - 3 refreshing quests for coins + XP
- **Lucky Wheel** - Free spin every 4 hours, premium spins available
- **Daily Boss** - One free raid attempt per day

### Weekly Systems

- **Clan Wars** - Weekly reset, ranking rewards
- **Arena Season** - PvP rankings with exclusive dragons
- **Weekend Events** - 2x XP, special spawns

### Progression Hooks

- **Dragon Codex** - Collect all dragons for titles/rewards
- **Achievements** - 200+ achievements with coin rewards
- **Battle Pass** - Seasonal pass with exclusive cosmetics

---

## 🏆 Social Features

### Clans

- Up to 50 members per clan
- Clan levels, perks, and exclusive dragons
- Weekly clan wars with territory control
- Clan chat and dragon sharing

### Trading

- Dragon trading between players
- Trade history and scam protection
- Rarity locks (can't trade event exclusives)

### Leaderboards

- Top coin collectors
- Strongest dragons
- PvP rankings
- Clan rankings

---

## 🔧 Technical Implementation

### Using libs/roblox-core Systems

- `progression/` - Dragon leveling, XP system
- `monetization/` - Egg purchases, VIP passes
- `retention/` - Daily login, streaks
- `social/` - Clans, trading
- `economy/` - Dragon coin economy
- `security/` - Anti-exploit, trade verification

### New Systems to Build

- `src/server/dragons/` - Dragon stats, breeding, evolution
- `src/server/combat/` - Battle system, PvP, raids
- `src/server/world/` - Region progression, boss spawns
- `src/client/dragonUI/` - Dragon inventory, battle UI

---

## 📈 Predicted Success Metrics

Based on competitor analysis:

| Metric             | Target (Month 1) | Target (Month 6) |
| ------------------ | ---------------- | ---------------- |
| Daily Active Users | 50,000           | 500,000          |
| Concurrent Players | 5,000            | 50,000           |
| Monthly Revenue    | $50,000          | $500,000         |
| D1 Retention       | 60%              | 70%              |
| D7 Retention       | 40%              | 50%              |
| D30 Retention      | 25%              | 35%              |

---

## 🚀 Development Phases

### Phase 1: MVP (4 weeks)

- [ ] Core dragon system (10 dragons)
- [ ] Basic combat system
- [ ] 2 starter maps
- [ ] Egg hatching (gacha)
- [ ] Daily rewards

### Phase 2: Social (2 weeks)

- [ ] Trading system
- [ ] Clans
- [ ] Leaderboards
- [ ] Basic PvP

### Phase 3: Monetization (2 weeks)

- [ ] Game passes
- [ ] Premium eggs
- [ ] VIP system
- [ ] Battle pass

### Phase 4: Content (Ongoing)

- [ ] New dragons monthly
- [ ] Seasonal events
- [ ] New regions
- [ ] Boss raids

---

_Dragon Legends - Where legends are bred, not born!_
