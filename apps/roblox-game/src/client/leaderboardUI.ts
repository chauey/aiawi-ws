// Leaderboard UI - Show top players
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createLeaderboardUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "LeaderboardUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 80;
	
	// Leaderboard button (trophy icon) - right side, below premium
	const openBtn = new Instance("TextButton");
	openBtn.Name = "LeaderboardBtn";
	openBtn.Size = new UDim2(0, 50, 0, 50);
	openBtn.Position = new UDim2(1, -60, 0, 100);
	openBtn.BackgroundColor3 = Color3.fromRGB(255, 200, 50);
	openBtn.Text = "🏆";
	openBtn.TextSize = 28;
	openBtn.Font = Enum.Font.GothamBold;
	openBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 12);
	btnCorner.Parent = openBtn;
	
	// Leaderboard panel (hidden by default)
	const panel = new Instance("Frame");
	panel.Name = "LeaderboardPanel";
	panel.Size = new UDim2(0, 280, 0, 350);
	panel.Position = new UDim2(0.5, -140, 0.5, -175);
	panel.BackgroundColor3 = Color3.fromRGB(30, 30, 40);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Name = "Title";
	title.Size = new UDim2(1, 0, 0, 50);
	title.BackgroundTransparency = 1;
	title.Text = "🏆 TOP PLAYERS 🏆";
	title.TextColor3 = Color3.fromRGB(255, 215, 0);
	title.TextSize = 22;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Player list container
	const listContainer = new Instance("Frame");
	listContainer.Name = "ListContainer";
	listContainer.Size = new UDim2(1, -20, 1, -100);
	listContainer.Position = new UDim2(0, 10, 0, 55);
	listContainer.BackgroundTransparency = 1;
	listContainer.Parent = panel;
	
	const listLayout = new Instance("UIListLayout");
	listLayout.SortOrder = Enum.SortOrder.LayoutOrder;
	listLayout.Padding = new UDim(0, 5);
	listLayout.Parent = listContainer;
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Name = "CloseBtn";
	closeBtn.Size = new UDim2(0, 100, 0, 35);
	closeBtn.Position = new UDim2(0.5, -50, 1, -45);
	closeBtn.BackgroundColor3 = Color3.fromRGB(200, 60, 60);
	closeBtn.Text = "CLOSE";
	closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	closeBtn.TextSize = 16;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = panel;
	
	const closeBtnCorner = new Instance("UICorner");
	closeBtnCorner.CornerRadius = new UDim(0, 8);
	closeBtnCorner.Parent = closeBtn;
	
	// Toggle panel visibility
	openBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) {
			refreshLeaderboard(listContainer);
		}
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🏆 Leaderboard UI ready!");
}

function refreshLeaderboard(container: Frame) {
	// Clear existing entries
	for (const child of container.GetChildren()) {
		if (child.IsA("Frame")) {
			child.Destroy();
		}
	}
	
	// Get leaderboard from server
	const getLeaderboardRemote = ReplicatedStorage.WaitForChild("GetLeaderboard", 1) as RemoteFunction | undefined;
	if (!getLeaderboardRemote) {
		print("❌ Leaderboard remote not found");
		return;
	}
	
	const leaderboard = getLeaderboardRemote.InvokeServer() as { name: string; coins: number }[];
	
	if (!leaderboard || leaderboard.size() === 0) {
		// Show "No data" message
		const noData = new Instance("TextLabel");
		noData.Name = "NoData";
		noData.Size = new UDim2(1, 0, 0, 40);
		noData.BackgroundTransparency = 1;
		noData.Text = "No scores yet!";
		noData.TextColor3 = Color3.fromRGB(150, 150, 150);
		noData.TextSize = 16;
		noData.Font = Enum.Font.Gotham;
		noData.Parent = container;
		return;
	}
	
	// Create entry for each player
	for (let i = 0; i < leaderboard.size(); i++) {
		const entry = leaderboard[i];
		const rank = i + 1;
		
		const row = new Instance("Frame");
		row.Name = `Rank${rank}`;
		row.Size = new UDim2(1, 0, 0, 28);
		row.BackgroundColor3 = rank <= 3 
			? Color3.fromRGB(50, 50, 70) 
			: Color3.fromRGB(40, 40, 55);
		row.LayoutOrder = rank;
		row.Parent = container;
		
		const rowCorner = new Instance("UICorner");
		rowCorner.CornerRadius = new UDim(0, 6);
		rowCorner.Parent = row;
		
		// Rank number with medal for top 3
		const rankLabel = new Instance("TextLabel");
		rankLabel.Name = "Rank";
		rankLabel.Size = new UDim2(0, 35, 1, 0);
		rankLabel.BackgroundTransparency = 1;
		const medals = ["🥇", "🥈", "🥉"];
		rankLabel.Text = rank <= 3 ? medals[rank - 1] : `#${rank}`;
		rankLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
		rankLabel.TextSize = rank <= 3 ? 20 : 14;
		rankLabel.Font = Enum.Font.GothamBold;
		rankLabel.Parent = row;
		
		// Player name
		const nameLabel = new Instance("TextLabel");
		nameLabel.Name = "PlayerName";
		nameLabel.Size = new UDim2(0.5, -40, 1, 0);
		nameLabel.Position = new UDim2(0, 40, 0, 0);
		nameLabel.BackgroundTransparency = 1;
		nameLabel.Text = entry.name;
		nameLabel.TextColor3 = entry.name === player.Name 
			? Color3.fromRGB(100, 255, 100) 
			: Color3.fromRGB(255, 255, 255);
		nameLabel.TextSize = 14;
		nameLabel.Font = Enum.Font.GothamBold;
		nameLabel.TextXAlignment = Enum.TextXAlignment.Left;
		nameLabel.Parent = row;
		
		// Coin count
		const coinLabel = new Instance("TextLabel");
		coinLabel.Name = "Coins";
		coinLabel.Size = new UDim2(0.4, 0, 1, 0);
		coinLabel.Position = new UDim2(0.6, 0, 0, 0);
		coinLabel.BackgroundTransparency = 1;
		coinLabel.Text = `🪙 ${entry.coins}`;
		coinLabel.TextColor3 = Color3.fromRGB(255, 215, 0);
		coinLabel.TextSize = 14;
		coinLabel.Font = Enum.Font.GothamBold;
		coinLabel.TextXAlignment = Enum.TextXAlignment.Right;
		coinLabel.Parent = row;
	}
}
