// Private Servers UI - Premium Design
import { Players, ReplicatedStorage, TweenService } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createPrivateServerUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "PrivateServerUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 99;
	
	// Private button - PREMIUM PURPLE
	const privateBtn = new Instance("TextButton");
	privateBtn.Name = "PrivateBtn";
	privateBtn.Size = new UDim2(0, 90, 0, 36);
	privateBtn.Position = new UDim2(0, 10, 0, 320);
	privateBtn.BackgroundColor3 = Color3.fromRGB(140, 100, 200);
	privateBtn.Text = "🔒 PRIVATE";
	privateBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	privateBtn.TextSize = 11;
	privateBtn.Font = Enum.Font.GothamBold;
	privateBtn.AutoButtonColor = false;
	privateBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = privateBtn;
	
	// Gradient
	const btnGradient = new Instance("UIGradient");
	btnGradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(160, 120, 220)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(120, 80, 180)),
	]);
	btnGradient.Rotation = 90;
	btnGradient.Parent = privateBtn;
	
	// Stroke
	const btnStroke = new Instance("UIStroke");
	btnStroke.Color = Color3.fromRGB(200, 170, 255);
	btnStroke.Transparency = 0.6;
	btnStroke.Thickness = 1;
	btnStroke.Parent = privateBtn;
	
	// Hover
	privateBtn.MouseEnter.Connect(() => {
		TweenService.Create(privateBtn, new TweenInfo(0.15), { Size: new UDim2(0, 95, 0, 38) }).Play();
		btnStroke.Transparency = 0.2;
	});
	privateBtn.MouseLeave.Connect(() => {
		TweenService.Create(privateBtn, new TweenInfo(0.15), { Size: new UDim2(0, 90, 0, 36) }).Play();
		btnStroke.Transparency = 0.6;
	});
	
	// Panel
	const panel = new Instance("Frame");
	panel.Name = "PrivatePanel";
	panel.Size = new UDim2(0, 300, 0, 280);
	panel.Position = new UDim2(0.5, -150, 0.5, -140);
	panel.BackgroundColor3 = Color3.fromRGB(35, 30, 50);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 45);
	title.BackgroundTransparency = 1;
	title.Text = "🔒 PRIVATE SERVER 🔒";
	title.TextColor3 = Color3.fromRGB(180, 150, 255);
	title.TextSize = 20;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Features list
	const features = new Instance("TextLabel");
	features.Size = new UDim2(1, -20, 0, 120);
	features.Position = new UDim2(0, 10, 0, 50);
	features.BackgroundTransparency = 1;
	features.Text = "✅ Play with friends only\n✅ No random players\n✅ Custom game speed\n✅ Exclusive spawns\n✅ No stealing allowed";
	features.TextColor3 = Color3.fromRGB(200, 200, 200);
	features.TextSize = 14;
	features.Font = Enum.Font.Gotham;
	features.TextYAlignment = Enum.TextYAlignment.Top;
	features.Parent = panel;
	
	// Status
	const statusLabel = new Instance("TextLabel");
	statusLabel.Name = "Status";
	statusLabel.Size = new UDim2(1, 0, 0, 25);
	statusLabel.Position = new UDim2(0, 0, 0, 175);
	statusLabel.BackgroundTransparency = 1;
	statusLabel.Text = "";
	statusLabel.TextSize = 14;
	statusLabel.Font = Enum.Font.GothamBold;
	statusLabel.Parent = panel;
	
	// Create button
	const createBtn = new Instance("TextButton");
	createBtn.Size = new UDim2(0.7, 0, 0, 40);
	createBtn.Position = new UDim2(0.15, 0, 0, 205);
	createBtn.BackgroundColor3 = Color3.fromRGB(120, 80, 180);
	createBtn.Text = "CREATE (50 🪙)";
	createBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	createBtn.TextSize = 16;
	createBtn.Font = Enum.Font.GothamBold;
	createBtn.Parent = panel;
	
	const createCorner = new Instance("UICorner");
	createCorner.CornerRadius = new UDim(0, 10);
	createCorner.Parent = createBtn;
	
	// Close
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 30, 0, 30);
	closeBtn.Position = new UDim2(1, -35, 0, 5);
	closeBtn.BackgroundTransparency = 1;
	closeBtn.Text = "✕";
	closeBtn.TextColor3 = Color3.fromRGB(200, 200, 200);
	closeBtn.TextSize = 20;
	closeBtn.Parent = panel;
	
	const refresh = () => {
		const checkRemote = ReplicatedStorage.FindFirstChild("CheckPrivateServer") as RemoteFunction | undefined;
		if (!checkRemote) return;
		
		const result = checkRemote.InvokeServer() as { hasPrivate: boolean; cost: number };
		
		if (result.hasPrivate) {
			statusLabel.Text = "✅ Private Server Active!";
			statusLabel.TextColor3 = Color3.fromRGB(100, 255, 100);
			createBtn.Text = "ACTIVE";
			createBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 80);
		} else {
			statusLabel.Text = "";
			createBtn.Text = `CREATE (${result.cost} 🪙)`;
		}
	};
	
	privateBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) refresh();
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	createBtn.MouseButton1Click.Connect(() => {
		const createRemote = ReplicatedStorage.FindFirstChild("CreatePrivateServer") as RemoteFunction | undefined;
		if (!createRemote) return;
		
		const result = createRemote.InvokeServer() as { success: boolean; message?: string };
		
		statusLabel.Text = result.message ?? "";
		statusLabel.TextColor3 = result.success 
			? Color3.fromRGB(100, 255, 100) 
			: Color3.fromRGB(255, 100, 100);
		
		if (result.success) refresh();
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🔒 Private Server UI ready!");
}
