// Quests UI - Show daily quests with progress
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createQuestUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "QuestUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 86;
	
	// Quest button (left side)
	const questBtn = new Instance("TextButton");
	questBtn.Name = "QuestBtn";
	questBtn.Size = new UDim2(0, 100, 0, 40);
	questBtn.Position = new UDim2(0, 10, 0.5, -20);
	questBtn.BackgroundColor3 = Color3.fromRGB(100, 180, 100);
	questBtn.Text = "📋 QUESTS";
	questBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	questBtn.TextSize = 14;
	questBtn.Font = Enum.Font.GothamBold;
	questBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = questBtn;
	
	// Quest panel
	const panel = new Instance("Frame");
	panel.Name = "QuestPanel";
	panel.Size = new UDim2(0, 320, 0, 280);
	panel.Position = new UDim2(0.5, -160, 0.5, -140);
	panel.BackgroundColor3 = Color3.fromRGB(35, 45, 35);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Name = "Title";
	title.Size = new UDim2(1, 0, 0, 45);
	title.BackgroundTransparency = 1;
	title.Text = "📋 DAILY QUESTS 📋";
	title.TextColor3 = Color3.fromRGB(100, 255, 100);
	title.TextSize = 20;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Quest list container
	const questList = new Instance("Frame");
	questList.Name = "QuestList";
	questList.Size = new UDim2(1, -20, 0, 180);
	questList.Position = new UDim2(0, 10, 0, 50);
	questList.BackgroundTransparency = 1;
	questList.Parent = panel;
	
	const listLayout = new Instance("UIListLayout");
	listLayout.SortOrder = Enum.SortOrder.LayoutOrder;
	listLayout.Padding = new UDim(0, 8);
	listLayout.Parent = questList;
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 80, 0, 30);
	closeBtn.Position = new UDim2(0.5, -40, 1, -40);
	closeBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 100);
	closeBtn.Text = "CLOSE";
	closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	closeBtn.TextSize = 14;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = panel;
	
	const closeCorner = new Instance("UICorner");
	closeCorner.CornerRadius = new UDim(0, 8);
	closeCorner.Parent = closeBtn;
	
	// Toggle panel
	questBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) {
			refreshQuests(questList);
		}
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	// Listen for progress updates
	const progressRemote = ReplicatedStorage.WaitForChild("QuestProgress", 10) as RemoteEvent | undefined;
	if (progressRemote) {
		progressRemote.OnClientEvent.Connect(() => {
			if (panel.Visible) {
				refreshQuests(questList);
			}
		});
	}
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("📋 Quest UI ready!");
}

function refreshQuests(container: Frame) {
	// Clear existing
	for (const child of container.GetChildren()) {
		if (child.IsA("Frame")) {
			child.Destroy();
		}
	}
	
	// Get quests from server
	const getQuestsRemote = ReplicatedStorage.FindFirstChild("GetQuests") as RemoteFunction | undefined;
	if (!getQuestsRemote) return;
	
	const quests = getQuestsRemote.InvokeServer() as { quest: { id: string; name: string; description: string; target: number; reward: number }; progress: number; completed: boolean }[];
	
	for (let i = 0; i < quests.size(); i++) {
		const q = quests[i];
		createQuestRow(container, q, i);
	}
}

function createQuestRow(parent: Frame, data: { quest: { id: string; name: string; description: string; target: number; reward: number }; progress: number; completed: boolean }, index: number) {
	const row = new Instance("Frame");
	row.Name = data.quest.id;
	row.Size = new UDim2(1, 0, 0, 52);
	row.BackgroundColor3 = data.completed ? Color3.fromRGB(50, 80, 50) : Color3.fromRGB(45, 55, 45);
	row.LayoutOrder = index;
	row.Parent = parent;
	
	const rowCorner = new Instance("UICorner");
	rowCorner.CornerRadius = new UDim(0, 8);
	rowCorner.Parent = row;
	
	// Quest name
	const nameLabel = new Instance("TextLabel");
	nameLabel.Size = new UDim2(0.6, 0, 0, 22);
	nameLabel.Position = new UDim2(0, 8, 0, 4);
	nameLabel.BackgroundTransparency = 1;
	nameLabel.Text = data.quest.name;
	nameLabel.TextColor3 = data.completed ? Color3.fromRGB(100, 255, 100) : Color3.fromRGB(255, 255, 255);
	nameLabel.TextSize = 14;
	nameLabel.Font = Enum.Font.GothamBold;
	nameLabel.TextXAlignment = Enum.TextXAlignment.Left;
	nameLabel.Parent = row;
	
	// Progress
	const progressLabel = new Instance("TextLabel");
	progressLabel.Size = new UDim2(0.4, -50, 0, 20);
	progressLabel.Position = new UDim2(0, 8, 0, 28);
	progressLabel.BackgroundTransparency = 1;
	progressLabel.Text = `${data.progress}/${data.quest.target}`;
	progressLabel.TextColor3 = Color3.fromRGB(180, 180, 180);
	progressLabel.TextSize = 12;
	progressLabel.Font = Enum.Font.Gotham;
	progressLabel.TextXAlignment = Enum.TextXAlignment.Left;
	progressLabel.Parent = row;
	
	// Reward
	const rewardLabel = new Instance("TextLabel");
	rewardLabel.Size = new UDim2(0, 80, 0, 22);
	rewardLabel.Position = new UDim2(1, -130, 0, 4);
	rewardLabel.BackgroundTransparency = 1;
	rewardLabel.Text = `🪙 ${data.quest.reward}`;
	rewardLabel.TextColor3 = Color3.fromRGB(255, 215, 0);
	rewardLabel.TextSize = 14;
	rewardLabel.Font = Enum.Font.GothamBold;
	rewardLabel.Parent = row;
	
	// Claim button
	if (data.progress >= data.quest.target && !data.completed) {
		const claimBtn = new Instance("TextButton");
		claimBtn.Size = new UDim2(0, 50, 0, 24);
		claimBtn.Position = new UDim2(1, -58, 0.5, -12);
		claimBtn.BackgroundColor3 = Color3.fromRGB(80, 200, 80);
		claimBtn.Text = "CLAIM";
		claimBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
		claimBtn.TextSize = 11;
		claimBtn.Font = Enum.Font.GothamBold;
		claimBtn.Parent = row;
		
		const claimCorner = new Instance("UICorner");
		claimCorner.CornerRadius = new UDim(0, 6);
		claimCorner.Parent = claimBtn;
		
		claimBtn.MouseButton1Click.Connect(() => {
			const claimRemote = ReplicatedStorage.FindFirstChild("ClaimQuest") as RemoteFunction | undefined;
			if (claimRemote) {
				claimRemote.InvokeServer(data.quest.id);
				refreshQuests(parent);
			}
		});
	} else if (data.completed) {
		const doneLabel = new Instance("TextLabel");
		doneLabel.Size = new UDim2(0, 50, 0, 24);
		doneLabel.Position = new UDim2(1, -58, 0.5, -12);
		doneLabel.BackgroundTransparency = 1;
		doneLabel.Text = "✅";
		doneLabel.TextSize = 20;
		doneLabel.Parent = row;
	}
}
