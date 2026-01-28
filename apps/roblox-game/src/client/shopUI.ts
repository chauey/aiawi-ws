// Pet Shop UI - Buy pets with coins!
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

// Pet prices (in coins) - counting by 5s
const PETS = [
	{ name: "crab", emoji: "🦀", label: "Crab", price: 5 },
	{ name: "fish", emoji: "🐟", label: "Fish", price: 10 },
	{ name: "turtle", emoji: "🐢", label: "Turtle", price: 15 },
	{ name: "frog", emoji: "🐸", label: "Frog", price: 20 },
	{ name: "duck", emoji: "🦆", label: "Duck", price: 25 },
	{ name: "cat", emoji: "🐱", label: "Cat", price: 30 },
	{ name: "dog", emoji: "🐕", label: "Dog", price: 35 },
	{ name: "rabbit", emoji: "🐰", label: "Rabbit", price: 40 },
	{ name: "fox", emoji: "🦊", label: "Fox", price: 45 },
	{ name: "bear", emoji: "🐻", label: "Bear", price: 50 },
	{ name: "penguin", emoji: "🐧", label: "Penguin", price: 55 },
	{ name: "owl", emoji: "🦉", label: "Owl", price: 60 },
	{ name: "bat", emoji: "🦇", label: "Bat", price: 65 },
	{ name: "dragon", emoji: "🐉", label: "Dragon", price: 70 },
	{ name: "unicorn", emoji: "🦄", label: "Unicorn", price: 75 },
	{ name: "phoenix", emoji: "🔥", label: "Phoenix", price: 80 },
];

export function createShopUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "ShopUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 60;
	
	// Shop button hidden - now in action bar
	// Keep for backwards compatibility but invisible
	const shopBtn = new Instance("TextButton");
	shopBtn.Name = "ShopButton";
	shopBtn.Size = new UDim2(0, 100, 0, 40);
	shopBtn.Position = new UDim2(0, 15, 1, -55);
	shopBtn.BackgroundColor3 = Color3.fromRGB(220, 160, 50);
	shopBtn.Text = "🛒 Shop";
	shopBtn.TextColor3 = new Color3(1, 1, 1);
	shopBtn.TextSize = 16;
	shopBtn.Font = Enum.Font.GothamBold;
	shopBtn.Visible = false; // Hidden - handled by action bar
	shopBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = shopBtn;
	
	// Shop panel (hidden by default)
	const shopPanel = new Instance("Frame");
	shopPanel.Name = "ShopPanel";
	shopPanel.Size = new UDim2(0, 350, 0, 450);
	shopPanel.Position = new UDim2(0.5, -175, 0.5, -225);
	shopPanel.BackgroundColor3 = Color3.fromRGB(40, 45, 60);
	shopPanel.Visible = false;
	shopPanel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = shopPanel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 50);
	title.BackgroundTransparency = 1;
	title.Text = "🛒 PET SHOP";
	title.TextColor3 = Color3.fromRGB(255, 220, 100);
	title.TextSize = 24;
	title.Font = Enum.Font.GothamBold;
	title.Parent = shopPanel;
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 35, 0, 35);
	closeBtn.Position = new UDim2(1, -45, 0, 8);
	closeBtn.BackgroundColor3 = Color3.fromRGB(180, 60, 60);
	closeBtn.Text = "✕";
	closeBtn.TextColor3 = new Color3(1, 1, 1);
	closeBtn.TextSize = 18;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = shopPanel;
	
	const closeBtnCorner = new Instance("UICorner");
	closeBtnCorner.CornerRadius = new UDim(0, 8);
	closeBtnCorner.Parent = closeBtn;
	
	// Pet list container
	const petList = new Instance("ScrollingFrame");
	petList.Size = new UDim2(1, -30, 1, -70);
	petList.Position = new UDim2(0, 15, 0, 55);
	petList.BackgroundTransparency = 1;
	petList.ScrollBarThickness = 6;
	petList.CanvasSize = new UDim2(0, 0, 0, PETS.size() * 60);
	petList.Parent = shopPanel;
	
	const listLayout = new Instance("UIListLayout");
	listLayout.Padding = new UDim(0, 8);
	listLayout.Parent = petList;
	
	// Create pet item buttons
	for (const pet of PETS) {
		const item = new Instance("Frame");
		item.Size = new UDim2(1, -10, 0, 50);
		item.BackgroundColor3 = Color3.fromRGB(60, 65, 80);
		item.Parent = petList;
		
		const itemCorner = new Instance("UICorner");
		itemCorner.CornerRadius = new UDim(0, 10);
		itemCorner.Parent = item;
		
		const petLabel = new Instance("TextLabel");
		petLabel.Size = new UDim2(0.55, 0, 1, 0);
		petLabel.Position = new UDim2(0, 10, 0, 0);
		petLabel.BackgroundTransparency = 1;
		petLabel.Text = `${pet.emoji} ${pet.label}`;
		petLabel.TextColor3 = new Color3(1, 1, 1);
		petLabel.TextSize = 16;
		petLabel.TextXAlignment = Enum.TextXAlignment.Left;
		petLabel.Font = Enum.Font.GothamBold;
		petLabel.Parent = item;
		
		const buyBtn = new Instance("TextButton");
		buyBtn.Size = new UDim2(0, 80, 0, 32);
		buyBtn.Position = new UDim2(1, -90, 0.5, -16);
		buyBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 220);
		buyBtn.Text = `🪙 ${pet.price}`;
		buyBtn.TextColor3 = new Color3(1, 1, 1);
		buyBtn.TextSize = 14;
		buyBtn.Font = Enum.Font.GothamBold;
		buyBtn.Parent = item;
		
		const buyBtnCorner = new Instance("UICorner");
		buyBtnCorner.CornerRadius = new UDim(0, 8);
		buyBtnCorner.Parent = buyBtn;
		
		// Buy/Select pet on click
		buyBtn.MouseButton1Click.Connect(() => {
			const changePetRemote = ReplicatedStorage.FindFirstChild("ChangePet") as RemoteEvent | undefined;
			if (changePetRemote) {
				// Server will validate coins and process purchase
				changePetRemote.FireServer(pet.name, pet.price);
				print(`🐾 Trying to buy ${pet.label} for ${pet.price} coins!`);
				
				// Visual feedback
				buyBtn.Text = "...";
				task.delay(0.5, () => {
					buyBtn.Text = `🪙 ${pet.price}`;
				});
			}
		});
	}
	
	// Add to player GUI
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	// Toggle shop panel
	shopBtn.MouseButton1Click.Connect(() => {
		shopPanel.Visible = !shopPanel.Visible;
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		shopPanel.Visible = false;
	});
	
	print("🛒 Pet Shop UI ready!");
}
