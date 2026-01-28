// Events UI - Show active events with countdown timer
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

export function createEventsUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "EventsUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 93;
	
	// Event banner (top of screen)
	const banner = new Instance("Frame");
	banner.Name = "EventBanner";
	banner.Size = new UDim2(0, 350, 0, 45);
	banner.Position = new UDim2(0.5, -175, 0, 5);
	banner.BackgroundColor3 = Color3.fromRGB(255, 100, 50);
	banner.Visible = false;
	banner.Parent = screenGui;
	
	const bannerCorner = new Instance("UICorner");
	bannerCorner.CornerRadius = new UDim(0, 12);
	bannerCorner.Parent = banner;
	
	const bannerGradient = new Instance("UIGradient");
	bannerGradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(255, 100, 50)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(255, 50, 100)),
	]);
	bannerGradient.Parent = banner;
	
	const bannerText = new Instance("TextLabel");
	bannerText.Name = "BannerText";
	bannerText.Size = new UDim2(1, 0, 1, 0);
	bannerText.BackgroundTransparency = 1;
	bannerText.Text = "🎉 EVENT ACTIVE!";
	bannerText.TextColor3 = Color3.fromRGB(255, 255, 255);
	bannerText.TextSize = 18;
	bannerText.Font = Enum.Font.GothamBold;
	bannerText.Parent = banner;
	
	// Event popup notification
	const popup = new Instance("Frame");
	popup.Name = "EventPopup";
	popup.Size = new UDim2(0, 300, 0, 150);
	popup.Position = new UDim2(0.5, -150, 0.3, 0);
	popup.BackgroundColor3 = Color3.fromRGB(50, 30, 60);
	popup.Visible = false;
	popup.Parent = screenGui;
	
	const popupCorner = new Instance("UICorner");
	popupCorner.CornerRadius = new UDim(0, 16);
	popupCorner.Parent = popup;
	
	const popupTitle = new Instance("TextLabel");
	popupTitle.Name = "Title";
	popupTitle.Size = new UDim2(1, 0, 0, 50);
	popupTitle.BackgroundTransparency = 1;
	popupTitle.Text = "🎉 EVENT";
	popupTitle.TextColor3 = Color3.fromRGB(255, 200, 100);
	popupTitle.TextSize = 24;
	popupTitle.Font = Enum.Font.GothamBold;
	popupTitle.Parent = popup;
	
	const popupDesc = new Instance("TextLabel");
	popupDesc.Name = "Desc";
	popupDesc.Size = new UDim2(1, 0, 0, 40);
	popupDesc.Position = new UDim2(0, 0, 0, 50);
	popupDesc.BackgroundTransparency = 1;
	popupDesc.Text = "Event description";
	popupDesc.TextColor3 = Color3.fromRGB(220, 220, 220);
	popupDesc.TextSize = 16;
	popupDesc.Font = Enum.Font.Gotham;
	popupDesc.Parent = popup;
	
	const popupClose = new Instance("TextButton");
	popupClose.Size = new UDim2(0, 100, 0, 35);
	popupClose.Position = new UDim2(0.5, -50, 1, -45);
	popupClose.BackgroundColor3 = Color3.fromRGB(80, 150, 80);
	popupClose.Text = "AWESOME!";
	popupClose.TextColor3 = Color3.fromRGB(255, 255, 255);
	popupClose.TextSize = 14;
	popupClose.Font = Enum.Font.GothamBold;
	popupClose.Parent = popup;
	
	const closeCorner = new Instance("UICorner");
	closeCorner.CornerRadius = new UDim(0, 10);
	closeCorner.Parent = popupClose;
	
	popupClose.MouseButton1Click.Connect(() => {
		popup.Visible = false;
	});
	
	// Check for active events
	const checkEvents = () => {
		const remote = ReplicatedStorage.FindFirstChild("GetActiveEvents") as RemoteFunction | undefined;
		if (!remote) return;
		
		const events = remote.InvokeServer() as { name: string; description: string; bonusMultiplier: number }[];
		
		if (events.size() > 0) {
			const event = events[0];
			banner.Visible = true;
			bannerText.Text = `${event.name} - ${event.bonusMultiplier}x COINS!`;
		} else {
			banner.Visible = false;
		}
	};
	
	// Listen for event notifications
	const notifyRemote = ReplicatedStorage.WaitForChild("EventNotify", 10) as RemoteEvent | undefined;
	if (notifyRemote) {
		notifyRemote.OnClientEvent.Connect((name: string, description: string, emoji: string) => {
			popupTitle.Text = `${emoji} ${name}`;
			popupDesc.Text = description;
			popup.Visible = true;
		});
	}
	
	// Initial check
	wait(2);
	checkEvents();
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🎉 Events UI ready!");
}
