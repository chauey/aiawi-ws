// Dragon Legends - Dragon System (Server)
// Core dragon management, spawning, and following behavior

import { Players, Workspace, ReplicatedStorage } from '@rbxts/services';
import {
  DRAGONS,
  DragonDefinition,
  RARITIES,
  Rarity,
  Element,
  DragonStats,
  GAME_CONFIG,
} from '../shared/config';
import { PlayerDragon } from '../shared/types';
import { GAME_THEME, DRAGON_EMOJIS } from '../shared/theme';

// Store active dragon models
const activeDragonModels = new Map<string, Model>();
const playerDragons = new Map<number, PlayerDragon[]>();

// Generate unique instance ID
function generateInstanceId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    const idx = math.floor(math.random() * chars.size());
    result += chars.sub(idx + 1, idx + 1);
  }
  return result;
}

// Create dragon model in world
function createDragonModel(dragon: PlayerDragon, position: Vector3): Model {
  const def = DRAGONS[dragon.dragonId];
  if (!def) {
    error(`Unknown dragon: ${dragon.dragonId}`);
  }

  const model = new Instance('Model');
  model.Name = `Dragon_${dragon.instanceId}`;

  // Create dragon body based on element and evolution stage
  const body = new Instance('Part');
  body.Name = 'Body';
  body.Size = getDragonSize(dragon.evolutionStage);
  body.Position = position;
  body.BrickColor = getElementBrickColor(def.element);
  body.Material = Enum.Material.SmoothPlastic;
  body.CanCollide = false;
  body.Anchored = false;
  body.Parent = model;

  // Add transparent flying effect
  const bodyForce = new Instance('BodyForce');
  bodyForce.Force = new Vector3(0, body.Mass * 196.2, 0);
  bodyForce.Parent = body;

  // Add glow for rarity
  if (dragon.rarity === 'Legendary' || dragon.rarity === 'Mythic') {
    const pointLight = new Instance('PointLight');
    pointLight.Color = RARITIES[dragon.rarity].color;
    pointLight.Brightness = 2;
    pointLight.Range = 8;
    pointLight.Parent = body;
  }

  // Add shiny sparkle effect
  if (dragon.isShiny) {
    const sparkle = new Instance('ParticleEmitter');
    sparkle.Color = new ColorSequence(Color3.fromRGB(255, 255, 200));
    sparkle.LightEmission = 1;
    sparkle.Size = new NumberSequence(0.3);
    sparkle.Rate = 5;
    sparkle.Lifetime = new NumberRange(0.5, 1);
    sparkle.Speed = new NumberRange(1, 2);
    sparkle.Parent = body;
  }

  // Add element-specific effects
  addElementEffects(body, def.element);

  // Add name tag
  const billboard = new Instance('BillboardGui');
  billboard.Size = new UDim2(0, 100, 0, 50);
  billboard.StudsOffset = new Vector3(0, 2.5, 0);
  billboard.AlwaysOnTop = true;

  const nameLabel = new Instance('TextLabel');
  nameLabel.Size = new UDim2(1, 0, 0.6, 0);
  nameLabel.Position = new UDim2(0, 0, 0, 0);
  nameLabel.BackgroundTransparency = 1;
  nameLabel.Text = dragon.nickname || def.name;
  nameLabel.TextColor3 = RARITIES[dragon.rarity].color;
  nameLabel.TextStrokeColor3 = Color3.fromRGB(0, 0, 0);
  nameLabel.TextStrokeTransparency = 0;
  nameLabel.TextScaled = true;
  nameLabel.Font = Enum.Font.GothamBold;
  nameLabel.Parent = billboard;

  const levelLabel = new Instance('TextLabel');
  levelLabel.Size = new UDim2(1, 0, 0.4, 0);
  levelLabel.Position = new UDim2(0, 0, 0.6, 0);
  levelLabel.BackgroundTransparency = 1;
  levelLabel.Text = `Lv.${dragon.level} ${DRAGON_EMOJIS[dragon.dragonId] || '🐉'}`;
  levelLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
  levelLabel.TextStrokeColor3 = Color3.fromRGB(0, 0, 0);
  levelLabel.TextStrokeTransparency = 0;
  levelLabel.TextScaled = true;
  levelLabel.Font = Enum.Font.Gotham;
  levelLabel.Parent = billboard;

  billboard.Parent = body;

  // Set primary part
  model.PrimaryPart = body;
  model.Parent = Workspace;

  return model;
}

function getDragonSize(stage: 1 | 2 | 3 | 4): Vector3 {
  switch (stage) {
    case 1:
      return new Vector3(1.5, 1.5, 2);
    case 2:
      return new Vector3(2.5, 2.5, 3.5);
    case 3:
      return new Vector3(4, 4, 5);
    case 4:
      return new Vector3(6, 6, 8);
  }
}

function getElementBrickColor(element: Element): BrickColor {
  switch (element) {
    case 'fire':
      return new BrickColor('Bright red');
    case 'water':
      return new BrickColor('Bright blue');
    case 'ice':
      return new BrickColor('Light blue');
    case 'electric':
      return new BrickColor('Bright yellow');
    case 'nature':
      return new BrickColor('Bright green');
    case 'shadow':
      return new BrickColor('Really black');
    case 'light':
      return new BrickColor('Institutional white');
    default:
      return new BrickColor('Medium stone grey');
  }
}

function addElementEffects(part: Part, element: Element) {
  const emitter = new Instance('ParticleEmitter');
  emitter.Size = new NumberSequence(0.2);
  emitter.Rate = 3;
  emitter.Lifetime = new NumberRange(0.5, 1);
  emitter.Speed = new NumberRange(1, 2);
  emitter.LightEmission = 0.5;

  switch (element) {
    case 'fire':
      emitter.Color = new ColorSequence(Color3.fromRGB(255, 100, 0));
      emitter.Speed = new NumberRange(2, 4);
      break;
    case 'water':
      emitter.Color = new ColorSequence(Color3.fromRGB(50, 150, 255));
      break;
    case 'ice':
      emitter.Color = new ColorSequence(Color3.fromRGB(200, 230, 255));
      break;
    case 'electric':
      emitter.Color = new ColorSequence(Color3.fromRGB(255, 255, 100));
      emitter.Rate = 5;
      break;
    case 'nature':
      emitter.Color = new ColorSequence(Color3.fromRGB(100, 200, 50));
      break;
    case 'shadow':
      emitter.Color = new ColorSequence(Color3.fromRGB(50, 0, 80));
      emitter.LightEmission = 0;
      break;
    case 'light':
      emitter.Color = new ColorSequence(Color3.fromRGB(255, 255, 200));
      emitter.LightEmission = 1;
      break;
  }

  emitter.Parent = part;
}

// Make dragon follow player
function followPlayer(dragonModel: Model, player: Player) {
  task.spawn(() => {
    let targetOffset = new Vector3(3, 2, 0);
    let offsetAngle = 0;

    while (dragonModel.Parent && player.Character) {
      const humanoidRootPart = player.Character.FindFirstChild(
        'HumanoidRootPart',
      ) as Part | undefined;

      if (humanoidRootPart && dragonModel.PrimaryPart) {
        // Create circular orbit pattern
        offsetAngle += 0.02;
        const orbitX = math.cos(offsetAngle) * 4;
        const orbitZ = math.sin(offsetAngle) * 4;

        const targetPos = humanoidRootPart.Position.add(
          new Vector3(orbitX, 3, orbitZ),
        );
        const currentPos = dragonModel.PrimaryPart.Position;
        const newPos = currentPos.Lerp(targetPos, 0.05);

        // Look at player
        const lookDir = humanoidRootPart.Position.sub(newPos);
        if (lookDir.Magnitude > 0.1) {
          const lookCFrame = CFrame.lookAt(newPos, humanoidRootPart.Position);
          dragonModel.PrimaryPart.CFrame = dragonModel.PrimaryPart.CFrame.Lerp(
            lookCFrame,
            0.1,
          );
        }

        // Bob up and down
        const bobOffset = math.sin(tick() * 2) * 0.3;
        dragonModel.PrimaryPart.Position = newPos.add(
          new Vector3(0, bobOffset, 0),
        );
      }

      task.wait(0.03);
    }
  });
}

// Create a new dragon for a player
export function createPlayerDragon(
  player: Player,
  dragonId: string,
  isShiny = false,
): PlayerDragon | undefined {
  const def = DRAGONS[dragonId];
  if (!def) {
    warn(`Unknown dragon: ${dragonId}`);
    return undefined;
  }

  const dragon: PlayerDragon = {
    instanceId: generateInstanceId(),
    dragonId: dragonId,
    level: 1,
    experience: 0,
    stats: { ...def.baseStats },
    element: def.element,
    rarity: def.rarity,
    evolutionStage: def.evolutionStage,
    isShiny: isShiny,
    obtainedAt: os.time(),
    breedCount: 0,
    battleWins: 0,
    battleLosses: 0,
    isFavorite: false,
  };

  // Store dragon
  const existing = playerDragons.get(player.UserId) || [];
  existing.push(dragon);
  playerDragons.set(player.UserId, existing);

  print(
    `🐉 ${player.Name} obtained ${isShiny ? '✨SHINY✨ ' : ''}${def.name}!`,
  );

  return dragon;
}

// Spawn dragon in world for player
export function spawnDragonForPlayer(
  player: Player,
  dragon: PlayerDragon,
): Model | undefined {
  const character = player.Character;
  if (!character) return undefined;

  const hrp = character.FindFirstChild('HumanoidRootPart') as Part | undefined;
  if (!hrp) return undefined;

  // Remove existing dragon model if any
  const existingKey = `${player.UserId}_${dragon.instanceId}`;
  const existing = activeDragonModels.get(existingKey);
  if (existing) {
    existing.Destroy();
  }

  // Create new dragon
  const position = hrp.Position.add(new Vector3(3, 2, 0));
  const model = createDragonModel(dragon, position);
  activeDragonModels.set(existingKey, model);

  // Start following
  followPlayer(model, player);

  return model;
}

// Remove dragon from world
export function despawnDragon(player: Player, dragon: PlayerDragon): void {
  const key = `${player.UserId}_${dragon.instanceId}`;
  const model = activeDragonModels.get(key);
  if (model) {
    model.Destroy();
    activeDragonModels.delete(key);
  }
}

// Get player's dragons
export function getPlayerDragons(player: Player): PlayerDragon[] {
  return playerDragons.get(player.UserId) || [];
}

// Add XP to dragon
export function addDragonXP(
  player: Player,
  dragon: PlayerDragon,
  xp: number,
): boolean {
  dragon.experience += xp;

  // Check for level up
  const xpNeeded = dragon.level * GAME_CONFIG.XP_PER_LEVEL;
  if (
    dragon.experience >= xpNeeded &&
    dragon.level < GAME_CONFIG.MAX_DRAGON_LEVEL
  ) {
    dragon.level++;
    dragon.experience -= xpNeeded;

    // Increase stats on level up
    dragon.stats.power += 2;
    dragon.stats.speed += 1;
    dragon.stats.health += 3;
    dragon.stats.luck += 1;

    print(`⬆️ ${player.Name}'s dragon leveled up to ${dragon.level}!`);

    // Check for evolution
    const def = DRAGONS[dragon.dragonId];
    if (def?.evolvesTo && GAME_CONFIG.EVOLUTION_LEVELS.includes(dragon.level)) {
      return true; // Signal evolution ready
    }
  }

  return false;
}

// Evolve dragon
export function evolveDragon(
  player: Player,
  dragon: PlayerDragon,
): PlayerDragon | undefined {
  const def = DRAGONS[dragon.dragonId];
  if (!def?.evolvesTo) {
    warn(`Dragon ${dragon.dragonId} cannot evolve`);
    return undefined;
  }

  const newDef = DRAGONS[def.evolvesTo];
  if (!newDef) {
    warn(`Evolution target ${def.evolvesTo} not found`);
    return undefined;
  }

  // Despawn old dragon
  despawnDragon(player, dragon);

  // Update dragon data
  dragon.dragonId = newDef.id;
  dragon.evolutionStage = newDef.evolutionStage;
  dragon.rarity = newDef.rarity;

  // Boost stats on evolution
  const statMultiplier = 1.5;
  dragon.stats.power = math.floor(dragon.stats.power * statMultiplier);
  dragon.stats.speed = math.floor(dragon.stats.speed * statMultiplier);
  dragon.stats.health = math.floor(dragon.stats.health * statMultiplier);
  dragon.stats.luck = math.floor(dragon.stats.luck * statMultiplier);

  print(`✨ ${player.Name}'s dragon evolved into ${newDef.name}!`);

  // Spawn new evolved dragon
  spawnDragonForPlayer(player, dragon);

  return dragon;
}

// Setup dragon system
export function setupDragonSystem(): void {
  // Create remote events
  const remotes = new Instance('Folder');
  remotes.Name = 'DragonRemotes';
  remotes.Parent = ReplicatedStorage;

  const spawnDragonRemote = new Instance('RemoteEvent');
  spawnDragonRemote.Name = 'SpawnDragon';
  spawnDragonRemote.Parent = remotes;

  const despawnDragonRemote = new Instance('RemoteEvent');
  despawnDragonRemote.Name = 'DespawnDragon';
  despawnDragonRemote.Parent = remotes;

  const evolveRemote = new Instance('RemoteEvent');
  evolveRemote.Name = 'EvolveDragon';
  evolveRemote.Parent = remotes;

  // Handle spawn requests
  spawnDragonRemote.OnServerEvent.Connect((player, instanceId) => {
    if (!typeIs(instanceId, 'string')) return;

    const dragons = getPlayerDragons(player);
    const dragon = dragons.find((d) => d.instanceId === instanceId);
    if (dragon) {
      spawnDragonForPlayer(player, dragon);
    }
  });

  // Handle despawn requests
  despawnDragonRemote.OnServerEvent.Connect((player, instanceId) => {
    if (!typeIs(instanceId, 'string')) return;

    const dragons = getPlayerDragons(player);
    const dragon = dragons.find((d) => d.instanceId === instanceId);
    if (dragon) {
      despawnDragon(player, dragon);
    }
  });

  // Handle evolution requests
  evolveRemote.OnServerEvent.Connect((player, instanceId) => {
    if (!typeIs(instanceId, 'string')) return;

    const dragons = getPlayerDragons(player);
    const dragon = dragons.find((d) => d.instanceId === instanceId);
    if (dragon) {
      evolveDragon(player, dragon);
    }
  });

  // Clean up when players leave
  Players.PlayerRemoving.Connect((player) => {
    const dragons = playerDragons.get(player.UserId);
    if (dragons) {
      dragons.forEach((d) => despawnDragon(player, d));
      playerDragons.delete(player.UserId);
    }
  });

  print('🐉 Dragon System initialized!');
}
