// Dragon Legends - Region System (Server)
// World regions with wild dragons, NPCs, and progression

import {
  Players,
  Workspace,
  Lighting,
  ReplicatedStorage,
} from '@rbxts/services';
import { REGION_THEMES, GAME_THEME } from '../shared/theme';
import { DRAGONS, DragonDefinition, Element } from '../shared/config';
import { getPlayerData, updatePlayerData, spendCoins } from './dataStore';
import { startWildBattle } from './combat';
import { getPlayerDragons } from './dragons';

// Region data with spawn points and wild dragons
interface RegionData {
  id: string;
  name: string;
  position: Vector3;
  size: Vector3;
  wildDragons: {
    dragonId: string;
    levelRange: [number, number];
    spawnWeight: number;
  }[];
  bossSpawn?: { dragonId: string; level: number };
}

const REGION_DATA: RegionData[] = [
  {
    id: 'starter_meadow',
    name: 'Starter Meadow',
    position: new Vector3(0, 0, 0),
    size: new Vector3(300, 50, 300),
    wildDragons: [
      { dragonId: 'fire_drake_baby', levelRange: [1, 5], spawnWeight: 30 },
      { dragonId: 'water_wyrm_baby', levelRange: [1, 5], spawnWeight: 30 },
      { dragonId: 'nature_spirit_baby', levelRange: [1, 5], spawnWeight: 25 },
      { dragonId: 'frost_drake_baby', levelRange: [2, 6], spawnWeight: 15 },
    ],
  },
  {
    id: 'mystic_forest',
    name: 'Mystic Forest',
    position: new Vector3(400, 0, 0),
    size: new Vector3(400, 100, 400),
    wildDragons: [
      { dragonId: 'nature_spirit_teen', levelRange: [8, 15], spawnWeight: 30 },
      {
        dragonId: 'shadow_serpent_baby',
        levelRange: [10, 15],
        spawnWeight: 20,
      },
      { dragonId: 'light_sprite_baby', levelRange: [10, 15], spawnWeight: 20 },
      { dragonId: 'fire_drake_teen', levelRange: [10, 18], spawnWeight: 15 },
      { dragonId: 'water_wyrm_teen', levelRange: [10, 18], spawnWeight: 15 },
    ],
    bossSpawn: { dragonId: 'nature_spirit_adult', level: 25 },
  },
  {
    id: 'volcanic_peaks',
    name: 'Volcanic Peaks',
    position: new Vector3(-400, 0, 0),
    size: new Vector3(500, 200, 500),
    wildDragons: [
      { dragonId: 'fire_drake_teen', levelRange: [15, 25], spawnWeight: 35 },
      { dragonId: 'fire_drake_adult', levelRange: [20, 30], spawnWeight: 20 },
      {
        dragonId: 'thunder_dragon_baby',
        levelRange: [18, 25],
        spawnWeight: 15,
      },
      {
        dragonId: 'shadow_serpent_teen',
        levelRange: [18, 28],
        spawnWeight: 15,
      },
    ],
    bossSpawn: { dragonId: 'inferno_drake', level: 40 },
  },
  {
    id: 'frozen_tundra',
    name: 'Frozen Tundra',
    position: new Vector3(0, 0, 400),
    size: new Vector3(500, 100, 500),
    wildDragons: [
      { dragonId: 'frost_drake_teen', levelRange: [15, 25], spawnWeight: 35 },
      { dragonId: 'frost_drake_adult', levelRange: [20, 30], spawnWeight: 20 },
      { dragonId: 'water_wyrm_adult', levelRange: [22, 30], spawnWeight: 15 },
      { dragonId: 'crystal_dragon', levelRange: [25, 35], spawnWeight: 5 },
    ],
    bossSpawn: { dragonId: 'blizzard_king', level: 45 },
  },
  {
    id: 'storm_islands',
    name: 'Storm Islands',
    position: new Vector3(0, 0, -400),
    size: new Vector3(600, 150, 600),
    wildDragons: [
      {
        dragonId: 'thunder_dragon_teen',
        levelRange: [25, 35],
        spawnWeight: 30,
      },
      {
        dragonId: 'thunder_dragon_adult',
        levelRange: [30, 40],
        spawnWeight: 20,
      },
      { dragonId: 'water_wyrm_adult', levelRange: [28, 38], spawnWeight: 15 },
      { dragonId: 'light_sprite_teen', levelRange: [28, 38], spawnWeight: 15 },
    ],
    bossSpawn: { dragonId: 'storm_emperor', level: 50 },
  },
  {
    id: 'crystal_caverns',
    name: 'Crystal Caverns',
    position: new Vector3(600, 0, 400),
    size: new Vector3(400, 300, 400),
    wildDragons: [
      { dragonId: 'crystal_dragon', levelRange: [30, 40], spawnWeight: 25 },
      { dragonId: 'light_sprite_adult', levelRange: [32, 42], spawnWeight: 20 },
      {
        dragonId: 'shadow_serpent_adult',
        levelRange: [32, 42],
        spawnWeight: 20,
      },
      { dragonId: 'cosmic_dragon', levelRange: [40, 50], spawnWeight: 5 },
    ],
  },
  {
    id: 'shadow_realm',
    name: 'Shadow Realm',
    position: new Vector3(-600, 0, -400),
    size: new Vector3(500, 200, 500),
    wildDragons: [
      {
        dragonId: 'shadow_serpent_adult',
        levelRange: [35, 45],
        spawnWeight: 30,
      },
      { dragonId: 'void_dragon', levelRange: [40, 50], spawnWeight: 10 },
      { dragonId: 'light_sprite_adult', levelRange: [38, 48], spawnWeight: 15 },
      { dragonId: 'celestial_dragon', levelRange: [42, 50], spawnWeight: 5 },
    ],
    bossSpawn: { dragonId: 'void_dragon', level: 50 },
  },
  {
    id: 'celestial_sanctum',
    name: 'Celestial Sanctum',
    position: new Vector3(0, 0, 800),
    size: new Vector3(400, 400, 400),
    wildDragons: [
      { dragonId: 'celestial_dragon', levelRange: [45, 50], spawnWeight: 20 },
      { dragonId: 'cosmic_dragon', levelRange: [45, 50], spawnWeight: 15 },
      { dragonId: 'rainbow_dragon', levelRange: [48, 50], spawnWeight: 5 },
      { dragonId: 'chaos_lord', levelRange: [50, 50], spawnWeight: 1 },
    ],
  },
];

// Created region models
const regionModels = new Map<string, Model>();

// Create region in world
function createRegion(regionData: RegionData): Model {
  const model = new Instance('Model');
  model.Name = `Region_${regionData.id}`;

  // Find theme
  const theme =
    REGION_THEMES.find((t) => t.id === regionData.id) || REGION_THEMES[0];

  // Create ground
  const ground = new Instance('Part');
  ground.Name = 'Ground';
  ground.Size = new Vector3(regionData.size.X, 5, regionData.size.Z);
  ground.Position = regionData.position;
  ground.BrickColor = new BrickColor(
    regionData.id === 'volcanic_peaks'
      ? 'Dark stone grey'
      : regionData.id === 'frozen_tundra'
        ? 'Institutional white'
        : 'Bright green',
  );
  ground.Material =
    regionData.id === 'volcanic_peaks'
      ? Enum.Material.Rock
      : regionData.id === 'frozen_tundra'
        ? Enum.Material.Ice
        : Enum.Material.Grass;
  ground.TopSurface = Enum.SurfaceType.Smooth;
  ground.Anchored = true;
  ground.Parent = model;

  // Create entrance portal/sign
  const entrance = new Instance('Part');
  entrance.Name = 'Entrance';
  entrance.Size = new Vector3(10, 15, 2);
  entrance.Position = regionData.position.add(
    new Vector3(-regionData.size.X / 2 + 10, 10, 0),
  );
  entrance.BrickColor = new BrickColor('Medium stone grey');
  entrance.Material = Enum.Material.SmoothPlastic;
  entrance.Anchored = true;
  entrance.Parent = model;

  // Entrance sign
  const billboard = new Instance('BillboardGui');
  billboard.Size = new UDim2(0, 200, 0, 80);
  billboard.StudsOffset = new Vector3(0, 5, 0);
  billboard.AlwaysOnTop = true;

  const nameLabel = new Instance('TextLabel');
  nameLabel.Size = new UDim2(1, 0, 0.6, 0);
  nameLabel.BackgroundTransparency = 1;
  nameLabel.Text = `${theme.emoji} ${regionData.name}`;
  nameLabel.TextColor3 = theme.color;
  nameLabel.TextStrokeColor3 = Color3.fromRGB(0, 0, 0);
  nameLabel.TextStrokeTransparency = 0;
  nameLabel.TextScaled = true;
  nameLabel.Font = Enum.Font.GothamBold;
  nameLabel.Parent = billboard;

  // Find unlock cost
  const unlockCost =
    REGION_THEMES.find((t) => t.id === regionData.id)?.unlockCost || 0;

  const costLabel = new Instance('TextLabel');
  costLabel.Size = new UDim2(1, 0, 0.4, 0);
  costLabel.Position = new UDim2(0, 0, 0.6, 0);
  costLabel.BackgroundTransparency = 1;
  costLabel.Text =
    unlockCost > 0 ? `🔒 ${unlockCost} coins to unlock` : '✅ Open';
  costLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
  costLabel.TextStrokeTransparency = 0;
  costLabel.TextScaled = true;
  costLabel.Font = Enum.Font.Gotham;
  costLabel.Parent = billboard;

  billboard.Parent = entrance;

  // Spawn wild dragon encounter points
  for (let i = 0; i < 5; i++) {
    const spawnPoint = new Instance('Part');
    spawnPoint.Name = `WildSpawn_${i}`;
    spawnPoint.Size = new Vector3(5, 0.5, 5);
    spawnPoint.Position = regionData.position.add(
      new Vector3(
        math.random(-regionData.size.X / 3, regionData.size.X / 3),
        0.5,
        math.random(-regionData.size.Z / 3, regionData.size.Z / 3),
      ),
    );
    spawnPoint.BrickColor = new BrickColor('Bright red');
    spawnPoint.Material = Enum.Material.Neon;
    spawnPoint.Transparency = 0.5;
    spawnPoint.Anchored = true;
    spawnPoint.Parent = model;

    // Add particles
    const particles = new Instance('ParticleEmitter');
    particles.Color = new ColorSequence(Color3.fromRGB(255, 100, 100));
    particles.Size = new NumberSequence(0.5);
    particles.Rate = 2;
    particles.Lifetime = new NumberRange(1, 2);
    particles.Speed = new NumberRange(2, 4);
    particles.Parent = spawnPoint;
  }

  model.Parent = Workspace;
  return model;
}

// Select wild dragon based on weights
function selectWildDragon(
  region: RegionData,
): { dragonId: string; level: number } | undefined {
  const totalWeight = region.wildDragons.reduce(
    (sum, d) => sum + d.spawnWeight,
    0,
  );
  let random = math.random() * totalWeight;

  for (const dragon of region.wildDragons) {
    random -= dragon.spawnWeight;
    if (random <= 0) {
      const level = math.random(dragon.levelRange[0], dragon.levelRange[1]);
      return { dragonId: dragon.dragonId, level };
    }
  }

  return undefined;
}

// Check if player can enter region
export function canEnterRegion(player: Player, regionId: string): boolean {
  const playerData = getPlayerData(player);
  if (!playerData) return false;
  return playerData.unlockedRegions.includes(regionId);
}

// Unlock region
export function unlockRegion(
  player: Player,
  regionId: string,
): { success: boolean; error?: string } {
  const playerData = getPlayerData(player);
  if (!playerData) {
    return { success: false, error: 'Player data not found' };
  }

  if (playerData.unlockedRegions.includes(regionId)) {
    return { success: false, error: 'Already unlocked' };
  }

  const theme = REGION_THEMES.find((t) => t.id === regionId);
  if (!theme) {
    return { success: false, error: 'Region not found' };
  }

  if (!spendCoins(player, theme.unlockCost)) {
    return { success: false, error: 'Not enough coins' };
  }

  playerData.unlockedRegions.push(regionId);
  updatePlayerData(player, playerData);

  print(`🗺️ ${player.Name} unlocked ${theme.name}!`);

  return { success: true };
}

// Start wild encounter
export function startWildEncounter(
  player: Player,
  regionId: string,
): { success: boolean; battleState?: object; error?: string } {
  if (!canEnterRegion(player, regionId)) {
    return { success: false, error: 'Region not unlocked' };
  }

  const region = REGION_DATA.find((r) => r.id === regionId);
  if (!region) {
    return { success: false, error: 'Region not found' };
  }

  const wild = selectWildDragon(region);
  if (!wild) {
    return { success: false, error: 'No wild dragons available' };
  }

  // Get player's active dragon
  const dragons = getPlayerDragons(player);
  const playerData = getPlayerData(player);
  if (!playerData || dragons.size() === 0) {
    return { success: false, error: 'No dragons to battle with' };
  }

  const activeDragon =
    dragons.find((d) => d.instanceId === playerData.activeDragonSlots[0]) ||
    dragons[0];

  const battleState = startWildBattle(
    player,
    activeDragon,
    wild.dragonId,
    wild.level,
  );

  if (!battleState) {
    return { success: false, error: 'Failed to start battle' };
  }

  return { success: true, battleState };
}

// Get region info
export function getRegionInfo(regionId: string): RegionData | undefined {
  return REGION_DATA.find((r) => r.id === regionId);
}

// Get all regions
export function getAllRegions(): RegionData[] {
  return REGION_DATA;
}

// Setup environment
function setupEnvironment(): void {
  // Dragon-themed sunset sky
  Lighting.ClockTime = 17.5;
  Lighting.GeographicLatitude = 40;
  Lighting.Ambient = new Color3(0.3, 0.2, 0.25);
  Lighting.OutdoorAmbient = new Color3(0.4, 0.3, 0.35);
  Lighting.ColorShift_Top = new Color3(1, 0.6, 0.5);

  const atmosphere = new Instance('Atmosphere');
  atmosphere.Density = 0.35;
  atmosphere.Offset = 0.2;
  atmosphere.Color = new Color3(0.8, 0.5, 0.6);
  atmosphere.Decay = new Color3(0.8, 0.4, 0.5);
  atmosphere.Glare = 0.6;
  atmosphere.Haze = 2;
  atmosphere.Parent = Lighting;

  const sky = new Instance('Sky');
  sky.SunAngularSize = 18;
  sky.MoonAngularSize = 8;
  sky.Parent = Lighting;

  print('🌅 Dragon Legends environment created!');
}

// Setup region system
export function setupRegionSystem(): void {
  // Setup environment
  setupEnvironment();

  // Create all regions
  for (const region of REGION_DATA) {
    const model = createRegion(region);
    regionModels.set(region.id, model);
  }

  // Setup remote events
  const remotes =
    (ReplicatedStorage.FindFirstChild('DragonRemotes') as Folder) ||
    new Instance('Folder');
  remotes.Name = 'DragonRemotes';
  remotes.Parent = ReplicatedStorage;

  const unlockRegionRemote = new Instance('RemoteFunction');
  unlockRegionRemote.Name = 'UnlockRegion';
  unlockRegionRemote.Parent = remotes;

  const startEncounterRemote = new Instance('RemoteFunction');
  startEncounterRemote.Name = 'StartWildEncounter';
  startEncounterRemote.Parent = remotes;

  const getRegionsRemote = new Instance('RemoteFunction');
  getRegionsRemote.Name = 'GetRegions';
  getRegionsRemote.Parent = remotes;

  unlockRegionRemote.OnServerInvoke = (player, regionId) => {
    if (!typeIs(regionId, 'string')) {
      return { success: false, error: 'Invalid region' };
    }
    return unlockRegion(player, regionId);
  };

  startEncounterRemote.OnServerInvoke = (player, regionId) => {
    if (!typeIs(regionId, 'string')) {
      return { success: false, error: 'Invalid region' };
    }
    return startWildEncounter(player, regionId);
  };

  getRegionsRemote.OnServerInvoke = (player) => {
    const playerData = getPlayerData(player);
    return REGION_DATA.map((r) => ({
      ...r,
      isUnlocked: playerData?.unlockedRegions.includes(r.id) ?? false,
    }));
  };

  print(`🗺️ Region System initialized! ${REGION_DATA.size()} regions loaded.`);
}
