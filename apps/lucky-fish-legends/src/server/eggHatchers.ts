/**
 * Egg Hatcher System - Physical egg hatching pedestals in the world
 * Like Pet Simulator X, Adopt Me - proven engagement mechanic
 */

import { Players, ReplicatedStorage, Workspace } from '@rbxts/services';

// Hatcher locations in the world
const HATCHER_ZONES = [
  {
    name: 'Starter Hatchery',
    position: new Vector3(0, 0, 40),
    hatchers: 3,
    tier: 'basic',
  },
  {
    name: 'Pond Hatchery',
    position: new Vector3(-50, 0, 60),
    hatchers: 4,
    tier: 'premium',
  },
  {
    name: 'Ocean Hatchery',
    position: new Vector3(80, 0, 50),
    hatchers: 5,
    tier: 'legendary',
  },
];

// Track active hatches: PlayerId -> HatcherId -> EggInfo
const activeHatches = new Map<
  Player,
  Map<
    string,
    {
      eggType: string;
      startTime: number;
      hatchTime: number;
      hatcherId: string;
    }
  >
>();

// Track hatcher ownership: HatcherId -> Player
const hatcherOwnership = new Map<string, Player>();

let hatchersFolder: Folder;
let hatchRemotes: {
  placeEgg: RemoteFunction;
  collectHatch: RemoteFunction;
  getHatcherStatus: RemoteFunction;
};

export function setupEggHatchers() {
  // Create remotes
  const remotesFolder = new Instance('Folder');
  remotesFolder.Name = 'HatcherRemotes';
  remotesFolder.Parent = ReplicatedStorage;

  hatchRemotes = {
    placeEgg: createRemote('PlaceEgg', remotesFolder) as RemoteFunction,
    collectHatch: createRemote('CollectHatch', remotesFolder) as RemoteFunction,
    getHatcherStatus: createRemote(
      'GetHatcherStatus',
      remotesFolder,
    ) as RemoteFunction,
  };

  // Setup handlers
  hatchRemotes.placeEgg.OnServerInvoke = handlePlaceEgg;
  hatchRemotes.collectHatch.OnServerInvoke = handleCollectHatch;
  hatchRemotes.getHatcherStatus.OnServerInvoke = handleGetStatus;

  // Create physical hatchers in world
  hatchersFolder = new Instance('Folder');
  hatchersFolder.Name = 'EggHatchers';
  hatchersFolder.Parent = Workspace;

  for (const zone of HATCHER_ZONES) {
    createHatcherZone(zone);
  }

  // Initialize player hatch tracking
  Players.PlayerAdded.Connect((player) => {
    activeHatches.set(player, new Map());
  });

  Players.PlayerRemoving.Connect((player) => {
    // Release hatchers owned by leaving player
    const playerHatches = activeHatches.get(player);
    if (playerHatches) {
      for (const [hatcherId] of playerHatches) {
        hatcherOwnership.delete(hatcherId);
        updateHatcherVisual(hatcherId, 'empty');
      }
    }
    activeHatches.delete(player);
  });

  print('🥚 Egg Hatchers system ready!');
}

function createRemote(
  name: string,
  parent: Instance,
): RemoteFunction | RemoteEvent {
  const remote = new Instance('RemoteFunction');
  remote.Name = name;
  remote.Parent = parent;
  return remote;
}

function createHatcherZone(zone: (typeof HATCHER_ZONES)[0]): void {
  const zoneModel = new Instance('Model');
  zoneModel.Name = zone.name;

  // Zone sign
  const sign = new Instance('Part');
  sign.Name = 'ZoneSign';
  sign.Size = new Vector3(8, 3, 0.5);
  sign.Position = zone.position.add(new Vector3(0, 10, -10));
  sign.Anchored = true;
  sign.Material = Enum.Material.SmoothPlastic;
  sign.Color =
    zone.tier === 'legendary'
      ? new Color3(1, 0.8, 0.2)
      : zone.tier === 'premium'
        ? new Color3(0.6, 0.3, 0.8)
        : new Color3(0.3, 0.6, 0.3);
  sign.Parent = zoneModel;

  const signText = new Instance('SurfaceGui');
  signText.Face = Enum.NormalId.Front;
  signText.Parent = sign;

  const label = new Instance('TextLabel');
  label.Size = new UDim2(1, 0, 1, 0);
  label.BackgroundTransparency = 1;
  label.Text = zone.name;
  label.TextColor3 = new Color3(1, 1, 1);
  label.TextScaled = true;
  label.Font = Enum.Font.GothamBold;
  label.Parent = signText;

  // Create individual hatchers
  for (let i = 0; i < zone.hatchers; i++) {
    const hatcherId = `${zone.name}_${i}`;
    const offset = (i - (zone.hatchers - 1) / 2) * 6;
    const hatcherPos = zone.position.add(new Vector3(offset, 0, 0));

    createHatcherPedestal(hatcherId, hatcherPos, zone.tier, zoneModel);
  }

  zoneModel.Parent = hatchersFolder;
}

function createHatcherPedestal(
  id: string,
  position: Vector3,
  tier: string,
  parent: Model,
): Model {
  const hatcher = new Instance('Model');
  hatcher.Name = id;

  // Base pedestal
  const base = new Instance('Part');
  base.Name = 'Base';
  base.Shape = Enum.PartType.Cylinder;
  base.Size = new Vector3(1, 4, 4);
  base.CFrame = new CFrame(position).mul(CFrame.Angles(0, 0, math.rad(90)));
  base.Anchored = true;
  base.Material = Enum.Material.Marble;
  base.Color =
    tier === 'legendary'
      ? new Color3(1, 0.85, 0.3)
      : tier === 'premium'
        ? new Color3(0.5, 0.3, 0.6)
        : new Color3(0.6, 0.6, 0.6);
  base.Parent = hatcher;
  hatcher.PrimaryPart = base;

  // Top platform
  const top = new Instance('Part');
  top.Name = 'Platform';
  top.Shape = Enum.PartType.Cylinder;
  top.Size = new Vector3(0.3, 3.5, 3.5);
  top.CFrame = new CFrame(position.add(new Vector3(0, 0.65, 0))).mul(
    CFrame.Angles(0, 0, math.rad(90)),
  );
  top.Anchored = true;
  top.Material = Enum.Material.SmoothPlastic;
  top.Color = new Color3(0.2, 0.2, 0.25);
  top.Parent = hatcher;

  // Egg holder (empty by default)
  const eggHolder = new Instance('Part');
  eggHolder.Name = 'EggHolder';
  eggHolder.Shape = Enum.PartType.Ball;
  eggHolder.Size = new Vector3(2, 2.5, 2);
  eggHolder.Position = position.add(new Vector3(0, 2, 0));
  eggHolder.Anchored = true;
  eggHolder.Material = Enum.Material.Glass;
  eggHolder.Transparency = 0.8;
  eggHolder.Color = new Color3(0.9, 0.9, 1);
  eggHolder.Parent = hatcher;

  // Timer display (BillboardGui)
  const timerGui = new Instance('BillboardGui');
  timerGui.Name = 'TimerGui';
  timerGui.Size = new UDim2(0, 80, 0, 30);
  timerGui.StudsOffset = new Vector3(0, 4, 0);
  timerGui.Adornee = eggHolder;
  timerGui.Parent = hatcher;

  const timerLabel = new Instance('TextLabel');
  timerLabel.Name = 'Timer';
  timerLabel.Size = new UDim2(1, 0, 1, 0);
  timerLabel.BackgroundTransparency = 1;
  timerLabel.Text = 'Empty';
  timerLabel.TextColor3 = new Color3(1, 1, 1);
  timerLabel.TextStrokeTransparency = 0.5;
  timerLabel.TextScaled = true;
  timerLabel.Font = Enum.Font.GothamBold;
  timerLabel.Parent = timerGui;

  // Interaction prompt
  const prompt = new Instance('ProximityPrompt');
  prompt.Name = 'HatchPrompt';
  prompt.ActionText = 'Place Egg';
  prompt.ObjectText = 'Hatcher';
  prompt.HoldDuration = 0.3;
  prompt.MaxActivationDistance = 8;
  prompt.Parent = top;

  prompt.Triggered.Connect((player) => {
    handleHatcherInteraction(player, id);
  });

  hatcher.Parent = parent;
  return hatcher;
}

function handlePlaceEgg(
  player: Player,
  hatcherId: unknown,
  eggType: unknown,
): { success: boolean; message: string } {
  if (!typeIs(hatcherId, 'string') || !typeIs(eggType, 'string')) {
    return { success: false, message: 'Invalid request' };
  }

  // Check if hatcher is available
  const currentOwner = hatcherOwnership.get(hatcherId);
  if (currentOwner && currentOwner !== player) {
    return { success: false, message: 'This hatcher is in use!' };
  }

  // Check if player has the egg type
  // This would integrate with the existing egg system
  // For now, we'll allow it if they have coins
  const leaderstats = player.FindFirstChild('leaderstats') as
    | Folder
    | undefined;
  const coins = leaderstats?.FindFirstChild('Coins') as IntValue | undefined;

  const eggCosts: Record<string, number> = {
    basic: 50,
    premium: 250,
    legendary: 1000,
    mythic: 5000,
  };

  const cost = eggCosts[eggType] ?? 100;
  if (!coins || coins.Value < cost) {
    return { success: false, message: `Need ${cost} coins!` };
  }

  // Deduct coins
  coins.Value -= cost;

  // Get hatch time
  const hatchTimes: Record<string, number> = {
    basic: 30,
    premium: 60,
    legendary: 120,
    mythic: 300,
  };

  const hatchTime = hatchTimes[eggType] ?? 30;

  // Register hatch
  let playerHatches = activeHatches.get(player);
  if (!playerHatches) {
    playerHatches = new Map();
    activeHatches.set(player, playerHatches);
  }

  playerHatches.set(hatcherId, {
    eggType,
    startTime: tick(),
    hatchTime,
    hatcherId,
  });

  hatcherOwnership.set(hatcherId, player);

  // Update visual
  updateHatcherVisual(hatcherId, 'incubating', eggType, hatchTime);

  print(`🥚 ${player.Name} placed ${eggType} egg in ${hatcherId}`);

  return { success: true, message: `Egg placed! Hatches in ${hatchTime}s` };
}

function handleCollectHatch(
  player: Player,
  hatcherId: unknown,
): {
  success: boolean;
  message: string;
  pet?: { name: string; rarity: string };
} {
  if (!typeIs(hatcherId, 'string')) {
    return { success: false, message: 'Invalid request' };
  }

  const playerHatches = activeHatches.get(player);
  if (!playerHatches) {
    return { success: false, message: 'No hatches found' };
  }

  const hatch = playerHatches.get(hatcherId);
  if (!hatch) {
    return { success: false, message: 'No egg in this hatcher' };
  }

  // Check if ready
  const elapsed = tick() - hatch.startTime;
  if (elapsed < hatch.hatchTime) {
    const remaining = math.ceil(hatch.hatchTime - elapsed);
    return { success: false, message: `${remaining}s remaining!` };
  }

  // Roll for pet using weighted random (integrate with existing egg system)
  const pet = rollPetFromEgg(hatch.eggType);

  // Clean up
  playerHatches.delete(hatcherId);
  hatcherOwnership.delete(hatcherId);

  // Update visual
  updateHatcherVisual(hatcherId, 'empty');

  print(`🐣 ${player.Name} hatched ${pet.rarity} ${pet.name}!`);

  return { success: true, message: `Hatched ${pet.name}!`, pet };
}

function handleGetStatus(
  player: Player,
): Record<string, { eggType: string; remaining: number; ready: boolean }> {
  const result: Record<
    string,
    { eggType: string; remaining: number; ready: boolean }
  > = {};

  const playerHatches = activeHatches.get(player);
  if (!playerHatches) return result;

  for (const [hatcherId, hatch] of playerHatches) {
    const elapsed = tick() - hatch.startTime;
    const remaining = math.max(0, hatch.hatchTime - elapsed);
    result[hatcherId] = {
      eggType: hatch.eggType,
      remaining: math.ceil(remaining),
      ready: remaining <= 0,
    };
  }

  return result;
}

function handleHatcherInteraction(player: Player, hatcherId: string): void {
  const owner = hatcherOwnership.get(hatcherId);

  if (!owner) {
    // Hatcher is empty - prompt to place egg
    // Client handles the egg selection UI
    return;
  }

  if (owner === player) {
    // Player owns this hatcher - check if ready
    const playerHatches = activeHatches.get(player);
    const hatch = playerHatches?.get(hatcherId);

    if (hatch) {
      const elapsed = tick() - hatch.startTime;
      if (elapsed >= hatch.hatchTime) {
        // Auto-collect ready egg
        handleCollectHatch(player, hatcherId);
      }
    }
  }
}

function updateHatcherVisual(
  hatcherId: string,
  state: 'empty' | 'incubating' | 'ready',
  eggType?: string,
  totalTime?: number,
): void {
  // Find the hatcher model
  let hatcherModel: Model | undefined;

  for (const zone of hatchersFolder.GetChildren()) {
    if (zone.IsA('Model')) {
      hatcherModel = zone.FindFirstChild(hatcherId) as Model | undefined;
      if (hatcherModel) break;
    }
  }

  if (!hatcherModel) return;

  const eggHolder = hatcherModel.FindFirstChild('EggHolder') as
    | Part
    | undefined;
  const timerGui = hatcherModel.FindFirstChild('TimerGui') as
    | BillboardGui
    | undefined;
  const timerLabel = timerGui?.FindFirstChild('Timer') as TextLabel | undefined;

  if (!eggHolder || !timerLabel) return;

  switch (state) {
    case 'empty':
      eggHolder.Transparency = 0.8;
      eggHolder.Color = new Color3(0.9, 0.9, 1);
      timerLabel.Text = 'Empty';
      timerLabel.TextColor3 = new Color3(0.6, 0.6, 0.6);
      break;

    case 'incubating':
      eggHolder.Transparency = 0;
      eggHolder.Color =
        eggType === 'mythic'
          ? new Color3(1, 0.3, 0.5)
          : eggType === 'legendary'
            ? new Color3(1, 0.8, 0.2)
            : eggType === 'premium'
              ? new Color3(0.6, 0.3, 0.8)
              : new Color3(0.8, 0.8, 0.8);
      timerLabel.TextColor3 = new Color3(1, 0.8, 0.3);

      // Start timer update coroutine
      if (totalTime) {
        task.spawn(() => {
          const startTime = tick();
          while (hatcherOwnership.has(hatcherId)) {
            const elapsed = tick() - startTime;
            const remaining = math.max(0, totalTime - elapsed);

            if (remaining <= 0) {
              timerLabel.Text = '🐣 READY!';
              timerLabel.TextColor3 = new Color3(0.3, 1, 0.4);
              eggHolder.Color = new Color3(0.5, 1, 0.5);
              break;
            }

            timerLabel.Text = `${math.ceil(remaining)}s`;
            task.wait(1);
          }
        });
      }
      break;

    case 'ready':
      timerLabel.Text = '🐣 READY!';
      timerLabel.TextColor3 = new Color3(0.3, 1, 0.4);
      eggHolder.Color = new Color3(0.5, 1, 0.5);
      break;
  }
}

function rollPetFromEgg(eggType: string): { name: string; rarity: string } {
  // Pet pools by egg type
  const petPools: Record<
    string,
    { name: string; rarity: string; weight: number }[]
  > = {
    basic: [
      { name: 'Cat', rarity: 'Common', weight: 30 },
      { name: 'Dog', rarity: 'Common', weight: 30 },
      { name: 'Bunny', rarity: 'Uncommon', weight: 20 },
      { name: 'Hamster', rarity: 'Uncommon', weight: 15 },
      { name: 'Fox', rarity: 'Rare', weight: 5 },
    ],
    premium: [
      { name: 'Bear', rarity: 'Uncommon', weight: 25 },
      { name: 'Panda', rarity: 'Uncommon', weight: 25 },
      { name: 'Penguin', rarity: 'Rare', weight: 20 },
      { name: 'Owl', rarity: 'Rare', weight: 15 },
      { name: 'Lion', rarity: 'Epic', weight: 10 },
      { name: 'Tiger', rarity: 'Epic', weight: 5 },
    ],
    legendary: [
      { name: 'Dragon', rarity: 'Epic', weight: 30 },
      { name: 'Phoenix', rarity: 'Epic', weight: 25 },
      { name: 'Unicorn', rarity: 'Legendary', weight: 20 },
      { name: 'Griffin', rarity: 'Legendary', weight: 15 },
      { name: 'Kraken', rarity: 'Mythic', weight: 10 },
    ],
    mythic: [
      { name: 'Cosmic Dragon', rarity: 'Legendary', weight: 30 },
      { name: 'Rainbow Unicorn', rarity: 'Legendary', weight: 25 },
      { name: 'Shadow Phoenix', rarity: 'Mythic', weight: 25 },
      { name: 'Galaxy Serpent', rarity: 'Mythic', weight: 15 },
      { name: 'Void Titan', rarity: 'Mythic', weight: 5 },
    ],
  };

  const pool = petPools[eggType] ?? petPools.basic;

  // Calculate total weight
  let totalWeight = 0;
  for (const pet of pool) {
    totalWeight += pet.weight;
  }

  // Roll
  let roll = math.random() * totalWeight;
  for (const pet of pool) {
    roll -= pet.weight;
    if (roll <= 0) {
      return { name: pet.name, rarity: pet.rarity };
    }
  }

  return pool[0];
}
