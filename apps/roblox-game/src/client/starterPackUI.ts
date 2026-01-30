// Starter Pack UI - Show to new players for conversion
import { Players } from "@rbxts/services";

const player = Players.LocalPlayer;

interface StarterPack {
	id: string;
	name: string;
	price: number;
	gems: number;
	pets: string[];
	multiplier: number;
	color: Color3;
}

const STARTER_PACKS: StarterPack[] = [
	{
		id: "starter_basic",
		name: "Starter Pack",
		price: 99,
		gems: 500,
		pets: ["Rare Dog"],
		multiplier: 5,
		color: Color3.fromRGB(100, 180, 255),
	},
	{
		id: "starter_pro",
		name: "Pro Pack",
		price: 399,
		gems: 3000,
		pets: ["Epic Dragon", "Rare Unicorn"],
		multiplier: 10,
		color: Color3.fromRGB(180, 100, 255),
	},
	{
		id: "starter_ultimate",
		name: "Ultimate Pack",
		price: 799,
		gems: 8000,
		pets: ["Mythic Phoenix", "Legendary Dragon"],
		multiplier: 15,
		color: Color3.fromRGB(255, 180, 50),
	},
];

export function createStarterPackUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "StarterPackUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 500; // On top of everything
	
	// Background overlay
	const overlay = new Instance("Frame");
	overlay.Name = "Overlay";
	overlay.Size = new UDim2(1, 0, 1, 0);
	overlay.BackgroundColor3 = new Color3(0, 0, 0);
	overlay.BackgroundTransparency = 0.5;
	overlay.Visible = false;
	overlay.Parent = screenGui;
	
	// Main panel
	const panel = new Instance("Frame");
	panel.Name = "StarterPanel";
	panel.Size = new UDim2(0, 550, 0, 350);
	panel.Position = new UDim2(0.5, -275, 0.5, -175);
	panel.BackgroundColor3 = Color3.fromRGB(25, 30, 45);
	panel.Parent = overlay;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 20);
	panelCorner.Parent = panel;
	
	const panelStroke = new Instance("UIStroke");
	panelStroke.Color = Color3.fromRGB(255, 200, 50);
	panelStroke.Thickness = 3;
	panelStroke.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Name = "Title";
	title.Size = new UDim2(1, 0, 0, 50);
	title.BackgroundTransparency = 1;
	title.Text = "🌟 STARTER PACK SPECIAL! 🌟";
	title.TextColor3 = Color3.fromRGB(255, 220, 100);
	title.TextSize = 28;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Subtitle
	const subtitle = new Instance("TextLabel");
	subtitle.Name = "Subtitle";
	subtitle.Size = new UDim2(1, 0, 0, 25);
	subtitle.Position = new UDim2(0, 0, 0, 45);
	subtitle.BackgroundTransparency = 1;
	subtitle.Text = "One-time offer for new players!";
	subtitle.TextColor3 = Color3.fromRGB(200, 200, 200);
	subtitle.TextSize = 16;
	subtitle.Font = Enum.Font.Gotham;
	subtitle.Parent = panel;
	
	// Pack cards container
	const cardsContainer = new Instance("Frame");
	cardsContainer.Name = "Cards";
	cardsContainer.Size = new UDim2(1, -40, 0, 200);
	cardsContainer.Position = new UDim2(0, 20, 0, 80);
	cardsContainer.BackgroundTransparency = 1;
	cardsContainer.Parent = panel;
	
	const layout = new Instance("UIListLayout");
	layout.FillDirection = Enum.FillDirection.Horizontal;
	layout.Padding = new UDim(0, 15);
	layout.HorizontalAlignment = Enum.HorizontalAlignment.Center;
	layout.Parent = cardsContainer;
	
	// Create pack cards
	for (const pack of STARTER_PACKS) {
		createPackCard(cardsContainer, pack);
	}
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Name = "CloseBtn";
	closeBtn.Size = new UDim2(0, 150, 0, 35);
	closeBtn.Position = new UDim2(0.5, -75, 1, -50);
	closeBtn.BackgroundColor3 = Color3.fromRGB(80, 80, 80);
	closeBtn.Text = "Maybe Later";
	closeBtn.TextColor3 = new Color3(1, 1, 1);
	closeBtn.TextSize = 14;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = panel;
	
	const closeBtnCorner = new Instance("UICorner");
	closeBtnCorner.CornerRadius = new UDim(0, 8);
	closeBtnCorner.Parent = closeBtn;
	
	closeBtn.MouseButton1Click.Connect(() => {
		overlay.Visible = false;
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🌟 Starter Pack UI ready!");
	
	return overlay;
}

function createPackCard(parent: Frame, pack: StarterPack) {
	const card = new Instance("Frame");
	card.Name = pack.id;
	card.Size = new UDim2(0, 155, 0, 195);
	card.BackgroundColor3 = Color3.fromRGB(40, 45, 60);
	card.Parent = parent;
	
	const cardCorner = new Instance("UICorner");
	cardCorner.CornerRadius = new UDim(0, 12);
	cardCorner.Parent = card;
	
	const cardStroke = new Instance("UIStroke");
	cardStroke.Color = pack.color;
	cardStroke.Thickness = 2;
	cardStroke.Parent = card;
	
	// Value badge
	const badge = new Instance("TextLabel");
	badge.Name = "Badge";
	badge.Size = new UDim2(0, 80, 0, 22);
	badge.Position = new UDim2(0.5, -40, 0, -11);
	badge.BackgroundColor3 = pack.color;
	badge.Text = `${pack.multiplier}x VALUE!`;
	badge.TextColor3 = new Color3(1, 1, 1);
	badge.TextSize = 12;
	badge.Font = Enum.Font.GothamBold;
	badge.Parent = card;
	
	const badgeCorner = new Instance("UICorner");
	badgeCorner.CornerRadius = new UDim(0, 6);
	badgeCorner.Parent = badge;
	
	// Pack name
	const nameLabel = new Instance("TextLabel");
	nameLabel.Size = new UDim2(1, 0, 0, 25);
	nameLabel.Position = new UDim2(0, 0, 0, 20);
	nameLabel.BackgroundTransparency = 1;
	nameLabel.Text = pack.name;
	nameLabel.TextColor3 = pack.color;
	nameLabel.TextSize = 16;
	nameLabel.Font = Enum.Font.GothamBold;
	nameLabel.Parent = card;
	
	// Contents
	const contents = new Instance("TextLabel");
	contents.Size = new UDim2(1, -10, 0, 80);
	contents.Position = new UDim2(0, 5, 0, 50);
	contents.BackgroundTransparency = 1;
	contents.Text = `💎 ${pack.gems} Gems\n🐾 ${pack.pets.join(", ")}`;
	contents.TextColor3 = Color3.fromRGB(200, 200, 200);
	contents.TextSize = 12;
	contents.Font = Enum.Font.Gotham;
	contents.TextWrapped = true;
	contents.TextXAlignment = Enum.TextXAlignment.Center;
	contents.TextYAlignment = Enum.TextYAlignment.Top;
	contents.Parent = card;
	
	// Buy button
	const buyBtn = new Instance("TextButton");
	buyBtn.Name = "BuyBtn";
	buyBtn.Size = new UDim2(1, -20, 0, 35);
	buyBtn.Position = new UDim2(0, 10, 1, -45);
	buyBtn.BackgroundColor3 = Color3.fromRGB(80, 200, 80);
	buyBtn.Text = `R$ ${pack.price}`;
	buyBtn.TextColor3 = new Color3(1, 1, 1);
	buyBtn.TextSize = 16;
	buyBtn.Font = Enum.Font.GothamBold;
	buyBtn.Parent = card;
	
	const buyBtnCorner = new Instance("UICorner");
	buyBtnCorner.CornerRadius = new UDim(0, 8);
	buyBtnCorner.Parent = buyBtn;
	
	buyBtn.MouseButton1Click.Connect(() => {
		print(`🛒 Player wants to buy ${pack.name}!`);
		// TODO: Connect to MarketplaceService
	});
}

export function showStarterPackPopup() {
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	const overlay = playerGui.FindFirstChild("StarterPackUI")?.FindFirstChild("Overlay") as Frame | undefined;
	if (overlay) {
		overlay.Visible = true;
	}
}

export function hideStarterPackPopup() {
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	const overlay = playerGui.FindFirstChild("StarterPackUI")?.FindFirstChild("Overlay") as Frame | undefined;
	if (overlay) {
		overlay.Visible = false;
	}
}
