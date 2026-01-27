// Map Shop UI - Buy new worlds/areas!
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

// Map prices
const MAPS = [
	{ id: "beach", name: "🏖️ Beach Paradise", price: 10, desc: "Sunny beach with palm trees!" },
	{ id: "volcano", name: "🌋 Volcano Island", price: 100, desc: "Lava rivers and fire coins!" },
	{ id: "space", name: "🚀 Space Station", price: 1000, desc: "Zero gravity coin hunting!" },
	{ id: "candy", name: "🍭 Candy Land", price: 5000, desc: "Sweet treats everywhere!" },
	{ id: "ice", name: "❄️ Ice Kingdom", price: 10000, desc: "Frozen palace of riches!" },
	{ id: "rainbow", name: "🌈 Rainbow Sky", price: 50000, desc: "Clouds of gold coins!" },
];

export function createMapShopUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "MapShopUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 65;
	
	// Map button (bottom left, next to shop)
	const mapBtn = new Instance("TextButton");
	mapBtn.Name = "MapButton";
	mapBtn.Size = new UDim2(0, 100, 0, 40);
	mapBtn.Position = new UDim2(0, 125, 1, -55);
	mapBtn.BackgroundColor3 = Color3.fromRGB(80, 160, 220);
	mapBtn.Text = "🗺️ Maps";
	mapBtn.TextColor3 = new Color3(1, 1, 1);
	mapBtn.TextSize = 16;
	mapBtn.Font = Enum.Font.GothamBold;
	mapBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = mapBtn;
	
	// Map panel (hidden by default)
	const mapPanel = new Instance("Frame");
	mapPanel.Name = "MapPanel";
	mapPanel.Size = new UDim2(0, 320, 0, 300);
	mapPanel.Position = new UDim2(0.5, -160, 0.5, -150);
	mapPanel.BackgroundColor3 = Color3.fromRGB(35, 50, 70);
	mapPanel.Visible = false;
	mapPanel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = mapPanel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 50);
	title.BackgroundTransparency = 1;
	title.Text = "🗺️ WORLD SHOP";
	title.TextColor3 = Color3.fromRGB(100, 200, 255);
	title.TextSize = 22;
	title.Font = Enum.Font.GothamBold;
	title.Parent = mapPanel;
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 35, 0, 35);
	closeBtn.Position = new UDim2(1, -45, 0, 8);
	closeBtn.BackgroundColor3 = Color3.fromRGB(180, 60, 60);
	closeBtn.Text = "✕";
	closeBtn.TextColor3 = new Color3(1, 1, 1);
	closeBtn.TextSize = 18;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = mapPanel;
	
	const closeBtnCorner = new Instance("UICorner");
	closeBtnCorner.CornerRadius = new UDim(0, 8);
	closeBtnCorner.Parent = closeBtn;
	
	// Map list container
	const mapList = new Instance("Frame");
	mapList.Size = new UDim2(1, -30, 1, -70);
	mapList.Position = new UDim2(0, 15, 0, 55);
	mapList.BackgroundTransparency = 1;
	mapList.Parent = mapPanel;
	
	const listLayout = new Instance("UIListLayout");
	listLayout.Padding = new UDim(0, 10);
	listLayout.Parent = mapList;
	
	// Create map item buttons
	for (const map of MAPS) {
		const item = new Instance("Frame");
		item.Size = new UDim2(1, 0, 0, 65);
		item.BackgroundColor3 = Color3.fromRGB(50, 65, 85);
		item.Parent = mapList;
		
		const itemCorner = new Instance("UICorner");
		itemCorner.CornerRadius = new UDim(0, 10);
		itemCorner.Parent = item;
		
		const mapLabel = new Instance("TextLabel");
		mapLabel.Size = new UDim2(0.55, 0, 0, 28);
		mapLabel.Position = new UDim2(0, 10, 0, 5);
		mapLabel.BackgroundTransparency = 1;
		mapLabel.Text = map.name;
		mapLabel.TextColor3 = new Color3(1, 1, 1);
		mapLabel.TextSize = 16;
		mapLabel.TextXAlignment = Enum.TextXAlignment.Left;
		mapLabel.Font = Enum.Font.GothamBold;
		mapLabel.Parent = item;
		
		const descLabel = new Instance("TextLabel");
		descLabel.Size = new UDim2(0.6, 0, 0, 20);
		descLabel.Position = new UDim2(0, 10, 0, 32);
		descLabel.BackgroundTransparency = 1;
		descLabel.Text = map.desc;
		descLabel.TextColor3 = Color3.fromRGB(180, 180, 200);
		descLabel.TextSize = 12;
		descLabel.TextXAlignment = Enum.TextXAlignment.Left;
		descLabel.Font = Enum.Font.Gotham;
		descLabel.Parent = item;
		
		const buyBtn = new Instance("TextButton");
		buyBtn.Size = new UDim2(0, 85, 0, 35);
		buyBtn.Position = new UDim2(1, -95, 0.5, -17);
		buyBtn.BackgroundColor3 = Color3.fromRGB(60, 180, 120);
		buyBtn.Text = `🪙 ${map.price}`;
		buyBtn.TextColor3 = new Color3(1, 1, 1);
		buyBtn.TextSize = 14;
		buyBtn.Font = Enum.Font.GothamBold;
		buyBtn.Parent = item;
		
		const buyBtnCorner = new Instance("UICorner");
		buyBtnCorner.CornerRadius = new UDim(0, 8);
		buyBtnCorner.Parent = buyBtn;
		
		// Buy/Teleport on click
		buyBtn.MouseButton1Click.Connect(() => {
			const teleportRemote = ReplicatedStorage.FindFirstChild("TeleportToMap") as RemoteEvent | undefined;
			if (teleportRemote) {
				teleportRemote.FireServer(map.id, map.price);
				print(`🗺️ Trying to go to ${map.name}!`);
				
				buyBtn.Text = "...";
				task.delay(0.5, () => {
					buyBtn.Text = `🪙 ${map.price}`;
				});
			}
		});
	}
	
	// Add to player GUI
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	// Toggle map panel
	mapBtn.MouseButton1Click.Connect(() => {
		mapPanel.Visible = !mapPanel.Visible;
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		mapPanel.Visible = false;
	});
	
	print("🗺️ Map Shop UI ready!");
}
