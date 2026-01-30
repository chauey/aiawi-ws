// Dragon Legends - Quest UI (Client)
// View active quests and claim rewards

import { Players, ReplicatedStorage, TweenService } from '@rbxts/services';
import { GAME_THEME } from '../../shared/theme';
import { Quest } from '../../shared/types';

const LocalPlayer = Players.LocalPlayer;
const PlayerGui = LocalPlayer.WaitForChild('PlayerGui') as PlayerGui;

// Create quest UI
export function setupQuestUI(): void {
  const screenGui = new Instance('ScreenGui');
  screenGui.Name = 'QuestUI';
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
  container.Size = new UDim2(0, 500, 0.8, 0);
  container.Position = new UDim2(0.5, 0, 0.5, 0);
  container.AnchorPoint = new Vector2(0.5, 0.5);
  container.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
  container.Parent = screenGui;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 20);
  corner.Parent = container;

  const stroke = new Instance('UIStroke');
  stroke.Color = Color3.fromRGB(100, 200, 100);
  stroke.Thickness = 3;
  stroke.Parent = container;

  // Header
  const header = new Instance('Frame');
  header.Name = 'Header';
  header.Size = new UDim2(1, 0, 0, 60);
  header.BackgroundColor3 = Color3.fromRGB(40, 35, 55);
  header.BorderSizePixel = 0;
  header.Parent = container;

  new Instance('UICorner', header).CornerRadius = new UDim(0, 20);

  const title = new Instance('TextLabel');
  title.Size = new UDim2(0.8, 0, 1, 0);
  title.Position = new UDim2(0, 20, 0, 0);
  title.BackgroundTransparency = 1;
  title.Text = '📋 Quests';
  title.TextColor3 = Color3.fromRGB(255, 255, 255);
  title.TextXAlignment = Enum.TextXAlignment.Left;
  title.TextScaled = true;
  title.Font = Enum.Font.GothamBold;
  title.Parent = header;

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

  new Instance('UICorner', closeBtn).CornerRadius = new UDim(0, 8);

  closeBtn.MouseButton1Click.Connect(() => {
    screenGui.Enabled = false;
  });

  // Tab buttons
  const tabContainer = new Instance('Frame');
  tabContainer.Name = 'TabContainer';
  tabContainer.Size = new UDim2(1, -40, 0, 35);
  tabContainer.Position = new UDim2(0, 20, 0, 70);
  tabContainer.BackgroundTransparency = 1;
  tabContainer.Parent = container;

  const tabLayout = new Instance('UIListLayout');
  tabLayout.FillDirection = Enum.FillDirection.Horizontal;
  tabLayout.Padding = new UDim(0, 10);
  tabLayout.Parent = tabContainer;

  createQuestTab(tabContainer, 'Daily', '📅 Daily', true);
  createQuestTab(tabContainer, 'Weekly', '📆 Weekly', false);
  createQuestTab(tabContainer, 'Achievements', '🏆 Achievements', false);

  // Quest list
  const questList = new Instance('ScrollingFrame');
  questList.Name = 'QuestList';
  questList.Size = new UDim2(1, -40, 1, -130);
  questList.Position = new UDim2(0, 20, 0, 115);
  questList.BackgroundTransparency = 1;
  questList.ScrollBarThickness = 8;
  questList.ScrollBarImageColor3 = GAME_THEME.primary;
  questList.Parent = container;

  const listLayout = new Instance('UIListLayout');
  listLayout.Padding = new UDim(0, 10);
  listLayout.Parent = questList;

  // Click overlay to close
  overlay.InputBegan.Connect((input) => {
    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
      screenGui.Enabled = false;
    }
  });

  // Setup quest refresh
  setupQuestRefresh(screenGui);
}

// Create quest tab
function createQuestTab(
  parent: Frame,
  id: string,
  text: string,
  active: boolean,
): TextButton {
  const button = new Instance('TextButton');
  button.Name = `Tab_${id}`;
  button.Size = new UDim2(0, 130, 1, 0);
  button.BackgroundColor3 = active
    ? Color3.fromRGB(60, 55, 80)
    : Color3.fromRGB(40, 35, 55);
  button.Text = text;
  button.TextColor3 = Color3.fromRGB(255, 255, 255);
  button.TextScaled = true;
  button.Font = Enum.Font.GothamBold;
  button.Parent = parent;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 8);
  corner.Parent = button;

  button.MouseButton1Click.Connect(() => {
    refreshQuests(id.lower());
    updateTabSelection(parent, id);
  });

  return button;
}

// Update tab selection
function updateTabSelection(tabContainer: Frame, activeId: string): void {
  for (const child of tabContainer.GetChildren()) {
    if (child.IsA('TextButton')) {
      child.BackgroundColor3 =
        child.Name === `Tab_${activeId}`
          ? Color3.fromRGB(60, 55, 80)
          : Color3.fromRGB(40, 35, 55);
    }
  }
}

// Create quest card
function createQuestCard(quest: Quest, index: number): Frame {
  const card = new Instance('Frame');
  card.Name = `Quest_${index}`;
  card.Size = new UDim2(1, 0, 0, 100);
  card.BackgroundColor3 = quest.isCompleted
    ? Color3.fromRGB(50, 70, 50)
    : Color3.fromRGB(50, 45, 65);
  card.LayoutOrder = index;

  const cardCorner = new Instance('UICorner');
  cardCorner.CornerRadius = new UDim(0, 12);
  cardCorner.Parent = card;

  const cardStroke = new Instance('UIStroke');
  cardStroke.Color = quest.isCompleted
    ? Color3.fromRGB(100, 200, 100)
    : Color3.fromRGB(80, 75, 100);
  cardStroke.Thickness = 2;
  cardStroke.Parent = card;

  // Quest name
  const nameLabel = new Instance('TextLabel');
  nameLabel.Size = new UDim2(0.6, -10, 0, 25);
  nameLabel.Position = new UDim2(0, 15, 0, 10);
  nameLabel.BackgroundTransparency = 1;
  nameLabel.Text = quest.name;
  nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
  nameLabel.TextXAlignment = Enum.TextXAlignment.Left;
  nameLabel.TextScaled = true;
  nameLabel.Font = Enum.Font.GothamBold;
  nameLabel.Parent = card;

  // Quest description
  const descLabel = new Instance('TextLabel');
  descLabel.Size = new UDim2(0.6, -10, 0, 20);
  descLabel.Position = new UDim2(0, 15, 0, 35);
  descLabel.BackgroundTransparency = 1;
  descLabel.Text = quest.description;
  descLabel.TextColor3 = Color3.fromRGB(180, 180, 180);
  descLabel.TextXAlignment = Enum.TextXAlignment.Left;
  descLabel.TextScaled = true;
  descLabel.Font = Enum.Font.Gotham;
  descLabel.Parent = card;

  // Progress bar
  if (quest.requirements.size() > 0) {
    const req = quest.requirements[0];
    const progress = math.min(req.current / req.target, 1);

    const progressBg = new Instance('Frame');
    progressBg.Size = new UDim2(0.6, -20, 0, 15);
    progressBg.Position = new UDim2(0, 15, 0, 60);
    progressBg.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
    progressBg.Parent = card;

    new Instance('UICorner', progressBg).CornerRadius = new UDim(0, 5);

    const progressFill = new Instance('Frame');
    progressFill.Size = new UDim2(progress, 0, 1, 0);
    progressFill.BackgroundColor3 = quest.isCompleted
      ? Color3.fromRGB(100, 200, 100)
      : GAME_THEME.primary;
    progressFill.Parent = progressBg;

    new Instance('UICorner', progressFill).CornerRadius = new UDim(0, 5);

    const progressLabel = new Instance('TextLabel');
    progressLabel.Size = new UDim2(1, 0, 1, 0);
    progressLabel.BackgroundTransparency = 1;
    progressLabel.Text = `${req.current} / ${req.target}`;
    progressLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
    progressLabel.TextStrokeTransparency = 0;
    progressLabel.TextScaled = true;
    progressLabel.Font = Enum.Font.GothamBold;
    progressLabel.Parent = progressBg;
  }

  // Rewards section (right side)
  const rewardsFrame = new Instance('Frame');
  rewardsFrame.Size = new UDim2(0.35, -10, 0.8, 0);
  rewardsFrame.Position = new UDim2(0.65, 0, 0.1, 0);
  rewardsFrame.BackgroundTransparency = 1;
  rewardsFrame.Parent = card;

  let rewardText = 'Rewards: ';
  if (quest.rewards.coins) rewardText += `${quest.rewards.coins} 💰 `;
  if (quest.rewards.gems) rewardText += `${quest.rewards.gems} 💎 `;
  if (quest.rewards.xp) rewardText += `${quest.rewards.xp} XP `;

  const rewardsLabel = new Instance('TextLabel');
  rewardsLabel.Size = new UDim2(1, 0, 0.5, 0);
  rewardsLabel.BackgroundTransparency = 1;
  rewardsLabel.Text = rewardText;
  rewardsLabel.TextColor3 = Color3.fromRGB(200, 200, 150);
  rewardsLabel.TextScaled = true;
  rewardsLabel.Font = Enum.Font.Gotham;
  rewardsLabel.Parent = rewardsFrame;

  // Claim button (if completed)
  if (quest.isCompleted) {
    const claimBtn = new Instance('TextButton');
    claimBtn.Size = new UDim2(1, 0, 0.45, 0);
    claimBtn.Position = new UDim2(0, 0, 0.55, 0);
    claimBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
    claimBtn.Text = 'Claim!';
    claimBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
    claimBtn.TextScaled = true;
    claimBtn.Font = Enum.Font.GothamBold;
    claimBtn.Parent = rewardsFrame;

    new Instance('UICorner', claimBtn).CornerRadius = new UDim(0, 8);

    claimBtn.MouseButton1Click.Connect(() => {
      claimQuest(quest.questId);
    });

    // Hover effect
    claimBtn.MouseEnter.Connect(() => {
      TweenService.Create(claimBtn, new TweenInfo(0.2), {
        BackgroundColor3: Color3.fromRGB(100, 220, 100),
      }).Play();
    });

    claimBtn.MouseLeave.Connect(() => {
      TweenService.Create(claimBtn, new TweenInfo(0.2), {
        BackgroundColor3: Color3.fromRGB(80, 180, 80),
      }).Play();
    });
  }

  return card;
}

// Claim quest reward
function claimQuest(questId: string): void {
  const remotes = ReplicatedStorage.FindFirstChild('DragonRemotes') as
    | Folder
    | undefined;
  if (!remotes) return;

  const claimRemote = remotes.FindFirstChild('ClaimQuestReward') as
    | RemoteFunction
    | undefined;
  if (!claimRemote) return;

  const result = claimRemote.InvokeServer(questId) as {
    success: boolean;
    error?: string;
  };

  if (result.success) {
    print(`✅ Quest claimed: ${questId}`);
    refreshQuests('daily');
  } else {
    print(`❌ Failed to claim: ${result.error}`);
  }
}

// Refresh quest list
function refreshQuests(questType: string): void {
  const screenGui = PlayerGui.FindFirstChild('QuestUI') as
    | ScreenGui
    | undefined;
  if (!screenGui) return;

  const container = screenGui.FindFirstChild('Container') as Frame | undefined;
  if (!container) return;

  const questList = container.FindFirstChild('QuestList') as
    | ScrollingFrame
    | undefined;
  if (!questList) return;

  // Clear existing quests
  for (const child of questList.GetChildren()) {
    if (child.IsA('Frame')) {
      child.Destroy();
    }
  }

  // Get quests from server
  const remotes = ReplicatedStorage.FindFirstChild('DragonRemotes') as
    | Folder
    | undefined;
  if (!remotes) return;

  const getQuestsRemote = remotes.FindFirstChild('GetQuests') as
    | RemoteFunction
    | undefined;
  if (!getQuestsRemote) return;

  const quests = getQuestsRemote.InvokeServer() as Quest[];

  // Filter by type
  const filtered = quests.filter((q) => q.type === questType);

  // Create cards
  filtered.forEach((quest, index) => {
    const card = createQuestCard(quest, index);
    card.Parent = questList;
  });

  // Update canvas size
  const listLayout = questList.FindFirstChildOfClass('UIListLayout');
  if (listLayout) {
    questList.CanvasSize = new UDim2(
      0,
      0,
      0,
      listLayout.AbsoluteContentSize.Y + 10,
    );
  }
}

// Setup periodic quest refresh
function setupQuestRefresh(screenGui: ScreenGui): void {
  // Refresh when GUI becomes visible
  screenGui.GetPropertyChangedSignal('Enabled').Connect(() => {
    if (screenGui.Enabled) {
      refreshQuests('daily');
    }
  });
}
