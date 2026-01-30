-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Quest UI (Client)
-- View active quests and claim rewards
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local ReplicatedStorage = _services.ReplicatedStorage
local TweenService = _services.TweenService
local GAME_THEME = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "theme").GAME_THEME
local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")
-- Create quest UI
local createQuestTab, setupQuestRefresh
local function setupQuestUI()
	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "QuestUI"
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
	container.Size = UDim2.new(0, 500, 0.8, 0)
	container.Position = UDim2.new(0.5, 0, 0.5, 0)
	container.AnchorPoint = Vector2.new(0.5, 0.5)
	container.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
	container.Parent = screenGui
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 20)
	corner.Parent = container
	local stroke = Instance.new("UIStroke")
	stroke.Color = Color3.fromRGB(100, 200, 100)
	stroke.Thickness = 3
	stroke.Parent = container
	-- Header
	local header = Instance.new("Frame")
	header.Name = "Header"
	header.Size = UDim2.new(1, 0, 0, 60)
	header.BackgroundColor3 = Color3.fromRGB(40, 35, 55)
	header.BorderSizePixel = 0
	header.Parent = container
	Instance.new("UICorner", header).CornerRadius = UDim.new(0, 20)
	local title = Instance.new("TextLabel")
	title.Size = UDim2.new(0.8, 0, 1, 0)
	title.Position = UDim2.new(0, 20, 0, 0)
	title.BackgroundTransparency = 1
	title.Text = "📋 Quests"
	title.TextColor3 = Color3.fromRGB(255, 255, 255)
	title.TextXAlignment = Enum.TextXAlignment.Left
	title.TextScaled = true
	title.Font = Enum.Font.GothamBold
	title.Parent = header
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
	Instance.new("UICorner", closeBtn).CornerRadius = UDim.new(0, 8)
	closeBtn.MouseButton1Click:Connect(function()
		screenGui.Enabled = false
	end)
	-- Tab buttons
	local tabContainer = Instance.new("Frame")
	tabContainer.Name = "TabContainer"
	tabContainer.Size = UDim2.new(1, -40, 0, 35)
	tabContainer.Position = UDim2.new(0, 20, 0, 70)
	tabContainer.BackgroundTransparency = 1
	tabContainer.Parent = container
	local tabLayout = Instance.new("UIListLayout")
	tabLayout.FillDirection = Enum.FillDirection.Horizontal
	tabLayout.Padding = UDim.new(0, 10)
	tabLayout.Parent = tabContainer
	createQuestTab(tabContainer, "Daily", "📅 Daily", true)
	createQuestTab(tabContainer, "Weekly", "📆 Weekly", false)
	createQuestTab(tabContainer, "Achievements", "🏆 Achievements", false)
	-- Quest list
	local questList = Instance.new("ScrollingFrame")
	questList.Name = "QuestList"
	questList.Size = UDim2.new(1, -40, 1, -130)
	questList.Position = UDim2.new(0, 20, 0, 115)
	questList.BackgroundTransparency = 1
	questList.ScrollBarThickness = 8
	questList.ScrollBarImageColor3 = GAME_THEME.primary
	questList.Parent = container
	local listLayout = Instance.new("UIListLayout")
	listLayout.Padding = UDim.new(0, 10)
	listLayout.Parent = questList
	-- Click overlay to close
	overlay.InputBegan:Connect(function(input)
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			screenGui.Enabled = false
		end
	end)
	-- Setup quest refresh
	setupQuestRefresh(screenGui)
end
-- Create quest tab
local refreshQuests, updateTabSelection
function createQuestTab(parent, id, text, active)
	local button = Instance.new("TextButton")
	button.Name = `Tab_{id}`
	button.Size = UDim2.new(0, 130, 1, 0)
	button.BackgroundColor3 = if active then Color3.fromRGB(60, 55, 80) else Color3.fromRGB(40, 35, 55)
	button.Text = text
	button.TextColor3 = Color3.fromRGB(255, 255, 255)
	button.TextScaled = true
	button.Font = Enum.Font.GothamBold
	button.Parent = parent
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = button
	button.MouseButton1Click:Connect(function()
		refreshQuests(string.lower(id))
		updateTabSelection(parent, id)
	end)
	return button
end
-- Update tab selection
function updateTabSelection(tabContainer, activeId)
	for _, child in tabContainer:GetChildren() do
		if child:IsA("TextButton") then
			child.BackgroundColor3 = if child.Name == `Tab_{activeId}` then Color3.fromRGB(60, 55, 80) else Color3.fromRGB(40, 35, 55)
		end
	end
end
-- Create quest card
local claimQuest
local function createQuestCard(quest, index)
	local card = Instance.new("Frame")
	card.Name = `Quest_{index}`
	card.Size = UDim2.new(1, 0, 0, 100)
	card.BackgroundColor3 = if quest.isCompleted then Color3.fromRGB(50, 70, 50) else Color3.fromRGB(50, 45, 65)
	card.LayoutOrder = index
	local cardCorner = Instance.new("UICorner")
	cardCorner.CornerRadius = UDim.new(0, 12)
	cardCorner.Parent = card
	local cardStroke = Instance.new("UIStroke")
	cardStroke.Color = if quest.isCompleted then Color3.fromRGB(100, 200, 100) else Color3.fromRGB(80, 75, 100)
	cardStroke.Thickness = 2
	cardStroke.Parent = card
	-- Quest name
	local nameLabel = Instance.new("TextLabel")
	nameLabel.Size = UDim2.new(0.6, -10, 0, 25)
	nameLabel.Position = UDim2.new(0, 15, 0, 10)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text = quest.name
	nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	nameLabel.TextXAlignment = Enum.TextXAlignment.Left
	nameLabel.TextScaled = true
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.Parent = card
	-- Quest description
	local descLabel = Instance.new("TextLabel")
	descLabel.Size = UDim2.new(0.6, -10, 0, 20)
	descLabel.Position = UDim2.new(0, 15, 0, 35)
	descLabel.BackgroundTransparency = 1
	descLabel.Text = quest.description
	descLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
	descLabel.TextXAlignment = Enum.TextXAlignment.Left
	descLabel.TextScaled = true
	descLabel.Font = Enum.Font.Gotham
	descLabel.Parent = card
	-- Progress bar
	if #quest.requirements > 0 then
		local req = quest.requirements[1]
		local progress = math.min(req.current / req.target, 1)
		local progressBg = Instance.new("Frame")
		progressBg.Size = UDim2.new(0.6, -20, 0, 15)
		progressBg.Position = UDim2.new(0, 15, 0, 60)
		progressBg.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
		progressBg.Parent = card
		Instance.new("UICorner", progressBg).CornerRadius = UDim.new(0, 5)
		local progressFill = Instance.new("Frame")
		progressFill.Size = UDim2.new(progress, 0, 1, 0)
		progressFill.BackgroundColor3 = if quest.isCompleted then Color3.fromRGB(100, 200, 100) else GAME_THEME.primary
		progressFill.Parent = progressBg
		Instance.new("UICorner", progressFill).CornerRadius = UDim.new(0, 5)
		local progressLabel = Instance.new("TextLabel")
		progressLabel.Size = UDim2.new(1, 0, 1, 0)
		progressLabel.BackgroundTransparency = 1
		progressLabel.Text = `{req.current} / {req.target}`
		progressLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
		progressLabel.TextStrokeTransparency = 0
		progressLabel.TextScaled = true
		progressLabel.Font = Enum.Font.GothamBold
		progressLabel.Parent = progressBg
	end
	-- Rewards section (right side)
	local rewardsFrame = Instance.new("Frame")
	rewardsFrame.Size = UDim2.new(0.35, -10, 0.8, 0)
	rewardsFrame.Position = UDim2.new(0.65, 0, 0.1, 0)
	rewardsFrame.BackgroundTransparency = 1
	rewardsFrame.Parent = card
	local rewardText = "Rewards: "
	local _value = quest.rewards.coins
	if _value ~= 0 and _value == _value and _value then
		rewardText ..= `{quest.rewards.coins} 💰 `
	end
	local _value_1 = quest.rewards.gems
	if _value_1 ~= 0 and _value_1 == _value_1 and _value_1 then
		rewardText ..= `{quest.rewards.gems} 💎 `
	end
	local _value_2 = quest.rewards.xp
	if _value_2 ~= 0 and _value_2 == _value_2 and _value_2 then
		rewardText ..= `{quest.rewards.xp} XP `
	end
	local rewardsLabel = Instance.new("TextLabel")
	rewardsLabel.Size = UDim2.new(1, 0, 0.5, 0)
	rewardsLabel.BackgroundTransparency = 1
	rewardsLabel.Text = rewardText
	rewardsLabel.TextColor3 = Color3.fromRGB(200, 200, 150)
	rewardsLabel.TextScaled = true
	rewardsLabel.Font = Enum.Font.Gotham
	rewardsLabel.Parent = rewardsFrame
	-- Claim button (if completed)
	if quest.isCompleted then
		local claimBtn = Instance.new("TextButton")
		claimBtn.Size = UDim2.new(1, 0, 0.45, 0)
		claimBtn.Position = UDim2.new(0, 0, 0.55, 0)
		claimBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80)
		claimBtn.Text = "Claim!"
		claimBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
		claimBtn.TextScaled = true
		claimBtn.Font = Enum.Font.GothamBold
		claimBtn.Parent = rewardsFrame
		Instance.new("UICorner", claimBtn).CornerRadius = UDim.new(0, 8)
		claimBtn.MouseButton1Click:Connect(function()
			claimQuest(quest.questId)
		end)
		-- Hover effect
		claimBtn.MouseEnter:Connect(function()
			TweenService:Create(claimBtn, TweenInfo.new(0.2), {
				BackgroundColor3 = Color3.fromRGB(100, 220, 100),
			}):Play()
		end)
		claimBtn.MouseLeave:Connect(function()
			TweenService:Create(claimBtn, TweenInfo.new(0.2), {
				BackgroundColor3 = Color3.fromRGB(80, 180, 80),
			}):Play()
		end)
	end
	return card
end
-- Claim quest reward
function claimQuest(questId)
	local remotes = ReplicatedStorage:FindFirstChild("DragonRemotes")
	if not remotes then
		return nil
	end
	local claimRemote = remotes:FindFirstChild("ClaimQuestReward")
	if not claimRemote then
		return nil
	end
	local result = claimRemote:InvokeServer(questId)
	if result.success then
		print(`✅ Quest claimed: {questId}`)
		refreshQuests("daily")
	else
		print(`❌ Failed to claim: {result.error}`)
	end
end
-- Refresh quest list
function refreshQuests(questType)
	local screenGui = PlayerGui:FindFirstChild("QuestUI")
	if not screenGui then
		return nil
	end
	local container = screenGui:FindFirstChild("Container")
	if not container then
		return nil
	end
	local questList = container:FindFirstChild("QuestList")
	if not questList then
		return nil
	end
	-- Clear existing quests
	for _, child in questList:GetChildren() do
		if child:IsA("Frame") then
			child:Destroy()
		end
	end
	-- Get quests from server
	local remotes = ReplicatedStorage:FindFirstChild("DragonRemotes")
	if not remotes then
		return nil
	end
	local getQuestsRemote = remotes:FindFirstChild("GetQuests")
	if not getQuestsRemote then
		return nil
	end
	local quests = getQuestsRemote:InvokeServer()
	-- Filter by type
	-- ▼ ReadonlyArray.filter ▼
	local _newValue = {}
	local _callback = function(q)
		return q.type == questType
	end
	local _length = 0
	for _k, _v in quests do
		if _callback(_v, _k - 1, quests) == true then
			_length += 1
			_newValue[_length] = _v
		end
	end
	-- ▲ ReadonlyArray.filter ▲
	local filtered = _newValue
	-- Create cards
	-- ▼ ReadonlyArray.forEach ▼
	local _callback_1 = function(quest, index)
		local card = createQuestCard(quest, index)
		card.Parent = questList
	end
	for _k, _v in filtered do
		_callback_1(_v, _k - 1, filtered)
	end
	-- ▲ ReadonlyArray.forEach ▲
	-- Update canvas size
	local listLayout = questList:FindFirstChildOfClass("UIListLayout")
	if listLayout then
		questList.CanvasSize = UDim2.new(0, 0, 0, listLayout.AbsoluteContentSize.Y + 10)
	end
end
-- Setup periodic quest refresh
function setupQuestRefresh(screenGui)
	-- Refresh when GUI becomes visible
	screenGui:GetPropertyChangedSignal("Enabled"):Connect(function()
		if screenGui.Enabled then
			refreshQuests("daily")
		end
	end)
end
return {
	setupQuestUI = setupQuestUI,
}
