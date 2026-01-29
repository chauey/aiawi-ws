// Panel System - Reusable panel/popup creation
// Creates consistent, styled panels across all UIs

export interface PanelConfig {
	name: string;
	title: string;
	titleEmoji?: string;
	size: UDim2;
	position?: UDim2;
	backgroundColor?: Color3;
	titleColor?: Color3;
	closeable?: boolean;
}

export interface PanelResult {
	screenGui: ScreenGui;
	panel: Frame;
	titleLabel: TextLabel;
	closeBtn?: TextButton;
	contentFrame: Frame;
}

export function createPanel(config: PanelConfig, parent: PlayerGui): PanelResult {
	// Defaults
	const bgColor = config.backgroundColor ?? Color3.fromRGB(35, 40, 55);
	const titleColor = config.titleColor ?? Color3.fromRGB(255, 255, 255);
	const position = config.position ?? new UDim2(0.5, -config.size.X.Offset / 2, 0.5, -config.size.Y.Offset / 2);
	
	// ScreenGui
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = `${config.name}UI`;
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 100;
	
	// Panel
	const panel = new Instance("Frame");
	panel.Name = `${config.name}Panel`;
	panel.Size = config.size;
	panel.Position = position;
	panel.BackgroundColor3 = bgColor;
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	const panelStroke = new Instance("UIStroke");
	panelStroke.Color = Color3.fromRGB(80, 100, 140);
	panelStroke.Thickness = 2;
	panelStroke.Parent = panel;
	
	// Title
	const titleText = config.titleEmoji 
		? `${config.titleEmoji} ${config.title} ${config.titleEmoji}`
		: config.title;
		
	const titleLabel = new Instance("TextLabel");
	titleLabel.Name = "Title";
	titleLabel.Size = new UDim2(1, 0, 0, 45);
	titleLabel.BackgroundTransparency = 1;
	titleLabel.Text = titleText;
	titleLabel.TextColor3 = titleColor;
	titleLabel.TextSize = 20;
	titleLabel.Font = Enum.Font.GothamBold;
	titleLabel.Parent = panel;
	
	// Close button
	let closeBtn: TextButton | undefined;
	if (config.closeable !== false) {
		closeBtn = new Instance("TextButton");
		closeBtn.Name = "CloseBtn";
		closeBtn.Size = new UDim2(0, 30, 0, 30);
		closeBtn.Position = new UDim2(1, -35, 0, 8);
		closeBtn.BackgroundTransparency = 1;
		closeBtn.Text = "X";
		closeBtn.TextColor3 = Color3.fromRGB(200, 200, 200);
		closeBtn.TextSize = 18;
		closeBtn.Font = Enum.Font.GothamBold;
		closeBtn.Parent = panel;
		
		closeBtn.MouseButton1Click.Connect(() => {
			panel.Visible = false;
		});
	}
	
	// Content frame
	const contentFrame = new Instance("Frame");
	contentFrame.Name = "Content";
	contentFrame.Size = new UDim2(1, -20, 1, -55);
	contentFrame.Position = new UDim2(0, 10, 0, 50);
	contentFrame.BackgroundTransparency = 1;
	contentFrame.Parent = panel;
	
	screenGui.Parent = parent;
	
	return { screenGui, panel, titleLabel, closeBtn, contentFrame };
}

export function togglePanel(panel: Frame) {
	panel.Visible = !panel.Visible;
}
