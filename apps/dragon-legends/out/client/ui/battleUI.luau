-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Battle UI (Client)
-- Combat interface with HP bars, moves, and battle log
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local ReplicatedStorage = _services.ReplicatedStorage
local TweenService = _services.TweenService
local GAME_THEME = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "theme").GAME_THEME
local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")
-- Current battle state
local currentBattle
-- Create battle UI
local createHPBar, createMoveButton, sendBattleAction
local function setupBattleUI()
	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "BattleUI"
	screenGui.ResetOnSpawn = false
	screenGui.Enabled = false
	screenGui.Parent = PlayerGui
	-- Battle container
	local container = Instance.new("Frame")
	container.Name = "BattleContainer"
	container.Size = UDim2.new(1, 0, 1, 0)
	container.BackgroundTransparency = 1
	container.Parent = screenGui
	-- Player dragon HP bar (bottom left)
	local playerHP = createHPBar("PlayerHP", UDim2.new(0, 20, 1, -120), true)
	playerHP.Parent = container
	-- Enemy dragon HP bar (top right)
	local enemyHP = createHPBar("EnemyHP", UDim2.new(1, -320, 0, 20), false)
	enemyHP.Parent = container
	-- Move buttons (bottom center)
	local moveContainer = Instance.new("Frame")
	moveContainer.Name = "MoveContainer"
	moveContainer.Size = UDim2.new(0, 400, 0, 120)
	moveContainer.Position = UDim2.new(0.5, 0, 1, -140)
	moveContainer.AnchorPoint = Vector2.new(0.5, 0)
	moveContainer.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
	moveContainer.BackgroundTransparency = 0.2
	moveContainer.Parent = container
	local moveCorner = Instance.new("UICorner")
	moveCorner.CornerRadius = UDim.new(0, 15)
	moveCorner.Parent = moveContainer
	local moveStroke = Instance.new("UIStroke")
	moveStroke.Color = GAME_THEME.primary
	moveStroke.Thickness = 2
	moveStroke.Parent = moveContainer
	local moveLayout = Instance.new("UIListLayout")
	moveLayout.FillDirection = Enum.FillDirection.Horizontal
	moveLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
	moveLayout.VerticalAlignment = Enum.VerticalAlignment.Center
	moveLayout.Padding = UDim.new(0, 10)
	moveLayout.Parent = moveContainer
	-- Create move buttons
	for i = 0, 2 do
		createMoveButton(moveContainer, i)
	end
	-- Flee button
	local fleeBtn = Instance.new("TextButton")
	fleeBtn.Name = "FleeBtn"
	fleeBtn.Size = UDim2.new(0, 80, 0, 80)
	fleeBtn.BackgroundColor3 = Color3.fromRGB(150, 60, 60)
	fleeBtn.Text = "🏃 Flee"
	fleeBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
	fleeBtn.TextScaled = true
	fleeBtn.Font = Enum.Font.GothamBold
	fleeBtn.Parent = moveContainer
	local fleeBtnCorner = Instance.new("UICorner")
	fleeBtnCorner.CornerRadius = UDim.new(0, 10)
	fleeBtnCorner.Parent = fleeBtn
	fleeBtn.MouseButton1Click:Connect(function()
		sendBattleAction("flee")
	end)
	-- Battle log (right side)
	local battleLog = Instance.new("ScrollingFrame")
	battleLog.Name = "BattleLog"
	battleLog.Size = UDim2.new(0, 250, 0, 200)
	battleLog.Position = UDim2.new(1, -270, 0.5, -100)
	battleLog.BackgroundColor3 = Color3.fromRGB(20, 15, 30)
	battleLog.BackgroundTransparency = 0.3
	battleLog.ScrollBarThickness = 6
	battleLog.ScrollBarImageColor3 = GAME_THEME.primary
	battleLog.Parent = container
	local logCorner = Instance.new("UICorner")
	logCorner.CornerRadius = UDim.new(0, 10)
	logCorner.Parent = battleLog
	local logLayout = Instance.new("UIListLayout")
	logLayout.SortOrder = Enum.SortOrder.LayoutOrder
	logLayout.Padding = UDim.new(0, 5)
	logLayout.Parent = battleLog
	-- Turn indicator (top center)
	local turnIndicator = Instance.new("TextLabel")
	turnIndicator.Name = "TurnIndicator"
	turnIndicator.Size = UDim2.new(0, 200, 0, 40)
	turnIndicator.Position = UDim2.new(0.5, 0, 0, 10)
	turnIndicator.AnchorPoint = Vector2.new(0.5, 0)
	turnIndicator.BackgroundColor3 = Color3.fromRGB(40, 35, 55)
	turnIndicator.BackgroundTransparency = 0.3
	turnIndicator.Text = "Your Turn!"
	turnIndicator.TextColor3 = Color3.fromRGB(255, 255, 255)
	turnIndicator.TextScaled = true
	turnIndicator.Font = Enum.Font.GothamBold
	turnIndicator.Parent = container
	local turnCorner = Instance.new("UICorner")
	turnCorner.CornerRadius = UDim.new(0, 10)
	turnCorner.Parent = turnIndicator
end
-- Create HP bar
function createHPBar(name, position, isPlayer)
	local container = Instance.new("Frame")
	container.Name = name
	container.Size = UDim2.new(0, 300, 0, 80)
	container.Position = position
	container.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
	container.BackgroundTransparency = 0.2
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 12)
	corner.Parent = container
	local stroke = Instance.new("UIStroke")
	stroke.Color = if isPlayer then Color3.fromRGB(80, 150, 80) else Color3.fromRGB(150, 60, 60)
	stroke.Thickness = 2
	stroke.Parent = container
	-- Dragon name
	local nameLabel = Instance.new("TextLabel")
	nameLabel.Name = "DragonName"
	nameLabel.Size = UDim2.new(1, -20, 0, 25)
	nameLabel.Position = UDim2.new(0, 10, 0, 5)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text = if isPlayer then "Your Dragon" else "Wild Dragon"
	nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	nameLabel.TextXAlignment = Enum.TextXAlignment.Left
	nameLabel.TextScaled = true
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.Parent = container
	-- Level badge
	local levelBadge = Instance.new("TextLabel")
	levelBadge.Name = "Level"
	levelBadge.Size = UDim2.new(0, 50, 0, 20)
	levelBadge.Position = UDim2.new(1, -60, 0, 8)
	levelBadge.BackgroundColor3 = Color3.fromRGB(50, 45, 65)
	levelBadge.Text = "Lv.1"
	levelBadge.TextColor3 = Color3.fromRGB(200, 200, 200)
	levelBadge.TextScaled = true
	levelBadge.Font = Enum.Font.Gotham
	levelBadge.Parent = container
	local levelCorner = Instance.new("UICorner")
	levelCorner.CornerRadius = UDim.new(0, 5)
	levelCorner.Parent = levelBadge
	-- HP bar background
	local hpBg = Instance.new("Frame")
	hpBg.Name = "HPBackground"
	hpBg.Size = UDim2.new(1, -20, 0, 25)
	hpBg.Position = UDim2.new(0, 10, 0, 35)
	hpBg.BackgroundColor3 = Color3.fromRGB(50, 45, 65)
	hpBg.Parent = container
	local hpBgCorner = Instance.new("UICorner")
	hpBgCorner.CornerRadius = UDim.new(0, 6)
	hpBgCorner.Parent = hpBg
	-- HP bar fill
	local hpFill = Instance.new("Frame")
	hpFill.Name = "HPFill"
	hpFill.Size = UDim2.new(1, 0, 1, 0)
	hpFill.BackgroundColor3 = Color3.fromRGB(80, 200, 80)
	hpFill.Parent = hpBg
	local hpFillCorner = Instance.new("UICorner")
	hpFillCorner.CornerRadius = UDim.new(0, 6)
	hpFillCorner.Parent = hpFill
	-- HP text
	local hpText = Instance.new("TextLabel")
	hpText.Name = "HPText"
	hpText.Size = UDim2.new(1, 0, 1, 0)
	hpText.BackgroundTransparency = 1
	hpText.Text = "100 / 100"
	hpText.TextColor3 = Color3.fromRGB(255, 255, 255)
	hpText.TextStrokeTransparency = 0
	hpText.TextScaled = true
	hpText.Font = Enum.Font.GothamBold
	hpText.Parent = hpBg
	-- Element icon
	local elementIcon = Instance.new("TextLabel")
	elementIcon.Name = "Element"
	elementIcon.Size = UDim2.new(0, 25, 0, 25)
	elementIcon.Position = UDim2.new(0, 10, 0, 50)
	elementIcon.BackgroundTransparency = 1
	elementIcon.Text = "🔥"
	elementIcon.TextScaled = true
	elementIcon.Parent = container
	return container
end
-- Create move button
function createMoveButton(parent, index)
	local button = Instance.new("TextButton")
	button.Name = `Move{index}`
	button.Size = UDim2.new(0, 90, 0, 80)
	button.BackgroundColor3 = Color3.fromRGB(60, 55, 80)
	button.Text = `Attack {index + 1}`
	button.TextColor3 = Color3.fromRGB(255, 255, 255)
	button.TextScaled = true
	button.Font = Enum.Font.GothamBold
	button.Parent = parent
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 10)
	corner.Parent = button
	-- Hover effect
	button.MouseEnter:Connect(function()
		TweenService:Create(button, TweenInfo.new(0.2), {
			BackgroundColor3 = Color3.fromRGB(80, 75, 110),
		}):Play()
	end)
	button.MouseLeave:Connect(function()
		TweenService:Create(button, TweenInfo.new(0.2), {
			BackgroundColor3 = Color3.fromRGB(60, 55, 80),
		}):Play()
	end)
	-- Click to attack
	button.MouseButton1Click:Connect(function()
		sendBattleAction("attack", index)
	end)
	return button
end
-- Send battle action to server
local updateBattleUI, showBattleResult
function sendBattleAction(actionType, moveIndex)
	local remotes = ReplicatedStorage:FindFirstChild("DragonRemotes")
	if not remotes then
		return nil
	end
	local battleActionRemote = remotes:FindFirstChild("BattleAction")
	if not battleActionRemote then
		return nil
	end
	local result = battleActionRemote:InvokeServer(actionType, moveIndex)
	if result.success and result.battleState then
		updateBattleUI(result.battleState)
		if result.battleState.isFinished then
			showBattleResult(result.battleState)
		end
	end
end
-- Update battle UI with new state
local updateHPDisplay
function updateBattleUI(battle)
	currentBattle = battle
	local screenGui = PlayerGui:FindFirstChild("BattleUI")
	if not screenGui then
		return nil
	end
	local container = screenGui:FindFirstChild("BattleContainer")
	if not container then
		return nil
	end
	-- Update player HP
	local playerHP = container:FindFirstChild("PlayerHP")
	if playerHP and battle.playerDragons[1] then
		updateHPDisplay(playerHP, battle.playerDragons[1])
	end
	-- Update enemy HP
	local enemyHP = container:FindFirstChild("EnemyHP")
	if enemyHP and battle.opponentDragons[1] then
		updateHPDisplay(enemyHP, battle.opponentDragons[1])
	end
	-- Update turn indicator
	local turnIndicator = container:FindFirstChild("TurnIndicator")
	if turnIndicator then
		turnIndicator.Text = if battle.currentTurn == "player" then "Your Turn!" else "Enemy Turn..."
		turnIndicator.TextColor3 = if battle.currentTurn == "player" then Color3.fromRGB(100, 200, 100) else Color3.fromRGB(200, 100, 100)
	end
end
-- Update HP bar display
function updateHPDisplay(hpContainer, dragon)
	local nameLabel = hpContainer:FindFirstChild("DragonName")
	local levelBadge = hpContainer:FindFirstChild("Level")
	local hpBg = hpContainer:FindFirstChild("HPBackground")
	local elementIcon = hpContainer:FindFirstChild("Element")
	if nameLabel then
		nameLabel.Text = dragon.dragonId
	end
	if levelBadge then
		levelBadge.Text = `Lv.{dragon.level}`
	end
	if hpBg then
		local hpFill = hpBg:FindFirstChild("HPFill")
		local hpText = hpBg:FindFirstChild("HPText")
		local hpPercent = dragon.currentHp / dragon.maxHp
		if hpFill then
			TweenService:Create(hpFill, TweenInfo.new(0.3), {
				Size = UDim2.new(hpPercent, 0, 1, 0),
			}):Play()
			-- Color based on HP
			if hpPercent > 0.5 then
				hpFill.BackgroundColor3 = Color3.fromRGB(80, 200, 80)
			elseif hpPercent > 0.25 then
				hpFill.BackgroundColor3 = Color3.fromRGB(200, 200, 80)
			else
				hpFill.BackgroundColor3 = Color3.fromRGB(200, 80, 80)
			end
		end
		if hpText then
			hpText.Text = `{math.floor(dragon.currentHp)} / {dragon.maxHp}`
		end
	end
	if elementIcon then
		local elementEmojis = {
			fire = "🔥",
			water = "💧",
			ice = "❄️",
			electric = "⚡",
			nature = "🍃",
			shadow = "🌑",
			light = "✨",
		}
		local _condition = elementEmojis[dragon.element]
		if not (_condition ~= "" and _condition) then
			_condition = "🐉"
		end
		elementIcon.Text = _condition
	end
end
-- Show battle result
function showBattleResult(battle)
	local screenGui = PlayerGui:FindFirstChild("BattleUI")
	if not screenGui then
		return nil
	end
	-- Create result overlay
	local resultOverlay = Instance.new("Frame")
	resultOverlay.Name = "ResultOverlay"
	resultOverlay.Size = UDim2.new(1, 0, 1, 0)
	resultOverlay.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
	resultOverlay.BackgroundTransparency = 0.5
	resultOverlay.Parent = screenGui
	local resultPanel = Instance.new("Frame")
	resultPanel.Size = UDim2.new(0, 400, 0, 300)
	resultPanel.Position = UDim2.new(0.5, 0, 0.5, 0)
	resultPanel.AnchorPoint = Vector2.new(0.5, 0.5)
	resultPanel.BackgroundColor3 = Color3.fromRGB(30, 25, 40)
	resultPanel.Parent = resultOverlay
	local panelCorner = Instance.new("UICorner")
	panelCorner.CornerRadius = UDim.new(0, 20)
	panelCorner.Parent = resultPanel
	local _result = battle.result
	if _result ~= nil then
		_result = _result.winner
	end
	local isVictory = _result == "player"
	local resultIcon = Instance.new("TextLabel")
	resultIcon.Size = UDim2.new(1, 0, 0, 80)
	resultIcon.Position = UDim2.new(0, 0, 0, 30)
	resultIcon.BackgroundTransparency = 1
	resultIcon.Text = if isVictory then "🏆" else "💔"
	resultIcon.TextScaled = true
	resultIcon.Parent = resultPanel
	local resultText = Instance.new("TextLabel")
	resultText.Size = UDim2.new(1, -40, 0, 50)
	resultText.Position = UDim2.new(0, 20, 0, 120)
	resultText.BackgroundTransparency = 1
	resultText.Text = if isVictory then "Victory!" else "Defeated!"
	resultText.TextColor3 = if isVictory then Color3.fromRGB(100, 200, 100) else Color3.fromRGB(200, 100, 100)
	resultText.TextScaled = true
	resultText.Font = Enum.Font.GothamBold
	resultText.Parent = resultPanel
	if battle.result then
		local rewardText = Instance.new("TextLabel")
		rewardText.Size = UDim2.new(1, -40, 0, 30)
		rewardText.Position = UDim2.new(0, 20, 0, 175)
		rewardText.BackgroundTransparency = 1
		rewardText.Text = `+{battle.result.coinsGained} coins • +{battle.result.xpGained} XP`
		rewardText.TextColor3 = Color3.fromRGB(200, 200, 200)
		rewardText.TextScaled = true
		rewardText.Font = Enum.Font.Gotham
		rewardText.Parent = resultPanel
	end
	local continueBtn = Instance.new("TextButton")
	continueBtn.Size = UDim2.new(0, 150, 0, 45)
	continueBtn.Position = UDim2.new(0.5, 0, 1, -60)
	continueBtn.AnchorPoint = Vector2.new(0.5, 0)
	continueBtn.BackgroundColor3 = GAME_THEME.primary
	continueBtn.Text = "Continue"
	continueBtn.TextColor3 = Color3.fromRGB(0, 0, 0)
	continueBtn.TextScaled = true
	continueBtn.Font = Enum.Font.GothamBold
	continueBtn.Parent = resultPanel
	local btnCorner = Instance.new("UICorner")
	btnCorner.CornerRadius = UDim.new(0, 10)
	btnCorner.Parent = continueBtn
	continueBtn.MouseButton1Click:Connect(function()
		resultOverlay:Destroy()
		screenGui.Enabled = false
	end)
end
-- Show/hide battle UI
local function showBattleUI(battle)
	local screenGui = PlayerGui:FindFirstChild("BattleUI")
	if screenGui then
		screenGui.Enabled = true
		updateBattleUI(battle)
	end
end
local function hideBattleUI()
	local screenGui = PlayerGui:FindFirstChild("BattleUI")
	if screenGui then
		screenGui.Enabled = false
	end
end
return {
	setupBattleUI = setupBattleUI,
	showBattleUI = showBattleUI,
	hideBattleUI = hideBattleUI,
}
