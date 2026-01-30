// Dragon Legends - Anti-Cheat & Security System
// Validates all server requests and prevents common exploits

import { Players, RunService } from '@rbxts/services';
import { getPlayerData } from './dataStore';

// ==================== RATE LIMITING ====================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

const RATE_LIMITS: Record<
  string,
  { maxRequests: number; windowSeconds: number }
> = {
  egg_hatch: { maxRequests: 10, windowSeconds: 60 },
  breed: { maxRequests: 5, windowSeconds: 60 },
  trade_request: { maxRequests: 10, windowSeconds: 60 },
  arena_queue: { maxRequests: 5, windowSeconds: 30 },
  world_boss_attack: { maxRequests: 60, windowSeconds: 60 },
  coin_collect: { maxRequests: 100, windowSeconds: 10 },
};

export function checkRateLimit(player: Player, action: string): boolean {
  const limitKey = `${player.UserId}_${action}`;
  const config = RATE_LIMITS[action];

  if (!config) return true; // No limit configured

  const now = os.time();
  const entry = rateLimits.get(limitKey);

  if (!entry || now >= entry.resetTime) {
    // Start new window
    rateLimits.set(limitKey, {
      count: 1,
      resetTime: now + config.windowSeconds,
    });
    return true;
  }

  if (entry.count >= config.maxRequests) {
    warn(`[AntiCheat] Rate limit exceeded: ${player.Name} - ${action}`);
    return false;
  }

  entry.count++;
  return true;
}

// ==================== VALUE VALIDATION ====================

export function validateCoins(player: Player, amount: number): boolean {
  const data = getPlayerData(player);
  if (!data) return false;

  if (amount < 0 || amount > data.coins) {
    warn(
      `[AntiCheat] Invalid coin amount: ${player.Name} tried ${amount}, has ${data.coins}`,
    );
    return false;
  }

  return true;
}

export function validateGems(player: Player, amount: number): boolean {
  const data = getPlayerData(player);
  if (!data) return false;

  if (amount < 0 || amount > data.gems) {
    warn(
      `[AntiCheat] Invalid gem amount: ${player.Name} tried ${amount}, has ${data.gems}`,
    );
    return false;
  }

  return true;
}

export function validateDragonOwnership(
  player: Player,
  dragonInstanceId: string,
): boolean {
  const data = getPlayerData(player);
  if (!data) return false;

  const owned = data.dragons.find((d) => d.instanceId === dragonInstanceId);
  if (!owned) {
    warn(
      `[AntiCheat] Dragon not owned: ${player.Name} tried to use ${dragonInstanceId}`,
    );
    return false;
  }

  return true;
}

// ==================== TELEPORT/SPEED VALIDATION ====================

const playerPositions = new Map<number, { position: Vector3; time: number }>();
const MAX_SPEED = 100; // Studs per second (generous for lag)

export function validateMovement(player: Player): boolean {
  const character = player.Character;
  if (!character) return true;

  const humanoidRootPart = character.FindFirstChild('HumanoidRootPart') as
    | BasePart
    | undefined;
  if (!humanoidRootPart) return true;

  const currentPos = humanoidRootPart.Position;
  const now = os.time();

  const lastEntry = playerPositions.get(player.UserId);
  if (!lastEntry) {
    playerPositions.set(player.UserId, { position: currentPos, time: now });
    return true;
  }

  const timeDelta = now - lastEntry.time;
  if (timeDelta < 1) return true; // Don't check too frequently

  const distance = currentPos.sub(lastEntry.position).Magnitude;
  const speed = distance / timeDelta;

  playerPositions.set(player.UserId, { position: currentPos, time: now });

  if (speed > MAX_SPEED) {
    warn(
      `[AntiCheat] Speed hack detected: ${player.Name} moving at ${speed} studs/s`,
    );
    // Teleport back to last valid position
    humanoidRootPart.CFrame = new CFrame(lastEntry.position);
    return false;
  }

  return true;
}

// ==================== ACTION VALIDATION ====================

export function validateAction<T>(
  player: Player,
  actionName: string,
  payload: T,
  validator: (data: T) => boolean,
): boolean {
  // Rate limit check
  if (!checkRateLimit(player, actionName)) {
    return false;
  }

  // Payload validation
  if (!validator(payload)) {
    warn(`[AntiCheat] Invalid payload: ${player.Name} - ${actionName}`);
    return false;
  }

  return true;
}

// ==================== SUSPICIOUS ACTIVITY TRACKING ====================

interface SuspiciousActivity {
  count: number;
  lastReported: number;
}

const suspiciousPlayers = new Map<number, SuspiciousActivity>();
const KICK_THRESHOLD = 10; // Number of violations before kick

export function reportSuspiciousActivity(player: Player, reason: string): void {
  const activity = suspiciousPlayers.get(player.UserId) ?? {
    count: 0,
    lastReported: 0,
  };
  activity.count++;
  activity.lastReported = os.time();
  suspiciousPlayers.set(player.UserId, activity);

  warn(
    `[AntiCheat] Suspicious: ${player.Name} - ${reason} (Count: ${activity.count})`,
  );

  if (activity.count >= KICK_THRESHOLD) {
    player.Kick('Suspicious activity detected. Please rejoin.');
    warn(`[AntiCheat] KICKED: ${player.Name} for repeated violations`);
  }
}

// ==================== SECURE RANDOM ====================

// Server-side random to prevent client prediction
export function secureRandom(min: number, max: number): number {
  return math.floor(math.random() * (max - min + 1)) + min;
}

export function secureRandomFloat(): number {
  return math.random();
}

// Weighted random with server-side validation
export function secureWeightedRandom<T>(
  items: Array<{ item: T; weight: number }>,
): T {
  if (items.size() === 0) {
    error('Cannot select from empty weighted list');
  }

  let totalWeight = 0;
  for (const entry of items) {
    totalWeight += entry.weight;
  }

  let random = secureRandomFloat() * totalWeight;
  for (const entry of items) {
    random -= entry.weight;
    if (random <= 0) {
      return entry.item;
    }
  }

  return items[items.size() - 1].item;
}

// ==================== SETUP ====================

export function setupAntiCheat(): void {
  // Clean up on player leave
  Players.PlayerRemoving.Connect((player) => {
    playerPositions.delete(player.UserId);
    suspiciousPlayers.delete(player.UserId);

    // Clean up rate limits for this player
    for (const [key] of rateLimits) {
      if (
        key.sub(1, tostring(player.UserId).size()) === tostring(player.UserId)
      ) {
        rateLimits.delete(key);
      }
    }
  });

  // Periodic movement validation (if enabled)
  if (RunService.IsServer()) {
    task.spawn(() => {
      while (true) {
        task.wait(2);
        for (const player of Players.GetPlayers()) {
          validateMovement(player);
        }
      }
    });
  }

  print('[AntiCheat] Security system initialized');
}
