# Roblox Game Performance Best Practices

> Guidelines for future AI and developers to maintain optimal performance.

## Object Limits (Recommended Maximums)

| Object Type             | Max Count    | Current | Notes                                  |
| ----------------------- | ------------ | ------- | -------------------------------------- |
| **Coins (main world)**  | 8-10         | 8       | Respawning collectibles                |
| **Map coins (per map)** | 3-5          | 8-10    | One-time collectibles, reduce if laggy |
| **Active pets**         | 1 per player | 1       | More causes physics lag                |
| **Parts per map**       | 200-500      | ~100    | Use MeshParts for complex shapes       |
| **Particle emitters**   | 5-10 total   | ~10     | Very expensive on low-end devices      |

## Performance Rules

### 1. Part Count

- ❌ Don't create parts in `Heartbeat`/`RenderStepped` loops
- ✅ Create parts once at startup, move them as needed
- ✅ Use `Anchored = true` for static objects (no physics cost)

### 2. Looping & Updates

- ❌ Don't use `wait()` in tight loops
- ✅ Use `RunService.Heartbeat` for game logic (server)
- ✅ Use `RunService.RenderStepped` for visuals (client)
- ✅ Throttle updates: not every frame needs processing

### 3. Collectibles (Coins, Gems, etc.)

- ✅ Keep total collectible count under 50 across all areas
- ✅ Make expensive maps have FEWER but HIGHER VALUE coins
- ✅ Use respawn timers (5+ seconds) instead of instant

### 4. Pets & NPCs

- ✅ Only 1 active pet per player
- ✅ Use `AlignPosition`/`AlignOrientation` instead of manual CFrame updates
- ✅ Disable physics on decorative parts

### 5. Maps / Worlds

- ✅ Only load map when player teleports to it
- ✅ Use simple primitives (Ball, Block, Cylinder) over MeshParts when possible
- ✅ Set `CanCollide = false` on decorative parts

### 6. Audio

- ✅ Use `SoundService` for global music (not per-part sounds)
- ✅ Limit to 1-2 background sounds
- ✅ Provide mute toggle

### 7. UI

- ✅ Use `ScreenGui.DisplayOrder` to layer properly
- ✅ Set `ResetOnSpawn = false` for persistent UI
- ✅ Limit TextLabels with `TextScaled = true` (expensive)

## Code Patterns

### Good: Efficient Coin Collection

```typescript
// Check coins periodically, not every frame
let checkTimer = 0;
RunService.Heartbeat.Connect((dt) => {
  checkTimer += dt;
  if (checkTimer < 0.1) return; // Only check 10x/second
  checkTimer = 0;
  // ... coin pickup logic
});
```

### Good: Object Pooling

```typescript
// Reuse parts instead of creating/destroying
const coinPool: Part[] = [];
function getCoin(): Part {
  return coinPool.pop() ?? new Instance('Part');
}
function returnCoin(coin: Part) {
  coin.Position = new Vector3(0, -100, 0); // Hide
  coinPool.push(coin);
}
```

## Current Settings

- Main world coins: **8**
- Coin respawn time: **5 seconds**
- Pet magnet check: **Every Heartbeat** (could throttle to 10Hz)

---

_Last updated: 2026-01-27_
