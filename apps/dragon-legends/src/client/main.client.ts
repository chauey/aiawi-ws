// Dragon Legends - Client Main Entry
// Client-side UI and input handling

import { Players, ReplicatedStorage, UserInputService } from '@rbxts/services';
import { GAME_THEME } from '../shared/theme';
import { setupMainHUD } from './ui/mainHUD';
import { setupDragonMenu } from './ui/dragonMenu';
import { setupEggShop } from './ui/eggShop';
import { setupBattleUI } from './ui/battleUI';
import { setupClanUI } from './ui/clanUI';
import { setupQuestUI } from './ui/questUI';

const LocalPlayer = Players.LocalPlayer;

// Wait for remotes to be ready
function waitForRemotes(): void {
  while (!ReplicatedStorage.FindFirstChild('DragonRemotes')) {
    task.wait(0.1);
  }
}

// Initialize client
function init(): void {
  print(`🐉 ${GAME_THEME.name} - Client Starting!`);

  // Wait for remotes
  waitForRemotes();

  // Setup all UI systems
  setupMainHUD();
  print('   ✓ Main HUD');

  setupDragonMenu();
  print('   ✓ Dragon Menu');

  setupEggShop();
  print('   ✓ Egg Shop');

  setupBattleUI();
  print('   ✓ Battle UI');

  setupClanUI();
  print('   ✓ Clan UI');

  setupQuestUI();
  print('   ✓ Quest UI');

  // Setup input handling
  setupInputs();

  print(`✅ ${GAME_THEME.name} Client Ready!`);
}

// Setup keyboard shortcuts
function setupInputs(): void {
  UserInputService.InputBegan.Connect((input, gameProcessed) => {
    if (gameProcessed) return;

    // E - Open Dragon Menu
    if (input.KeyCode === Enum.KeyCode.E) {
      toggleDragonMenu();
    }

    // Q - Open Egg Shop
    if (input.KeyCode === Enum.KeyCode.Q) {
      toggleEggShop();
    }

    // T - Open Quests
    if (input.KeyCode === Enum.KeyCode.T) {
      toggleQuestMenu();
    }

    // G - Open Clan
    if (input.KeyCode === Enum.KeyCode.G) {
      toggleClanMenu();
    }
  });
}

// Toggle functions (placeholders, implemented in UI modules)
function toggleDragonMenu(): void {
  const gui = LocalPlayer.WaitForChild('PlayerGui').FindFirstChild(
    'DragonMenu',
  ) as ScreenGui | undefined;
  if (gui) {
    gui.Enabled = !gui.Enabled;
  }
}

function toggleEggShop(): void {
  const gui = LocalPlayer.WaitForChild('PlayerGui').FindFirstChild(
    'EggShop',
  ) as ScreenGui | undefined;
  if (gui) {
    gui.Enabled = !gui.Enabled;
  }
}

function toggleQuestMenu(): void {
  const gui = LocalPlayer.WaitForChild('PlayerGui').FindFirstChild(
    'QuestUI',
  ) as ScreenGui | undefined;
  if (gui) {
    gui.Enabled = !gui.Enabled;
  }
}

function toggleClanMenu(): void {
  const gui = LocalPlayer.WaitForChild('PlayerGui').FindFirstChild('ClanUI') as
    | ScreenGui
    | undefined;
  if (gui) {
    gui.Enabled = !gui.Enabled;
  }
}

// Wait for character before initializing
if (LocalPlayer.Character) {
  init();
} else {
  LocalPlayer.CharacterAdded.Wait();
  init();
}
