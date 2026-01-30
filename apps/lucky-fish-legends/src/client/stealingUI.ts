// Coin Stealing UI - Visual feedback for steals
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createStealingUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "StealingUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 90;
	
	// Notification label (shows briefly when stealing/robbed)
	const notifyLabel = new Instance("TextLabel");
	notifyLabel.Name = "StealNotify";
	notifyLabel.Size = new UDim2(0, 350, 0, 50);
	notifyLabel.Position = new UDim2(0.5, -175, 0, 80);
	notifyLabel.BackgroundColor3 = Color3.fromRGB(40, 40, 50);
	notifyLabel.BackgroundTransparency = 0.2;
	notifyLabel.Text = "";
	notifyLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
	notifyLabel.TextSize = 18;
	notifyLabel.Font = Enum.Font.GothamBold;
	notifyLabel.Visible = false;
	notifyLabel.Parent = screenGui;
	
	const notifyCorner = new Instance("UICorner");
	notifyCorner.CornerRadius = new UDim(0, 12);
	notifyCorner.Parent = notifyLabel;
	
	// Listen for steal events
	const stealRemote = ReplicatedStorage.WaitForChild("CoinStealNotify", 1) as RemoteEvent | undefined;
	if (stealRemote) {
		stealRemote.OnClientEvent.Connect((eventType: string, otherPlayer: string, amount: number) => {
			if (eventType === "stole") {
				// We stole from someone!
				notifyLabel.Text = `💰 You stole ${amount} coins from ${otherPlayer}!`;
				notifyLabel.BackgroundColor3 = Color3.fromRGB(50, 120, 50);
				showNotification(notifyLabel);
			} else if (eventType === "robbed") {
				// Someone stole from us!
				notifyLabel.Text = `😱 ${otherPlayer} stole ${amount} coins from you!`;
				notifyLabel.BackgroundColor3 = Color3.fromRGB(150, 50, 50);
				showNotification(notifyLabel);
			}
		});
	}
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("💰 Stealing UI ready!");
}

function showNotification(label: TextLabel) {
	label.Visible = true;
	label.TextTransparency = 0;
	label.BackgroundTransparency = 0.2;
	
	// Fade out after 2 seconds
	wait(2);
	
	for (let i = 0; i <= 10; i++) {
		label.TextTransparency = i / 10;
		label.BackgroundTransparency = 0.2 + (i / 10) * 0.8;
		wait(0.05);
	}
	
	label.Visible = false;
}
