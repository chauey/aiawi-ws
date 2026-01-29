// Action Bar - Bottom navigation bar for games
// Configurable buttons with icons and callbacks

export interface ActionButton {
	id: string;
	icon: string;
	label: string;
	color: Color3;
	enabled?: boolean;
}

export interface ActionBarConfig {
	buttons: ActionButton[];
	position?: UDim2;
	buttonSize?: number;
	spacing?: number;
}

const actionCallbacks = new Map<string, () => void>();

export function registerActionCallback(actionId: string, callback: () => void) {
	actionCallbacks.set(actionId, callback);
}

export function createActionBar(config: ActionBarConfig, parent: PlayerGui): ScreenGui {
	const enabledButtons = config.buttons.filter(b => b.enabled !== false);
	const buttonSize = config.buttonSize ?? 60;
	const spacing = config.spacing ?? 8;
	const totalWidth = enabledButtons.size() * buttonSize + (enabledButtons.size() - 1) * spacing;
	
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "BottomActionBar";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 200;
	
	// Container
	const container = new Instance("Frame");
	container.Name = "ActionBarContainer";
	container.Size = new UDim2(0, totalWidth + 20, 0, buttonSize + 20);
	container.Position = config.position ?? new UDim2(0.5, -totalWidth / 2 - 10, 1, -buttonSize - 30);
	container.BackgroundColor3 = Color3.fromRGB(20, 25, 35);
	container.BackgroundTransparency = 0.3;
	container.Parent = screenGui;
	
	const containerCorner = new Instance("UICorner");
	containerCorner.CornerRadius = new UDim(0, 16);
	containerCorner.Parent = container;
	
	const containerStroke = new Instance("UIStroke");
	containerStroke.Color = Color3.fromRGB(60, 80, 120);
	containerStroke.Thickness = 2;
	containerStroke.Parent = container;
	
	// Buttons
	for (let i = 0; i < enabledButtons.size(); i++) {
		const btn = enabledButtons[i];
		const xPos = 10 + i * (buttonSize + spacing);
		
		const button = new Instance("TextButton");
		button.Name = `${btn.id}Btn`;
		button.Size = new UDim2(0, buttonSize, 0, buttonSize);
		button.Position = new UDim2(0, xPos, 0, 10);
		button.BackgroundColor3 = btn.color;
		button.Text = "";
		button.Parent = container;
		
		const btnCorner = new Instance("UICorner");
		btnCorner.CornerRadius = new UDim(0, 12);
		btnCorner.Parent = button;
		
		// Icon
		const icon = new Instance("TextLabel");
		icon.Name = "Icon";
		icon.Size = new UDim2(1, 0, 0, buttonSize * 0.6);
		icon.Position = new UDim2(0, 0, 0, 4);
		icon.BackgroundTransparency = 1;
		icon.Text = btn.icon;
		icon.TextSize = buttonSize * 0.4;
		icon.Parent = button;
		
		// Label
		const label = new Instance("TextLabel");
		label.Name = "Label";
		label.Size = new UDim2(1, 0, 0, 14);
		label.Position = new UDim2(0, 0, 1, -18);
		label.BackgroundTransparency = 1;
		label.Text = btn.label;
		label.TextColor3 = new Color3(1, 1, 1);
		label.TextSize = 10;
		label.Font = Enum.Font.GothamBold;
		label.Parent = button;
		
		// Click handler
		button.MouseButton1Click.Connect(() => {
			const callback = actionCallbacks.get(btn.id);
			if (callback) callback();
		});
	}
	
	screenGui.Parent = parent;
	return screenGui;
}
