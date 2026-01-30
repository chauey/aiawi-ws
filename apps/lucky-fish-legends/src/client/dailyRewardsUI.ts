// Daily Rewards UI - Premium glassmorphism design
import { Players, ReplicatedStorage, TweenService } from "@rbxts/services";

const player = Players.LocalPlayer;

// Premium colors
const COLORS = {
	glassBg: Color3.fromRGB(20, 25, 40),
	glassStroke: Color3.fromRGB(100, 120, 180),
	goldAccent: Color3.fromRGB(255, 200, 100),
	greenBtn: Color3.fromRGB(60, 200, 120),
	greenBtnHover: Color3.fromRGB(80, 220, 140),
	claimed: Color3.fromRGB(80, 90, 110),
};

export function createDailyRewardsUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "DailyRewardsUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 50;
	
	// ========== MAIN CONTAINER - GLASS PANEL ==========
	const container = new Instance("Frame");
	container.Name = "DailyRewardContainer";
	container.Size = new UDim2(0, 180, 0, 85);
	container.Position = new UDim2(0, 15, 0, 60);
	container.BackgroundColor3 = COLORS.glassBg;
	container.BackgroundTransparency = 0.15;
	container.BorderSizePixel = 0;
	container.Parent = screenGui;
	
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 14);
	corner.Parent = container;
	
	// Glass stroke effect
	const stroke = new Instance("UIStroke");
	stroke.Color = COLORS.glassStroke;
	stroke.Transparency = 0.5;
	stroke.Thickness = 1.5;
	stroke.Parent = container;
	
	// Subtle gradient overlay
	const gradient = new Instance("UIGradient");
	gradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(60, 70, 100)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(30, 35, 55)),
	]);
	gradient.Rotation = 90;
	gradient.Parent = container;
	
	// ========== ICON ==========
	const iconBg = new Instance("Frame");
	iconBg.Size = new UDim2(0, 42, 0, 42);
	iconBg.Position = new UDim2(0, 10, 0, 10);
	iconBg.BackgroundColor3 = Color3.fromRGB(255, 150, 50);
	iconBg.Parent = container;
	
	const iconCorner = new Instance("UICorner");
	iconCorner.CornerRadius = new UDim(0, 10);
	iconCorner.Parent = iconBg;
	
	const iconGradient = new Instance("UIGradient");
	iconGradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(255, 180, 80)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(255, 120, 50)),
	]);
	iconGradient.Rotation = 135;
	iconGradient.Parent = iconBg;
	
	const icon = new Instance("TextLabel");
	icon.Size = new UDim2(1, 0, 1, 0);
	icon.BackgroundTransparency = 1;
	icon.Text = "📅";
	icon.TextSize = 22;
	icon.Parent = iconBg;
	
	// ========== TITLE ==========
	const title = new Instance("TextLabel");
	title.Name = "Title";
	title.Size = new UDim2(0, 115, 0, 18);
	title.Position = new UDim2(0, 58, 0, 10);
	title.BackgroundTransparency = 1;
	title.Text = "Daily Reward";
	title.TextColor3 = COLORS.goldAccent;
	title.TextSize = 14;
	title.Font = Enum.Font.GothamBold;
	title.TextXAlignment = Enum.TextXAlignment.Left;
	title.Parent = container;
	
	// ========== STREAK LABEL ==========
	const streakLabel = new Instance("TextLabel");
	streakLabel.Name = "StreakLabel";
	streakLabel.Size = new UDim2(0, 115, 0, 15);
	streakLabel.Position = new UDim2(0, 58, 0, 28);
	streakLabel.BackgroundTransparency = 1;
	streakLabel.Text = "🔥Day 1 Streak";
	streakLabel.TextColor3 = Color3.fromRGB(255, 150, 100);
	streakLabel.TextSize = 11;
	streakLabel.Font = Enum.Font.Gotham;
	streakLabel.TextXAlignment = Enum.TextXAlignment.Left;
	streakLabel.Parent = container;
	
	// ========== CLAIM BUTTON - PREMIUM ==========
	const claimBtn = new Instance("TextButton");
	claimBtn.Name = "ClaimButton";
	claimBtn.Size = new UDim2(0, 100, 0, 26);
	claimBtn.Position = new UDim2(0, 58, 1, -34);
	claimBtn.BackgroundColor3 = COLORS.greenBtn;
	claimBtn.Text = "🎁 Claim";
	claimBtn.TextColor3 = new Color3(1, 1, 1);
	claimBtn.TextSize = 12;
	claimBtn.Font = Enum.Font.GothamBold;
	claimBtn.AutoButtonColor = false;
	claimBtn.Parent = container;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 8);
	btnCorner.Parent = claimBtn;
	
	// Button gradient
	const btnGradient = new Instance("UIGradient");
	btnGradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(80, 220, 140)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(50, 180, 100)),
	]);
	btnGradient.Rotation = 90;
	btnGradient.Parent = claimBtn;
	
	// Hover animations
	claimBtn.MouseEnter.Connect(() => {
		if (claimBtn.Active) {
			TweenService.Create(claimBtn, new TweenInfo(0.15), { Size: new UDim2(0, 105, 0, 28) }).Play();
		}
	});
	claimBtn.MouseLeave.Connect(() => {
		TweenService.Create(claimBtn, new TweenInfo(0.15), { Size: new UDim2(0, 100, 0, 26) }).Play();
	});
	
	// Pulse animation on button
	task.spawn(() => {
		while (true) {
			if (claimBtn.Active) {
				TweenService.Create(claimBtn, new TweenInfo(0.6), { BackgroundColor3: Color3.fromRGB(90, 230, 150) }).Play();
				task.wait(0.6);
				TweenService.Create(claimBtn, new TweenInfo(0.6), { BackgroundColor3: COLORS.greenBtn }).Play();
				task.wait(0.6);
			} else {
				task.wait(1);
			}
		}
	});
	
	// Add to player GUI
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	// Handle claim click
	claimBtn.MouseButton1Click.Connect(() => {
		const claimRemote = ReplicatedStorage.FindFirstChild("ClaimDailyReward") as RemoteEvent | undefined;
		if (claimRemote) {
			claimRemote.FireServer();
		}
	});
	
	// Listen for data updates from server
	const dataRemote = ReplicatedStorage.WaitForChild("DailyRewardData", 1) as RemoteEvent | undefined;
	if (dataRemote) {
		dataRemote.OnClientEvent.Connect((streak: number, claimed: boolean, reward: number) => {
			streakLabel.Text = `🔥Day ${streak} Streak`;
			
			if (claimed) {
				claimBtn.Text = "✅ Claimed!";
				claimBtn.BackgroundColor3 = COLORS.claimed;
				claimBtn.Active = false;
				btnGradient.Color = new ColorSequence([
					new ColorSequenceKeypoint(0, Color3.fromRGB(90, 100, 120)),
					new ColorSequenceKeypoint(1, Color3.fromRGB(70, 80, 100)),
				]);
			} else {
				claimBtn.Text = `🎁 Claim`;
				claimBtn.BackgroundColor3 = COLORS.greenBtn;
				claimBtn.Active = true;
				btnGradient.Color = new ColorSequence([
					new ColorSequenceKeypoint(0, Color3.fromRGB(80, 220, 140)),
					new ColorSequenceKeypoint(1, Color3.fromRGB(50, 180, 100)),
				]);
			}
		});
	}
	
	// Request initial data after a short delay
	task.delay(1, () => {
		const getDataRemote = ReplicatedStorage.FindFirstChild("GetPlayerData") as RemoteEvent | undefined;
		if (getDataRemote) {
			getDataRemote.FireServer();
		}
	});
	
	print("📅 Daily Rewards UI created!");
}
