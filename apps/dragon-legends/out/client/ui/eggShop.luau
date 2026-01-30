-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Egg Shop (Client)
-- Purchase and hatch dragon eggs
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local ReplicatedStorage = _services.ReplicatedStorage
local TweenService = _services.TweenService
local GAME_THEME = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "theme").GAME_THEME
local _config = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "config")
local EGG_TYPES = _config.EGG_TYPES
local RARITIES = _config.RARITIES
local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")
-- Create egg shop
local createHeader, createEggCard, createHatchResultPanel
local function setupEggShop()
	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "EggShop"
	screenGui.ResetOnSpawn = false
	screenGui.Enabled = false
	screenGui.Parent = PlayerGui
	-- Background overlay
	local overlay = Instance.new("Frame")
	overlay.Name = "Overlay"
	overlay.Size = UDim2.new(1, 0, 1, 0)
	overlay.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
	overlay.BackgroundTransparency = 0.5
	overlay.Parent = screenGui
	-- Main container
	local container = Instance.new("Frame")
	container.Name = "Container"
	container.Size = UDim2.new(0, 600, 0, 500)
	container.Position = UDim2.new(0.5, 0, 0.5, 0)
	container.AnchorPoint = Vector2.new(0.5, 0.5)
	container.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
	container.Parent = screenGui
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 20)
	corner.Parent = container
	local stroke = Instance.new("UIStroke")
	stroke.Color = GAME_THEME.accent
	stroke.Thickness = 3
	stroke.Parent = container
	-- Header
	local header = createHeader(container)
	-- Close button
	local closeBtn = Instance.new("TextButton")
	closeBtn.Size = UDim2.new(0, 40, 0, 40)
	closeBtn.Position = UDim2.new(1, -50, 0, 10)
	closeBtn.BackgroundColor3 = Color3.fromRGB(200, 60, 60)
	closeBtn.Text = "✕"
	closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
	closeBtn.TextScaled = true
	closeBtn.Font = Enum.Font.GothamBold
	closeBtn.Parent = header
	local closeBtnCorner = Instance.new("UICorner")
	closeBtnCorner.CornerRadius = UDim.new(0, 8)
	closeBtnCorner.Parent = closeBtn
	closeBtn.MouseButton1Click:Connect(function()
		screenGui.Enabled = false
	end)
	-- Egg cards container
	local eggsContainer = Instance.new("Frame")
	eggsContainer.Name = "EggsContainer"
	eggsContainer.Size = UDim2.new(1, -40, 0.7, 0)
	eggsContainer.Position = UDim2.new(0, 20, 0, 80)
	eggsContainer.BackgroundTransparency = 1
	eggsContainer.Parent = container
	local listLayout = Instance.new("UIListLayout")
	listLayout.FillDirection = Enum.FillDirection.Horizontal
	listLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
	listLayout.Padding = UDim.new(0, 20)
	listLayout.Parent = eggsContainer
	-- Create egg cards
	createEggCard(eggsContainer, "basic", "🥚 Basic Egg", EGG_TYPES.basic)
	createEggCard(eggsContainer, "premium", "✨ Premium Egg", EGG_TYPES.premium)
	createEggCard(eggsContainer, "legendary", "🌟 Legendary Egg", EGG_TYPES.legendary)
	-- Hatching result panel (hidden by default)
	createHatchResultPanel(container)
	-- Click overlay to close
	overlay.InputBegan:Connect(function(input)
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			screenGui.Enabled = false
		end
	end)
end
-- Create header
function createHeader(parent)
	local header = Instance.new("Frame")
	header.Name = "Header"
	header.Size = UDim2.new(1, 0, 0, 60)
	header.BackgroundColor3 = Color3.fromRGB(40, 35, 55)
	header.BorderSizePixel = 0
	header.Parent = parent
	Instance.new("UICorner", header).CornerRadius = UDim.new(0, 20)
	local title = Instance.new("TextLabel")
	title.Size = UDim2.new(0.8, 0, 1, 0)
	title.Position = UDim2.new(0, 20, 0, 0)
	title.BackgroundTransparency = 1
	title.Text = "🥚 Dragon Egg Shop"
	title.TextColor3 = Color3.fromRGB(255, 255, 255)
	title.TextXAlignment = Enum.TextXAlignment.Left
	title.TextScaled = true
	title.Font = Enum.Font.GothamBold
	title.Parent = header
	return header
end
-- Create egg card
local hatchEgg
function createEggCard(parent, eggType, name, config)
	local card = Instance.new("Frame")
	card.Name = `{eggType}Egg`
	card.Size = UDim2.new(0, 160, 1, 0)
	card.BackgroundColor3 = Color3.fromRGB(50, 45, 65)
	card.Parent = parent
	local cardCorner = Instance.new("UICorner")
	cardCorner.CornerRadius = UDim.new(0, 15)
	cardCorner.Parent = card
	local cardStroke = Instance.new("UIStroke")
	cardStroke.Color = if eggType == "legendary" then Color3.fromRGB(255, 200, 50) elseif eggType == "premium" then Color3.fromRGB(180, 100, 255) else Color3.fromRGB(100, 100, 100)
	cardStroke.Thickness = 2
	cardStroke.Parent = card
	-- Egg icon
	local icon = Instance.new("TextLabel")
	icon.Size = UDim2.new(1, 0, 0, 80)
	icon.Position = UDim2.new(0, 0, 0, 20)
	icon.BackgroundTransparency = 1
	icon.Text = if eggType == "legendary" then "🌟🥚🌟" elseif eggType == "premium" then "✨🥚✨" else "🥚"
	icon.TextScaled = true
	icon.Parent = card
	-- Name
	local nameLabel = Instance.new("TextLabel")
	nameLabel.Size = UDim2.new(1, -10, 0, 25)
	nameLabel.Position = UDim2.new(0, 5, 0, 105)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text = name
	nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	nameLabel.TextScaled = true
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.Parent = card
	-- Rates info
	local ratesFrame = Instance.new("Frame")
	ratesFrame.Size = UDim2.new(1, -20, 0, 80)
	ratesFrame.Position = UDim2.new(0, 10, 0, 135)
	ratesFrame.BackgroundTransparency = 1
	ratesFrame.Parent = card
	local yOffset = 0
	for rarity, chance in pairs(config.rates) do
		if chance > 0 then
			local rateLabel = Instance.new("TextLabel")
			rateLabel.Size = UDim2.new(1, 0, 0, 15)
			rateLabel.Position = UDim2.new(0, 0, 0, yOffset)
			rateLabel.BackgroundTransparency = 1
			rateLabel.Text = `{rarity}: {chance}%`
			local _result = RARITIES[rarity]
			if _result ~= nil then
				_result = _result.color
			end
			local _condition = _result
			if not _condition then
				_condition = Color3.fromRGB(150, 150, 150)
			end
			rateLabel.TextColor3 = _condition
			rateLabel.TextScaled = true
			rateLabel.Font = Enum.Font.Gotham
			rateLabel.Parent = ratesFrame
			yOffset += 16
		end
	end
	-- Price
	local priceLabel = Instance.new("TextLabel")
	priceLabel.Size = UDim2.new(1, -10, 0, 25)
	priceLabel.Position = UDim2.new(0, 5, 0, 220)
	priceLabel.BackgroundTransparency = 1
	priceLabel.Text = `{if config.currency == "gems" then "💎" else "💰"} {config.cost}`
	priceLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
	priceLabel.TextScaled = true
	priceLabel.Font = Enum.Font.GothamBold
	priceLabel.Parent = card
	-- Buy button
	local buyBtn = Instance.new("TextButton")
	buyBtn.Size = UDim2.new(1, -20, 0, 40)
	buyBtn.Position = UDim2.new(0, 10, 1, -50)
	buyBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 80)
	buyBtn.Text = "🥚 Hatch!"
	buyBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
	buyBtn.TextScaled = true
	buyBtn.Font = Enum.Font.GothamBold
	buyBtn.Parent = card
	local buyBtnCorner = Instance.new("UICorner")
	buyBtnCorner.CornerRadius = UDim.new(0, 8)
	buyBtnCorner.Parent = buyBtn
	-- Buy button hover effect
	buyBtn.MouseEnter:Connect(function()
		TweenService:Create(buyBtn, TweenInfo.new(0.2), {
			BackgroundColor3 = Color3.fromRGB(100, 180, 100),
		}):Play()
	end)
	buyBtn.MouseLeave:Connect(function()
		TweenService:Create(buyBtn, TweenInfo.new(0.2), {
			BackgroundColor3 = Color3.fromRGB(80, 150, 80),
		}):Play()
	end)
	-- Buy button click
	buyBtn.MouseButton1Click:Connect(function()
		hatchEgg(eggType)
	end)
	return card
end
-- Create hatch result panel
function createHatchResultPanel(parent)
	local panel = Instance.new("Frame")
	panel.Name = "HatchResult"
	panel.Size = UDim2.new(1, 0, 1, 0)
	panel.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
	panel.BackgroundTransparency = 0.1
	panel.Visible = false
	panel.Parent = parent
	local panelCorner = Instance.new("UICorner")
	panelCorner.CornerRadius = UDim.new(0, 20)
	panelCorner.Parent = panel
	-- Result content
	local resultIcon = Instance.new("TextLabel")
	resultIcon.Name = "ResultIcon"
	resultIcon.Size = UDim2.new(1, 0, 0, 150)
	resultIcon.Position = UDim2.new(0, 0, 0, 80)
	resultIcon.BackgroundTransparency = 1
	resultIcon.Text = "🐉"
	resultIcon.TextScaled = true
	resultIcon.Parent = panel
	local resultName = Instance.new("TextLabel")
	resultName.Name = "ResultName"
	resultName.Size = UDim2.new(1, -40, 0, 40)
	resultName.Position = UDim2.new(0, 20, 0, 240)
	resultName.BackgroundTransparency = 1
	resultName.Text = "Fire Drake (Baby)"
	resultName.TextColor3 = Color3.fromRGB(255, 255, 255)
	resultName.TextScaled = true
	resultName.Font = Enum.Font.GothamBold
	resultName.Parent = panel
	local resultRarity = Instance.new("TextLabel")
	resultRarity.Name = "ResultRarity"
	resultRarity.Size = UDim2.new(1, -40, 0, 30)
	resultRarity.Position = UDim2.new(0, 20, 0, 285)
	resultRarity.BackgroundTransparency = 1
	resultRarity.Text = "Common"
	resultRarity.TextColor3 = Color3.fromRGB(180, 180, 180)
	resultRarity.TextScaled = true
	resultRarity.Font = Enum.Font.Gotham
	resultRarity.Parent = panel
	-- Continue button
	local continueBtn = Instance.new("TextButton")
	continueBtn.Name = "ContinueBtn"
	continueBtn.Size = UDim2.new(0, 200, 0, 50)
	continueBtn.Position = UDim2.new(0.5, 0, 0, 350)
	continueBtn.AnchorPoint = Vector2.new(0.5, 0)
	continueBtn.BackgroundColor3 = GAME_THEME.primary
	continueBtn.Text = "Continue"
	continueBtn.TextColor3 = Color3.fromRGB(0, 0, 0)
	continueBtn.TextScaled = true
	continueBtn.Font = Enum.Font.GothamBold
	continueBtn.Parent = panel
	local continueBtnCorner = Instance.new("UICorner")
	continueBtnCorner.CornerRadius = UDim.new(0, 10)
	continueBtnCorner.Parent = continueBtn
	continueBtn.MouseButton1Click:Connect(function()
		panel.Visible = false
	end)
	return panel
end
-- Hatch egg function
function hatchEgg(eggType)
	local remotes = ReplicatedStorage:WaitForChild("DragonRemotes")
	local hatchRemote = remotes:WaitForChild("HatchEgg")
	local result = hatchRemote:InvokeServer(eggType)
	local screenGui = PlayerGui:FindFirstChild("EggShop")
	if not screenGui then
		return nil
	end
	local container = screenGui:FindFirstChild("Container")
	if not container then
		return nil
	end
	local resultPanel = container:FindFirstChild("HatchResult")
	if not resultPanel then
		return nil
	end
	local _value = result.success and result.dragonId
	if _value ~= "" and _value then
		-- Show result
		local icon = resultPanel:FindFirstChild("ResultIcon")
		local name = resultPanel:FindFirstChild("ResultName")
		local rarity = resultPanel:FindFirstChild("ResultRarity")
		if icon then
			icon.Text = if result.isShiny then "✨🐉✨" else "🐉"
		end
		if name then
			name.Text = if result.isShiny then `✨ SHINY {result.dragonId} ✨` else result.dragonId
		end
		if rarity then
			rarity.Text = if result.isShiny then "SHINY!" else "Hatched!"
		end
		resultPanel.Visible = true
	else
		-- Show error (in a real game, use a notification system)
		print(`❌ Hatch failed: {result.error}`)
	end
end
return {
	setupEggShop = setupEggShop,
}
