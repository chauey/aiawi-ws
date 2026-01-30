-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Data Store (Server)
-- Player data persistence using DataStoreService
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local DataStoreService = _services.DataStoreService
local Players = _services.Players
local GAME_CONFIG = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "config").GAME_CONFIG
-- Data stores
local playerDataStore
TS.try(function()
	playerDataStore = DataStoreService:GetDataStore("DragonLegendsPlayerData_v1")
end, function(e)
	warn("DataStore not available (Studio mode or offline)")
end)
-- In-memory cache for faster access
local playerDataCache = {}
-- Default player data
local function createDefaultPlayerData()
	return {
		coins = GAME_CONFIG.STARTING_COINS,
		gems = GAME_CONFIG.STARTING_GEMS,
		dragons = {},
		activeDragonSlots = { nil, nil, nil },
		playerLevel = 1,
		playerXp = 0,
		unlockedRegions = { "starter_meadow" },
		lastLoginDate = "",
		loginStreak = 0,
		dailyQuestsCompleted = {},
		lastDailyReset = 0,
		totalBattlesWon = 0,
		totalBattlesLost = 0,
		dragonsHatched = 0,
		dragonsEvolved = 0,
		dragonsTraded = 0,
		arenaRating = 1000,
		arenaWins = 0,
		arenaLosses = 0,
		bestArenaRank = 0,
		achievements = {},
		musicEnabled = true,
		sfxEnabled = true,
	}
end
-- Load player data
local loadPlayerData = TS.async(function(player)
	-- Check cache first
	local _userId = player.UserId
	local cached = playerDataCache[_userId]
	if cached then
		return cached
	end
	local data = createDefaultPlayerData()
	if playerDataStore then
		TS.try(function()
			local result = { playerDataStore:GetAsync(`player_{player.UserId}`) }
			local savedData = result
			if savedData then
				-- Merge with defaults to handle new fields
				local _object = table.clone(data)
				setmetatable(_object, nil)
				for _k, _v in savedData do
					_object[_k] = _v
				end
				data = _object
			end
		end, function(e)
			warn(`Failed to load data for {player.Name}: {e}`)
		end)
	end
	local _userId_1 = player.UserId
	local _data = data
	playerDataCache[_userId_1] = _data
	return data
end)
-- Save player data
local savePlayerData = TS.async(function(player)
	local _userId = player.UserId
	local data = playerDataCache[_userId]
	if not data then
		return false
	end
	if playerDataStore then
		local _exitType, _returns = TS.try(function()
			playerDataStore:SetAsync(`player_{player.UserId}`, data)
			return TS.TRY_RETURN, { true }
		end, function(e)
			warn(`Failed to save data for {player.Name}: {e}`)
			return TS.TRY_RETURN, { false }
		end)
		if _exitType then
			return unpack(_returns)
		end
	end
	return true
end)
-- Get player data (sync)
local function getPlayerData(player)
	local _userId = player.UserId
	return playerDataCache[_userId]
end
-- Update player data
local function updatePlayerData(player, data)
	local _userId = player.UserId
	local existing = playerDataCache[_userId]
	if existing then
		local _object = table.clone(existing)
		setmetatable(_object, nil)
		for _k, _v in data do
			_object[_k] = _v
		end
		local updated = _object
		local _userId_1 = player.UserId
		playerDataCache[_userId_1] = updated
	end
end
-- Add coins
local function addCoins(player, amount)
	local data = getPlayerData(player)
	if data then
		data.coins += amount
		print(`💰 {player.Name} +{amount} coins! Total: {data.coins}`)
	end
end
-- Add gems
local function addGems(player, amount)
	local data = getPlayerData(player)
	if data then
		data.gems += amount
		print(`💎 {player.Name} +{amount} gems! Total: {data.gems}`)
	end
end
-- Spend coins
local function spendCoins(player, amount)
	local data = getPlayerData(player)
	if not data or data.coins < amount then
		return false
	end
	data.coins -= amount
	return true
end
-- Spend gems
local function spendGems(player, amount)
	local data = getPlayerData(player)
	if not data or data.gems < amount then
		return false
	end
	data.gems -= amount
	return true
end
-- Add player XP
local function addPlayerXP(player, amount)
	local data = getPlayerData(player)
	if not data then
		return false
	end
	data.playerXp += amount
	-- Check for level up
	local xpNeeded = data.playerLevel * 1000
	if data.playerXp >= xpNeeded then
		data.playerLevel += 1
		data.playerXp -= xpNeeded
		print(`⬆️ {player.Name} leveled up to {data.playerLevel}!`)
		return true
	end
	return false
end
-- Unlock region
local function unlockRegion(player, regionId)
	local data = getPlayerData(player)
	if not data then
		return false
	end
	local _unlockedRegions = data.unlockedRegions
	local _regionId = regionId
	if not (table.find(_unlockedRegions, _regionId) ~= nil) then
		local _unlockedRegions_1 = data.unlockedRegions
		local _regionId_1 = regionId
		table.insert(_unlockedRegions_1, _regionId_1)
		print(`🗺️ {player.Name} unlocked {regionId}!`)
		return true
	end
	return false
end
-- Add dragon to player data
local function addDragonToData(player, dragon)
	local data = getPlayerData(player)
	if data then
		local _dragons = data.dragons
		local _dragon = dragon
		table.insert(_dragons, _dragon)
	end
end
-- Get player dragons from data
local function getDragonsFromData(player)
	local data = getPlayerData(player)
	local _result = data
	if _result ~= nil then
		_result = _result.dragons
	end
	local _condition = _result
	if not _condition then
		_condition = {}
	end
	return _condition
end
-- Auto-save interval
local AUTO_SAVE_INTERVAL = 60
-- Setup data store system
local function setupDataStore()
	-- Load data for existing players
	local _exp = Players:GetPlayers()
	-- ▼ ReadonlyArray.forEach ▼
	local _callback = function(player)
		task.spawn(TS.async(function()
			TS.await(loadPlayerData(player))
			print(`📁 Loaded data for {player.Name}`)
		end))
	end
	for _k, _v in _exp do
		_callback(_v, _k - 1, _exp)
	end
	-- ▲ ReadonlyArray.forEach ▲
	-- Load data for new players
	Players.PlayerAdded:Connect(function(player)
		task.spawn(TS.async(function()
			TS.await(loadPlayerData(player))
			print(`📁 Loaded data for {player.Name}`)
		end))
	end)
	-- Save data when player leaves
	Players.PlayerRemoving:Connect(function(player)
		task.spawn(TS.async(function()
			TS.await(savePlayerData(player))
			local _userId = player.UserId
			playerDataCache[_userId] = nil
			print(`💾 Saved data for {player.Name}`)
		end))
	end)
	-- Auto-save loop
	task.spawn(function()
		while true do
			task.wait(AUTO_SAVE_INTERVAL)
			for _, player in Players:GetPlayers() do
				task.spawn(TS.async(function()
					TS.await(savePlayerData(player))
				end))
			end
		end
	end)
	-- Save all on shutdown
	game:BindToClose(function()
		for _, player in Players:GetPlayers() do
			local _userId = player.UserId
			local data = playerDataCache[_userId]
			if data and playerDataStore then
				TS.try(function()
					playerDataStore:SetAsync(`player_{player.UserId}`, data)
				end, function(e)
					warn(`Failed to save on close: {e}`)
				end)
			end
		end
	end)
	print("💾 Data Store System initialized!")
end
return {
	loadPlayerData = loadPlayerData,
	savePlayerData = savePlayerData,
	getPlayerData = getPlayerData,
	updatePlayerData = updatePlayerData,
	addCoins = addCoins,
	addGems = addGems,
	spendCoins = spendCoins,
	spendGems = spendGems,
	addPlayerXP = addPlayerXP,
	unlockRegion = unlockRegion,
	addDragonToData = addDragonToData,
	getDragonsFromData = getDragonsFromData,
	setupDataStore = setupDataStore,
}
