/**
 * Fishing UI - Lucky Fish Legends
 * Client-side fishing interface
 */

import {
  Players,
  ReplicatedStorage,
  StarterGui,
  TweenService,
  UserInputService,
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
let currentState = {
  isFishing: false,
  isBiting: false,
  currentLocationId: 'starter_pond',
  currentLevel: 1,
};

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

  // Main container
  mainFrame = new Instance('Frame');
  mainFrame.Name = 'MainFrame';
  mainFrame.Size = new UDim2(0, 350, 0, 200);
  mainFrame.Position = new UDim2(0.5, -175, 1, -220);
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
  bobber.Position = new UDim2(0.5, -25, 0, 65);
  bobber.BackgroundTransparency = 1;
  bobber.Image = 'rbxassetid://6031094667'; // Default circle
  bobber.ImageColor3 = new Color3(1, 0.4, 0.2);
  bobber.Visible = false;
  bobber.Parent = mainFrame;

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

/**
 * Cast line handler
 */
function onCastClick(): void {
  if (currentState.isFishing) {
    updateStatus('Already fishing...');
    return;
  }

  remotes?.castLine?.FireServer(currentState.currentLocationId);
  updateStatus('Casting line...');
  currentState.isFishing = true;
  updateButtonStates();
}

/**
 * Reel in handler
 */
function onReelClick(): void {
  if (!currentState.isFishing) {
    updateStatus('Not fishing yet!');
    return;
  }

  remotes?.reelIn?.FireServer();
  updateStatus('Reeling in...');
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

  // Wait for remotes
  const remotesFolder = ReplicatedStorage.WaitForChild(
    'FishingRemotes',
    10,
  ) as Folder;
  if (!remotesFolder) {
    warn('[FishingUI] FishingRemotes folder not found!');
    return;
  }

  remotes = {
    castLine: remotesFolder.WaitForChild('CastLine') as RemoteEvent,
    reelIn: remotesFolder.WaitForChild('ReelIn') as RemoteEvent,
    sellFish: remotesFolder.WaitForChild('SellFish') as RemoteEvent,
    equipRod: remotesFolder.WaitForChild('EquipRod') as RemoteEvent,
    equipBait: remotesFolder.WaitForChild('EquipBait') as RemoteEvent,
    getStats: remotesFolder.WaitForChild('GetStats') as RemoteFunction,
    getCollection: remotesFolder.WaitForChild(
      'GetCollection',
    ) as RemoteFunction,
    getInventory: remotesFolder.WaitForChild('GetInventory') as RemoteFunction,
    changeLocation: remotesFolder.WaitForChild('ChangeLocation') as RemoteEvent,
  };

  // Create UI
  createFishingUI();

  // Connect events
  connectServerEvents();

  // Keyboard shortcut: Space to cast/reel
  UserInputService.InputBegan.Connect((input, gameProcessed) => {
    if (gameProcessed) return;

    if (input.KeyCode === Enum.KeyCode.Space) {
      if (currentState.isFishing) {
        onReelClick();
      } else {
        onCastClick();
      }
    }
  });

  print('[FishingUI] Ready!');
}
