// Dragon Legends - Battle UI (Client)
// Combat interface with HP bars, moves, and battle log

import { Players, ReplicatedStorage, TweenService } from '@rbxts/services';
import { GAME_THEME } from '../../shared/theme';
import { ELEMENT_CHART } from '../../shared/config';
import { BattleState, BattleDragonState } from '../../shared/types';

const LocalPlayer = Players.LocalPlayer;
const PlayerGui = LocalPlayer.WaitForChild('PlayerGui') as PlayerGui;

// Current battle state
let currentBattle: BattleState | undefined;

// Create battle UI
export function setupBattleUI(): void {
  const screenGui = new Instance('ScreenGui');
  screenGui.Name = 'BattleUI';
  screenGui.ResetOnSpawn = false;
  screenGui.Enabled = false;
  screenGui.Parent = PlayerGui;

  // Battle container
  const container = new Instance('Frame');
  container.Name = 'BattleContainer';
  container.Size = new UDim2(1, 0, 1, 0);
  container.BackgroundTransparency = 1;
  container.Parent = screenGui;

  // Player dragon HP bar (bottom left)
  const playerHP = createHPBar('PlayerHP', new UDim2(0, 20, 1, -120), true);
  playerHP.Parent = container;

  // Enemy dragon HP bar (top right)
  const enemyHP = createHPBar('EnemyHP', new UDim2(1, -320, 0, 20), false);
  enemyHP.Parent = container;

  // Move buttons (bottom center)
  const moveContainer = new Instance('Frame');
  moveContainer.Name = 'MoveContainer';
  moveContainer.Size = new UDim2(0, 400, 0, 120);
  moveContainer.Position = new UDim2(0.5, 0, 1, -140);
  moveContainer.AnchorPoint = new Vector2(0.5, 0);
  moveContainer.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
  moveContainer.BackgroundTransparency = 0.2;
  moveContainer.Parent = container;

  const moveCorner = new Instance('UICorner');
  moveCorner.CornerRadius = new UDim(0, 15);
  moveCorner.Parent = moveContainer;

  const moveStroke = new Instance('UIStroke');
  moveStroke.Color = GAME_THEME.primary;
  moveStroke.Thickness = 2;
  moveStroke.Parent = moveContainer;

  const moveLayout = new Instance('UIListLayout');
  moveLayout.FillDirection = Enum.FillDirection.Horizontal;
  moveLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center;
  moveLayout.VerticalAlignment = Enum.VerticalAlignment.Center;
  moveLayout.Padding = new UDim(0, 10);
  moveLayout.Parent = moveContainer;

  // Create move buttons
  for (let i = 0; i < 3; i++) {
    createMoveButton(moveContainer, i);
  }

  // Flee button
  const fleeBtn = new Instance('TextButton');
  fleeBtn.Name = 'FleeBtn';
  fleeBtn.Size = new UDim2(0, 80, 0, 80);
  fleeBtn.BackgroundColor3 = Color3.fromRGB(150, 60, 60);
  fleeBtn.Text = '🏃 Flee';
  fleeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
  fleeBtn.TextScaled = true;
  fleeBtn.Font = Enum.Font.GothamBold;
  fleeBtn.Parent = moveContainer;

  const fleeBtnCorner = new Instance('UICorner');
  fleeBtnCorner.CornerRadius = new UDim(0, 10);
  fleeBtnCorner.Parent = fleeBtn;

  fleeBtn.MouseButton1Click.Connect(() => {
    sendBattleAction('flee');
  });

  // Battle log (right side)
  const battleLog = new Instance('ScrollingFrame');
  battleLog.Name = 'BattleLog';
  battleLog.Size = new UDim2(0, 250, 0, 200);
  battleLog.Position = new UDim2(1, -270, 0.5, -100);
  battleLog.BackgroundColor3 = Color3.fromRGB(20, 15, 30);
  battleLog.BackgroundTransparency = 0.3;
  battleLog.ScrollBarThickness = 6;
  battleLog.ScrollBarImageColor3 = GAME_THEME.primary;
  battleLog.Parent = container;

  const logCorner = new Instance('UICorner');
  logCorner.CornerRadius = new UDim(0, 10);
  logCorner.Parent = battleLog;

  const logLayout = new Instance('UIListLayout');
  logLayout.SortOrder = Enum.SortOrder.LayoutOrder;
  logLayout.Padding = new UDim(0, 5);
  logLayout.Parent = battleLog;

  // Turn indicator (top center)
  const turnIndicator = new Instance('TextLabel');
  turnIndicator.Name = 'TurnIndicator';
  turnIndicator.Size = new UDim2(0, 200, 0, 40);
  turnIndicator.Position = new UDim2(0.5, 0, 0, 10);
  turnIndicator.AnchorPoint = new Vector2(0.5, 0);
  turnIndicator.BackgroundColor3 = Color3.fromRGB(40, 35, 55);
  turnIndicator.BackgroundTransparency = 0.3;
  turnIndicator.Text = 'Your Turn!';
  turnIndicator.TextColor3 = Color3.fromRGB(255, 255, 255);
  turnIndicator.TextScaled = true;
  turnIndicator.Font = Enum.Font.GothamBold;
  turnIndicator.Parent = container;

  const turnCorner = new Instance('UICorner');
  turnCorner.CornerRadius = new UDim(0, 10);
  turnCorner.Parent = turnIndicator;
}

// Create HP bar
function createHPBar(name: string, position: UDim2, isPlayer: boolean): Frame {
  const container = new Instance('Frame');
  container.Name = name;
  container.Size = new UDim2(0, 300, 0, 80);
  container.Position = position;
  container.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
  container.BackgroundTransparency = 0.2;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 12);
  corner.Parent = container;

  const stroke = new Instance('UIStroke');
  stroke.Color = isPlayer
    ? Color3.fromRGB(80, 150, 80)
    : Color3.fromRGB(150, 60, 60);
  stroke.Thickness = 2;
  stroke.Parent = container;

  // Dragon name
  const nameLabel = new Instance('TextLabel');
  nameLabel.Name = 'DragonName';
  nameLabel.Size = new UDim2(1, -20, 0, 25);
  nameLabel.Position = new UDim2(0, 10, 0, 5);
  nameLabel.BackgroundTransparency = 1;
  nameLabel.Text = isPlayer ? 'Your Dragon' : 'Wild Dragon';
  nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
  nameLabel.TextXAlignment = Enum.TextXAlignment.Left;
  nameLabel.TextScaled = true;
  nameLabel.Font = Enum.Font.GothamBold;
  nameLabel.Parent = container;

  // Level badge
  const levelBadge = new Instance('TextLabel');
  levelBadge.Name = 'Level';
  levelBadge.Size = new UDim2(0, 50, 0, 20);
  levelBadge.Position = new UDim2(1, -60, 0, 8);
  levelBadge.BackgroundColor3 = Color3.fromRGB(50, 45, 65);
  levelBadge.Text = 'Lv.1';
  levelBadge.TextColor3 = Color3.fromRGB(200, 200, 200);
  levelBadge.TextScaled = true;
  levelBadge.Font = Enum.Font.Gotham;
  levelBadge.Parent = container;

  const levelCorner = new Instance('UICorner');
  levelCorner.CornerRadius = new UDim(0, 5);
  levelCorner.Parent = levelBadge;

  // HP bar background
  const hpBg = new Instance('Frame');
  hpBg.Name = 'HPBackground';
  hpBg.Size = new UDim2(1, -20, 0, 25);
  hpBg.Position = new UDim2(0, 10, 0, 35);
  hpBg.BackgroundColor3 = Color3.fromRGB(50, 45, 65);
  hpBg.Parent = container;

  const hpBgCorner = new Instance('UICorner');
  hpBgCorner.CornerRadius = new UDim(0, 6);
  hpBgCorner.Parent = hpBg;

  // HP bar fill
  const hpFill = new Instance('Frame');
  hpFill.Name = 'HPFill';
  hpFill.Size = new UDim2(1, 0, 1, 0);
  hpFill.BackgroundColor3 = Color3.fromRGB(80, 200, 80);
  hpFill.Parent = hpBg;

  const hpFillCorner = new Instance('UICorner');
  hpFillCorner.CornerRadius = new UDim(0, 6);
  hpFillCorner.Parent = hpFill;

  // HP text
  const hpText = new Instance('TextLabel');
  hpText.Name = 'HPText';
  hpText.Size = new UDim2(1, 0, 1, 0);
  hpText.BackgroundTransparency = 1;
  hpText.Text = '100 / 100';
  hpText.TextColor3 = Color3.fromRGB(255, 255, 255);
  hpText.TextStrokeTransparency = 0;
  hpText.TextScaled = true;
  hpText.Font = Enum.Font.GothamBold;
  hpText.Parent = hpBg;

  // Element icon
  const elementIcon = new Instance('TextLabel');
  elementIcon.Name = 'Element';
  elementIcon.Size = new UDim2(0, 25, 0, 25);
  elementIcon.Position = new UDim2(0, 10, 0, 50);
  elementIcon.BackgroundTransparency = 1;
  elementIcon.Text = '🔥';
  elementIcon.TextScaled = true;
  elementIcon.Parent = container;

  return container;
}

// Create move button
function createMoveButton(parent: Frame, index: number): TextButton {
  const button = new Instance('TextButton');
  button.Name = `Move${index}`;
  button.Size = new UDim2(0, 90, 0, 80);
  button.BackgroundColor3 = Color3.fromRGB(60, 55, 80);
  button.Text = `Attack ${index + 1}`;
  button.TextColor3 = Color3.fromRGB(255, 255, 255);
  button.TextScaled = true;
  button.Font = Enum.Font.GothamBold;
  button.Parent = parent;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 10);
  corner.Parent = button;

  // Hover effect
  button.MouseEnter.Connect(() => {
    TweenService.Create(button, new TweenInfo(0.2), {
      BackgroundColor3: Color3.fromRGB(80, 75, 110),
    }).Play();
  });

  button.MouseLeave.Connect(() => {
    TweenService.Create(button, new TweenInfo(0.2), {
      BackgroundColor3: Color3.fromRGB(60, 55, 80),
    }).Play();
  });

  // Click to attack
  button.MouseButton1Click.Connect(() => {
    sendBattleAction('attack', index);
  });

  return button;
}

// Send battle action to server
function sendBattleAction(actionType: string, moveIndex?: number): void {
  const remotes = ReplicatedStorage.FindFirstChild('DragonRemotes') as
    | Folder
    | undefined;
  if (!remotes) return;

  const battleActionRemote = remotes.FindFirstChild('BattleAction') as
    | RemoteFunction
    | undefined;
  if (!battleActionRemote) return;

  const result = battleActionRemote.InvokeServer(actionType, moveIndex) as {
    success: boolean;
    battleState?: BattleState;
    message?: string;
  };

  if (result.success && result.battleState) {
    updateBattleUI(result.battleState);

    if (result.battleState.isFinished) {
      showBattleResult(result.battleState);
    }
  }
}

// Update battle UI with new state
function updateBattleUI(battle: BattleState): void {
  currentBattle = battle;

  const screenGui = PlayerGui.FindFirstChild('BattleUI') as
    | ScreenGui
    | undefined;
  if (!screenGui) return;

  const container = screenGui.FindFirstChild('BattleContainer') as
    | Frame
    | undefined;
  if (!container) return;

  // Update player HP
  const playerHP = container.FindFirstChild('PlayerHP') as Frame | undefined;
  if (playerHP && battle.playerDragons[0]) {
    updateHPDisplay(playerHP, battle.playerDragons[0]);
  }

  // Update enemy HP
  const enemyHP = container.FindFirstChild('EnemyHP') as Frame | undefined;
  if (enemyHP && battle.opponentDragons[0]) {
    updateHPDisplay(enemyHP, battle.opponentDragons[0]);
  }

  // Update turn indicator
  const turnIndicator = container.FindFirstChild('TurnIndicator') as
    | TextLabel
    | undefined;
  if (turnIndicator) {
    turnIndicator.Text =
      battle.currentTurn === 'player' ? 'Your Turn!' : 'Enemy Turn...';
    turnIndicator.TextColor3 =
      battle.currentTurn === 'player'
        ? Color3.fromRGB(100, 200, 100)
        : Color3.fromRGB(200, 100, 100);
  }
}

// Update HP bar display
function updateHPDisplay(hpContainer: Frame, dragon: BattleDragonState): void {
  const nameLabel = hpContainer.FindFirstChild('DragonName') as
    | TextLabel
    | undefined;
  const levelBadge = hpContainer.FindFirstChild('Level') as
    | TextLabel
    | undefined;
  const hpBg = hpContainer.FindFirstChild('HPBackground') as Frame | undefined;
  const elementIcon = hpContainer.FindFirstChild('Element') as
    | TextLabel
    | undefined;

  if (nameLabel) {
    nameLabel.Text = dragon.dragonId;
  }

  if (levelBadge) {
    levelBadge.Text = `Lv.${dragon.level}`;
  }

  if (hpBg) {
    const hpFill = hpBg.FindFirstChild('HPFill') as Frame | undefined;
    const hpText = hpBg.FindFirstChild('HPText') as TextLabel | undefined;

    const hpPercent = dragon.currentHp / dragon.maxHp;

    if (hpFill) {
      TweenService.Create(hpFill, new TweenInfo(0.3), {
        Size: new UDim2(hpPercent, 0, 1, 0),
      }).Play();

      // Color based on HP
      if (hpPercent > 0.5) {
        hpFill.BackgroundColor3 = Color3.fromRGB(80, 200, 80);
      } else if (hpPercent > 0.25) {
        hpFill.BackgroundColor3 = Color3.fromRGB(200, 200, 80);
      } else {
        hpFill.BackgroundColor3 = Color3.fromRGB(200, 80, 80);
      }
    }

    if (hpText) {
      hpText.Text = `${math.floor(dragon.currentHp)} / ${dragon.maxHp}`;
    }
  }

  if (elementIcon) {
    const elementEmojis: { [key: string]: string } = {
      fire: '🔥',
      water: '💧',
      ice: '❄️',
      electric: '⚡',
      nature: '🍃',
      shadow: '🌑',
      light: '✨',
    };
    elementIcon.Text = elementEmojis[dragon.element] || '🐉';
  }
}

// Show battle result
function showBattleResult(battle: BattleState): void {
  const screenGui = PlayerGui.FindFirstChild('BattleUI') as
    | ScreenGui
    | undefined;
  if (!screenGui) return;

  // Create result overlay
  const resultOverlay = new Instance('Frame');
  resultOverlay.Name = 'ResultOverlay';
  resultOverlay.Size = new UDim2(1, 0, 1, 0);
  resultOverlay.BackgroundColor3 = Color3.fromRGB(0, 0, 0);
  resultOverlay.BackgroundTransparency = 0.5;
  resultOverlay.Parent = screenGui;

  const resultPanel = new Instance('Frame');
  resultPanel.Size = new UDim2(0, 400, 0, 300);
  resultPanel.Position = new UDim2(0.5, 0, 0.5, 0);
  resultPanel.AnchorPoint = new Vector2(0.5, 0.5);
  resultPanel.BackgroundColor3 = Color3.fromRGB(30, 25, 40);
  resultPanel.Parent = resultOverlay;

  const panelCorner = new Instance('UICorner');
  panelCorner.CornerRadius = new UDim(0, 20);
  panelCorner.Parent = resultPanel;

  const isVictory = battle.result?.winner === 'player';

  const resultIcon = new Instance('TextLabel');
  resultIcon.Size = new UDim2(1, 0, 0, 80);
  resultIcon.Position = new UDim2(0, 0, 0, 30);
  resultIcon.BackgroundTransparency = 1;
  resultIcon.Text = isVictory ? '🏆' : '💔';
  resultIcon.TextScaled = true;
  resultIcon.Parent = resultPanel;

  const resultText = new Instance('TextLabel');
  resultText.Size = new UDim2(1, -40, 0, 50);
  resultText.Position = new UDim2(0, 20, 0, 120);
  resultText.BackgroundTransparency = 1;
  resultText.Text = isVictory ? 'Victory!' : 'Defeated!';
  resultText.TextColor3 = isVictory
    ? Color3.fromRGB(100, 200, 100)
    : Color3.fromRGB(200, 100, 100);
  resultText.TextScaled = true;
  resultText.Font = Enum.Font.GothamBold;
  resultText.Parent = resultPanel;

  if (battle.result) {
    const rewardText = new Instance('TextLabel');
    rewardText.Size = new UDim2(1, -40, 0, 30);
    rewardText.Position = new UDim2(0, 20, 0, 175);
    rewardText.BackgroundTransparency = 1;
    rewardText.Text = `+${battle.result.coinsGained} coins • +${battle.result.xpGained} XP`;
    rewardText.TextColor3 = Color3.fromRGB(200, 200, 200);
    rewardText.TextScaled = true;
    rewardText.Font = Enum.Font.Gotham;
    rewardText.Parent = resultPanel;
  }

  const continueBtn = new Instance('TextButton');
  continueBtn.Size = new UDim2(0, 150, 0, 45);
  continueBtn.Position = new UDim2(0.5, 0, 1, -60);
  continueBtn.AnchorPoint = new Vector2(0.5, 0);
  continueBtn.BackgroundColor3 = GAME_THEME.primary;
  continueBtn.Text = 'Continue';
  continueBtn.TextColor3 = Color3.fromRGB(0, 0, 0);
  continueBtn.TextScaled = true;
  continueBtn.Font = Enum.Font.GothamBold;
  continueBtn.Parent = resultPanel;

  const btnCorner = new Instance('UICorner');
  btnCorner.CornerRadius = new UDim(0, 10);
  btnCorner.Parent = continueBtn;

  continueBtn.MouseButton1Click.Connect(() => {
    resultOverlay.Destroy();
    screenGui.Enabled = false;
  });
}

// Show/hide battle UI
export function showBattleUI(battle: BattleState): void {
  const screenGui = PlayerGui.FindFirstChild('BattleUI') as
    | ScreenGui
    | undefined;
  if (screenGui) {
    screenGui.Enabled = true;
    updateBattleUI(battle);
  }
}

export function hideBattleUI(): void {
  const screenGui = PlayerGui.FindFirstChild('BattleUI') as
    | ScreenGui
    | undefined;
  if (screenGui) {
    screenGui.Enabled = false;
  }
}
