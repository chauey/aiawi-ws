-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Region System (Server)
-- World regions with wild dragons, NPCs, and progression
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Workspace = _services.Workspace
local Lighting = _services.Lighting
local ReplicatedStorage = _services.ReplicatedStorage
local REGION_THEMES = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "theme").REGION_THEMES
local _dataStore = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore")
local getPlayerData = _dataStore.getPlayerData
local updatePlayerData = _dataStore.updatePlayerData
local spendCoins = _dataStore.spendCoins
local startWildBattle = TS.import(script, game:GetService("ServerScriptService"), "Server", "combat").startWildBattle
local getPlayerDragons = TS.import(script, game:GetService("ServerScriptService"), "Server", "dragons").getPlayerDragons
-- Region data with spawn points and wild dragons
local REGION_DATA = { {
	id = "starter_meadow",
	name = "Starter Meadow",
	position = Vector3.new(0, 0, 0),
	size = Vector3.new(300, 50, 300),
	wildDragons = { {
		dragonId = "fire_drake_baby",
		levelRange = { 1, 5 },
		spawnWeight = 30,
	}, {
		dragonId = "water_wyrm_baby",
		levelRange = { 1, 5 },
		spawnWeight = 30,
	}, {
		dragonId = "nature_spirit_baby",
		levelRange = { 1, 5 },
		spawnWeight = 25,
	}, {
		dragonId = "frost_drake_baby",
		levelRange = { 2, 6 },
		spawnWeight = 15,
	} },
}, {
	id = "mystic_forest",
	name = "Mystic Forest",
	position = Vector3.new(400, 0, 0),
	size = Vector3.new(400, 100, 400),
	wildDragons = { {
		dragonId = "nature_spirit_teen",
		levelRange = { 8, 15 },
		spawnWeight = 30,
	}, {
		dragonId = "shadow_serpent_baby",
		levelRange = { 10, 15 },
		spawnWeight = 20,
	}, {
		dragonId = "light_sprite_baby",
		levelRange = { 10, 15 },
		spawnWeight = 20,
	}, {
		dragonId = "fire_drake_teen",
		levelRange = { 10, 18 },
		spawnWeight = 15,
	}, {
		dragonId = "water_wyrm_teen",
		levelRange = { 10, 18 },
		spawnWeight = 15,
	} },
	bossSpawn = {
		dragonId = "nature_spirit_adult",
		level = 25,
	},
}, {
	id = "volcanic_peaks",
	name = "Volcanic Peaks",
	position = Vector3.new(-400, 0, 0),
	size = Vector3.new(500, 200, 500),
	wildDragons = { {
		dragonId = "fire_drake_teen",
		levelRange = { 15, 25 },
		spawnWeight = 35,
	}, {
		dragonId = "fire_drake_adult",
		levelRange = { 20, 30 },
		spawnWeight = 20,
	}, {
		dragonId = "thunder_dragon_baby",
		levelRange = { 18, 25 },
		spawnWeight = 15,
	}, {
		dragonId = "shadow_serpent_teen",
		levelRange = { 18, 28 },
		spawnWeight = 15,
	} },
	bossSpawn = {
		dragonId = "inferno_drake",
		level = 40,
	},
}, {
	id = "frozen_tundra",
	name = "Frozen Tundra",
	position = Vector3.new(0, 0, 400),
	size = Vector3.new(500, 100, 500),
	wildDragons = { {
		dragonId = "frost_drake_teen",
		levelRange = { 15, 25 },
		spawnWeight = 35,
	}, {
		dragonId = "frost_drake_adult",
		levelRange = { 20, 30 },
		spawnWeight = 20,
	}, {
		dragonId = "water_wyrm_adult",
		levelRange = { 22, 30 },
		spawnWeight = 15,
	}, {
		dragonId = "crystal_dragon",
		levelRange = { 25, 35 },
		spawnWeight = 5,
	} },
	bossSpawn = {
		dragonId = "blizzard_king",
		level = 45,
	},
}, {
	id = "storm_islands",
	name = "Storm Islands",
	position = Vector3.new(0, 0, -400),
	size = Vector3.new(600, 150, 600),
	wildDragons = { {
		dragonId = "thunder_dragon_teen",
		levelRange = { 25, 35 },
		spawnWeight = 30,
	}, {
		dragonId = "thunder_dragon_adult",
		levelRange = { 30, 40 },
		spawnWeight = 20,
	}, {
		dragonId = "water_wyrm_adult",
		levelRange = { 28, 38 },
		spawnWeight = 15,
	}, {
		dragonId = "light_sprite_teen",
		levelRange = { 28, 38 },
		spawnWeight = 15,
	} },
	bossSpawn = {
		dragonId = "storm_emperor",
		level = 50,
	},
}, {
	id = "crystal_caverns",
	name = "Crystal Caverns",
	position = Vector3.new(600, 0, 400),
	size = Vector3.new(400, 300, 400),
	wildDragons = { {
		dragonId = "crystal_dragon",
		levelRange = { 30, 40 },
		spawnWeight = 25,
	}, {
		dragonId = "light_sprite_adult",
		levelRange = { 32, 42 },
		spawnWeight = 20,
	}, {
		dragonId = "shadow_serpent_adult",
		levelRange = { 32, 42 },
		spawnWeight = 20,
	}, {
		dragonId = "cosmic_dragon",
		levelRange = { 40, 50 },
		spawnWeight = 5,
	} },
}, {
	id = "shadow_realm",
	name = "Shadow Realm",
	position = Vector3.new(-600, 0, -400),
	size = Vector3.new(500, 200, 500),
	wildDragons = { {
		dragonId = "shadow_serpent_adult",
		levelRange = { 35, 45 },
		spawnWeight = 30,
	}, {
		dragonId = "void_dragon",
		levelRange = { 40, 50 },
		spawnWeight = 10,
	}, {
		dragonId = "light_sprite_adult",
		levelRange = { 38, 48 },
		spawnWeight = 15,
	}, {
		dragonId = "celestial_dragon",
		levelRange = { 42, 50 },
		spawnWeight = 5,
	} },
	bossSpawn = {
		dragonId = "void_dragon",
		level = 50,
	},
}, {
	id = "celestial_sanctum",
	name = "Celestial Sanctum",
	position = Vector3.new(0, 0, 800),
	size = Vector3.new(400, 400, 400),
	wildDragons = { {
		dragonId = "celestial_dragon",
		levelRange = { 45, 50 },
		spawnWeight = 20,
	}, {
		dragonId = "cosmic_dragon",
		levelRange = { 45, 50 },
		spawnWeight = 15,
	}, {
		dragonId = "rainbow_dragon",
		levelRange = { 48, 50 },
		spawnWeight = 5,
	}, {
		dragonId = "chaos_lord",
		levelRange = { 50, 50 },
		spawnWeight = 1,
	} },
} }
-- Created region models
local regionModels = {}
-- Create region in world
local function createRegion(regionData)
	local model = Instance.new("Model")
	model.Name = `Region_{regionData.id}`
	-- Find theme
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(t)
		return t.id == regionData.id
	end
	local _result
	for _i, _v in REGION_THEMES do
		if _callback(_v, _i - 1, REGION_THEMES) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local _condition = _result
	if not _condition then
		_condition = REGION_THEMES[1]
	end
	local theme = _condition
	-- Create ground
	local ground = Instance.new("Part")
	ground.Name = "Ground"
	ground.Size = Vector3.new(regionData.size.X, 5, regionData.size.Z)
	ground.Position = regionData.position
	ground.BrickColor = BrickColor.new(if regionData.id == "volcanic_peaks" then "Dark stone grey" elseif regionData.id == "frozen_tundra" then "Institutional white" else "Bright green")
	ground.Material = if regionData.id == "volcanic_peaks" then Enum.Material.Rock elseif regionData.id == "frozen_tundra" then Enum.Material.Ice else Enum.Material.Grass
	ground.TopSurface = Enum.SurfaceType.Smooth
	ground.Anchored = true
	ground.Parent = model
	-- Create entrance portal/sign
	local entrance = Instance.new("Part")
	entrance.Name = "Entrance"
	entrance.Size = Vector3.new(10, 15, 2)
	local _position = regionData.position
	local _vector3 = Vector3.new(-regionData.size.X / 2 + 10, 10, 0)
	entrance.Position = _position + _vector3
	entrance.BrickColor = BrickColor.new("Medium stone grey")
	entrance.Material = Enum.Material.SmoothPlastic
	entrance.Anchored = true
	entrance.Parent = model
	-- Entrance sign
	local billboard = Instance.new("BillboardGui")
	billboard.Size = UDim2.new(0, 200, 0, 80)
	billboard.StudsOffset = Vector3.new(0, 5, 0)
	billboard.AlwaysOnTop = true
	local nameLabel = Instance.new("TextLabel")
	nameLabel.Size = UDim2.new(1, 0, 0.6, 0)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text = `{theme.emoji} {regionData.name}`
	nameLabel.TextColor3 = theme.color
	nameLabel.TextStrokeColor3 = Color3.fromRGB(0, 0, 0)
	nameLabel.TextStrokeTransparency = 0
	nameLabel.TextScaled = true
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.Parent = billboard
	-- Find unlock cost
	-- ▼ ReadonlyArray.find ▼
	local _callback_1 = function(t)
		return t.id == regionData.id
	end
	local _result_1
	for _i, _v in REGION_THEMES do
		if _callback_1(_v, _i - 1, REGION_THEMES) == true then
			_result_1 = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local _result_2 = _result_1
	if _result_2 ~= nil then
		_result_2 = _result_2.unlockCost
	end
	local _condition_1 = _result_2
	if not (_condition_1 ~= 0 and _condition_1 == _condition_1 and _condition_1) then
		_condition_1 = 0
	end
	local unlockCost = _condition_1
	local costLabel = Instance.new("TextLabel")
	costLabel.Size = UDim2.new(1, 0, 0.4, 0)
	costLabel.Position = UDim2.new(0, 0, 0.6, 0)
	costLabel.BackgroundTransparency = 1
	costLabel.Text = if unlockCost > 0 then `🔒 {unlockCost} coins to unlock` else "✅ Open"
	costLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	costLabel.TextStrokeTransparency = 0
	costLabel.TextScaled = true
	costLabel.Font = Enum.Font.Gotham
	costLabel.Parent = billboard
	billboard.Parent = entrance
	-- Spawn wild dragon encounter points
	for i = 0, 4 do
		local spawnPoint = Instance.new("Part")
		spawnPoint.Name = `WildSpawn_{i}`
		spawnPoint.Size = Vector3.new(5, 0.5, 5)
		local _position_1 = regionData.position
		local _vector3_1 = Vector3.new(math.random(-regionData.size.X / 3, regionData.size.X / 3), 0.5, math.random(-regionData.size.Z / 3, regionData.size.Z / 3))
		spawnPoint.Position = _position_1 + _vector3_1
		spawnPoint.BrickColor = BrickColor.new("Bright red")
		spawnPoint.Material = Enum.Material.Neon
		spawnPoint.Transparency = 0.5
		spawnPoint.Anchored = true
		spawnPoint.Parent = model
		-- Add particles
		local particles = Instance.new("ParticleEmitter")
		particles.Color = ColorSequence.new(Color3.fromRGB(255, 100, 100))
		particles.Size = NumberSequence.new(0.5)
		particles.Rate = 2
		particles.Lifetime = NumberRange.new(1, 2)
		particles.Speed = NumberRange.new(2, 4)
		particles.Parent = spawnPoint
	end
	model.Parent = Workspace
	return model
end
-- Select wild dragon based on weights
local function selectWildDragon(region)
	local _exp = region.wildDragons
	-- ▼ ReadonlyArray.reduce ▼
	local _result = 0
	local _callback = function(sum, d)
		return sum + d.spawnWeight
	end
	for _i = 1, #_exp do
		_result = _callback(_result, _exp[_i], _i - 1, _exp)
	end
	-- ▲ ReadonlyArray.reduce ▲
	local totalWeight = _result
	local random = math.random() * totalWeight
	for _, dragon in region.wildDragons do
		random -= dragon.spawnWeight
		if random <= 0 then
			local level = math.random(dragon.levelRange[1], dragon.levelRange[2])
			return {
				dragonId = dragon.dragonId,
				level = level,
			}
		end
	end
	return nil
end
-- Check if player can enter region
local function canEnterRegion(player, regionId)
	local playerData = getPlayerData(player)
	if not playerData then
		return false
	end
	local _unlockedRegions = playerData.unlockedRegions
	local _regionId = regionId
	return table.find(_unlockedRegions, _regionId) ~= nil
end
-- Unlock region
local function unlockRegion(player, regionId)
	local playerData = getPlayerData(player)
	if not playerData then
		return {
			success = false,
			error = "Player data not found",
		}
	end
	local _unlockedRegions = playerData.unlockedRegions
	local _regionId = regionId
	if table.find(_unlockedRegions, _regionId) ~= nil then
		return {
			success = false,
			error = "Already unlocked",
		}
	end
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(t)
		return t.id == regionId
	end
	local _result
	for _i, _v in REGION_THEMES do
		if _callback(_v, _i - 1, REGION_THEMES) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local theme = _result
	if not theme then
		return {
			success = false,
			error = "Region not found",
		}
	end
	if not spendCoins(player, theme.unlockCost) then
		return {
			success = false,
			error = "Not enough coins",
		}
	end
	local _unlockedRegions_1 = playerData.unlockedRegions
	local _regionId_1 = regionId
	table.insert(_unlockedRegions_1, _regionId_1)
	updatePlayerData(player, playerData)
	print(`🗺️ {player.Name} unlocked {theme.name}!`)
	return {
		success = true,
	}
end
-- Start wild encounter
local function startWildEncounter(player, regionId)
	if not canEnterRegion(player, regionId) then
		return {
			success = false,
			error = "Region not unlocked",
		}
	end
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(r)
		return r.id == regionId
	end
	local _result
	for _i, _v in REGION_DATA do
		if _callback(_v, _i - 1, REGION_DATA) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local region = _result
	if not region then
		return {
			success = false,
			error = "Region not found",
		}
	end
	local wild = selectWildDragon(region)
	if not wild then
		return {
			success = false,
			error = "No wild dragons available",
		}
	end
	-- Get player's active dragon
	local dragons = getPlayerDragons(player)
	local playerData = getPlayerData(player)
	if not playerData or #dragons == 0 then
		return {
			success = false,
			error = "No dragons to battle with",
		}
	end
	-- ▼ ReadonlyArray.find ▼
	local _callback_1 = function(d)
		return d.instanceId == playerData.activeDragonSlots[1]
	end
	local _result_1
	for _i, _v in dragons do
		if _callback_1(_v, _i - 1, dragons) == true then
			_result_1 = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local _condition = _result_1
	if not _condition then
		_condition = dragons[1]
	end
	local activeDragon = _condition
	local battleState = startWildBattle(player, activeDragon, wild.dragonId, wild.level)
	if not battleState then
		return {
			success = false,
			error = "Failed to start battle",
		}
	end
	return {
		success = true,
		battleState = battleState,
	}
end
-- Get region info
local function getRegionInfo(regionId)
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(r)
		return r.id == regionId
	end
	local _result
	for _i, _v in REGION_DATA do
		if _callback(_v, _i - 1, REGION_DATA) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	return _result
end
-- Get all regions
local function getAllRegions()
	return REGION_DATA
end
-- Setup environment
local function setupEnvironment()
	-- Dragon-themed sunset sky
	Lighting.ClockTime = 17.5
	Lighting.GeographicLatitude = 40
	Lighting.Ambient = Color3.new(0.3, 0.2, 0.25)
	Lighting.OutdoorAmbient = Color3.new(0.4, 0.3, 0.35)
	Lighting.ColorShift_Top = Color3.new(1, 0.6, 0.5)
	local atmosphere = Instance.new("Atmosphere")
	atmosphere.Density = 0.35
	atmosphere.Offset = 0.2
	atmosphere.Color = Color3.new(0.8, 0.5, 0.6)
	atmosphere.Decay = Color3.new(0.8, 0.4, 0.5)
	atmosphere.Glare = 0.6
	atmosphere.Haze = 2
	atmosphere.Parent = Lighting
	local sky = Instance.new("Sky")
	sky.SunAngularSize = 18
	sky.MoonAngularSize = 8
	sky.Parent = Lighting
	print("🌅 Dragon Legends environment created!")
end
-- Setup region system
local function setupRegionSystem()
	-- Setup environment
	setupEnvironment()
	-- Create all regions
	for _, region in REGION_DATA do
		local model = createRegion(region)
		local _id = region.id
		regionModels[_id] = model
	end
	-- Setup remote events
	local remotes = (ReplicatedStorage:FindFirstChild("DragonRemotes")) or Instance.new("Folder")
	remotes.Name = "DragonRemotes"
	remotes.Parent = ReplicatedStorage
	local unlockRegionRemote = Instance.new("RemoteFunction")
	unlockRegionRemote.Name = "UnlockRegion"
	unlockRegionRemote.Parent = remotes
	local startEncounterRemote = Instance.new("RemoteFunction")
	startEncounterRemote.Name = "StartWildEncounter"
	startEncounterRemote.Parent = remotes
	local getRegionsRemote = Instance.new("RemoteFunction")
	getRegionsRemote.Name = "GetRegions"
	getRegionsRemote.Parent = remotes
	unlockRegionRemote.OnServerInvoke = function(player, regionId)
		local _regionId = regionId
		if not (type(_regionId) == "string") then
			return {
				success = false,
				error = "Invalid region",
			}
		end
		return unlockRegion(player, regionId)
	end
	startEncounterRemote.OnServerInvoke = function(player, regionId)
		local _regionId = regionId
		if not (type(_regionId) == "string") then
			return {
				success = false,
				error = "Invalid region",
			}
		end
		return startWildEncounter(player, regionId)
	end
	getRegionsRemote.OnServerInvoke = function(player)
		local playerData = getPlayerData(player)
		-- ▼ ReadonlyArray.map ▼
		local _newValue = table.create(#REGION_DATA)
		local _callback = function(r)
			local _object = table.clone(r)
			setmetatable(_object, nil)
			local _left = "isUnlocked"
			local _result = playerData
			if _result ~= nil then
				local _unlockedRegions = _result.unlockedRegions
				local _id = r.id
				_result = table.find(_unlockedRegions, _id) ~= nil
			end
			local _condition = _result
			if _condition == nil then
				_condition = false
			end
			_object[_left] = _condition
			return _object
		end
		for _k, _v in REGION_DATA do
			_newValue[_k] = _callback(_v, _k - 1, REGION_DATA)
		end
		-- ▲ ReadonlyArray.map ▲
		return _newValue
	end
	print(`🗺️ Region System initialized! {#REGION_DATA} regions loaded.`)
end
return {
	canEnterRegion = canEnterRegion,
	unlockRegion = unlockRegion,
	startWildEncounter = startWildEncounter,
	getRegionInfo = getRegionInfo,
	getAllRegions = getAllRegions,
	setupRegionSystem = setupRegionSystem,
}
