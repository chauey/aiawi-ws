// Fishing Spots - Physical fishing locations in the game world
import { Workspace, ReplicatedStorage } from '@rbxts/services';

// Define fishing spot locations (starter pond near spawn)
const FISHING_SPOTS = [
  {
    id: 'starter_pond',
    name: 'Starter Pond',
    position: new Vector3(30, 1, 30),
    size: new Vector3(20, 3, 20),
    color: Color3.fromRGB(50, 150, 200),
    waterLevel: 0.5,
  },
  {
    id: 'mystic_lake',
    name: 'Mystic Lake',
    position: new Vector3(-50, 1, -50),
    size: new Vector3(30, 3, 30),
    color: Color3.fromRGB(100, 80, 180),
    waterLevel: 0.5,
  },
  {
    id: 'ocean_pier',
    name: 'Ocean Pier',
    position: new Vector3(80, 1, 0),
    size: new Vector3(40, 3, 15),
    color: Color3.fromRGB(30, 100, 150),
    waterLevel: 0.5,
  },
];

/**
 * Create a visual fishing spot with water effect and indicator
 */
function createFishingSpot(spot: (typeof FISHING_SPOTS)[0]): Model {
  const model = new Instance('Model');
  model.Name = `FishingSpot_${spot.id}`;

  // Water surface
  const water = new Instance('Part');
  water.Name = 'Water';
  water.Size = spot.size;
  water.Position = new Vector3(
    spot.position.X,
    spot.waterLevel,
    spot.position.Z,
  );
  water.Anchored = true;
  water.CanCollide = false;
  water.Material = Enum.Material.Water;
  water.BrickColor = new BrickColor('Bright blue');
  water.Transparency = 0.3;
  water.Parent = model;

  // Glowing edge indicator
  const glow = new Instance('Part');
  glow.Name = 'GlowRing';
  glow.Size = new Vector3(spot.size.X + 2, 0.5, spot.size.Z + 2);
  glow.Position = new Vector3(
    spot.position.X,
    spot.waterLevel + 0.1,
    spot.position.Z,
  );
  glow.Anchored = true;
  glow.CanCollide = false;
  glow.Material = Enum.Material.Neon;
  glow.Color = spot.color;
  glow.Transparency = 0.5;
  glow.Parent = model;

  // Fishing sign
  const signPart = new Instance('Part');
  signPart.Name = 'Sign';
  signPart.Size = new Vector3(3, 0.3, 0.3);
  signPart.Position = new Vector3(
    spot.position.X - spot.size.X / 2 - 1,
    3,
    spot.position.Z - spot.size.Z / 2 - 1,
  );
  signPart.Anchored = true;
  signPart.Material = Enum.Material.Wood;
  signPart.BrickColor = new BrickColor('Brown');
  signPart.Parent = model;

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

  // Particles for visual interest
  const particles = new Instance('ParticleEmitter');
  particles.Color = new ColorSequence(spot.color);
  particles.Size = new NumberSequence(0.5);
  particles.Rate = 5;
  particles.Lifetime = new NumberRange(2, 3);
  particles.Speed = new NumberRange(0.5, 1);
  particles.SpreadAngle = new Vector2(180, 180);
  particles.Parent = water;

  model.Parent = Workspace;
  return model;
}

/**
 * Create proximity prompt for fishing interaction
 */
function addFishingPrompt(model: Model, spotId: string): void {
  const water = model.FindFirstChild('Water') as Part;
  if (!water) return;

  const prompt = new Instance('ProximityPrompt');
  prompt.ActionText = 'Fish';
  prompt.ObjectText = 'Fishing Spot';
  prompt.KeyboardKeyCode = Enum.KeyCode.E;
  prompt.HoldDuration = 0;
  prompt.MaxActivationDistance = 10;
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
      `  ✅ Created ${spot.name} at (${spot.position.X}, ${spot.position.Z})`,
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
