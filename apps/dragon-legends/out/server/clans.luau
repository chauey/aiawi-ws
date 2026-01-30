-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Clan System (Server)
-- Clans with wars, territories, and perks
local ReplicatedStorage = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").ReplicatedStorage
local _dataStore = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore")
local getPlayerData = _dataStore.getPlayerData
local updatePlayerData = _dataStore.updatePlayerData
-- Active clans storage
local clans = {}
local playerClanMembership = {}
-- Generate clan ID
local function generateClanId()
	return `clan_{os.time()}_{math.random(1000, 9999)}`
end
-- Create a new clan
local function createClan(player, name, tag, description)
	-- Validate input
	if #name < 3 or #name > 20 then
		return {
			success = false,
			error = "Name must be 3-20 characters",
		}
	end
	if #tag < 2 or #tag > 5 then
		return {
			success = false,
			error = "Tag must be 2-5 characters",
		}
	end
	-- Check if player already in clan
	local _userId = player.UserId
	if playerClanMembership[_userId] ~= nil then
		return {
			success = false,
			error = "You are already in a clan",
		}
	end
	-- Check if name/tag already exists
	for _, clan in clans do
		if string.lower(clan.name) == string.lower(name) then
			return {
				success = false,
				error = "Clan name already taken",
			}
		end
		if string.lower(clan.tag) == string.lower(tag) then
			return {
				success = false,
				error = "Clan tag already taken",
			}
		end
	end
	-- Check cost (1000 coins)
	local playerData = getPlayerData(player)
	if not playerData or playerData.coins < 1000 then
		return {
			success = false,
			error = "Need 1000 coins to create clan",
		}
	end
	playerData.coins -= 1000
	local clanId = generateClanId()
	local founder = {
		playerId = player.UserId,
		playerName = player.Name,
		role = "leader",
		joinedAt = os.time(),
		contribution = 0,
		lastActive = os.time(),
	}
	local clan = {
		clanId = clanId,
		name = name,
		tag = string.upper(tag),
		description = description,
		level = 1,
		experience = 0,
		members = { founder },
		maxMembers = 20,
		createdAt = os.time(),
		leaderPlayerId = player.UserId,
		weeklyWarScore = 0,
		territoryCount = 0,
		perks = {},
	}
	clans[clanId] = clan
	local _userId_1 = player.UserId
	playerClanMembership[_userId_1] = clanId
	playerData.clanId = clanId
	playerData.clanRole = "leader"
	updatePlayerData(player, playerData)
	print(`🏰 {player.Name} created clan [{tag}] {name}!`)
	return {
		success = true,
		clan = clan,
	}
end
-- Join a clan
local function joinClan(player, clanId)
	local _userId = player.UserId
	if playerClanMembership[_userId] ~= nil then
		return {
			success = false,
			error = "Already in a clan",
		}
	end
	local _clanId = clanId
	local clan = clans[_clanId]
	if not clan then
		return {
			success = false,
			error = "Clan not found",
		}
	end
	if #clan.members >= clan.maxMembers then
		return {
			success = false,
			error = "Clan is full",
		}
	end
	local member = {
		playerId = player.UserId,
		playerName = player.Name,
		role = "member",
		joinedAt = os.time(),
		contribution = 0,
		lastActive = os.time(),
	}
	local _exp = clan.members
	table.insert(_exp, member)
	local _userId_1 = player.UserId
	local _clanId_1 = clanId
	playerClanMembership[_userId_1] = _clanId_1
	local playerData = getPlayerData(player)
	if playerData then
		playerData.clanId = clanId
		playerData.clanRole = "member"
		updatePlayerData(player, playerData)
	end
	print(`👋 {player.Name} joined [{clan.tag}] {clan.name}!`)
	return {
		success = true,
	}
end
-- Leave clan
local function leaveClan(player)
	local _userId = player.UserId
	local clanId = playerClanMembership[_userId]
	if not (clanId ~= "" and clanId) then
		return {
			success = false,
			error = "Not in a clan",
		}
	end
	local clan = clans[clanId]
	if not clan then
		local _userId_1 = player.UserId
		playerClanMembership[_userId_1] = nil
		return {
			success = false,
			error = "Clan not found",
		}
	end
	-- Can't leave if leader and there are other members
	if clan.leaderPlayerId == player.UserId and #clan.members > 1 then
		return {
			success = false,
			error = "Transfer leadership before leaving",
		}
	end
	-- Remove from clan
	local _exp = clan.members
	-- ▼ ReadonlyArray.findIndex ▼
	local _callback = function(m)
		return m.playerId == player.UserId
	end
	local _result = -1
	for _i, _v in _exp do
		if _callback(_v, _i - 1, _exp) == true then
			_result = _i - 1
			break
		end
	end
	-- ▲ ReadonlyArray.findIndex ▲
	local memberIndex = _result
	if memberIndex >= 0 then
		table.remove(clan.members, memberIndex + 1)
	end
	local _userId_1 = player.UserId
	playerClanMembership[_userId_1] = nil
	-- If no members left, delete clan
	if #clan.members == 0 then
		clans[clanId] = nil
		print(`💀 Clan [{clan.tag}] {clan.name} disbanded!`)
	end
	local playerData = getPlayerData(player)
	if playerData then
		playerData.clanId = nil
		playerData.clanRole = nil
		updatePlayerData(player, playerData)
	end
	print(`👋 {player.Name} left [{clan.tag}] {clan.name}`)
	return {
		success = true,
	}
end
-- Contribute coins to clan
local function contributeToeClan(player, amount)
	local _userId = player.UserId
	local clanId = playerClanMembership[_userId]
	if not (clanId ~= "" and clanId) then
		return {
			success = false,
			error = "Not in a clan",
		}
	end
	local clan = clans[clanId]
	if not clan then
		return {
			success = false,
			error = "Clan not found",
		}
	end
	local playerData = getPlayerData(player)
	if not playerData or playerData.coins < amount then
		return {
			success = false,
			error = "Not enough coins",
		}
	end
	playerData.coins -= amount
	-- Add to member contribution
	local _exp = clan.members
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(m)
		return m.playerId == player.UserId
	end
	local _result
	for _i, _v in _exp do
		if _callback(_v, _i - 1, _exp) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local member = _result
	if member then
		member.contribution += amount
		member.lastActive = os.time()
	end
	-- Add to clan XP
	clan.experience += amount
	-- Level up clan if enough XP
	local xpNeeded = clan.level * 10000
	if clan.experience >= xpNeeded then
		clan.level += 1
		clan.experience -= xpNeeded
		clan.maxMembers = math.min(50, 20 + clan.level * 3)
		print(`🎉 Clan [{clan.tag}] leveled up to {clan.level}!`)
	end
	updatePlayerData(player, playerData)
	print(`💰 {player.Name} contributed {amount} coins to clan!`)
	return {
		success = true,
	}
end
-- Add war score
local function addWarScore(clanId, score)
	local _clanId = clanId
	local clan = clans[_clanId]
	if clan then
		clan.weeklyWarScore += score
		print(`⚔️ Clan [{clan.tag}] +{score} war points!`)
	end
end
-- Get clan leaderboard
local function getClanLeaderboard()
	local allClans = {}
	for _, clan in clans do
		table.insert(allClans, clan)
	end
	-- Sort by war score (bubble sort for roblox-ts)
	for i = 0, #allClans - 1 do
		do
			local j = i + 1
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					j += 1
				else
					_shouldIncrement = true
				end
				if not (j < #allClans) then
					break
				end
				if allClans[j + 1].weeklyWarScore > allClans[i + 1].weeklyWarScore then
					local _index = i + 1
					local _index_1 = j + 1
					allClans[_index], allClans[_index_1] = allClans[j + 1], allClans[i + 1]
				end
			end
		end
	end
	return allClans
end
-- Get player's clan
local function getPlayerClan(player)
	local _userId = player.UserId
	local clanId = playerClanMembership[_userId]
	if not (clanId ~= "" and clanId) then
		return nil
	end
	return clans[clanId]
end
-- Search clans
local function searchClans(query)
	local results = {}
	local lowerQuery = string.lower(query)
	for _, clan in clans do
		local _condition = (string.find(string.lower(clan.name), lowerQuery))
		if not (_condition ~= 0 and _condition == _condition and _condition) then
			_condition = (string.find(string.lower(clan.tag), lowerQuery))
		end
		if _condition ~= 0 and _condition == _condition and _condition then
			table.insert(results, clan)
		end
	end
	return results
end
-- Promote member
local function promoteMember(player, targetPlayerId)
	local _userId = player.UserId
	local clanId = playerClanMembership[_userId]
	if not (clanId ~= "" and clanId) then
		return {
			success = false,
			error = "Not in a clan",
		}
	end
	local clan = clans[clanId]
	if not clan then
		return {
			success = false,
			error = "Clan not found",
		}
	end
	-- Must be leader
	if clan.leaderPlayerId ~= player.UserId then
		return {
			success = false,
			error = "Only leader can promote",
		}
	end
	local _exp = clan.members
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(m)
		return m.playerId == targetPlayerId
	end
	local _result
	for _i, _v in _exp do
		if _callback(_v, _i - 1, _exp) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local member = _result
	if not member then
		return {
			success = false,
			error = "Member not found",
		}
	end
	if member.role == "officer" then
		return {
			success = false,
			error = "Already an officer",
		}
	end
	member.role = "officer"
	print(`⬆️ {member.playerName} promoted to officer!`)
	return {
		success = true,
	}
end
-- Transfer leadership
local function transferLeadership(player, targetPlayerId)
	local _userId = player.UserId
	local clanId = playerClanMembership[_userId]
	if not (clanId ~= "" and clanId) then
		return {
			success = false,
			error = "Not in a clan",
		}
	end
	local clan = clans[clanId]
	if not clan then
		return {
			success = false,
			error = "Clan not found",
		}
	end
	if clan.leaderPlayerId ~= player.UserId then
		return {
			success = false,
			error = "Only leader can transfer",
		}
	end
	local _exp = clan.members
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(m)
		return m.playerId == targetPlayerId
	end
	local _result
	for _i, _v in _exp do
		if _callback(_v, _i - 1, _exp) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local newLeader = _result
	if not newLeader then
		return {
			success = false,
			error = "Member not found",
		}
	end
	-- Update roles
	local _exp_1 = clan.members
	-- ▼ ReadonlyArray.find ▼
	local _callback_1 = function(m)
		return m.playerId == player.UserId
	end
	local _result_1
	for _i, _v in _exp_1 do
		if _callback_1(_v, _i - 1, _exp_1) == true then
			_result_1 = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local oldLeader = _result_1
	if oldLeader then
		oldLeader.role = "member"
	end
	newLeader.role = "leader"
	clan.leaderPlayerId = targetPlayerId
	print(`👑 {newLeader.playerName} is now clan leader!`)
	return {
		success = true,
	}
end
-- Setup clan system
local function setupClanSystem()
	local remotes = (ReplicatedStorage:FindFirstChild("DragonRemotes")) or Instance.new("Folder")
	remotes.Name = "DragonRemotes"
	remotes.Parent = ReplicatedStorage
	local createClanRemote = Instance.new("RemoteFunction")
	createClanRemote.Name = "CreateClan"
	createClanRemote.Parent = remotes
	local joinClanRemote = Instance.new("RemoteFunction")
	joinClanRemote.Name = "JoinClan"
	joinClanRemote.Parent = remotes
	local leaveClanRemote = Instance.new("RemoteFunction")
	leaveClanRemote.Name = "LeaveClan"
	leaveClanRemote.Parent = remotes
	local contributeClanRemote = Instance.new("RemoteFunction")
	contributeClanRemote.Name = "ContributeClan"
	contributeClanRemote.Parent = remotes
	local getClanRemote = Instance.new("RemoteFunction")
	getClanRemote.Name = "GetPlayerClan"
	getClanRemote.Parent = remotes
	local searchClansRemote = Instance.new("RemoteFunction")
	searchClansRemote.Name = "SearchClans"
	searchClansRemote.Parent = remotes
	local getClanLeaderboardRemote = Instance.new("RemoteFunction")
	getClanLeaderboardRemote.Name = "GetClanLeaderboard"
	getClanLeaderboardRemote.Parent = remotes
	createClanRemote.OnServerInvoke = function(player, name, tag, description)
		local _name = name
		local _condition = not (type(_name) == "string")
		if not _condition then
			local _tag = tag
			_condition = not (type(_tag) == "string")
			if not _condition then
				local _description = description
				_condition = not (type(_description) == "string")
			end
		end
		if _condition then
			return {
				success = false,
				error = "Invalid parameters",
			}
		end
		return createClan(player, name, tag, description)
	end
	joinClanRemote.OnServerInvoke = function(player, clanId)
		local _clanId = clanId
		if not (type(_clanId) == "string") then
			return {
				success = false,
				error = "Invalid clan ID",
			}
		end
		return joinClan(player, clanId)
	end
	leaveClanRemote.OnServerInvoke = function(player)
		return leaveClan(player)
	end
	contributeClanRemote.OnServerInvoke = function(player, amount)
		local _amount = amount
		local _condition = not (type(_amount) == "number")
		if not _condition then
			_condition = amount <= 0
		end
		if _condition then
			return {
				success = false,
				error = "Invalid amount",
			}
		end
		return contributeToeClan(player, amount)
	end
	getClanRemote.OnServerInvoke = function(player)
		return getPlayerClan(player)
	end
	searchClansRemote.OnServerInvoke = function(player, query)
		local _query = query
		if not (type(_query) == "string") then
			return {}
		end
		return searchClans(query)
	end
	getClanLeaderboardRemote.OnServerInvoke = function()
		return getClanLeaderboard()
	end
	print("🏰 Clan System initialized!")
end
return {
	createClan = createClan,
	joinClan = joinClan,
	leaveClan = leaveClan,
	contributeToeClan = contributeToeClan,
	addWarScore = addWarScore,
	getClanLeaderboard = getClanLeaderboard,
	getPlayerClan = getPlayerClan,
	searchClans = searchClans,
	promoteMember = promoteMember,
	transferLeadership = transferLeadership,
	setupClanSystem = setupClanSystem,
}
