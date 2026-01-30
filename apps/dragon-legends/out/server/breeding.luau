-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Breeding System (Server)
-- Dragon breeding with genetic inheritance and mutation
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local ReplicatedStorage = _services.ReplicatedStorage
local _config = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "config")
local DRAGONS = _config.DRAGONS
local GAME_CONFIG = _config.GAME_CONFIG
local _dragons = TS.import(script, game:GetService("ServerScriptService"), "Server", "dragons")
local createPlayerDragon = _dragons.createPlayerDragon
local getPlayerDragons = _dragons.getPlayerDragons
local _dataStore = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore")
local getPlayerData = _dataStore.getPlayerData
local updatePlayerData = _dataStore.updatePlayerData
-- Active breeding slots per player
local playerBreedingSlots = {}
-- Breeding outcomes based on parent elements
local HYBRID_OUTCOMES = {
	["fire+water"] = { "fire_drake_baby", "water_wyrm_baby" },
	["fire+ice"] = { "fire_drake_baby", "frost_drake_baby", "crystal_dragon" },
	["water+ice"] = { "water_wyrm_baby", "frost_drake_baby" },
	["electric+water"] = { "thunder_dragon_baby", "water_wyrm_baby" },
	["nature+water"] = { "nature_spirit_baby", "water_wyrm_baby" },
	["shadow+light"] = { "shadow_serpent_baby", "light_sprite_baby", "cosmic_dragon" },
	["fire+nature"] = { "fire_drake_baby", "nature_spirit_baby" },
	["electric+nature"] = { "thunder_dragon_baby", "nature_spirit_baby" },
}
-- Get breeding key (sorted to handle both directions)
local function getBreedingKey(elem1, elem2)
	local _exp = { elem1, elem2 }
	table.sort(_exp)
	local sorted = _exp
	return `{sorted[1]}+{sorted[2]}`
end
-- Determine breeding result
local function determineBreedingResult(dragon1, dragon2)
	-- Check for mutation (rare hybrid)
	local isMutation = math.random() < GAME_CONFIG.MUTATION_CHANCE
	-- Get hybrid key
	local key = getBreedingKey(dragon1.element, dragon2.element)
	local possibleOutcomes = HYBRID_OUTCOMES[key]
	-- If same element, offspring is same element
	if dragon1.element == dragon2.element then
		-- Find baby version of this element using pairs iteration
		local babyDragons = {}
		for _, d in pairs(DRAGONS) do
			if d.element == dragon1.element and d.evolutionStage == 1 then
				table.insert(babyDragons, d)
			end
		end
		if #babyDragons > 0 then
			-- ▼ ReadonlyArray.map ▼
			local _newValue = table.create(#babyDragons)
			local _callback = function(d)
				return d.id
			end
			for _k, _v in babyDragons do
				_newValue[_k] = _callback(_v, _k - 1, babyDragons)
			end
			-- ▲ ReadonlyArray.map ▲
			possibleOutcomes = _newValue
		end
	end
	-- Default to fire if no outcomes
	if not possibleOutcomes or #possibleOutcomes == 0 then
		possibleOutcomes = { "fire_drake_baby" }
	end
	-- If mutation, try for rare hybrid
	local selectedDragonId
	if isMutation and #possibleOutcomes > 2 then
		-- Pick the rare option (usually last in list)
		selectedDragonId = possibleOutcomes[#possibleOutcomes]
	else
		-- Pick random from common options
		-- ▼ ReadonlyArray.filter ▼
		local _newValue = {}
		local _callback = function(id)
			local def = DRAGONS[id]
			return def and (def.rarity == "Common" or def.rarity == "Rare")
		end
		local _length = 0
		for _k, _v in possibleOutcomes do
			if _callback(_v, _k - 1, possibleOutcomes) == true then
				_length += 1
				_newValue[_length] = _v
			end
		end
		-- ▲ ReadonlyArray.filter ▲
		local commonOutcomes = _newValue
		if #commonOutcomes > 0 then
			selectedDragonId = commonOutcomes[math.floor(math.random() * #commonOutcomes) + 1]
		else
			selectedDragonId = possibleOutcomes[1]
		end
	end
	-- Shiny chance increases with parent luck
	local combinedLuck = dragon1.stats.luck + dragon2.stats.luck
	local shinyChance = 0.01 + combinedLuck * 0.001
	local isShiny = math.random() < shinyChance
	return {
		dragonId = selectedDragonId,
		isShiny = isShiny,
		isMutation = isMutation,
	}
end
-- Start breeding two dragons
local function startBreeding(player, dragon1InstanceId, dragon2InstanceId)
	local dragons = getPlayerDragons(player)
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(d)
		return d.instanceId == dragon1InstanceId
	end
	local _result
	for _i, _v in dragons do
		if _callback(_v, _i - 1, dragons) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local dragon1 = _result
	-- ▼ ReadonlyArray.find ▼
	local _callback_1 = function(d)
		return d.instanceId == dragon2InstanceId
	end
	local _result_1
	for _i, _v in dragons do
		if _callback_1(_v, _i - 1, dragons) == true then
			_result_1 = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local dragon2 = _result_1
	if not dragon1 or not dragon2 then
		return {
			success = false,
			error = "Dragons not found",
		}
	end
	if dragon1.instanceId == dragon2.instanceId then
		return {
			success = false,
			error = "Cannot breed dragon with itself",
		}
	end
	-- Check evolution stage (must be adult or higher)
	if dragon1.evolutionStage < 3 or dragon2.evolutionStage < 3 then
		return {
			success = false,
			error = "Dragons must be adults to breed",
		}
	end
	-- Check breeding cooldown (max 3 breeds per dragon)
	if dragon1.breedCount >= 3 or dragon2.breedCount >= 3 then
		return {
			success = false,
			error = "Dragon has reached max breed count",
		}
	end
	-- Get or create breeding slots
	local _userId = player.UserId
	local slots = playerBreedingSlots[_userId]
	if not slots then
		slots = {}
		local _userId_1 = player.UserId
		local _slots = slots
		playerBreedingSlots[_userId_1] = _slots
	end
	-- Check if already breeding
	-- ▼ ReadonlyArray.some ▼
	local _result_2 = false
	local _callback_2 = function(s)
		return s.dragon1InstanceId == dragon1InstanceId or s.dragon2InstanceId == dragon2InstanceId or s.dragon1InstanceId == dragon2InstanceId or s.dragon2InstanceId == dragon1InstanceId
	end
	for _k, _v in slots do
		if _callback_2(_v, _k - 1, slots) then
			_result_2 = true
			break
		end
	end
	-- ▲ ReadonlyArray.some ▲
	local alreadyBreeding = _result_2
	if alreadyBreeding then
		return {
			success = false,
			error = "One of these dragons is already breeding",
		}
	end
	-- Calculate breeding time (minutes to seconds)
	local breedingTime = GAME_CONFIG.BREEDING_TIME_MINUTES * 60
	local startTime = os.time()
	local endTime = startTime + breedingTime
	-- Determine result ahead of time
	local result = determineBreedingResult(dragon1, dragon2)
	local slot = {
		slotId = #slots + 1,
		dragon1InstanceId = dragon1InstanceId,
		dragon2InstanceId = dragon2InstanceId,
		startTime = startTime,
		endTime = endTime,
		resultDragonId = result.dragonId,
		isShiny = result.isShiny,
	}
	table.insert(slots, slot)
	-- Increment breed counts
	dragon1.breedCount += 1
	dragon2.breedCount += 1
	print(`🥚 {player.Name} started breeding! Result ready in {GAME_CONFIG.BREEDING_TIME_MINUTES} minutes.`)
	return {
		success = true,
		slot = slot,
	}
end
-- Collect breeding result
local function collectBreedingResult(player, slotId)
	local _userId = player.UserId
	local slots = playerBreedingSlots[_userId]
	if not slots then
		return {
			success = false,
			error = "No breeding slots",
		}
	end
	-- ▼ ReadonlyArray.findIndex ▼
	local _callback = function(s)
		return s.slotId == slotId
	end
	local _result = -1
	for _i, _v in slots do
		if _callback(_v, _i - 1, slots) == true then
			_result = _i - 1
			break
		end
	end
	-- ▲ ReadonlyArray.findIndex ▲
	local slotIndex = _result
	if slotIndex == -1 then
		return {
			success = false,
			error = "Slot not found",
		}
	end
	local slot = slots[slotIndex + 1]
	-- Check if ready
	if os.time() < slot.endTime then
		local remaining = slot.endTime - os.time()
		local minutes = math.floor(remaining / 60)
		local seconds = remaining % 60
		return {
			success = false,
			error = `Not ready yet! {minutes}m {seconds}s remaining`,
		}
	end
	-- Create the dragon
	local _value = slot.resultDragonId
	if not (_value ~= "" and _value) then
		return {
			success = false,
			error = "No result dragon",
		}
	end
	local newDragon = createPlayerDragon(player, slot.resultDragonId, slot.isShiny)
	if not newDragon then
		return {
			success = false,
			error = "Failed to create dragon",
		}
	end
	-- Remove slot
	table.remove(slots, slotIndex + 1)
	-- Update stats
	local playerData = getPlayerData(player)
	if playerData then
		playerData.dragonsHatched += 1
		updatePlayerData(player, playerData)
	end
	local _exp = player.Name
	local _exp_1 = if slot.isShiny then "✨SHINY " else ""
	local _result_1 = DRAGONS[slot.resultDragonId]
	if _result_1 ~= nil then
		_result_1 = _result_1.name
	end
	print(`🐣 {_exp} collected {_exp_1}{_result_1}!`)
	return {
		success = true,
		dragon = newDragon,
	}
end
-- Get active breeding slots
local function getBreedingSlots(player)
	local _userId = player.UserId
	local _condition = playerBreedingSlots[_userId]
	if not _condition then
		_condition = {}
	end
	return _condition
end
-- Speed up breeding with gems
local function speedUpBreeding(player, slotId, gemCost)
	local _userId = player.UserId
	local slots = playerBreedingSlots[_userId]
	if not slots then
		return {
			success = false,
			error = "No breeding slots",
		}
	end
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(s)
		return s.slotId == slotId
	end
	local _result
	for _i, _v in slots do
		if _callback(_v, _i - 1, slots) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local slot = _result
	if not slot then
		return {
			success = false,
			error = "Slot not found",
		}
	end
	-- Check gems
	local playerData = getPlayerData(player)
	if not playerData or playerData.gems < gemCost then
		return {
			success = false,
			error = "Not enough gems",
		}
	end
	-- Deduct gems and complete instantly
	playerData.gems -= gemCost
	slot.endTime = os.time()
	updatePlayerData(player, playerData)
	print(`⚡ {player.Name} sped up breeding for {gemCost} gems!`)
	return {
		success = true,
	}
end
-- Setup breeding system
local function setupBreedingSystem()
	local remotes = (ReplicatedStorage:FindFirstChild("DragonRemotes")) or Instance.new("Folder")
	remotes.Name = "DragonRemotes"
	remotes.Parent = ReplicatedStorage
	local startBreedingRemote = Instance.new("RemoteFunction")
	startBreedingRemote.Name = "StartBreeding"
	startBreedingRemote.Parent = remotes
	local collectBreedingRemote = Instance.new("RemoteFunction")
	collectBreedingRemote.Name = "CollectBreeding"
	collectBreedingRemote.Parent = remotes
	local getBreedingSlotsRemote = Instance.new("RemoteFunction")
	getBreedingSlotsRemote.Name = "GetBreedingSlots"
	getBreedingSlotsRemote.Parent = remotes
	local speedUpBreedingRemote = Instance.new("RemoteFunction")
	speedUpBreedingRemote.Name = "SpeedUpBreeding"
	speedUpBreedingRemote.Parent = remotes
	startBreedingRemote.OnServerInvoke = function(player, dragon1Id, dragon2Id)
		local _dragon1Id = dragon1Id
		local _condition = not (type(_dragon1Id) == "string")
		if not _condition then
			local _dragon2Id = dragon2Id
			_condition = not (type(_dragon2Id) == "string")
		end
		if _condition then
			return {
				success = false,
				error = "Invalid parameters",
			}
		end
		return startBreeding(player, dragon1Id, dragon2Id)
	end
	collectBreedingRemote.OnServerInvoke = function(player, slotId)
		local _slotId = slotId
		if not (type(_slotId) == "number") then
			return {
				success = false,
				error = "Invalid slot ID",
			}
		end
		return collectBreedingResult(player, slotId)
	end
	getBreedingSlotsRemote.OnServerInvoke = function(player)
		return getBreedingSlots(player)
	end
	speedUpBreedingRemote.OnServerInvoke = function(player, slotId, gemCost)
		local _slotId = slotId
		local _condition = not (type(_slotId) == "number")
		if not _condition then
			local _gemCost = gemCost
			_condition = not (type(_gemCost) == "number")
		end
		if _condition then
			return {
				success = false,
				error = "Invalid parameters",
			}
		end
		return speedUpBreeding(player, slotId, gemCost)
	end
	-- Clean up on player leave
	Players.PlayerRemoving:Connect(function(player)
		local _userId = player.UserId
		playerBreedingSlots[_userId] = nil
	end)
	print("🧬 Breeding System initialized!")
end
return {
	startBreeding = startBreeding,
	collectBreedingResult = collectBreedingResult,
	getBreedingSlots = getBreedingSlots,
	speedUpBreeding = speedUpBreeding,
	setupBreedingSystem = setupBreedingSystem,
}
