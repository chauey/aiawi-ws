// Dragon Legends - Main HUD (Client)
// Currency display, quick actions, and notifications

import { Players, ReplicatedStorage, TweenService } from '@rbxts/services';
import { GAME_THEME } from '../../shared/theme';

const LocalPlayer = Players.LocalPlayer;
const PlayerGui = LocalPlayer.WaitForChild('PlayerGui') as PlayerGui;

// Create main HUD
export function setupMainHUD(): void {
  // Create screen GUI
  const screenGui = new Instance('ScreenGui');
  screenGui.Name = 'MainHUD';
  screenGui.ResetOnSpawn = false;
  screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
  screenGui.Parent = PlayerGui;

  // Top bar for currency
  const topBar = new Instance('Frame');
  topBar.Name = 'TopBar';
  topBar.Size = new UDim2(1, 0, 0, 50);
  topBar.Position = new UDim2(0, 0, 0, 0);
  topBar.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
  topBar.BackgroundTransparency = 0.3;
  topBar.BorderSizePixel = 0;
  topBar.Parent = screenGui;

  // Gradient
  const gradient = new Instance('UIGradient');
  gradient.Color = new ColorSequence([
    new ColorSequenceKeypoint(0, Color3.fromRGB(50, 40, 70)),
    new ColorSequenceKeypoint(1, Color3.fromRGB(30, 25, 40)),
  ]);
  gradient.Parent = topBar;

  // Coin display
  const coinFrame = createCurrencyDisplay(
    GAME_THEME.currencyEmoji,
    GAME_THEME.currency,
    'CoinDisplay',
  );
  coinFrame.Position = new UDim2(0, 20, 0.5, 0);
  coinFrame.AnchorPoint = new Vector2(0, 0.5);
  coinFrame.Parent = topBar;

  // Gem display
  const gemFrame = createCurrencyDisplay(
    GAME_THEME.secondaryCurrencyEmoji,
    GAME_THEME.secondaryCurrency,
    'GemDisplay',
  );
  gemFrame.Position = new UDim2(0, 200, 0.5, 0);
  gemFrame.AnchorPoint = new Vector2(0, 0.5);
  gemFrame.Parent = topBar;

  // Quick action buttons (right side)
  const actionsFrame = new Instance('Frame');
  actionsFrame.Name = 'QuickActions';
  actionsFrame.Size = new UDim2(0, 300, 1, 0);
  actionsFrame.Position = new UDim2(1, -310, 0, 0);
  actionsFrame.BackgroundTransparency = 1;
  actionsFrame.Parent = topBar;

  const actionsLayout = new Instance('UIListLayout');
  actionsLayout.FillDirection = Enum.FillDirection.Horizontal;
  actionsLayout.HorizontalAlignment = Enum.HorizontalAlignment.Right;
  actionsLayout.Padding = new UDim(0, 10);
  actionsLayout.Parent = actionsFrame;

  // Action buttons
  createQuickButton('🐉', 'Dragons [E]', 'OpenDragons', actionsFrame);
  createQuickButton('🥚', 'Eggs [Q]', 'OpenEggs', actionsFrame);
  createQuickButton('📋', 'Quests [T]', 'OpenQuests', actionsFrame);
  createQuickButton('🏰', 'Clan [G]', 'OpenClan', actionsFrame);

  // Bottom center - Dragon info bar
  const dragonBar = new Instance('Frame');
  dragonBar.Name = 'DragonBar';
  dragonBar.Size = new UDim2(0, 400, 0, 80);
  dragonBar.Position = new UDim2(0.5, 0, 1, -100);
  dragonBar.AnchorPoint = new Vector2(0.5, 0);
  dragonBar.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
  dragonBar.BackgroundTransparency = 0.2;
  dragonBar.Parent = screenGui;

  const dragonCorner = new Instance('UICorner');
  dragonCorner.CornerRadius = new UDim(0, 15);
  dragonCorner.Parent = dragonBar;

  const dragonStroke = new Instance('UIStroke');
  dragonStroke.Color = GAME_THEME.primary;
  dragonStroke.Thickness = 2;
  dragonStroke.Parent = dragonBar;

  // Active dragon slot 1
  createDragonSlot(dragonBar, 1, new UDim2(0, 20, 0.5, 0));
  createDragonSlot(dragonBar, 2, new UDim2(0.5, 0, 0.5, 0));
  createDragonSlot(dragonBar, 3, new UDim2(1, -80, 0.5, 0));

  // Start update loop
  setupUpdateLoop(screenGui);
}

// Create currency display frame
function createCurrencyDisplay(
  emoji: string,
  name: string,
  displayName: string,
): Frame {
  const frame = new Instance('Frame');
  frame.Name = displayName;
  frame.Size = new UDim2(0, 150, 0, 40);
  frame.BackgroundColor3 = Color3.fromRGB(40, 35, 50);
  frame.BackgroundTransparency = 0.5;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 10);
  corner.Parent = frame;

  const stroke = new Instance('UIStroke');
  stroke.Color = Color3.fromRGB(80, 70, 100);
  stroke.Thickness = 1;
  stroke.Parent = frame;

  const icon = new Instance('TextLabel');
  icon.Name = 'Icon';
  icon.Size = new UDim2(0, 40, 1, 0);
  icon.Position = new UDim2(0, 5, 0, 0);
  icon.BackgroundTransparency = 1;
  icon.Text = emoji;
  icon.TextScaled = true;
  icon.Font = Enum.Font.GothamBold;
  icon.Parent = frame;

  const amount = new Instance('TextLabel');
  amount.Name = 'Amount';
  amount.Size = new UDim2(1, -50, 1, 0);
  amount.Position = new UDim2(0, 45, 0, 0);
  amount.BackgroundTransparency = 1;
  amount.Text = '0';
  amount.TextColor3 = Color3.fromRGB(255, 255, 255);
  amount.TextXAlignment = Enum.TextXAlignment.Left;
  amount.TextScaled = true;
  amount.Font = Enum.Font.GothamBold;
  amount.Parent = frame;

  return frame;
}

// Create quick action button
function createQuickButton(
  emoji: string,
  tooltip: string,
  actionName: string,
  parent: Frame,
): TextButton {
  const button = new Instance('TextButton');
  button.Name = actionName;
  button.Size = new UDim2(0, 45, 0, 40);
  button.BackgroundColor3 = Color3.fromRGB(60, 50, 80);
  button.Text = emoji;
  button.TextScaled = true;
  button.Font = Enum.Font.GothamBold;
  button.Parent = parent;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 8);
  corner.Parent = button;

  // Hover effect
  button.MouseEnter.Connect(() => {
    TweenService.Create(button, new TweenInfo(0.2), {
      BackgroundColor3: Color3.fromRGB(80, 70, 110),
    }).Play();
  });

  button.MouseLeave.Connect(() => {
    TweenService.Create(button, new TweenInfo(0.2), {
      BackgroundColor3: Color3.fromRGB(60, 50, 80),
    }).Play();
  });

  // Click handler
  button.MouseButton1Click.Connect(() => {
    handleQuickAction(actionName);
  });

  return button;
}

// Create dragon slot in bottom bar
function createDragonSlot(
  parent: Frame,
  slotNumber: number,
  position: UDim2,
): Frame {
  const slot = new Instance('Frame');
  slot.Name = `Slot${slotNumber}`;
  slot.Size = new UDim2(0, 60, 0, 60);
  slot.Position = position;
  slot.AnchorPoint = new Vector2(0, 0.5);
  slot.BackgroundColor3 = Color3.fromRGB(50, 45, 65);
  slot.Parent = parent;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 10);
  corner.Parent = slot;

  const stroke = new Instance('UIStroke');
  stroke.Color = Color3.fromRGB(100, 90, 130);
  stroke.Thickness = 2;
  stroke.Parent = slot;

  const icon = new Instance('TextLabel');
  icon.Name = 'Icon';
  icon.Size = new UDim2(1, 0, 0.7, 0);
  icon.BackgroundTransparency = 1;
  icon.Text = slotNumber === 1 ? '🐉' : '➕';
  icon.TextScaled = true;
  icon.TextColor3 = Color3.fromRGB(200, 200, 200);
  icon.Font = Enum.Font.GothamBold;
  icon.Parent = slot;

  const level = new Instance('TextLabel');
  level.Name = 'Level';
  level.Size = new UDim2(1, 0, 0.3, 0);
  level.Position = new UDim2(0, 0, 0.7, 0);
  level.BackgroundTransparency = 1;
  level.Text = slotNumber === 1 ? 'Lv.1' : '';
  level.TextScaled = true;
  level.TextColor3 = Color3.fromRGB(150, 150, 150);
  level.Font = Enum.Font.Gotham;
  level.Parent = slot;

  return slot;
}

// Handle quick action button clicks
function handleQuickAction(actionName: string): void {
  switch (actionName) {
    case 'OpenDragons': {
      const gui = PlayerGui.FindFirstChild('DragonMenu') as
        | ScreenGui
        | undefined;
      if (gui) gui.Enabled = !gui.Enabled;
      break;
    }
    case 'OpenEggs': {
      const gui = PlayerGui.FindFirstChild('EggShop') as ScreenGui | undefined;
      if (gui) gui.Enabled = !gui.Enabled;
      break;
    }
    case 'OpenQuests': {
      const gui = PlayerGui.FindFirstChild('QuestUI') as ScreenGui | undefined;
      if (gui) gui.Enabled = !gui.Enabled;
      break;
    }
    case 'OpenClan': {
      const gui = PlayerGui.FindFirstChild('ClanUI') as ScreenGui | undefined;
      if (gui) gui.Enabled = !gui.Enabled;
      break;
    }
  }
}

// Update loop for currency display
function setupUpdateLoop(screenGui: ScreenGui): void {
  task.spawn(() => {
    while (screenGui.Parent) {
      // Get leaderstats
      const leaderstats = LocalPlayer.FindFirstChild('leaderstats') as
        | Folder
        | undefined;
      if (leaderstats) {
        const coins = leaderstats.FindFirstChild(GAME_THEME.currency) as
          | IntValue
          | undefined;
        const gems = leaderstats.FindFirstChild(
          GAME_THEME.secondaryCurrency,
        ) as IntValue | undefined;

        const topBar = screenGui.FindFirstChild('TopBar') as Frame | undefined;
        if (topBar) {
          const coinDisplay = topBar.FindFirstChild('CoinDisplay') as
            | Frame
            | undefined;
          const gemDisplay = topBar.FindFirstChild('GemDisplay') as
            | Frame
            | undefined;

          if (coinDisplay && coins) {
            const amount = coinDisplay.FindFirstChild('Amount') as
              | TextLabel
              | undefined;
            if (amount) amount.Text = formatNumber(coins.Value);
          }

          if (gemDisplay && gems) {
            const amount = gemDisplay.FindFirstChild('Amount') as
              | TextLabel
              | undefined;
            if (amount) amount.Text = formatNumber(gems.Value);
          }
        }
      }

      task.wait(0.5);
    }
  });
}

// Format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${string.format('%.1f', num / 1000000)}M`;
  } else if (num >= 1000) {
    return `${string.format('%.1f', num / 1000)}K`;
  }
  return tostring(num);
}
