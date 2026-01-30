---
description: Create a new Roblox game project with full setup - folder structure, config, and Game Manager registration
---

# New Roblox Game Project Workflow

// turbo-all

## Prerequisites

Before starting, ensure you have:

- Game concept defined (name, genre, unique mechanics)
- Target audience identified
- Core systems selected from libs/roblox-core

---

## Step 1: Create Game App Structure

Create the new game folder by copying the template:

```bash
Copy-Item -Path "apps/roblox-game" -Destination "apps/[game-name]" -Recurse
```

## Step 2: Update Project Configuration

Edit `apps/[game-name]/project.json`:

- Change `"name"` to the game name (kebab-case)
- Update source roots

Edit `apps/[game-name]/default.project.json`:

- Update `"name"` field for Rojo

## Step 3: Configure Game Settings

Create/Update `apps/[game-name]/src/shared/gameConfig.ts`:

```typescript
export const GAME_CONFIG = {
  // Game Identity
  gameName: '[Display Name]',
  gameId: '[uuid from Game Manager]',
  version: '0.1.0',

  // Core Systems to Enable
  systems: {
    dailyRewards: true,
    questSystem: true,
    gachaSystem: false, // Enable based on game type
    tradingSystem: false,
    clanSystem: false,
    battlePass: false,
  },

  // Economy Settings
  economy: {
    startingCurrency: 100,
    currencyName: 'Coins',
    premiumCurrencyName: 'Gems',
  },

  // Game-Specific Settings
  // ... add based on game type
};
```

## Step 4: Import Core Systems

In `apps/[game-name]/src/server/main.server.ts`:

```typescript
// Import from roblox-core
import { DailyRewardsSystem } from '@roblox-core/retention/dailyRewards';
import { QuestSystem } from '@roblox-core/retention/questSystem';
// ... other systems as needed
```

## Step 5: Register in Game Manager

Add the game to `apps/game-data-api/data/games-database.json`:

```json
{
  "id": "[GUID]",
  "name": "🎮 [Game Name]",
  "developer": "AI AWI Studios",
  "genre": "[Genre]",
  "ownership": "Our Game",
  "platform": "Roblox",
  "description": "[Description]",
  "requirements": [],
  "settings": [],
  "tutorials": [],
  "documentation": []
}
```

## Step 6: Update Systems Registry

Add linked game ID to `apps/game-data-api/data/systems-registry.json`:

For each system the game uses, add the game ID to `linkedGames` array.

## Step 7: Build and Verify

```bash
cd apps/[game-name] && npx rbxtsc
```

## Step 8: Create Initial Requirements

Add requirements in Game Manager:

- [ ] Core gameplay loop
- [ ] Monetization systems
- [ ] UI/UX implementation
- [ ] Tutorial/Onboarding
- [ ] Testing and polish

## Step 9: Update Documentation

Create `apps/[game-name]/README.md` with:

- Game concept overview
- Unique mechanics
- Target audience
- Development roadmap

---

## Quick Checklist

- [ ] App folder created
- [ ] project.json updated
- [ ] default.project.json updated
- [ ] gameConfig.ts created
- [ ] Core systems imported
- [ ] Registered in Game Manager
- [ ] Systems registry updated
- [ ] Builds successfully
- [ ] Requirements added
- [ ] README created

---

## File Locations

| Purpose           | Location                                        |
| ----------------- | ----------------------------------------------- |
| Game code         | `apps/[game-name]/src/`                         |
| Shared config     | `apps/[game-name]/src/shared/gameConfig.ts`     |
| Server entry      | `apps/[game-name]/src/server/main.server.ts`    |
| Client entry      | `apps/[game-name]/src/client/main.client.ts`    |
| Core systems      | `libs/roblox-core/src/`                         |
| Game Manager data | `apps/game-data-api/data/`                      |
| Systems registry  | `apps/game-data-api/data/systems-registry.json` |
