# Roblox Game (roblox-ts + Rojo)

Roblox game development project using TypeScript, compiled to Luau via roblox-ts and synced to Roblox Studio via Rojo.

## Prerequisites

- [Roblox Studio](https://create.roblox.com/) installed
- VS Code extension: **Rojo** (for live sync)

## Quick Start

```bash
# 1. Install dependencies
cd apps/roblox-game
npm install

# 2. Install Rojo plugin in Roblox Studio
nx run roblox-game:install-plugin

# 3. Start development (compile + serve)
nx serve roblox-game
```

## NX Commands

| Command                             | Description                |
| ----------------------------------- | -------------------------- |
| `nx build roblox-game`              | Compile TypeScript to Luau |
| `nx watch roblox-game`              | Watch mode compilation     |
| `nx serve roblox-game`              | Build + start Rojo server  |
| `nx run roblox-game:install-plugin` | Install Rojo Studio plugin |

## Connecting to Roblox Studio

1. Run `nx serve roblox-game`
2. Open Roblox Studio
3. Click **Rojo** in the Plugins tab → **Connect**
4. Your scripts will sync automatically!

## Project Structure

```
src/
├── client/          → StarterPlayerScripts
│   └── main.client.ts
├── server/          → ServerScriptService
│   └── main.server.ts
└── shared/          → ReplicatedStorage
    └── utils.ts
```

## File Naming Convention

| Suffix       | Compiles To   | Location             |
| ------------ | ------------- | -------------------- |
| `.server.ts` | Server Script | ServerScriptService  |
| `.client.ts` | Local Script  | StarterPlayerScripts |
| `.ts`        | ModuleScript  | Depends on folder    |
