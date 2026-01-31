/**
 * Fishing UI - Lucky Fish Legends
 * Client-side fishing interface
 */

import {
  Players,
  ReplicatedStorage,
  TweenService,
  UserInputService,
  Workspace,
} from '@rbxts/services';

// Remote references
let remotes: {
  castLine?: RemoteEvent;
  reelIn?: RemoteEvent;
  sellFish?: RemoteEvent;
  equipRod?: RemoteEvent;
  equipBait?: RemoteEvent;
  getStats?: RemoteFunction;
  getCollection?: RemoteFunction;
  getInventory?: RemoteFunction;
  changeLocation?: RemoteEvent;
};

// Current state
const currentState = {
  isFishing: false,
  isBiting: false,
  isReeling: false,
  currentLocationId: 'starter_pond',
  currentLevel: 1,
};

// Fish inventory - stores caught fish
interface CaughtFish {
  name: string;
  rarity: string;
  weight: number;
  value: number;
  caughtAt: number; // tick time
}
const fishInventory: CaughtFish[] = [];
let totalCoins = 0;

// UI references
let mainFrame: Frame;
let castButton: TextButton;
let reelButton: TextButton;
let bobber: ImageLabel;
let statusLabel: TextLabel;
let statsFrame: Frame;
let inventoryFrame: Frame;
let collectionFrame: Frame;
let locationFrame: Frame;

// Reeling minigame UI
let reelingProgressBar: Frame;
let reelingProgressBackground: Frame;
let clickCounterLabel: TextLabel;
let reelingClickCount = 0;
const REEL_CLICKS_REQUIRED = 15;

// 3D Fishing visuals
let fishingLine: Part | undefined;
let floatingBobber: Part | undefined;

// Fish rarity colors
const RARITY_COLORS = {
  common: new Color3(0.6, 0.6, 0.6),
  uncommon: new Color3(0.2, 0.8, 0.2),
  rare: new Color3(0.2, 0.4, 1),
  epic: new Color3(0.6, 0.2, 0.8),
  legendary: new Color3(1, 0.8, 0.2),
  mythic: new Color3(1, 0.2, 0.2),
};

// Quality colors
const QUALITY_COLORS = {
  poor: new Color3(0.5, 0.5, 0.5),
  normal: new Color3(0.2, 0.8, 0.2),
  good: new Color3(0.2, 0.4, 1),
  perfect: new Color3(0.8, 0.2, 1),
};

/**
 * Create the fishing UI
 */
function createFishingUI(): ScreenGui {
  const player = Players.LocalPlayer;
  const playerGui = player.WaitForChild('PlayerGui') as PlayerGui;

  const screenGui = new Instance('ScreenGui');
  screenGui.Name = 'FishingUI';
  screenGui.ResetOnSpawn = false;
  screenGui.Parent = playerGui;

  // Main container - positioned above action bar
  mainFrame = new Instance('Frame');
  mainFrame.Name = 'MainFrame';
  mainFrame.Size = new UDim2(0, 350, 0, 200);
  mainFrame.Position = new UDim2(0.5, -175, 1, -320); // Higher to avoid action bar
  mainFrame.BackgroundColor3 = new Color3(0.1, 0.15, 0.25);
  mainFrame.BackgroundTransparency = 0.1;
  mainFrame.BorderSizePixel = 0;
  mainFrame.Parent = screenGui;

  // Corner radius
  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 16);
  corner.Parent = mainFrame;

  // Title
  const title = new Instance('TextLabel');
  title.Name = 'Title';
  title.Size = new UDim2(1, 0, 0, 30);
  title.Position = new UDim2(0, 0, 0, 5);
  title.BackgroundTransparency = 1;
  title.Text = '🎣 Lucky Fish Legends';
  title.TextColor3 = new Color3(1, 1, 1);
  title.TextSize = 18;
  title.Font = Enum.Font.GothamBold;
  title.Parent = mainFrame;

  // Status label
  statusLabel = new Instance('TextLabel');
  statusLabel.Name = 'Status';
  statusLabel.Size = new UDim2(1, -20, 0, 25);
  statusLabel.Position = new UDim2(0, 10, 0, 35);
  statusLabel.BackgroundTransparency = 1;
  statusLabel.Text = 'Ready to fish!';
  statusLabel.TextColor3 = new Color3(0.8, 0.9, 1);
  statusLabel.TextSize = 14;
  statusLabel.Font = Enum.Font.Gotham;
  statusLabel.Parent = mainFrame;

  // Bobber indicator
  bobber = new Instance('ImageLabel');
  bobber.Name = 'Bobber';
  bobber.Size = new UDim2(0, 50, 0, 50);
  bobber.Position = new UDim2(0.5, -25, 0, 55);
  bobber.BackgroundTransparency = 1;
  bobber.Image = 'rbxassetid://6031094667'; // Default circle
  bobber.ImageColor3 = new Color3(1, 0.4, 0.2);
  bobber.Visible = false;
  bobber.Parent = mainFrame;

  // Reeling progress bar (for click minigame)
  const progressBackground = new Instance('Frame');
  progressBackground.Name = 'ProgressBackground';
  progressBackground.Size = new UDim2(0.8, 0, 0, 12);
  progressBackground.Position = new UDim2(0.1, 0, 0, 95);
  progressBackground.BackgroundColor3 = new Color3(0.2, 0.2, 0.3);
  progressBackground.BorderSizePixel = 0;
  progressBackground.Visible = false;
  progressBackground.Parent = mainFrame;

  const progressCorner = new Instance('UICorner');
  progressCorner.CornerRadius = new UDim(0, 6);
  progressCorner.Parent = progressBackground;

  reelingProgressBar = new Instance('Frame');
  reelingProgressBar.Name = 'ProgressFill';
  reelingProgressBar.Size = new UDim2(0, 0, 1, 0);
  reelingProgressBar.Position = new UDim2(0, 0, 0, 0);
  reelingProgressBar.BackgroundColor3 = new Color3(0.2, 0.8, 0.3);
  reelingProgressBar.BorderSizePixel = 0;
  reelingProgressBar.Parent = progressBackground;

  const progressFillCorner = new Instance('UICorner');
  progressFillCorner.CornerRadius = new UDim(0, 6);
  progressFillCorner.Parent = reelingProgressBar;

  reelingProgressBackground = progressBackground;

  // Click counter label
  clickCounterLabel = new Instance('TextLabel');
  clickCounterLabel.Name = 'ClickCounter';
  clickCounterLabel.Size = new UDim2(0.8, 0, 0, 20);
  clickCounterLabel.Position = new UDim2(0.1, 0, 0, 73);
  clickCounterLabel.BackgroundTransparency = 1;
  clickCounterLabel.Text = 'Click fast to reel! 0/20';
  clickCounterLabel.TextColor3 = new Color3(1, 1, 0.5);
  clickCounterLabel.TextSize = 12;
  clickCounterLabel.Font = Enum.Font.GothamBold;
  clickCounterLabel.Visible = false;
  clickCounterLabel.Parent = mainFrame;

  // Cast button
  castButton = createButton(
    'CastButton',
    '🎣 Cast Line',
    new UDim2(0, 150, 0, 45),
    new UDim2(0, 15, 1, -60),
  );
  castButton.Parent = mainFrame;
  castButton.MouseButton1Click.Connect(onCastClick);

  // Reel button
  reelButton = createButton(
    'ReelButton',
    '🐟 Reel In!',
    new UDim2(0, 150, 0, 45),
    new UDim2(1, -165, 1, -60),
  );
  reelButton.BackgroundColor3 = new Color3(0.3, 0.3, 0.4);
  reelButton.Parent = mainFrame;
  reelButton.MouseButton1Click.Connect(onReelClick);

  // Stats button row
  const statsBtn = createSmallButton(
    '📊',
    new UDim2(0, 40, 0, 40),
    new UDim2(0, 15, 0, 115),
  );
  statsBtn.Parent = mainFrame;
  statsBtn.MouseButton1Click.Connect(toggleStats);

  const inventoryBtn = createSmallButton(
    '🎒',
    new UDim2(0, 40, 0, 40),
    new UDim2(0, 60, 0, 115),
  );
  inventoryBtn.Parent = mainFrame;
  inventoryBtn.MouseButton1Click.Connect(toggleInventory);

  const collectionBtn = createSmallButton(
    '📚',
    new UDim2(0, 40, 0, 40),
    new UDim2(0, 105, 0, 115),
  );
  collectionBtn.Parent = mainFrame;
  collectionBtn.MouseButton1Click.Connect(toggleCollection);

  const locationBtn = createSmallButton(
    '🗺️',
    new UDim2(0, 40, 0, 40),
    new UDim2(0, 150, 0, 115),
  );
  locationBtn.Parent = mainFrame;
  locationBtn.MouseButton1Click.Connect(toggleLocations);

  // Create sub-panels (hidden by default)
  statsFrame = createPanel('StatsPanel', '📊 Stats', new UDim2(0, 250, 0, 200));
  statsFrame.Parent = screenGui;

  inventoryFrame = createPanel(
    'InventoryPanel',
    '🎒 Inventory',
    new UDim2(0, 300, 0, 350),
  );
  inventoryFrame.Parent = screenGui;

  collectionFrame = createPanel(
    'CollectionPanel',
    '📚 Collection',
    new UDim2(0, 400, 0, 400),
  );
  collectionFrame.Parent = screenGui;

  locationFrame = createPanel(
    'LocationPanel',
    '🗺️ Locations',
    new UDim2(0, 300, 0, 350),
  );
  locationFrame.Parent = screenGui;

  return screenGui;
}

/**
 * Create a button
 */
function createButton(
  name: string,
  text: string,
  size: UDim2,
  position: UDim2,
): TextButton {
  const button = new Instance('TextButton');
  button.Name = name;
  button.Size = size;
  button.Position = position;
  button.BackgroundColor3 = new Color3(0.2, 0.5, 0.8);
  button.BorderSizePixel = 0;
  button.Text = text;
  button.TextColor3 = new Color3(1, 1, 1);
  button.TextSize = 16;
  button.Font = Enum.Font.GothamBold;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 10);
  corner.Parent = button;

  return button;
}

/**
 * Create a small icon button
 */
function createSmallButton(
  emoji: string,
  size: UDim2,
  position: UDim2,
): TextButton {
  const button = new Instance('TextButton');
  button.Size = size;
  button.Position = position;
  button.BackgroundColor3 = new Color3(0.15, 0.2, 0.3);
  button.BorderSizePixel = 0;
  button.Text = emoji;
  button.TextSize = 20;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 8);
  corner.Parent = button;

  return button;
}

/**
 * Create a panel
 */
function createPanel(name: string, title: string, size: UDim2): Frame {
  const panel = new Instance('Frame');
  panel.Name = name;
  panel.Size = size;
  panel.Position = new UDim2(0.5, -size.X.Offset / 2, 0.5, -size.Y.Offset / 2);
  panel.BackgroundColor3 = new Color3(0.08, 0.12, 0.2);
  panel.BorderSizePixel = 0;
  panel.Visible = false;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 12);
  corner.Parent = panel;

  const titleLabel = new Instance('TextLabel');
  titleLabel.Name = 'Title';
  titleLabel.Size = new UDim2(1, -50, 0, 35);
  titleLabel.Position = new UDim2(0, 10, 0, 5);
  titleLabel.BackgroundTransparency = 1;
  titleLabel.Text = title;
  titleLabel.TextColor3 = new Color3(1, 1, 1);
  titleLabel.TextSize = 18;
  titleLabel.Font = Enum.Font.GothamBold;
  titleLabel.TextXAlignment = Enum.TextXAlignment.Left;
  titleLabel.Parent = panel;

  const closeBtn = new Instance('TextButton');
  closeBtn.Name = 'CloseButton';
  closeBtn.Size = new UDim2(0, 35, 0, 35);
  closeBtn.Position = new UDim2(1, -40, 0, 5);
  closeBtn.BackgroundColor3 = new Color3(0.5, 0.2, 0.2);
  closeBtn.BorderSizePixel = 0;
  closeBtn.Text = '✕';
  closeBtn.TextColor3 = new Color3(1, 1, 1);
  closeBtn.TextSize = 16;
  closeBtn.Parent = panel;

  const closeCorner = new Instance('UICorner');
  closeCorner.CornerRadius = new UDim(0, 8);
  closeCorner.Parent = closeBtn;

  closeBtn.MouseButton1Click.Connect(() => {
    panel.Visible = false;
  });

  const scrolling = new Instance('ScrollingFrame');
  scrolling.Name = 'Content';
  scrolling.Size = new UDim2(1, -20, 1, -50);
  scrolling.Position = new UDim2(0, 10, 0, 45);
  scrolling.BackgroundTransparency = 1;
  scrolling.BorderSizePixel = 0;
  scrolling.ScrollBarThickness = 6;
  scrolling.Parent = panel;

  const layout = new Instance('UIListLayout');
  layout.SortOrder = Enum.SortOrder.LayoutOrder;
  layout.Padding = new UDim(0, 5);
  layout.Parent = scrolling;

  return panel;
}

// ==================== 3D FISHING VISUALS ====================

// Reference to rod model (not a Tool - avoids hotbar)
let fishingRodModel: Model | undefined;

/**
 * Create the fishing rod as a Model (not Tool - avoids hotbar overlap)
 */
function createFishingRod(): Model {
  const rod = new Instance('Model');
  rod.Name = 'FishingRod';

  // Create handle (the rod)
  const handle = new Instance('Part');
  handle.Name = 'Handle';
  handle.Size = new Vector3(0.2, 0.2, 3);
  handle.Color = new Color3(0.4, 0.25, 0.1); // Wood brown
  handle.Material = Enum.Material.Wood;
  handle.CanCollide = false;
  handle.Anchored = false;
  handle.Parent = rod;

  // Rod tip (thinner)
  const tip = new Instance('Part');
  tip.Name = 'Tip';
  tip.Size = new Vector3(0.1, 0.1, 1.5);
  tip.Color = new Color3(0.3, 0.3, 0.3);
  tip.Material = Enum.Material.Metal;
  tip.CanCollide = false;
  tip.Parent = rod;

  const tipWeld = new Instance('WeldConstraint');
  tipWeld.Part0 = handle;
  tipWeld.Part1 = tip;
  tipWeld.Parent = tip;
  tip.CFrame = handle.CFrame.mul(new CFrame(0, 0, -2.25));

  // Reel on rod
  const reel = new Instance('Part');
  reel.Name = 'Reel';
  reel.Shape = Enum.PartType.Cylinder;
  reel.Size = new Vector3(0.3, 0.25, 0.25);
  reel.Color = new Color3(0.6, 0.6, 0.6);
  reel.Material = Enum.Material.Metal;
  reel.CanCollide = false;
  reel.Parent = rod;

  const reelWeld = new Instance('WeldConstraint');
  reelWeld.Part0 = handle;
  reelWeld.Part1 = reel;
  reelWeld.Parent = reel;
  reel.CFrame = handle.CFrame.mul(new CFrame(0.2, 0, 0.8));

  rod.PrimaryPart = handle;
  return rod;
}

/**
 * Show the fishing rod attached to character's hand
 */
function showFishingRod(): void {
  const player = Players.LocalPlayer;
  const character = player.Character;
  if (!character) {
    print('[FishingUI] No character found for rod!');
    return;
  }

  // Clean up old rod
  if (fishingRodModel) {
    fishingRodModel.Destroy();
    fishingRodModel = undefined;
  }

  // Create new rod
  fishingRodModel = createFishingRod();

  // Get root part for positioning
  const rootPart = character.FindFirstChild('HumanoidRootPart') as
    | Part
    | undefined;
  if (!rootPart) {
    print('[FishingUI] No HumanoidRootPart found!');
    return;
  }

  // Parent to workspace
  fishingRodModel.Parent = Workspace;

  if (fishingRodModel.PrimaryPart) {
    // Position rod in front and to the right of player, pointing forward
    // Rod should be visible sticking out in front
    const playerCFrame = rootPart.CFrame;
    const rodOffset = new CFrame(1.5, 0.5, -2); // Right, up, forward
    const rodRotation = CFrame.Angles(math.rad(30), 0, math.rad(-15)); // Tilt up and slightly right

    fishingRodModel.PrimaryPart.Anchored = true;
    fishingRodModel.PrimaryPart.CFrame = playerCFrame
      .mul(rodOffset)
      .mul(rodRotation);

    print(
      '[FishingUI] 🎣 Fishing Rod shown at',
      fishingRodModel.PrimaryPart.Position,
    );
  }
}

/**
 * Hide the fishing rod
 */
function hideFishingRod(): void {
  if (fishingRodModel) {
    fishingRodModel.Destroy();
    fishingRodModel = undefined;
  }
}

/**
 * Cast the fishing line into the water
 */
function showCastingVisuals(): void {
  const player = Players.LocalPlayer;
  const character = player.Character;
  if (!character) return;

  const rootPart = character.FindFirstChild('HumanoidRootPart') as Part;
  if (!rootPart) return;

  showFishingRod();

  // Create bobber in world
  if (!floatingBobber) {
    floatingBobber = new Instance('Part');
    floatingBobber.Name = 'FloatingBobber';
    floatingBobber.Shape = Enum.PartType.Ball;
    floatingBobber.Size = new Vector3(0.8, 0.8, 0.8);
    floatingBobber.Color = new Color3(1, 0.3, 0.1); // Orange/red
    floatingBobber.Material = Enum.Material.Plastic;
    floatingBobber.Anchored = true;
    floatingBobber.CanCollide = false;
    floatingBobber.Parent = Workspace;
  }

  // Position bobber in front of player
  const forwardOffset = rootPart.CFrame.LookVector.mul(15);
  floatingBobber.Position = rootPart.Position.add(forwardOffset).add(
    new Vector3(0, -2, 0),
  );

  // Create fishing line
  if (!fishingLine) {
    fishingLine = new Instance('Part');
    fishingLine.Name = 'FishingLine';
    fishingLine.Size = new Vector3(0.05, 0.05, 15);
    fishingLine.Color = new Color3(0.9, 0.9, 0.9); // Nearly transparent white
    fishingLine.Transparency = 0.5;
    fishingLine.Material = Enum.Material.Neon;
    fishingLine.Anchored = true;
    fishingLine.CanCollide = false;
    fishingLine.Parent = Workspace;
  }

  // Position line between rod and bobber
  const rightHand = character.FindFirstChild('RightHand') as Part | undefined;
  const handPos =
    rightHand?.Position ?? rootPart.Position.add(new Vector3(0, 3, 0));
  const bobberPos = floatingBobber.Position;
  const midPoint = handPos.add(bobberPos).div(2);
  const distance = handPos.sub(bobberPos).Magnitude;

  fishingLine.Size = new Vector3(0.05, 0.05, distance);
  fishingLine.CFrame = CFrame.lookAt(midPoint, bobberPos);

  // Create hook underneath bobber
  const hook = new Instance('Part');
  hook.Name = 'Hook';
  hook.Size = new Vector3(0.2, 0.4, 0.1);
  hook.Color = new Color3(0.5, 0.5, 0.5); // Silver/gray
  hook.Material = Enum.Material.Metal;
  hook.Anchored = true;
  hook.CanCollide = false;
  hook.Position = floatingBobber.Position.add(new Vector3(0, -0.8, 0));
  hook.Parent = floatingBobber; // Parent to bobber so it moves with it

  // Create splash effect at bobber location
  createSplashEffect(floatingBobber.Position);

  print('[FishingUI] 🎣 Cast line into water!');
}

/**
 * Create splash particle effect
 */
function createSplashEffect(position: Vector3): void {
  // Create splash particles
  const splashPart = new Instance('Part');
  splashPart.Name = 'Splash';
  splashPart.Size = new Vector3(0.5, 0.5, 0.5);
  splashPart.Transparency = 1;
  splashPart.Anchored = true;
  splashPart.CanCollide = false;
  splashPart.Position = position;
  splashPart.Parent = Workspace;

  // Add particle emitter
  const particles = new Instance('ParticleEmitter');
  particles.Name = 'SplashParticles';
  particles.Color = new ColorSequence(new Color3(0.7, 0.85, 1)); // Light blue water
  particles.Size = new NumberSequence(0.5, 0);
  particles.Transparency = new NumberSequence(0, 1);
  particles.Lifetime = new NumberRange(0.3, 0.6);
  particles.Rate = 0; // We'll emit manually
  particles.Speed = new NumberRange(5, 10);
  particles.SpreadAngle = new Vector2(45, 45);
  particles.Parent = splashPart;

  // Emit splash particles
  particles.Emit(20);

  // Create water ring effect
  const ring = new Instance('Part');
  ring.Name = 'SplashRing';
  ring.Shape = Enum.PartType.Cylinder;
  ring.Size = new Vector3(0.1, 2, 2);
  ring.Orientation = new Vector3(0, 0, 90);
  ring.Color = new Color3(0.8, 0.9, 1);
  ring.Material = Enum.Material.Neon;
  ring.Transparency = 0.5;
  ring.Anchored = true;
  ring.CanCollide = false;
  ring.Position = position.add(new Vector3(0, 0.1, 0));
  ring.Parent = Workspace;

  // Animate ring expanding
  task.spawn(() => {
    for (let i = 0; i < 10; i++) {
      ring.Size = new Vector3(0.1, 2 + i, 2 + i);
      ring.Transparency = 0.5 + i * 0.05;
      task.wait(0.05);
    }
    ring.Destroy();
  });

  // Clean up splash part after particles finish
  task.delay(1, () => splashPart.Destroy());
}

/**
 * Hide fishing visuals when done
 */
function hideCastingVisuals(): void {
  hideFishingRod();
  if (floatingBobber) {
    floatingBobber.Destroy();
    floatingBobber = undefined;
  }
  if (fishingLine) {
    fishingLine.Destroy();
    fishingLine = undefined;
  }
  print('[FishingUI] 🎣 Reeled in line!');
}

/**
 * Animate bobber when fish bites (3D)
 */
function animateBobber3D(): void {
  if (!floatingBobber) return;

  // Bob up and down
  const originalY = floatingBobber.Position.Y;

  task.spawn(() => {
    for (let i = 0; i < 10; i++) {
      if (!floatingBobber) break;
      const offset = math.sin(i * 2) * 0.5;
      floatingBobber.Position = new Vector3(
        floatingBobber.Position.X,
        originalY + offset,
        floatingBobber.Position.Z,
      );
      task.wait(0.1);
    }
  });
}

// ==================== FISH DATA (Client-side simulation) ====================

const FISH_TYPES = [
  // Common (40%)
  {
    name: 'Goldfish',
    rarity: 'common',
    minWeight: 0.1,
    maxWeight: 0.5,
    value: 5,
  },
  { name: 'Carp', rarity: 'common', minWeight: 0.5, maxWeight: 2, value: 10 },
  {
    name: 'Minnow',
    rarity: 'common',
    minWeight: 0.05,
    maxWeight: 0.2,
    value: 3,
  },
  { name: 'Sunfish', rarity: 'common', minWeight: 0.2, maxWeight: 1, value: 8 },
  { name: 'Perch', rarity: 'common', minWeight: 0.3, maxWeight: 1.5, value: 7 },

  // Uncommon (25%)
  { name: 'Bass', rarity: 'uncommon', minWeight: 1, maxWeight: 4, value: 25 },
  {
    name: 'Trout',
    rarity: 'uncommon',
    minWeight: 0.5,
    maxWeight: 3,
    value: 20,
  },
  {
    name: 'Walleye',
    rarity: 'uncommon',
    minWeight: 1,
    maxWeight: 5,
    value: 30,
  },
  {
    name: 'Crappie',
    rarity: 'uncommon',
    minWeight: 0.5,
    maxWeight: 2,
    value: 18,
  },
  {
    name: 'Bluegill',
    rarity: 'uncommon',
    minWeight: 0.3,
    maxWeight: 1.5,
    value: 15,
  },

  // Rare (20%)
  { name: 'Catfish', rarity: 'rare', minWeight: 2, maxWeight: 8, value: 50 },
  { name: 'Pike', rarity: 'rare', minWeight: 3, maxWeight: 10, value: 75 },
  { name: 'Salmon', rarity: 'rare', minWeight: 4, maxWeight: 15, value: 80 },
  { name: 'Sturgeon', rarity: 'rare', minWeight: 5, maxWeight: 20, value: 90 },
  { name: 'Muskie', rarity: 'rare', minWeight: 5, maxWeight: 15, value: 85 },

  // Epic (10%)
  {
    name: 'Swordfish',
    rarity: 'epic',
    minWeight: 10,
    maxWeight: 50,
    value: 200,
  },
  { name: 'Marlin', rarity: 'epic', minWeight: 20, maxWeight: 100, value: 300 },
  { name: 'Tuna', rarity: 'epic', minWeight: 15, maxWeight: 60, value: 250 },
  {
    name: 'Mahi-Mahi',
    rarity: 'epic',
    minWeight: 8,
    maxWeight: 35,
    value: 180,
  },

  // Legendary (4%)
  {
    name: 'Lucky Koi',
    rarity: 'legendary',
    minWeight: 1,
    maxWeight: 5,
    value: 500,
  },
  {
    name: 'Rainbow Trout',
    rarity: 'legendary',
    minWeight: 3,
    maxWeight: 12,
    value: 600,
  },
  {
    name: 'Spirit Eel',
    rarity: 'legendary',
    minWeight: 5,
    maxWeight: 20,
    value: 750,
  },
  {
    name: 'Crystal Bass',
    rarity: 'legendary',
    minWeight: 2,
    maxWeight: 8,
    value: 550,
  },

  // Mythic (1%)
  {
    name: 'Golden Dragon Fish',
    rarity: 'mythic',
    minWeight: 5,
    maxWeight: 20,
    value: 2000,
  },
  {
    name: 'Ancient Leviathan',
    rarity: 'mythic',
    minWeight: 50,
    maxWeight: 200,
    value: 5000,
  },
  {
    name: 'Phoenix Koi',
    rarity: 'mythic',
    minWeight: 3,
    maxWeight: 15,
    value: 3000,
  },
];

/**
 * Simulate catching a fish (client-side, no server needed)
 */
function simulateCatch():
  | { name: string; rarity: string; weight: number; value: number }
  | undefined {
  // Random rarity roll
  const roll = math.random();
  let targetRarity: string;

  if (roll < 0.01)
    targetRarity = 'mythic'; // 1%
  else if (roll < 0.05)
    targetRarity = 'legendary'; // 4%
  else if (roll < 0.15)
    targetRarity = 'epic'; // 10%
  else if (roll < 0.35)
    targetRarity = 'rare'; // 20%
  else if (roll < 0.6)
    targetRarity = 'uncommon'; // 25%
  else targetRarity = 'common'; // 40%

  // Find fish of that rarity
  const fishPool = FISH_TYPES.filter((f) => f.rarity === targetRarity);
  if (fishPool.size() === 0) return undefined;

  const fish = fishPool[math.random(0, fishPool.size() - 1)];
  const weight =
    math.random() * (fish.maxWeight - fish.minWeight) + fish.minWeight;

  return {
    name: fish.name,
    rarity: fish.rarity,
    weight: math.floor(weight * 100) / 100, // 2 decimal places
    value: math.floor(fish.value * (1 + weight / fish.maxWeight)),
  };
}

// ==================== BUTTON HANDLERS ====================

/**
 * Cast line handler
 */
function onCastClick(): void {
  if (currentState.isFishing) {
    updateStatus('Already fishing...');
    return;
  }

  // Show 3D visuals
  showCastingVisuals();

  // Fire to server if available
  remotes?.castLine?.FireServer(currentState.currentLocationId);
  updateStatus('🎣 Casting line... wait for a bite!');
  currentState.isFishing = true;
  updateButtonStates();

  // Client-side simulation: simulate a bite after 2-5 seconds
  const waitTime = math.random(2, 5);
  task.delay(waitTime, () => {
    if (currentState.isFishing) {
      currentState.isBiting = true;
      updateStatus('🐟 A fish is biting! Click Reel to catch it!');
      updateButtonStates();
      animateBobber3D();
    }
  });
}

/**
 * Reel in handler - starts the clicking minigame
 */
function onReelClick(): void {
  if (!currentState.isFishing) {
    updateStatus('Cast your line first!');
    return;
  }

  // If minigame already in progress, count the click
  if (currentState.isReeling) {
    handleReelingClick();
    return;
  }

  // If fish isn't biting, can't start minigame
  if (!currentState.isBiting) {
    updateStatus('No fish biting yet... wait for a bite!');
    return;
  }

  // Start the clicking minigame!
  startReelingMinigame();
}

/**
 * Start the reeling minigame
 */
function startReelingMinigame(): void {
  currentState.isReeling = true;
  reelingClickCount = 0;

  // Show minigame UI
  reelingProgressBackground.Visible = true;
  clickCounterLabel.Visible = true;
  bobber.Visible = false;

  updateReelingProgress();
  updateStatus('🎣 CLICK FAST TO REEL IN! 🎣');

  // Give them a time limit (5 seconds)
  task.delay(5, () => {
    if (currentState.isReeling) {
      // Time's up! Fish got away
      endReelingMinigame(false);
    }
  });
}

/**
 * Handle a click during the reeling minigame
 */
function handleReelingClick(): void {
  reelingClickCount++;
  updateReelingProgress();

  // Visual feedback for click
  reelingProgressBar.BackgroundColor3 = new Color3(0.4, 1, 0.5);
  task.delay(0.05, () => {
    reelingProgressBar.BackgroundColor3 = new Color3(0.2, 0.8, 0.3);
  });

  if (reelingClickCount >= REEL_CLICKS_REQUIRED) {
    // Success! Caught the fish!
    endReelingMinigame(true);
  }
}

/**
 * Update the reeling progress bar
 */
function updateReelingProgress(): void {
  const progress = reelingClickCount / REEL_CLICKS_REQUIRED;
  reelingProgressBar.Size = new UDim2(progress, 0, 1, 0);
  clickCounterLabel.Text = `Click fast to reel! ${reelingClickCount}/${REEL_CLICKS_REQUIRED}`;

  // Change color based on progress
  if (progress > 0.7) {
    reelingProgressBar.BackgroundColor3 = new Color3(0.2, 1, 0.3);
    clickCounterLabel.Text = `Almost there! ${reelingClickCount}/${REEL_CLICKS_REQUIRED}`;
  } else if (progress > 0.4) {
    reelingProgressBar.BackgroundColor3 = new Color3(0.8, 0.8, 0.2);
  }
}

/**
 * End the reeling minigame
 */
function endReelingMinigame(success: boolean): void {
  currentState.isReeling = false;

  // Hide minigame UI
  reelingProgressBackground.Visible = false;
  clickCounterLabel.Visible = false;

  remotes?.reelIn?.FireServer();

  if (success) {
    updateStatus('🎣 Reeling in...');
    animateReeling();

    // Catch the fish!
    const fish = simulateCatch();
    if (fish) {
      const rarityColor =
        RARITY_COLORS[fish.rarity as keyof typeof RARITY_COLORS] ??
        new Color3(1, 1, 1);

      // Add to inventory!
      const caughtFish: CaughtFish = {
        name: fish.name,
        rarity: fish.rarity,
        weight: fish.weight,
        value: fish.value,
        caughtAt: tick(),
      };
      fishInventory.push(caughtFish);
      totalCoins += fish.value;

      // Update inventory display
      updateInventoryPanel();

      // Show fish model!
      showCaughtFish(fish.name, fish.rarity, fish.weight);

      statusLabel.TextColor3 = rarityColor;
      updateStatus(
        `🎉 Caught a ${fish.rarity.upper()} ${fish.name}! (${fish.weight}kg) +${fish.value} coins! (Total: ${totalCoins})`,
      );

      print(
        `[FishingUI] 📦 Added ${fish.name} to inventory. Total fish: ${fishInventory.size()}, Coins: ${totalCoins}`,
      );

      // Reset color after 3 seconds
      task.delay(3, () => {
        statusLabel.TextColor3 = new Color3(0.9, 0.9, 0.9);
      });
    }
  } else {
    updateStatus('😢 The fish got away! Click faster next time!');
  }

  // Hide 3D visuals after delay
  task.delay(1.5, () => {
    hideCastingVisuals();
  });

  currentState.isFishing = false;
  currentState.isBiting = false;
  reelingClickCount = 0;
  updateButtonStates();
}

/**
 * Animate the fishing line reeling in
 */
function animateReeling(): void {
  if (!fishingLine || !floatingBobber) return;

  const player = Players.LocalPlayer;
  const character = player.Character;
  if (!character) return;

  const rootPart = character.FindFirstChild('HumanoidRootPart') as Part;
  if (!rootPart) return;

  // Animate bobber coming towards player
  task.spawn(() => {
    const startPos = floatingBobber!.Position;
    const endPos = rootPart.Position.add(new Vector3(0, 1, 0));

    for (let i = 0; i <= 10; i++) {
      if (!floatingBobber || !fishingLine) break;

      const t = i / 10;
      const newPos = startPos.Lerp(endPos, t);
      floatingBobber.Position = newPos;

      // Update line
      const rightHand = character.FindFirstChild('RightHand') as
        | Part
        | undefined;
      const handPos =
        rightHand?.Position ?? rootPart.Position.add(new Vector3(0, 3, 0));
      const midPoint = handPos.add(newPos).div(2);
      const distance = handPos.sub(newPos).Magnitude;

      fishingLine.Size = new Vector3(0.05, 0.05, distance);
      fishingLine.CFrame = CFrame.lookAt(midPoint, newPos);

      task.wait(0.05);
    }
  });
}

/**
 * Show the caught fish model
 */
function showCaughtFish(name: string, rarity: string, weight: number): void {
  const player = Players.LocalPlayer;
  const character = player.Character;
  if (!character) return;

  const rootPart = character.FindFirstChild('HumanoidRootPart') as Part;
  if (!rootPart) return;

  // Get rarity color
  const rarityColor =
    RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] ??
    new Color3(0.5, 0.5, 0.5);

  // Create fish model (simple ellipsoid)
  const fishModel = new Instance('Part');
  fishModel.Name = 'CaughtFish';
  fishModel.Shape = Enum.PartType.Ball;
  fishModel.Size = new Vector3(
    weight * 0.5 + 0.5,
    weight * 0.3 + 0.3,
    weight * 0.8 + 0.8,
  ); // Size based on weight
  fishModel.Color = rarityColor;
  fishModel.Material = Enum.Material.SmoothPlastic;
  fishModel.Anchored = true;
  fishModel.CanCollide = false;
  fishModel.Position = rootPart.Position.add(new Vector3(0, 3, 2));
  fishModel.Parent = Workspace;

  // Add tail (cone-like)
  const tail = new Instance('WedgePart');
  tail.Name = 'Tail';
  tail.Size = new Vector3(
    weight * 0.2 + 0.2,
    weight * 0.3 + 0.3,
    weight * 0.3 + 0.2,
  );
  tail.Color = rarityColor;
  tail.Material = Enum.Material.SmoothPlastic;
  tail.Orientation = new Vector3(0, 180, 0);
  tail.Position = fishModel.Position.add(new Vector3(0, 0, weight * 0.5 + 0.5));
  tail.Anchored = true;
  tail.CanCollide = false;
  tail.Parent = fishModel;

  // Add eye
  const eye = new Instance('Part');
  eye.Name = 'Eye';
  eye.Shape = Enum.PartType.Ball;
  eye.Size = new Vector3(0.15, 0.15, 0.15);
  eye.Color = new Color3(0, 0, 0);
  eye.Material = Enum.Material.SmoothPlastic;
  eye.Position = fishModel.Position.add(
    new Vector3(weight * 0.15 + 0.1, 0.1, -(weight * 0.3 + 0.2)),
  );
  eye.Anchored = true;
  eye.CanCollide = false;
  eye.Parent = fishModel;

  // Add name label above fish
  const billboard = new Instance('BillboardGui');
  billboard.Name = 'FishLabel';
  billboard.Size = new UDim2(0, 100, 0, 30);
  billboard.StudsOffset = new Vector3(0, 2, 0);
  billboard.AlwaysOnTop = true;
  billboard.Parent = fishModel;

  const label = new Instance('TextLabel');
  label.Size = new UDim2(1, 0, 1, 0);
  label.BackgroundTransparency = 1;
  label.Text = `${rarity.upper()} ${name}`;
  label.TextColor3 = rarityColor;
  label.TextStrokeTransparency = 0;
  label.TextStrokeColor3 = new Color3(0, 0, 0);
  label.Font = Enum.Font.GothamBold;
  label.TextScaled = true;
  label.Parent = billboard;

  // Animate fish floating and rotating, then disappear
  task.spawn(() => {
    let rotation = 0;
    for (let i = 0; i < 40; i++) {
      if (!fishModel.Parent) break;

      rotation += 9; // Rotate slowly
      fishModel.CFrame = new CFrame(fishModel.Position).mul(
        CFrame.Angles(0, math.rad(rotation), 0),
      );
      fishModel.Position = fishModel.Position.add(new Vector3(0, 0.02, 0)); // Float up

      task.wait(0.05);
    }

    // Fade out
    for (let i = 0; i < 10; i++) {
      fishModel.Transparency = i / 10;
      eye.Transparency = i / 10;
      tail.Transparency = i / 10;
      task.wait(0.05);
    }

    fishModel.Destroy();
  });

  print(`[FishingUI] 🐟 Showing caught ${rarity} ${name}!`);
}

/**
 * Update status text
 */
function updateStatus(text: string): void {
  statusLabel.Text = text;
}

/**
 * Update button visual states
 */
function updateButtonStates(): void {
  if (currentState.isFishing) {
    castButton.BackgroundColor3 = new Color3(0.3, 0.3, 0.4);
    reelButton.BackgroundColor3 = currentState.isBiting
      ? new Color3(0.2, 0.8, 0.3)
      : new Color3(0.2, 0.5, 0.8);
    bobber.Visible = true;
  } else {
    castButton.BackgroundColor3 = new Color3(0.2, 0.5, 0.8);
    reelButton.BackgroundColor3 = new Color3(0.3, 0.3, 0.4);
    bobber.Visible = false;
  }
}

/**
 * Animate bobber when fish is biting
 */
function animateBobberBite(): void {
  const originalPos = bobber.Position;

  // Shake animation
  for (let i = 0; i < 5; i++) {
    task.spawn(() => {
      const offset = math.random(-5, 5);
      const tween = TweenService.Create(
        bobber,
        new TweenInfo(0.1, Enum.EasingStyle.Quad),
        { Position: new UDim2(0.5, -25 + offset, 0, 65 + math.random(-3, 3)) },
      );
      tween.Play();
      tween.Completed.Wait();
    });
    task.wait(0.12);
  }

  bobber.Position = originalPos;
}

/**
 * Toggle stats panel
 */
function toggleStats(): void {
  statsFrame.Visible = !statsFrame.Visible;
  if (statsFrame.Visible) {
    refreshStats();
  }
}

/**
 * Toggle inventory panel
 */
function toggleInventory(): void {
  inventoryFrame.Visible = !inventoryFrame.Visible;
  if (inventoryFrame.Visible) {
    refreshInventory();
  }
}

/**
 * Toggle collection panel
 */
function toggleCollection(): void {
  collectionFrame.Visible = !collectionFrame.Visible;
  if (collectionFrame.Visible) {
    refreshCollection();
  }
}

/**
 * Toggle locations panel
 */
function toggleLocations(): void {
  locationFrame.Visible = !locationFrame.Visible;
  if (locationFrame.Visible) {
    refreshLocations();
  }
}

/**
 * Refresh stats display
 */
function refreshStats(): void {
  const content = statsFrame.FindFirstChild('Content') as ScrollingFrame;
  if (!content) return;

  // Clear existing
  for (const child of content.GetChildren()) {
    if (child.IsA('TextLabel')) child.Destroy();
  }

  const stats = remotes?.getStats?.InvokeServer() as Record<string, unknown>;
  if (!stats) return;

  const statItems = [
    `🏆 Level: ${stats.level}`,
    `✨ XP: ${stats.xp}`,
    `🐟 Fish Caught: ${stats.totalFishCaught}`,
    `⚖️ Total Weight: ${stats.totalWeight}`,
    `💰 Earnings: ${stats.totalEarnings} coins`,
    `📚 Species Found: ${stats.discoveredSpecies}`,
    `🎒 Inventory: ${stats.inventorySize}`,
  ];

  statItems.forEach((item, index) => {
    const label = new Instance('TextLabel');
    label.Name = `Stat${index}`;
    label.Size = new UDim2(1, 0, 0, 25);
    label.BackgroundTransparency = 1;
    label.Text = item;
    label.TextColor3 = new Color3(0.9, 0.9, 0.9);
    label.TextSize = 14;
    label.Font = Enum.Font.Gotham;
    label.TextXAlignment = Enum.TextXAlignment.Left;
    label.LayoutOrder = index;
    label.Parent = content;
  });

  content.CanvasSize = new UDim2(0, 0, 0, statItems.size() * 30);
}

/**
 * Refresh inventory display
 */
function refreshInventory(): void {
  const content = inventoryFrame.FindFirstChild('Content') as ScrollingFrame;
  if (!content) return;

  // Clear existing
  for (const child of content.GetChildren()) {
    if (!child.IsA('UIListLayout')) child.Destroy();
  }

  const inventory = remotes?.getInventory?.InvokeServer() as Array<
    Record<string, unknown>
  >;
  if (!inventory) return;

  inventory.forEach((fish, index) => {
    const fishFrame = new Instance('Frame');
    fishFrame.Name = `Fish${index}`;
    fishFrame.Size = new UDim2(1, -10, 0, 50);
    fishFrame.BackgroundColor3 = new Color3(0.12, 0.16, 0.25);
    fishFrame.BorderSizePixel = 0;
    fishFrame.LayoutOrder = index;
    fishFrame.Parent = content;

    const corner = new Instance('UICorner');
    corner.CornerRadius = new UDim(0, 8);
    corner.Parent = fishFrame;

    const rarity = fish.rarity as keyof typeof RARITY_COLORS;
    const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.common;

    const nameLabel = new Instance('TextLabel');
    nameLabel.Size = new UDim2(0.6, 0, 0, 25);
    nameLabel.Position = new UDim2(0, 10, 0, 5);
    nameLabel.BackgroundTransparency = 1;
    nameLabel.Text = `${fish.speciesName} ${fish.isRecord ? '🏆' : ''}`;
    nameLabel.TextColor3 = rarityColor;
    nameLabel.TextSize = 14;
    nameLabel.Font = Enum.Font.GothamBold;
    nameLabel.TextXAlignment = Enum.TextXAlignment.Left;
    nameLabel.Parent = fishFrame;

    const quality = fish.quality as keyof typeof QUALITY_COLORS;
    const qualityColor = QUALITY_COLORS[quality] || QUALITY_COLORS.normal;

    const detailLabel = new Instance('TextLabel');
    detailLabel.Size = new UDim2(0.6, 0, 0, 20);
    detailLabel.Position = new UDim2(0, 10, 0, 25);
    detailLabel.BackgroundTransparency = 1;
    detailLabel.Text = `${fish.weight}kg • ${fish.quality}`;
    detailLabel.TextColor3 = qualityColor;
    detailLabel.TextSize = 12;
    detailLabel.Font = Enum.Font.Gotham;
    detailLabel.TextXAlignment = Enum.TextXAlignment.Left;
    detailLabel.Parent = fishFrame;

    const sellBtn = new Instance('TextButton');
    sellBtn.Size = new UDim2(0, 70, 0, 30);
    sellBtn.Position = new UDim2(1, -80, 0.5, -15);
    sellBtn.BackgroundColor3 = new Color3(0.2, 0.6, 0.3);
    sellBtn.BorderSizePixel = 0;
    sellBtn.Text = `💰 ${fish.sellPrice}`;
    sellBtn.TextColor3 = new Color3(1, 1, 1);
    sellBtn.TextSize = 12;
    sellBtn.Font = Enum.Font.GothamBold;
    sellBtn.Parent = fishFrame;

    const sellCorner = new Instance('UICorner');
    sellCorner.CornerRadius = new UDim(0, 6);
    sellCorner.Parent = sellBtn;

    sellBtn.MouseButton1Click.Connect(() => {
      remotes?.sellFish?.FireServer(fish.index);
      task.wait(0.3);
      refreshInventory();
    });
  });

  content.CanvasSize = new UDim2(0, 0, 0, inventory.size() * 55);
}

/**
 * Update inventory panel with local fish inventory
 */
function updateInventoryPanel(): void {
  const content = inventoryFrame.FindFirstChild('Content') as ScrollingFrame;
  if (!content) return;

  // Clear existing fish entries (keep layout)
  for (const child of content.GetChildren()) {
    if (!child.IsA('UIListLayout')) child.Destroy();
  }

  // Show header with totals
  const header = new Instance('TextLabel');
  header.Name = 'Header';
  header.Size = new UDim2(1, -10, 0, 30);
  header.BackgroundTransparency = 1;
  header.Text = `🐟 ${fishInventory.size()} Fish | 💰 ${totalCoins} Coins`;
  header.TextColor3 = new Color3(1, 0.9, 0.3);
  header.TextSize = 16;
  header.Font = Enum.Font.GothamBold;
  header.TextXAlignment = Enum.TextXAlignment.Center;
  header.LayoutOrder = -1;
  header.Parent = content;

  // Display each fish (most recent first)
  for (let i = fishInventory.size() - 1; i >= 0; i--) {
    const fish = fishInventory[i];
    const displayIndex = fishInventory.size() - 1 - i;

    const fishFrame = new Instance('Frame');
    fishFrame.Name = `Fish${displayIndex}`;
    fishFrame.Size = new UDim2(1, -10, 0, 45);
    fishFrame.BackgroundColor3 = new Color3(0.12, 0.16, 0.25);
    fishFrame.BorderSizePixel = 0;
    fishFrame.LayoutOrder = displayIndex;
    fishFrame.Parent = content;

    const corner = new Instance('UICorner');
    corner.CornerRadius = new UDim(0, 6);
    corner.Parent = fishFrame;

    const rarity = fish.rarity as keyof typeof RARITY_COLORS;
    const rarityColor = RARITY_COLORS[rarity] ?? RARITY_COLORS.common;

    // Fish name with rarity color
    const nameLabel = new Instance('TextLabel');
    nameLabel.Size = new UDim2(0.65, 0, 0, 22);
    nameLabel.Position = new UDim2(0, 8, 0, 3);
    nameLabel.BackgroundTransparency = 1;
    nameLabel.Text = `${getRarityEmoji(fish.rarity)} ${fish.name}`;
    nameLabel.TextColor3 = rarityColor;
    nameLabel.TextSize = 13;
    nameLabel.Font = Enum.Font.GothamBold;
    nameLabel.TextXAlignment = Enum.TextXAlignment.Left;
    nameLabel.Parent = fishFrame;

    // Weight and value
    const detailLabel = new Instance('TextLabel');
    detailLabel.Size = new UDim2(0.65, 0, 0, 18);
    detailLabel.Position = new UDim2(0, 8, 0, 24);
    detailLabel.BackgroundTransparency = 1;
    detailLabel.Text = `⚖️ ${fish.weight}kg • 💰 ${fish.value}`;
    detailLabel.TextColor3 = new Color3(0.7, 0.7, 0.7);
    detailLabel.TextSize = 11;
    detailLabel.Font = Enum.Font.Gotham;
    detailLabel.TextXAlignment = Enum.TextXAlignment.Left;
    detailLabel.Parent = fishFrame;

    // Rarity badge
    const badge = new Instance('TextLabel');
    badge.Size = new UDim2(0, 60, 0, 20);
    badge.Position = new UDim2(1, -68, 0.5, -10);
    badge.BackgroundColor3 = rarityColor;
    badge.BackgroundTransparency = 0.3;
    badge.Text = fish.rarity.upper();
    badge.TextColor3 = new Color3(1, 1, 1);
    badge.TextSize = 9;
    badge.Font = Enum.Font.GothamBold;
    badge.Parent = fishFrame;

    const badgeCorner = new Instance('UICorner');
    badgeCorner.CornerRadius = new UDim(0, 4);
    badgeCorner.Parent = badge;
  }

  content.CanvasSize = new UDim2(0, 0, 0, 40 + fishInventory.size() * 50);
}

/**
 * Get emoji for fish rarity
 */
function getRarityEmoji(rarity: string): string {
  const emojis: Record<string, string> = {
    common: '⚪',
    uncommon: '🟢',
    rare: '🔵',
    epic: '🟣',
    legendary: '🟠',
    mythic: '🔴',
  };
  return emojis[rarity] ?? '⚪';
}

/**
 * Refresh collection display
 */
function refreshCollection(): void {
  const content = collectionFrame.FindFirstChild('Content') as ScrollingFrame;
  if (!content) return;

  // Clear existing
  for (const child of content.GetChildren()) {
    if (!child.IsA('UIListLayout') && !child.IsA('UIGridLayout'))
      child.Destroy();
  }

  // Remove list layout if exists, use grid
  const existingLayout = content.FindFirstChildOfClass('UIListLayout');
  if (existingLayout) existingLayout.Destroy();

  let gridLayout = content.FindFirstChildOfClass('UIGridLayout');
  if (!gridLayout) {
    gridLayout = new Instance('UIGridLayout');
    gridLayout.CellSize = new UDim2(0, 80, 0, 90);
    gridLayout.CellPadding = new UDim2(0, 5, 0, 5);
    gridLayout.Parent = content;
  }

  const collection = remotes?.getCollection?.InvokeServer() as {
    percentage: number;
    allSpecies: Array<{
      id: string;
      name: string;
      rarity: string;
      discovered: boolean;
      personalRecord: number;
    }>;
  };

  if (!collection) return;

  // Add header
  const header = new Instance('TextLabel');
  header.Name = 'Header';
  header.Size = new UDim2(1, 0, 0, 30);
  header.BackgroundTransparency = 1;
  header.Text = `Collection Progress: ${collection.percentage}%`;
  header.TextColor3 = new Color3(1, 0.9, 0.3);
  header.TextSize = 16;
  header.Font = Enum.Font.GothamBold;
  header.LayoutOrder = -1;
  // Skip header for grid layout

  collection.allSpecies.forEach((species, index) => {
    const card = new Instance('Frame');
    card.Name = species.id;
    card.BackgroundColor3 = species.discovered
      ? new Color3(0.12, 0.18, 0.28)
      : new Color3(0.08, 0.08, 0.1);
    card.BorderSizePixel = 0;
    card.LayoutOrder = index;
    card.Parent = content;

    const corner = new Instance('UICorner');
    corner.CornerRadius = new UDim(0, 8);
    corner.Parent = card;

    const rarity = species.rarity as keyof typeof RARITY_COLORS;
    const rarityColor = species.discovered
      ? RARITY_COLORS[rarity] || RARITY_COLORS.common
      : new Color3(0.3, 0.3, 0.3);

    const nameLabel = new Instance('TextLabel');
    nameLabel.Size = new UDim2(1, -10, 0, 40);
    nameLabel.Position = new UDim2(0, 5, 0, 5);
    nameLabel.BackgroundTransparency = 1;
    nameLabel.Text = species.discovered ? species.name : '???';
    nameLabel.TextColor3 = rarityColor;
    nameLabel.TextSize = 11;
    nameLabel.Font = Enum.Font.GothamBold;
    nameLabel.TextWrapped = true;
    nameLabel.Parent = card;

    const rarityLabel = new Instance('TextLabel');
    rarityLabel.Size = new UDim2(1, 0, 0, 20);
    rarityLabel.Position = new UDim2(0, 0, 0, 45);
    rarityLabel.BackgroundTransparency = 1;
    rarityLabel.Text = species.discovered ? species.rarity.upper() : '?';
    rarityLabel.TextColor3 = rarityColor;
    rarityLabel.TextSize = 9;
    rarityLabel.Font = Enum.Font.Gotham;
    rarityLabel.Parent = card;

    if (species.discovered && species.personalRecord > 0) {
      const recordLabel = new Instance('TextLabel');
      recordLabel.Size = new UDim2(1, 0, 0, 20);
      recordLabel.Position = new UDim2(0, 0, 0, 65);
      recordLabel.BackgroundTransparency = 1;
      recordLabel.Text = `🏆 ${species.personalRecord}kg`;
      recordLabel.TextColor3 = new Color3(1, 0.8, 0.2);
      recordLabel.TextSize = 10;
      recordLabel.Font = Enum.Font.Gotham;
      recordLabel.Parent = card;
    }
  });

  const rows = math.ceil(collection.allSpecies.size() / 4);
  content.CanvasSize = new UDim2(0, 0, 0, rows * 95);
}

/**
 * Refresh locations display
 */
function refreshLocations(): void {
  const content = locationFrame.FindFirstChild('Content') as ScrollingFrame;
  if (!content) return;

  // Clear existing
  for (const child of content.GetChildren()) {
    if (!child.IsA('UIListLayout')) child.Destroy();
  }

  // Sample locations (should come from server)
  const locations = [
    { id: 'starter_pond', name: 'Starter Pond', unlockLevel: 1 },
    { id: 'river', name: 'River Rapids', unlockLevel: 5 },
    { id: 'lake', name: 'Deep Lake', unlockLevel: 10 },
    { id: 'ocean', name: 'Ocean Shore', unlockLevel: 20 },
    { id: 'deep_sea', name: 'Deep Sea', unlockLevel: 30 },
    { id: 'crystal_cavern', name: 'Crystal Cavern', unlockLevel: 40 },
    { id: 'abyss', name: 'The Abyss', unlockLevel: 50 },
  ];

  locations.forEach((loc, index) => {
    const isUnlocked = currentState.currentLevel >= loc.unlockLevel;
    const isCurrent = currentState.currentLocationId === loc.id;

    const locFrame = new Instance('Frame');
    locFrame.Name = loc.id;
    locFrame.Size = new UDim2(1, -10, 0, 50);
    locFrame.BackgroundColor3 = isCurrent
      ? new Color3(0.2, 0.4, 0.6)
      : isUnlocked
        ? new Color3(0.12, 0.16, 0.25)
        : new Color3(0.08, 0.08, 0.1);
    locFrame.BorderSizePixel = 0;
    locFrame.LayoutOrder = index;
    locFrame.Parent = content;

    const corner = new Instance('UICorner');
    corner.CornerRadius = new UDim(0, 8);
    corner.Parent = locFrame;

    const nameLabel = new Instance('TextLabel');
    nameLabel.Size = new UDim2(0.7, 0, 1, 0);
    nameLabel.Position = new UDim2(0, 10, 0, 0);
    nameLabel.BackgroundTransparency = 1;
    nameLabel.Text = isUnlocked ? `🗺️ ${loc.name}` : `🔒 ${loc.name}`;
    nameLabel.TextColor3 = isUnlocked
      ? new Color3(1, 1, 1)
      : new Color3(0.5, 0.5, 0.5);
    nameLabel.TextSize = 14;
    nameLabel.Font = Enum.Font.GothamBold;
    nameLabel.TextXAlignment = Enum.TextXAlignment.Left;
    nameLabel.Parent = locFrame;

    const levelLabel = new Instance('TextLabel');
    levelLabel.Size = new UDim2(0, 60, 1, 0);
    levelLabel.Position = new UDim2(1, -70, 0, 0);
    levelLabel.BackgroundTransparency = 1;
    levelLabel.Text = `Lv. ${loc.unlockLevel}`;
    levelLabel.TextColor3 = isUnlocked
      ? new Color3(0.5, 1, 0.5)
      : new Color3(1, 0.5, 0.5);
    levelLabel.TextSize = 12;
    levelLabel.Font = Enum.Font.Gotham;
    levelLabel.Parent = locFrame;

    if (isUnlocked && !isCurrent) {
      const goBtn = new Instance('TextButton');
      goBtn.Size = new UDim2(0, 50, 0, 30);
      goBtn.Position = new UDim2(1, -130, 0.5, -15);
      goBtn.BackgroundColor3 = new Color3(0.2, 0.5, 0.8);
      goBtn.BorderSizePixel = 0;
      goBtn.Text = 'Go';
      goBtn.TextColor3 = new Color3(1, 1, 1);
      goBtn.TextSize = 12;
      goBtn.Font = Enum.Font.GothamBold;
      goBtn.Parent = locFrame;

      const btnCorner = new Instance('UICorner');
      btnCorner.CornerRadius = new UDim(0, 6);
      btnCorner.Parent = goBtn;

      goBtn.MouseButton1Click.Connect(() => {
        remotes?.changeLocation?.FireServer(loc.id);
      });
    }
  });

  content.CanvasSize = new UDim2(0, 0, 0, locations.size() * 55);
}

/**
 * Connect to server events
 */
function connectServerEvents(): void {
  // Cast result
  remotes?.castLine?.OnClientEvent.Connect(
    (data: {
      success?: boolean;
      event?: string;
      error?: string;
      estimatedCatchTime?: number;
    }) => {
      if (data.event === 'bite') {
        currentState.isBiting = true;
        updateStatus('🐟 A fish is biting! Reel in!');
        updateButtonStates();
        animateBobberBite();
      } else if (data.success) {
        updateStatus('Line in the water... waiting for bite');
      } else {
        updateStatus(`Error: ${data.error}`);
        currentState.isFishing = false;
        updateButtonStates();
      }
    },
  );

  // Reel result
  remotes?.reelIn?.OnClientEvent.Connect(
    (data: {
      success?: boolean;
      species?: { name: string; rarity: string };
      fish?: { weight: number; quality: string };
      xpGained?: number;
      levelUp?: boolean;
      newLevel?: number;
      isNewDiscovery?: boolean;
      isPersonalRecord?: boolean;
      error?: string;
    }) => {
      currentState.isFishing = false;
      currentState.isBiting = false;
      updateButtonStates();

      if (data.success && data.species && data.fish) {
        let msg = `Caught ${data.species.name}! (${data.fish.weight}kg, ${data.fish.quality})`;
        if (data.isNewDiscovery) msg += ' 🆕 NEW!';
        if (data.isPersonalRecord) msg += ' 🏆 RECORD!';
        msg += ` +${data.xpGained} XP`;

        updateStatus(msg);

        if (data.levelUp) {
          currentState.currentLevel =
            data.newLevel ?? currentState.currentLevel;
          task.delay(2, () =>
            updateStatus(`🎉 LEVEL UP! Now level ${data.newLevel}!`),
          );
        }
      } else {
        updateStatus(data.error ?? 'Failed to catch fish');
      }
    },
  );

  // Sell result
  remotes?.sellFish?.OnClientEvent.Connect(
    (data: { success?: boolean; earnings?: number; error?: string }) => {
      if (data.success) {
        updateStatus(`💰 Sold for ${data.earnings} coins!`);
      }
    },
  );

  // Location change result
  remotes?.changeLocation?.OnClientEvent.Connect(
    (data: {
      success?: boolean;
      location?: { id: string; name: string };
      error?: string;
    }) => {
      if (data.success && data.location) {
        currentState.currentLocationId = data.location.id;
        updateStatus(`Moved to ${data.location.name}`);
        refreshLocations();
      } else {
        updateStatus(data.error ?? 'Failed to change location');
      }
    },
  );
}

/**
 * Initialize the fishing UI
 */
export function initFishingUI(): void {
  print('[FishingUI] Initializing...');

  // Create UI first (starts hidden) - this enables the toggle button to work
  createFishingUI();
  mainFrame.Visible = false; // Start hidden until player toggles or visits fishing spot

  // Try to connect to server remotes (optional - UI works without them)
  const remotesFolder = ReplicatedStorage.FindFirstChild('FishingRemotes') as
    | Folder
    | undefined;

  if (remotesFolder) {
    print('[FishingUI] Found FishingRemotes, connecting...');
    remotes = {
      castLine: remotesFolder.FindFirstChild('CastLine') as RemoteEvent,
      reelIn: remotesFolder.FindFirstChild('ReelIn') as RemoteEvent,
      sellFish: remotesFolder.FindFirstChild('SellFish') as RemoteEvent,
      equipRod: remotesFolder.FindFirstChild('EquipRod') as RemoteEvent,
      equipBait: remotesFolder.FindFirstChild('EquipBait') as RemoteEvent,
      getStats: remotesFolder.FindFirstChild('GetStats') as RemoteFunction,
      getCollection: remotesFolder.FindFirstChild(
        'GetCollection',
      ) as RemoteFunction,
      getInventory: remotesFolder.FindFirstChild(
        'GetInventory',
      ) as RemoteFunction,
      changeLocation: remotesFolder.FindFirstChild(
        'ChangeLocation',
      ) as RemoteEvent,
    };
    connectServerEvents();
  } else {
    print('[FishingUI] FishingRemotes not found - running in UI-only mode');
    updateStatus('🎣 Fishing UI ready! Server connection pending...');
  }

  // Listen for OpenFishingUI remote from fishing spots
  const openRemote = ReplicatedStorage.FindFirstChild('OpenFishingUI') as
    | RemoteEvent
    | undefined;
  if (openRemote) {
    openRemote.OnClientEvent.Connect((locationId: string) => {
      print(`[FishingUI] Opening UI at location: ${locationId}`);
      currentState.currentLocationId = locationId;
      mainFrame.Visible = true;
      updateStatus(
        `Welcome to ${locationId.gsub('_', ' ')[0]}! Press SPACE or click Cast to fish.`,
      );
    });
  }

  // Keyboard shortcuts
  UserInputService.InputBegan.Connect((input, gameProcessed) => {
    if (gameProcessed) return;

    // Space to cast/reel when UI is visible
    if (input.KeyCode === Enum.KeyCode.Space && mainFrame.Visible) {
      if (currentState.isFishing) {
        onReelClick();
      } else {
        onCastClick();
      }
    }

    // F to toggle fishing UI
    if (input.KeyCode === Enum.KeyCode.F) {
      mainFrame.Visible = !mainFrame.Visible;
    }

    // Escape to close
    if (input.KeyCode === Enum.KeyCode.Escape && mainFrame.Visible) {
      mainFrame.Visible = false;
    }
  });

  print('[FishingUI] Ready! Press F to toggle, go to a fishing spot to start!');
}

/**
 * Toggle fishing UI visibility (for action bar)
 */
export function toggleFishingUI(): void {
  if (mainFrame) {
    mainFrame.Visible = !mainFrame.Visible;
  }
}
