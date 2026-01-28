// Bottom Action Bar - Unified premium action bar for main gameplay features
import { Players, TweenService } from "@rbxts/services";
import { getActionBarFeatures } from "shared/featureRegistry";

const player = Players.LocalPlayer;

// Get action bar features from registry
const ACTION_BUTTONS = getActionBarFeatures();

// Store callbacks for button clicks
const buttonCallbacks = new Map<string, () => void>();

export function registerActionCallback(id: string, callback: () => void) {
	buttonCallbacks.set(id, callback);
}

export function createBottomActionBar() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "BottomActionBar";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 200; // High priority, always on top
	
	// Main container - bottom center
	const container = new Instance("Frame");
	container.Name = "ActionBarContainer";
	container.Size = new UDim2(0, ACTION_BUTTONS.size() * 58 + 20, 0, 60);
	container.Position = new UDim2(0.5, -(ACTION_BUTTONS.size() * 58 + 20) / 2, 1, -70);
	container.BackgroundColor3 = Color3.fromRGB(20, 25, 40);
	container.BackgroundTransparency = 0.15;
	container.Parent = screenGui;
	
	// Glass effect
	const containerCorner = new Instance("UICorner");
	containerCorner.CornerRadius = new UDim(0, 16);
	containerCorner.Parent = container;
	
	const containerStroke = new Instance("UIStroke");
	containerStroke.Color = Color3.fromRGB(80, 100, 140);
	containerStroke.Transparency = 0.5;
	containerStroke.Thickness = 1.5;
	containerStroke.Parent = container;
	
	// Gradient
	const containerGradient = new Instance("UIGradient");
	containerGradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(40, 50, 70)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(25, 30, 45)),
	]);
	containerGradient.Rotation = 90;
	containerGradient.Parent = container;
	
	// Layout for buttons
	const layout = new Instance("UIListLayout");
	layout.FillDirection = Enum.FillDirection.Horizontal;
	layout.HorizontalAlignment = Enum.HorizontalAlignment.Center;
	layout.VerticalAlignment = Enum.VerticalAlignment.Center;
	layout.Padding = new UDim(0, 6);
	layout.Parent = container;
	
	const padding = new Instance("UIPadding");
	padding.PaddingLeft = new UDim(0, 10);
	padding.PaddingRight = new UDim(0, 10);
	padding.Parent = container;
	
	// Create buttons
	for (const btn of ACTION_BUTTONS) {
		createActionButton(container, btn);
	}
	
	// Add to player GUI
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🎮 Bottom Action Bar ready!");
}

function createActionButton(
	parent: Frame, 
	config: { id: string; icon: string; name: string; color: Color3 }
) {
	const button = new Instance("TextButton");
	button.Name = config.id;
	button.Size = new UDim2(0, 52, 0, 48);
	button.BackgroundColor3 = config.color;
	button.Text = "";
	button.AutoButtonColor = false;
	button.Parent = parent;
	
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 12);
	corner.Parent = button;
	
	// Gradient
	const gradient = new Instance("UIGradient");
	const r = config.color.R * 255;
	const g = config.color.G * 255;
	const b = config.color.B * 255;
	gradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(math.min(255, r + 30), math.min(255, g + 30), math.min(255, b + 30))),
		new ColorSequenceKeypoint(1, Color3.fromRGB(math.max(0, r - 20), math.max(0, g - 20), math.max(0, b - 20))),
	]);
	gradient.Rotation = 90;
	gradient.Parent = button;
	
	// Stroke
	const stroke = new Instance("UIStroke");
	stroke.Color = Color3.fromRGB(
		math.min(255, r + 60), 
		math.min(255, g + 60), 
		math.min(255, b + 60)
	);
	stroke.Transparency = 0.6;
	stroke.Thickness = 1;
	stroke.Parent = button;
	
	// Icon - positioned to fit inside button
	const icon = new Instance("TextLabel");
	icon.Size = new UDim2(1, 0, 0, 22);
	icon.Position = new UDim2(0, 0, 0, 4);
	icon.BackgroundTransparency = 1;
	icon.Text = config.icon;
	icon.TextSize = 18;
	icon.Parent = button;
	
	// Label - at bottom of button
	const label = new Instance("TextLabel");
	label.Size = new UDim2(1, 0, 0, 16);
	label.Position = new UDim2(0, 0, 1, -18);
	label.BackgroundTransparency = 1;
	label.Text = config.name;
	label.TextColor3 = new Color3(1, 1, 1);
	label.TextSize = 9;
	label.Font = Enum.Font.GothamBold;
	label.Parent = button;
	
	// Hover effects
	button.MouseEnter.Connect(() => {
		TweenService.Create(button, new TweenInfo(0.12), { 
			Size: new UDim2(0, 56, 0, 52),
		}).Play();
		stroke.Transparency = 0.2;
	});
	
	button.MouseLeave.Connect(() => {
		TweenService.Create(button, new TweenInfo(0.12), { 
			Size: new UDim2(0, 52, 0, 48),
		}).Play();
		stroke.Transparency = 0.6;
	});
	
	// Click handler
	button.MouseButton1Click.Connect(() => {
		// Press animation
		TweenService.Create(button, new TweenInfo(0.05), { 
			Size: new UDim2(0, 48, 0, 44),
		}).Play();
		task.delay(0.05, () => {
			TweenService.Create(button, new TweenInfo(0.1), { 
				Size: new UDim2(0, 52, 0, 48),
			}).Play();
		});
		
		// Call registered callback
		const callback = buttonCallbacks.get(config.id);
		if (callback) {
			callback();
		}
	});
}
