// Clans UI - Premium Design
import { Players, ReplicatedStorage, TweenService } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createClansUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "ClansUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 96;
	
	// Clans button - PREMIUM CYAN
	const clansBtn = new Instance("TextButton");
	clansBtn.Name = "ClansBtn";
	clansBtn.Size = new UDim2(0, 90, 0, 36);
	clansBtn.Position = new UDim2(0, 10, 0, 280);
	clansBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 220);
	clansBtn.Text = "👥 CLANS";
	clansBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	clansBtn.TextSize = 12;
	clansBtn.Font = Enum.Font.GothamBold;
	clansBtn.AutoButtonColor = false;
	clansBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = clansBtn;
	
	// Gradient
	const btnGradient = new Instance("UIGradient");
	btnGradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(100, 200, 240)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(60, 150, 200)),
	]);
	btnGradient.Rotation = 90;
	btnGradient.Parent = clansBtn;
	
	// Stroke
	const btnStroke = new Instance("UIStroke");
	btnStroke.Color = Color3.fromRGB(150, 220, 255);
	btnStroke.Transparency = 0.6;
	btnStroke.Thickness = 1;
	btnStroke.Parent = clansBtn;
	
	// Hover
	clansBtn.MouseEnter.Connect(() => {
		TweenService.Create(clansBtn, new TweenInfo(0.15), { Size: new UDim2(0, 95, 0, 38) }).Play();
		btnStroke.Transparency = 0.2;
	});
	clansBtn.MouseLeave.Connect(() => {
		TweenService.Create(clansBtn, new TweenInfo(0.15), { Size: new UDim2(0, 90, 0, 36) }).Play();
		btnStroke.Transparency = 0.6;
	});
	
	// Panel
	const panel = new Instance("Frame");
	panel.Name = "ClansPanel";
	panel.Size = new UDim2(0, 320, 0, 300);
	panel.Position = new UDim2(0.5, -160, 0.5, -150);
	panel.BackgroundColor3 = Color3.fromRGB(30, 40, 50);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 40);
	title.BackgroundTransparency = 1;
	title.Text = "👥 CLANS 👥";
	title.TextColor3 = Color3.fromRGB(100, 180, 255);
	title.TextSize = 22;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Content frame
	const content = new Instance("Frame");
	content.Name = "Content";
	content.Size = new UDim2(1, -20, 0, 200);
	content.Position = new UDim2(0, 10, 0, 45);
	content.BackgroundTransparency = 1;
	content.Parent = panel;
	
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
	
	const refresh = () => {
		// Clear content
		for (const child of content.GetChildren()) {
			child.Destroy();
		}
		
		const infoRemote = ReplicatedStorage.FindFirstChild("GetClanInfo") as RemoteFunction | undefined;
		if (!infoRemote) return;
		
		const info = infoRemote.InvokeServer() as { inClan: boolean; name?: string; tag?: string; memberCount?: number; maxMembers?: number; bonus?: number };
		
		if (info.inClan) {
			showClanInfo(content, info, refresh);
		} else {
			showNoClan(content, refresh);
		}
	};
	
	clansBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) refresh();
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("👥 Clans UI ready!");
}

function showClanInfo(parent: Frame, info: { name?: string; tag?: string; memberCount?: number; maxMembers?: number; bonus?: number }, refreshFn: () => void) {
	const nameLabel = new Instance("TextLabel");
	nameLabel.Size = new UDim2(1, 0, 0, 30);
	nameLabel.BackgroundTransparency = 1;
	nameLabel.Text = `[${info.tag}] ${info.name}`;
	nameLabel.TextColor3 = Color3.fromRGB(100, 200, 255);
	nameLabel.TextSize = 20;
	nameLabel.Font = Enum.Font.GothamBold;
	nameLabel.Parent = parent;
	
	const membersLabel = new Instance("TextLabel");
	membersLabel.Size = new UDim2(1, 0, 0, 25);
	membersLabel.Position = new UDim2(0, 0, 0, 35);
	membersLabel.BackgroundTransparency = 1;
	membersLabel.Text = `Members: ${info.memberCount}/${info.maxMembers}`;
	membersLabel.TextColor3 = Color3.fromRGB(200, 200, 200);
	membersLabel.TextSize = 14;
	membersLabel.Font = Enum.Font.Gotham;
	membersLabel.Parent = parent;
	
	const bonusLabel = new Instance("TextLabel");
	bonusLabel.Size = new UDim2(1, 0, 0, 25);
	bonusLabel.Position = new UDim2(0, 0, 0, 60);
	bonusLabel.BackgroundTransparency = 1;
	bonusLabel.Text = `Bonus: +${info.bonus}% coins!`;
	bonusLabel.TextColor3 = Color3.fromRGB(100, 255, 100);
	bonusLabel.TextSize = 14;
	bonusLabel.Font = Enum.Font.GothamBold;
	bonusLabel.Parent = parent;
	
	const leaveBtn = new Instance("TextButton");
	leaveBtn.Size = new UDim2(0, 120, 0, 35);
	leaveBtn.Position = new UDim2(0.5, -60, 0, 100);
	leaveBtn.BackgroundColor3 = Color3.fromRGB(180, 80, 80);
	leaveBtn.Text = "LEAVE CLAN";
	leaveBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	leaveBtn.TextSize = 14;
	leaveBtn.Font = Enum.Font.GothamBold;
	leaveBtn.Parent = parent;
	
	const leaveCorner = new Instance("UICorner");
	leaveCorner.CornerRadius = new UDim(0, 10);
	leaveCorner.Parent = leaveBtn;
	
	leaveBtn.MouseButton1Click.Connect(() => {
		const remote = ReplicatedStorage.FindFirstChild("LeaveClan") as RemoteFunction | undefined;
		if (remote) {
			remote.InvokeServer();
			refreshFn();
		}
	});
}

function showNoClan(parent: Frame, refreshFn: () => void) {
	const noLabel = new Instance("TextLabel");
	noLabel.Size = new UDim2(1, 0, 0, 25);
	noLabel.BackgroundTransparency = 1;
	noLabel.Text = "You're not in a clan";
	noLabel.TextColor3 = Color3.fromRGB(180, 180, 180);
	noLabel.TextSize = 14;
	noLabel.Font = Enum.Font.Gotham;
	noLabel.Parent = parent;
	
	// Create clan section
	const nameInput = new Instance("TextBox");
	nameInput.Size = new UDim2(0.6, 0, 0, 30);
	nameInput.Position = new UDim2(0, 0, 0, 35);
	nameInput.BackgroundColor3 = Color3.fromRGB(50, 50, 60);
	nameInput.PlaceholderText = "Clan name...";
	nameInput.Text = "";
	nameInput.TextColor3 = Color3.fromRGB(255, 255, 255);
	nameInput.TextSize = 14;
	nameInput.Font = Enum.Font.Gotham;
	nameInput.Parent = parent;
	
	const nameCorner = new Instance("UICorner");
	nameCorner.CornerRadius = new UDim(0, 6);
	nameCorner.Parent = nameInput;
	
	const tagInput = new Instance("TextBox");
	tagInput.Size = new UDim2(0.35, 0, 0, 30);
	tagInput.Position = new UDim2(0.65, 0, 0, 35);
	tagInput.BackgroundColor3 = Color3.fromRGB(50, 50, 60);
	tagInput.PlaceholderText = "TAG";
	tagInput.Text = "";
	tagInput.TextColor3 = Color3.fromRGB(255, 255, 255);
	tagInput.TextSize = 14;
	tagInput.Font = Enum.Font.GothamBold;
	tagInput.Parent = parent;
	
	const tagCorner = new Instance("UICorner");
	tagCorner.CornerRadius = new UDim(0, 6);
	tagCorner.Parent = tagInput;
	
	const createBtn = new Instance("TextButton");
	createBtn.Size = new UDim2(1, 0, 0, 35);
	createBtn.Position = new UDim2(0, 0, 0, 75);
	createBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 80);
	createBtn.Text = "CREATE CLAN (500 🪙)";
	createBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	createBtn.TextSize = 14;
	createBtn.Font = Enum.Font.GothamBold;
	createBtn.Parent = parent;
	
	const createCorner = new Instance("UICorner");
	createCorner.CornerRadius = new UDim(0, 10);
	createCorner.Parent = createBtn;
	
	const resultLabel = new Instance("TextLabel");
	resultLabel.Name = "Result";
	resultLabel.Size = new UDim2(1, 0, 0, 20);
	resultLabel.Position = new UDim2(0, 0, 0, 115);
	resultLabel.BackgroundTransparency = 1;
	resultLabel.Text = "";
	resultLabel.TextSize = 12;
	resultLabel.Font = Enum.Font.Gotham;
	resultLabel.Parent = parent;
	
	createBtn.MouseButton1Click.Connect(() => {
		const remote = ReplicatedStorage.FindFirstChild("CreateClan") as RemoteFunction | undefined;
		if (!remote) return;
		
		const result = remote.InvokeServer(nameInput.Text, tagInput.Text) as { success: boolean; message?: string };
		
		if (result.success) {
			refreshFn();
		} else {
			resultLabel.Text = result.message ?? "Failed!";
			resultLabel.TextColor3 = Color3.fromRGB(255, 100, 100);
		}
	});
}
