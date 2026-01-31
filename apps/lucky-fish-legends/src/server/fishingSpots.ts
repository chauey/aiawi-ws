// Fishing Spots - Physical fishing locations in the game world
import { Workspace, ReplicatedStorage } from '@rbxts/services';

// Define fishing spot locations
const FISHING_SPOTS = [
  {
    id: 'starter_pond',
    name: 'Starter Pond',
    position: new Vector3(30, 0, 30),
    size: new Vector3(25, 4, 25),
    color: Color3.fromRGB(50, 150, 200),
    waterLevel: -1,
    hasPier: false,
  },
  {
    id: 'mystic_lake',
    name: 'Mystic Lake',
    position: new Vector3(-50, 0, -50),
    size: new Vector3(40, 5, 40),
    color: Color3.fromRGB(100, 80, 180),
    waterLevel: -1,
    hasPier: true,
  },
  {
    id: 'ocean_pier',
    name: 'Ocean Pier',
    position: new Vector3(80, 0, 0),
    size: new Vector3(60, 6, 40),
    color: Color3.fromRGB(30, 100, 150),
    waterLevel: -1.5,
    hasPier: true,
  },
];

/**
 * Create a wooden pier structure
 */
function createPier(waterPos: Vector3, waterSize: Vector3): Model {
  const pier = new Instance('Model');
  pier.Name = 'Pier';

  // Pier planks (walkable surface)
  const planks = new Instance('Part');
  planks.Name = 'Planks';
  planks.Size = new Vector3(4, 0.3, 15);
  planks.Position = new Vector3(
    waterPos.X - waterSize.X / 2 - 2,
    2,
    waterPos.Z,
  );
  planks.Anchored = true;
  planks.Material = Enum.Material.Wood;
  planks.BrickColor = new BrickColor('Brown');
  planks.Parent = pier;

  // Add wood texture lines
  const texture = new Instance('Texture');
  texture.Texture = 'rbxassetid://9873284556'; // Wood plank texture
  texture.Face = Enum.NormalId.Top;
  texture.StudsPerTileU = 2;
  texture.StudsPerTileV = 4;
  texture.Parent = planks;

  // Support posts
  for (let i = 0; i < 3; i++) {
    const post = new Instance('Part');
    post.Name = `Post_${i}`;
    post.Size = new Vector3(0.5, 4, 0.5);
    post.Position = new Vector3(
      planks.Position.X - 1.5 + i * 1.5,
      0,
      planks.Position.Z - 6,
    );
    post.Anchored = true;
    post.Material = Enum.Material.Wood;
    post.BrickColor = new BrickColor('Dark taupe');
    post.Parent = pier;

    // Second row
    const post2 = post.Clone();
    post2.Position = new Vector3(
      planks.Position.X - 1.5 + i * 1.5,
      0,
      planks.Position.Z + 6,
    );
    post2.Parent = pier;
  }

  // Pier railing
  const railing = new Instance('Part');
  railing.Name = 'Railing';
  railing.Size = new Vector3(0.2, 1, 15);
  railing.Position = new Vector3(planks.Position.X + 2, 2.8, planks.Position.Z);
  railing.Anchored = true;
  railing.Material = Enum.Material.Wood;
  railing.BrickColor = new BrickColor('Brown');
  railing.Parent = pier;

  // Railing posts
  for (let i = 0; i < 4; i++) {
    const railPost = new Instance('Part');
    railPost.Name = `RailPost_${i}`;
    railPost.Size = new Vector3(0.3, 1.5, 0.3);
    railPost.Position = new Vector3(
      planks.Position.X + 1.8,
      2.5,
      planks.Position.Z - 6 + i * 4,
    );
    railPost.Anchored = true;
    railPost.Material = Enum.Material.Wood;
    railPost.BrickColor = new BrickColor('Dark taupe');
    railPost.Parent = pier;
  }

  // Dock extension into water
  const dock = new Instance('Part');
  dock.Name = 'Dock';
  dock.Size = new Vector3(3, 0.3, 8);
  dock.Position = new Vector3(
    waterPos.X - waterSize.X / 2 + 3,
    1.5,
    waterPos.Z,
  );
  dock.Anchored = true;
  dock.Material = Enum.Material.Wood;
  dock.BrickColor = new BrickColor('Brown');
  dock.Parent = pier;

  pier.Parent = Workspace;
  return pier;
}

/**
 * Create swimmable water with proper physics
 */
function createSwimmableWater(spot: (typeof FISHING_SPOTS)[0]): Part {
  // Main water volume (deep)
  const water = new Instance('Part');
  water.Name = 'Water';
  water.Size = spot.size;
  water.Position = new Vector3(
    spot.position.X,
    spot.waterLevel - spot.size.Y / 2,
    spot.position.Z,
  );
  water.Anchored = true;
  water.CanCollide = false; // Players can swim through
  water.Material = Enum.Material.Water;
  water.Color = spot.color;
  water.Transparency = 0.4;

  // Add swimming force when player enters
  const swimForce = new Instance('BodyVelocity');
  swimForce.Name = 'SwimForce';
  swimForce.MaxForce = new Vector3(0, 0, 0); // Disabled until player enters
  swimForce.Parent = water;

  return water;
}

/**
 * Create a visual fishing spot with water effect and indicator
 */
function createFishingSpot(spot: (typeof FISHING_SPOTS)[0]): Model {
  const model = new Instance('Model');
  model.Name = `FishingSpot_${spot.id}`;

  // Swimmable water
  const water = createSwimmableWater(spot);
  water.Parent = model;

  // Sandy bottom
  const bottom = new Instance('Part');
  bottom.Name = 'Bottom';
  bottom.Size = new Vector3(spot.size.X, 0.5, spot.size.Z);
  bottom.Position = new Vector3(
    spot.position.X,
    spot.waterLevel - spot.size.Y,
    spot.position.Z,
  );
  bottom.Anchored = true;
  bottom.Material = Enum.Material.Sand;
  bottom.BrickColor = new BrickColor('Brick yellow');
  bottom.Parent = model;

  // Shore/beach around water
  const shore = new Instance('Part');
  shore.Name = 'Shore';
  shore.Size = new Vector3(spot.size.X + 6, 0.5, spot.size.Z + 6);
  shore.Position = new Vector3(spot.position.X, 0.25, spot.position.Z);
  shore.Anchored = true;
  shore.Material = Enum.Material.Sand;
  shore.BrickColor = new BrickColor('Brick yellow');
  shore.Parent = model;

  // Glowing edge indicator
  const glow = new Instance('Part');
  glow.Name = 'GlowRing';
  glow.Size = new Vector3(spot.size.X + 4, 0.3, spot.size.Z + 4);
  glow.Position = new Vector3(
    spot.position.X,
    spot.waterLevel + 0.2,
    spot.position.Z,
  );
  glow.Anchored = true;
  glow.CanCollide = false;
  glow.Material = Enum.Material.Neon;
  glow.Color = spot.color;
  glow.Transparency = 0.7;
  glow.Parent = model;

  // Fishing sign
  const signPart = new Instance('Part');
  signPart.Name = 'Sign';
  signPart.Size = new Vector3(3, 0.3, 0.3);
  signPart.Position = new Vector3(
    spot.position.X - spot.size.X / 2 - 2,
    3,
    spot.position.Z - spot.size.Z / 2 - 2,
  );
  signPart.Anchored = true;
  signPart.Material = Enum.Material.Wood;
  signPart.BrickColor = new BrickColor('Brown');
  signPart.Parent = model;

  // Sign post
  const signPost = new Instance('Part');
  signPost.Name = 'SignPost';
  signPost.Size = new Vector3(0.3, 4, 0.3);
  signPost.Position = signPart.Position.add(new Vector3(0, -2, 0));
  signPost.Anchored = true;
  signPost.Material = Enum.Material.Wood;
  signPost.BrickColor = new BrickColor('Brown');
  signPost.Parent = model;

  // Sign text
  const billboard = new Instance('BillboardGui');
  billboard.Name = 'SignLabel';
  billboard.Size = new UDim2(0, 150, 0, 50);
  billboard.StudsOffset = new Vector3(0, 2, 0);
  billboard.AlwaysOnTop = true;
  billboard.Parent = signPart;

  const label = new Instance('TextLabel');
  label.Size = new UDim2(1, 0, 1, 0);
  label.BackgroundColor3 = Color3.fromRGB(40, 60, 80);
  label.BackgroundTransparency = 0.3;
  label.Text = `🎣 ${spot.name}`;
  label.TextColor3 = new Color3(1, 1, 1);
  label.TextScaled = true;
  label.Font = Enum.Font.GothamBold;
  label.Parent = billboard;

  const labelCorner = new Instance('UICorner');
  labelCorner.CornerRadius = new UDim(0, 8);
  labelCorner.Parent = label;

  // Bubble particles in water
  const bubbles = new Instance('ParticleEmitter');
  bubbles.Name = 'Bubbles';
  bubbles.Color = new ColorSequence(new Color3(0.9, 0.95, 1));
  bubbles.Size = new NumberSequence(0.2, 0.5);
  bubbles.Rate = 3;
  bubbles.Lifetime = new NumberRange(3, 5);
  bubbles.Speed = new NumberRange(0.5, 2);
  bubbles.SpreadAngle = new Vector2(30, 30);
  bubbles.Transparency = new NumberSequence(0.3, 1);
  bubbles.Parent = water;

  // Fish swimming (visual only)
  const fishParticles = new Instance('ParticleEmitter');
  fishParticles.Name = 'FishShadows';
  fishParticles.Color = new ColorSequence(Color3.fromRGB(80, 80, 80));
  fishParticles.Size = new NumberSequence(0.5, 1);
  fishParticles.Rate = 1;
  fishParticles.Lifetime = new NumberRange(5, 10);
  fishParticles.Speed = new NumberRange(2, 5);
  fishParticles.SpreadAngle = new Vector2(180, 10);
  fishParticles.Transparency = new NumberSequence(0.7, 0.9);
  fishParticles.Parent = water;

  model.Parent = Workspace;

  // Add pier if this spot has one
  if (spot.hasPier) {
    createPier(spot.position, spot.size);
  }

  return model;
}

/**
 * Create proximity prompt for fishing interaction
 */
function addFishingPrompt(model: Model, spotId: string): void {
  const water = model.FindFirstChild('Water') as Part;
  if (!water) return;

  const prompt = new Instance('ProximityPrompt');
  prompt.ActionText = 'Fish Here';
  prompt.ObjectText = '🎣 Fishing Spot';
  prompt.KeyboardKeyCode = Enum.KeyCode.E;
  prompt.HoldDuration = 0;
  prompt.MaxActivationDistance = 15;
  prompt.RequiresLineOfSight = false;
  prompt.Parent = water;

  // Handle interaction
  prompt.Triggered.Connect((player) => {
    print(`🎣 ${player.Name} started fishing at ${spotId}!`);

    // Fire remote to open fishing UI and set location
    const openFishingRemote = ReplicatedStorage.FindFirstChild(
      'OpenFishingUI',
    ) as RemoteEvent | undefined;
    if (openFishingRemote) {
      openFishingRemote.FireClient(player, spotId);
    }
  });
}

/**
 * Setup all fishing spots in the game world
 */
export function setupFishingSpots(): void {
  print('🎣 Setting up fishing spots...');

  // Create remote for opening fishing UI
  let openRemote = ReplicatedStorage.FindFirstChild('OpenFishingUI') as
    | RemoteEvent
    | undefined;
  if (!openRemote) {
    openRemote = new Instance('RemoteEvent');
    openRemote.Name = 'OpenFishingUI';
    openRemote.Parent = ReplicatedStorage;
  }

  // Create all fishing spots
  for (const spot of FISHING_SPOTS) {
    const model = createFishingSpot(spot);
    addFishingPrompt(model, spot.id);
    print(
      `  ✅ Created ${spot.name} at (${spot.position.X}, ${spot.position.Z})${spot.hasPier ? ' with pier' : ''}`,
    );
  }

  print(`🎣 ${FISHING_SPOTS.size()} fishing spots ready!`);
}

/**
 * Get fishing spot by ID
 */
export function getFishingSpotModel(spotId: string): Model | undefined {
  return Workspace.FindFirstChild(`FishingSpot_${spotId}`) as Model | undefined;
}
