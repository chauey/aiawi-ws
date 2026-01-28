// Achievements UI - Show badges and progress
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createAchievementsUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "AchievementsUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 95;
	
	// Achievements button
	const achieveBtn = new Instance("TextButton");
	achieveBtn.Name = "AchieveBtn";
	achieveBtn.Size = new UDim2(0, 50, 0, 50);
	achieveBtn.Position = new UDim2(0, 230, 1, -105);
	achieveBtn.BackgroundColor3 = Color3.fromRGB(255, 200, 50);
	achieveBtn.Text = "🏆";
	achieveBtn.TextSize = 28;
	achieveBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 12);
	btnCorner.Parent = achieveBtn;
	
	// Panel
	const panel = new Instance("Frame");
	panel.Name = "AchievementsPanel";
	panel.Size = new UDim2(0, 340, 0, 350);
	panel.Position = new UDim2(0.5, -170, 0.5, -175);
	panel.BackgroundColor3 = Color3.fromRGB(40, 35, 25);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 45);
	title.BackgroundTransparency = 1;
	title.Text = "🏆 ACHIEVEMENTS 🏆";
	title.TextColor3 = Color3.fromRGB(255, 215, 0);
	title.TextSize = 22;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// List
	const list = new Instance("ScrollingFrame");
	list.Name = "AchievementList";
	list.Size = new UDim2(1, -20, 0, 250);
	list.Position = new UDim2(0, 10, 0, 50);
	list.BackgroundColor3 = Color3.fromRGB(50, 45, 35);
	list.ScrollBarThickness = 6;
	list.Parent = panel;
	
	const listCorner = new Instance("UICorner");
	listCorner.CornerRadius = new UDim(0, 8);
	listCorner.Parent = list;
	
	const layout = new Instance("UIListLayout");
	layout.SortOrder = Enum.SortOrder.LayoutOrder;
	layout.Padding = new UDim(0, 5);
	layout.Parent = list;
	
	// Close
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 80, 0, 30);
	closeBtn.Position = new UDim2(0.5, -40, 1, -40);
	closeBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 100);
	closeBtn.Text = "CLOSE";
	closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	closeBtn.TextSize = 12;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = panel;
	
	const closeCorner = new Instance("UICorner");
	closeCorner.CornerRadius = new UDim(0, 8);
	closeCorner.Parent = closeBtn;
	
	// Refresh
	const refresh = () => {
		for (const child of list.GetChildren()) {
			if (child.IsA("Frame")) child.Destroy();
		}
		
		const remote = ReplicatedStorage.FindFirstChild("GetAchievements") as RemoteFunction | undefined;
		if (!remote) return;
		
		const achievements = remote.InvokeServer() as { id: string; name: string; description: string; emoji: string; progress: number; requirement: number; reward: number; unlocked: boolean; canClaim: boolean }[];
		
		for (let i = 0; i < achievements.size(); i++) {
			createAchievementRow(list, achievements[i], i, refresh);
		}
		
		list.CanvasSize = new UDim2(0, 0, 0, achievements.size() * 55);
	};
	
	achieveBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) refresh();
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	// Achievement unlock notification
	const notifyRemote = ReplicatedStorage.WaitForChild("AchievementUnlocked", 10) as RemoteEvent | undefined;
	if (notifyRemote) {
		notifyRemote.OnClientEvent.Connect((name: string, emoji: string) => {
			const popup = new Instance("TextLabel");
			popup.Size = new UDim2(0, 250, 0, 50);
			popup.Position = new UDim2(0.5, -125, 0, 60);
			popup.BackgroundColor3 = Color3.fromRGB(255, 200, 50);
			popup.Text = `${emoji} ${name} UNLOCKED!`;
			popup.TextColor3 = Color3.fromRGB(0, 0, 0);
			popup.TextSize = 18;
			popup.Font = Enum.Font.GothamBold;
			popup.Parent = screenGui;
			
			const popupCorner = new Instance("UICorner");
			popupCorner.CornerRadius = new UDim(0, 12);
			popupCorner.Parent = popup;
			
			wait(3);
			popup.Destroy();
		});
	}
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🏆 Achievements UI ready!");
}

function createAchievementRow(parent: ScrollingFrame, data: { id: string; name: string; description: string; emoji: string; progress: number; requirement: number; reward: number; unlocked: boolean; canClaim: boolean }, index: number, refreshFn: () => void) {
	const row = new Instance("Frame");
	row.Size = new UDim2(1, -10, 0, 50);
	row.BackgroundColor3 = data.unlocked ? Color3.fromRGB(60, 80, 40) : Color3.fromRGB(55, 50, 40);
	row.LayoutOrder = index;
	row.Parent = parent;
	
	const rowCorner = new Instance("UICorner");
	rowCorner.CornerRadius = new UDim(0, 8);
	rowCorner.Parent = row;
	
	// Emoji
	const emoji = new Instance("TextLabel");
	emoji.Size = new UDim2(0, 40, 1, 0);
	emoji.BackgroundTransparency = 1;
	emoji.Text = data.emoji;
	emoji.TextSize = 28;
	emoji.Parent = row;
	
	// Name + progress
	const info = new Instance("TextLabel");
	info.Size = new UDim2(0, 150, 0, 25);
	info.Position = new UDim2(0, 45, 0, 3);
	info.BackgroundTransparency = 1;
	info.Text = data.name;
	info.TextColor3 = data.unlocked ? Color3.fromRGB(100, 255, 100) : Color3.fromRGB(255, 255, 255);
	info.TextSize = 14;
	info.Font = Enum.Font.GothamBold;
	info.TextXAlignment = Enum.TextXAlignment.Left;
	info.Parent = row;
	
	const progress = new Instance("TextLabel");
	progress.Size = new UDim2(0, 150, 0, 18);
	progress.Position = new UDim2(0, 45, 0, 28);
	progress.BackgroundTransparency = 1;
	progress.Text = `${data.progress}/${data.requirement}`;
	progress.TextColor3 = Color3.fromRGB(150, 150, 150);
	progress.TextSize = 11;
	progress.Font = Enum.Font.Gotham;
	progress.TextXAlignment = Enum.TextXAlignment.Left;
	progress.Parent = row;
	
	// Reward
	const reward = new Instance("TextLabel");
	reward.Size = new UDim2(0, 50, 1, 0);
	reward.Position = new UDim2(1, -110, 0, 0);
	reward.BackgroundTransparency = 1;
	reward.Text = `🪙${data.reward}`;
	reward.TextColor3 = Color3.fromRGB(255, 215, 0);
	reward.TextSize = 12;
	reward.Font = Enum.Font.GothamBold;
	reward.Parent = row;
	
	// Claim button
	if (data.canClaim) {
		const claimBtn = new Instance("TextButton");
		claimBtn.Size = new UDim2(0, 50, 0, 28);
		claimBtn.Position = new UDim2(1, -58, 0.5, -14);
		claimBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
		claimBtn.Text = "CLAIM";
		claimBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
		claimBtn.TextSize = 10;
		claimBtn.Font = Enum.Font.GothamBold;
		claimBtn.Parent = row;
		
		const claimCorner = new Instance("UICorner");
		claimCorner.CornerRadius = new UDim(0, 6);
		claimCorner.Parent = claimBtn;
		
		claimBtn.MouseButton1Click.Connect(() => {
			const remote = ReplicatedStorage.FindFirstChild("ClaimAchievement") as RemoteFunction | undefined;
			if (remote) {
				remote.InvokeServer(data.id);
				refreshFn();
			}
		});
	} else if (data.unlocked) {
		const done = new Instance("TextLabel");
		done.Size = new UDim2(0, 40, 1, 0);
		done.Position = new UDim2(1, -50, 0, 0);
		done.BackgroundTransparency = 1;
		done.Text = "✅";
		done.TextSize = 20;
		done.Parent = row;
	}
}
