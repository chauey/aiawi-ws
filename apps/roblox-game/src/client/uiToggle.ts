// UI Toggle System - Hamburger menu for mobile
// Toggles visibility of left menu buttons and action bar
import { Players, TweenService } from "@rbxts/services";

const player = Players.LocalPlayer;

let isUIExpanded = true;

// UI elements to toggle
const toggleableUIs = [
	"DailyRewardsUI",
	"QuestUI",
	"CodesUI",
	"VIPUI", 
	"ClansUI",
	"PrivateServerUI",
	"BottomActionBar",
	"PetSelectionUI",
];

export function createUIToggle() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "UIToggle";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 300; // Always on top
	
	// Hamburger menu button - top left
	const toggleBtn = new Instance("TextButton");
	toggleBtn.Name = "ToggleBtn";
	toggleBtn.Size = new UDim2(0, 40, 0, 40);
	toggleBtn.Position = new UDim2(0, 10, 0, 10);
	toggleBtn.BackgroundColor3 = Color3.fromRGB(40, 45, 60);
	toggleBtn.Text = "☰";
	toggleBtn.TextColor3 = new Color3(1, 1, 1);
	toggleBtn.TextSize = 24;
	toggleBtn.Font = Enum.Font.GothamBold;
	toggleBtn.Parent = screenGui;
	
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 10);
	corner.Parent = toggleBtn;
	
	const stroke = new Instance("UIStroke");
	stroke.Color = Color3.fromRGB(80, 100, 140);
	stroke.Thickness = 2;
	stroke.Parent = toggleBtn;
	
	// Tooltip
	const tooltip = new Instance("TextLabel");
	tooltip.Name = "Tooltip";
	tooltip.Size = new UDim2(0, 80, 0, 20);
	tooltip.Position = new UDim2(1, 5, 0.5, -10);
	tooltip.BackgroundColor3 = Color3.fromRGB(30, 35, 50);
	tooltip.Text = "Hide UI";
	tooltip.TextColor3 = Color3.fromRGB(200, 200, 200);
	tooltip.TextSize = 11;
	tooltip.Font = Enum.Font.Gotham;
	tooltip.Visible = false;
	tooltip.Parent = toggleBtn;
	
	const tooltipCorner = new Instance("UICorner");
	tooltipCorner.CornerRadius = new UDim(0, 6);
	tooltipCorner.Parent = tooltip;
	
	// Hover effects
	toggleBtn.MouseEnter.Connect(() => {
		tooltip.Visible = true;
		TweenService.Create(toggleBtn, new TweenInfo(0.1), {
			BackgroundColor3: Color3.fromRGB(60, 70, 90),
		}).Play();
	});
	
	toggleBtn.MouseLeave.Connect(() => {
		tooltip.Visible = false;
		TweenService.Create(toggleBtn, new TweenInfo(0.1), {
			BackgroundColor3: Color3.fromRGB(40, 45, 60),
		}).Play();
	});
	
	// Toggle click
	toggleBtn.MouseButton1Click.Connect(() => {
		isUIExpanded = !isUIExpanded;
		toggleBtn.Text = isUIExpanded ? "☰" : "▶";
		tooltip.Text = isUIExpanded ? "Hide UI" : "Show UI";
		
		toggleAllUI(isUIExpanded);
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("📱 UI Toggle ready!");
}

function toggleAllUI(show: boolean) {
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	
	for (const uiName of toggleableUIs) {
		const ui = playerGui.FindFirstChild(uiName) as ScreenGui | undefined;
		if (ui) {
			// Animate fade
			for (const child of ui.GetDescendants()) {
				if (child.IsA("Frame") || child.IsA("TextButton") || child.IsA("TextLabel")) {
					const target = child as Frame | TextButton | TextLabel;
					// Only toggle first-level children (buttons, not panels)
					if (target.Parent === ui || target.Name.match("Btn") || target.Name.match("Container") || target.Name.match("Bar")) {
						TweenService.Create(target, new TweenInfo(0.2), {
							BackgroundTransparency: show ? 0 : 1,
						}).Play();
						target.Visible = show;
					}
				}
			}
		}
	}
}

export function isUIVisible(): boolean {
	return isUIExpanded;
}
