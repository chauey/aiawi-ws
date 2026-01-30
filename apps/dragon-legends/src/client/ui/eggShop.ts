// Dragon Legends - Egg Shop (Client)
// Purchase and hatch dragon eggs

import { Players, ReplicatedStorage, TweenService } from '@rbxts/services';
import { GAME_THEME } from '../../shared/theme';
import { EGG_TYPES, RARITIES } from '../../shared/config';

const LocalPlayer = Players.LocalPlayer;
const PlayerGui = LocalPlayer.WaitForChild('PlayerGui') as PlayerGui;

// Create egg shop
export function setupEggShop(): void {
  const screenGui = new Instance('ScreenGui');
  screenGui.Name = 'EggShop';
  screenGui.ResetOnSpawn = false;
  screenGui.Enabled = false;
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
  container.Size = new UDim2(0, 600, 0, 500);
  container.Position = new UDim2(0.5, 0, 0.5, 0);
  container.AnchorPoint = new Vector2(0.5, 0.5);
  container.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
  container.Parent = screenGui;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 20);
  corner.Parent = container;

  const stroke = new Instance('UIStroke');
  stroke.Color = GAME_THEME.accent;
  stroke.Thickness = 3;
  stroke.Parent = container;

  // Header
  const header = createHeader(container);

  // Close button
  const closeBtn = new Instance('TextButton');
  closeBtn.Size = new UDim2(0, 40, 0, 40);
  closeBtn.Position = new UDim2(1, -50, 0, 10);
  closeBtn.BackgroundColor3 = Color3.fromRGB(200, 60, 60);
  closeBtn.Text = '✕';
  closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
  closeBtn.TextScaled = true;
  closeBtn.Font = Enum.Font.GothamBold;
  closeBtn.Parent = header;

  const closeBtnCorner = new Instance('UICorner');
  closeBtnCorner.CornerRadius = new UDim(0, 8);
  closeBtnCorner.Parent = closeBtn;

  closeBtn.MouseButton1Click.Connect(() => {
    screenGui.Enabled = false;
  });

  // Egg cards container
  const eggsContainer = new Instance('Frame');
  eggsContainer.Name = 'EggsContainer';
  eggsContainer.Size = new UDim2(1, -40, 0.7, 0);
  eggsContainer.Position = new UDim2(0, 20, 0, 80);
  eggsContainer.BackgroundTransparency = 1;
  eggsContainer.Parent = container;

  const listLayout = new Instance('UIListLayout');
  listLayout.FillDirection = Enum.FillDirection.Horizontal;
  listLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center;
  listLayout.Padding = new UDim(0, 20);
  listLayout.Parent = eggsContainer;

  // Create egg cards
  createEggCard(eggsContainer, 'basic', '🥚 Basic Egg', EGG_TYPES.basic);
  createEggCard(eggsContainer, 'premium', '✨ Premium Egg', EGG_TYPES.premium);
  createEggCard(
    eggsContainer,
    'legendary',
    '🌟 Legendary Egg',
    EGG_TYPES.legendary,
  );

  // Hatching result panel (hidden by default)
  createHatchResultPanel(container);

  // Click overlay to close
  overlay.InputBegan.Connect((input) => {
    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
      screenGui.Enabled = false;
    }
  });
}

// Create header
function createHeader(parent: Frame): Frame {
  const header = new Instance('Frame');
  header.Name = 'Header';
  header.Size = new UDim2(1, 0, 0, 60);
  header.BackgroundColor3 = Color3.fromRGB(40, 35, 55);
  header.BorderSizePixel = 0;
  header.Parent = parent;

  new Instance('UICorner', header).CornerRadius = new UDim(0, 20);

  const title = new Instance('TextLabel');
  title.Size = new UDim2(0.8, 0, 1, 0);
  title.Position = new UDim2(0, 20, 0, 0);
  title.BackgroundTransparency = 1;
  title.Text = '🥚 Dragon Egg Shop';
  title.TextColor3 = Color3.fromRGB(255, 255, 255);
  title.TextXAlignment = Enum.TextXAlignment.Left;
  title.TextScaled = true;
  title.Font = Enum.Font.GothamBold;
  title.Parent = header;

  return header;
}

// Create egg card
function createEggCard(
  parent: Frame,
  eggType: string,
  name: string,
  config: typeof EGG_TYPES.basic,
): Frame {
  const card = new Instance('Frame');
  card.Name = `${eggType}Egg`;
  card.Size = new UDim2(0, 160, 1, 0);
  card.BackgroundColor3 = Color3.fromRGB(50, 45, 65);
  card.Parent = parent;

  const cardCorner = new Instance('UICorner');
  cardCorner.CornerRadius = new UDim(0, 15);
  cardCorner.Parent = card;

  const cardStroke = new Instance('UIStroke');
  cardStroke.Color =
    eggType === 'legendary'
      ? Color3.fromRGB(255, 200, 50)
      : eggType === 'premium'
        ? Color3.fromRGB(180, 100, 255)
        : Color3.fromRGB(100, 100, 100);
  cardStroke.Thickness = 2;
  cardStroke.Parent = card;

  // Egg icon
  const icon = new Instance('TextLabel');
  icon.Size = new UDim2(1, 0, 0, 80);
  icon.Position = new UDim2(0, 0, 0, 20);
  icon.BackgroundTransparency = 1;
  icon.Text =
    eggType === 'legendary'
      ? '🌟🥚🌟'
      : eggType === 'premium'
        ? '✨🥚✨'
        : '🥚';
  icon.TextScaled = true;
  icon.Parent = card;

  // Name
  const nameLabel = new Instance('TextLabel');
  nameLabel.Size = new UDim2(1, -10, 0, 25);
  nameLabel.Position = new UDim2(0, 5, 0, 105);
  nameLabel.BackgroundTransparency = 1;
  nameLabel.Text = name;
  nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
  nameLabel.TextScaled = true;
  nameLabel.Font = Enum.Font.GothamBold;
  nameLabel.Parent = card;

  // Rates info
  const ratesFrame = new Instance('Frame');
  ratesFrame.Size = new UDim2(1, -20, 0, 80);
  ratesFrame.Position = new UDim2(0, 10, 0, 135);
  ratesFrame.BackgroundTransparency = 1;
  ratesFrame.Parent = card;

  let yOffset = 0;
  for (const [rarity, chance] of pairs(config.rates)) {
    if ((chance as number) > 0) {
      const rateLabel = new Instance('TextLabel');
      rateLabel.Size = new UDim2(1, 0, 0, 15);
      rateLabel.Position = new UDim2(0, 0, 0, yOffset);
      rateLabel.BackgroundTransparency = 1;
      rateLabel.Text = `${rarity}: ${chance}%`;
      rateLabel.TextColor3 =
        RARITIES[rarity as keyof typeof RARITIES]?.color ||
        Color3.fromRGB(150, 150, 150);
      rateLabel.TextScaled = true;
      rateLabel.Font = Enum.Font.Gotham;
      rateLabel.Parent = ratesFrame;
      yOffset += 16;
    }
  }

  // Price
  const priceLabel = new Instance('TextLabel');
  priceLabel.Size = new UDim2(1, -10, 0, 25);
  priceLabel.Position = new UDim2(0, 5, 0, 220);
  priceLabel.BackgroundTransparency = 1;
  priceLabel.Text = `${config.currency === 'gems' ? '💎' : '💰'} ${config.cost}`;
  priceLabel.TextColor3 = Color3.fromRGB(200, 200, 200);
  priceLabel.TextScaled = true;
  priceLabel.Font = Enum.Font.GothamBold;
  priceLabel.Parent = card;

  // Buy button
  const buyBtn = new Instance('TextButton');
  buyBtn.Size = new UDim2(1, -20, 0, 40);
  buyBtn.Position = new UDim2(0, 10, 1, -50);
  buyBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 80);
  buyBtn.Text = '🥚 Hatch!';
  buyBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
  buyBtn.TextScaled = true;
  buyBtn.Font = Enum.Font.GothamBold;
  buyBtn.Parent = card;

  const buyBtnCorner = new Instance('UICorner');
  buyBtnCorner.CornerRadius = new UDim(0, 8);
  buyBtnCorner.Parent = buyBtn;

  // Buy button hover effect
  buyBtn.MouseEnter.Connect(() => {
    TweenService.Create(buyBtn, new TweenInfo(0.2), {
      BackgroundColor3: Color3.fromRGB(100, 180, 100),
    }).Play();
  });

  buyBtn.MouseLeave.Connect(() => {
    TweenService.Create(buyBtn, new TweenInfo(0.2), {
      BackgroundColor3: Color3.fromRGB(80, 150, 80),
    }).Play();
  });

  // Buy button click
  buyBtn.MouseButton1Click.Connect(() => {
    hatchEgg(eggType);
  });

  return card;
}

// Create hatch result panel
function createHatchResultPanel(parent: Frame): Frame {
  const panel = new Instance('Frame');
  panel.Name = 'HatchResult';
  panel.Size = new UDim2(1, 0, 1, 0);
  panel.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
  panel.BackgroundTransparency = 0.1;
  panel.Visible = false;
  panel.Parent = parent;

  const panelCorner = new Instance('UICorner');
  panelCorner.CornerRadius = new UDim(0, 20);
  panelCorner.Parent = panel;

  // Result content
  const resultIcon = new Instance('TextLabel');
  resultIcon.Name = 'ResultIcon';
  resultIcon.Size = new UDim2(1, 0, 0, 150);
  resultIcon.Position = new UDim2(0, 0, 0, 80);
  resultIcon.BackgroundTransparency = 1;
  resultIcon.Text = '🐉';
  resultIcon.TextScaled = true;
  resultIcon.Parent = panel;

  const resultName = new Instance('TextLabel');
  resultName.Name = 'ResultName';
  resultName.Size = new UDim2(1, -40, 0, 40);
  resultName.Position = new UDim2(0, 20, 0, 240);
  resultName.BackgroundTransparency = 1;
  resultName.Text = 'Fire Drake (Baby)';
  resultName.TextColor3 = Color3.fromRGB(255, 255, 255);
  resultName.TextScaled = true;
  resultName.Font = Enum.Font.GothamBold;
  resultName.Parent = panel;

  const resultRarity = new Instance('TextLabel');
  resultRarity.Name = 'ResultRarity';
  resultRarity.Size = new UDim2(1, -40, 0, 30);
  resultRarity.Position = new UDim2(0, 20, 0, 285);
  resultRarity.BackgroundTransparency = 1;
  resultRarity.Text = 'Common';
  resultRarity.TextColor3 = Color3.fromRGB(180, 180, 180);
  resultRarity.TextScaled = true;
  resultRarity.Font = Enum.Font.Gotham;
  resultRarity.Parent = panel;

  // Continue button
  const continueBtn = new Instance('TextButton');
  continueBtn.Name = 'ContinueBtn';
  continueBtn.Size = new UDim2(0, 200, 0, 50);
  continueBtn.Position = new UDim2(0.5, 0, 0, 350);
  continueBtn.AnchorPoint = new Vector2(0.5, 0);
  continueBtn.BackgroundColor3 = GAME_THEME.primary;
  continueBtn.Text = 'Continue';
  continueBtn.TextColor3 = Color3.fromRGB(0, 0, 0);
  continueBtn.TextScaled = true;
  continueBtn.Font = Enum.Font.GothamBold;
  continueBtn.Parent = panel;

  const continueBtnCorner = new Instance('UICorner');
  continueBtnCorner.CornerRadius = new UDim(0, 10);
  continueBtnCorner.Parent = continueBtn;

  continueBtn.MouseButton1Click.Connect(() => {
    panel.Visible = false;
  });

  return panel;
}

// Hatch egg function
function hatchEgg(eggType: string): void {
  const remotes = ReplicatedStorage.WaitForChild('DragonRemotes') as Folder;
  const hatchRemote = remotes.WaitForChild('HatchEgg') as RemoteFunction;

  const result = hatchRemote.InvokeServer(eggType) as {
    success: boolean;
    dragonId?: string;
    isShiny?: boolean;
    error?: string;
  };

  const screenGui = PlayerGui.FindFirstChild('EggShop') as
    | ScreenGui
    | undefined;
  if (!screenGui) return;

  const container = screenGui.FindFirstChild('Container') as Frame | undefined;
  if (!container) return;

  const resultPanel = container.FindFirstChild('HatchResult') as
    | Frame
    | undefined;
  if (!resultPanel) return;

  if (result.success && result.dragonId) {
    // Show result
    const icon = resultPanel.FindFirstChild('ResultIcon') as
      | TextLabel
      | undefined;
    const name = resultPanel.FindFirstChild('ResultName') as
      | TextLabel
      | undefined;
    const rarity = resultPanel.FindFirstChild('ResultRarity') as
      | TextLabel
      | undefined;

    if (icon) {
      icon.Text = result.isShiny ? '✨🐉✨' : '🐉';
    }
    if (name) {
      name.Text = result.isShiny
        ? `✨ SHINY ${result.dragonId} ✨`
        : result.dragonId;
    }
    if (rarity) {
      rarity.Text = result.isShiny ? 'SHINY!' : 'Hatched!';
    }

    resultPanel.Visible = true;
  } else {
    // Show error (in a real game, use a notification system)
    print(`❌ Hatch failed: ${result.error}`);
  }
}
