-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Analytics Event Tracking
-- Integrates with roblox-core analytics system
local Players = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Players
-- ==================== EVENT TYPES ====================
-- ==================== SESSION TRACKING ====================
local playerSessions = {}
local function generateSessionId()
	local chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	local result = ""
	for i = 0, 15 do
		local index = math.floor(math.random() * #chars) + 1
		result ..= string.sub(chars, index, index)
	end
	return result
end
local trackEvent
local function startSession(player)
	local sessionId = generateSessionId()
	local _userId = player.UserId
	local _arg1 = {
		sessionId = sessionId,
		startTime = os.time(),
	}
	playerSessions[_userId] = _arg1
	trackEvent(player, "game_start", {
		firstJoin = player.AccountAge < 1,
	})
end
local function endSession(player)
	local _userId = player.UserId
	local session = playerSessions[_userId]
	if session then
		local duration = os.time() - session.startTime
		trackEvent(player, "game_end", {
			sessionDuration = duration,
		})
		local _userId_1 = player.UserId
		playerSessions[_userId_1] = nil
	end
end
-- ==================== EVENT TRACKING ====================
local eventQueue = {}
local BATCH_SIZE = 10
local BATCH_INTERVAL = 30
local flushEvents
function trackEvent(player, event, properties)
	if properties == nil then
		properties = {}
	end
	local _userId = player.UserId
	local session = playerSessions[_userId]
	local _object = {
		event = event,
		playerId = player.UserId,
		timestamp = os.time(),
	}
	local _left = "sessionId"
	local _result = session
	if _result ~= nil then
		_result = _result.sessionId
	end
	local _condition = _result
	if _condition == nil then
		_condition = "unknown"
	end
	_object[_left] = _condition
	local _left_1 = "properties"
	local _object_1 = table.clone(properties)
	setmetatable(_object_1, nil)
	_object_1.playerName = player.Name
	_object_1.accountAge = player.AccountAge
	_object[_left_1] = _object_1
	local eventData = _object
	table.insert(eventQueue, eventData)
	-- Log locally for debugging
	print(`[Analytics] {event} - Player: {player.Name} - Props: {tostring(properties)}`)
	-- Batch send when queue is full
	if #eventQueue >= BATCH_SIZE then
		flushEvents()
	end
end
function flushEvents()
	if #eventQueue == 0 then
		return nil
	end
	-- In production, send to analytics service (e.g., GameAnalytics, Amplitude, custom backend)
	-- For now, just clear the queue
	local _array = {}
	local _length = #_array
	table.move(eventQueue, 1, #eventQueue, _length + 1, _array)
	local eventsToSend = _array
	table.clear(eventQueue)
	-- TODO: Send to analytics backend
	-- HttpService.PostAsync(ANALYTICS_URL, HttpService.JSONEncode(eventsToSend));
	print(`[Analytics] Flushed {#eventsToSend} events`)
end
-- ==================== SPECIFIC TRACKING HELPERS ====================
local function trackEggPurchase(player, eggType, robuxSpent)
	trackEvent(player, "egg_purchase", {
		eggType = eggType,
		robuxSpent = robuxSpent,
		currency = "robux",
	})
end
local function trackEggHatch(player, eggType, dragonId, rarity, isShiny)
	trackEvent(player, "egg_hatch", {
		eggType = eggType,
		dragonId = dragonId,
		rarity = rarity,
		isShiny = isShiny,
	})
	trackEvent(player, "dragon_obtained", {
		dragonId = dragonId,
		rarity = rarity,
		isShiny = isShiny,
		source = "egg",
	})
end
local function trackBreeding(player, parent1Id, parent2Id, resultId, resultRarity, isMutation)
	trackEvent(player, "breeding_complete", {
		parent1Id = parent1Id,
		parent2Id = parent2Id,
		resultId = resultId,
		resultRarity = resultRarity,
		isMutation = isMutation,
	})
end
local function trackBattle(player, battleType, won, dragonUsed, enemyType)
	trackEvent(player, "battle_end", {
		battleType = battleType,
		won = won,
		dragonUsed = dragonUsed,
		enemyType = enemyType,
	})
end
local function trackArenaMatch(player, won, ratingChange, newRating, opponentRating)
	trackEvent(player, "arena_match", {
		won = won,
		ratingChange = ratingChange,
		newRating = newRating,
		opponentRating = opponentRating,
	})
end
local function trackWorldBoss(player, bossId, damageDealt, rank, rewards)
	trackEvent(player, "world_boss_complete", {
		bossId = bossId,
		damageDealt = damageDealt,
		rank = rank,
		rewardCount = #rewards,
	})
end
local function trackPurchase(player, productName, robuxSpent, success)
	trackEvent(player, if success then "purchase_completed" else "purchase_failed", {
		productName = productName,
		robuxSpent = robuxSpent,
	})
end
-- ==================== RETENTION METRICS ====================
local function trackDailyReward(player, day, reward)
	trackEvent(player, "daily_reward_claimed", {
		streakDay = day,
		reward = reward,
	})
end
local function trackQuestComplete(player, questType, questName, rewards)
	trackEvent(player, "quest_completed", {
		questType = questType,
		questName = questName,
		rewards = rewards,
	})
end
-- ==================== SETUP ====================
local function setupAnalytics()
	-- Track player joins
	Players.PlayerAdded:Connect(function(player)
		startSession(player)
	end)
	-- Track player leaves
	Players.PlayerRemoving:Connect(function(player)
		endSession(player)
	end)
	-- Periodic flush
	task.spawn(function()
		while true do
			task.wait(BATCH_INTERVAL)
			flushEvents()
		end
	end)
	print("[Analytics] Analytics system initialized")
end
return {
	startSession = startSession,
	endSession = endSession,
	trackEvent = trackEvent,
	trackEggPurchase = trackEggPurchase,
	trackEggHatch = trackEggHatch,
	trackBreeding = trackBreeding,
	trackBattle = trackBattle,
	trackArenaMatch = trackArenaMatch,
	trackWorldBoss = trackWorldBoss,
	trackPurchase = trackPurchase,
	trackDailyReward = trackDailyReward,
	trackQuestComplete = trackQuestComplete,
	setupAnalytics = setupAnalytics,
}
