// Daily Rewards UI - Shows streak and claim button
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createDailyRewardsUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "DailyRewardsUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 50;
	
	// Main container (top left)
	const container = new Instance("Frame");
	container.Name = "DailyRewardContainer";
	container.Size = new UDim2(0, 200, 0, 80);
	container.Position = new UDim2(0, 15, 0, 15);
	container.BackgroundColor3 = Color3.fromRGB(40, 50, 70);
	container.BackgroundTransparency = 0.2;
	container.BorderSizePixel = 0;
	container.Parent = screenGui;
	
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 12);
	corner.Parent = container;
	
	// Gradient
	const gradient = new Instance("UIGradient");
	gradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(60, 80, 120)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(40, 50, 70)),
	]);
	gradient.Rotation = 90;
	gradient.Parent = container;
	
	// Title
	const title = new Instance("TextLabel");
	title.Name = "Title";
	title.Size = new UDim2(1, 0, 0, 25);
	title.Position = new UDim2(0, 0, 0, 5);
	title.BackgroundTransparency = 1;
	title.Text = "📅 Daily Reward";
	title.TextColor3 = new Color3(1, 0.9, 0.6);
	title.TextSize = 16;
	title.Font = Enum.Font.GothamBold;
	title.Parent = container;
	
	// Streak label
	const streakLabel = new Instance("TextLabel");
	streakLabel.Name = "StreakLabel";
	streakLabel.Size = new UDim2(1, 0, 0, 18);
	streakLabel.Position = new UDim2(0, 0, 0, 28);
	streakLabel.BackgroundTransparency = 1;
	streakLabel.Text = "🔥 Day 1 Streak";
	streakLabel.TextColor3 = new Color3(1, 1, 1);
	streakLabel.TextSize = 13;
	streakLabel.Font = Enum.Font.Gotham;
	streakLabel.Parent = container;
	
	// Claim button
	const claimBtn = new Instance("TextButton");
	claimBtn.Name = "ClaimButton";
	claimBtn.Size = new UDim2(0, 160, 0, 28);
	claimBtn.Position = new UDim2(0.5, -80, 1, -35);
	claimBtn.BackgroundColor3 = Color3.fromRGB(80, 200, 120);
	claimBtn.Text = "🎁 Claim 50 Coins!";
	claimBtn.TextColor3 = new Color3(1, 1, 1);
	claimBtn.TextSize = 14;
	claimBtn.Font = Enum.Font.GothamBold;
	claimBtn.Parent = container;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 8);
	btnCorner.Parent = claimBtn;
	
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
	const dataRemote = ReplicatedStorage.WaitForChild("DailyRewardData", 5) as RemoteEvent | undefined;
	if (dataRemote) {
		dataRemote.OnClientEvent.Connect((streak: number, claimed: boolean, reward: number) => {
			streakLabel.Text = `🔥 Day ${streak} Streak`;
			
			if (claimed) {
				claimBtn.Text = "✅ Claimed!";
				claimBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 120);
				claimBtn.Active = false;
			} else {
				claimBtn.Text = `🎁 Claim ${reward} Coins!`;
				claimBtn.BackgroundColor3 = Color3.fromRGB(80, 200, 120);
				claimBtn.Active = true;
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
