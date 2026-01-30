-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Clan UI (Client)
-- View clans, create clans, manage membership
local Players = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Players
local GAME_THEME = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "theme").GAME_THEME
local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")
-- Create clan UI
local createTabButton, createMyClanTab, createBrowseTab, createLeaderboardTab
local function setupClanUI()
	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "ClanUI"
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
	container.Size = UDim2.new(0.7, 0, 0.8, 0)
	container.Position = UDim2.new(0.5, 0, 0.5, 0)
	container.AnchorPoint = Vector2.new(0.5, 0.5)
	container.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
	container.Parent = screenGui
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 20)
	corner.Parent = container
	local stroke = Instance.new("UIStroke")
	stroke.Color = Color3.fromRGB(200, 150, 100)
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
	title.Text = "🏰 Clans"
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
	tabContainer.Size = UDim2.new(1, -40, 0, 40)
	tabContainer.Position = UDim2.new(0, 20, 0, 70)
	tabContainer.BackgroundTransparency = 1
	tabContainer.Parent = container
	local tabLayout = Instance.new("UIListLayout")
	tabLayout.FillDirection = Enum.FillDirection.Horizontal
	tabLayout.Padding = UDim.new(0, 10)
	tabLayout.Parent = tabContainer
	createTabButton(tabContainer, "MyClan", "🏰 My Clan", true)
	createTabButton(tabContainer, "Browse", "🔍 Browse", false)
	createTabButton(tabContainer, "Leaderboard", "🏆 Leaderboard", false)
	-- Tab content
	local tabContent = Instance.new("Frame")
	tabContent.Name = "TabContent"
	tabContent.Size = UDim2.new(1, -40, 1, -140)
	tabContent.Position = UDim2.new(0, 20, 0, 120)
	tabContent.BackgroundTransparency = 1
	tabContent.Parent = container
	-- My Clan tab content
	createMyClanTab(tabContent)
	-- Browse tab content
	createBrowseTab(tabContent)
	-- Leaderboard tab content
	createLeaderboardTab(tabContent)
	-- Click overlay to close
	overlay.InputBegan:Connect(function(input)
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			screenGui.Enabled = false
		end
	end)
end
-- Create tab button
local switchTab
function createTabButton(parent, id, text, active)
	local button = Instance.new("TextButton")
	button.Name = `Tab_{id}`
	button.Size = UDim2.new(0, 140, 1, 0)
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
		switchTab(id)
	end)
	return button
end
-- Switch tabs
function switchTab(tabId)
	local screenGui = PlayerGui:FindFirstChild("ClanUI")
	if not screenGui then
		return nil
	end
	local container = screenGui:FindFirstChild("Container")
	if not container then
		return nil
	end
	local tabContent = container:FindFirstChild("TabContent")
	if not tabContent then
		return nil
	end
	-- Update tab buttons
	local tabContainer = container:FindFirstChild("TabContainer")
	if tabContainer then
		for _, child in tabContainer:GetChildren() do
			if child:IsA("TextButton") then
				child.BackgroundColor3 = if child.Name == `Tab_{tabId}` then Color3.fromRGB(60, 55, 80) else Color3.fromRGB(40, 35, 55)
			end
		end
	end
	-- Show/hide content
	for _, child in tabContent:GetChildren() do
		if child:IsA("Frame") then
			child.Visible = child.Name == `{tabId}Content`
		end
	end
end
-- Create My Clan tab
local showCreateClanDialog
function createMyClanTab(parent)
	local content = Instance.new("Frame")
	content.Name = "MyClanContent"
	content.Size = UDim2.new(1, 0, 1, 0)
	content.BackgroundTransparency = 1
	content.Visible = true
	content.Parent = parent
	-- No clan state
	local noClanFrame = Instance.new("Frame")
	noClanFrame.Name = "NoClanState"
	noClanFrame.Size = UDim2.new(1, 0, 1, 0)
	noClanFrame.BackgroundTransparency = 1
	noClanFrame.Parent = content
	local noClanIcon = Instance.new("TextLabel")
	noClanIcon.Size = UDim2.new(1, 0, 0, 100)
	noClanIcon.Position = UDim2.new(0, 0, 0, 50)
	noClanIcon.BackgroundTransparency = 1
	noClanIcon.Text = "🏰"
	noClanIcon.TextScaled = true
	noClanIcon.Parent = noClanFrame
	local noClanText = Instance.new("TextLabel")
	noClanText.Size = UDim2.new(1, -40, 0, 30)
	noClanText.Position = UDim2.new(0, 20, 0, 160)
	noClanText.BackgroundTransparency = 1
	noClanText.Text = "You are not in a clan"
	noClanText.TextColor3 = Color3.fromRGB(180, 180, 180)
	noClanText.TextScaled = true
	noClanText.Font = Enum.Font.Gotham
	noClanText.Parent = noClanFrame
	-- Create clan button
	local createBtn = Instance.new("TextButton")
	createBtn.Size = UDim2.new(0, 200, 0, 50)
	createBtn.Position = UDim2.new(0.5, -110, 0, 220)
	createBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 80)
	createBtn.Text = "Create Clan (1000 💰)"
	createBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
	createBtn.TextScaled = true
	createBtn.Font = Enum.Font.GothamBold
	createBtn.Parent = noClanFrame
	Instance.new("UICorner", createBtn).CornerRadius = UDim.new(0, 10)
	createBtn.MouseButton1Click:Connect(function()
		showCreateClanDialog()
	end)
	-- Browse clans button
	local browseBtn = Instance.new("TextButton")
	browseBtn.Size = UDim2.new(0, 200, 0, 50)
	browseBtn.Position = UDim2.new(0.5, 110, 0, 220)
	browseBtn.AnchorPoint = Vector2.new(1, 0)
	browseBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 150)
	browseBtn.Text = "Browse Clans"
	browseBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
	browseBtn.TextScaled = true
	browseBtn.Font = Enum.Font.GothamBold
	browseBtn.Parent = noClanFrame
	Instance.new("UICorner", browseBtn).CornerRadius = UDim.new(0, 10)
	browseBtn.MouseButton1Click:Connect(function()
		switchTab("Browse")
	end)
end
-- Create Browse tab
function createBrowseTab(parent)
	local content = Instance.new("Frame")
	content.Name = "BrowseContent"
	content.Size = UDim2.new(1, 0, 1, 0)
	content.BackgroundTransparency = 1
	content.Visible = false
	content.Parent = parent
	-- Search bar
	local searchContainer = Instance.new("Frame")
	searchContainer.Size = UDim2.new(1, 0, 0, 40)
	searchContainer.BackgroundColor3 = Color3.fromRGB(40, 35, 55)
	searchContainer.Parent = content
	Instance.new("UICorner", searchContainer).CornerRadius = UDim.new(0, 10)
	local searchInput = Instance.new("TextBox")
	searchInput.Name = "SearchInput"
	searchInput.Size = UDim2.new(1, -120, 1, -10)
	searchInput.Position = UDim2.new(0, 10, 0, 5)
	searchInput.BackgroundTransparency = 1
	searchInput.PlaceholderText = "Search clans..."
	searchInput.PlaceholderColor3 = Color3.fromRGB(120, 120, 120)
	searchInput.Text = ""
	searchInput.TextColor3 = Color3.fromRGB(255, 255, 255)
	searchInput.TextXAlignment = Enum.TextXAlignment.Left
	searchInput.TextScaled = true
	searchInput.Font = Enum.Font.Gotham
	searchInput.Parent = searchContainer
	local searchBtn = Instance.new("TextButton")
	searchBtn.Size = UDim2.new(0, 100, 1, -10)
	searchBtn.Position = UDim2.new(1, -105, 0, 5)
	searchBtn.BackgroundColor3 = GAME_THEME.primary
	searchBtn.Text = "🔍 Search"
	searchBtn.TextColor3 = Color3.fromRGB(0, 0, 0)
	searchBtn.TextScaled = true
	searchBtn.Font = Enum.Font.GothamBold
	searchBtn.Parent = searchContainer
	Instance.new("UICorner", searchBtn).CornerRadius = UDim.new(0, 8)
	-- Results list
	local resultsList = Instance.new("ScrollingFrame")
	resultsList.Name = "ResultsList"
	resultsList.Size = UDim2.new(1, 0, 1, -50)
	resultsList.Position = UDim2.new(0, 0, 0, 50)
	resultsList.BackgroundTransparency = 1
	resultsList.ScrollBarThickness = 8
	resultsList.ScrollBarImageColor3 = GAME_THEME.primary
	resultsList.Parent = content
	local listLayout = Instance.new("UIListLayout")
	listLayout.Padding = UDim.new(0, 10)
	listLayout.Parent = resultsList
end
-- Create Leaderboard tab
function createLeaderboardTab(parent)
	local content = Instance.new("Frame")
	content.Name = "LeaderboardContent"
	content.Size = UDim2.new(1, 0, 1, 0)
	content.BackgroundTransparency = 1
	content.Visible = false
	content.Parent = parent
	-- Header
	local headerFrame = Instance.new("Frame")
	headerFrame.Size = UDim2.new(1, 0, 0, 40)
	headerFrame.BackgroundColor3 = Color3.fromRGB(40, 35, 55)
	headerFrame.Parent = content
	Instance.new("UICorner", headerFrame).CornerRadius = UDim.new(0, 10)
	local rankLabel = Instance.new("TextLabel")
	rankLabel.Size = UDim2.new(0.1, 0, 1, 0)
	rankLabel.BackgroundTransparency = 1
	rankLabel.Text = "#"
	rankLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
	rankLabel.TextScaled = true
	rankLabel.Font = Enum.Font.GothamBold
	rankLabel.Parent = headerFrame
	local nameLabel = Instance.new("TextLabel")
	nameLabel.Size = UDim2.new(0.5, 0, 1, 0)
	nameLabel.Position = UDim2.new(0.1, 0, 0, 0)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text = "Clan"
	nameLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
	nameLabel.TextScaled = true
	nameLabel.TextXAlignment = Enum.TextXAlignment.Left
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.Parent = headerFrame
	local scoreLabel = Instance.new("TextLabel")
	scoreLabel.Size = UDim2.new(0.2, 0, 1, 0)
	scoreLabel.Position = UDim2.new(0.6, 0, 0, 0)
	scoreLabel.BackgroundTransparency = 1
	scoreLabel.Text = "War Score"
	scoreLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
	scoreLabel.TextScaled = true
	scoreLabel.Font = Enum.Font.GothamBold
	scoreLabel.Parent = headerFrame
	local membersLabel = Instance.new("TextLabel")
	membersLabel.Size = UDim2.new(0.2, 0, 1, 0)
	membersLabel.Position = UDim2.new(0.8, 0, 0, 0)
	membersLabel.BackgroundTransparency = 1
	membersLabel.Text = "Members"
	membersLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
	membersLabel.TextScaled = true
	membersLabel.Font = Enum.Font.GothamBold
	membersLabel.Parent = headerFrame
	-- Leaderboard list
	local leaderboardList = Instance.new("ScrollingFrame")
	leaderboardList.Name = "LeaderboardList"
	leaderboardList.Size = UDim2.new(1, 0, 1, -50)
	leaderboardList.Position = UDim2.new(0, 0, 0, 50)
	leaderboardList.BackgroundTransparency = 1
	leaderboardList.ScrollBarThickness = 8
	leaderboardList.ScrollBarImageColor3 = GAME_THEME.primary
	leaderboardList.Parent = content
	local listLayout = Instance.new("UIListLayout")
	listLayout.Padding = UDim.new(0, 5)
	listLayout.Parent = leaderboardList
end
-- Show create clan dialog
function showCreateClanDialog()
	-- In a real implementation, this would open a dialog
	-- For now, just print
	print("🏰 Create Clan dialog would open here")
end
return {
	setupClanUI = setupClanUI,
}
