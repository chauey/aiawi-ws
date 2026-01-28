// Premium Pass UI - Show benefits and purchase option
import { Players, ReplicatedStorage, MarketplaceService } from "@rbxts/services";

const player = Players.LocalPlayer;

// Replace with actual game pass ID when published
const PREMIUM_PASS_ID = 123456789;

export function createPremiumUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "PremiumUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 97;
	
	// Premium button (top-right, prominent)
	const premBtn = new Instance("TextButton");
	premBtn.Name = "PremiumBtn";
	premBtn.Size = new UDim2(0, 110, 0, 40);
	premBtn.Position = new UDim2(1, -120, 0, 55);
	premBtn.BackgroundColor3 = Color3.fromRGB(255, 180, 50);
	premBtn.Text = "⭐ PREMIUM";
	premBtn.TextColor3 = Color3.fromRGB(0, 0, 0);
	premBtn.TextSize = 14;
	premBtn.Font = Enum.Font.GothamBold;
	premBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = premBtn;
	
	// Gradient for premium feel
	const gradient = new Instance("UIGradient");
	gradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(255, 200, 50)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(255, 150, 30)),
	]);
	gradient.Parent = premBtn;
	
	// Panel
	const panel = new Instance("Frame");
	panel.Name = "PremiumPanel";
	panel.Size = new UDim2(0, 320, 0, 350);
	panel.Position = new UDim2(0.5, -160, 0.5, -175);
	panel.BackgroundColor3 = Color3.fromRGB(30, 25, 15);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 50);
	title.BackgroundTransparency = 1;
	title.Text = "⭐ PREMIUM PASS ⭐";
	title.TextColor3 = Color3.fromRGB(255, 215, 0);
	title.TextSize = 24;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Benefits list
	const benefits = new Instance("TextLabel");
	benefits.Size = new UDim2(1, -20, 0, 160);
	benefits.Position = new UDim2(0, 10, 0, 55);
	benefits.BackgroundTransparency = 1;
	benefits.Text = "✨ 2X COIN MULTIPLIER\n\n💰 1,000 DAILY BONUS\n\n🐉 3 EXCLUSIVE PETS\n\n👑 VIP ZONE ACCESS\n\n🚫 NO ADS\n\n🥚 +3 EGG SLOTS";
	benefits.TextColor3 = Color3.fromRGB(220, 220, 220);
	benefits.TextSize = 15;
	benefits.Font = Enum.Font.Gotham;
	benefits.TextYAlignment = Enum.TextYAlignment.Top;
	benefits.Parent = panel;
	
	// Status label
	const statusLabel = new Instance("TextLabel");
	statusLabel.Name = "Status";
	statusLabel.Size = new UDim2(1, 0, 0, 25);
	statusLabel.Position = new UDim2(0, 0, 0, 220);
	statusLabel.BackgroundTransparency = 1;
	statusLabel.Text = "";
	statusLabel.TextSize = 14;
	statusLabel.Font = Enum.Font.GothamBold;
	statusLabel.Parent = panel;
	
	// Purchase button
	const purchaseBtn = new Instance("TextButton");
	purchaseBtn.Name = "PurchaseBtn";
	purchaseBtn.Size = new UDim2(0.8, 0, 0, 45);
	purchaseBtn.Position = new UDim2(0.1, 0, 0, 250);
	purchaseBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
	purchaseBtn.Text = "🛒 GET PREMIUM";
	purchaseBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	purchaseBtn.TextSize = 18;
	purchaseBtn.Font = Enum.Font.GothamBold;
	purchaseBtn.Parent = panel;
	
	const purchaseCorner = new Instance("UICorner");
	purchaseCorner.CornerRadius = new UDim(0, 12);
	purchaseCorner.Parent = purchaseBtn;
	
	// Claim daily button (for premium users)
	const claimBtn = new Instance("TextButton");
	claimBtn.Name = "ClaimBtn";
	claimBtn.Size = new UDim2(0.6, 0, 0, 35);
	claimBtn.Position = new UDim2(0.2, 0, 0, 300);
	claimBtn.BackgroundColor3 = Color3.fromRGB(150, 100, 200);
	claimBtn.Text = "💰 CLAIM DAILY";
	claimBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	claimBtn.TextSize = 14;
	claimBtn.Font = Enum.Font.GothamBold;
	claimBtn.Visible = false;
	claimBtn.Parent = panel;
	
	const claimCorner = new Instance("UICorner");
	claimCorner.CornerRadius = new UDim(0, 10);
	claimCorner.Parent = claimBtn;
	
	// Close
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 30, 0, 30);
	closeBtn.Position = new UDim2(1, -35, 0, 5);
	closeBtn.BackgroundTransparency = 1;
	closeBtn.Text = "✕";
	closeBtn.TextColor3 = Color3.fromRGB(200, 200, 200);
	closeBtn.TextSize = 20;
	closeBtn.Parent = panel;
	
	const refresh = () => {
		const checkRemote = ReplicatedStorage.FindFirstChild("CheckPremium") as RemoteFunction | undefined;
		if (!checkRemote) return;
		
		const result = checkRemote.InvokeServer() as { hasPremium: boolean };
		
		if (result.hasPremium) {
			statusLabel.Text = "✅ PREMIUM ACTIVE";
			statusLabel.TextColor3 = Color3.fromRGB(100, 255, 100);
			purchaseBtn.Visible = false;
			claimBtn.Visible = true;
		} else {
			statusLabel.Text = "";
			purchaseBtn.Visible = true;
			claimBtn.Visible = false;
		}
	};
	
	premBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) refresh();
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	purchaseBtn.MouseButton1Click.Connect(() => {
		// In production, this would prompt the game pass purchase
		// MarketplaceService.PromptGamePassPurchase(player, PREMIUM_PASS_ID);
		statusLabel.Text = "Coming soon to Roblox Store!";
		statusLabel.TextColor3 = Color3.fromRGB(255, 200, 100);
	});
	
	claimBtn.MouseButton1Click.Connect(() => {
		const claimRemote = ReplicatedStorage.FindFirstChild("ClaimPremiumDaily") as RemoteFunction | undefined;
		if (!claimRemote) return;
		
		const result = claimRemote.InvokeServer() as { success: boolean; bonus?: number; message?: string };
		
		if (result.success) {
			statusLabel.Text = `+${result.bonus} coins claimed!`;
			statusLabel.TextColor3 = Color3.fromRGB(100, 255, 100);
		} else {
			statusLabel.Text = result.message ?? "Failed!";
			statusLabel.TextColor3 = Color3.fromRGB(255, 100, 100);
		}
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("⭐ Premium UI ready!");
}
