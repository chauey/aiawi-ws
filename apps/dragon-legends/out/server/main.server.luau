-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Main Server Entry Point
-- Initializes all game systems
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local ReplicatedStorage = _services.ReplicatedStorage
local GAME_THEME = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "theme").GAME_THEME
local _config = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "config")
local GAME_CONFIG = _config.GAME_CONFIG
local DRAGONS = _config.DRAGONS
local getDragonIds = _config.getDragonIds
-- Import core systems
local _dataStore = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore")
local setupDataStore = _dataStore.setupDataStore
local getPlayerData = _dataStore.getPlayerData
local loadPlayerData = _dataStore.loadPlayerData
local _dragons = TS.import(script, game:GetService("ServerScriptService"), "Server", "dragons")
local setupDragonSystem = _dragons.setupDragonSystem
local createPlayerDragon = _dragons.createPlayerDragon
local spawnDragonForPlayer = _dragons.spawnDragonForPlayer
local getPlayerDragons = _dragons.getPlayerDragons
local setupEggSystem = TS.import(script, game:GetService("ServerScriptService"), "Server", "eggHatching").setupEggSystem
local setupCombatSystem = TS.import(script, game:GetService("ServerScriptService"), "Server", "combat").setupCombatSystem
local setupBreedingSystem = TS.import(script, game:GetService("ServerScriptService"), "Server", "breeding").setupBreedingSystem
local setupClanSystem = TS.import(script, game:GetService("ServerScriptService"), "Server", "clans").setupClanSystem
local setupDailyRewards = TS.import(script, game:GetService("ServerScriptService"), "Server", "dailyRewards").setupDailyRewards
local setupWorldBoss = TS.import(script, game:GetService("ServerScriptService"), "Server", "worldBoss").setupWorldBoss
local setupArenaSystem = TS.import(script, game:GetService("ServerScriptService"), "Server", "arena").setupArenaSystem
local setupTradingSystem = TS.import(script, game:GetService("ServerScriptService"), "Server", "trading").setupTradingSystem
local _quests = TS.import(script, game:GetService("ServerScriptService"), "Server", "quests")
local setupQuestSystem = _quests.setupQuestSystem
local updateQuestProgress = _quests.updateQuestProgress
local setupRegionSystem = TS.import(script, game:GetService("ServerScriptService"), "Server", "regions").setupRegionSystem
local setupAnalytics = TS.import(script, game:GetService("ServerScriptService"), "Server", "analytics").setupAnalytics
local setupAntiCheat = TS.import(script, game:GetService("ServerScriptService"), "Server", "antiCheat").setupAntiCheat
-- Create remote events folder
local function createRemoteEvents()
	local remotes = ReplicatedStorage:FindFirstChild("DragonRemotes")
	if not remotes then
		remotes = Instance.new("Folder")
		remotes.Name = "DragonRemotes"
		remotes.Parent = ReplicatedStorage
	end
end
-- Setup leaderstats for player (visual display)
local function setupLeaderstats(player)
	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	leaderstats.Parent = player
	local coins = Instance.new("IntValue")
	coins.Name = GAME_THEME.currency
	coins.Value = GAME_CONFIG.STARTING_COINS
	coins.Parent = leaderstats
	local gems = Instance.new("IntValue")
	gems.Name = GAME_THEME.secondaryCurrency
	gems.Value = GAME_CONFIG.STARTING_GEMS
	gems.Parent = leaderstats
	local dragons = Instance.new("IntValue")
	dragons.Name = "Dragons"
	dragons.Value = 0
	dragons.Parent = leaderstats
	print(`📊 Created leaderstats for {player.Name}`)
end
-- Update leaderstats from player data
local function updateLeaderstats(player)
	local data = getPlayerData(player)
	if not data then
		return nil
	end
	local leaderstats = player:FindFirstChild("leaderstats")
	if not leaderstats then
		return nil
	end
	local coins = leaderstats:FindFirstChild(GAME_THEME.currency)
	if coins then
		coins.Value = data.coins
	end
	local gems = leaderstats:FindFirstChild(GAME_THEME.secondaryCurrency)
	if gems then
		gems.Value = data.gems
	end
	local dragonCount = leaderstats:FindFirstChild("Dragons")
	if dragonCount then
		dragonCount.Value = #data.dragons
	end
end
-- Give starter dragon to new player
local function giveStarterDragon(player)
	local dragons = getPlayerDragons(player)
	-- Only give starter if player has no dragons
	if #dragons == 0 then
		-- List of possible starters
		local starters = { "fire_drake_baby", "water_wyrm_baby", "frost_drake_baby", "nature_spirit_baby" }
		-- Random starter
		local starterDragonId = starters[math.floor(math.random() * #starters) + 1]
		local dragon = createPlayerDragon(player, starterDragonId, false)
		if dragon then
			local _exp = player.Name
			local _result = DRAGONS[starterDragonId]
			if _result ~= nil then
				_result = _result.name
			end
			print(`🐣 {_exp} received starter dragon: {_result}`)
			-- Set as active
			local data = getPlayerData(player)
			if data then
				data.activeDragonSlots = { dragon.instanceId, nil, nil }
			end
		end
	end
end
-- Spawn player's active dragon when they spawn
local function onCharacterAdded(player, character)
	-- Wait a bit for character to fully load
	task.delay(1, function()
		local dragons = getPlayerDragons(player)
		local data = getPlayerData(player)
		if data and #dragons > 0 then
			-- Spawn first active dragon
			-- ▼ ReadonlyArray.find ▼
			local _callback = function(d)
				return d.instanceId == data.activeDragonSlots[1]
			end
			local _result
			for _i, _v in dragons do
				if _callback(_v, _i - 1, dragons) == true then
					_result = _v
					break
				end
			end
			-- ▲ ReadonlyArray.find ▲
			local _condition = _result
			if not _condition then
				_condition = dragons[1]
			end
			local activeDragon = _condition
			spawnDragonForPlayer(player, activeDragon)
		end
		-- Update leaderstats
		updateLeaderstats(player)
	end)
end
-- Handle player joining
local onPlayerAdded = TS.async(function(player)
	-- Setup leaderstats immediately
	setupLeaderstats(player)
	-- Load player data
	TS.await(loadPlayerData(player))
	-- Give starter dragon if needed
	giveStarterDragon(player)
	-- Connect to character spawn
	player.CharacterAdded:Connect(function(character)
		onCharacterAdded(player, character)
	end)
	-- Handle existing character
	if player.Character then
		onCharacterAdded(player, player.Character)
	end
	print(`👋 {player.Name} joined {GAME_THEME.name}!`)
end)
-- Track coins for quests
local function setupCoinTracking()
	-- Periodically track coin changes for quests
	task.spawn(function()
		local lastCoins = {}
		while true do
			task.wait(5)
			for _, player in Players:GetPlayers() do
				local data = getPlayerData(player)
				if data then
					local _userId = player.UserId
					local _condition = lastCoins[_userId]
					if not (_condition ~= 0 and _condition == _condition and _condition) then
						_condition = 0
					end
					local last = _condition
					if data.coins > last then
						local gained = data.coins - last
						updateQuestProgress(player, "coins_collected", gained)
					end
					local _userId_1 = player.UserId
					local _coins = data.coins
					lastCoins[_userId_1] = _coins
					-- Update leaderstats
					updateLeaderstats(player)
				end
			end
		end
	end)
end
-- Initialize game
local init = TS.async(function()
	print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	print(`🐉 {GAME_THEME.name} - Server Starting!`)
	print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	-- Create remote events folder first
	createRemoteEvents()
	-- Initialize core systems
	setupDataStore()
	print("   ✓ Data Store")
	setupDragonSystem()
	print("   ✓ Dragon System")
	setupEggSystem()
	print("   ✓ Egg Hatching")
	setupCombatSystem()
	print("   ✓ Combat System")
	setupBreedingSystem()
	print("   ✓ Breeding System")
	setupClanSystem()
	print("   ✓ Clan System")
	setupDailyRewards()
	print("   ✓ Daily Rewards")
	setupWorldBoss()
	print("   ✓ World Boss")
	setupArenaSystem()
	print("   ✓ Arena PvP")
	setupTradingSystem()
	print("   ✓ Trading System")
	setupQuestSystem()
	print("   ✓ Quest System")
	setupRegionSystem()
	print("   ✓ Region System")
	-- Production systems
	setupAnalytics()
	print("   ✓ Analytics")
	setupAntiCheat()
	print("   ✓ Anti-Cheat")
	-- Setup coin tracking for quests
	setupCoinTracking()
	print("   ✓ Quest Tracking")
	-- Handle existing players
	for _, player in Players:GetPlayers() do
		task.spawn(TS.async(function()
			TS.await(onPlayerAdded(player))
		end))
	end
	-- Handle new players
	Players.PlayerAdded:Connect(function(player)
		task.spawn(TS.async(function()
			TS.await(onPlayerAdded(player))
		end))
	end)
	print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	print(`✅ {GAME_THEME.name} Ready! 14 systems loaded!`)
	print(`   {#getDragonIds()} dragons available`)
	print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
end)
-- Start
init()
