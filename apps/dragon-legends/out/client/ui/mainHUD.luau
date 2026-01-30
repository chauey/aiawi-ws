-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Main HUD (Client)
-- Currency display, quick actions, and notifications
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local TweenService = _services.TweenService
local GAME_THEME = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "theme").GAME_THEME
local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")
-- Create main HUD
local createCurrencyDisplay, createQuickButton, createDragonSlot, setupUpdateLoop
local function setupMainHUD()
	-- Create screen GUI
	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "MainHUD"
	screenGui.ResetOnSpawn = false
	screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
	screenGui.Parent = PlayerGui
	-- Top bar for currency
	local topBar = Instance.new("Frame")
	topBar.Name = "TopBar"
	topBar.Size = UDim2.new(1, 0, 0, 50)
	topBar.Position = UDim2.new(0, 0, 0, 0)
	topBar.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
	topBar.BackgroundTransparency = 0.3
	topBar.BorderSizePixel = 0
	topBar.Parent = screenGui
	-- Gradient
	local gradient = Instance.new("UIGradient")
	gradient.Color = ColorSequence.new({ ColorSequenceKeypoint.new(0, Color3.fromRGB(50, 40, 70)), ColorSequenceKeypoint.new(1, Color3.fromRGB(30, 25, 40)) })
	gradient.Parent = topBar
	-- Coin display
	local coinFrame = createCurrencyDisplay(GAME_THEME.currencyEmoji, GAME_THEME.currency, "CoinDisplay")
	coinFrame.Position = UDim2.new(0, 20, 0.5, 0)
	coinFrame.AnchorPoint = Vector2.new(0, 0.5)
	coinFrame.Parent = topBar
	-- Gem display
	local gemFrame = createCurrencyDisplay(GAME_THEME.secondaryCurrencyEmoji, GAME_THEME.secondaryCurrency, "GemDisplay")
	gemFrame.Position = UDim2.new(0, 200, 0.5, 0)
	gemFrame.AnchorPoint = Vector2.new(0, 0.5)
	gemFrame.Parent = topBar
	-- Quick action buttons (right side)
	local actionsFrame = Instance.new("Frame")
	actionsFrame.Name = "QuickActions"
	actionsFrame.Size = UDim2.new(0, 300, 1, 0)
	actionsFrame.Position = UDim2.new(1, -310, 0, 0)
	actionsFrame.BackgroundTransparency = 1
	actionsFrame.Parent = topBar
	local actionsLayout = Instance.new("UIListLayout")
	actionsLayout.FillDirection = Enum.FillDirection.Horizontal
	actionsLayout.HorizontalAlignment = Enum.HorizontalAlignment.Right
	actionsLayout.Padding = UDim.new(0, 10)
	actionsLayout.Parent = actionsFrame
	-- Action buttons
	createQuickButton("🐉", "Dragons [E]", "OpenDragons", actionsFrame)
	createQuickButton("🥚", "Eggs [Q]", "OpenEggs", actionsFrame)
	createQuickButton("📋", "Quests [T]", "OpenQuests", actionsFrame)
	createQuickButton("🏰", "Clan [G]", "OpenClan", actionsFrame)
	-- Bottom center - Dragon info bar
	local dragonBar = Instance.new("Frame")
	dragonBar.Name = "DragonBar"
	dragonBar.Size = UDim2.new(0, 400, 0, 80)
	dragonBar.Position = UDim2.new(0.5, 0, 1, -100)
	dragonBar.AnchorPoint = Vector2.new(0.5, 0)
	dragonBar.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
	dragonBar.BackgroundTransparency = 0.2
	dragonBar.Parent = screenGui
	local dragonCorner = Instance.new("UICorner")
	dragonCorner.CornerRadius = UDim.new(0, 15)
	dragonCorner.Parent = dragonBar
	local dragonStroke = Instance.new("UIStroke")
	dragonStroke.Color = GAME_THEME.primary
	dragonStroke.Thickness = 2
	dragonStroke.Parent = dragonBar
	-- Active dragon slot 1
	createDragonSlot(dragonBar, 1, UDim2.new(0, 20, 0.5, 0))
	createDragonSlot(dragonBar, 2, UDim2.new(0.5, 0, 0.5, 0))
	createDragonSlot(dragonBar, 3, UDim2.new(1, -80, 0.5, 0))
	-- Start update loop
	setupUpdateLoop(screenGui)
end
-- Create currency display frame
function createCurrencyDisplay(emoji, name, displayName)
	local frame = Instance.new("Frame")
	frame.Name = displayName
	frame.Size = UDim2.new(0, 150, 0, 40)
	frame.BackgroundColor3 = Color3.fromRGB(40, 35, 50)
	frame.BackgroundTransparency = 0.5
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 10)
	corner.Parent = frame
	local stroke = Instance.new("UIStroke")
	stroke.Color = Color3.fromRGB(80, 70, 100)
	stroke.Thickness = 1
	stroke.Parent = frame
	local icon = Instance.new("TextLabel")
	icon.Name = "Icon"
	icon.Size = UDim2.new(0, 40, 1, 0)
	icon.Position = UDim2.new(0, 5, 0, 0)
	icon.BackgroundTransparency = 1
	icon.Text = emoji
	icon.TextScaled = true
	icon.Font = Enum.Font.GothamBold
	icon.Parent = frame
	local amount = Instance.new("TextLabel")
	amount.Name = "Amount"
	amount.Size = UDim2.new(1, -50, 1, 0)
	amount.Position = UDim2.new(0, 45, 0, 0)
	amount.BackgroundTransparency = 1
	amount.Text = "0"
	amount.TextColor3 = Color3.fromRGB(255, 255, 255)
	amount.TextXAlignment = Enum.TextXAlignment.Left
	amount.TextScaled = true
	amount.Font = Enum.Font.GothamBold
	amount.Parent = frame
	return frame
end
-- Create quick action button
local handleQuickAction
function createQuickButton(emoji, tooltip, actionName, parent)
	local button = Instance.new("TextButton")
	button.Name = actionName
	button.Size = UDim2.new(0, 45, 0, 40)
	button.BackgroundColor3 = Color3.fromRGB(60, 50, 80)
	button.Text = emoji
	button.TextScaled = true
	button.Font = Enum.Font.GothamBold
	button.Parent = parent
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = button
	-- Hover effect
	button.MouseEnter:Connect(function()
		TweenService:Create(button, TweenInfo.new(0.2), {
			BackgroundColor3 = Color3.fromRGB(80, 70, 110),
		}):Play()
	end)
	button.MouseLeave:Connect(function()
		TweenService:Create(button, TweenInfo.new(0.2), {
			BackgroundColor3 = Color3.fromRGB(60, 50, 80),
		}):Play()
	end)
	-- Click handler
	button.MouseButton1Click:Connect(function()
		handleQuickAction(actionName)
	end)
	return button
end
-- Create dragon slot in bottom bar
function createDragonSlot(parent, slotNumber, position)
	local slot = Instance.new("Frame")
	slot.Name = `Slot{slotNumber}`
	slot.Size = UDim2.new(0, 60, 0, 60)
	slot.Position = position
	slot.AnchorPoint = Vector2.new(0, 0.5)
	slot.BackgroundColor3 = Color3.fromRGB(50, 45, 65)
	slot.Parent = parent
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 10)
	corner.Parent = slot
	local stroke = Instance.new("UIStroke")
	stroke.Color = Color3.fromRGB(100, 90, 130)
	stroke.Thickness = 2
	stroke.Parent = slot
	local icon = Instance.new("TextLabel")
	icon.Name = "Icon"
	icon.Size = UDim2.new(1, 0, 0.7, 0)
	icon.BackgroundTransparency = 1
	icon.Text = if slotNumber == 1 then "🐉" else "➕"
	icon.TextScaled = true
	icon.TextColor3 = Color3.fromRGB(200, 200, 200)
	icon.Font = Enum.Font.GothamBold
	icon.Parent = slot
	local level = Instance.new("TextLabel")
	level.Name = "Level"
	level.Size = UDim2.new(1, 0, 0.3, 0)
	level.Position = UDim2.new(0, 0, 0.7, 0)
	level.BackgroundTransparency = 1
	level.Text = if slotNumber == 1 then "Lv.1" else ""
	level.TextScaled = true
	level.TextColor3 = Color3.fromRGB(150, 150, 150)
	level.Font = Enum.Font.Gotham
	level.Parent = slot
	return slot
end
-- Handle quick action button clicks
function handleQuickAction(actionName)
	repeat
		if actionName == "OpenDragons" then
			local gui = PlayerGui:FindFirstChild("DragonMenu")
			if gui then
				gui.Enabled = not gui.Enabled
			end
			break
		end
		if actionName == "OpenEggs" then
			local gui = PlayerGui:FindFirstChild("EggShop")
			if gui then
				gui.Enabled = not gui.Enabled
			end
			break
		end
		if actionName == "OpenQuests" then
			local gui = PlayerGui:FindFirstChild("QuestUI")
			if gui then
				gui.Enabled = not gui.Enabled
			end
			break
		end
		if actionName == "OpenClan" then
			local gui = PlayerGui:FindFirstChild("ClanUI")
			if gui then
				gui.Enabled = not gui.Enabled
			end
			break
		end
	until true
end
-- Update loop for currency display
local formatNumber
function setupUpdateLoop(screenGui)
	task.spawn(function()
		while screenGui.Parent do
			-- Get leaderstats
			local leaderstats = LocalPlayer:FindFirstChild("leaderstats")
			if leaderstats then
				local coins = leaderstats:FindFirstChild(GAME_THEME.currency)
				local gems = leaderstats:FindFirstChild(GAME_THEME.secondaryCurrency)
				local topBar = screenGui:FindFirstChild("TopBar")
				if topBar then
					local coinDisplay = topBar:FindFirstChild("CoinDisplay")
					local gemDisplay = topBar:FindFirstChild("GemDisplay")
					if coinDisplay and coins then
						local amount = coinDisplay:FindFirstChild("Amount")
						if amount then
							amount.Text = formatNumber(coins.Value)
						end
					end
					if gemDisplay and gems then
						local amount = gemDisplay:FindFirstChild("Amount")
						if amount then
							amount.Text = formatNumber(gems.Value)
						end
					end
				end
			end
			task.wait(0.5)
		end
	end)
end
-- Format large numbers
function formatNumber(num)
	if num >= 1000000 then
		return `{string.format("%.1f", num / 1000000)}M`
	elseif num >= 1000 then
		return `{string.format("%.1f", num / 1000)}K`
	end
	return tostring(num)
end
return {
	setupMainHUD = setupMainHUD,
}
