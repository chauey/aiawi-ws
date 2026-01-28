// Minigames UI - Quick fun activities
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createMinigamesUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "MinigamesUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 100;
	
	// Minigames button
	const gamesBtn = new Instance("TextButton");
	gamesBtn.Name = "MinigamesBtn";
	gamesBtn.Size = new UDim2(0, 50, 0, 50);
	gamesBtn.Position = new UDim2(0, 340, 1, -105);
	gamesBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 150);
	gamesBtn.Text = "🎮";
	gamesBtn.TextSize = 28;
	gamesBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 12);
	btnCorner.Parent = gamesBtn;
	
	// Panel
	const panel = new Instance("Frame");
	panel.Name = "MinigamesPanel";
	panel.Size = new UDim2(0, 280, 0, 300);
	panel.Position = new UDim2(0.5, -140, 0.5, -150);
	panel.BackgroundColor3 = Color3.fromRGB(25, 40, 35);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 40);
	title.BackgroundTransparency = 1;
	title.Text = "🎮 MINIGAMES 🎮";
	title.TextColor3 = Color3.fromRGB(100, 220, 180);
	title.TextSize = 20;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Games list
	const list = new Instance("ScrollingFrame");
	list.Name = "GamesList";
	list.Size = new UDim2(1, -20, 0, 200);
	list.Position = new UDim2(0, 10, 0, 45);
	list.BackgroundColor3 = Color3.fromRGB(35, 50, 45);
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
	
	// Game popup
	const gamePopup = new Instance("Frame");
	gamePopup.Name = "GamePopup";
	gamePopup.Size = new UDim2(0, 260, 0, 180);
	gamePopup.Position = new UDim2(0.5, -130, 0.4, 0);
	gamePopup.BackgroundColor3 = Color3.fromRGB(40, 55, 50);
	gamePopup.Visible = false;
	gamePopup.ZIndex = 10;
	gamePopup.Parent = screenGui;
	
	const popupCorner = new Instance("UICorner");
	popupCorner.CornerRadius = new UDim(0, 12);
	popupCorner.Parent = gamePopup;
	
	const popupTitle = new Instance("TextLabel");
	popupTitle.Name = "Title";
	popupTitle.Size = new UDim2(1, 0, 0, 35);
	popupTitle.BackgroundTransparency = 1;
	popupTitle.Text = "🎮 GAME";
	popupTitle.TextColor3 = Color3.fromRGB(100, 220, 180);
	popupTitle.TextSize = 18;
	popupTitle.Font = Enum.Font.GothamBold;
	popupTitle.ZIndex = 11;
	popupTitle.Parent = gamePopup;
	
	const popupChallenge = new Instance("TextLabel");
	popupChallenge.Name = "Challenge";
	popupChallenge.Size = new UDim2(1, 0, 0, 40);
	popupChallenge.Position = new UDim2(0, 0, 0, 35);
	popupChallenge.BackgroundTransparency = 1;
	popupChallenge.Text = "";
	popupChallenge.TextColor3 = Color3.fromRGB(220, 220, 220);
	popupChallenge.TextSize = 14;
	popupChallenge.Font = Enum.Font.Gotham;
	popupChallenge.TextWrapped = true;
	popupChallenge.ZIndex = 11;
	popupChallenge.Parent = gamePopup;
	
	const answerInput = new Instance("TextBox");
	answerInput.Size = new UDim2(0.5, 0, 0, 30);
	answerInput.Position = new UDim2(0.25, 0, 0, 85);
	answerInput.BackgroundColor3 = Color3.fromRGB(60, 75, 70);
	answerInput.PlaceholderText = "Answer...";
	answerInput.Text = "";
	answerInput.TextColor3 = Color3.fromRGB(255, 255, 255);
	answerInput.TextSize = 14;
	answerInput.Font = Enum.Font.Gotham;
	answerInput.ZIndex = 11;
	answerInput.Parent = gamePopup;
	
	const answerCorner = new Instance("UICorner");
	answerCorner.CornerRadius = new UDim(0, 8);
	answerCorner.Parent = answerInput;
	
	const submitBtn = new Instance("TextButton");
	submitBtn.Size = new UDim2(0.6, 0, 0, 35);
	submitBtn.Position = new UDim2(0.2, 0, 0, 125);
	submitBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 100);
	submitBtn.Text = "SUBMIT";
	submitBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	submitBtn.TextSize = 14;
	submitBtn.Font = Enum.Font.GothamBold;
	submitBtn.ZIndex = 11;
	submitBtn.Parent = gamePopup;
	
	const submitCorner = new Instance("UICorner");
	submitCorner.CornerRadius = new UDim(0, 10);
	submitCorner.Parent = submitBtn;
	
	const resultLabel = new Instance("TextLabel");
	resultLabel.Name = "Result";
	resultLabel.Size = new UDim2(1, 0, 0, 25);
	resultLabel.Position = new UDim2(0, 0, 1, -30);
	resultLabel.BackgroundTransparency = 1;
	resultLabel.Text = "";
	resultLabel.TextSize = 14;
	resultLabel.Font = Enum.Font.GothamBold;
	resultLabel.ZIndex = 11;
	resultLabel.Parent = gamePopup;
	
	const refresh = () => {
		for (const child of list.GetChildren()) {
			if (child.IsA("Frame")) child.Destroy();
		}
		
		const remote = ReplicatedStorage.FindFirstChild("GetMinigames") as RemoteFunction | undefined;
		if (!remote) return;
		
		const games = remote.InvokeServer() as { id: string; name: string; emoji: string; description: string; reward: number; canPlay: boolean }[];
		
		for (let i = 0; i < games.size(); i++) {
			createGameRow(list, games[i], i);
		}
		
		list.CanvasSize = new UDim2(0, 0, 0, games.size() * 50);
	};
	
	const createGameRow = (parent: ScrollingFrame, gameData: { id: string; name: string; emoji: string; description: string; reward: number; canPlay: boolean }, idx: number) => {
		const row = new Instance("Frame");
		row.Size = new UDim2(1, -10, 0, 45);
		row.BackgroundColor3 = Color3.fromRGB(50, 65, 60);
		row.LayoutOrder = idx;
		row.Parent = parent;
		
		const rowCorner = new Instance("UICorner");
		rowCorner.CornerRadius = new UDim(0, 8);
		rowCorner.Parent = row;
		
		const emoji = new Instance("TextLabel");
		emoji.Size = new UDim2(0, 35, 1, 0);
		emoji.BackgroundTransparency = 1;
		emoji.Text = gameData.emoji;
		emoji.TextSize = 22;
		emoji.Parent = row;
		
		const name = new Instance("TextLabel");
		name.Size = new UDim2(0, 100, 0, 20);
		name.Position = new UDim2(0, 40, 0, 3);
		name.BackgroundTransparency = 1;
		name.Text = gameData.name;
		name.TextColor3 = Color3.fromRGB(255, 255, 255);
		name.TextSize = 12;
		name.Font = Enum.Font.GothamBold;
		name.TextXAlignment = Enum.TextXAlignment.Left;
		name.Parent = row;
		
		const reward = new Instance("TextLabel");
		reward.Size = new UDim2(0, 60, 0, 20);
		reward.Position = new UDim2(0, 40, 0, 22);
		reward.BackgroundTransparency = 1;
		reward.Text = `🪙${gameData.reward}`;
		reward.TextColor3 = Color3.fromRGB(255, 215, 0);
		reward.TextSize = 11;
		reward.Font = Enum.Font.Gotham;
		reward.TextXAlignment = Enum.TextXAlignment.Left;
		reward.Parent = row;
		
		if (gameData.canPlay) {
			const playBtn = new Instance("TextButton");
			playBtn.Size = new UDim2(0, 50, 0, 28);
			playBtn.Position = new UDim2(1, -58, 0.5, -14);
			playBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 100);
			playBtn.Text = "PLAY";
			playBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
			playBtn.TextSize = 11;
			playBtn.Font = Enum.Font.GothamBold;
			playBtn.Parent = row;
			
			const playCorner = new Instance("UICorner");
			playCorner.CornerRadius = new UDim(0, 6);
			playCorner.Parent = playBtn;
			
			playBtn.MouseButton1Click.Connect(() => {
				const playRemote = ReplicatedStorage.FindFirstChild("PlayMinigame") as RemoteFunction | undefined;
				if (!playRemote) return;
				
				const result = playRemote.InvokeServer(gameData.id) as { success: boolean; challenge?: string };
				
				if (result.success) {
					popupTitle.Text = `${gameData.emoji} ${gameData.name}`;
					popupChallenge.Text = result.challenge ?? "";
					answerInput.Text = "";
					resultLabel.Text = "";
					gamePopup.Visible = true;
					panel.Visible = false;
				}
			});
		}
	};
	
	submitBtn.MouseButton1Click.Connect(() => {
		const answer = tonumber(answerInput.Text);
		if (answer === undefined) {
			resultLabel.Text = "Enter a number!";
			resultLabel.TextColor3 = Color3.fromRGB(255, 100, 100);
			return;
		}
		
		const remote = ReplicatedStorage.FindFirstChild("SubmitMinigameAnswer") as RemoteFunction | undefined;
		if (!remote) return;
		
		const result = remote.InvokeServer(answer) as { success: boolean; won?: boolean; reward?: number; correct?: number | string };
		
		if (result.won) {
			resultLabel.Text = `🎉 YOU WON! +${result.reward} coins!`;
			resultLabel.TextColor3 = Color3.fromRGB(100, 255, 100);
		} else {
			resultLabel.Text = `❌ Wrong! Answer: ${result.correct}`;
			resultLabel.TextColor3 = Color3.fromRGB(255, 100, 100);
		}
		
		wait(2);
		gamePopup.Visible = false;
	});
	
	gamesBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) refresh();
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🎮 Minigames UI ready!");
}
