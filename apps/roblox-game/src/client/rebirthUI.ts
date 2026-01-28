// Rebirth UI - Show rebirth button and stats
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createRebirthUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "RebirthUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 88;
	
	// Rebirth button (bottom left area)
	const rebirthBtn = new Instance("TextButton");
	rebirthBtn.Name = "RebirthBtn";
	rebirthBtn.Size = new UDim2(0, 100, 0, 40);
	rebirthBtn.Position = new UDim2(0, 345, 1, -55);
	rebirthBtn.BackgroundColor3 = Color3.fromRGB(255, 100, 150);
	rebirthBtn.Text = "🔄 REBIRTH";
	rebirthBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	rebirthBtn.TextSize = 14;
	rebirthBtn.Font = Enum.Font.GothamBold;
	// Keeping rebirth button visible - premium action
	rebirthBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = rebirthBtn;
	
	// Rebirth panel
	const panel = new Instance("Frame");
	panel.Name = "RebirthPanel";
	panel.Size = new UDim2(0, 320, 0, 280);
	panel.Position = new UDim2(0.5, -160, 0.5, -140);
	panel.BackgroundColor3 = Color3.fromRGB(40, 30, 50);
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
	title.Text = "🔄 REBIRTH 🔄";
	title.TextColor3 = Color3.fromRGB(255, 100, 150);
	title.TextSize = 24;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Info labels
	const currentLabel = new Instance("TextLabel");
	currentLabel.Name = "CurrentRebirths";
	currentLabel.Size = new UDim2(1, 0, 0, 30);
	currentLabel.Position = new UDim2(0, 0, 0, 55);
	currentLabel.BackgroundTransparency = 1;
	currentLabel.Text = "Current Rebirths: 0";
	currentLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
	currentLabel.TextSize = 18;
	currentLabel.Font = Enum.Font.Gotham;
	currentLabel.Parent = panel;
	
	const multiplierLabel = new Instance("TextLabel");
	multiplierLabel.Name = "Multiplier";
	multiplierLabel.Size = new UDim2(1, 0, 0, 30);
	multiplierLabel.Position = new UDim2(0, 0, 0, 85);
	multiplierLabel.BackgroundTransparency = 1;
	multiplierLabel.Text = "Current Bonus: +0%";
	multiplierLabel.TextColor3 = Color3.fromRGB(100, 255, 100);
	multiplierLabel.TextSize = 18;
	multiplierLabel.Font = Enum.Font.GothamBold;
	multiplierLabel.Parent = panel;
	
	const costLabel = new Instance("TextLabel");
	costLabel.Name = "Cost";
	costLabel.Size = new UDim2(1, 0, 0, 30);
	costLabel.Position = new UDim2(0, 0, 0, 120);
	costLabel.BackgroundTransparency = 1;
	costLabel.Text = "Cost: 🪙 10,000";
	costLabel.TextColor3 = Color3.fromRGB(255, 215, 0);
	costLabel.TextSize = 18;
	costLabel.Font = Enum.Font.Gotham;
	costLabel.Parent = panel;
	
	const nextLabel = new Instance("TextLabel");
	nextLabel.Name = "NextBonus";
	nextLabel.Size = new UDim2(1, 0, 0, 30);
	nextLabel.Position = new UDim2(0, 0, 0, 150);
	nextLabel.BackgroundTransparency = 1;
	nextLabel.Text = "Next Bonus: +25%";
	nextLabel.TextColor3 = Color3.fromRGB(150, 255, 150);
	nextLabel.TextSize = 16;
	nextLabel.Font = Enum.Font.Gotham;
	nextLabel.Parent = panel;
	
	// Confirm button
	const confirmBtn = new Instance("TextButton");
	confirmBtn.Name = "ConfirmBtn";
	confirmBtn.Size = new UDim2(0, 200, 0, 45);
	confirmBtn.Position = new UDim2(0.5, -100, 0, 190);
	confirmBtn.BackgroundColor3 = Color3.fromRGB(255, 100, 150);
	confirmBtn.Text = "🔄 REBIRTH NOW";
	confirmBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	confirmBtn.TextSize = 18;
	confirmBtn.Font = Enum.Font.GothamBold;
	confirmBtn.Parent = panel;
	
	const confirmCorner = new Instance("UICorner");
	confirmCorner.CornerRadius = new UDim(0, 10);
	confirmCorner.Parent = confirmBtn;
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Name = "CloseBtn";
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
	rebirthBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) {
			refreshRebirthInfo(currentLabel, multiplierLabel, costLabel, nextLabel);
		}
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	// Confirm rebirth
	confirmBtn.MouseButton1Click.Connect(() => {
		const rebirthRemote = ReplicatedStorage.FindFirstChild("Rebirth") as RemoteFunction | undefined;
		if (rebirthRemote) {
			const result = rebirthRemote.InvokeServer() as { success: boolean; message?: string; rebirths?: number; multiplier?: number };
			if (result.success) {
				// Refresh info
				refreshRebirthInfo(currentLabel, multiplierLabel, costLabel, nextLabel);
			} else {
				// Show error
				confirmBtn.Text = result.message ?? "Failed!";
				wait(1.5);
				confirmBtn.Text = "🔄 REBIRTH NOW";
			}
		}
	});
	
	// Listen for rebirth notifications
	setupRebirthNotify(screenGui);
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🔄 Rebirth UI ready!");
}

function refreshRebirthInfo(currentLabel: TextLabel, multiplierLabel: TextLabel, costLabel: TextLabel, nextLabel: TextLabel) {
	const infoRemote = ReplicatedStorage.FindFirstChild("GetRebirthInfo") as RemoteFunction | undefined;
	if (!infoRemote) return;
	
	const info = infoRemote.InvokeServer() as { rebirths: number; cost: number; multiplier: number; nextMultiplier: number };
	
	currentLabel.Text = `Current Rebirths: ${info.rebirths}`;
	multiplierLabel.Text = `Current Bonus: +${math.floor((info.multiplier - 1) * 100)}%`;
	costLabel.Text = `Cost: 🪙 ${formatNumber(info.cost)}`;
	nextLabel.Text = `Next Bonus: +${math.floor((info.nextMultiplier - 1) * 100)}%`;
}

function setupRebirthNotify(screenGui: ScreenGui) {
	const notifyRemote = ReplicatedStorage.WaitForChild("RebirthNotify", 1) as RemoteEvent | undefined;
	if (!notifyRemote) return;
	
	notifyRemote.OnClientEvent.Connect((rebirths: number, multiplier: number) => {
		// Show big celebration!
		const overlay = new Instance("Frame");
		overlay.Size = new UDim2(1, 0, 1, 0);
		overlay.BackgroundColor3 = Color3.fromRGB(255, 100, 150);
		overlay.BackgroundTransparency = 0.3;
		overlay.ZIndex = 100;
		overlay.Parent = screenGui;
		
		const text = new Instance("TextLabel");
		text.Size = new UDim2(1, 0, 0, 100);
		text.Position = new UDim2(0, 0, 0.4, 0);
		text.BackgroundTransparency = 1;
		text.Text = `🔄 REBIRTH ${rebirths}! 🔄\n+${math.floor((multiplier - 1) * 100)}% COINS!`;
		text.TextColor3 = Color3.fromRGB(255, 255, 255);
		text.TextSize = 48;
		text.Font = Enum.Font.GothamBold;
		text.ZIndex = 101;
		text.Parent = overlay;
		
		wait(2.5);
		overlay.Destroy();
	});
}

function formatNumber(n: number): string {
	if (n >= 1000000) {
		return `${math.floor(n / 100000) / 10}M`;
	} else if (n >= 1000) {
		return `${math.floor(n / 100) / 10}K`;
	}
	return tostring(n);
}
