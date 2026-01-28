// Pet Evolution UI - Show XP, tier, and evolve button
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

const TIER_COLORS: { [key: string]: Color3 } = {
	Normal: Color3.fromRGB(180, 180, 180),
	Mega: Color3.fromRGB(100, 200, 255),
	Ultra: Color3.fromRGB(255, 150, 255),
	Cosmic: Color3.fromRGB(255, 200, 50),
};

export function createEvolutionUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "EvolutionUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 89;
	
	// Evolution button (next to pet button area)
	const evoBtn = new Instance("TextButton");
	evoBtn.Name = "EvoBtn";
	evoBtn.Size = new UDim2(0, 50, 0, 50);
	evoBtn.Position = new UDim2(0, 120, 1, -105);
	evoBtn.BackgroundColor3 = Color3.fromRGB(100, 200, 255);
	evoBtn.Text = "⬆️";
	evoBtn.TextSize = 28;
	evoBtn.Font = Enum.Font.GothamBold;
	evoBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 12);
	btnCorner.Parent = evoBtn;
	
	// Evolution panel
	const panel = new Instance("Frame");
	panel.Name = "EvoPanel";
	panel.Size = new UDim2(0, 280, 0, 250);
	panel.Position = new UDim2(0.5, -140, 0.5, -125);
	panel.BackgroundColor3 = Color3.fromRGB(30, 40, 50);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 40);
	title.BackgroundTransparency = 1;
	title.Text = "⬆️ PET EVOLUTION ⬆️";
	title.TextColor3 = Color3.fromRGB(100, 200, 255);
	title.TextSize = 20;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Current tier label
	const tierLabel = new Instance("TextLabel");
	tierLabel.Name = "TierLabel";
	tierLabel.Size = new UDim2(1, 0, 0, 30);
	tierLabel.Position = new UDim2(0, 0, 0, 45);
	tierLabel.BackgroundTransparency = 1;
	tierLabel.Text = "Tier: Normal";
	tierLabel.TextSize = 18;
	tierLabel.Font = Enum.Font.GothamBold;
	tierLabel.Parent = panel;
	
	// XP progress
	const xpLabel = new Instance("TextLabel");
	xpLabel.Name = "XPLabel";
	xpLabel.Size = new UDim2(1, 0, 0, 25);
	xpLabel.Position = new UDim2(0, 0, 0, 75);
	xpLabel.BackgroundTransparency = 1;
	xpLabel.Text = "XP: 0 / 100";
	xpLabel.TextColor3 = Color3.fromRGB(200, 200, 200);
	xpLabel.TextSize = 16;
	xpLabel.Font = Enum.Font.Gotham;
	xpLabel.Parent = panel;
	
	// XP bar background
	const xpBarBg = new Instance("Frame");
	xpBarBg.Size = new UDim2(0.8, 0, 0, 20);
	xpBarBg.Position = new UDim2(0.1, 0, 0, 105);
	xpBarBg.BackgroundColor3 = Color3.fromRGB(50, 50, 60);
	xpBarBg.Parent = panel;
	
	const barBgCorner = new Instance("UICorner");
	barBgCorner.CornerRadius = new UDim(0, 6);
	barBgCorner.Parent = xpBarBg;
	
	// XP bar fill
	const xpBarFill = new Instance("Frame");
	xpBarFill.Name = "XPFill";
	xpBarFill.Size = new UDim2(0, 0, 1, 0);
	xpBarFill.BackgroundColor3 = Color3.fromRGB(100, 200, 255);
	xpBarFill.Parent = xpBarBg;
	
	const barFillCorner = new Instance("UICorner");
	barFillCorner.CornerRadius = new UDim(0, 6);
	barFillCorner.Parent = xpBarFill;
	
	// Multiplier label
	const multLabel = new Instance("TextLabel");
	multLabel.Name = "MultLabel";
	multLabel.Size = new UDim2(1, 0, 0, 25);
	multLabel.Position = new UDim2(0, 0, 0, 130);
	multLabel.BackgroundTransparency = 1;
	multLabel.Text = "Coin Bonus: x1.0";
	multLabel.TextColor3 = Color3.fromRGB(255, 215, 0);
	multLabel.TextSize = 16;
	multLabel.Font = Enum.Font.GothamBold;
	multLabel.Parent = panel;
	
	// Evolve button
	const evolveBtn = new Instance("TextButton");
	evolveBtn.Name = "EvolveBtn";
	evolveBtn.Size = new UDim2(0, 160, 0, 40);
	evolveBtn.Position = new UDim2(0.5, -80, 0, 160);
	evolveBtn.BackgroundColor3 = Color3.fromRGB(100, 200, 100);
	evolveBtn.Text = "⬆️ EVOLVE";
	evolveBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	evolveBtn.TextSize = 16;
	evolveBtn.Font = Enum.Font.GothamBold;
	evolveBtn.Parent = panel;
	
	const evoBtnCorner = new Instance("UICorner");
	evoBtnCorner.CornerRadius = new UDim(0, 10);
	evoBtnCorner.Parent = evolveBtn;
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 80, 0, 28);
	closeBtn.Position = new UDim2(0.5, -40, 1, -35);
	closeBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 100);
	closeBtn.Text = "CLOSE";
	closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	closeBtn.TextSize = 12;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = panel;
	
	const closeCorner = new Instance("UICorner");
	closeCorner.CornerRadius = new UDim(0, 8);
	closeCorner.Parent = closeBtn;
	
	// Refresh function
	const refresh = () => {
		const remote = ReplicatedStorage.FindFirstChild("GetPetEvolution") as RemoteFunction | undefined;
		if (!remote) return;
		
		const data = remote.InvokeServer() as { name: string; xp: number; tier: string; nextTier?: string; xpNeeded: number; multiplier: number };
		
		tierLabel.Text = `Tier: ${data.tier}`;
		tierLabel.TextColor3 = TIER_COLORS[data.tier] ?? Color3.fromRGB(255, 255, 255);
		
		if (data.xpNeeded > 0) {
			xpLabel.Text = `XP: ${data.xp} / ${data.xpNeeded}`;
			xpBarFill.Size = new UDim2(math.min(1, data.xp / data.xpNeeded), 0, 1, 0);
			evolveBtn.Visible = data.xp >= data.xpNeeded;
		} else {
			xpLabel.Text = "MAX EVOLUTION!";
			xpBarFill.Size = new UDim2(1, 0, 1, 0);
			evolveBtn.Visible = false;
		}
		
		multLabel.Text = `Coin Bonus: x${data.multiplier}`;
	};
	
	// Toggle panel
	evoBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) refresh();
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	evolveBtn.MouseButton1Click.Connect(() => {
		const remote = ReplicatedStorage.FindFirstChild("EvolvePet") as RemoteFunction | undefined;
		if (remote) {
			const result = remote.InvokeServer() as { success: boolean; message?: string };
			if (result.success) {
				refresh();
			}
		}
	});
	
	// Listen for XP updates
	const xpRemote = ReplicatedStorage.WaitForChild("PetXPGained", 1) as RemoteEvent | undefined;
	if (xpRemote) {
		xpRemote.OnClientEvent.Connect(() => {
			if (panel.Visible) refresh();
		});
	}
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("⬆️ Evolution UI ready!");
}
