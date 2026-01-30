-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Combat System (Server)
-- Turn-based elemental combat with type advantages
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local ReplicatedStorage = _services.ReplicatedStorage
local _config = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "config")
local DRAGONS = _config.DRAGONS
local ELEMENT_CHART = _config.ELEMENT_CHART
local GAME_CONFIG = _config.GAME_CONFIG
local _dragons = TS.import(script, game:GetService("ServerScriptService"), "Server", "dragons")
local getPlayerDragons = _dragons.getPlayerDragons
local addDragonXP = _dragons.addDragonXP
local _dataStore = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore")
local getPlayerData = _dataStore.getPlayerData
local updatePlayerData = _dataStore.updatePlayerData
-- Active battles storage
local activeBattles = {}
local playerBattles = {}
-- Combat moves by element
local COMBAT_MOVES = {
	fire = { {
		name = "Flame Breath",
		element = "fire",
		power = 40,
		accuracy = 95,
		cooldown = 0,
		description = "Basic fire attack",
	}, {
		name = "Inferno",
		element = "fire",
		power = 80,
		accuracy = 85,
		cooldown = 2,
		description = "Powerful fire blast",
	}, {
		name = "Eruption",
		element = "fire",
		power = 120,
		accuracy = 70,
		cooldown = 4,
		description = "Devastating volcanic attack",
	} },
	water = { {
		name = "Water Jet",
		element = "water",
		power = 40,
		accuracy = 95,
		cooldown = 0,
		description = "Basic water attack",
	}, {
		name = "Tidal Wave",
		element = "water",
		power = 80,
		accuracy = 85,
		cooldown = 2,
		description = "Powerful wave attack",
	}, {
		name = "Tsunami",
		element = "water",
		power = 120,
		accuracy = 70,
		cooldown = 4,
		description = "Devastating ocean attack",
	} },
	ice = { {
		name = "Ice Shard",
		element = "ice",
		power = 40,
		accuracy = 95,
		cooldown = 0,
		description = "Basic ice attack",
	}, {
		name = "Blizzard",
		element = "ice",
		power = 80,
		accuracy = 85,
		cooldown = 2,
		description = "Freezing storm attack",
	}, {
		name = "Absolute Zero",
		element = "ice",
		power = 120,
		accuracy = 70,
		cooldown = 4,
		description = "Ultimate freeze attack",
	} },
	electric = { {
		name = "Spark",
		element = "electric",
		power = 40,
		accuracy = 95,
		cooldown = 0,
		description = "Basic electric attack",
	}, {
		name = "Thunder",
		element = "electric",
		power = 80,
		accuracy = 85,
		cooldown = 2,
		description = "Powerful lightning bolt",
	}, {
		name = "Storm Strike",
		element = "electric",
		power = 120,
		accuracy = 70,
		cooldown = 4,
		description = "Ultimate lightning attack",
	} },
	nature = { {
		name = "Vine Whip",
		element = "nature",
		power = 40,
		accuracy = 95,
		cooldown = 0,
		description = "Basic nature attack",
	}, {
		name = "Solar Beam",
		element = "nature",
		power = 80,
		accuracy = 85,
		cooldown = 2,
		description = "Powerful sun attack",
	}, {
		name = "Earthquake",
		element = "nature",
		power = 120,
		accuracy = 70,
		cooldown = 4,
		description = "Ground-shaking attack",
	} },
	shadow = { {
		name = "Shadow Claw",
		element = "shadow",
		power = 40,
		accuracy = 95,
		cooldown = 0,
		description = "Basic shadow attack",
	}, {
		name = "Dark Pulse",
		element = "shadow",
		power = 80,
		accuracy = 85,
		cooldown = 2,
		description = "Wave of darkness",
	}, {
		name = "Void Rift",
		element = "shadow",
		power = 120,
		accuracy = 70,
		cooldown = 4,
		description = "Opens a tear in reality",
	} },
	light = { {
		name = "Light Beam",
		element = "light",
		power = 40,
		accuracy = 95,
		cooldown = 0,
		description = "Basic light attack",
	}, {
		name = "Divine Light",
		element = "light",
		power = 80,
		accuracy = 85,
		cooldown = 2,
		description = "Holy radiance attack",
	}, {
		name = "Celestial Blast",
		element = "light",
		power = 120,
		accuracy = 70,
		cooldown = 4,
		description = "Ultimate heavenly attack",
	} },
}
-- Generate battle ID
local function generateBattleId()
	return `battle_{os.time()}_{math.random(1000, 9999)}`
end
-- Create battle state from dragon
local function createBattleState(dragon)
	local maxHp = dragon.stats.health * 5 + dragon.level * 10
	local _object = {
		instanceId = dragon.instanceId,
		dragonId = dragon.dragonId,
		currentHp = maxHp,
		maxHp = maxHp,
		element = dragon.element,
		level = dragon.level,
	}
	local _left = "stats"
	local _object_1 = table.clone(dragon.stats)
	setmetatable(_object_1, nil)
	_object[_left] = _object_1
	_object.moveCooldowns = { 0, 0, 0 }
	_object.statusEffects = {}
	return _object
end
-- Calculate damage with type effectiveness
local function calculateDamage(attacker, defender, move)
	-- Base damage formula
	local baseDamage = (move.power * (attacker.stats.power / 50) * (attacker.level / 10)) / (defender.stats.health / 100)
	-- Type effectiveness
	local _result = ELEMENT_CHART[move.element]
	if _result ~= nil then
		_result = _result[defender.element]
	end
	local _condition = _result
	if _condition == nil then
		_condition = 1
	end
	local effectiveness = _condition
	baseDamage *= effectiveness
	-- Critical hit
	local critChance = GAME_CONFIG.CRIT_CHANCE + attacker.stats.luck * 0.002
	local isCrit = math.random() < critChance
	if isCrit then
		baseDamage *= GAME_CONFIG.CRIT_MULTIPLIER
	end
	-- Random variance (85-115%)
	baseDamage *= 0.85 + math.random() * 0.3
	return {
		damage = math.floor(baseDamage),
		isCrit = isCrit,
		effectiveness = effectiveness,
	}
end
-- Check accuracy
local function checkAccuracy(move, attacker)
	local accuracyBonus = attacker.stats.speed * 0.1
	return math.random() * 100 < move.accuracy + accuracyBonus
end
-- Start a wild dragon battle
local function startWildBattle(player, playerDragon, wildDragonId, wildLevel)
	-- Check if player already in battle
	local _userId = player.UserId
	if playerBattles[_userId] ~= nil then
		return nil
	end
	local wildDef = DRAGONS[wildDragonId]
	if not wildDef then
		return nil
	end
	-- Create wild dragon stats
	local wildStats = {
		power = wildDef.baseStats.power + wildLevel * 2,
		speed = wildDef.baseStats.speed + wildLevel,
		health = wildDef.baseStats.health + wildLevel * 3,
		luck = wildDef.baseStats.luck + wildLevel,
	}
	local wildDragon = {
		instanceId = `wild_{os.time()}`,
		dragonId = wildDragonId,
		level = wildLevel,
		experience = 0,
		stats = wildStats,
		element = wildDef.element,
		rarity = wildDef.rarity,
		evolutionStage = wildDef.evolutionStage,
		isShiny = math.random() < 0.01,
		obtainedAt = 0,
		breedCount = 0,
		battleWins = 0,
		battleLosses = 0,
		isFavorite = false,
	}
	local battleId = generateBattleId()
	local battleState = {
		battleId = battleId,
		battleType = "wild",
		playerDragons = { createBattleState(playerDragon) },
		opponentDragons = { createBattleState(wildDragon) },
		currentTurn = "player",
		turnNumber = 1,
		isFinished = false,
	}
	activeBattles[battleId] = battleState
	local _userId_1 = player.UserId
	playerBattles[_userId_1] = battleId
	print(`⚔️ {player.Name} started a wild battle with {wildDef.name}!`)
	return battleState
end
-- Process a battle action
local endBattle
local function processBattleAction(player, action)
	local _userId = player.UserId
	local battleId = playerBattles[_userId]
	if not (battleId ~= "" and battleId) then
		return {
			success = false,
			message = "Not in battle",
		}
	end
	local battle = activeBattles[battleId]
	if not battle or battle.isFinished then
		return {
			success = false,
			message = "Battle not found or finished",
		}
	end
	if battle.currentTurn ~= "player" then
		return {
			success = false,
			message = "Not your turn",
		}
	end
	local playerDragon = battle.playerDragons[1]
	local opponentDragon = battle.opponentDragons[1]
	-- Handle player action
	if action.type == "attack" and action.moveIndex ~= nil then
		local moves = COMBAT_MOVES[playerDragon.element] or COMBAT_MOVES.fire
		local move = moves[action.moveIndex + 1]
		if not move then
			return {
				success = false,
				message = "Invalid move",
			}
		end
		-- Check cooldown
		if playerDragon.moveCooldowns[action.moveIndex + 1] > 0 then
			return {
				success = false,
				message = "Move on cooldown",
			}
		end
		-- Process attack
		if checkAccuracy(move, playerDragon) then
			local _binding = calculateDamage(playerDragon, opponentDragon, move)
			local damage = _binding.damage
			local isCrit = _binding.isCrit
			local effectiveness = _binding.effectiveness
			opponentDragon.currentHp = math.max(0, opponentDragon.currentHp - damage)
			local msg = `{move.name} dealt {damage} damage!`
			if isCrit then
				msg ..= " Critical hit!"
			end
			if effectiveness > 1 then
				msg ..= " Super effective!"
			end
			if effectiveness < 1 then
				msg ..= " Not very effective..."
			end
			print(`⚔️ {msg}`)
			-- Set cooldown
			playerDragon.moveCooldowns[action.moveIndex + 1] = move.cooldown
		else
			print(`⚔️ {move.name} missed!`)
		end
	elseif action.type == "flee" then
		-- End battle with flee
		battle.isFinished = true
		battle.result = {
			winner = "opponent",
			xpGained = 0,
			coinsGained = 0,
			dragonXpGained = 0,
		}
		return {
			success = true,
			battleState = battle,
			message = "Fled from battle!",
		}
	end
	-- Check if opponent defeated
	if opponentDragon.currentHp <= 0 then
		return endBattle(player, battle, "player")
	end
	-- Opponent turn (AI)
	battle.currentTurn = "opponent"
	local opponentMoves = COMBAT_MOVES[opponentDragon.element] or COMBAT_MOVES.fire
	-- Simple AI: pick random available move
	-- ▼ ReadonlyArray.filter ▼
	local _newValue = {}
	local _callback = function(_, i)
		return opponentDragon.moveCooldowns[i + 1] <= 0
	end
	local _length = 0
	for _k, _v in opponentMoves do
		if _callback(_v, _k - 1, opponentMoves) == true then
			_length += 1
			_newValue[_length] = _v
		end
	end
	-- ▲ ReadonlyArray.filter ▲
	local availableMoves = _newValue
	local opponentMove = availableMoves[math.floor(math.random() * #availableMoves) + 1] or opponentMoves[1]
	if checkAccuracy(opponentMove, opponentDragon) then
		local _binding = calculateDamage(opponentDragon, playerDragon, opponentMove)
		local damage = _binding.damage
		local isCrit = _binding.isCrit
		playerDragon.currentHp = math.max(0, playerDragon.currentHp - damage)
		local msg = `Enemy {opponentMove.name} dealt {damage} damage!`
		if isCrit then
			msg ..= " Critical hit!"
		end
		print(`⚔️ {msg}`)
	else
		print(`⚔️ Enemy {opponentMove.name} missed!`)
	end
	-- Set opponent cooldowns
	local moveIndex = (table.find(opponentMoves, opponentMove) or 0) - 1
	if moveIndex >= 0 then
		opponentDragon.moveCooldowns[moveIndex + 1] = opponentMove.cooldown
	end
	-- Check if player defeated
	if playerDragon.currentHp <= 0 then
		return endBattle(player, battle, "opponent")
	end
	-- Reduce cooldowns
	local _exp = playerDragon.moveCooldowns
	-- ▼ ReadonlyArray.map ▼
	local _newValue_1 = table.create(#_exp)
	local _callback_1 = function(cd)
		return math.max(0, cd - 1)
	end
	for _k, _v in _exp do
		_newValue_1[_k] = _callback_1(_v, _k - 1, _exp)
	end
	-- ▲ ReadonlyArray.map ▲
	playerDragon.moveCooldowns = _newValue_1
	local _exp_1 = opponentDragon.moveCooldowns
	-- ▼ ReadonlyArray.map ▼
	local _newValue_2 = table.create(#_exp_1)
	local _callback_2 = function(cd)
		return math.max(0, cd - 1)
	end
	for _k, _v in _exp_1 do
		_newValue_2[_k] = _callback_2(_v, _k - 1, _exp_1)
	end
	-- ▲ ReadonlyArray.map ▲
	opponentDragon.moveCooldowns = _newValue_2
	-- Next turn
	battle.currentTurn = "player"
	battle.turnNumber += 1
	return {
		success = true,
		battleState = battle,
	}
end
-- End battle and calculate rewards
function endBattle(player, battle, winner)
	battle.isFinished = true
	local playerData = getPlayerData(player)
	local playerDragons = getPlayerDragons(player)
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(d)
		return d.instanceId == battle.playerDragons[1].instanceId
	end
	local _result
	for _i, _v in playerDragons do
		if _callback(_v, _i - 1, playerDragons) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local battleDragon = _result
	if winner == "player" then
		-- Calculate rewards
		local opponentLevel = battle.opponentDragons[1].level
		local xpGained = GAME_CONFIG.XP_PER_BATTLE * opponentLevel
		local coinsGained = 50 + opponentLevel * 10
		battle.result = {
			winner = "player",
			xpGained = xpGained,
			coinsGained = coinsGained,
			dragonXpGained = xpGained,
		}
		-- Award XP to dragon
		if battleDragon then
			addDragonXP(player, battleDragon, xpGained)
			battleDragon.battleWins += 1
		end
		-- Award coins
		if playerData then
			playerData.coins += coinsGained
			playerData.totalBattlesWon += 1
			updatePlayerData(player, playerData)
		end
		print(`🏆 {player.Name} won! Earned {coinsGained} coins and {xpGained} XP!`)
		return {
			success = true,
			battleState = battle,
			message = `Victory! +{coinsGained} coins, +{xpGained} XP`,
		}
	else
		battle.result = {
			winner = "opponent",
			xpGained = 0,
			coinsGained = 0,
			dragonXpGained = GAME_CONFIG.XP_PER_BATTLE / 2,
		}
		if battleDragon then
			addDragonXP(player, battleDragon, GAME_CONFIG.XP_PER_BATTLE / 2)
			battleDragon.battleLosses += 1
		end
		if playerData then
			playerData.totalBattlesLost += 1
			updatePlayerData(player, playerData)
		end
		print(`💔 {player.Name} lost the battle!`)
		return {
			success = true,
			battleState = battle,
			message = "Defeated! Your dragon needs rest.",
		}
	end
end
-- Clean up after battle
local function cleanupBattle(player)
	local _userId = player.UserId
	local battleId = playerBattles[_userId]
	if battleId ~= "" and battleId then
		activeBattles[battleId] = nil
		local _userId_1 = player.UserId
		playerBattles[_userId_1] = nil
	end
end
-- Setup combat system
local function setupCombatSystem()
	local remotes = (ReplicatedStorage:FindFirstChild("DragonRemotes")) or Instance.new("Folder")
	remotes.Name = "DragonRemotes"
	remotes.Parent = ReplicatedStorage
	local startBattleRemote = Instance.new("RemoteFunction")
	startBattleRemote.Name = "StartBattle"
	startBattleRemote.Parent = remotes
	local battleActionRemote = Instance.new("RemoteFunction")
	battleActionRemote.Name = "BattleAction"
	battleActionRemote.Parent = remotes
	local endBattleRemote = Instance.new("RemoteEvent")
	endBattleRemote.Name = "EndBattle"
	endBattleRemote.Parent = remotes
	-- Start wild battle
	startBattleRemote.OnServerInvoke = function(player, dragonInstanceId, wildDragonId, wildLevel)
		local _dragonInstanceId = dragonInstanceId
		local _condition = not (type(_dragonInstanceId) == "string")
		if not _condition then
			local _wildDragonId = wildDragonId
			_condition = not (type(_wildDragonId) == "string")
			if not _condition then
				local _wildLevel = wildLevel
				_condition = not (type(_wildLevel) == "number")
			end
		end
		if _condition then
			return {
				success = false,
				error = "Invalid parameters",
			}
		end
		local dragons = getPlayerDragons(player)
		-- ▼ ReadonlyArray.find ▼
		local _callback = function(d)
			return d.instanceId == dragonInstanceId
		end
		local _result
		for _i, _v in dragons do
			if _callback(_v, _i - 1, dragons) == true then
				_result = _v
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		local dragon = _result
		if not dragon then
			return {
				success = false,
				error = "Dragon not found",
			}
		end
		local battle = startWildBattle(player, dragon, wildDragonId, wildLevel)
		if not battle then
			return {
				success = false,
				error = "Failed to start battle",
			}
		end
		return {
			success = true,
			battleState = battle,
		}
	end
	-- Process battle action
	battleActionRemote.OnServerInvoke = function(player, actionType, moveIndex)
		local _object = {
			type = actionType,
		}
		local _left = "moveIndex"
		local _moveIndex = moveIndex
		_object[_left] = if type(_moveIndex) == "number" then moveIndex else nil
		local action = _object
		return processBattleAction(player, action)
	end
	-- Clean up on player leave
	Players.PlayerRemoving:Connect(function(player)
		cleanupBattle(player)
	end)
	print("⚔️ Combat System initialized!")
end
return {
	startWildBattle = startWildBattle,
	processBattleAction = processBattleAction,
	setupCombatSystem = setupCombatSystem,
}
