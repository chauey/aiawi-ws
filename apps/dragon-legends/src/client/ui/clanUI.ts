// Dragon Legends - Clan UI (Client)
// View clans, create clans, manage membership

import { Players, ReplicatedStorage, TweenService } from '@rbxts/services';
import { GAME_THEME } from '../../shared/theme';
import { ClanData } from '../../shared/types';

const LocalPlayer = Players.LocalPlayer;
const PlayerGui = LocalPlayer.WaitForChild('PlayerGui') as PlayerGui;

// Create clan UI
export function setupClanUI(): void {
  const screenGui = new Instance('ScreenGui');
  screenGui.Name = 'ClanUI';
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
  container.Size = new UDim2(0.7, 0, 0.8, 0);
  container.Position = new UDim2(0.5, 0, 0.5, 0);
  container.AnchorPoint = new Vector2(0.5, 0.5);
  container.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
  container.Parent = screenGui;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 20);
  corner.Parent = container;

  const stroke = new Instance('UIStroke');
  stroke.Color = Color3.fromRGB(200, 150, 100); // Clan color
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
  title.Text = '🏰 Clans';
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
  tabContainer.Size = new UDim2(1, -40, 0, 40);
  tabContainer.Position = new UDim2(0, 20, 0, 70);
  tabContainer.BackgroundTransparency = 1;
  tabContainer.Parent = container;

  const tabLayout = new Instance('UIListLayout');
  tabLayout.FillDirection = Enum.FillDirection.Horizontal;
  tabLayout.Padding = new UDim(0, 10);
  tabLayout.Parent = tabContainer;

  createTabButton(tabContainer, 'MyClan', '🏰 My Clan', true);
  createTabButton(tabContainer, 'Browse', '🔍 Browse', false);
  createTabButton(tabContainer, 'Leaderboard', '🏆 Leaderboard', false);

  // Tab content
  const tabContent = new Instance('Frame');
  tabContent.Name = 'TabContent';
  tabContent.Size = new UDim2(1, -40, 1, -140);
  tabContent.Position = new UDim2(0, 20, 0, 120);
  tabContent.BackgroundTransparency = 1;
  tabContent.Parent = container;

  // My Clan tab content
  createMyClanTab(tabContent);

  // Browse tab content
  createBrowseTab(tabContent);

  // Leaderboard tab content
  createLeaderboardTab(tabContent);

  // Click overlay to close
  overlay.InputBegan.Connect((input) => {
    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
      screenGui.Enabled = false;
    }
  });
}

// Create tab button
function createTabButton(
  parent: Frame,
  id: string,
  text: string,
  active: boolean,
): TextButton {
  const button = new Instance('TextButton');
  button.Name = `Tab_${id}`;
  button.Size = new UDim2(0, 140, 1, 0);
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
    switchTab(id);
  });

  return button;
}

// Switch tabs
function switchTab(tabId: string): void {
  const screenGui = PlayerGui.FindFirstChild('ClanUI') as ScreenGui | undefined;
  if (!screenGui) return;

  const container = screenGui.FindFirstChild('Container') as Frame | undefined;
  if (!container) return;

  const tabContent = container.FindFirstChild('TabContent') as
    | Frame
    | undefined;
  if (!tabContent) return;

  // Update tab buttons
  const tabContainer = container.FindFirstChild('TabContainer') as
    | Frame
    | undefined;
  if (tabContainer) {
    for (const child of tabContainer.GetChildren()) {
      if (child.IsA('TextButton')) {
        child.BackgroundColor3 =
          child.Name === `Tab_${tabId}`
            ? Color3.fromRGB(60, 55, 80)
            : Color3.fromRGB(40, 35, 55);
      }
    }
  }

  // Show/hide content
  for (const child of tabContent.GetChildren()) {
    if (child.IsA('Frame')) {
      child.Visible = child.Name === `${tabId}Content`;
    }
  }
}

// Create My Clan tab
function createMyClanTab(parent: Frame): void {
  const content = new Instance('Frame');
  content.Name = 'MyClanContent';
  content.Size = new UDim2(1, 0, 1, 0);
  content.BackgroundTransparency = 1;
  content.Visible = true;
  content.Parent = parent;

  // No clan state
  const noClanFrame = new Instance('Frame');
  noClanFrame.Name = 'NoClanState';
  noClanFrame.Size = new UDim2(1, 0, 1, 0);
  noClanFrame.BackgroundTransparency = 1;
  noClanFrame.Parent = content;

  const noClanIcon = new Instance('TextLabel');
  noClanIcon.Size = new UDim2(1, 0, 0, 100);
  noClanIcon.Position = new UDim2(0, 0, 0, 50);
  noClanIcon.BackgroundTransparency = 1;
  noClanIcon.Text = '🏰';
  noClanIcon.TextScaled = true;
  noClanIcon.Parent = noClanFrame;

  const noClanText = new Instance('TextLabel');
  noClanText.Size = new UDim2(1, -40, 0, 30);
  noClanText.Position = new UDim2(0, 20, 0, 160);
  noClanText.BackgroundTransparency = 1;
  noClanText.Text = 'You are not in a clan';
  noClanText.TextColor3 = Color3.fromRGB(180, 180, 180);
  noClanText.TextScaled = true;
  noClanText.Font = Enum.Font.Gotham;
  noClanText.Parent = noClanFrame;

  // Create clan button
  const createBtn = new Instance('TextButton');
  createBtn.Size = new UDim2(0, 200, 0, 50);
  createBtn.Position = new UDim2(0.5, -110, 0, 220);
  createBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 80);
  createBtn.Text = 'Create Clan (1000 💰)';
  createBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
  createBtn.TextScaled = true;
  createBtn.Font = Enum.Font.GothamBold;
  createBtn.Parent = noClanFrame;

  new Instance('UICorner', createBtn).CornerRadius = new UDim(0, 10);

  createBtn.MouseButton1Click.Connect(() => {
    showCreateClanDialog();
  });

  // Browse clans button
  const browseBtn = new Instance('TextButton');
  browseBtn.Size = new UDim2(0, 200, 0, 50);
  browseBtn.Position = new UDim2(0.5, 110, 0, 220);
  browseBtn.AnchorPoint = new Vector2(1, 0);
  browseBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 150);
  browseBtn.Text = 'Browse Clans';
  browseBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
  browseBtn.TextScaled = true;
  browseBtn.Font = Enum.Font.GothamBold;
  browseBtn.Parent = noClanFrame;

  new Instance('UICorner', browseBtn).CornerRadius = new UDim(0, 10);

  browseBtn.MouseButton1Click.Connect(() => {
    switchTab('Browse');
  });
}

// Create Browse tab
function createBrowseTab(parent: Frame): void {
  const content = new Instance('Frame');
  content.Name = 'BrowseContent';
  content.Size = new UDim2(1, 0, 1, 0);
  content.BackgroundTransparency = 1;
  content.Visible = false;
  content.Parent = parent;

  // Search bar
  const searchContainer = new Instance('Frame');
  searchContainer.Size = new UDim2(1, 0, 0, 40);
  searchContainer.BackgroundColor3 = Color3.fromRGB(40, 35, 55);
  searchContainer.Parent = content;

  new Instance('UICorner', searchContainer).CornerRadius = new UDim(0, 10);

  const searchInput = new Instance('TextBox');
  searchInput.Name = 'SearchInput';
  searchInput.Size = new UDim2(1, -120, 1, -10);
  searchInput.Position = new UDim2(0, 10, 0, 5);
  searchInput.BackgroundTransparency = 1;
  searchInput.PlaceholderText = 'Search clans...';
  searchInput.PlaceholderColor3 = Color3.fromRGB(120, 120, 120);
  searchInput.Text = '';
  searchInput.TextColor3 = Color3.fromRGB(255, 255, 255);
  searchInput.TextXAlignment = Enum.TextXAlignment.Left;
  searchInput.TextScaled = true;
  searchInput.Font = Enum.Font.Gotham;
  searchInput.Parent = searchContainer;

  const searchBtn = new Instance('TextButton');
  searchBtn.Size = new UDim2(0, 100, 1, -10);
  searchBtn.Position = new UDim2(1, -105, 0, 5);
  searchBtn.BackgroundColor3 = GAME_THEME.primary;
  searchBtn.Text = '🔍 Search';
  searchBtn.TextColor3 = Color3.fromRGB(0, 0, 0);
  searchBtn.TextScaled = true;
  searchBtn.Font = Enum.Font.GothamBold;
  searchBtn.Parent = searchContainer;

  new Instance('UICorner', searchBtn).CornerRadius = new UDim(0, 8);

  // Results list
  const resultsList = new Instance('ScrollingFrame');
  resultsList.Name = 'ResultsList';
  resultsList.Size = new UDim2(1, 0, 1, -50);
  resultsList.Position = new UDim2(0, 0, 0, 50);
  resultsList.BackgroundTransparency = 1;
  resultsList.ScrollBarThickness = 8;
  resultsList.ScrollBarImageColor3 = GAME_THEME.primary;
  resultsList.Parent = content;

  const listLayout = new Instance('UIListLayout');
  listLayout.Padding = new UDim(0, 10);
  listLayout.Parent = resultsList;
}

// Create Leaderboard tab
function createLeaderboardTab(parent: Frame): void {
  const content = new Instance('Frame');
  content.Name = 'LeaderboardContent';
  content.Size = new UDim2(1, 0, 1, 0);
  content.BackgroundTransparency = 1;
  content.Visible = false;
  content.Parent = parent;

  // Header
  const headerFrame = new Instance('Frame');
  headerFrame.Size = new UDim2(1, 0, 0, 40);
  headerFrame.BackgroundColor3 = Color3.fromRGB(40, 35, 55);
  headerFrame.Parent = content;

  new Instance('UICorner', headerFrame).CornerRadius = new UDim(0, 10);

  const rankLabel = new Instance('TextLabel');
  rankLabel.Size = new UDim2(0.1, 0, 1, 0);
  rankLabel.BackgroundTransparency = 1;
  rankLabel.Text = '#';
  rankLabel.TextColor3 = Color3.fromRGB(180, 180, 180);
  rankLabel.TextScaled = true;
  rankLabel.Font = Enum.Font.GothamBold;
  rankLabel.Parent = headerFrame;

  const nameLabel = new Instance('TextLabel');
  nameLabel.Size = new UDim2(0.5, 0, 1, 0);
  nameLabel.Position = new UDim2(0.1, 0, 0, 0);
  nameLabel.BackgroundTransparency = 1;
  nameLabel.Text = 'Clan';
  nameLabel.TextColor3 = Color3.fromRGB(180, 180, 180);
  nameLabel.TextScaled = true;
  nameLabel.TextXAlignment = Enum.TextXAlignment.Left;
  nameLabel.Font = Enum.Font.GothamBold;
  nameLabel.Parent = headerFrame;

  const scoreLabel = new Instance('TextLabel');
  scoreLabel.Size = new UDim2(0.2, 0, 1, 0);
  scoreLabel.Position = new UDim2(0.6, 0, 0, 0);
  scoreLabel.BackgroundTransparency = 1;
  scoreLabel.Text = 'War Score';
  scoreLabel.TextColor3 = Color3.fromRGB(180, 180, 180);
  scoreLabel.TextScaled = true;
  scoreLabel.Font = Enum.Font.GothamBold;
  scoreLabel.Parent = headerFrame;

  const membersLabel = new Instance('TextLabel');
  membersLabel.Size = new UDim2(0.2, 0, 1, 0);
  membersLabel.Position = new UDim2(0.8, 0, 0, 0);
  membersLabel.BackgroundTransparency = 1;
  membersLabel.Text = 'Members';
  membersLabel.TextColor3 = Color3.fromRGB(180, 180, 180);
  membersLabel.TextScaled = true;
  membersLabel.Font = Enum.Font.GothamBold;
  membersLabel.Parent = headerFrame;

  // Leaderboard list
  const leaderboardList = new Instance('ScrollingFrame');
  leaderboardList.Name = 'LeaderboardList';
  leaderboardList.Size = new UDim2(1, 0, 1, -50);
  leaderboardList.Position = new UDim2(0, 0, 0, 50);
  leaderboardList.BackgroundTransparency = 1;
  leaderboardList.ScrollBarThickness = 8;
  leaderboardList.ScrollBarImageColor3 = GAME_THEME.primary;
  leaderboardList.Parent = content;

  const listLayout = new Instance('UIListLayout');
  listLayout.Padding = new UDim(0, 5);
  listLayout.Parent = leaderboardList;
}

// Show create clan dialog
function showCreateClanDialog(): void {
  // In a real implementation, this would open a dialog
  // For now, just print
  print('🏰 Create Clan dialog would open here');
}
