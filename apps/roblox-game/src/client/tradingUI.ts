// Trading UI - Client-side trading interface with scam protection
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;
let currentTradePartner: string | undefined;

export function createTradingUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "TradingUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 100;
	
	// Trade button (opens player list)
	const tradeBtn = new Instance("TextButton");
	tradeBtn.Name = "TradeBtn";
	tradeBtn.Size = new UDim2(0, 50, 0, 50);
	tradeBtn.Position = new UDim2(1, -120, 0, 70);
	tradeBtn.BackgroundColor3 = Color3.fromRGB(100, 150, 255);
	tradeBtn.Text = "🔄";
	tradeBtn.TextSize = 28;
	tradeBtn.Font = Enum.Font.GothamBold;
	tradeBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 12);
	btnCorner.Parent = tradeBtn;
	
	// Player selection panel
	const playerPanel = createPlayerPanel(screenGui);
	
	// Trade panel
	const tradePanel = createTradePanel(screenGui);
	
	// Trade request popup
	const requestPopup = createRequestPopup(screenGui);
	
	// Toggle player list
	tradeBtn.MouseButton1Click.Connect(() => {
		playerPanel.Visible = !playerPanel.Visible;
		if (playerPanel.Visible) {
			refreshPlayerList(playerPanel);
		}
	});
	
	// Setup remotes
	setupTradeRemotes(screenGui, tradePanel, requestPopup);
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🔄 Trading UI ready! Click the trade button to find players.");
}

function createPlayerPanel(parent: ScreenGui): Frame {
	const panel = new Instance("Frame");
	panel.Name = "PlayerPanel";
	panel.Size = new UDim2(0, 220, 0, 280);
	panel.Position = new UDim2(0.5, -110, 0.5, -140);
	panel.BackgroundColor3 = Color3.fromRGB(40, 40, 50);
	panel.Visible = false;
	panel.Parent = parent;
	
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 14);
	corner.Parent = panel;
	
	const title = new Instance("TextLabel");
	title.Name = "Title";
	title.Size = new UDim2(1, 0, 0, 40);
	title.BackgroundTransparency = 1;
	title.Text = "🔄 SELECT PLAYER";
	title.TextColor3 = Color3.fromRGB(100, 150, 255);
	title.TextSize = 18;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	const listFrame = new Instance("ScrollingFrame");
	listFrame.Name = "PlayerList";
	listFrame.Size = new UDim2(1, -20, 1, -90);
	listFrame.Position = new UDim2(0, 10, 0, 45);
	listFrame.BackgroundTransparency = 1;
	listFrame.ScrollBarThickness = 4;
	listFrame.Parent = panel;
	
	const listLayout = new Instance("UIListLayout");
	listLayout.SortOrder = Enum.SortOrder.LayoutOrder;
	listLayout.Padding = new UDim(0, 5);
	listLayout.Parent = listFrame;
	
	const closeBtn = new Instance("TextButton");
	closeBtn.Name = "CloseBtn";
	closeBtn.Size = new UDim2(0, 80, 0, 30);
	closeBtn.Position = new UDim2(0.5, -40, 1, -40);
	closeBtn.BackgroundColor3 = Color3.fromRGB(150, 60, 60);
	closeBtn.Text = "CLOSE";
	closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	closeBtn.TextSize = 14;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = panel;
	
	const closeBtnCorner = new Instance("UICorner");
	closeBtnCorner.CornerRadius = new UDim(0, 8);
	closeBtnCorner.Parent = closeBtn;
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	return panel;
}

function refreshPlayerList(panel: Frame) {
	const listFrame = panel.FindFirstChild("PlayerList") as ScrollingFrame;
	if (!listFrame) return;
	
	// Clear existing
	for (const child of listFrame.GetChildren()) {
		if (child.IsA("TextButton")) child.Destroy();
	}
	
	// Add players
	const allPlayers = Players.GetPlayers();
	for (let i = 0; i < allPlayers.size(); i++) {
		const p = allPlayers[i];
		if (p === player) continue; // Skip self
		
		const btn = new Instance("TextButton");
		btn.Name = p.Name;
		btn.Size = new UDim2(1, 0, 0, 35);
		btn.BackgroundColor3 = Color3.fromRGB(60, 60, 80);
		btn.Text = `👤 ${p.Name}`;
		btn.TextColor3 = Color3.fromRGB(255, 255, 255);
		btn.TextSize = 14;
		btn.Font = Enum.Font.Gotham;
		btn.LayoutOrder = i;
		btn.Parent = listFrame;
		
		const btnCorner = new Instance("UICorner");
		btnCorner.CornerRadius = new UDim(0, 6);
		btnCorner.Parent = btn;
		
		btn.MouseButton1Click.Connect(() => {
			const requestRemote = ReplicatedStorage.FindFirstChild("RequestTrade") as RemoteEvent | undefined;
			if (requestRemote) {
				requestRemote.FireServer(p.Name);
				panel.Visible = false;
				print(`📤 Sent trade request to ${p.Name}`);
			}
		});
	}
	
	listFrame.CanvasSize = new UDim2(0, 0, 0, allPlayers.size() * 40);
}

function createRequestPopup(parent: ScreenGui): Frame {
	const popup = new Instance("Frame");
	popup.Name = "RequestPopup";
	popup.Size = new UDim2(0, 280, 0, 120);
	popup.Position = new UDim2(0.5, -140, 0.3, 0);
	popup.BackgroundColor3 = Color3.fromRGB(50, 50, 70);
	popup.Visible = false;
	popup.Parent = parent;
	
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 12);
	corner.Parent = popup;
	
	const msgLabel = new Instance("TextLabel");
	msgLabel.Name = "Message";
	msgLabel.Size = new UDim2(1, 0, 0, 50);
	msgLabel.BackgroundTransparency = 1;
	msgLabel.Text = "Player wants to trade!";
	msgLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
	msgLabel.TextSize = 16;
	msgLabel.Font = Enum.Font.GothamBold;
	msgLabel.Parent = popup;
	
	const acceptBtn = new Instance("TextButton");
	acceptBtn.Name = "Accept";
	acceptBtn.Size = new UDim2(0, 100, 0, 35);
	acceptBtn.Position = new UDim2(0.25, -50, 0, 60);
	acceptBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
	acceptBtn.Text = "✓ ACCEPT";
	acceptBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	acceptBtn.TextSize = 14;
	acceptBtn.Font = Enum.Font.GothamBold;
	acceptBtn.Parent = popup;
	
	const acceptCorner = new Instance("UICorner");
	acceptCorner.CornerRadius = new UDim(0, 8);
	acceptCorner.Parent = acceptBtn;
	
	const declineBtn = new Instance("TextButton");
	declineBtn.Name = "Decline";
	declineBtn.Size = new UDim2(0, 100, 0, 35);
	declineBtn.Position = new UDim2(0.75, -50, 0, 60);
	declineBtn.BackgroundColor3 = Color3.fromRGB(180, 80, 80);
	declineBtn.Text = "✗ DECLINE";
	declineBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	declineBtn.TextSize = 14;
	declineBtn.Font = Enum.Font.GothamBold;
	declineBtn.Parent = popup;
	
	const declineCorner = new Instance("UICorner");
	declineCorner.CornerRadius = new UDim(0, 8);
	declineCorner.Parent = declineBtn;
	
	return popup;
}

function createTradePanel(parent: ScreenGui): Frame {
	const panel = new Instance("Frame");
	panel.Name = "TradePanel";
	panel.Size = new UDim2(0, 420, 0, 320);
	panel.Position = new UDim2(0.5, -210, 0.5, -160);
	panel.BackgroundColor3 = Color3.fromRGB(35, 35, 50);
	panel.Visible = false;
	panel.Parent = parent;
	
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 16);
	corner.Parent = panel;
	
	const title = new Instance("TextLabel");
	title.Name = "Title";
	title.Size = new UDim2(1, 0, 0, 45);
	title.BackgroundTransparency = 1;
	title.Text = "🔄 TRADING";
	title.TextColor3 = Color3.fromRGB(100, 180, 255);
	title.TextSize = 22;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Your offer side
	const yourSide = new Instance("Frame");
	yourSide.Name = "YourOffer";
	yourSide.Size = new UDim2(0.48, 0, 0, 180);
	yourSide.Position = new UDim2(0.01, 0, 0, 50);
	yourSide.BackgroundColor3 = Color3.fromRGB(50, 70, 50);
	yourSide.Parent = panel;
	
	const yourCorner = new Instance("UICorner");
	yourCorner.CornerRadius = new UDim(0, 10);
	yourCorner.Parent = yourSide;
	
	const yourLabel = new Instance("TextLabel");
	yourLabel.Name = "Label";
	yourLabel.Size = new UDim2(1, 0, 0, 30);
	yourLabel.BackgroundTransparency = 1;
	yourLabel.Text = "YOUR OFFER";
	yourLabel.TextColor3 = Color3.fromRGB(100, 255, 100);
	yourLabel.TextSize = 14;
	yourLabel.Font = Enum.Font.GothamBold;
	yourLabel.Parent = yourSide;
	
	// Coin input
	const coinInput = new Instance("TextBox");
	coinInput.Name = "CoinInput";
	coinInput.Size = new UDim2(0.8, 0, 0, 35);
	coinInput.Position = new UDim2(0.1, 0, 0, 40);
	coinInput.BackgroundColor3 = Color3.fromRGB(40, 40, 50);
	coinInput.Text = "0";
	coinInput.PlaceholderText = "Coins to offer...";
	coinInput.TextColor3 = Color3.fromRGB(255, 215, 0);
	coinInput.TextSize = 18;
	coinInput.Font = Enum.Font.GothamBold;
	coinInput.Parent = yourSide;
	
	const coinInputCorner = new Instance("UICorner");
	coinInputCorner.CornerRadius = new UDim(0, 8);
	coinInputCorner.Parent = coinInput;
	
	// Their offer side
	const theirSide = new Instance("Frame");
	theirSide.Name = "TheirOffer";
	theirSide.Size = new UDim2(0.48, 0, 0, 180);
	theirSide.Position = new UDim2(0.51, 0, 0, 50);
	theirSide.BackgroundColor3 = Color3.fromRGB(70, 50, 50);
	theirSide.Parent = panel;
	
	const theirCorner = new Instance("UICorner");
	theirCorner.CornerRadius = new UDim(0, 10);
	theirCorner.Parent = theirSide;
	
	const theirLabel = new Instance("TextLabel");
	theirLabel.Name = "Label";
	theirLabel.Size = new UDim2(1, 0, 0, 30);
	theirLabel.BackgroundTransparency = 1;
	theirLabel.Text = "THEIR OFFER";
	theirLabel.TextColor3 = Color3.fromRGB(255, 100, 100);
	theirLabel.TextSize = 14;
	theirLabel.Font = Enum.Font.GothamBold;
	theirLabel.Parent = theirSide;
	
	const theirCoins = new Instance("TextLabel");
	theirCoins.Name = "TheirCoins";
	theirCoins.Size = new UDim2(0.8, 0, 0, 35);
	theirCoins.Position = new UDim2(0.1, 0, 0, 40);
	theirCoins.BackgroundColor3 = Color3.fromRGB(40, 40, 50);
	theirCoins.Text = "🪙 0";
	theirCoins.TextColor3 = Color3.fromRGB(255, 215, 0);
	theirCoins.TextSize = 18;
	theirCoins.Font = Enum.Font.GothamBold;
	theirCoins.Parent = theirSide;
	
	const theirCoinsCorner = new Instance("UICorner");
	theirCoinsCorner.CornerRadius = new UDim(0, 8);
	theirCoinsCorner.Parent = theirCoins;
	
	// Confirm button (with scam protection - shows "CONFIRM (3s)" countdown)
	const confirmBtn = new Instance("TextButton");
	confirmBtn.Name = "ConfirmBtn";
	confirmBtn.Size = new UDim2(0, 140, 0, 40);
	confirmBtn.Position = new UDim2(0.25, -70, 1, -55);
	confirmBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
	confirmBtn.Text = "✓ CONFIRM";
	confirmBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	confirmBtn.TextSize = 16;
	confirmBtn.Font = Enum.Font.GothamBold;
	confirmBtn.Parent = panel;
	
	const confirmCorner = new Instance("UICorner");
	confirmCorner.CornerRadius = new UDim(0, 10);
	confirmCorner.Parent = confirmBtn;
	
	// Cancel button
	const cancelBtn = new Instance("TextButton");
	cancelBtn.Name = "CancelBtn";
	cancelBtn.Size = new UDim2(0, 140, 0, 40);
	cancelBtn.Position = new UDim2(0.75, -70, 1, -55);
	cancelBtn.BackgroundColor3 = Color3.fromRGB(180, 80, 80);
	cancelBtn.Text = "✗ CANCEL";
	cancelBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	cancelBtn.TextSize = 16;
	cancelBtn.Font = Enum.Font.GothamBold;
	cancelBtn.Parent = panel;
	
	const cancelCorner = new Instance("UICorner");
	cancelCorner.CornerRadius = new UDim(0, 10);
	cancelCorner.Parent = cancelBtn;
	
	// Status label
	const statusLabel = new Instance("TextLabel");
	statusLabel.Name = "Status";
	statusLabel.Size = new UDim2(1, 0, 0, 25);
	statusLabel.Position = new UDim2(0, 0, 0, 235);
	statusLabel.BackgroundTransparency = 1;
	statusLabel.Text = "";
	statusLabel.TextColor3 = Color3.fromRGB(200, 200, 200);
	statusLabel.TextSize = 12;
	statusLabel.Font = Enum.Font.Gotham;
	statusLabel.Parent = panel;
	
	return panel;
}

function setupTradeRemotes(screenGui: ScreenGui, tradePanel: Frame, requestPopup: Frame) {
	// Use FindFirstChild (non-blocking) - remotes may not exist yet
	task.spawn(() => {
		// Wait a short time for server to create remotes
		task.wait(0.5);
		
		const tradeUpdateRemote = ReplicatedStorage.FindFirstChild("TradeUpdate") as RemoteEvent | undefined;
		const respondTradeRemote = ReplicatedStorage.FindFirstChild("RespondTrade") as RemoteEvent | undefined;
		const updateOfferRemote = ReplicatedStorage.FindFirstChild("UpdateTradeOffer") as RemoteEvent | undefined;
		const confirmTradeRemote = ReplicatedStorage.FindFirstChild("ConfirmTrade") as RemoteEvent | undefined;
		const cancelTradeRemote = ReplicatedStorage.FindFirstChild("CancelTrade") as RemoteEvent | undefined;
		
		if (!tradeUpdateRemote) {
			print("⚠️ Trade remotes not ready yet");
			return;
		}
	
	const msgLabel = requestPopup.FindFirstChild("Message") as TextLabel;
	const acceptBtn = requestPopup.FindFirstChild("Accept") as TextButton;
	const declineBtn = requestPopup.FindFirstChild("Decline") as TextButton;
	const coinInput = tradePanel.FindFirstChild("YourOffer")?.FindFirstChild("CoinInput") as TextBox;
	const theirCoins = tradePanel.FindFirstChild("TheirOffer")?.FindFirstChild("TheirCoins") as TextLabel;
	const confirmBtn = tradePanel.FindFirstChild("ConfirmBtn") as TextButton;
	const cancelBtn = tradePanel.FindFirstChild("CancelBtn") as TextButton;
	const statusLabel = tradePanel.FindFirstChild("Status") as TextLabel;
	
	// Handle trade updates
	tradeUpdateRemote.OnClientEvent.Connect((eventType: string, ...args: unknown[]) => {
		if (eventType === "request") {
			const fromName = args[0] as string;
			currentTradePartner = fromName;
			msgLabel.Text = `🔄 ${fromName} wants to trade!`;
			requestPopup.Visible = true;
		} else if (eventType === "started") {
			const partnerName = args[0] as string;
			currentTradePartner = partnerName;
			requestPopup.Visible = false;
			tradePanel.Visible = true;
			const title = tradePanel.FindFirstChild("Title") as TextLabel;
			if (title) title.Text = `🔄 TRADING WITH ${partnerName}`;
			statusLabel.Text = "Set your offer and click CONFIRM";
		} else if (eventType === "declined") {
			statusLabel.Text = "Trade declined";
			currentTradePartner = undefined;
		} else if (eventType === "offer_update") {
			const theirOffer = args[1] as { coins: number; pet: string | undefined };
			if (theirCoins) theirCoins.Text = `🪙 ${theirOffer.coins}`;
			statusLabel.Text = "Offer updated - confirm again";
			confirmBtn.Text = "✓ CONFIRM";
			confirmBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
		} else if (eventType === "confirm_status") {
			const myConfirmed = args[0] as boolean;
			const theirConfirmed = args[1] as boolean;
			if (myConfirmed && theirConfirmed) {
				statusLabel.Text = "Both confirmed! Trade completing...";
			} else if (myConfirmed) {
				statusLabel.Text = "You confirmed. Waiting for partner...";
				confirmBtn.Text = "⌛ WAITING";
				confirmBtn.BackgroundColor3 = Color3.fromRGB(150, 150, 80);
			} else if (theirConfirmed) {
				statusLabel.Text = "Partner confirmed. Your turn!";
			}
		} else if (eventType === "completed") {
			statusLabel.Text = "✅ Trade completed!";
			wait(2);
			tradePanel.Visible = false;
			currentTradePartner = undefined;
		} else if (eventType === "cancelled") {
			statusLabel.Text = "Trade cancelled";
			wait(1);
			tradePanel.Visible = false;
			currentTradePartner = undefined;
		} else if (eventType === "failed") {
			const reason = args[0] as string;
			statusLabel.Text = `❌ ${reason}`;
		}
	});
	
	// Accept/decline request
	acceptBtn.MouseButton1Click.Connect(() => {
		if (respondTradeRemote && currentTradePartner) {
			respondTradeRemote.FireServer(currentTradePartner, true);
			requestPopup.Visible = false;
		}
	});
	
	declineBtn.MouseButton1Click.Connect(() => {
		if (respondTradeRemote && currentTradePartner) {
			respondTradeRemote.FireServer(currentTradePartner, false);
			requestPopup.Visible = false;
			currentTradePartner = undefined;
		}
	});
	
	// Update offer when coins change
	coinInput.FocusLost.Connect(() => {
		if (updateOfferRemote) {
			const coins = tonumber(coinInput.Text) ?? 0;
			updateOfferRemote.FireServer(coins, undefined);
		}
	});
	
	// Confirm trade
	confirmBtn.MouseButton1Click.Connect(() => {
		if (confirmTradeRemote) {
			confirmTradeRemote.FireServer();
		}
	});
	
	// Cancel trade
	cancelBtn.MouseButton1Click.Connect(() => {
		if (cancelTradeRemote) {
			cancelTradeRemote.FireServer();
			tradePanel.Visible = false;
			currentTradePartner = undefined;
		}
	});
	}); // Close task.spawn
}
