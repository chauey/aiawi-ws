// Dragon Legends - Dragon Menu (Client)
// View, manage, and equip dragons

import { Players, ReplicatedStorage, TweenService } from '@rbxts/services';
import { GAME_THEME } from '../../shared/theme';
import { DRAGONS, RARITIES } from '../../shared/config';
import { PlayerDragon } from '../../shared/types';

const LocalPlayer = Players.LocalPlayer;
const PlayerGui = LocalPlayer.WaitForChild('PlayerGui') as PlayerGui;

// Create dragon menu
export function setupDragonMenu(): void {
  const screenGui = new Instance('ScreenGui');
  screenGui.Name = 'DragonMenu';
  screenGui.ResetOnSpawn = false;
  screenGui.Enabled = false; // Start closed
  screenGui.Parent = PlayerGui;

  // Background overlay
  const overlay = new Instance('Frame');
  overlay.Name = 'Overlay';
  overlay.Size = new UDim2(1, 0, 1, 0);
  overlay.BackgroundColor3 = Color3.fromRGB(0, 0, 0);
  overlay.BackgroundTransparency = 0.5;
  overlay.Parent = screenGui;

  // Main container
  const container = new Instance('Frame');
  container.Name = 'Container';
  container.Size = new UDim2(0.8, 0, 0.8, 0);
  container.Position = new UDim2(0.5, 0, 0.5, 0);
  container.AnchorPoint = new Vector2(0.5, 0.5);
  container.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
  container.Parent = screenGui;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 20);
  corner.Parent = container;

  const stroke = new Instance('UIStroke');
  stroke.Color = GAME_THEME.primary;
  stroke.Thickness = 3;
  stroke.Parent = container;

  // Header
  const header = new Instance('Frame');
  header.Name = 'Header';
  header.Size = new UDim2(1, 0, 0, 60);
  header.BackgroundColor3 = Color3.fromRGB(40, 35, 55);
  header.BorderSizePixel = 0;
  header.Parent = container;

  const headerCorner = new Instance('UICorner');
  headerCorner.CornerRadius = new UDim(0, 20);
  headerCorner.Parent = header;

  const title = new Instance('TextLabel');
  title.Size = new UDim2(0.8, 0, 1, 0);
  title.Position = new UDim2(0, 20, 0, 0);
  title.BackgroundTransparency = 1;
  title.Text = '🐉 My Dragons';
  title.TextColor3 = Color3.fromRGB(255, 255, 255);
  title.TextXAlignment = Enum.TextXAlignment.Left;
  title.TextScaled = true;
  title.Font = Enum.Font.GothamBold;
  title.Parent = header;

  // Close button
  const closeBtn = new Instance('TextButton');
  closeBtn.Name = 'CloseBtn';
  closeBtn.Size = new UDim2(0, 50, 0, 50);
  closeBtn.Position = new UDim2(1, -55, 0, 5);
  closeBtn.BackgroundColor3 = Color3.fromRGB(200, 60, 60);
  closeBtn.Text = '✕';
  closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
  closeBtn.TextScaled = true;
  closeBtn.Font = Enum.Font.GothamBold;
  closeBtn.Parent = header;

  const closeBtnCorner = new Instance('UICorner');
  closeBtnCorner.CornerRadius = new UDim(0, 10);
  closeBtnCorner.Parent = closeBtn;

  closeBtn.MouseButton1Click.Connect(() => {
    screenGui.Enabled = false;
  });

  // Content area - dragon grid
  const content = new Instance('ScrollingFrame');
  content.Name = 'Content';
  content.Size = new UDim2(0.65, -20, 1, -80);
  content.Position = new UDim2(0, 10, 0, 70);
  content.BackgroundTransparency = 1;
  content.ScrollBarThickness = 8;
  content.ScrollBarImageColor3 = GAME_THEME.primary;
  content.Parent = container;

  const gridLayout = new Instance('UIGridLayout');
  gridLayout.CellSize = new UDim2(0, 120, 0, 140);
  gridLayout.CellPadding = new UDim2(0, 10, 0, 10);
  gridLayout.SortOrder = Enum.SortOrder.LayoutOrder;
  gridLayout.Parent = content;

  // Detail panel (right side)
  const detailPanel = new Instance('Frame');
  detailPanel.Name = 'DetailPanel';
  detailPanel.Size = new UDim2(0.35, -20, 1, -80);
  detailPanel.Position = new UDim2(0.65, 10, 0, 70);
  detailPanel.BackgroundColor3 = Color3.fromRGB(40, 35, 55);
  detailPanel.Parent = container;

  const detailCorner = new Instance('UICorner');
  detailCorner.CornerRadius = new UDim(0, 15);
  detailCorner.Parent = detailPanel;

  // Empty state in detail panel
  const emptyText = new Instance('TextLabel');
  emptyText.Name = 'EmptyText';
  emptyText.Size = new UDim2(1, -20, 1, 0);
  emptyText.Position = new UDim2(0, 10, 0, 0);
  emptyText.BackgroundTransparency = 1;
  emptyText.Text = 'Select a dragon\nto view details';
  emptyText.TextColor3 = Color3.fromRGB(150, 150, 150);
  emptyText.TextScaled = true;
  emptyText.Font = Enum.Font.Gotham;
  emptyText.Parent = detailPanel;

  // Click overlay to close
  overlay.InputBegan.Connect((input) => {
    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
      screenGui.Enabled = false;
    }
  });

  // Setup dragon list refresh
  setupDragonListRefresh(screenGui, content);
}

// Create dragon card
function createDragonCard(dragon: PlayerDragon, index: number): Frame {
  const def = DRAGONS[dragon.dragonId];
  const rarityConfig = RARITIES[dragon.rarity];

  const card = new Instance('Frame');
  card.Name = `Dragon_${index}`;
  card.BackgroundColor3 = Color3.fromRGB(50, 45, 65);
  card.LayoutOrder = index;

  const cardCorner = new Instance('UICorner');
  cardCorner.CornerRadius = new UDim(0, 12);
  cardCorner.Parent = card;

  const cardStroke = new Instance('UIStroke');
  cardStroke.Color = rarityConfig?.color || Color3.fromRGB(100, 100, 100);
  cardStroke.Thickness = 2;
  cardStroke.Parent = card;

  // Dragon icon
  const icon = new Instance('TextLabel');
  icon.Size = new UDim2(1, 0, 0.5, 0);
  icon.BackgroundTransparency = 1;
  icon.Text = dragon.isShiny ? '✨🐉✨' : '🐉';
  icon.TextScaled = true;
  icon.Font = Enum.Font.GothamBold;
  icon.Parent = card;

  // Dragon name
  const nameLabel = new Instance('TextLabel');
  nameLabel.Size = new UDim2(1, -10, 0.25, 0);
  nameLabel.Position = new UDim2(0, 5, 0.5, 0);
  nameLabel.BackgroundTransparency = 1;
  nameLabel.Text = dragon.nickname || def?.name || 'Unknown';
  nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
  nameLabel.TextScaled = true;
  nameLabel.TextTruncate = Enum.TextTruncate.AtEnd;
  nameLabel.Font = Enum.Font.GothamBold;
  nameLabel.Parent = card;

  // Level and rarity
  const infoLabel = new Instance('TextLabel');
  infoLabel.Size = new UDim2(1, -10, 0.2, 0);
  infoLabel.Position = new UDim2(0, 5, 0.75, 0);
  infoLabel.BackgroundTransparency = 1;
  infoLabel.Text = `Lv.${dragon.level} • ${dragon.rarity}`;
  infoLabel.TextColor3 = rarityConfig?.color || Color3.fromRGB(150, 150, 150);
  infoLabel.TextScaled = true;
  infoLabel.Font = Enum.Font.Gotham;
  infoLabel.Parent = card;

  // Favorite indicator
  if (dragon.isFavorite) {
    const favLabel = new Instance('TextLabel');
    favLabel.Size = new UDim2(0, 25, 0, 25);
    favLabel.Position = new UDim2(1, -28, 0, 3);
    favLabel.BackgroundTransparency = 1;
    favLabel.Text = '⭐';
    favLabel.TextScaled = true;
    favLabel.Parent = card;
  }

  // Click handler
  const button = new Instance('TextButton');
  button.Size = new UDim2(1, 0, 1, 0);
  button.BackgroundTransparency = 1;
  button.Text = '';
  button.Parent = card;

  button.MouseButton1Click.Connect(() => {
    showDragonDetail(dragon);
  });

  // Hover effect
  button.MouseEnter.Connect(() => {
    TweenService.Create(card, new TweenInfo(0.2), {
      BackgroundColor3: Color3.fromRGB(70, 65, 90),
    }).Play();
  });

  button.MouseLeave.Connect(() => {
    TweenService.Create(card, new TweenInfo(0.2), {
      BackgroundColor3: Color3.fromRGB(50, 45, 65),
    }).Play();
  });

  return card;
}

// Show dragon detail in side panel
function showDragonDetail(dragon: PlayerDragon): void {
  const screenGui = PlayerGui.FindFirstChild('DragonMenu') as
    | ScreenGui
    | undefined;
  if (!screenGui) return;

  const container = screenGui.FindFirstChild('Container') as Frame | undefined;
  if (!container) return;

  const detailPanel = container.FindFirstChild('DetailPanel') as
    | Frame
    | undefined;
  if (!detailPanel) return;

  // Clear existing detail
  for (const child of detailPanel.GetChildren()) {
    if (!child.IsA('UICorner')) {
      child.Destroy();
    }
  }

  const def = DRAGONS[dragon.dragonId];
  const rarityConfig = RARITIES[dragon.rarity];

  // Dragon icon
  const icon = new Instance('TextLabel');
  icon.Size = new UDim2(1, 0, 0, 80);
  icon.Position = new UDim2(0, 0, 0, 20);
  icon.BackgroundTransparency = 1;
  icon.Text = dragon.isShiny ? '✨🐉✨' : '🐉';
  icon.TextScaled = true;
  icon.Parent = detailPanel;

  // Name
  const nameLabel = new Instance('TextLabel');
  nameLabel.Size = new UDim2(1, -20, 0, 30);
  nameLabel.Position = new UDim2(0, 10, 0, 100);
  nameLabel.BackgroundTransparency = 1;
  nameLabel.Text = dragon.nickname || def?.name || 'Unknown';
  nameLabel.TextColor3 = rarityConfig?.color || Color3.fromRGB(255, 255, 255);
  nameLabel.TextScaled = true;
  nameLabel.Font = Enum.Font.GothamBold;
  nameLabel.Parent = detailPanel;

  // Info
  const infoLabel = new Instance('TextLabel');
  infoLabel.Size = new UDim2(1, -20, 0, 20);
  infoLabel.Position = new UDim2(0, 10, 0, 135);
  infoLabel.BackgroundTransparency = 1;
  infoLabel.Text = `${dragon.rarity} • ${dragon.element.upper()} • Stage ${dragon.evolutionStage}`;
  infoLabel.TextColor3 = Color3.fromRGB(180, 180, 180);
  infoLabel.TextScaled = true;
  infoLabel.Font = Enum.Font.Gotham;
  infoLabel.Parent = detailPanel;

  // Stats
  const stats = [
    { name: 'Level', value: dragon.level, max: 50 },
    { name: 'Power', value: dragon.stats.power, max: 200 },
    { name: 'Speed', value: dragon.stats.speed, max: 200 },
    { name: 'Health', value: dragon.stats.health, max: 200 },
    { name: 'Luck', value: dragon.stats.luck, max: 100 },
  ];

  let yOffset = 170;
  for (const stat of stats) {
    createStatBar(detailPanel, stat.name, stat.value, stat.max, yOffset);
    yOffset += 35;
  }

  // Battle record
  const battleLabel = new Instance('TextLabel');
  battleLabel.Size = new UDim2(1, -20, 0, 25);
  battleLabel.Position = new UDim2(0, 10, 0, yOffset + 10);
  battleLabel.BackgroundTransparency = 1;
  battleLabel.Text = `⚔️ Wins: ${dragon.battleWins} | Losses: ${dragon.battleLosses}`;
  battleLabel.TextColor3 = Color3.fromRGB(150, 150, 150);
  battleLabel.TextScaled = true;
  battleLabel.Font = Enum.Font.Gotham;
  battleLabel.Parent = detailPanel;

  // Action buttons
  const buttonY = yOffset + 50;

  // Equip button
  const equipBtn = createActionButton(
    '🎯 Equip',
    buttonY,
    Color3.fromRGB(80, 150, 80),
  );
  equipBtn.Parent = detailPanel;

  // Evolve button (if applicable)
  if (def?.evolvesTo) {
    const evolveBtn = createActionButton(
      '✨ Evolve',
      buttonY + 45,
      Color3.fromRGB(150, 100, 200),
    );
    evolveBtn.Parent = detailPanel;
  }
}

// Create stat bar
function createStatBar(
  parent: Frame,
  name: string,
  value: number,
  max: number,
  yOffset: number,
): void {
  const label = new Instance('TextLabel');
  label.Size = new UDim2(0.4, -10, 0, 20);
  label.Position = new UDim2(0, 10, 0, yOffset);
  label.BackgroundTransparency = 1;
  label.Text = name;
  label.TextColor3 = Color3.fromRGB(180, 180, 180);
  label.TextXAlignment = Enum.TextXAlignment.Left;
  label.TextScaled = true;
  label.Font = Enum.Font.Gotham;
  label.Parent = parent;

  const barBg = new Instance('Frame');
  barBg.Size = new UDim2(0.55, -10, 0, 15);
  barBg.Position = new UDim2(0.4, 0, 0, yOffset + 2);
  barBg.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
  barBg.Parent = parent;

  const barCorner = new Instance('UICorner');
  barCorner.CornerRadius = new UDim(0, 5);
  barCorner.Parent = barBg;

  const barFill = new Instance('Frame');
  barFill.Size = new UDim2(math.min(value / max, 1), 0, 1, 0);
  barFill.BackgroundColor3 = GAME_THEME.primary;
  barFill.Parent = barBg;

  const fillCorner = new Instance('UICorner');
  fillCorner.CornerRadius = new UDim(0, 5);
  fillCorner.Parent = barFill;

  const valueLabel = new Instance('TextLabel');
  valueLabel.Size = new UDim2(1, 0, 1, 0);
  valueLabel.BackgroundTransparency = 1;
  valueLabel.Text = tostring(value);
  valueLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
  valueLabel.TextScaled = true;
  valueLabel.Font = Enum.Font.GothamBold;
  valueLabel.Parent = barBg;
}

// Create action button
function createActionButton(
  text: string,
  yOffset: number,
  color: Color3,
): TextButton {
  const button = new Instance('TextButton');
  button.Size = new UDim2(1, -20, 0, 35);
  button.Position = new UDim2(0, 10, 0, yOffset);
  button.BackgroundColor3 = color;
  button.Text = text;
  button.TextColor3 = Color3.fromRGB(255, 255, 255);
  button.TextScaled = true;
  button.Font = Enum.Font.GothamBold;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 8);
  corner.Parent = button;

  return button;
}

// Refresh dragon list periodically
function setupDragonListRefresh(
  screenGui: ScreenGui,
  content: ScrollingFrame,
): void {
  // Initial placeholder dragons for demo
  const demoDragons: PlayerDragon[] = [];

  // Populate demo dragons
  for (let i = 0; i < 12; i++) {
    const dragonIds = [
      'fire_drake_baby',
      'water_wyrm_baby',
      'frost_drake_baby',
      'nature_spirit_baby',
      'thunder_dragon_baby',
    ];
    const randomId = dragonIds[math.floor(math.random() * dragonIds.size())];
    const def = DRAGONS[randomId];

    demoDragons.push({
      instanceId: `demo_${i}`,
      dragonId: randomId,
      level: math.random(1, 30),
      experience: 0,
      stats: { ...def.baseStats },
      element: def.element,
      rarity: def.rarity,
      evolutionStage: def.evolutionStage,
      isShiny: math.random() < 0.1,
      obtainedAt: os.time(),
      breedCount: 0,
      battleWins: math.random(0, 50),
      battleLosses: math.random(0, 20),
      isFavorite: math.random() < 0.2,
    });
  }

  // Create cards
  for (let i = 0; i < demoDragons.size(); i++) {
    const card = createDragonCard(demoDragons[i], i);
    card.Parent = content;
  }

  // Update canvas size
  const gridLayout = content.FindFirstChildOfClass('UIGridLayout');
  if (gridLayout) {
    content.CanvasSize = new UDim2(
      0,
      0,
      0,
      gridLayout.AbsoluteContentSize.Y + 20,
    );
  }
}
