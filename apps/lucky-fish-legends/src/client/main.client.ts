// Client-side UI and effects for coin game
import {
  Players,
  UserInputService,
  StarterGui,
  ReplicatedStorage,
  Lighting,
} from '@rbxts/services';
import { createDailyRewardsUI } from './dailyRewardsUI';
import { createShopUI } from './shopUI';
import { createMapShopUI } from './mapShopUI';
import { createLeaderboardUI } from './leaderboardUI';
import { createMusicSystem } from './musicSystem';
import { createTradingUI } from './tradingUI';
import { createStealingUI } from './stealingUI';
import { createEggShopUI } from './eggShopUI';
import { createRebirthUI } from './rebirthUI';
import { createQuestUI } from './questUI';
import { createLuckyWheelUI } from './luckyWheelUI';
import { createEvolutionUI } from './evolutionUI';
import { createCodesUI } from './codesUI';
import { createVIPUI } from './vipUI';
import { createEventsUI } from './eventsUI';
import { createFusionUI } from './fusionUI';
import { createAchievementsUI } from './achievementsUI';
import { createClansUI } from './clansUI';
import { createPremiumUI } from './premiumUI';
import { createBattlesUI } from './battlesUI';
import { createPrivateServerUI } from './privateServerUI';
import { createMinigamesUI } from './minigamesUI';
import { createBottomActionBar, registerActionCallback } from './actionBar';
import { getTutorialSteps } from 'shared/featureRegistry';
import { createUIToggle } from './uiToggle';
import { createBattlePassUI, toggleBattlePass } from './battlePassUI';
import { createPetSelectionUI } from './petUI';
import { createStarterPackUI, showStarterPackPopup } from './starterPackUI';
import { createLimitedOffersUI } from './limitedOffersUI';
import { initFishingUI, toggleFishingUI } from './fishingUI';
import { initHatcherUI } from './hatcherUI';

const player = Players.LocalPlayer;

print(`🎮 Welcome ${player.Name}! Collect the golden coins!`);

// Create a simple UI to show controls
function createUI() {
  const screenGui = new Instance('ScreenGui');
  screenGui.Name = 'CoinGameUI';
  screenGui.ResetOnSpawn = false;

  // Instructions panel
  const frame = new Instance('Frame');
  frame.Name = 'Instructions';
  frame.Size = new UDim2(0, 250, 0, 80);
  frame.Position = new UDim2(0, 10, 1, -90);
  frame.BackgroundColor3 = new Color3(0, 0, 0);
  frame.BackgroundTransparency = 0.5;
  frame.BorderSizePixel = 0;
  frame.Parent = screenGui;

  // Round corners
  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 12);
  corner.Parent = frame;

  // Title
  const title = new Instance('TextLabel');
  title.Name = 'Title';
  title.Size = new UDim2(1, 0, 0, 30);
  title.Position = new UDim2(0, 0, 0, 5);
  title.BackgroundTransparency = 1;
  title.Text = '🪙 COIN COLLECTION';
  title.TextColor3 = new Color3(1, 0.85, 0);
  title.TextSize = 18;
  title.Font = Enum.Font.GothamBold;
  title.Parent = frame;

  // Instructions text
  const instructions = new Instance('TextLabel');
  instructions.Name = 'InstructionsText';
  instructions.Size = new UDim2(1, -20, 0, 40);
  instructions.Position = new UDim2(0, 10, 0, 35);
  instructions.BackgroundTransparency = 1;
  instructions.Text =
    'Walk into golden coins to collect them!\nYour score shows on the leaderboard.';
  instructions.TextColor3 = new Color3(1, 1, 1);
  instructions.TextSize = 12;
  instructions.Font = Enum.Font.Gotham;
  instructions.TextWrapped = true;
  instructions.TextXAlignment = Enum.TextXAlignment.Left;
  instructions.Parent = frame;

  screenGui.Parent = player.WaitForChild('PlayerGui');

  // Fade out after 10 seconds
  task.delay(10, () => {
    for (let i = 0; i <= 20; i++) {
      frame.BackgroundTransparency = 0.5 + i * 0.025;
      title.TextTransparency = i * 0.05;
      instructions.TextTransparency = i * 0.05;
      task.wait(0.05);
    }
    screenGui.Destroy();
  });
}

// Triple jump ability for fun movement
let jumpsRemaining = 2; // 2 extra jumps (3 total)
const MAX_EXTRA_JUMPS = 2;

function onJumpRequest() {
  const character = player.Character;
  const humanoid = character?.FindFirstChildOfClass('Humanoid');

  if (!humanoid) return;

  if (humanoid.FloorMaterial === Enum.Material.Air && jumpsRemaining > 0) {
    jumpsRemaining--;
    humanoid.ChangeState(Enum.HumanoidStateType.Jumping);
    print(`🦘 Jump ${MAX_EXTRA_JUMPS + 1 - jumpsRemaining}/3!`);
  }
}

// Reset jumps when landing
function setupJumpReset() {
  const character = player.Character || player.CharacterAdded.Wait()[0];
  const humanoid = character?.FindFirstChildOfClass('Humanoid');

  if (humanoid) {
    humanoid.StateChanged.Connect((_, newState) => {
      if (newState === Enum.HumanoidStateType.Landed) {
        jumpsRemaining = MAX_EXTRA_JUMPS;
      }
    });
  }
}

player.CharacterAdded.Connect(setupJumpReset);
if (player.Character) setupJumpReset();

// Sprint ability with Shift
let isSprinting = false;
const DEFAULT_SPEED = 16;
const SPRINT_SPEED = 32;

function updateSpeed() {
  const character = player.Character;
  const humanoid = character?.FindFirstChildOfClass('Humanoid');
  if (humanoid) {
    humanoid.WalkSpeed = isSprinting ? SPRINT_SPEED : DEFAULT_SPEED;
  }
}

UserInputService.InputBegan.Connect((input, gameProcessed) => {
  if (gameProcessed) return;

  if (input.KeyCode === Enum.KeyCode.LeftShift) {
    isSprinting = true;
    updateSpeed();
    print('🏃 Sprint activated!');
  }

  if (input.KeyCode === Enum.KeyCode.Space) {
    onJumpRequest();
  }
});

UserInputService.InputEnded.Connect((input) => {
  if (input.KeyCode === Enum.KeyCode.LeftShift) {
    isSprinting = false;
    updateSpeed();
  }
});

// E key to exit roller coaster
UserInputService.InputBegan.Connect((input, processed) => {
  if (processed) return;
  if (input.KeyCode === Enum.KeyCode.E) {
    const exitRemote = ReplicatedStorage.FindFirstChild('CoasterExit') as
      | RemoteEvent
      | undefined;
    if (exitRemote) {
      exitRemote.FireServer();
    }
  }
});

// Tutorial popup for new players
function showTutorial() {
  const screenGui = new Instance('ScreenGui');
  screenGui.Name = 'TutorialUI';
  screenGui.ResetOnSpawn = false;
  screenGui.DisplayOrder = 100;

  // Dark overlay
  const overlay = new Instance('Frame');
  overlay.Name = 'Overlay';
  overlay.Size = new UDim2(1, 0, 1, 0);
  overlay.BackgroundColor3 = new Color3(0, 0, 0);
  overlay.BackgroundTransparency = 0.5;
  overlay.BorderSizePixel = 0;
  overlay.Parent = screenGui;

  // Tutorial box
  const box = new Instance('Frame');
  box.Name = 'TutorialBox';
  box.Size = new UDim2(0, 400, 0, 200);
  box.Position = new UDim2(0.5, -200, 0.5, -100);
  box.BackgroundColor3 = Color3.fromRGB(40, 45, 60);
  box.BorderSizePixel = 0;
  box.Parent = overlay;

  const boxCorner = new Instance('UICorner');
  boxCorner.CornerRadius = new UDim(0, 16);
  boxCorner.Parent = box;

  // Title
  const title = new Instance('TextLabel');
  title.Size = new UDim2(1, 0, 0, 40);
  title.Position = new UDim2(0, 0, 0, 10);
  title.BackgroundTransparency = 1;
  title.Text = '👋 Hi! Would you like to do the tutorial?';
  title.TextColor3 = new Color3(1, 1, 1);
  title.TextSize = 20;
  title.Font = Enum.Font.GothamBold;
  title.Parent = box;

  // Yes button
  const yesBtn = new Instance('TextButton');
  yesBtn.Name = 'YesButton';
  yesBtn.Size = new UDim2(0, 120, 0, 45);
  yesBtn.Position = new UDim2(0.5, -130, 1, -70);
  yesBtn.BackgroundColor3 = Color3.fromRGB(80, 200, 120);
  yesBtn.Text = '✅ Yes!';
  yesBtn.TextColor3 = new Color3(1, 1, 1);
  yesBtn.TextSize = 18;
  yesBtn.Font = Enum.Font.GothamBold;
  yesBtn.Parent = box;

  const yesBtnCorner = new Instance('UICorner');
  yesBtnCorner.CornerRadius = new UDim(0, 10);
  yesBtnCorner.Parent = yesBtn;

  // No button
  const noBtn = new Instance('TextButton');
  noBtn.Name = 'NoButton';
  noBtn.Size = new UDim2(0, 120, 0, 45);
  noBtn.Position = new UDim2(0.5, 10, 1, -70);
  noBtn.BackgroundColor3 = Color3.fromRGB(180, 80, 80);
  noBtn.Text = '❌ No thanks';
  noBtn.TextColor3 = new Color3(1, 1, 1);
  noBtn.TextSize = 18;
  noBtn.Font = Enum.Font.GothamBold;
  noBtn.Parent = box;

  const noBtnCorner = new Instance('UICorner');
  noBtnCorner.CornerRadius = new UDim(0, 10);
  noBtnCorner.Parent = noBtn;

  // Add to player GUI
  const playerGui = player.WaitForChild('PlayerGui') as PlayerGui;
  screenGui.Parent = playerGui;

  // Handle Yes click - show tutorial info
  yesBtn.MouseButton1Click.Connect(() => {
    title.Text = '🎮 Welcome to the Game!';
    title.TextSize = 18;

    // Tutorial content
    const content = new Instance('TextLabel');
    content.Name = 'TutorialContent';
    content.Size = new UDim2(1, -40, 0, 100);
    content.Position = new UDim2(0, 20, 0, 50);
    content.BackgroundTransparency = 1;

    // Generate tutorial from enabled features (show 10 steps)
    const tutorialSteps = getTutorialSteps();
    let tutorialText =
      '<b>🏃 SHIFT = Sprint | 🦘 SPACE x3 = Triple Jump</b>\n\n';
    const maxSteps = math.min(10, tutorialSteps.size());
    for (let i = 0; i < maxSteps; i++) {
      const step = tutorialSteps[i];
      tutorialText += `<b>${i + 1}. ${step.title}</b>: ${step.description}\n`;
    }
    content.Text = tutorialText;
    content.RichText = true; // Enable bold, italic, etc.
    content.TextColor3 = Color3.fromRGB(220, 220, 255);
    content.TextSize = 13;
    content.TextXAlignment = Enum.TextXAlignment.Left;
    content.TextYAlignment = Enum.TextYAlignment.Top;
    content.Font = Enum.Font.Gotham;
    content.TextWrapped = true;
    content.Parent = box;

    // Hide yes button, change no to "Next"
    yesBtn.Visible = false;
    noBtn.Text = '➡️ Next';
    noBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 220);
    noBtn.Position = new UDim2(0.5, -60, 1, -60);

    // Resize box for more tutorial content
    box.Size = new UDim2(0, 450, 0, 380);
    box.Position = new UDim2(0.5, -225, 0.5, -190);
    content.Size = new UDim2(1, -40, 0, 220);

    // Next click - show NPC choice
    const nextClickConn = noBtn.MouseButton1Click.Once(() => {
      // Change to NPC question
      title.Text = '🤖 Want NPC friends to play with you?';
      content.Text =
        'We can spawn friendly bot companions that will\nwalk around and play the game with you!\n\nHow many NPCs do you want? (1-10)';
      content.TextSize = 15;

      // Add number input box
      const inputBox = new Instance('TextBox');
      inputBox.Name = 'NPCCountInput';
      inputBox.Size = new UDim2(0, 60, 0, 35);
      inputBox.Position = new UDim2(0.5, -30, 0, 115);
      inputBox.BackgroundColor3 = Color3.fromRGB(60, 70, 90);
      inputBox.Text = '2';
      inputBox.PlaceholderText = '1-10';
      inputBox.TextColor3 = new Color3(1, 1, 1);
      inputBox.TextSize = 20;
      inputBox.Font = Enum.Font.GothamBold;
      inputBox.ClearTextOnFocus = false;
      inputBox.Parent = box;

      const inputCorner = new Instance('UICorner');
      inputCorner.CornerRadius = new UDim(0, 8);
      inputCorner.Parent = inputBox;

      // Show Yes/No for NPCs
      yesBtn.Visible = true;
      yesBtn.Text = '✅ Add NPCs!';
      yesBtn.Position = new UDim2(0.5, -130, 1, -50);

      noBtn.Text = '❌ No thanks';
      noBtn.BackgroundColor3 = Color3.fromRGB(150, 80, 80);
      noBtn.Position = new UDim2(0.5, 10, 1, -50);

      // Resize box for this question
      box.Size = new UDim2(0, 380, 0, 220);
      box.Position = new UDim2(0.5, -190, 0.5, -110);

      // Handle NPC Yes - send the count to server
      const npcYesConn = yesBtn.MouseButton1Click.Once(() => {
        // Parse the input count
        let count = tonumber(inputBox.Text) ?? 2;
        count = math.clamp(count, 1, 10);

        // Fire remote to spawn NPCs with count
        const spawnRemote = ReplicatedStorage.FindFirstChild(
          'SpawnNPCCompanions',
        ) as RemoteEvent | undefined;
        if (spawnRemote) {
          spawnRemote.FireServer(count);
          print(`🤖 Requesting ${count} NPC companions!`);
        }
        screenGui.Destroy();
      });

      // Handle NPC No - just close
      const npcNoConn = noBtn.MouseButton1Click.Once(() => {
        screenGui.Destroy();
      });
    });
  });

  // Handle No/Close click (skip tutorial entirely)
  noBtn.MouseButton1Click.Connect(() => {
    screenGui.Destroy();
  });
}

// Always-visible NPC Spawner button
function createNPCSpawnerButton() {
  const screenGui = new Instance('ScreenGui');
  screenGui.Name = 'NPCSpawnerUI';
  screenGui.ResetOnSpawn = false;
  screenGui.DisplayOrder = 40;

  // NPC button (top right, below daily rewards area)
  const npcBtn = new Instance('TextButton');
  npcBtn.Name = 'NPCSpawnButton';
  npcBtn.Size = new UDim2(0, 120, 0, 35);
  npcBtn.Position = new UDim2(1, -135, 0, 130);
  npcBtn.BackgroundColor3 = Color3.fromRGB(100, 80, 160);
  npcBtn.Text = '🤖 place NPCs';
  npcBtn.TextColor3 = new Color3(1, 1, 1);
  npcBtn.TextSize = 14;
  npcBtn.Font = Enum.Font.GothamBold;
  npcBtn.Visible = false; // Hidden - reducing clutter, dev tool
  npcBtn.Parent = screenGui;

  const btnCorner = new Instance('UICorner');
  btnCorner.CornerRadius = new UDim(0, 8);
  btnCorner.Parent = npcBtn;

  // Count input popup (hidden by default)
  const popup = new Instance('Frame');
  popup.Name = 'NPCPopup';
  popup.Size = new UDim2(0, 200, 0, 120);
  popup.Position = new UDim2(1, -215, 0, 55);
  popup.BackgroundColor3 = Color3.fromRGB(50, 55, 70);
  popup.Visible = false;
  popup.Parent = screenGui;

  const popupCorner = new Instance('UICorner');
  popupCorner.CornerRadius = new UDim(0, 10);
  popupCorner.Parent = popup;

  const label = new Instance('TextLabel');
  label.Size = new UDim2(1, 0, 0, 30);
  label.Position = new UDim2(0, 0, 0, 10);
  label.BackgroundTransparency = 1;
  label.Text = 'How many NPCs? (1-10)';
  label.TextColor3 = new Color3(1, 1, 1);
  label.TextSize = 13;
  label.Font = Enum.Font.GothamBold;
  label.Parent = popup;

  const inputBox = new Instance('TextBox');
  inputBox.Size = new UDim2(0, 60, 0, 30);
  inputBox.Position = new UDim2(0.5, -30, 0, 42);
  inputBox.BackgroundColor3 = Color3.fromRGB(70, 80, 100);
  inputBox.Text = '2';
  inputBox.TextColor3 = new Color3(1, 1, 1);
  inputBox.TextSize = 18;
  inputBox.Font = Enum.Font.GothamBold;
  inputBox.ClearTextOnFocus = false;
  inputBox.Parent = popup;

  const inputCorner = new Instance('UICorner');
  inputCorner.CornerRadius = new UDim(0, 6);
  inputCorner.Parent = inputBox;

  const spawnBtn = new Instance('TextButton');
  spawnBtn.Size = new UDim2(0, 80, 0, 28);
  spawnBtn.Position = new UDim2(0.5, -40, 1, -38);
  spawnBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 120);
  spawnBtn.Text = '✅ Spawn!';
  spawnBtn.TextColor3 = new Color3(1, 1, 1);
  spawnBtn.TextSize = 13;
  spawnBtn.Font = Enum.Font.GothamBold;
  spawnBtn.Parent = popup;

  const spawnBtnCorner = new Instance('UICorner');
  spawnBtnCorner.CornerRadius = new UDim(0, 6);
  spawnBtnCorner.Parent = spawnBtn;

  const playerGui = player.WaitForChild('PlayerGui') as PlayerGui;
  screenGui.Parent = playerGui;

  // Toggle popup on button click
  npcBtn.MouseButton1Click.Connect(() => {
    popup.Visible = !popup.Visible;
  });

  // Spawn NPCs
  spawnBtn.MouseButton1Click.Connect(() => {
    let count = tonumber(inputBox.Text) ?? 2;
    count = math.clamp(count, 1, 10);

    const spawnRemote = ReplicatedStorage.FindFirstChild(
      'SpawnNPCCompanions',
    ) as RemoteEvent | undefined;
    if (spawnRemote) {
      spawnRemote.FireServer(count);
      print(`🤖 Spawning ${count} NPC companions!`);
    }

    popup.Visible = false;
    npcBtn.Text = '✅ NPCs Added!';
    npcBtn.BackgroundColor3 = Color3.fromRGB(80, 120, 80);

    // Reset button after 3 seconds
    task.delay(3, () => {
      npcBtn.Text = '🤖 Add NPCs';
      npcBtn.BackgroundColor3 = Color3.fromRGB(100, 80, 160);
    });
  });

  print('🤖 NPC Spawner button ready!');
}

// Day/Night toggle
let isDay = false;
function createDayNightToggle() {
  const screenGui = new Instance('ScreenGui');
  screenGui.Name = 'DayNightUI';
  screenGui.ResetOnSpawn = false;
  screenGui.DisplayOrder = 70;

  const toggleBtn = new Instance('TextButton');
  toggleBtn.Name = 'DayNightToggle';
  toggleBtn.Size = new UDim2(0, 50, 0, 50);
  toggleBtn.Position = new UDim2(1, -60, 0, 10);
  toggleBtn.BackgroundColor3 = Color3.fromRGB(40, 40, 80);
  toggleBtn.Text = '🌙';
  toggleBtn.TextSize = 28;
  toggleBtn.Font = Enum.Font.GothamBold;
  toggleBtn.Visible = false; // Hidden - overlaps Premium
  toggleBtn.Parent = screenGui;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 12);
  corner.Parent = toggleBtn;

  toggleBtn.MouseButton1Click.Connect(() => {
    isDay = !isDay;
    if (isDay) {
      // Day mode
      Lighting.ClockTime = 12;
      Lighting.Brightness = 2;
      Lighting.Ambient = new Color3(0.5, 0.5, 0.5);
      Lighting.OutdoorAmbient = new Color3(0.5, 0.5, 0.5);
      toggleBtn.Text = '☀️';
      toggleBtn.BackgroundColor3 = Color3.fromRGB(255, 200, 80);
    } else {
      // Night mode (sunset)
      Lighting.ClockTime = 18.5;
      Lighting.Brightness = 1;
      Lighting.Ambient = new Color3(0.4, 0.3, 0.2);
      Lighting.OutdoorAmbient = new Color3(0.5, 0.35, 0.25);
      toggleBtn.Text = '🌙';
      toggleBtn.BackgroundColor3 = Color3.fromRGB(40, 40, 80);
    }
  });

  const playerGui = player.WaitForChild('PlayerGui') as PlayerGui;
  screenGui.Parent = playerGui;
  print('🌙 Day/Night toggle ready!');
}

// Initialize
createUI();
createDailyRewardsUI();
createShopUI();
createMapShopUI();
createLeaderboardUI();
createMusicSystem();
createTradingUI();
createStealingUI();
createEggShopUI();
createRebirthUI();
createQuestUI();
createLuckyWheelUI();
createEvolutionUI();
createCodesUI();
createVIPUI();
createEventsUI();
createFusionUI();
createAchievementsUI();
createClansUI();
createPremiumUI();
createBattlesUI();
createPrivateServerUI();
createMinigamesUI();
createDayNightToggle();
createNPCSpawnerButton();

// Create unified bottom action bar
createBottomActionBar();

// Create mobile UI toggle (hamburger menu)
createUIToggle();

// Create Battle Pass UI
createBattlePassUI();

// Create Pet Selection UI
createPetSelectionUI();

// Create Starter Pack UI (for new players)
createStarterPackUI();

// Create Limited Offers UI (daily specials)
createLimitedOffersUI();

// Initialize Fishing UI (CORE GAMEPLAY for Lucky Fish Legends!)
initFishingUI();

// Show starter pack popup after 3 seconds (for new players)
task.delay(3, () => {
  // TODO: Check if player is new (level < 10)
  showStarterPackPopup();
});

// Register action bar callbacks to toggle existing panels
const playerGui = player.WaitForChild('PlayerGui') as PlayerGui;

registerActionCallback('shop', () => {
  const panel = playerGui
    .FindFirstChild('ShopUI')
    ?.FindFirstChild('ShopPanel') as Frame | undefined;
  if (panel) panel.Visible = !panel.Visible;
});

registerActionCallback('fishing', () => {
  // Uses toggleFishingUI from fishingUI module
  toggleFishingUI();
  print('🎣 Fishing button clicked!');
});

registerActionCallback('eggs', () => {
  const panel = playerGui
    .FindFirstChild('EggShopUI')
    ?.FindFirstChild('EggPanel') as Frame | undefined;
  if (panel) panel.Visible = !panel.Visible;
});

registerActionCallback('maps', () => {
  const panel = playerGui
    .FindFirstChild('MapShopUI')
    ?.FindFirstChild('MapPanel') as Frame | undefined;
  if (panel) panel.Visible = !panel.Visible;
});

registerActionCallback('pets', () => {
  // Pet UI uses PetContainer
  const petUI = playerGui.FindFirstChild('PetSelectionUI') as
    | ScreenGui
    | undefined;
  print(`🐾 Pets button clicked! PetSelectionUI found: ${petUI !== undefined}`);
  if (petUI) {
    const container = petUI.FindFirstChild('PetContainer') as Frame | undefined;
    print(
      `🐾 PetContainer found: ${container !== undefined}, visible: ${container?.Visible}`,
    );
    if (container) {
      container.Visible = !container.Visible;
      print(`🐾 PetContainer now visible: ${container.Visible}`);
    }
  }
});

registerActionCallback('battles', () => {
  const panel = playerGui
    .FindFirstChild('BattlesUI')
    ?.FindFirstChild('BattlePanel') as Frame | undefined;
  if (panel) panel.Visible = !panel.Visible;
});

registerActionCallback('wheel', () => {
  const panel = playerGui
    .FindFirstChild('LuckyWheelUI')
    ?.FindFirstChild('WheelPanel') as Frame | undefined;
  if (panel) panel.Visible = !panel.Visible;
});

registerActionCallback('evolve', () => {
  const panel = playerGui
    .FindFirstChild('EvolutionUI')
    ?.FindFirstChild('EvolutionPanel') as Frame | undefined;
  if (panel) panel.Visible = !panel.Visible;
});

registerActionCallback('fuse', () => {
  const panel = playerGui
    .FindFirstChild('FusionUI')
    ?.FindFirstChild('FusionPanel') as Frame | undefined;
  if (panel) panel.Visible = !panel.Visible;
});

registerActionCallback('minigames', () => {
  const panel = playerGui
    .FindFirstChild('MinigamesUI')
    ?.FindFirstChild('MinigamesPanel') as Frame | undefined;
  if (panel) panel.Visible = !panel.Visible;
});

registerActionCallback('battlepass', () => {
  toggleBattlePass();
});

// Initialize hatcher UI for egg placement
initHatcherUI();

showTutorial();
print('🎮 31 systems! Ultimate fishing game with Hatchers + Pet Bonuses!');
