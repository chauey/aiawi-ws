/**
 * Advanced Pet UI and Following System - Lucky Fish Legends
 * Full-featured pet inventory, egg shop, hatching, and pet following
 */

import {
  Players,
  ReplicatedStorage,
  RunService,
  TweenService,
  Workspace,
} from '@rbxts/services';
import {
  OwnedPet,
  PetSpecies,
  EGG_TYPES,
  PET_RARITY_COLORS,
  getSpeciesById,
  calculatePetPower,
} from '../shared/petData';

const player = Players.LocalPlayer;
let screenGui: ScreenGui;
let petInventoryFrame: Frame;

// Pet models following player
const activePetModels = new Map<string, Model>();
let petUpdateConnection: RBXScriptConnection | undefined;

// Remotes
let petRemotes: {
  buyEgg?: RemoteFunction;
  hatchEgg?: RemoteFunction;
  equipPet?: RemoteFunction;
  getPets?: RemoteFunction;
  releasePet?: RemoteFunction;
};

// Local state cache
let cachedPetState:
  | {
      pets: OwnedPet[];
      equippedPets: string[];
      maxEquipped: number;
      coins: number;
      incubatingEggs: { eggId: string; startTime: number; hatchTime: number }[];
    }
  | undefined;

/**
 * Initialize advanced pet system
 */
export function initAdvancedPetUI(): void {
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
    const remotesFolder = ReplicatedStorage.WaitForChild('PetRemotes', 10) as
      | Folder
      | undefined;
    if (remotesFolder) {
      petRemotes = {
        buyEgg: remotesFolder.FindFirstChild('BuyEgg') as RemoteFunction,
        hatchEgg: remotesFolder.FindFirstChild('HatchEgg') as RemoteFunction,
        equipPet: remotesFolder.FindFirstChild('EquipPet') as RemoteFunction,
        getPets: remotesFolder.FindFirstChild('GetPets') as RemoteFunction,
        releasePet: remotesFolder.FindFirstChild(
          'ReleasePet',
        ) as RemoteFunction,
      };
    }
  });

  createPetInventoryButton();
  createPetInventoryFrame();
  startPetFollowing();

  // Initial load
  task.delay(2, async () => {
    await refreshPetData();
    updateFollowingPets();
  });

  print('🐾 Advanced Pet System UI ready!');
}

function createPetInventoryButton(): void {
  const button = new Instance('TextButton');
  button.Name = 'PetInventoryButton';
  button.Size = new UDim2(0, 55, 0, 55);
  button.Position = new UDim2(0, 150, 1, -75);
  button.BackgroundColor3 = new Color3(0.6, 0.3, 0.8);
  button.Text = '🐾';
  button.TextSize = 26;
  button.Font = Enum.Font.GothamBold;
  button.TextColor3 = new Color3(1, 1, 1);
  button.Parent = screenGui;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 12);
  corner.Parent = button;

  button.MouseButton1Click.Connect(() => togglePetInventory());
}

function createPetInventoryFrame(): void {
  petInventoryFrame = new Instance('Frame');
  petInventoryFrame.Name = 'PetInventory';
  petInventoryFrame.Size = new UDim2(0, 500, 0, 450);
  petInventoryFrame.Position = new UDim2(0.5, -250, 0.5, -225);
  petInventoryFrame.BackgroundColor3 = new Color3(0.08, 0.1, 0.15);
  petInventoryFrame.Visible = false;
  petInventoryFrame.Parent = screenGui;

  const corner = new Instance('UICorner');
  corner.CornerRadius = new UDim(0, 12);
  corner.Parent = petInventoryFrame;

  // Header
  const header = new Instance('Frame');
  header.Size = new UDim2(1, 0, 0, 50);
  header.BackgroundColor3 = new Color3(0.12, 0.14, 0.2);
  header.BorderSizePixel = 0;
  header.Parent = petInventoryFrame;

  const headerCorner = new Instance('UICorner');
  headerCorner.CornerRadius = new UDim(0, 12);
  headerCorner.Parent = header;

  const title = new Instance('TextLabel');
  title.Size = new UDim2(0.7, 0, 1, 0);
  title.Position = new UDim2(0, 15, 0, 0);
  title.BackgroundTransparency = 1;
  title.Text = '🐾 Pet Collection';
  title.TextColor3 = new Color3(1, 1, 1);
  title.TextSize = 20;
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
  closeBtn.MouseButton1Click.Connect(() => {
    petInventoryFrame.Visible = false;
  });

  const closeBtnCorner = new Instance('UICorner');
  closeBtnCorner.CornerRadius = new UDim(0, 8);
  closeBtnCorner.Parent = closeBtn;

  // Tabs
  const tabFrame = new Instance('Frame');
  tabFrame.Size = new UDim2(1, -20, 0, 40);
  tabFrame.Position = new UDim2(0, 10, 0, 55);
  tabFrame.BackgroundTransparency = 1;
  tabFrame.Parent = petInventoryFrame;

  ['Pets', 'Eggs', 'Shop'].forEach((tabName, i) => {
    const tab = new Instance('TextButton');
    tab.Name = `Tab_${tabName}`;
    tab.Size = new UDim2(0.32, 0, 1, 0);
    tab.Position = new UDim2(0.34 * i, 0, 0, 0);
    tab.BackgroundColor3 =
      i === 0 ? new Color3(0.3, 0.5, 0.7) : new Color3(0.18, 0.2, 0.25);
    tab.Text =
      tabName === 'Pets'
        ? '🐾 Pets'
        : tabName === 'Eggs'
          ? '🥚 Eggs'
          : '🛒 Shop';
    tab.TextColor3 = new Color3(1, 1, 1);
    tab.TextSize = 14;
    tab.Font = Enum.Font.GothamBold;
    tab.Parent = tabFrame;

    const tabCorner = new Instance('UICorner');
    tabCorner.CornerRadius = new UDim(0, 8);
    tabCorner.Parent = tab;

    tab.MouseButton1Click.Connect(() => showTab(tabName));
  });

  // Content
  const content = new Instance('ScrollingFrame');
  content.Name = 'Content';
  content.Size = new UDim2(1, -20, 1, -110);
  content.Position = new UDim2(0, 10, 0, 100);
  content.BackgroundTransparency = 1;
  content.ScrollBarThickness = 6;
  content.BorderSizePixel = 0;
  content.Parent = petInventoryFrame;

  const layout = new Instance('UIGridLayout');
  layout.CellSize = new UDim2(0, 110, 0, 130);
  layout.CellPadding = new UDim2(0, 8, 0, 8);
  layout.Parent = content;
}

function togglePetInventory(): void {
  petInventoryFrame.Visible = !petInventoryFrame.Visible;
  if (petInventoryFrame.Visible) {
    refreshPetData();
    showTab('Pets');
  }
}

async function refreshPetData(): Promise<void> {
  if (petRemotes?.getPets) {
    cachedPetState = petRemotes.getPets.InvokeServer() as typeof cachedPetState;
  }
}

function showTab(tabName: string): void {
  const tabFrame = petInventoryFrame.FindFirstChild('Frame') as Frame;
  const content = petInventoryFrame.FindFirstChild('Content') as ScrollingFrame;
  if (!content) return;

  // Clear
  for (const child of content.GetChildren()) {
    if (!child.IsA('UIGridLayout')) child.Destroy();
  }

  // Update tab styling
  for (const child of petInventoryFrame.GetDescendants()) {
    if (child.IsA('TextButton') && child.Name.sub(1, 4) === 'Tab_') {
      const isActive = child.Name === `Tab_${tabName}`;
      child.BackgroundColor3 = isActive
        ? new Color3(0.3, 0.5, 0.7)
        : new Color3(0.18, 0.2, 0.25);
    }
  }

  switch (tabName) {
    case 'Pets':
      renderPets(content);
      break;
    case 'Eggs':
      renderEggs(content);
      break;
    case 'Shop':
      renderShop(content);
      break;
  }
}

function renderPets(content: ScrollingFrame): void {
  if (!cachedPetState || cachedPetState.pets.size() === 0) {
    const empty = new Instance('TextLabel');
    empty.Size = new UDim2(1, 0, 0, 50);
    empty.BackgroundTransparency = 1;
    empty.Text = 'No pets yet! Buy eggs in the Shop.';
    empty.TextColor3 = new Color3(0.5, 0.5, 0.5);
    empty.TextSize = 14;
    empty.Parent = content;
    return;
  }

  for (const pet of cachedPetState.pets) {
    const species = getSpeciesById(pet.speciesId);
    if (!species) continue;

    const card = new Instance('Frame');
    card.BackgroundColor3 = pet.isEquipped
      ? new Color3(0.2, 0.35, 0.25)
      : new Color3(0.14, 0.16, 0.2);
    card.Parent = content;

    const cardCorner = new Instance('UICorner');
    cardCorner.CornerRadius = new UDim(0, 8);
    cardCorner.Parent = card;

    // Rarity border
    const stroke = new Instance('UIStroke');
    stroke.Color = PET_RARITY_COLORS[species.rarity];
    stroke.Thickness = 2;
    stroke.Parent = card;

    // Icon
    const icon = new Instance('Frame');
    icon.Size = new UDim2(0, 50, 0, 50);
    icon.Position = new UDim2(0.5, -25, 0, 8);
    icon.BackgroundColor3 = species.modelParts.bodyColor;
    icon.Parent = card;
    const iconCorner = new Instance('UICorner');
    iconCorner.CornerRadius = new UDim(1, 0);
    iconCorner.Parent = icon;

    // Name
    const name = new Instance('TextLabel');
    name.Size = new UDim2(1, -8, 0, 16);
    name.Position = new UDim2(0, 4, 0, 60);
    name.BackgroundTransparency = 1;
    name.Text = pet.name;
    name.TextColor3 = new Color3(1, 1, 1);
    name.TextSize = 11;
    name.Font = Enum.Font.GothamBold;
    name.TextTruncate = Enum.TextTruncate.AtEnd;
    name.Parent = card;

    // Stats
    const stats = new Instance('TextLabel');
    stats.Size = new UDim2(1, 0, 0, 14);
    stats.Position = new UDim2(0, 0, 0, 76);
    stats.BackgroundTransparency = 1;
    stats.Text = `Lv.${pet.level} ⚡${calculatePetPower(pet)}`;
    stats.TextColor3 = new Color3(0.6, 0.6, 0.6);
    stats.TextSize = 10;
    stats.Parent = card;

    // Equip button
    const btn = new Instance('TextButton');
    btn.Size = new UDim2(1, -12, 0, 24);
    btn.Position = new UDim2(0, 6, 1, -30);
    btn.BackgroundColor3 = pet.isEquipped
      ? new Color3(0.6, 0.25, 0.25)
      : new Color3(0.25, 0.5, 0.3);
    btn.Text = pet.isEquipped ? 'Unequip' : 'Equip';
    btn.TextColor3 = new Color3(1, 1, 1);
    btn.TextSize = 11;
    btn.Font = Enum.Font.GothamBold;
    btn.Parent = card;

    const btnCorner = new Instance('UICorner');
    btnCorner.CornerRadius = new UDim(0, 6);
    btnCorner.Parent = btn;

    btn.MouseButton1Click.Connect(() => {
      if (petRemotes?.equipPet) {
        petRemotes.equipPet.InvokeServer(pet.uniqueId);
        refreshPetData();
        showTab('Pets');
        updateFollowingPets();
      }
    });
  }

  content.CanvasSize = new UDim2(
    0,
    0,
    0,
    math.ceil(cachedPetState.pets.size() / 4) * 140,
  );
}

function renderEggs(content: ScrollingFrame): void {
  if (!cachedPetState || cachedPetState.incubatingEggs.size() === 0) {
    const empty = new Instance('TextLabel');
    empty.Size = new UDim2(1, 0, 0, 50);
    empty.BackgroundTransparency = 1;
    empty.Text = 'No eggs incubating.\nBuy some in the Shop!';
    empty.TextColor3 = new Color3(0.5, 0.5, 0.5);
    empty.TextSize = 14;
    empty.Parent = content;
    return;
  }

  cachedPetState.incubatingEggs.forEach((egg, idx) => {
    const eggType = EGG_TYPES.find((e) => e.id === egg.eggId);
    const remaining = math.max(0, egg.hatchTime - (tick() - egg.startTime));
    const ready = remaining <= 0;

    const card = new Instance('Frame');
    card.BackgroundColor3 = ready
      ? new Color3(0.25, 0.4, 0.3)
      : new Color3(0.16, 0.18, 0.22);
    card.Parent = content;

    const cardCorner = new Instance('UICorner');
    cardCorner.CornerRadius = new UDim(0, 8);
    cardCorner.Parent = card;

    const icon = new Instance('TextLabel');
    icon.Size = new UDim2(1, 0, 0, 50);
    icon.Position = new UDim2(0, 0, 0, 10);
    icon.BackgroundTransparency = 1;
    icon.Text = '🥚';
    icon.TextSize = 32;
    icon.Parent = card;

    const name = new Instance('TextLabel');
    name.Size = new UDim2(1, 0, 0, 16);
    name.Position = new UDim2(0, 0, 0, 58);
    name.BackgroundTransparency = 1;
    name.Text = eggType?.name ?? 'Egg';
    name.TextColor3 = new Color3(1, 1, 1);
    name.TextSize = 11;
    name.Font = Enum.Font.GothamBold;
    name.Parent = card;

    if (ready) {
      const hatchBtn = new Instance('TextButton');
      hatchBtn.Size = new UDim2(1, -12, 0, 26);
      hatchBtn.Position = new UDim2(0, 6, 1, -32);
      hatchBtn.BackgroundColor3 = new Color3(0.3, 0.6, 0.35);
      hatchBtn.Text = '🐣 Hatch!';
      hatchBtn.TextSize = 12;
      hatchBtn.Font = Enum.Font.GothamBold;
      hatchBtn.TextColor3 = new Color3(1, 1, 1);
      hatchBtn.Parent = card;

      hatchBtn.MouseButton1Click.Connect(() => {
        if (petRemotes?.hatchEgg) {
          petRemotes.hatchEgg.InvokeServer(idx);
          refreshPetData();
          showTab('Eggs');
        }
      });
    } else {
      const timer = new Instance('TextLabel');
      timer.Size = new UDim2(1, 0, 0, 20);
      timer.Position = new UDim2(0, 0, 0, 80);
      timer.BackgroundTransparency = 1;
      timer.Text = `⏱️ ${math.ceil(remaining)}s`;
      timer.TextColor3 = new Color3(1, 0.8, 0.3);
      timer.TextSize = 12;
      timer.Font = Enum.Font.GothamBold;
      timer.Parent = card;
    }
  });
}

function renderShop(content: ScrollingFrame): void {
  const coins = cachedPetState?.coins ?? 0;

  // Coins display
  const coinsLabel = new Instance('TextLabel');
  coinsLabel.Size = new UDim2(1, 0, 0, 30);
  coinsLabel.BackgroundTransparency = 1;
  coinsLabel.Text = `💰 Your Coins: ${coins}`;
  coinsLabel.TextColor3 = new Color3(1, 0.85, 0.3);
  coinsLabel.TextSize = 16;
  coinsLabel.Font = Enum.Font.GothamBold;
  coinsLabel.LayoutOrder = -1;
  coinsLabel.Parent = content;

  for (const egg of EGG_TYPES) {
    const card = new Instance('Frame');
    card.BackgroundColor3 = new Color3(0.16, 0.18, 0.24);
    card.Parent = content;

    const cardCorner = new Instance('UICorner');
    cardCorner.CornerRadius = new UDim(0, 8);
    cardCorner.Parent = card;

    const icon = new Instance('TextLabel');
    icon.Size = new UDim2(1, 0, 0, 45);
    icon.Position = new UDim2(0, 0, 0, 8);
    icon.BackgroundTransparency = 1;
    icon.Text = '🥚';
    icon.TextSize = 30;
    icon.Parent = card;

    const name = new Instance('TextLabel');
    name.Size = new UDim2(1, 0, 0, 14);
    name.Position = new UDim2(0, 0, 0, 50);
    name.BackgroundTransparency = 1;
    name.Text = egg.name;
    name.TextColor3 = new Color3(1, 1, 1);
    name.TextSize = 10;
    name.Font = Enum.Font.GothamBold;
    name.Parent = card;

    const time = new Instance('TextLabel');
    time.Size = new UDim2(1, 0, 0, 12);
    time.Position = new UDim2(0, 0, 0, 64);
    time.BackgroundTransparency = 1;
    time.Text = `⏱️ ${egg.hatchTime}s`;
    time.TextColor3 = new Color3(0.5, 0.5, 0.5);
    time.TextSize = 9;
    time.Parent = card;

    const buyBtn = new Instance('TextButton');
    buyBtn.Size = new UDim2(1, -12, 0, 24);
    buyBtn.Position = new UDim2(0, 6, 1, -30);
    buyBtn.BackgroundColor3 =
      coins >= egg.cost ? new Color3(0.3, 0.5, 0.7) : new Color3(0.3, 0.3, 0.3);
    buyBtn.Text = `💰 ${egg.cost}`;
    buyBtn.TextColor3 = new Color3(1, 1, 1);
    buyBtn.TextSize = 11;
    buyBtn.Font = Enum.Font.GothamBold;
    buyBtn.Parent = card;

    const buyBtnCorner = new Instance('UICorner');
    buyBtnCorner.CornerRadius = new UDim(0, 6);
    buyBtnCorner.Parent = buyBtn;

    buyBtn.MouseButton1Click.Connect(() => {
      if (petRemotes?.buyEgg) {
        petRemotes.buyEgg.InvokeServer(egg.id);
        refreshPetData();
        showTab('Shop');
      }
    });
  }

  content.CanvasSize = new UDim2(
    0,
    0,
    0,
    40 + math.ceil(EGG_TYPES.size() / 4) * 140,
  );
}

// ==========================================
// PET FOLLOWING SYSTEM
// ==========================================

function startPetFollowing(): void {
  petUpdateConnection = RunService.RenderStepped.Connect(updatePetPositions);
}

function updateFollowingPets(): void {
  for (const [, model] of activePetModels) model.Destroy();
  activePetModels.clear();

  if (!cachedPetState) return;

  for (const petId of cachedPetState.equippedPets) {
    const pet = cachedPetState.pets.find((p) => p.uniqueId === petId);
    if (!pet) continue;
    const species = getSpeciesById(pet.speciesId);
    if (!species) continue;

    const model = createPetModel(pet, species);
    activePetModels.set(petId, model);
  }
}

function createPetModel(
  pet: OwnedPet,
  species: { modelParts: { bodyColor: Color3; bodySize: Vector3 } },
): Model {
  const model = new Instance('Model');
  model.Name = `Pet_${pet.name}`;

  const body = new Instance('Part');
  body.Shape = Enum.PartType.Ball;
  body.Size = species.modelParts.bodySize;
  body.Color = species.modelParts.bodyColor;
  body.Material = Enum.Material.SmoothPlastic;
  body.Anchored = true;
  body.CanCollide = false;
  body.Parent = model;
  model.PrimaryPart = body;

  // Eyes
  for (let i = -1; i <= 1; i += 2) {
    const eye = new Instance('Part');
    eye.Name = i < 0 ? 'LeftEye' : 'RightEye';
    eye.Shape = Enum.PartType.Ball;
    eye.Size = new Vector3(0.15, 0.15, 0.15);
    eye.Color = new Color3(0, 0, 0);
    eye.Material = Enum.Material.SmoothPlastic;
    eye.Anchored = true;
    eye.CanCollide = false;
    eye.Parent = model;
  }

  // Glow for special variants
  if (pet.variant !== 'normal') {
    const highlight = new Instance('Highlight');
    highlight.FillTransparency = 0.85;
    highlight.FillColor =
      pet.variant === 'rainbow'
        ? new Color3(1, 0.5, 0.8)
        : pet.variant === 'golden'
          ? new Color3(1, 0.85, 0.3)
          : new Color3(0.9, 0.95, 1);
    highlight.OutlineColor = highlight.FillColor;
    highlight.Parent = model;
  }

  model.Parent = Workspace;
  return model;
}

function updatePetPositions(): void {
  const char = player.Character;
  if (!char) return;
  const root = char.FindFirstChild('HumanoidRootPart') as Part;
  if (!root) return;

  let i = 0;
  for (const [, model] of activePetModels) {
    if (!model.PrimaryPart) continue;

    const t = tick() + i * 2.1;
    const r = 3 + i * 0.5;
    const angle = t * 1.2;
    const x = math.cos(angle) * r;
    const z = math.sin(angle) * r;
    const y = 2.5 + math.sin(t * 2.5) * 0.25;

    const target = root.Position.add(new Vector3(x, y, z));
    const current = model.PrimaryPart.Position;
    const newPos = current.Lerp(target, 0.08);
    model.SetPrimaryPartCFrame(CFrame.lookAt(newPos, root.Position));

    // Eyes
    const le = model.FindFirstChild('LeftEye') as Part;
    const re = model.FindFirstChild('RightEye') as Part;
    const fwd = model.PrimaryPart.CFrame.LookVector;
    const rt = model.PrimaryPart.CFrame.RightVector;
    const up = model.PrimaryPart.CFrame.UpVector;
    if (le)
      le.Position = model.PrimaryPart.Position.add(fwd.mul(0.35))
        .add(rt.mul(-0.12))
        .add(up.mul(0.08));
    if (re)
      re.Position = model.PrimaryPart.Position.add(fwd.mul(0.35))
        .add(rt.mul(0.12))
        .add(up.mul(0.08));

    i++;
  }
}
