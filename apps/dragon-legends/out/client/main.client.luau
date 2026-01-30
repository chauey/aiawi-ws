-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Client Main Entry
-- Client-side UI and input handling
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local ReplicatedStorage = _services.ReplicatedStorage
local UserInputService = _services.UserInputService
local GAME_THEME = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "theme").GAME_THEME
local setupMainHUD = TS.import(script, script.Parent, "ui", "mainHUD").setupMainHUD
local setupDragonMenu = TS.import(script, script.Parent, "ui", "dragonMenu").setupDragonMenu
local setupEggShop = TS.import(script, script.Parent, "ui", "eggShop").setupEggShop
local setupBattleUI = TS.import(script, script.Parent, "ui", "battleUI").setupBattleUI
local setupClanUI = TS.import(script, script.Parent, "ui", "clanUI").setupClanUI
local setupQuestUI = TS.import(script, script.Parent, "ui", "questUI").setupQuestUI
local LocalPlayer = Players.LocalPlayer
-- Wait for remotes to be ready
local function waitForRemotes()
	while not ReplicatedStorage:FindFirstChild("DragonRemotes") do
		task.wait(0.1)
	end
end
-- Initialize client
local setupInputs
local function init()
	print(`🐉 {GAME_THEME.name} - Client Starting!`)
	-- Wait for remotes
	waitForRemotes()
	-- Setup all UI systems
	setupMainHUD()
	print("   ✓ Main HUD")
	setupDragonMenu()
	print("   ✓ Dragon Menu")
	setupEggShop()
	print("   ✓ Egg Shop")
	setupBattleUI()
	print("   ✓ Battle UI")
	setupClanUI()
	print("   ✓ Clan UI")
	setupQuestUI()
	print("   ✓ Quest UI")
	-- Setup input handling
	setupInputs()
	print(`✅ {GAME_THEME.name} Client Ready!`)
end
-- Setup keyboard shortcuts
local toggleDragonMenu, toggleEggShop, toggleQuestMenu, toggleClanMenu
function setupInputs()
	UserInputService.InputBegan:Connect(function(input, gameProcessed)
		if gameProcessed then
			return nil
		end
		-- E - Open Dragon Menu
		if input.KeyCode == Enum.KeyCode.E then
			toggleDragonMenu()
		end
		-- Q - Open Egg Shop
		if input.KeyCode == Enum.KeyCode.Q then
			toggleEggShop()
		end
		-- T - Open Quests
		if input.KeyCode == Enum.KeyCode.T then
			toggleQuestMenu()
		end
		-- G - Open Clan
		if input.KeyCode == Enum.KeyCode.G then
			toggleClanMenu()
		end
	end)
end
-- Toggle functions (placeholders, implemented in UI modules)
function toggleDragonMenu()
	local gui = LocalPlayer:WaitForChild("PlayerGui"):FindFirstChild("DragonMenu")
	if gui then
		gui.Enabled = not gui.Enabled
	end
end
function toggleEggShop()
	local gui = LocalPlayer:WaitForChild("PlayerGui"):FindFirstChild("EggShop")
	if gui then
		gui.Enabled = not gui.Enabled
	end
end
function toggleQuestMenu()
	local gui = LocalPlayer:WaitForChild("PlayerGui"):FindFirstChild("QuestUI")
	if gui then
		gui.Enabled = not gui.Enabled
	end
end
function toggleClanMenu()
	local gui = LocalPlayer:WaitForChild("PlayerGui"):FindFirstChild("ClanUI")
	if gui then
		gui.Enabled = not gui.Enabled
	end
end
-- Wait for character before initializing
if LocalPlayer.Character then
	init()
else
	LocalPlayer.CharacterAdded:Wait()
	init()
end
