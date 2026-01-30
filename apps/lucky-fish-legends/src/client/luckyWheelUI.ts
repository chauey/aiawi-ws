// Lucky Wheel UI - Spin animation and prizes
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createLuckyWheelUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "LuckyWheelUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 87;
	
	// Wheel button
	const wheelBtn = new Instance("TextButton");
	wheelBtn.Name = "WheelBtn";
	wheelBtn.Size = new UDim2(0, 50, 0, 50);
	wheelBtn.Position = new UDim2(0, 10, 0.5, 40);
	wheelBtn.BackgroundColor3 = Color3.fromRGB(255, 200, 50);
	wheelBtn.Text = "🎡";
	wheelBtn.TextSize = 28;
	wheelBtn.Font = Enum.Font.GothamBold;
	wheelBtn.Visible = false; // Hidden - now in action bar
	wheelBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 25);
	btnCorner.Parent = wheelBtn;
	
	// Wheel panel
	const panel = new Instance("Frame");
	panel.Name = "WheelPanel";
	panel.Size = new UDim2(0, 300, 0, 320);
	panel.Position = new UDim2(0.5, -150, 0.5, -160);
	panel.BackgroundColor3 = Color3.fromRGB(40, 35, 50);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 45);
	title.BackgroundTransparency = 1;
	title.Text = "🎡 LUCKY WHEEL 🎡";
	title.TextColor3 = Color3.fromRGB(255, 200, 50);
	title.TextSize = 22;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Wheel display (simplified - just prize text)
	const wheelDisplay = new Instance("TextLabel");
	wheelDisplay.Name = "WheelDisplay";
	wheelDisplay.Size = new UDim2(0, 200, 0, 100);
	wheelDisplay.Position = new UDim2(0.5, -100, 0, 50);
	wheelDisplay.BackgroundColor3 = Color3.fromRGB(60, 55, 70);
	wheelDisplay.Text = "🎰";
	wheelDisplay.TextSize = 64;
	wheelDisplay.Parent = panel;
	
	const displayCorner = new Instance("UICorner");
	displayCorner.CornerRadius = new UDim(0, 12);
	displayCorner.Parent = wheelDisplay;
	
	// Result text
	const resultText = new Instance("TextLabel");
	resultText.Name = "Result";
	resultText.Size = new UDim2(1, 0, 0, 30);
	resultText.Position = new UDim2(0, 0, 0, 155);
	resultText.BackgroundTransparency = 1;
	resultText.Text = "";
	resultText.TextColor3 = Color3.fromRGB(255, 255, 255);
	resultText.TextSize = 18;
	resultText.Font = Enum.Font.GothamBold;
	resultText.Parent = panel;
	
	// Free spin button
	const freeSpinBtn = new Instance("TextButton");
	freeSpinBtn.Name = "FreeSpin";
	freeSpinBtn.Size = new UDim2(0, 120, 0, 40);
	freeSpinBtn.Position = new UDim2(0.25, -60, 0, 195);
	freeSpinBtn.BackgroundColor3 = Color3.fromRGB(80, 200, 80);
	freeSpinBtn.Text = "FREE SPIN!";
	freeSpinBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	freeSpinBtn.TextSize = 14;
	freeSpinBtn.Font = Enum.Font.GothamBold;
	freeSpinBtn.Parent = panel;
	
	const freeCorner = new Instance("UICorner");
	freeCorner.CornerRadius = new UDim(0, 10);
	freeCorner.Parent = freeSpinBtn;
	
	// Paid spin button
	const paidSpinBtn = new Instance("TextButton");
	paidSpinBtn.Name = "PaidSpin";
	paidSpinBtn.Size = new UDim2(0, 120, 0, 40);
	paidSpinBtn.Position = new UDim2(0.75, -60, 0, 195);
	paidSpinBtn.BackgroundColor3 = Color3.fromRGB(255, 180, 50);
	paidSpinBtn.Text = "🪙 25 SPIN";
	paidSpinBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	paidSpinBtn.TextSize = 14;
	paidSpinBtn.Font = Enum.Font.GothamBold;
	paidSpinBtn.Parent = panel;
	
	const paidCorner = new Instance("UICorner");
	paidCorner.CornerRadius = new UDim(0, 10);
	paidCorner.Parent = paidSpinBtn;
	
	// Timer text
	const timerText = new Instance("TextLabel");
	timerText.Name = "Timer";
	timerText.Size = new UDim2(1, 0, 0, 25);
	timerText.Position = new UDim2(0, 0, 0, 240);
	timerText.BackgroundTransparency = 1;
	timerText.Text = "";
	timerText.TextColor3 = Color3.fromRGB(150, 150, 150);
	timerText.TextSize = 12;
	timerText.Font = Enum.Font.Gotham;
	timerText.Parent = panel;
	
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
	
	// Functions
	let isSpinning = false;
	
	const refreshInfo = () => {
		const infoRemote = ReplicatedStorage.FindFirstChild("GetSpinInfo") as RemoteFunction | undefined;
		if (!infoRemote) return;
		
		const info = infoRemote.InvokeServer() as { canFreeSpin: boolean; nextFreeIn: number; spinCost: number };
		
		freeSpinBtn.Visible = info.canFreeSpin;
		if (!info.canFreeSpin) {
			const mins = math.floor(info.nextFreeIn / 60);
			const secs = info.nextFreeIn % 60;
			timerText.Text = `Next free spin in: ${mins}:${string.format("%02d", secs)}`;
		} else {
			timerText.Text = "Free spin available!";
		}
	};
	
	const spin = (useFree: boolean) => {
		if (isSpinning) return;
		isSpinning = true;
		
		const spinRemote = ReplicatedStorage.FindFirstChild("SpinWheel") as RemoteFunction | undefined;
		if (!spinRemote) {
			isSpinning = false;
			return;
		}
		
		// Spinning animation
		resultText.Text = "Spinning...";
		const symbols = ["🎰", "💎", "⭐", "🪙", "🎁", "👑"];
		for (let i = 0; i < 15; i++) {
			wheelDisplay.Text = symbols[math.floor(math.random() * symbols.size())];
			wait(0.1);
		}
		
		// Get result
		const result = spinRemote.InvokeServer(useFree) as { success: boolean; message?: string; prize?: string; value?: number; colorR?: number; colorG?: number; colorB?: number };
		
		if (result.success && result.prize) {
			wheelDisplay.Text = "🎉";
			resultText.Text = `Won: ${result.prize}!`;
			resultText.TextColor3 = Color3.fromRGB(result.colorR ?? 255, result.colorG ?? 255, result.colorB ?? 255);
		} else {
			resultText.Text = result.message ?? "Failed!";
			resultText.TextColor3 = Color3.fromRGB(255, 100, 100);
		}
		
		refreshInfo();
		isSpinning = false;
	};
	
	// Toggle
	wheelBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) {
			refreshInfo();
		}
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	freeSpinBtn.MouseButton1Click.Connect(() => spin(true));
	paidSpinBtn.MouseButton1Click.Connect(() => spin(false));
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🎡 Lucky wheel UI ready!");
}
