// Battle Pass UI - Progress through tiers for rewards
import { Players } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createBattlePassUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "BattlePassUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 100;
	
	// Main panel (hidden by default)
	const panel = new Instance("Frame");
	panel.Name = "BattlePassPanel";
	panel.Size = new UDim2(0, 500, 0, 400);
	panel.Position = new UDim2(0.5, -250, 0.5, -200);
	panel.BackgroundColor3 = Color3.fromRGB(25, 30, 45);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	const panelStroke = new Instance("UIStroke");
	panelStroke.Color = Color3.fromRGB(255, 180, 50);
	panelStroke.Thickness = 3;
	panelStroke.Parent = panel;
	
	// Header
	const header = new Instance("Frame");
	header.Name = "Header";
	header.Size = new UDim2(1, 0, 0, 60);
	header.BackgroundColor3 = Color3.fromRGB(255, 140, 0);
	header.Parent = panel;
	
	const headerCorner = new Instance("UICorner");
	headerCorner.CornerRadius = new UDim(0, 16);
	headerCorner.Parent = header;
	
	// Fix bottom corners of header
	const headerFix = new Instance("Frame");
	headerFix.Size = new UDim2(1, 0, 0, 20);
	headerFix.Position = new UDim2(0, 0, 1, -20);
	headerFix.BackgroundColor3 = Color3.fromRGB(255, 140, 0);
	headerFix.BorderSizePixel = 0;
	headerFix.Parent = header;
	
	const title = new Instance("TextLabel");
	title.Name = "Title";
	title.Size = new UDim2(1, 0, 1, 0);
	title.BackgroundTransparency = 1;
	title.Text = "⭐ BATTLE PASS - Season 1 ⭐";
	title.TextColor3 = new Color3(1, 1, 1);
	title.TextSize = 24;
	title.Font = Enum.Font.GothamBold;
	title.Parent = header;
	
	// Progress bar
	const progressBg = new Instance("Frame");
	progressBg.Name = "ProgressBg";
	progressBg.Size = new UDim2(1, -40, 0, 25);
	progressBg.Position = new UDim2(0, 20, 0, 70);
	progressBg.BackgroundColor3 = Color3.fromRGB(40, 45, 60);
	progressBg.Parent = panel;
	
	const progressCorner = new Instance("UICorner");
	progressCorner.CornerRadius = new UDim(0, 8);
	progressCorner.Parent = progressBg;
	
	const progressFill = new Instance("Frame");
	progressFill.Name = "ProgressFill";
	progressFill.Size = new UDim2(0.3, 0, 1, 0);
	progressFill.BackgroundColor3 = Color3.fromRGB(100, 200, 100);
	progressFill.Parent = progressBg;
	
	const progressFillCorner = new Instance("UICorner");
	progressFillCorner.CornerRadius = new UDim(0, 8);
	progressFillCorner.Parent = progressFill;
	
	const progressLabel = new Instance("TextLabel");
	progressLabel.Name = "ProgressLabel";
	progressLabel.Size = new UDim2(1, 0, 1, 0);
	progressLabel.BackgroundTransparency = 1;
	progressLabel.Text = "Level 5 | 150/500 XP";
	progressLabel.TextColor3 = new Color3(1, 1, 1);
	progressLabel.TextSize = 14;
	progressLabel.Font = Enum.Font.GothamBold;
	progressLabel.Parent = progressBg;
	
	// Tier scroll
	const tierScroll = new Instance("ScrollingFrame");
	tierScroll.Name = "TierScroll";
	tierScroll.Size = new UDim2(1, -20, 1, -120);
	tierScroll.Position = new UDim2(0, 10, 0, 105);
	tierScroll.BackgroundTransparency = 1;
	tierScroll.ScrollBarThickness = 6;
	tierScroll.CanvasSize = new UDim2(5, 0, 0, 0);
	tierScroll.ScrollingDirection = Enum.ScrollingDirection.X;
	tierScroll.Parent = panel;
	
	const tierLayout = new Instance("UIListLayout");
	tierLayout.FillDirection = Enum.FillDirection.Horizontal;
	tierLayout.Padding = new UDim(0, 10);
	tierLayout.Parent = tierScroll;
	
	// Create tier cards
	for (let i = 1; i <= 50; i++) {
		createTierCard(tierScroll, i, i <= 5);
	}
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Name = "CloseBtn";
	closeBtn.Size = new UDim2(0, 30, 0, 30);
	closeBtn.Position = new UDim2(1, -35, 0, 5);
	closeBtn.BackgroundTransparency = 1;
	closeBtn.Text = "X";
	closeBtn.TextColor3 = new Color3(1, 1, 1);
	closeBtn.TextSize = 20;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = panel;
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("⭐ Battle Pass UI ready!");
	
	return { panel, progressFill, progressLabel, tierScroll };
}

function createTierCard(parent: ScrollingFrame, tier: number, unlocked: boolean) {
	const card = new Instance("Frame");
	card.Name = `Tier${tier}`;
	card.Size = new UDim2(0, 90, 0, 260);
	card.BackgroundColor3 = unlocked 
		? Color3.fromRGB(50, 70, 60) 
		: Color3.fromRGB(40, 45, 55);
	card.Parent = parent;
	
	const cardCorner = new Instance("UICorner");
	cardCorner.CornerRadius = new UDim(0, 10);
	cardCorner.Parent = card;
	
	if (unlocked) {
		const cardStroke = new Instance("UIStroke");
		cardStroke.Color = Color3.fromRGB(100, 200, 100);
		cardStroke.Thickness = 2;
		cardStroke.Parent = card;
	}
	
	// Tier number
	const tierLabel = new Instance("TextLabel");
	tierLabel.Size = new UDim2(1, 0, 0, 25);
	tierLabel.BackgroundTransparency = 1;
	tierLabel.Text = `Tier ${tier}`;
	tierLabel.TextColor3 = Color3.fromRGB(200, 200, 200);
	tierLabel.TextSize = 12;
	tierLabel.Font = Enum.Font.GothamBold;
	tierLabel.Parent = card;
	
	// Free reward box
	const freeBox = new Instance("Frame");
	freeBox.Name = "FreeReward";
	freeBox.Size = new UDim2(0, 70, 0, 70);
	freeBox.Position = new UDim2(0.5, -35, 0, 30);
	freeBox.BackgroundColor3 = Color3.fromRGB(60, 80, 100);
	freeBox.Parent = card;
	
	const freeCorner = new Instance("UICorner");
	freeCorner.CornerRadius = new UDim(0, 8);
	freeCorner.Parent = freeBox;
	
	const freeIcon = new Instance("TextLabel");
	freeIcon.Size = new UDim2(1, 0, 1, 0);
	freeIcon.BackgroundTransparency = 1;
	freeIcon.Text = tier % 5 === 0 ? "💎" : "🪙";
	freeIcon.TextSize = 30;
	freeIcon.Parent = freeBox;
	
	const freeLabel = new Instance("TextLabel");
	freeLabel.Size = new UDim2(1, 0, 0, 15);
	freeLabel.Position = new UDim2(0, 0, 1, 5);
	freeLabel.BackgroundTransparency = 1;
	freeLabel.Text = "FREE";
	freeLabel.TextColor3 = Color3.fromRGB(150, 150, 150);
	freeLabel.TextSize = 10;
	freeLabel.Font = Enum.Font.GothamBold;
	freeLabel.Parent = freeBox;
	
	// Premium reward box
	const premBox = new Instance("Frame");
	premBox.Name = "PremiumReward";
	premBox.Size = new UDim2(0, 70, 0, 70);
	premBox.Position = new UDim2(0.5, -35, 0, 130);
	premBox.BackgroundColor3 = Color3.fromRGB(100, 80, 40);
	premBox.Parent = card;
	
	const premCorner = new Instance("UICorner");
	premCorner.CornerRadius = new UDim(0, 8);
	premCorner.Parent = premBox;
	
	const premIcon = new Instance("TextLabel");
	premIcon.Size = new UDim2(1, 0, 1, 0);
	premIcon.BackgroundTransparency = 1;
	premIcon.Text = tier % 10 === 0 ? "🐾" : "✨";
	premIcon.TextSize = 30;
	premIcon.Parent = premBox;
	
	const premLabel = new Instance("TextLabel");
	premLabel.Size = new UDim2(1, 0, 0, 15);
	premLabel.Position = new UDim2(0, 0, 1, 5);
	premLabel.BackgroundTransparency = 1;
	premLabel.Text = "⭐ PREMIUM";
	premLabel.TextColor3 = Color3.fromRGB(255, 180, 50);
	premLabel.TextSize = 10;
	premLabel.Font = Enum.Font.GothamBold;
	premLabel.Parent = premBox;
	
	// Claim button (only if unlocked)
	if (unlocked) {
		const claimBtn = new Instance("TextButton");
		claimBtn.Size = new UDim2(0, 70, 0, 25);
		claimBtn.Position = new UDim2(0.5, -35, 1, -30);
		claimBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
		claimBtn.Text = "CLAIM";
		claimBtn.TextColor3 = new Color3(1, 1, 1);
		claimBtn.TextSize = 12;
		claimBtn.Font = Enum.Font.GothamBold;
		claimBtn.Parent = card;
		
		const claimCorner = new Instance("UICorner");
		claimCorner.CornerRadius = new UDim(0, 6);
		claimCorner.Parent = claimBtn;
	}
}

// Toggle function for action bar
export function toggleBattlePass() {
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	const panel = playerGui.FindFirstChild("BattlePassUI")?.FindFirstChild("BattlePassPanel") as Frame | undefined;
	if (panel) {
		panel.Visible = !panel.Visible;
	}
}
