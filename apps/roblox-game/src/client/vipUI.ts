// VIP Zone UI - Unlock and teleport to VIP
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createVIPUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "VIPUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 92;
	
	// VIP button
	const vipBtn = new Instance("TextButton");
	vipBtn.Name = "VIPBtn";
	vipBtn.Size = new UDim2(0, 100, 0, 40);
	vipBtn.Position = new UDim2(0, 10, 0.5, 150);
	vipBtn.BackgroundColor3 = Color3.fromRGB(255, 200, 50);
	vipBtn.Text = "👑 VIP";
	vipBtn.TextColor3 = Color3.fromRGB(0, 0, 0);
	vipBtn.TextSize = 16;
	vipBtn.Font = Enum.Font.GothamBold;
	vipBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = vipBtn;
	
	// VIP panel
	const panel = new Instance("Frame");
	panel.Name = "VIPPanel";
	panel.Size = new UDim2(0, 280, 0, 200);
	panel.Position = new UDim2(0.5, -140, 0.5, -100);
	panel.BackgroundColor3 = Color3.fromRGB(50, 40, 20);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 45);
	title.BackgroundTransparency = 1;
	title.Text = "👑 VIP ZONE 👑";
	title.TextColor3 = Color3.fromRGB(255, 215, 0);
	title.TextSize = 22;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Benefits
	const benefits = new Instance("TextLabel");
	benefits.Size = new UDim2(1, 0, 0, 50);
	benefits.Position = new UDim2(0, 0, 0, 45);
	benefits.BackgroundTransparency = 1;
	benefits.Text = "💎 10x Coin Value\n⭐ Exclusive Area\n🔒 Premium Access";
	benefits.TextColor3 = Color3.fromRGB(220, 220, 220);
	benefits.TextSize = 14;
	benefits.Font = Enum.Font.Gotham;
	benefits.Parent = panel;
	
	// Action button (unlock or teleport)
	const actionBtn = new Instance("TextButton");
	actionBtn.Name = "ActionBtn";
	actionBtn.Size = new UDim2(0.7, 0, 0, 40);
	actionBtn.Position = new UDim2(0.15, 0, 0, 105);
	actionBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
	actionBtn.Text = "UNLOCK (2,500 🪙)";
	actionBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	actionBtn.TextSize = 16;
	actionBtn.Font = Enum.Font.GothamBold;
	actionBtn.Parent = panel;
	
	const actionCorner = new Instance("UICorner");
	actionCorner.CornerRadius = new UDim(0, 10);
	actionCorner.Parent = actionBtn;
	
	// Status label
	const statusLabel = new Instance("TextLabel");
	statusLabel.Name = "Status";
	statusLabel.Size = new UDim2(1, 0, 0, 25);
	statusLabel.Position = new UDim2(0, 0, 0, 150);
	statusLabel.BackgroundTransparency = 1;
	statusLabel.Text = "";
	statusLabel.TextSize = 14;
	statusLabel.Font = Enum.Font.Gotham;
	statusLabel.Parent = panel;
	
	// Close
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 30, 0, 30);
	closeBtn.Position = new UDim2(1, -35, 0, 5);
	closeBtn.BackgroundTransparency = 1;
	closeBtn.Text = "✕";
	closeBtn.TextColor3 = Color3.fromRGB(200, 200, 200);
	closeBtn.TextSize = 20;
	closeBtn.Parent = panel;
	
	// Functions
	const refresh = () => {
		const checkRemote = ReplicatedStorage.FindFirstChild("CheckVIP") as RemoteFunction | undefined;
		if (!checkRemote) return;
		
		const info = checkRemote.InvokeServer() as { hasVIP: boolean; cost: number };
		
		if (info.hasVIP) {
			actionBtn.Text = "🚀 TELEPORT";
			actionBtn.BackgroundColor3 = Color3.fromRGB(100, 150, 255);
			statusLabel.Text = "✅ VIP Member";
			statusLabel.TextColor3 = Color3.fromRGB(100, 255, 100);
		} else {
			actionBtn.Text = `UNLOCK (${info.cost} 🪙)`;
			actionBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
			statusLabel.Text = "";
		}
	};
	
	// Toggle
	vipBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) refresh();
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	// Action
	actionBtn.MouseButton1Click.Connect(() => {
		const checkRemote = ReplicatedStorage.FindFirstChild("CheckVIP") as RemoteFunction | undefined;
		if (!checkRemote) return;
		
		const info = checkRemote.InvokeServer() as { hasVIP: boolean };
		
		if (info.hasVIP) {
			// Teleport
			const teleportRemote = ReplicatedStorage.FindFirstChild("TeleportVIP") as RemoteEvent | undefined;
			if (teleportRemote) {
				teleportRemote.FireServer();
				panel.Visible = false;
			}
		} else {
			// Unlock
			const unlockRemote = ReplicatedStorage.FindFirstChild("UnlockVIP") as RemoteFunction | undefined;
			if (unlockRemote) {
				const result = unlockRemote.InvokeServer() as { success: boolean; message?: string };
				if (result.success) {
					refresh();
				} else {
					statusLabel.Text = result.message ?? "Failed!";
					statusLabel.TextColor3 = Color3.fromRGB(255, 100, 100);
				}
			}
		}
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("👑 VIP UI ready!");
}
