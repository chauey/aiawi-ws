// Fishing Spots - Physical fishing locations in the game world
import { Workspace, ReplicatedStorage } from '@rbxts/services';

// Define fishing spot locations
const FISHING_SPOTS = [
  {
    id: 'starter_pond',
    name: 'Starter Pond',
    position: new Vector3(30, 0, 30),
    size: new Vector3(20, 2, 20),
    color: Color3.fromRGB(50, 150, 200),
    waterLevel: 0.5, // Slightly above ground
    hasPier: false,
  },
  {
    id: 'mystic_lake',
    name: 'Mystic Lake',
    position: new Vector3(-50, 0, -50),
    size: new Vector3(30, 3, 30),
    color: Color3.fromRGB(100, 80, 180),
    waterLevel: 0.5,
    hasPier: true,
  },
  {
    id: 'ocean_pier',
    name: 'Ocean Pier',
    position: new Vector3(80, 0, 0),
    size: new Vector3(40, 3, 30),
    color: Color3.fromRGB(30, 100, 150),
    waterLevel: 0.5,
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
 * Create a proper pond with depression and water
 */
function createPondWithWater(spot: (typeof FISHING_SPOTS)[0]): Model {
  const pond = new Instance('Model');
  pond.Name = 'Pond';

  const pondDepth = 2;
  const edgeThickness = 1;

  // Pond floor (bottom of the pond)
  const floor = new Instance('Part');
  floor.Name = 'PondFloor';
  floor.Size = new Vector3(spot.size.X, 0.5, spot.size.Z);
  floor.Position = new Vector3(spot.position.X, -pondDepth, spot.position.Z);
  floor.Anchored = true;
  floor.Material = Enum.Material.Sand;
  floor.Color = new Color3(0.6, 0.5, 0.3); // Sandy brown
  floor.Parent = pond;

  // Pond walls (4 edges that go into the ground)
  // North wall
  const northWall = new Instance('Part');
  northWall.Name = 'NorthWall';
  northWall.Size = new Vector3(
    spot.size.X + edgeThickness * 2,
    pondDepth,
    edgeThickness,
  );
  northWall.Position = new Vector3(
    spot.position.X,
    -pondDepth / 2,
    spot.position.Z + spot.size.Z / 2 + edgeThickness / 2,
  );
  northWall.Anchored = true;
  northWall.Material = Enum.Material.Slate;
  northWall.Color = new Color3(0.4, 0.35, 0.3); // Stone color
  northWall.Parent = pond;

  // South wall
  const southWall = northWall.Clone();
  southWall.Name = 'SouthWall';
  southWall.Position = new Vector3(
    spot.position.X,
    -pondDepth / 2,
    spot.position.Z - spot.size.Z / 2 - edgeThickness / 2,
  );
  southWall.Parent = pond;

  // East wall
  const eastWall = new Instance('Part');
  eastWall.Name = 'EastWall';
  eastWall.Size = new Vector3(edgeThickness, pondDepth, spot.size.Z);
  eastWall.Position = new Vector3(
    spot.position.X + spot.size.X / 2 + edgeThickness / 2,
    -pondDepth / 2,
    spot.position.Z,
  );
  eastWall.Anchored = true;
  eastWall.Material = Enum.Material.Slate;
  eastWall.Color = new Color3(0.4, 0.35, 0.3);
  eastWall.Parent = pond;

  // West wall
  const westWall = eastWall.Clone();
  westWall.Name = 'WestWall';
  westWall.Position = new Vector3(
    spot.position.X - spot.size.X / 2 - edgeThickness / 2,
    -pondDepth / 2,
    spot.position.Z,
  );
  westWall.Parent = pond;

  // Ground rim around the pond (so it blends with terrain)
  const rim = new Instance('Part');
  rim.Name = 'PondRim';
  rim.Size = new Vector3(spot.size.X + 4, 0.3, spot.size.Z + 4);
  rim.Position = new Vector3(spot.position.X, 0.15, spot.position.Z);
  rim.Anchored = true;
  rim.Material = Enum.Material.Grass;
  rim.Color = new Color3(0.3, 0.5, 0.2); // Grass green
  rim.CanCollide = true;
  rim.Parent = pond;

  // Cut a hole in the rim (make it a frame shape) - use 4 parts
  rim.Transparency = 1; // Hide the full rim

  // North rim piece
  const rimN = new Instance('Part');
  rimN.Name = 'RimNorth';
  rimN.Size = new Vector3(spot.size.X + 4, 0.3, 2);
  rimN.Position = new Vector3(
    spot.position.X,
    0.15,
    spot.position.Z + spot.size.Z / 2 + 1,
  );
  rimN.Anchored = true;
  rimN.Material = Enum.Material.Grass;
  rimN.Color = new Color3(0.3, 0.5, 0.2);
  rimN.Parent = pond;

  // South rim piece
  const rimS = rimN.Clone();
  rimS.Name = 'RimSouth';
  rimS.Position = new Vector3(
    spot.position.X,
    0.15,
    spot.position.Z - spot.size.Z / 2 - 1,
  );
  rimS.Parent = pond;

  // East rim piece
  const rimE = new Instance('Part');
  rimE.Name = 'RimEast';
  rimE.Size = new Vector3(2, 0.3, spot.size.Z);
  rimE.Position = new Vector3(
    spot.position.X + spot.size.X / 2 + 1,
    0.15,
    spot.position.Z,
  );
  rimE.Anchored = true;
  rimE.Material = Enum.Material.Grass;
  rimE.Color = new Color3(0.3, 0.5, 0.2);
  rimE.Parent = pond;

  // West rim piece
  const rimW = rimE.Clone();
  rimW.Name = 'RimWest';
  rimW.Position = new Vector3(
    spot.position.X - spot.size.X / 2 - 1,
    0.15,
    spot.position.Z,
  );
  rimW.Parent = pond;

  // Water (fills the pond)
  const water = new Instance('Part');
  water.Name = 'Water';
  water.Size = new Vector3(spot.size.X, pondDepth - 0.3, spot.size.Z);
  water.Position = new Vector3(
    spot.position.X,
    -pondDepth / 2 + 0.3,
    spot.position.Z,
  );
  water.Anchored = true;
  water.CanCollide = false; // Can swim through
  water.Material = Enum.Material.Glass;
  water.Color = new Color3(0.15, 0.4, 0.7); // Nice deep blue
  water.Transparency = 0.4;
  water.Parent = pond;

  return pond;
}

/**
 * Create a visual fishing spot with water effect and indicator
 */
function createFishingSpot(spot: (typeof FISHING_SPOTS)[0]): Model {
  const model = new Instance('Model');
  model.Name = `FishingSpot_${spot.id}`;

  // Create proper pond with depression and water
  const pond = createPondWithWater(spot);
  pond.Parent = model;

  // Get reference to water for particles
  const water = pond.FindFirstChild('Water') as Part;

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
  // Water is inside the Pond sub-model
  const pond = model.FindFirstChild('Pond') as Model | undefined;
  const water = pond?.FindFirstChild('Water') as Part | undefined;
  if (!water) {
    print(`[FishingSpots] Warning: No water found in ${spotId}`);
    return;
  }

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
