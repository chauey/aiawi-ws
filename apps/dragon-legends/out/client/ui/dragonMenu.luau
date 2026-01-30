-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Dragon Menu (Client)
-- View, manage, and equip dragons
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local TweenService = _services.TweenService
local GAME_THEME = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "theme").GAME_THEME
local _config = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "config")
local DRAGONS = _config.DRAGONS
local RARITIES = _config.RARITIES
local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")
-- Create dragon menu
local setupDragonListRefresh
local function setupDragonMenu()
	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "DragonMenu"
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
	container.Size = UDim2.new(0.8, 0, 0.8, 0)
	container.Position = UDim2.new(0.5, 0, 0.5, 0)
	container.AnchorPoint = Vector2.new(0.5, 0.5)
	container.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
	container.Parent = screenGui
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 20)
	corner.Parent = container
	local stroke = Instance.new("UIStroke")
	stroke.Color = GAME_THEME.primary
	stroke.Thickness = 3
	stroke.Parent = container
	-- Header
	local header = Instance.new("Frame")
	header.Name = "Header"
	header.Size = UDim2.new(1, 0, 0, 60)
	header.BackgroundColor3 = Color3.fromRGB(40, 35, 55)
	header.BorderSizePixel = 0
	header.Parent = container
	local headerCorner = Instance.new("UICorner")
	headerCorner.CornerRadius = UDim.new(0, 20)
	headerCorner.Parent = header
	local title = Instance.new("TextLabel")
	title.Size = UDim2.new(0.8, 0, 1, 0)
	title.Position = UDim2.new(0, 20, 0, 0)
	title.BackgroundTransparency = 1
	title.Text = "🐉 My Dragons"
	title.TextColor3 = Color3.fromRGB(255, 255, 255)
	title.TextXAlignment = Enum.TextXAlignment.Left
	title.TextScaled = true
	title.Font = Enum.Font.GothamBold
	title.Parent = header
	-- Close button
	local closeBtn = Instance.new("TextButton")
	closeBtn.Name = "CloseBtn"
	closeBtn.Size = UDim2.new(0, 50, 0, 50)
	closeBtn.Position = UDim2.new(1, -55, 0, 5)
	closeBtn.BackgroundColor3 = Color3.fromRGB(200, 60, 60)
	closeBtn.Text = "✕"
	closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
	closeBtn.TextScaled = true
	closeBtn.Font = Enum.Font.GothamBold
	closeBtn.Parent = header
	local closeBtnCorner = Instance.new("UICorner")
	closeBtnCorner.CornerRadius = UDim.new(0, 10)
	closeBtnCorner.Parent = closeBtn
	closeBtn.MouseButton1Click:Connect(function()
		screenGui.Enabled = false
	end)
	-- Content area - dragon grid
	local content = Instance.new("ScrollingFrame")
	content.Name = "Content"
	content.Size = UDim2.new(0.65, -20, 1, -80)
	content.Position = UDim2.new(0, 10, 0, 70)
	content.BackgroundTransparency = 1
	content.ScrollBarThickness = 8
	content.ScrollBarImageColor3 = GAME_THEME.primary
	content.Parent = container
	local gridLayout = Instance.new("UIGridLayout")
	gridLayout.CellSize = UDim2.new(0, 120, 0, 140)
	gridLayout.CellPadding = UDim2.new(0, 10, 0, 10)
	gridLayout.SortOrder = Enum.SortOrder.LayoutOrder
	gridLayout.Parent = content
	-- Detail panel (right side)
	local detailPanel = Instance.new("Frame")
	detailPanel.Name = "DetailPanel"
	detailPanel.Size = UDim2.new(0.35, -20, 1, -80)
	detailPanel.Position = UDim2.new(0.65, 10, 0, 70)
	detailPanel.BackgroundColor3 = Color3.fromRGB(40, 35, 55)
	detailPanel.Parent = container
	local detailCorner = Instance.new("UICorner")
	detailCorner.CornerRadius = UDim.new(0, 15)
	detailCorner.Parent = detailPanel
	-- Empty state in detail panel
	local emptyText = Instance.new("TextLabel")
	emptyText.Name = "EmptyText"
	emptyText.Size = UDim2.new(1, -20, 1, 0)
	emptyText.Position = UDim2.new(0, 10, 0, 0)
	emptyText.BackgroundTransparency = 1
	emptyText.Text = "Select a dragon\nto view details"
	emptyText.TextColor3 = Color3.fromRGB(150, 150, 150)
	emptyText.TextScaled = true
	emptyText.Font = Enum.Font.Gotham
	emptyText.Parent = detailPanel
	-- Click overlay to close
	overlay.InputBegan:Connect(function(input)
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			screenGui.Enabled = false
		end
	end)
	-- Setup dragon list refresh
	setupDragonListRefresh(screenGui, content)
end
-- Create dragon card
local showDragonDetail
local function createDragonCard(dragon, index)
	local def = DRAGONS[dragon.dragonId]
	local rarityConfig = RARITIES[dragon.rarity]
	local card = Instance.new("Frame")
	card.Name = `Dragon_{index}`
	card.BackgroundColor3 = Color3.fromRGB(50, 45, 65)
	card.LayoutOrder = index
	local cardCorner = Instance.new("UICorner")
	cardCorner.CornerRadius = UDim.new(0, 12)
	cardCorner.Parent = card
	local cardStroke = Instance.new("UIStroke")
	local _result = rarityConfig
	if _result ~= nil then
		_result = _result.color
	end
	local _condition = _result
	if not _condition then
		_condition = Color3.fromRGB(100, 100, 100)
	end
	cardStroke.Color = _condition
	cardStroke.Thickness = 2
	cardStroke.Parent = card
	-- Dragon icon
	local icon = Instance.new("TextLabel")
	icon.Size = UDim2.new(1, 0, 0.5, 0)
	icon.BackgroundTransparency = 1
	icon.Text = if dragon.isShiny then "✨🐉✨" else "🐉"
	icon.TextScaled = true
	icon.Font = Enum.Font.GothamBold
	icon.Parent = card
	-- Dragon name
	local nameLabel = Instance.new("TextLabel")
	nameLabel.Size = UDim2.new(1, -10, 0.25, 0)
	nameLabel.Position = UDim2.new(0, 5, 0.5, 0)
	nameLabel.BackgroundTransparency = 1
	local _condition_1 = dragon.nickname
	if not (_condition_1 ~= "" and _condition_1) then
		local _result_1 = def
		if _result_1 ~= nil then
			_result_1 = _result_1.name
		end
		_condition_1 = _result_1
		if not (_condition_1 ~= "" and _condition_1) then
			_condition_1 = "Unknown"
		end
	end
	nameLabel.Text = _condition_1
	nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	nameLabel.TextScaled = true
	nameLabel.TextTruncate = Enum.TextTruncate.AtEnd
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.Parent = card
	-- Level and rarity
	local infoLabel = Instance.new("TextLabel")
	infoLabel.Size = UDim2.new(1, -10, 0.2, 0)
	infoLabel.Position = UDim2.new(0, 5, 0.75, 0)
	infoLabel.BackgroundTransparency = 1
	infoLabel.Text = `Lv.{dragon.level} • {dragon.rarity}`
	local _result_1 = rarityConfig
	if _result_1 ~= nil then
		_result_1 = _result_1.color
	end
	local _condition_2 = _result_1
	if not _condition_2 then
		_condition_2 = Color3.fromRGB(150, 150, 150)
	end
	infoLabel.TextColor3 = _condition_2
	infoLabel.TextScaled = true
	infoLabel.Font = Enum.Font.Gotham
	infoLabel.Parent = card
	-- Favorite indicator
	if dragon.isFavorite then
		local favLabel = Instance.new("TextLabel")
		favLabel.Size = UDim2.new(0, 25, 0, 25)
		favLabel.Position = UDim2.new(1, -28, 0, 3)
		favLabel.BackgroundTransparency = 1
		favLabel.Text = "⭐"
		favLabel.TextScaled = true
		favLabel.Parent = card
	end
	-- Click handler
	local button = Instance.new("TextButton")
	button.Size = UDim2.new(1, 0, 1, 0)
	button.BackgroundTransparency = 1
	button.Text = ""
	button.Parent = card
	button.MouseButton1Click:Connect(function()
		showDragonDetail(dragon)
	end)
	-- Hover effect
	button.MouseEnter:Connect(function()
		TweenService:Create(card, TweenInfo.new(0.2), {
			BackgroundColor3 = Color3.fromRGB(70, 65, 90),
		}):Play()
	end)
	button.MouseLeave:Connect(function()
		TweenService:Create(card, TweenInfo.new(0.2), {
			BackgroundColor3 = Color3.fromRGB(50, 45, 65),
		}):Play()
	end)
	return card
end
-- Show dragon detail in side panel
local createStatBar, createActionButton
function showDragonDetail(dragon)
	local screenGui = PlayerGui:FindFirstChild("DragonMenu")
	if not screenGui then
		return nil
	end
	local container = screenGui:FindFirstChild("Container")
	if not container then
		return nil
	end
	local detailPanel = container:FindFirstChild("DetailPanel")
	if not detailPanel then
		return nil
	end
	-- Clear existing detail
	for _, child in detailPanel:GetChildren() do
		if not child:IsA("UICorner") then
			child:Destroy()
		end
	end
	local def = DRAGONS[dragon.dragonId]
	local rarityConfig = RARITIES[dragon.rarity]
	-- Dragon icon
	local icon = Instance.new("TextLabel")
	icon.Size = UDim2.new(1, 0, 0, 80)
	icon.Position = UDim2.new(0, 0, 0, 20)
	icon.BackgroundTransparency = 1
	icon.Text = if dragon.isShiny then "✨🐉✨" else "🐉"
	icon.TextScaled = true
	icon.Parent = detailPanel
	-- Name
	local nameLabel = Instance.new("TextLabel")
	nameLabel.Size = UDim2.new(1, -20, 0, 30)
	nameLabel.Position = UDim2.new(0, 10, 0, 100)
	nameLabel.BackgroundTransparency = 1
	local _condition = dragon.nickname
	if not (_condition ~= "" and _condition) then
		local _result = def
		if _result ~= nil then
			_result = _result.name
		end
		_condition = _result
		if not (_condition ~= "" and _condition) then
			_condition = "Unknown"
		end
	end
	nameLabel.Text = _condition
	local _result = rarityConfig
	if _result ~= nil then
		_result = _result.color
	end
	local _condition_1 = _result
	if not _condition_1 then
		_condition_1 = Color3.fromRGB(255, 255, 255)
	end
	nameLabel.TextColor3 = _condition_1
	nameLabel.TextScaled = true
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.Parent = detailPanel
	-- Info
	local infoLabel = Instance.new("TextLabel")
	infoLabel.Size = UDim2.new(1, -20, 0, 20)
	infoLabel.Position = UDim2.new(0, 10, 0, 135)
	infoLabel.BackgroundTransparency = 1
	infoLabel.Text = `{dragon.rarity} • {string.upper(dragon.element)} • Stage {dragon.evolutionStage}`
	infoLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
	infoLabel.TextScaled = true
	infoLabel.Font = Enum.Font.Gotham
	infoLabel.Parent = detailPanel
	-- Stats
	local stats = { {
		name = "Level",
		value = dragon.level,
		max = 50,
	}, {
		name = "Power",
		value = dragon.stats.power,
		max = 200,
	}, {
		name = "Speed",
		value = dragon.stats.speed,
		max = 200,
	}, {
		name = "Health",
		value = dragon.stats.health,
		max = 200,
	}, {
		name = "Luck",
		value = dragon.stats.luck,
		max = 100,
	} }
	local yOffset = 170
	for _, stat in stats do
		createStatBar(detailPanel, stat.name, stat.value, stat.max, yOffset)
		yOffset += 35
	end
	-- Battle record
	local battleLabel = Instance.new("TextLabel")
	battleLabel.Size = UDim2.new(1, -20, 0, 25)
	battleLabel.Position = UDim2.new(0, 10, 0, yOffset + 10)
	battleLabel.BackgroundTransparency = 1
	battleLabel.Text = `⚔️ Wins: {dragon.battleWins} | Losses: {dragon.battleLosses}`
	battleLabel.TextColor3 = Color3.fromRGB(150, 150, 150)
	battleLabel.TextScaled = true
	battleLabel.Font = Enum.Font.Gotham
	battleLabel.Parent = detailPanel
	-- Action buttons
	local buttonY = yOffset + 50
	-- Equip button
	local equipBtn = createActionButton("🎯 Equip", buttonY, Color3.fromRGB(80, 150, 80))
	equipBtn.Parent = detailPanel
	-- Evolve button (if applicable)
	local _result_1 = def
	if _result_1 ~= nil then
		_result_1 = _result_1.evolvesTo
	end
	if _result_1 ~= "" and _result_1 then
		local evolveBtn = createActionButton("✨ Evolve", buttonY + 45, Color3.fromRGB(150, 100, 200))
		evolveBtn.Parent = detailPanel
	end
end
-- Create stat bar
function createStatBar(parent, name, value, max, yOffset)
	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(0.4, -10, 0, 20)
	label.Position = UDim2.new(0, 10, 0, yOffset)
	label.BackgroundTransparency = 1
	label.Text = name
	label.TextColor3 = Color3.fromRGB(180, 180, 180)
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.TextScaled = true
	label.Font = Enum.Font.Gotham
	label.Parent = parent
	local barBg = Instance.new("Frame")
	barBg.Size = UDim2.new(0.55, -10, 0, 15)
	barBg.Position = UDim2.new(0.4, 0, 0, yOffset + 2)
	barBg.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
	barBg.Parent = parent
	local barCorner = Instance.new("UICorner")
	barCorner.CornerRadius = UDim.new(0, 5)
	barCorner.Parent = barBg
	local barFill = Instance.new("Frame")
	barFill.Size = UDim2.new(math.min(value / max, 1), 0, 1, 0)
	barFill.BackgroundColor3 = GAME_THEME.primary
	barFill.Parent = barBg
	local fillCorner = Instance.new("UICorner")
	fillCorner.CornerRadius = UDim.new(0, 5)
	fillCorner.Parent = barFill
	local valueLabel = Instance.new("TextLabel")
	valueLabel.Size = UDim2.new(1, 0, 1, 0)
	valueLabel.BackgroundTransparency = 1
	valueLabel.Text = tostring(value)
	valueLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	valueLabel.TextScaled = true
	valueLabel.Font = Enum.Font.GothamBold
	valueLabel.Parent = barBg
end
-- Create action button
function createActionButton(text, yOffset, color)
	local button = Instance.new("TextButton")
	button.Size = UDim2.new(1, -20, 0, 35)
	button.Position = UDim2.new(0, 10, 0, yOffset)
	button.BackgroundColor3 = color
	button.Text = text
	button.TextColor3 = Color3.fromRGB(255, 255, 255)
	button.TextScaled = true
	button.Font = Enum.Font.GothamBold
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = button
	return button
end
-- Refresh dragon list periodically
function setupDragonListRefresh(screenGui, content)
	-- Initial placeholder dragons for demo
	local demoDragons = {}
	-- Populate demo dragons
	for i = 0, 11 do
		local dragonIds = { "fire_drake_baby", "water_wyrm_baby", "frost_drake_baby", "nature_spirit_baby", "thunder_dragon_baby" }
		local randomId = dragonIds[math.floor(math.random() * #dragonIds) + 1]
		local def = DRAGONS[randomId]
		local _object = {
			instanceId = `demo_{i}`,
			dragonId = randomId,
			level = math.random(1, 30),
			experience = 0,
		}
		local _left = "stats"
		local _object_1 = table.clone(def.baseStats)
		setmetatable(_object_1, nil)
		_object[_left] = _object_1
		_object.element = def.element
		_object.rarity = def.rarity
		_object.evolutionStage = def.evolutionStage
		_object.isShiny = math.random() < 0.1
		_object.obtainedAt = os.time()
		_object.breedCount = 0
		_object.battleWins = math.random(0, 50)
		_object.battleLosses = math.random(0, 20)
		_object.isFavorite = math.random() < 0.2
		table.insert(demoDragons, _object)
	end
	-- Create cards
	for i = 0, #demoDragons - 1 do
		local card = createDragonCard(demoDragons[i + 1], i)
		card.Parent = content
	end
	-- Update canvas size
	local gridLayout = content:FindFirstChildOfClass("UIGridLayout")
	if gridLayout then
		content.CanvasSize = UDim2.new(0, 0, 0, gridLayout.AbsoluteContentSize.Y + 20)
	end
end
return {
	setupDragonMenu = setupDragonMenu,
}
