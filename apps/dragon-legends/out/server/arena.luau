-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Arena PvP System (Server)
-- Ranked 1v1 dragon battles with ELO matchmaking
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local ReplicatedStorage = _services.ReplicatedStorage
local _config = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "config")
local ELEMENT_CHART = _config.ELEMENT_CHART
local GAME_CONFIG = _config.GAME_CONFIG
local _dragons = TS.import(script, game:GetService("ServerScriptService"), "Server", "dragons")
local getPlayerDragons = _dragons.getPlayerDragons
local addDragonXP = _dragons.addDragonXP
local _dataStore = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore")
local getPlayerData = _dataStore.getPlayerData
local updatePlayerData = _dataStore.updatePlayerData
local addCoins = _dataStore.addCoins
-- Matchmaking queue
local matchmakingQueue = {}
local activeArenaMatches = {}
local playerArenaMatches = {}
-- ELO calculation
local K_FACTOR = 32
local function calculateEloChange(winnerRating, loserRating)
	local expectedWin = 1 / (1 + math.pow(10, (loserRating - winnerRating) / 400))
	local winnerGain = math.floor(K_FACTOR * (1 - expectedWin))
	local loserLoss = math.floor(K_FACTOR * expectedWin)
	return {
		winnerGain = winnerGain,
		loserLoss = loserLoss,
	}
end
-- Join matchmaking queue
local findMatch
local function joinArenaQueue(player, dragonInstanceId)
	-- Check if already in queue
	-- ▼ ReadonlyArray.some ▼
	local _result = false
	local _callback = function(e)
		return e.player.UserId == player.UserId
	end
	for _k, _v in matchmakingQueue do
		if _callback(_v, _k - 1, matchmakingQueue) then
			_result = true
			break
		end
	end
	-- ▲ ReadonlyArray.some ▲
	if _result then
		return {
			success = false,
			error = "Already in queue",
		}
	end
	-- Check if in match
	local _userId = player.UserId
	if playerArenaMatches[_userId] ~= nil then
		return {
			success = false,
			error = "Already in a match",
		}
	end
	local dragons = getPlayerDragons(player)
	-- ▼ ReadonlyArray.find ▼
	local _callback_1 = function(d)
		return d.instanceId == dragonInstanceId
	end
	local _result_1
	for _i, _v in dragons do
		if _callback_1(_v, _i - 1, dragons) == true then
			_result_1 = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local dragon = _result_1
	if not dragon then
		return {
			success = false,
			error = "Dragon not found",
		}
	end
	local playerData = getPlayerData(player)
	if not playerData then
		return {
			success = false,
			error = "Player data not found",
		}
	end
	local _arg0 = {
		player = player,
		dragon = dragon,
		rating = playerData.arenaRating,
		queueTime = os.time(),
	}
	table.insert(matchmakingQueue, _arg0)
	print(`⚔️ {player.Name} joined arena queue (Rating: {playerData.arenaRating})`)
	-- Try to find a match
	findMatch()
	return {
		success = true,
	}
end
-- Leave matchmaking queue
local function leaveArenaQueue(player)
	-- ▼ ReadonlyArray.findIndex ▼
	local _callback = function(e)
		return e.player.UserId == player.UserId
	end
	local _result = -1
	for _i, _v in matchmakingQueue do
		if _callback(_v, _i - 1, matchmakingQueue) == true then
			_result = _i - 1
			break
		end
	end
	-- ▲ ReadonlyArray.findIndex ▲
	local index = _result
	if index >= 0 then
		table.remove(matchmakingQueue, index + 1)
		print(`🚶 {player.Name} left arena queue`)
		return {
			success = true,
		}
	end
	return {
		success = false,
	}
end
-- Find a match from the queue
local startArenaMatch
function findMatch()
	if #matchmakingQueue < 2 then
		return nil
	end
	-- Sort by rating (bubble sort for roblox-ts)
	local sorted = {}
	for _, item in matchmakingQueue do
		table.insert(sorted, item)
	end
	for i = 0, #sorted - 1 do
		do
			local j = i + 1
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					j += 1
				else
					_shouldIncrement = true
				end
				if not (j < #sorted) then
					break
				end
				if sorted[j + 1].rating < sorted[i + 1].rating then
					local _index = i + 1
					local _index_1 = j + 1
					sorted[_index], sorted[_index_1] = sorted[j + 1], sorted[i + 1]
				end
			end
		end
	end
	-- Find closest rating match
	local bestPair
	local bestDiff = math.huge
	for i = 0, #sorted - 2 do
		local diff = math.abs(sorted[i + 1].rating - sorted[i + 2].rating)
		-- Also consider wait time - expand range over time
		local avgWait = (os.time() - sorted[i + 1].queueTime + os.time() - sorted[i + 2].queueTime) / 2
		local adjustedDiff = diff - avgWait * 2
		if adjustedDiff < bestDiff then
			bestDiff = adjustedDiff
			bestPair = { sorted[i + 1], sorted[i + 2] }
		end
	end
	if not bestPair then
		return nil
	end
	-- Create match
	local _binding = bestPair
	local entry1 = _binding[1]
	local entry2 = _binding[2]
	-- Remove from queue
	-- ▼ ReadonlyArray.findIndex ▼
	local _callback = function(e)
		return e.player.UserId == entry1.player.UserId
	end
	local _result = -1
	for _i, _v in matchmakingQueue do
		if _callback(_v, _i - 1, matchmakingQueue) == true then
			_result = _i - 1
			break
		end
	end
	-- ▲ ReadonlyArray.findIndex ▲
	local idx1 = _result
	-- ▼ ReadonlyArray.findIndex ▼
	local _callback_1 = function(e)
		return e.player.UserId == entry2.player.UserId
	end
	local _result_1 = -1
	for _i, _v in matchmakingQueue do
		if _callback_1(_v, _i - 1, matchmakingQueue) == true then
			_result_1 = _i - 1
			break
		end
	end
	-- ▲ ReadonlyArray.findIndex ▲
	local idx2 = _result_1
	if idx1 >= 0 then
		table.remove(matchmakingQueue, idx1 + 1)
	end
	if idx2 >= 0 then
		local _arg0 = if idx2 > idx1 then idx2 - 1 else idx2
		table.remove(matchmakingQueue, _arg0 + 1)
	end
	-- Start the match
	startArenaMatch(entry1, entry2)
end
-- Create battle state from dragon
local function createArenaBattleState(dragon)
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
-- Start arena match
function startArenaMatch(entry1, entry2)
	local matchId = `arena_{os.time()}_{math.random(1000, 9999)}`
	local battle = {
		battleId = matchId,
		battleType = "arena",
		playerDragons = { createArenaBattleState(entry1.dragon) },
		opponentDragons = { createArenaBattleState(entry2.dragon) },
		currentTurn = if math.random() > 0.5 then "player" else "opponent",
		turnNumber = 1,
		isFinished = false,
	}
	local _arg1 = {
		player1 = entry1.player,
		player2 = entry2.player,
		battle = battle,
	}
	activeArenaMatches[matchId] = _arg1
	local _userId = entry1.player.UserId
	playerArenaMatches[_userId] = matchId
	local _userId_1 = entry2.player.UserId
	playerArenaMatches[_userId_1] = matchId
	print(`⚔️ Arena match started: {entry1.player.Name} vs {entry2.player.Name}!`)
	-- Notify players (would use remote events)
end
-- Process arena action
local endArenaMatch
local function processArenaAction(player, actionType, moveIndex)
	local _userId = player.UserId
	local matchId = playerArenaMatches[_userId]
	if not (matchId ~= "" and matchId) then
		return {
			success = false,
			error = "Not in a match",
		}
	end
	local match = activeArenaMatches[matchId]
	if not match then
		return {
			success = false,
			error = "Match not found",
		}
	end
	local _binding = match
	local player1 = _binding.player1
	local player2 = _binding.player2
	local battle = _binding.battle
	local isPlayer1 = player.UserId == player1.UserId
	-- Determine if it's this player's turn
	local isPlayerTurn = (isPlayer1 and battle.currentTurn == "player") or (not isPlayer1 and battle.currentTurn == "opponent")
	if not isPlayerTurn then
		return {
			success = false,
			error = "Not your turn",
		}
	end
	-- Get attacker and defender
	local attacker = if isPlayer1 then battle.playerDragons[1] else battle.opponentDragons[1]
	local defender = if isPlayer1 then battle.opponentDragons[1] else battle.playerDragons[1]
	if actionType == "attack" and moveIndex ~= nil then
		-- Simple damage calculation for PvP
		local baseDamage = 20 + attacker.stats.power / 2
		local _result = ELEMENT_CHART[attacker.element]
		if _result ~= nil then
			_result = _result[defender.element]
		end
		local _condition = _result
		if _condition == nil then
			_condition = 1
		end
		local effectiveness = _condition
		local damage = math.floor(baseDamage * effectiveness * (0.9 + math.random() * 0.2))
		defender.currentHp = math.max(0, defender.currentHp - damage)
		print(`⚔️ {if isPlayer1 then player1.Name else player2.Name}'s dragon dealt {damage} damage!`)
	end
	-- Check for winner
	if battle.playerDragons[1].currentHp <= 0 or battle.opponentDragons[1].currentHp <= 0 then
		local winner = if battle.playerDragons[1].currentHp > 0 then "player1" else "player2"
		return endArenaMatch(matchId, winner)
	end
	-- Switch turns
	battle.currentTurn = if battle.currentTurn == "player" then "opponent" else "player"
	battle.turnNumber += 1
	return {
		success = true,
		battleState = battle,
	}
end
-- End arena match
function endArenaMatch(matchId, winner)
	local _matchId = matchId
	local match = activeArenaMatches[_matchId]
	if not match then
		return {
			success = false,
			battleState = nil,
			result = nil,
			error = "Match not found",
		}
	end
	local _binding = match
	local player1 = _binding.player1
	local player2 = _binding.player2
	local battle = _binding.battle
	battle.isFinished = true
	local winningPlayer = if winner == "player1" then player1 else player2
	local losingPlayer = if winner == "player1" then player2 else player1
	-- Get player data
	local winnerData = getPlayerData(winningPlayer)
	local loserData = getPlayerData(losingPlayer)
	if not winnerData or not loserData then
		return {
			success = false,
			battleState = battle,
			result = nil,
			error = "Player data not found",
		}
	end
	-- Calculate ELO change
	local _binding_1 = calculateEloChange(winnerData.arenaRating, loserData.arenaRating)
	local winnerGain = _binding_1.winnerGain
	local loserLoss = _binding_1.loserLoss
	-- Apply rating changes
	winnerData.arenaRating += winnerGain
	loserData.arenaRating = math.max(0, loserData.arenaRating - loserLoss)
	-- Update stats
	winnerData.arenaWins += 1
	if winnerData.arenaRating > winnerData.bestArenaRank then
		winnerData.bestArenaRank = winnerData.arenaRating
	end
	loserData.arenaLosses += 1
	-- Rewards
	local coinReward = 100 + winnerGain * 5
	addCoins(winningPlayer, coinReward)
	-- XP for dragons
	local winnerDragons = getPlayerDragons(winningPlayer)
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(d)
		return d.instanceId == battle.playerDragons[1].instanceId
	end
	local _result
	for _i, _v in winnerDragons do
		if _callback(_v, _i - 1, winnerDragons) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local winnerDragon = _result
	if winnerDragon then
		addDragonXP(winningPlayer, winnerDragon, GAME_CONFIG.XP_PER_BATTLE * 2)
		winnerDragon.battleWins += 1
	end
	local loserDragons = getPlayerDragons(losingPlayer)
	-- ▼ ReadonlyArray.find ▼
	local _callback_1 = function(d)
		return d.instanceId == battle.opponentDragons[1].instanceId
	end
	local _result_1
	for _i, _v in loserDragons do
		if _callback_1(_v, _i - 1, loserDragons) == true then
			_result_1 = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local loserDragon = _result_1
	if loserDragon then
		addDragonXP(losingPlayer, loserDragon, GAME_CONFIG.XP_PER_BATTLE)
		loserDragon.battleLosses += 1
	end
	updatePlayerData(winningPlayer, winnerData)
	updatePlayerData(losingPlayer, loserData)
	local result = {
		winner = if winner == "player1" then "player" else "opponent",
		xpGained = GAME_CONFIG.XP_PER_BATTLE * 2,
		coinsGained = coinReward,
		dragonXpGained = GAME_CONFIG.XP_PER_BATTLE * 2,
		ratingChange = winnerGain,
	}
	battle.result = result
	print(`🏆 {winningPlayer.Name} wins! +{winnerGain} rating, +{coinReward} coins`)
	print(`💔 {losingPlayer.Name} loses! -{loserLoss} rating`)
	-- Cleanup
	local _matchId_1 = matchId
	activeArenaMatches[_matchId_1] = nil
	local _userId = player1.UserId
	playerArenaMatches[_userId] = nil
	local _userId_1 = player2.UserId
	playerArenaMatches[_userId_1] = nil
	return {
		success = true,
		battleState = battle,
		result = result,
	}
end
-- Get arena leaderboard
local function getArenaLeaderboard()
	local leaderboard = {}
	for _, player in Players:GetPlayers() do
		local data = getPlayerData(player)
		if data then
			local _arg0 = {
				playerId = player.UserId,
				playerName = player.Name,
				rating = data.arenaRating,
			}
			table.insert(leaderboard, _arg0)
		end
	end
	-- Sort and take top 100
	for i = 0, #leaderboard - 1 do
		do
			local j = i + 1
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					j += 1
				else
					_shouldIncrement = true
				end
				if not (j < #leaderboard) then
					break
				end
				if leaderboard[j + 1].rating > leaderboard[i + 1].rating then
					local _index = i + 1
					local _index_1 = j + 1
					leaderboard[_index], leaderboard[_index_1] = leaderboard[j + 1], leaderboard[i + 1]
				end
			end
		end
	end
	local result = {}
	do
		local i = 0
		local _shouldIncrement = false
		while true do
			if _shouldIncrement then
				i += 1
			else
				_shouldIncrement = true
			end
			if not (i < math.min(100, #leaderboard)) then
				break
			end
			local _arg0 = leaderboard[i + 1]
			table.insert(result, _arg0)
		end
	end
	return result
end
-- Setup arena system
local function setupArenaSystem()
	local remotes = (ReplicatedStorage:FindFirstChild("DragonRemotes")) or Instance.new("Folder")
	remotes.Name = "DragonRemotes"
	remotes.Parent = ReplicatedStorage
	local joinQueueRemote = Instance.new("RemoteFunction")
	joinQueueRemote.Name = "JoinArenaQueue"
	joinQueueRemote.Parent = remotes
	local leaveQueueRemote = Instance.new("RemoteFunction")
	leaveQueueRemote.Name = "LeaveArenaQueue"
	leaveQueueRemote.Parent = remotes
	local arenaActionRemote = Instance.new("RemoteFunction")
	arenaActionRemote.Name = "ArenaAction"
	arenaActionRemote.Parent = remotes
	local getArenaLeaderboardRemote = Instance.new("RemoteFunction")
	getArenaLeaderboardRemote.Name = "GetArenaLeaderboard"
	getArenaLeaderboardRemote.Parent = remotes
	joinQueueRemote.OnServerInvoke = function(player, dragonInstanceId)
		local _dragonInstanceId = dragonInstanceId
		if not (type(_dragonInstanceId) == "string") then
			return {
				success = false,
				error = "Invalid dragon",
			}
		end
		return joinArenaQueue(player, dragonInstanceId)
	end
	leaveQueueRemote.OnServerInvoke = function(player)
		return leaveArenaQueue(player)
	end
	arenaActionRemote.OnServerInvoke = function(player, actionType, moveIndex)
		local _actionType = actionType
		if not (type(_actionType) == "string") then
			return {
				success = false,
				error = "Invalid action",
			}
		end
		local _exp = player
		local _exp_1 = actionType
		local _moveIndex = moveIndex
		return processArenaAction(_exp, _exp_1, if type(_moveIndex) == "number" then moveIndex else nil)
	end
	getArenaLeaderboardRemote.OnServerInvoke = function()
		return getArenaLeaderboard()
	end
	-- Clean up on player leave
	Players.PlayerRemoving:Connect(function(player)
		leaveArenaQueue(player)
		local _userId = player.UserId
		local matchId = playerArenaMatches[_userId]
		if matchId ~= "" and matchId then
			local match = activeArenaMatches[matchId]
			if match then
				-- Player disconnected, opponent wins
				local winner = if match.player1.UserId == player.UserId then "player2" else "player1"
				endArenaMatch(matchId, winner)
			end
		end
	end)
	print("🏟️ Arena PvP System initialized!")
end
return {
	joinArenaQueue = joinArenaQueue,
	leaveArenaQueue = leaveArenaQueue,
	processArenaAction = processArenaAction,
	getArenaLeaderboard = getArenaLeaderboard,
	setupArenaSystem = setupArenaSystem,
}
