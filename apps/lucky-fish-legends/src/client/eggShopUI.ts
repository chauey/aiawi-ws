// Egg Shop UI - Buy and hatch eggs with animation!
import { Players, ReplicatedStorage, TweenService } from "@rbxts/services";

const player = Players.LocalPlayer;

// Rarity colors (must match server)
const RARITY_COLORS: { [key: string]: Color3 } = {
	Common: Color3.fromRGB(180, 180, 180),
	Uncommon: Color3.fromRGB(100, 200, 100),
	Rare: Color3.fromRGB(100, 150, 255),
	Epic: Color3.fromRGB(180, 100, 255),
	Legendary: Color3.fromRGB(255, 200, 50),
	Mythic: Color3.fromRGB(255, 100, 150),
};

// Egg data (simplified, matches server)
const EGGS = [
	{ id: "basic", name: "Basic Egg", price: 50, color: Color3.fromRGB(200, 200, 200), emoji: "🥚" },
	{ id: "premium", name: "Premium Egg", price: 250, color: Color3.fromRGB(180, 130, 255), emoji: "💜" },
	{ id: "legendary", name: "Legendary Egg", price: 1000, color: Color3.fromRGB(255, 200, 50), emoji: "⭐" },
	{ id: "mythic", name: "Mythic Egg", price: 5000, color: Color3.fromRGB(255, 100, 150), emoji: "💎" },
];

export function createEggShopUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "EggShopUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 85;
	
	// Egg shop button (bottom left, next to pet shop)
	const eggBtn = new Instance("TextButton");
	eggBtn.Name = "EggShopBtn";
	eggBtn.Size = new UDim2(0, 100, 0, 40);
	eggBtn.Position = new UDim2(0, 235, 1, -55);
	eggBtn.BackgroundColor3 = Color3.fromRGB(255, 180, 100);
	eggBtn.Text = "🥚 EGGS";
	eggBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	eggBtn.TextSize = 16;
	eggBtn.Font = Enum.Font.GothamBold;
	eggBtn.Visible = false; // Hidden - now in action bar
	eggBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = eggBtn;
	
	// Egg shop panel
	const panel = new Instance("Frame");
	panel.Name = "EggPanel";
	panel.Size = new UDim2(0, 400, 0, 320);
	panel.Position = new UDim2(0.5, -200, 0.5, -160);
	panel.BackgroundColor3 = Color3.fromRGB(35, 35, 50);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Name = "Title";
	title.Size = new UDim2(1, 0, 0, 45);
	title.BackgroundTransparency = 1;
	title.Text = "🥚 EGG SHOP 🥚";
	title.TextColor3 = Color3.fromRGB(255, 200, 100);
	title.TextSize = 22;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Egg grid
	const eggGrid = new Instance("Frame");
	eggGrid.Name = "EggGrid";
	eggGrid.Size = new UDim2(1, -20, 0, 200);
	eggGrid.Position = new UDim2(0, 10, 0, 50);
	eggGrid.BackgroundTransparency = 1;
	eggGrid.Parent = panel;
	
	const gridLayout = new Instance("UIGridLayout");
	gridLayout.CellSize = new UDim2(0, 90, 0, 95);
	gridLayout.CellPadding = new UDim2(0, 8, 0, 8);
	gridLayout.SortOrder = Enum.SortOrder.LayoutOrder;
	gridLayout.Parent = eggGrid;
	
	// Create egg buttons
	for (let i = 0; i < EGGS.size(); i++) {
		const egg = EGGS[i];
		createEggButton(eggGrid, egg, i, screenGui);
	}
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Name = "CloseBtn";
	closeBtn.Size = new UDim2(0, 100, 0, 35);
	closeBtn.Position = new UDim2(0.5, -50, 1, -50);
	closeBtn.BackgroundColor3 = Color3.fromRGB(200, 60, 60);
	closeBtn.Text = "CLOSE";
	closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	closeBtn.TextSize = 16;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = panel;
	
	const closeBtnCorner = new Instance("UICorner");
	closeBtnCorner.CornerRadius = new UDim(0, 8);
	closeBtnCorner.Parent = closeBtn;
	
	// Toggle panel
	eggBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	// Listen for hatch results
	setupHatchAnimation(screenGui);
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🥚 Egg shop UI ready!");
}

function createEggButton(parent: Frame, egg: { id: string; name: string; price: number; color: Color3; emoji: string }, index: number, screenGui: ScreenGui) {
	const btn = new Instance("TextButton");
	btn.Name = egg.id;
	btn.Size = new UDim2(1, 0, 1, 0);
	btn.BackgroundColor3 = egg.color;
	btn.Text = "";
	btn.LayoutOrder = index;
	btn.Parent = parent;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = btn;
	
	// Emoji
	const emoji = new Instance("TextLabel");
	emoji.Name = "Emoji";
	emoji.Size = new UDim2(1, 0, 0, 40);
	emoji.Position = new UDim2(0, 0, 0, 5);
	emoji.BackgroundTransparency = 1;
	emoji.Text = egg.emoji;
	emoji.TextSize = 32;
	emoji.Parent = btn;
	
	// Price
	const price = new Instance("TextLabel");
	price.Name = "Price";
	price.Size = new UDim2(1, 0, 0, 20);
	price.Position = new UDim2(0, 0, 0, 45);
	price.BackgroundTransparency = 1;
	price.Text = `🪙 ${egg.price}`;
	price.TextColor3 = Color3.fromRGB(255, 215, 0);
	price.TextSize = 14;
	price.Font = Enum.Font.GothamBold;
	price.Parent = btn;
	
	// Name
	const nameLabel = new Instance("TextLabel");
	nameLabel.Name = "Name";
	nameLabel.Size = new UDim2(1, 0, 0, 18);
	nameLabel.Position = new UDim2(0, 0, 0, 68);
	nameLabel.BackgroundTransparency = 1;
	nameLabel.Text = string.gsub(egg.name, " Egg", "")[0];
	nameLabel.TextColor3 = Color3.fromRGB(50, 50, 50);
	nameLabel.TextSize = 12;
	nameLabel.Font = Enum.Font.GothamBold;
	nameLabel.Parent = btn;
	
	// Click to buy
	btn.MouseButton1Click.Connect(() => {
		const buyRemote = ReplicatedStorage.FindFirstChild("BuyEgg") as RemoteFunction | undefined;
		if (buyRemote) {
			const result = buyRemote.InvokeServer(egg.id) as { success: boolean; message?: string; pet?: string; rarity?: string };
			if (!result.success) {
				// Show error briefly
				showMessage(screenGui, result.message ?? "Failed!", Color3.fromRGB(255, 80, 80));
			}
			// Success animation handled by HatchResult event
		}
	});
}

function setupHatchAnimation(screenGui: ScreenGui) {
	const hatchRemote = ReplicatedStorage.WaitForChild("HatchResult", 1) as RemoteEvent | undefined;
	if (!hatchRemote) return;
	
	// Hatch overlay
	const overlay = new Instance("Frame");
	overlay.Name = "HatchOverlay";
	overlay.Size = new UDim2(1, 0, 1, 0);
	overlay.BackgroundColor3 = Color3.fromRGB(0, 0, 0);
	overlay.BackgroundTransparency = 0.5;
	overlay.Visible = false;
	overlay.ZIndex = 100;
	overlay.Parent = screenGui;
	
	// Egg image (using text for now)
	const eggDisplay = new Instance("TextLabel");
	eggDisplay.Name = "EggDisplay";
	eggDisplay.Size = new UDim2(0, 150, 0, 150);
	eggDisplay.Position = new UDim2(0.5, -75, 0.5, -100);
	eggDisplay.BackgroundTransparency = 1;
	eggDisplay.Text = "🥚";
	eggDisplay.TextSize = 120;
	eggDisplay.ZIndex = 101;
	eggDisplay.Parent = overlay;
	
	// Result text
	const resultText = new Instance("TextLabel");
	resultText.Name = "ResultText";
	resultText.Size = new UDim2(0, 400, 0, 60);
	resultText.Position = new UDim2(0.5, -200, 0.5, 60);
	resultText.BackgroundTransparency = 1;
	resultText.Text = "";
	resultText.TextColor3 = Color3.fromRGB(255, 255, 255);
	resultText.TextSize = 28;
	resultText.Font = Enum.Font.GothamBold;
	resultText.ZIndex = 101;
	resultText.Parent = overlay;
	
	// Rarity text
	const rarityText = new Instance("TextLabel");
	rarityText.Name = "RarityText";
	rarityText.Size = new UDim2(0, 400, 0, 40);
	rarityText.Position = new UDim2(0.5, -200, 0.5, 120);
	rarityText.BackgroundTransparency = 1;
	rarityText.Text = "";
	rarityText.TextSize = 24;
	rarityText.Font = Enum.Font.GothamBold;
	rarityText.ZIndex = 101;
	rarityText.Parent = overlay;
	
	hatchRemote.OnClientEvent.Connect((petName: string, rarity: string) => {
		// Show hatching animation
		overlay.Visible = true;
		eggDisplay.Text = "🥚";
		resultText.Text = "";
		rarityText.Text = "";
		
		// Shake animation
		for (let i = 0; i < 6; i++) {
			eggDisplay.Rotation = 15;
			wait(0.1);
			eggDisplay.Rotation = -15;
			wait(0.1);
		}
		eggDisplay.Rotation = 0;
		
		// Crack!
		eggDisplay.Text = "💥";
		wait(0.3);
		
		// Show pet emoji based on type
		const petEmojis: { [key: string]: string } = {
			cat: "🐱", dog: "🐕", bunny: "🐰", hamster: "🐹",
			bear: "🐻", panda: "🐼", penguin: "🐧", fox: "🦊",
			lion: "🦁", tiger: "🐯", elephant: "🐘", owl: "🦉",
			unicorn: "🦄", dragon: "🐉", phoenix: "🔥", crab: "🦀",
		};
		
		eggDisplay.Text = petEmojis[petName] ?? "❓";
		resultText.Text = `You got: ${petName.upper()}!`;
		rarityText.Text = rarity;
		rarityText.TextColor3 = RARITY_COLORS[rarity] ?? Color3.fromRGB(255, 255, 255);
		
		// Wait then close
		wait(2.5);
		overlay.Visible = false;
	});
}

function showMessage(screenGui: ScreenGui, message: string, color: Color3) {
	const msgLabel = new Instance("TextLabel");
	msgLabel.Size = new UDim2(0, 300, 0, 40);
	msgLabel.Position = new UDim2(0.5, -150, 0.4, 0);
	msgLabel.BackgroundColor3 = color;
	msgLabel.BackgroundTransparency = 0.2;
	msgLabel.Text = message;
	msgLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
	msgLabel.TextSize = 18;
	msgLabel.Font = Enum.Font.GothamBold;
	msgLabel.ZIndex = 50;
	msgLabel.Parent = screenGui;
	
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 10);
	corner.Parent = msgLabel;
	
	wait(1.5);
	msgLabel.Destroy();
}
