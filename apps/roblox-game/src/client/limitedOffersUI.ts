// Limited Offers UI - Daily rotating offers with countdown
import { Players } from "@rbxts/services";

const player = Players.LocalPlayer;

interface LimitedOffer {
	id: string;
	name: string;
	icon: string;
	originalPrice: number;
	salePrice: number;
	discount: number;
	rewards: string[];
	endsIn: number; // seconds from now
}

// Sample daily offer
function getTodaysOffer(): LimitedOffer {
	return {
		id: "daily_special",
		name: "Daily Special",
		icon: "🎁",
		originalPrice: 500,
		salePrice: 199,
		discount: 60,
		rewards: ["300 Gems", "Rare Egg", "2x Coins (1hr)"],
		endsIn: 24 * 3600, // 24 hours
	};
}

export function createLimitedOffersUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "LimitedOffersUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 150;
	
	const offer = getTodaysOffer();
	
	// Floating offer button (top left)
	const offerBtn = new Instance("TextButton");
	offerBtn.Name = "OfferBtn";
	offerBtn.Size = new UDim2(0, 140, 0, 45);
	offerBtn.Position = new UDim2(0, 10, 0, 215);
	offerBtn.BackgroundColor3 = Color3.fromRGB(200, 50, 50);
	offerBtn.Text = "";
	offerBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = offerBtn;
	
	const btnStroke = new Instance("UIStroke");
	btnStroke.Color = Color3.fromRGB(255, 100, 100);
	btnStroke.Thickness = 2;
	btnStroke.Parent = offerBtn;
	
	// Icon
	const icon = new Instance("TextLabel");
	icon.Size = new UDim2(0, 35, 1, 0);
	icon.BackgroundTransparency = 1;
	icon.Text = "🔥";
	icon.TextSize = 24;
	icon.Parent = offerBtn;
	
	// Text
	const label = new Instance("TextLabel");
	label.Size = new UDim2(1, -40, 0, 20);
	label.Position = new UDim2(0, 38, 0, 3);
	label.BackgroundTransparency = 1;
	label.Text = `${offer.discount}% OFF!`;
	label.TextColor3 = new Color3(1, 1, 1);
	label.TextSize = 14;
	label.Font = Enum.Font.GothamBold;
	label.TextXAlignment = Enum.TextXAlignment.Left;
	label.Parent = offerBtn;
	
	// Timer
	const timer = new Instance("TextLabel");
	timer.Name = "Timer";
	timer.Size = new UDim2(1, -40, 0, 15);
	timer.Position = new UDim2(0, 38, 0, 22);
	timer.BackgroundTransparency = 1;
	timer.Text = "23:59:59";
	timer.TextColor3 = Color3.fromRGB(255, 200, 100);
	timer.TextSize = 11;
	timer.Font = Enum.Font.Gotham;
	timer.TextXAlignment = Enum.TextXAlignment.Left;
	timer.Parent = offerBtn;
	
	// Popup panel (hidden by default)
	const panel = new Instance("Frame");
	panel.Name = "OfferPanel";
	panel.Size = new UDim2(0, 280, 0, 300);
	panel.Position = new UDim2(0.5, -140, 0.5, -150);
	panel.BackgroundColor3 = Color3.fromRGB(35, 40, 55);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	const panelStroke = new Instance("UIStroke");
	panelStroke.Color = Color3.fromRGB(255, 80, 80);
	panelStroke.Thickness = 3;
	panelStroke.Parent = panel;
	
	// Panel title
	const panelTitle = new Instance("TextLabel");
	panelTitle.Size = new UDim2(1, 0, 0, 45);
	panelTitle.BackgroundColor3 = Color3.fromRGB(200, 50, 50);
	panelTitle.Text = `🔥 ${offer.name} 🔥`;
	panelTitle.TextColor3 = new Color3(1, 1, 1);
	panelTitle.TextSize = 20;
	panelTitle.Font = Enum.Font.GothamBold;
	panelTitle.Parent = panel;
	
	const titleCorner = new Instance("UICorner");
	titleCorner.CornerRadius = new UDim(0, 16);
	titleCorner.Parent = panelTitle;
	
	// Discount badge
	const discountBadge = new Instance("TextLabel");
	discountBadge.Size = new UDim2(0, 80, 0, 30);
	discountBadge.Position = new UDim2(0.5, -40, 0, 55);
	discountBadge.BackgroundColor3 = Color3.fromRGB(255, 200, 50);
	discountBadge.Text = `${offer.discount}% OFF`;
	discountBadge.TextColor3 = Color3.fromRGB(50, 50, 50);
	discountBadge.TextSize = 16;
	discountBadge.Font = Enum.Font.GothamBold;
	discountBadge.Parent = panel;
	
	const discountCorner = new Instance("UICorner");
	discountCorner.CornerRadius = new UDim(0, 8);
	discountCorner.Parent = discountBadge;
	
	// Rewards list
	const rewards = new Instance("TextLabel");
	rewards.Size = new UDim2(1, -20, 0, 90);
	rewards.Position = new UDim2(0, 10, 0, 95);
	rewards.BackgroundTransparency = 1;
	rewards.Text = offer.rewards.map(r => `✓ ${r}`).join("\n");
	rewards.TextColor3 = Color3.fromRGB(200, 255, 200);
	rewards.TextSize = 14;
	rewards.Font = Enum.Font.Gotham;
	rewards.TextXAlignment = Enum.TextXAlignment.Left;
	rewards.TextYAlignment = Enum.TextYAlignment.Top;
	rewards.Parent = panel;
	
	// Price display
	const priceFrame = new Instance("Frame");
	priceFrame.Size = new UDim2(1, -20, 0, 35);
	priceFrame.Position = new UDim2(0, 10, 0, 195);
	priceFrame.BackgroundTransparency = 1;
	priceFrame.Parent = panel;
	
	const oldPrice = new Instance("TextLabel");
	oldPrice.Size = new UDim2(0.5, 0, 1, 0);
	oldPrice.BackgroundTransparency = 1;
	oldPrice.Text = `💎 ${offer.originalPrice}`;
	oldPrice.TextColor3 = Color3.fromRGB(150, 150, 150);
	oldPrice.TextSize = 16;
	oldPrice.Font = Enum.Font.Gotham;
	oldPrice.RichText = true;
	oldPrice.Parent = priceFrame;
	
	const newPrice = new Instance("TextLabel");
	newPrice.Size = new UDim2(0.5, 0, 1, 0);
	newPrice.Position = new UDim2(0.5, 0, 0, 0);
	newPrice.BackgroundTransparency = 1;
	newPrice.Text = `💎 ${offer.salePrice}`;
	newPrice.TextColor3 = Color3.fromRGB(100, 255, 100);
	newPrice.TextSize = 20;
	newPrice.Font = Enum.Font.GothamBold;
	newPrice.Parent = priceFrame;
	
	// Buy button
	const buyBtn = new Instance("TextButton");
	buyBtn.Size = new UDim2(1, -40, 0, 40);
	buyBtn.Position = new UDim2(0, 20, 1, -55);
	buyBtn.BackgroundColor3 = Color3.fromRGB(80, 200, 80);
	buyBtn.Text = "BUY NOW!";
	buyBtn.TextColor3 = new Color3(1, 1, 1);
	buyBtn.TextSize = 18;
	buyBtn.Font = Enum.Font.GothamBold;
	buyBtn.Parent = panel;
	
	const buyCorner = new Instance("UICorner");
	buyCorner.CornerRadius = new UDim(0, 10);
	buyCorner.Parent = buyBtn;
	
	buyBtn.MouseButton1Click.Connect(() => {
		print("🛒 Player wants to buy limited offer!");
	});
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 25, 0, 25);
	closeBtn.Position = new UDim2(1, -30, 0, 5);
	closeBtn.BackgroundTransparency = 1;
	closeBtn.Text = "X";
	closeBtn.TextColor3 = new Color3(1, 1, 1);
	closeBtn.TextSize = 16;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = panel;
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	// Toggle panel on button click
	offerBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
	});
	
	// Update timer
	task.spawn(() => {
		let remaining = offer.endsIn;
		while (remaining > 0) {
			const hours = math.floor(remaining / 3600);
			const mins = math.floor((remaining % 3600) / 60);
			const secs = remaining % 60;
			timer.Text = `${string.format("%02d", hours)}:${string.format("%02d", mins)}:${string.format("%02d", secs)}`;
			task.wait(1);
			remaining -= 1;
		}
		timer.Text = "EXPIRED";
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🔥 Limited Offers UI ready!");
}
