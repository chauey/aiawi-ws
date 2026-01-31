/**
 * Hatcher Interaction UI - Client side
 * Popup to select egg type when interacting with hatchers
 */

import { Players, ReplicatedStorage } from '@rbxts/services';

const player = Players.LocalPlayer;
let screenGui: ScreenGui;
let hatcherPanel: Frame;
let currentHatcherId: string | undefined;

// Remotes
let hatcherRemotes: {
  placeEgg?: RemoteFunction;
  collectHatch?: RemoteFunction;
  getStatus?: RemoteFunction;
};

// Egg types available
const EGG_OPTIONS = [
  {
    id: 'basic',
    name: 'Basic Egg',
    cost: 50,
    time: 30,
    color: new Color3(0.8, 0.8, 0.8),
    emoji: '🥚',
  },
  {
    id: 'premium',
    name: 'Premium Egg',
    cost: 250,
    time: 60,
    color: new Color3(0.6, 0.3, 0.8),
    emoji: '💜',
  },
  {
    id: 'legendary',
    name: 'Legendary Egg',
    cost: 1000,
    time: 120,
    color: new Color3(1, 0.8, 0.2),
    emoji: '⭐',
  },
  {
    id: 'mythic',
    name: 'Mythic Egg',
    cost: 5000,
    time: 300,
    color: new Color3(1, 0.3, 0.5),
    emoji: '💎',
  },
];

export function initHatcherUI(): void {
  const playerGui = player.WaitForChild('PlayerGui') as PlayerGui;

  screenGui =
    (playerGui.FindFirstChild('LuckyFishUI') as ScreenGui) ??
    (() => {
      const gui = new Instance('ScreenGui');
      gui.Name = 'LuckyFishUI';
      gui.Parent = playerGui;
      return gui;
    })();

  // Wait for remotes
  task.spawn(() => {
    const remotesFolder = ReplicatedStorage.WaitForChild(
      'HatcherRemotes',
      10,
    ) as Folder | undefined;
    if (remotesFolder) {
      hatcherRemotes = {
        placeEgg: remotesFolder.FindFirstChild('PlaceEgg') as RemoteFunction,
        collectHatch: remotesFolder.FindFirstChild(
          'CollectHatch',
        ) as RemoteFunction,
        getStatus: remotesFolder.FindFirstChild(
          'GetHatcherStatus',
        ) as RemoteFunction,
      };
    }
  });

  createHatcherPanel();
  print('🥚 Hatcher UI initialized!');
}

function createHatcherPanel(): void {
  hatcherPanel = new Instance('Frame');
  hatcherPanel.Name = 'HatcherPanel';
  hatcherPanel.Size = new UDim2(0, 350, 0, 380);
  hatcherPanel.Position = new UDim2(0.5, -175, 0.5, -190);
  hatcherPanel.BackgroundColor3 = new Color3(0.08, 0.1, 0.14);
  hatcherPanel.Visible = false;
  hatcherPanel.Parent = screenGui;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 12);
  corner.Parent = hatcherPanel;

  // Header
  const header = new Instance('Frame');
  header.Size = new UDim2(1, 0, 0, 50);
  header.BackgroundColor3 = new Color3(0.12, 0.14, 0.2);
  header.BorderSizePixel = 0;
  header.Parent = hatcherPanel;

  const headerCorner = new Instance('UICorner');
  headerCorner.CornerRadius = new UDim(0, 12);
  headerCorner.Parent = header;

  const title = new Instance('TextLabel');
  title.Size = new UDim2(0.8, 0, 1, 0);
  title.Position = new UDim2(0, 15, 0, 0);
  title.BackgroundTransparency = 1;
  title.Text = '🥚 Select Egg to Hatch';
  title.TextColor3 = new Color3(1, 1, 1);
  title.TextSize = 18;
  title.Font = Enum.Font.GothamBold;
  title.TextXAlignment = Enum.TextXAlignment.Left;
  title.Parent = header;

  // Close button
  const closeBtn = new Instance('TextButton');
  closeBtn.Size = new UDim2(0, 35, 0, 35);
  closeBtn.Position = new UDim2(1, -42, 0, 7);
  closeBtn.BackgroundColor3 = new Color3(0.7, 0.2, 0.2);
  closeBtn.Text = '✕';
  closeBtn.TextColor3 = new Color3(1, 1, 1);
  closeBtn.TextSize = 16;
  closeBtn.Font = Enum.Font.GothamBold;
  closeBtn.Parent = header;
  closeBtn.MouseButton1Click.Connect(() => hideHatcherPanel());

  const closeBtnCorner = new Instance('UICorner');
  closeBtnCorner.CornerRadius = new UDim(0, 8);
  closeBtnCorner.Parent = closeBtn;

  // Egg options container
  const container = new Instance('Frame');
  container.Name = 'EggContainer';
  container.Size = new UDim2(1, -20, 1, -70);
  container.Position = new UDim2(0, 10, 0, 60);
  container.BackgroundTransparency = 1;
  container.Parent = hatcherPanel;

  const layout = new Instance('UIListLayout');
  layout.Padding = new UDim(0, 8);
  layout.Parent = container;

  // Create egg option buttons
  for (const egg of EGG_OPTIONS) {
    createEggOption(container, egg);
  }
}

function createEggOption(parent: Frame, egg: (typeof EGG_OPTIONS)[0]): void {
  const option = new Instance('TextButton');
  option.Name = egg.id;
  option.Size = new UDim2(1, 0, 0, 70);
  option.BackgroundColor3 = new Color3(0.14, 0.16, 0.2);
  option.AutoButtonColor = false;
  option.Text = '';
  option.Parent = parent;

  const optionCorner = new Instance('UICorner');
  optionCorner.CornerRadius = new UDim(0, 8);
  optionCorner.Parent = option;

  // Egg icon
  const icon = new Instance('TextLabel');
  icon.Size = new UDim2(0, 50, 0, 50);
  icon.Position = new UDim2(0, 10, 0.5, -25);
  icon.BackgroundColor3 = egg.color;
  icon.Text = egg.emoji;
  icon.TextSize = 24;
  icon.Parent = option;

  const iconCorner = new Instance('UICorner');
  iconCorner.CornerRadius = new UDim(0, 8);
  iconCorner.Parent = icon;

  // Name
  const name = new Instance('TextLabel');
  name.Size = new UDim2(0.5, 0, 0, 20);
  name.Position = new UDim2(0, 70, 0, 12);
  name.BackgroundTransparency = 1;
  name.Text = egg.name;
  name.TextColor3 = new Color3(1, 1, 1);
  name.TextSize = 14;
  name.Font = Enum.Font.GothamBold;
  name.TextXAlignment = Enum.TextXAlignment.Left;
  name.Parent = option;

  // Info
  const info = new Instance('TextLabel');
  info.Size = new UDim2(0.5, 0, 0, 16);
  info.Position = new UDim2(0, 70, 0, 34);
  info.BackgroundTransparency = 1;
  info.Text = `⏱️ ${egg.time}s`;
  info.TextColor3 = new Color3(0.6, 0.6, 0.6);
  info.TextSize = 12;
  info.Font = Enum.Font.Gotham;
  info.TextXAlignment = Enum.TextXAlignment.Left;
  info.Parent = option;

  // Cost badge
  const costBadge = new Instance('TextLabel');
  costBadge.Size = new UDim2(0, 80, 0, 30);
  costBadge.Position = new UDim2(1, -90, 0.5, -15);
  costBadge.BackgroundColor3 = new Color3(0.3, 0.5, 0.3);
  costBadge.Text = `💰 ${egg.cost}`;
  costBadge.TextColor3 = new Color3(1, 1, 1);
  costBadge.TextSize = 14;
  costBadge.Font = Enum.Font.GothamBold;
  costBadge.Parent = option;

  const costCorner = new Instance('UICorner');
  costCorner.CornerRadius = new UDim(0, 6);
  costCorner.Parent = costBadge;

  // Hover effect
  option.MouseEnter.Connect(() => {
    option.BackgroundColor3 = new Color3(0.2, 0.22, 0.28);
  });
  option.MouseLeave.Connect(() => {
    option.BackgroundColor3 = new Color3(0.14, 0.16, 0.2);
  });

  // Click to place egg
  option.MouseButton1Click.Connect(() => {
    placeEggInHatcher(egg.id);
  });
}

function placeEggInHatcher(eggType: string): void {
  if (!currentHatcherId || !hatcherRemotes?.placeEgg) return;

  const result = hatcherRemotes.placeEgg.InvokeServer(
    currentHatcherId,
    eggType,
  ) as {
    success: boolean;
    message: string;
  };

  if (result.success) {
    hideHatcherPanel();
    showNotification(result.message, new Color3(0.3, 0.8, 0.4));
  } else {
    showNotification(result.message, new Color3(0.8, 0.3, 0.3));
  }
}

export function showHatcherPanel(hatcherId: string): void {
  currentHatcherId = hatcherId;
  hatcherPanel.Visible = true;
}

export function hideHatcherPanel(): void {
  hatcherPanel.Visible = false;
  currentHatcherId = undefined;
}

function showNotification(message: string, color: Color3): void {
  const notification = new Instance('Frame');
  notification.Size = new UDim2(0, 300, 0, 50);
  notification.Position = new UDim2(0.5, -150, 0, 100);
  notification.BackgroundColor3 = color;
  notification.Parent = screenGui;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 8);
  corner.Parent = notification;

  const text = new Instance('TextLabel');
  text.Size = new UDim2(1, 0, 1, 0);
  text.BackgroundTransparency = 1;
  text.Text = message;
  text.TextColor3 = new Color3(1, 1, 1);
  text.TextSize = 16;
  text.Font = Enum.Font.GothamBold;
  text.Parent = notification;

  task.delay(3, () => notification.Destroy());
}

// Initialize on load
task.defer(() => {
  task.wait(1);
  initHatcherUI();
});
