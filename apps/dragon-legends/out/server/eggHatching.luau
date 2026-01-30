-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Egg Hatching System (Server)
-- Gacha-based egg hatching with rarity tiers
local ReplicatedStorage = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").ReplicatedStorage
local _config = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "config")
local EGG_TYPES = _config.EGG_TYPES
local getHatchableDragons = _config.getHatchableDragons
local createPlayerDragon = TS.import(script, game:GetService("ServerScriptService"), "Server", "dragons").createPlayerDragon
local _dataStore = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore")
local getPlayerData = _dataStore.getPlayerData
local updatePlayerData = _dataStore.updatePlayerData
-- Weighted random selection based on rarity rates
local function selectRarity(rates)
	local total = 0
	for _, v in pairs(rates) do
		total += v
	end
	local random = math.random() * total
	for rarity, weight in pairs(rates) do
		random -= weight
		if random <= 0 then
			return rarity
		end
	end
	return "Common"
end
-- Select random dragon of specified rarity
local function selectDragon(rarity)
	local dragons = getHatchableDragons(rarity)
	if #dragons == 0 then
		-- If no dragons of this rarity, try common
		local commonDragons = getHatchableDragons("Common")
		if #commonDragons == 0 then
			return nil
		end
		return commonDragons[math.floor(math.random() * #commonDragons) + 1]
	end
	return dragons[math.floor(math.random() * #dragons) + 1]
end
-- Determine if shiny (1% base chance, luck increases it)
local function rollShiny(luck)
	local shinyChance = 0.01 + luck * 0.001
	return math.random() < shinyChance
end
-- Hatch an egg for a player
local function hatchEgg(player, eggType)
	local eggConfig = EGG_TYPES[eggType]
	if not eggConfig then
		return {
			success = false,
			error = "Invalid egg type",
		}
	end
	-- Get player data
	local playerData = getPlayerData(player)
	if not playerData then
		return {
			success = false,
			error = "Player data not found",
		}
	end
	-- Check currency
	if eggConfig.currency == "coins" then
		if playerData.coins < eggConfig.cost then
			return {
				success = false,
				error = "Not enough coins",
			}
		end
		playerData.coins -= eggConfig.cost
	elseif eggConfig.currency == "gems" then
		if playerData.gems < eggConfig.cost then
			return {
				success = false,
				error = "Not enough gems",
			}
		end
		playerData.gems -= eggConfig.cost
	end
	-- Roll for rarity
	local rarity = selectRarity(eggConfig.rates)
	-- Select dragon
	local dragon = selectDragon(rarity)
	if not dragon then
		-- Refund on error
		if eggConfig.currency == "coins" then
			playerData.coins += eggConfig.cost
		else
			playerData.gems += eggConfig.cost
		end
		return {
			success = false,
			error = "No dragons available",
		}
	end
	-- Roll for shiny
	local isShiny = rollShiny(0)
	-- Create the dragon
	local newDragon = createPlayerDragon(player, dragon.id, isShiny)
	if not newDragon then
		-- Refund on error
		if eggConfig.currency == "coins" then
			playerData.coins += eggConfig.cost
		else
			playerData.gems += eggConfig.cost
		end
		return {
			success = false,
			error = "Failed to create dragon",
		}
	end
	-- Update stats
	playerData.dragonsHatched += 1
	updatePlayerData(player, playerData)
	print(`🥚 {player.Name} hatched a {if isShiny then "✨SHINY " else ""}{rarity} {dragon.name}!`)
	return {
		success = true,
		dragonId = dragon.id,
		isShiny = isShiny,
	}
end
-- Setup egg system
local function setupEggSystem()
	local remotes = (ReplicatedStorage:FindFirstChild("DragonRemotes")) or Instance.new("Folder")
	remotes.Name = "DragonRemotes"
	remotes.Parent = ReplicatedStorage
	local hatchRemote = Instance.new("RemoteFunction")
	hatchRemote.Name = "HatchEgg"
	hatchRemote.Parent = remotes
	hatchRemote.OnServerInvoke = function(player, eggType)
		local _eggType = eggType
		if not (type(_eggType) == "string") then
			return {
				success = false,
				error = "Invalid egg type",
			}
		end
		if eggType ~= "basic" and eggType ~= "premium" and eggType ~= "legendary" then
			return {
				success = false,
				error = "Invalid egg type",
			}
		end
		return hatchEgg(player, eggType)
	end
	print("🥚 Egg Hatching System initialized!")
end
return {
	hatchEgg = hatchEgg,
	setupEggSystem = setupEggSystem,
}
