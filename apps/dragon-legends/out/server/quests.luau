-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Quest System (Server)
-- Daily and weekly quests with progress tracking
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local ReplicatedStorage = _services.ReplicatedStorage
local _dataStore = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore")
local getPlayerData = _dataStore.getPlayerData
local updatePlayerData = _dataStore.updatePlayerData
local addCoins = _dataStore.addCoins
local addGems = _dataStore.addGems
local createPlayerDragon = TS.import(script, game:GetService("ServerScriptService"), "Server", "dragons").createPlayerDragon
-- Quest templates
local DAILY_QUEST_TEMPLATES = { {
	questId = "daily_battle_3",
	name = "Combat Training",
	description = "Win 3 battles",
	type = "daily",
	requirements = { {
		type = "battles_won",
		target = 3,
		current = 0,
	} },
	rewards = {
		coins = 200,
	},
}, {
	questId = "daily_hatch_1",
	name = "Dragon Breeder",
	description = "Hatch 1 dragon egg",
	type = "daily",
	requirements = { {
		type = "eggs_hatched",
		target = 1,
		current = 0,
	} },
	rewards = {
		coins = 150,
	},
}, {
	questId = "daily_boss_damage",
	name = "Boss Hunter",
	description = "Deal 10,000 damage to World Boss",
	type = "daily",
	requirements = { {
		type = "boss_damage",
		target = 10000,
		current = 0,
	} },
	rewards = {
		coins = 300,
		gems = 5,
	},
}, {
	questId = "daily_arena_1",
	name = "Arena Challenger",
	description = "Complete 1 arena battle",
	type = "daily",
	requirements = { {
		type = "arena_battles",
		target = 1,
		current = 0,
	} },
	rewards = {
		coins = 250,
	},
}, {
	questId = "daily_collect_coins",
	name = "Treasure Hunter",
	description = "Collect 1,000 coins",
	type = "daily",
	requirements = { {
		type = "coins_collected",
		target = 1000,
		current = 0,
	} },
	rewards = {
		gems = 10,
	},
} }
local WEEKLY_QUEST_TEMPLATES = { {
	questId = "weekly_battle_20",
	name = "Battle Master",
	description = "Win 20 battles this week",
	type = "weekly",
	requirements = { {
		type = "battles_won",
		target = 20,
		current = 0,
	} },
	rewards = {
		coins = 2000,
		gems = 20,
	},
}, {
	questId = "weekly_evolve_1",
	name = "Evolution Expert",
	description = "Evolve 1 dragon",
	type = "weekly",
	requirements = { {
		type = "dragons_evolved",
		target = 1,
		current = 0,
	} },
	rewards = {
		gems = 50,
	},
}, {
	questId = "weekly_breed_3",
	name = "Master Breeder",
	description = "Breed 3 dragons",
	type = "weekly",
	requirements = { {
		type = "dragons_bred",
		target = 3,
		current = 0,
	} },
	rewards = {
		coins = 1500,
		gems = 15,
	},
}, {
	questId = "weekly_arena_10",
	name = "Arena Champion",
	description = "Win 10 arena matches",
	type = "weekly",
	requirements = { {
		type = "arena_wins",
		target = 10,
		current = 0,
	} },
	rewards = {
		coins = 3000,
		gems = 30,
	},
}, {
	questId = "weekly_login_7",
	name = "Dedicated Trainer",
	description = "Log in 7 days in a row",
	type = "weekly",
	requirements = { {
		type = "login_streak",
		target = 7,
		current = 0,
	} },
	rewards = {
		dragonId = "thunder_dragon_baby",
	},
} }
-- Player quest storage
local playerQuests = {}
-- Get today's date key
local function getDateKey()
	local date = os.date("!*t")
	return `{date.year}-{date.month}-{date.day}`
end
-- Get week key
local function getWeekKey()
	local date = os.date("!*t")
	return `{date.year}-{math.floor(date.yday / 7)}`
end
-- Generate quests for player
local function generateQuests(player)
	local quests = {}
	local now = os.time()
	-- Pick 3 random daily quests
	local _array = {}
	local _length = #_array
	table.move(DAILY_QUEST_TEMPLATES, 1, #DAILY_QUEST_TEMPLATES, _length + 1, _array)
	local shuffledDaily = _array
	for i = #shuffledDaily - 1, 1, -1 do
		local j = math.floor(math.random() * (i + 1))
		local _index = i + 1
		local _index_1 = j + 1
		shuffledDaily[_index], shuffledDaily[_index_1] = shuffledDaily[j + 1], shuffledDaily[i + 1]
	end
	do
		local i = 0
		local _shouldIncrement = false
		while true do
			if _shouldIncrement then
				i += 1
			else
				_shouldIncrement = true
			end
			if not (i < 3 and i < #shuffledDaily) then
				break
			end
			local template = shuffledDaily[i + 1]
			local _object = table.clone(template)
			setmetatable(_object, nil)
			local _left = "requirements"
			local _exp = template.requirements
			-- ▼ ReadonlyArray.map ▼
			local _newValue = table.create(#_exp)
			local _callback = function(r)
				local _object_1 = table.clone(r)
				setmetatable(_object_1, nil)
				return _object_1
			end
			for _k, _v in _exp do
				_newValue[_k] = _callback(_v, _k - 1, _exp)
			end
			-- ▲ ReadonlyArray.map ▲
			_object[_left] = _newValue
			_object.isCompleted = false
			_object.expiresAt = now + 24 * 60 * 60
			table.insert(quests, _object)
		end
	end
	-- Pick 2 random weekly quests
	local _array_1 = {}
	local _length_1 = #_array_1
	table.move(WEEKLY_QUEST_TEMPLATES, 1, #WEEKLY_QUEST_TEMPLATES, _length_1 + 1, _array_1)
	local shuffledWeekly = _array_1
	for i = #shuffledWeekly - 1, 1, -1 do
		local j = math.floor(math.random() * (i + 1))
		local _index = i + 1
		local _index_1 = j + 1
		shuffledWeekly[_index], shuffledWeekly[_index_1] = shuffledWeekly[j + 1], shuffledWeekly[i + 1]
	end
	do
		local i = 0
		local _shouldIncrement = false
		while true do
			if _shouldIncrement then
				i += 1
			else
				_shouldIncrement = true
			end
			if not (i < 2 and i < #shuffledWeekly) then
				break
			end
			local template = shuffledWeekly[i + 1]
			local _object = table.clone(template)
			setmetatable(_object, nil)
			local _left = "requirements"
			local _exp = template.requirements
			-- ▼ ReadonlyArray.map ▼
			local _newValue = table.create(#_exp)
			local _callback = function(r)
				local _object_1 = table.clone(r)
				setmetatable(_object_1, nil)
				return _object_1
			end
			for _k, _v in _exp do
				_newValue[_k] = _callback(_v, _k - 1, _exp)
			end
			-- ▲ ReadonlyArray.map ▲
			_object[_left] = _newValue
			_object.isCompleted = false
			_object.expiresAt = now + 7 * 24 * 60 * 60
			table.insert(quests, _object)
		end
	end
	return quests
end
-- Get or generate player quests
local function getPlayerQuests(player)
	local playerData = getPlayerData(player)
	if not playerData then
		return {}
	end
	local _userId = player.UserId
	local quests = playerQuests[_userId]
	-- Check if quests need refresh
	local now = os.time()
	local _condition = not quests
	if not _condition then
		-- ▼ ReadonlyArray.some ▼
		local _result = false
		local _callback = function(q)
			return if q.expiresAt ~= nil and q.expiresAt < now then true else nil
		end
		for _k, _v in quests do
			if _callback(_v, _k - 1, quests) then
				_result = true
				break
			end
		end
		-- ▲ ReadonlyArray.some ▲
		_condition = _result
	end
	local needsRefresh = _condition
	if needsRefresh or not quests then
		-- Filter out expired quests
		if quests then
			-- ▼ ReadonlyArray.filter ▼
			local _newValue = {}
			local _callback = function(q)
				local _value = q.expiresAt
				local _condition_1 = not (_value ~= 0 and _value == _value and _value)
				if not _condition_1 then
					_condition_1 = q.expiresAt >= now
				end
				return _condition_1
			end
			local _length = 0
			for _k, _v in quests do
				if _callback(_v, _k - 1, quests) == true then
					_length += 1
					_newValue[_length] = _v
				end
			end
			-- ▲ ReadonlyArray.filter ▲
			quests = _newValue
		end
		-- Generate new quests if needed
		if not quests or #quests < 3 then
			quests = generateQuests(player)
			local _userId_1 = player.UserId
			local _quests = quests
			playerQuests[_userId_1] = _quests
		end
	end
	return quests
end
-- Update quest progress
local function updateQuestProgress(player, progressType, amount)
	local quests = getPlayerQuests(player)
	for _, quest in quests do
		if quest.isCompleted then
			continue
		end
		for _1, req in quest.requirements do
			if req.type == progressType then
				req.current = math.min(req.target, req.current + amount)
			end
		end
		-- Check if quest is now complete
		local _exp = quest.requirements
		-- ▼ ReadonlyArray.every ▼
		local _result = true
		local _callback = function(r)
			return r.current >= r.target
		end
		for _k, _v in _exp do
			if not _callback(_v, _k - 1, _exp) then
				_result = false
				break
			end
		end
		-- ▲ ReadonlyArray.every ▲
		local allComplete = _result
		if allComplete and not quest.isCompleted then
			quest.isCompleted = true
			print(`✅ {player.Name} completed quest: {quest.name}!`)
		end
	end
end
-- Claim quest reward
local function claimQuestReward(player, questId)
	local quests = getPlayerQuests(player)
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(q)
		return q.questId == questId
	end
	local _result
	for _i, _v in quests do
		if _callback(_v, _i - 1, quests) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local quest = _result
	if not quest then
		return {
			success = false,
			error = "Quest not found",
		}
	end
	if not quest.isCompleted then
		return {
			success = false,
			error = "Quest not completed",
		}
	end
	-- Check if already claimed (quest would be removed)
	local playerData = getPlayerData(player)
	if not playerData then
		return {
			success = false,
			error = "Player data not found",
		}
	end
	local _dailyQuestsCompleted = playerData.dailyQuestsCompleted
	local _questId = questId
	if table.find(_dailyQuestsCompleted, _questId) ~= nil then
		return {
			success = false,
			error = "Already claimed",
		}
	end
	-- Award rewards
	local _value = quest.rewards.coins
	if _value ~= 0 and _value == _value and _value then
		addCoins(player, quest.rewards.coins)
	end
	local _value_1 = quest.rewards.gems
	if _value_1 ~= 0 and _value_1 == _value_1 and _value_1 then
		addGems(player, quest.rewards.gems)
	end
	local _value_2 = quest.rewards.dragonId
	if _value_2 ~= "" and _value_2 then
		createPlayerDragon(player, quest.rewards.dragonId, false)
	end
	-- Mark as claimed
	local _dailyQuestsCompleted_1 = playerData.dailyQuestsCompleted
	local _questId_1 = questId
	table.insert(_dailyQuestsCompleted_1, _questId_1)
	updatePlayerData(player, playerData)
	-- Remove from active quests
	-- ▼ ReadonlyArray.findIndex ▼
	local _callback_1 = function(q)
		return q.questId == questId
	end
	local _result_1 = -1
	for _i, _v in quests do
		if _callback_1(_v, _i - 1, quests) == true then
			_result_1 = _i - 1
			break
		end
	end
	-- ▲ ReadonlyArray.findIndex ▲
	local idx = _result_1
	if idx >= 0 then
		table.remove(quests, idx + 1)
	end
	print(`🎁 {player.Name} claimed reward for {quest.name}`)
	return {
		success = true,
	}
end
-- Setup quest system
local function setupQuestSystem()
	local remotes = (ReplicatedStorage:FindFirstChild("DragonRemotes")) or Instance.new("Folder")
	remotes.Name = "DragonRemotes"
	remotes.Parent = ReplicatedStorage
	local getQuestsRemote = Instance.new("RemoteFunction")
	getQuestsRemote.Name = "GetQuests"
	getQuestsRemote.Parent = remotes
	local claimQuestRemote = Instance.new("RemoteFunction")
	claimQuestRemote.Name = "ClaimQuestReward"
	claimQuestRemote.Parent = remotes
	getQuestsRemote.OnServerInvoke = function(player)
		return getPlayerQuests(player)
	end
	claimQuestRemote.OnServerInvoke = function(player, questId)
		local _questId = questId
		if not (type(_questId) == "string") then
			return {
				success = false,
				error = "Invalid quest ID",
			}
		end
		return claimQuestReward(player, questId)
	end
	-- Clean up on player leave
	Players.PlayerRemoving:Connect(function(player)
		local _userId = player.UserId
		playerQuests[_userId] = nil
	end)
	print("📋 Quest System initialized!")
end
return {
	getPlayerQuests = getPlayerQuests,
	updateQuestProgress = updateQuestProgress,
	claimQuestReward = claimQuestReward,
	setupQuestSystem = setupQuestSystem,
}
