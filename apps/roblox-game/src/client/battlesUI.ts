// Pet Battles UI - Challenge and fight other players
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createBattlesUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "BattlesUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 98;
	
	// Battle button
	const battleBtn = new Instance("TextButton");
	battleBtn.Name = "BattleBtn";
	battleBtn.Size = new UDim2(0, 50, 0, 50);
	battleBtn.Position = new UDim2(0, 285, 1, -105);
	battleBtn.BackgroundColor3 = Color3.fromRGB(200, 80, 80);
	battleBtn.Text = "⚔️";
	battleBtn.TextSize = 28;
	battleBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 12);
	btnCorner.Parent = battleBtn;
	
	// Battle panel
	const panel = new Instance("Frame");
	panel.Name = "BattlePanel";
	panel.Size = new UDim2(0, 300, 0, 280);
	panel.Position = new UDim2(0.5, -150, 0.5, -140);
	panel.BackgroundColor3 = Color3.fromRGB(40, 25, 25);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 45);
	title.BackgroundTransparency = 1;
	title.Text = "⚔️ PET BATTLES ⚔️";
	title.TextColor3 = Color3.fromRGB(255, 100, 100);
	title.TextSize = 22;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Player name input
	const targetInput = new Instance("TextBox");
	targetInput.Size = new UDim2(0.7, 0, 0, 30);
	targetInput.Position = new UDim2(0.15, 0, 0, 55);
	targetInput.BackgroundColor3 = Color3.fromRGB(60, 45, 45);
	targetInput.PlaceholderText = "Player name...";
	targetInput.Text = "";
	targetInput.TextColor3 = Color3.fromRGB(255, 255, 255);
	targetInput.TextSize = 14;
	targetInput.Font = Enum.Font.Gotham;
	targetInput.Parent = panel;
	
	const inputCorner = new Instance("UICorner");
	inputCorner.CornerRadius = new UDim(0, 8);
	inputCorner.Parent = targetInput;
	
	// Wager input
	const wagerInput = new Instance("TextBox");
	wagerInput.Size = new UDim2(0.5, 0, 0, 30);
	wagerInput.Position = new UDim2(0.25, 0, 0, 95);
	wagerInput.BackgroundColor3 = Color3.fromRGB(60, 45, 45);
	wagerInput.PlaceholderText = "Wager (min 10)";
	wagerInput.Text = "100";
	wagerInput.TextColor3 = Color3.fromRGB(255, 215, 0);
	wagerInput.TextSize = 14;
	wagerInput.Font = Enum.Font.GothamBold;
	wagerInput.Parent = panel;
	
	const wagerCorner = new Instance("UICorner");
	wagerCorner.CornerRadius = new UDim(0, 8);
	wagerCorner.Parent = wagerInput;
	
	// Challenge button
	const challengeBtn = new Instance("TextButton");
	challengeBtn.Size = new UDim2(0.7, 0, 0, 40);
	challengeBtn.Position = new UDim2(0.15, 0, 0, 140);
	challengeBtn.BackgroundColor3 = Color3.fromRGB(180, 80, 80);
	challengeBtn.Text = "⚡ CHALLENGE!";
	challengeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	challengeBtn.TextSize = 16;
	challengeBtn.Font = Enum.Font.GothamBold;
	challengeBtn.Parent = panel;
	
	const challengeCorner = new Instance("UICorner");
	challengeCorner.CornerRadius = new UDim(0, 10);
	challengeCorner.Parent = challengeBtn;
	
	// Result label
	const resultLabel = new Instance("TextLabel");
	resultLabel.Name = "Result";
	resultLabel.Size = new UDim2(1, 0, 0, 40);
	resultLabel.Position = new UDim2(0, 0, 0, 190);
	resultLabel.BackgroundTransparency = 1;
	resultLabel.Text = "";
	resultLabel.TextSize = 14;
	resultLabel.Font = Enum.Font.GothamBold;
	resultLabel.TextWrapped = true;
	resultLabel.Parent = panel;
	
	// Close
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 30, 0, 30);
	closeBtn.Position = new UDim2(1, -35, 0, 5);
	closeBtn.BackgroundTransparency = 1;
	closeBtn.Text = "✕";
	closeBtn.TextColor3 = Color3.fromRGB(200, 200, 200);
	closeBtn.TextSize = 20;
	closeBtn.Parent = panel;
	
	battleBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		resultLabel.Text = "";
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	challengeBtn.MouseButton1Click.Connect(() => {
		const target = targetInput.Text;
		const wager = tonumber(wagerInput.Text) ?? 100;
		
		if (target === "" || target === player.Name) {
			resultLabel.Text = "Enter a valid player name!";
			resultLabel.TextColor3 = Color3.fromRGB(255, 100, 100);
			return;
		}
		
		const remote = ReplicatedStorage.FindFirstChild("ChallengeBattle") as RemoteFunction | undefined;
		if (!remote) return;
		
		// Use simple pet power for now
		const result = remote.InvokeServer(target, wager, "MyPet", 100) as { success: boolean; message?: string };
		
		resultLabel.Text = result.message ?? (result.success ? "Challenge sent!" : "Failed!");
		resultLabel.TextColor3 = result.success ? Color3.fromRGB(100, 255, 100) : Color3.fromRGB(255, 100, 100);
	});
	
	// Challenge notification popup
	const challengePopup = new Instance("Frame");
	challengePopup.Name = "ChallengePopup";
	challengePopup.Size = new UDim2(0, 280, 0, 120);
	challengePopup.Position = new UDim2(0.5, -140, 0.3, 0);
	challengePopup.BackgroundColor3 = Color3.fromRGB(60, 40, 40);
	challengePopup.Visible = false;
	challengePopup.Parent = screenGui;
	
	const popupCorner = new Instance("UICorner");
	popupCorner.CornerRadius = new UDim(0, 12);
	popupCorner.Parent = challengePopup;
	
	const popupTitle = new Instance("TextLabel");
	popupTitle.Size = new UDim2(1, 0, 0, 40);
	popupTitle.BackgroundTransparency = 1;
	popupTitle.Text = "⚔️ BATTLE CHALLENGE!";
	popupTitle.TextColor3 = Color3.fromRGB(255, 150, 150);
	popupTitle.TextSize = 18;
	popupTitle.Font = Enum.Font.GothamBold;
	popupTitle.Parent = challengePopup;
	
	const popupInfo = new Instance("TextLabel");
	popupInfo.Name = "Info";
	popupInfo.Size = new UDim2(1, 0, 0, 30);
	popupInfo.Position = new UDim2(0, 0, 0, 35);
	popupInfo.BackgroundTransparency = 1;
	popupInfo.Text = "";
	popupInfo.TextColor3 = Color3.fromRGB(220, 220, 220);
	popupInfo.TextSize = 14;
	popupInfo.Font = Enum.Font.Gotham;
	popupInfo.Parent = challengePopup;
	
	const acceptBtn = new Instance("TextButton");
	acceptBtn.Size = new UDim2(0.4, 0, 0, 30);
	acceptBtn.Position = new UDim2(0.05, 0, 0, 75);
	acceptBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 80);
	acceptBtn.Text = "ACCEPT";
	acceptBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	acceptBtn.TextSize = 12;
	acceptBtn.Font = Enum.Font.GothamBold;
	acceptBtn.Parent = challengePopup;
	
	const acceptCorner = new Instance("UICorner");
	acceptCorner.CornerRadius = new UDim(0, 8);
	acceptCorner.Parent = acceptBtn;
	
	const declineBtn = new Instance("TextButton");
	declineBtn.Size = new UDim2(0.4, 0, 0, 30);
	declineBtn.Position = new UDim2(0.55, 0, 0, 75);
	declineBtn.BackgroundColor3 = Color3.fromRGB(150, 80, 80);
	declineBtn.Text = "DECLINE";
	declineBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	declineBtn.TextSize = 12;
	declineBtn.Font = Enum.Font.GothamBold;
	declineBtn.Parent = challengePopup;
	
	const declineCorner = new Instance("UICorner");
	declineCorner.CornerRadius = new UDim(0, 8);
	declineCorner.Parent = declineBtn;
	
	let currentChallenger = "";
	
	// Listen for challenges
	const challengeNotify = ReplicatedStorage.WaitForChild("ChallengeNotify", 10) as RemoteEvent | undefined;
	if (challengeNotify) {
		challengeNotify.OnClientEvent.Connect((challenger: string, wager: number, petName: string) => {
			popupInfo.Text = `${challenger} challenges you!\nWager: ${wager} coins`;
			currentChallenger = challenger;
			challengePopup.Visible = true;
		});
	}
	
	acceptBtn.MouseButton1Click.Connect(() => {
		if (currentChallenger === "") return;
		
		const remote = ReplicatedStorage.FindFirstChild("AcceptChallenge") as RemoteFunction | undefined;
		if (remote) {
			remote.InvokeServer(currentChallenger, "MyPet", 100);
		}
		challengePopup.Visible = false;
		currentChallenger = "";
	});
	
	declineBtn.MouseButton1Click.Connect(() => {
		if (currentChallenger === "") return;
		
		const remote = ReplicatedStorage.FindFirstChild("DeclineChallenge") as RemoteFunction | undefined;
		if (remote) {
			remote.InvokeServer(currentChallenger);
		}
		challengePopup.Visible = false;
		currentChallenger = "";
	});
	
	// Battle result notification
	const battleNotify = ReplicatedStorage.WaitForChild("BattleNotify", 10) as RemoteEvent | undefined;
	if (battleNotify) {
		battleNotify.OnClientEvent.Connect((won: boolean, winnerName: string, amount: number) => {
			if (amount === 0) {
				resultLabel.Text = "Challenge declined.";
				resultLabel.TextColor3 = Color3.fromRGB(180, 180, 180);
			} else if (won) {
				resultLabel.Text = `🏆 YOU WON! +${amount} coins!`;
				resultLabel.TextColor3 = Color3.fromRGB(100, 255, 100);
			} else {
				resultLabel.Text = `💀 ${winnerName} won! -${amount} coins`;
				resultLabel.TextColor3 = Color3.fromRGB(255, 100, 100);
			}
		});
	}
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("⚔️ Battles UI ready!");
}
