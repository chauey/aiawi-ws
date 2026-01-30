// Codes UI - Premium Design
import { Players, ReplicatedStorage, TweenService } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createCodesUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "CodesUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 91;
	
	// Codes button (left side) - PREMIUM
	const codesBtn = new Instance("TextButton");
	codesBtn.Name = "CodesBtn";
	codesBtn.Size = new UDim2(0, 90, 0, 36);
	codesBtn.Position = new UDim2(0, 10, 0, 200);
	codesBtn.BackgroundColor3 = Color3.fromRGB(255, 100, 120);
	codesBtn.Text = "🎁 CODES";
	codesBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	codesBtn.TextSize = 12;
	codesBtn.Font = Enum.Font.GothamBold;
	codesBtn.AutoButtonColor = false;
	codesBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 10);
	btnCorner.Parent = codesBtn;
	
	// Gradient
	const btnGradient = new Instance("UIGradient");
	btnGradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(255, 120, 140)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(220, 70, 100)),
	]);
	btnGradient.Rotation = 90;
	btnGradient.Parent = codesBtn;
	
	// Stroke  
	const btnStroke = new Instance("UIStroke");
	btnStroke.Color = Color3.fromRGB(255, 180, 190);
	btnStroke.Transparency = 0.6;
	btnStroke.Thickness = 1;
	btnStroke.Parent = codesBtn;
	
	// Hover effects
	codesBtn.MouseEnter.Connect(() => {
		TweenService.Create(codesBtn, new TweenInfo(0.15), { Size: new UDim2(0, 95, 0, 38) }).Play();
		btnStroke.Transparency = 0.2;
	});
	codesBtn.MouseLeave.Connect(() => {
		TweenService.Create(codesBtn, new TweenInfo(0.15), { Size: new UDim2(0, 90, 0, 36) }).Play();
		btnStroke.Transparency = 0.6;
	});
	
	// Codes panel
	const panel = new Instance("Frame");
	panel.Name = "CodesPanel";
	panel.Size = new UDim2(0, 280, 0, 180);
	panel.Position = new UDim2(0.5, -140, 0.5, -90);
	panel.BackgroundColor3 = Color3.fromRGB(40, 35, 30);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 40);
	title.BackgroundTransparency = 1;
	title.Text = "🎁 REDEEM CODES 🎁";
	title.TextColor3 = Color3.fromRGB(255, 200, 100);
	title.TextSize = 20;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Input box
	const inputBox = new Instance("TextBox");
	inputBox.Name = "CodeInput";
	inputBox.Size = new UDim2(0.8, 0, 0, 35);
	inputBox.Position = new UDim2(0.1, 0, 0, 50);
	inputBox.BackgroundColor3 = Color3.fromRGB(60, 55, 50);
	inputBox.PlaceholderText = "Enter code here...";
	inputBox.Text = "";
	inputBox.TextColor3 = Color3.fromRGB(255, 255, 255);
	inputBox.TextSize = 16;
	inputBox.Font = Enum.Font.Gotham;
	inputBox.ClearTextOnFocus = true;
	inputBox.Parent = panel;
	
	const inputCorner = new Instance("UICorner");
	inputCorner.CornerRadius = new UDim(0, 8);
	inputCorner.Parent = inputBox;
	
	// Redeem button
	const redeemBtn = new Instance("TextButton");
	redeemBtn.Name = "RedeemBtn";
	redeemBtn.Size = new UDim2(0.6, 0, 0, 35);
	redeemBtn.Position = new UDim2(0.2, 0, 0, 95);
	redeemBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
	redeemBtn.Text = "REDEEM";
	redeemBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	redeemBtn.TextSize = 16;
	redeemBtn.Font = Enum.Font.GothamBold;
	redeemBtn.Parent = panel;
	
	const redeemCorner = new Instance("UICorner");
	redeemCorner.CornerRadius = new UDim(0, 10);
	redeemCorner.Parent = redeemBtn;
	
	// Result label
	const resultLabel = new Instance("TextLabel");
	resultLabel.Name = "Result";
	resultLabel.Size = new UDim2(1, 0, 0, 25);
	resultLabel.Position = new UDim2(0, 0, 0, 135);
	resultLabel.BackgroundTransparency = 1;
	resultLabel.Text = "";
	resultLabel.TextSize = 14;
	resultLabel.Font = Enum.Font.GothamBold;
	resultLabel.Parent = panel;
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 30, 0, 30);
	closeBtn.Position = new UDim2(1, -35, 0, 5);
	closeBtn.BackgroundTransparency = 1;
	closeBtn.Text = "X"; // Simple X that renders properly
	closeBtn.TextColor3 = Color3.fromRGB(200, 200, 200);
	closeBtn.TextSize = 18;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = panel;
	
	// Toggle
	codesBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		resultLabel.Text = "";
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	// Redeem
	redeemBtn.MouseButton1Click.Connect(() => {
		const code = inputBox.Text;
		if (code === "") {
			resultLabel.Text = "Enter a code!";
			resultLabel.TextColor3 = Color3.fromRGB(255, 150, 100);
			return;
		}
		
		const remote = ReplicatedStorage.FindFirstChild("RedeemCode") as RemoteFunction | undefined;
		if (!remote) return;
		
		const result = remote.InvokeServer(code) as { success: boolean; message: string };
		resultLabel.Text = result.message;
		resultLabel.TextColor3 = result.success 
			? Color3.fromRGB(100, 255, 100) 
			: Color3.fromRGB(255, 100, 100);
		
		if (result.success) {
			inputBox.Text = "";
		}
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🎁 Codes UI ready!");
}
