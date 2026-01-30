-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Trading System (Server)
-- Secure dragon trading between players
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local ReplicatedStorage = _services.ReplicatedStorage
local getPlayerDragons = TS.import(script, game:GetService("ServerScriptService"), "Server", "dragons").getPlayerDragons
local _dataStore = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore")
local getPlayerData = _dataStore.getPlayerData
local updatePlayerData = _dataStore.updatePlayerData
-- Active trades storage
local activeTrades = {}
local playerTrades = {}
-- Trade expiration time (5 minutes)
local TRADE_EXPIRATION = 5 * 60
-- Generate trade ID
local function generateTradeId()
	return `trade_{os.time()}_{math.random(1000, 9999)}`
end
-- Create a trade offer
local function createTradeOffer(offerer, receiver, offeredDragonIds, offeredCoins, offeredGems, requestedDragonIds, requestedCoins, requestedGems)
	-- Validate players
	if offerer.UserId == receiver.UserId then
		return {
			success = false,
			error = "Cannot trade with yourself",
		}
	end
	-- Check if either player is in an active trade
	local _userId = offerer.UserId
	if playerTrades[_userId] ~= nil then
		return {
			success = false,
			error = "You are already in a trade",
		}
	end
	local _userId_1 = receiver.UserId
	if playerTrades[_userId_1] ~= nil then
		return {
			success = false,
			error = "That player is already trading",
		}
	end
	-- Validate offerer has the dragons
	local offererDragons = getPlayerDragons(offerer)
	for _, id in offeredDragonIds do
		-- ▼ ReadonlyArray.find ▼
		local _callback = function(d)
			return d.instanceId == id
		end
		local _result
		for _i, _v in offererDragons do
			if _callback(_v, _i - 1, offererDragons) == true then
				_result = _v
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		if not _result then
			return {
				success = false,
				error = "You don't own that dragon",
			}
		end
	end
	-- Validate receiver has the requested dragons
	local receiverDragons = getPlayerDragons(receiver)
	for _, id in requestedDragonIds do
		-- ▼ ReadonlyArray.find ▼
		local _callback = function(d)
			return d.instanceId == id
		end
		local _result
		for _i, _v in receiverDragons do
			if _callback(_v, _i - 1, receiverDragons) == true then
				_result = _v
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		if not _result then
			return {
				success = false,
				error = "They don't own that dragon",
			}
		end
	end
	-- Validate offerer has enough coins/gems
	local offererData = getPlayerData(offerer)
	if not offererData then
		return {
			success = false,
			error = "Player data not found",
		}
	end
	if offererData.coins < offeredCoins then
		return {
			success = false,
			error = "Not enough coins",
		}
	end
	if offererData.gems < offeredGems then
		return {
			success = false,
			error = "Not enough gems",
		}
	end
	-- Create trade
	local tradeId = generateTradeId()
	local trade = {
		tradeId = tradeId,
		offererPlayerId = offerer.UserId,
		receiverPlayerId = receiver.UserId,
		offeredDragons = offeredDragonIds,
		offeredCoins = offeredCoins,
		offeredGems = offeredGems,
		requestedDragons = requestedDragonIds,
		requestedCoins = requestedCoins,
		requestedGems = requestedGems,
		status = "pending",
		createdAt = os.time(),
		expiresAt = os.time() + TRADE_EXPIRATION,
	}
	activeTrades[tradeId] = trade
	local _userId_2 = offerer.UserId
	playerTrades[_userId_2] = tradeId
	local _userId_3 = receiver.UserId
	playerTrades[_userId_3] = tradeId
	print(`🔄 Trade offer created: {offerer.Name} -> {receiver.Name}`)
	return {
		success = true,
		trade = trade,
	}
end
-- Accept a trade
local cancelTrade, cleanupTrade
local function acceptTrade(player, tradeId)
	local _tradeId = tradeId
	local trade = activeTrades[_tradeId]
	if not trade then
		return {
			success = false,
			error = "Trade not found",
		}
	end
	-- Only receiver can accept
	if trade.receiverPlayerId ~= player.UserId then
		return {
			success = false,
			error = "Only the receiver can accept",
		}
	end
	if trade.status ~= "pending" then
		return {
			success = false,
			error = "Trade is no longer pending",
		}
	end
	-- Check expiration
	if os.time() > trade.expiresAt then
		cancelTrade(tradeId)
		return {
			success = false,
			error = "Trade has expired",
		}
	end
	-- Get both players
	local offerer = Players:GetPlayerByUserId(trade.offererPlayerId)
	local receiver = Players:GetPlayerByUserId(trade.receiverPlayerId)
	if not offerer or not receiver then
		cancelTrade(tradeId)
		return {
			success = false,
			error = "Player not found",
		}
	end
	-- Final validation - recheck ownership and currency
	local offererData = getPlayerData(offerer)
	local receiverData = getPlayerData(receiver)
	if not offererData or not receiverData then
		cancelTrade(tradeId)
		return {
			success = false,
			error = "Player data not found",
		}
	end
	-- Check currency again
	if offererData.coins < trade.offeredCoins or offererData.gems < trade.offeredGems then
		cancelTrade(tradeId)
		return {
			success = false,
			error = "Offerer doesn't have enough currency",
		}
	end
	if receiverData.coins < trade.requestedCoins or receiverData.gems < trade.requestedGems then
		cancelTrade(tradeId)
		return {
			success = false,
			error = "You don't have enough currency",
		}
	end
	-- Execute trade
	-- 1. Transfer currency
	offererData.coins -= trade.offeredCoins
	offererData.gems -= trade.offeredGems
	offererData.coins += trade.requestedCoins
	offererData.gems += trade.requestedGems
	receiverData.coins -= trade.requestedCoins
	receiverData.gems -= trade.requestedGems
	receiverData.coins += trade.offeredCoins
	receiverData.gems += trade.offeredGems
	-- 2. Transfer dragons
	local offererDragons = getPlayerDragons(offerer)
	local receiverDragons = getPlayerDragons(receiver)
	-- Remove offered dragons from offerer
	for _, dragonId in trade.offeredDragons do
		-- ▼ ReadonlyArray.findIndex ▼
		local _callback = function(d)
			return d.instanceId == dragonId
		end
		local _result = -1
		for _i, _v in offererDragons do
			if _callback(_v, _i - 1, offererDragons) == true then
				_result = _i - 1
				break
			end
		end
		-- ▲ ReadonlyArray.findIndex ▲
		local idx = _result
		if idx >= 0 then
			local dragon = offererDragons[idx + 1]
			table.remove(offererDragons, idx + 1)
			table.insert(receiverDragons, dragon)
		end
	end
	-- Remove requested dragons from receiver
	for _, dragonId in trade.requestedDragons do
		-- ▼ ReadonlyArray.findIndex ▼
		local _callback = function(d)
			return d.instanceId == dragonId
		end
		local _result = -1
		for _i, _v in receiverDragons do
			if _callback(_v, _i - 1, receiverDragons) == true then
				_result = _i - 1
				break
			end
		end
		-- ▲ ReadonlyArray.findIndex ▲
		local idx = _result
		if idx >= 0 then
			local dragon = receiverDragons[idx + 1]
			table.remove(receiverDragons, idx + 1)
			table.insert(offererDragons, dragon)
		end
	end
	-- Update stats
	offererData.dragonsTraded += #trade.offeredDragons
	receiverData.dragonsTraded += #trade.requestedDragons
	updatePlayerData(offerer, offererData)
	updatePlayerData(receiver, receiverData)
	-- Mark trade as complete
	trade.status = "accepted"
	cleanupTrade(tradeId)
	print(`✅ Trade completed: {offerer.Name} <-> {receiver.Name}`)
	return {
		success = true,
	}
end
-- Reject a trade
local function rejectTrade(player, tradeId)
	local _tradeId = tradeId
	local trade = activeTrades[_tradeId]
	if not trade then
		return {
			success = false,
			error = "Trade not found",
		}
	end
	if trade.receiverPlayerId ~= player.UserId then
		return {
			success = false,
			error = "Only the receiver can reject",
		}
	end
	trade.status = "rejected"
	cleanupTrade(tradeId)
	print(`❌ Trade rejected`)
	return {
		success = true,
	}
end
-- Cancel a trade
function cancelTrade(tradeId)
	local _tradeId = tradeId
	local trade = activeTrades[_tradeId]
	if trade then
		trade.status = "cancelled"
		cleanupTrade(tradeId)
		print(`🚫 Trade cancelled`)
	end
end
-- Clean up trade
function cleanupTrade(tradeId)
	local _tradeId = tradeId
	local trade = activeTrades[_tradeId]
	if trade then
		local _offererPlayerId = trade.offererPlayerId
		playerTrades[_offererPlayerId] = nil
		local _receiverPlayerId = trade.receiverPlayerId
		playerTrades[_receiverPlayerId] = nil
		local _tradeId_1 = tradeId
		activeTrades[_tradeId_1] = nil
	end
end
-- Get player's active trade
local function getPlayerTrade(player)
	local _userId = player.UserId
	local tradeId = playerTrades[_userId]
	if not (tradeId ~= "" and tradeId) then
		return nil
	end
	return activeTrades[tradeId]
end
-- Get tradeable dragons (not in active team)
local function getTradeableDragons(player)
	local dragons = getPlayerDragons(player)
	local data = getPlayerData(player)
	if not data then
		return dragons
	end
	-- ▼ ReadonlyArray.filter ▼
	local _newValue = {}
	local _callback = function(d)
		-- Check if this dragon is NOT in active slots and NOT a favorite
		-- Manual check to avoid tuple type issues with find/includes
		local slots = data.activeDragonSlots
		local inActiveSlots = slots[1] == d.instanceId or slots[2] == d.instanceId or slots[3] == d.instanceId
		return not inActiveSlots and not d.isFavorite
	end
	local _length = 0
	for _k, _v in dragons do
		if _callback(_v, _k - 1, dragons) == true then
			_length += 1
			_newValue[_length] = _v
		end
	end
	-- ▲ ReadonlyArray.filter ▲
	return _newValue
end
-- Setup trading system
local function setupTradingSystem()
	local remotes = (ReplicatedStorage:FindFirstChild("DragonRemotes")) or Instance.new("Folder")
	remotes.Name = "DragonRemotes"
	remotes.Parent = ReplicatedStorage
	local createTradeRemote = Instance.new("RemoteFunction")
	createTradeRemote.Name = "CreateTrade"
	createTradeRemote.Parent = remotes
	local acceptTradeRemote = Instance.new("RemoteFunction")
	acceptTradeRemote.Name = "AcceptTrade"
	acceptTradeRemote.Parent = remotes
	local rejectTradeRemote = Instance.new("RemoteFunction")
	rejectTradeRemote.Name = "RejectTrade"
	rejectTradeRemote.Parent = remotes
	local getTradeRemote = Instance.new("RemoteFunction")
	getTradeRemote.Name = "GetPlayerTrade"
	getTradeRemote.Parent = remotes
	createTradeRemote.OnServerInvoke = function(player, receiverUserId, offeredDragonIds, offeredCoins, offeredGems, requestedDragonIds, requestedCoins, requestedGems)
		local _receiverUserId = receiverUserId
		if not (type(_receiverUserId) == "number") then
			return {
				success = false,
				error = "Invalid receiver",
			}
		end
		local receiver = Players:GetPlayerByUserId(receiverUserId)
		if not receiver then
			return {
				success = false,
				error = "Player not found",
			}
		end
		local _offeredDragonIds = offeredDragonIds
		local _condition = not (type(_offeredDragonIds) == "table")
		if not _condition then
			local _requestedDragonIds = requestedDragonIds
			_condition = not (type(_requestedDragonIds) == "table")
		end
		if _condition then
			return {
				success = false,
				error = "Invalid dragon lists",
			}
		end
		local _exp = player
		local _exp_1 = offeredDragonIds
		local _offeredCoins = offeredCoins
		local _exp_2 = if type(_offeredCoins) == "number" then offeredCoins else 0
		local _offeredGems = offeredGems
		local _exp_3 = if type(_offeredGems) == "number" then offeredGems else 0
		local _exp_4 = requestedDragonIds
		local _requestedCoins = requestedCoins
		local _exp_5 = if type(_requestedCoins) == "number" then requestedCoins else 0
		local _requestedGems = requestedGems
		return createTradeOffer(_exp, receiver, _exp_1, _exp_2, _exp_3, _exp_4, _exp_5, if type(_requestedGems) == "number" then requestedGems else 0)
	end
	acceptTradeRemote.OnServerInvoke = function(player, tradeId)
		local _tradeId = tradeId
		if not (type(_tradeId) == "string") then
			return {
				success = false,
				error = "Invalid trade ID",
			}
		end
		return acceptTrade(player, tradeId)
	end
	rejectTradeRemote.OnServerInvoke = function(player, tradeId)
		local _tradeId = tradeId
		if not (type(_tradeId) == "string") then
			return {
				success = false,
				error = "Invalid trade ID",
			}
		end
		return rejectTrade(player, tradeId)
	end
	getTradeRemote.OnServerInvoke = function(player)
		return getPlayerTrade(player)
	end
	-- Clean up on player leave
	Players.PlayerRemoving:Connect(function(player)
		local _userId = player.UserId
		local tradeId = playerTrades[_userId]
		if tradeId ~= "" and tradeId then
			cancelTrade(tradeId)
		end
	end)
	-- Periodic cleanup of expired trades
	task.spawn(function()
		while true do
			task.wait(30)
			for tradeId, trade in activeTrades do
				if os.time() > trade.expiresAt and trade.status == "pending" then
					cancelTrade(tradeId)
				end
			end
		end
	end)
	print("🔄 Trading System initialized!")
end
return {
	createTradeOffer = createTradeOffer,
	acceptTrade = acceptTrade,
	rejectTrade = rejectTrade,
	getPlayerTrade = getPlayerTrade,
	getTradeableDragons = getTradeableDragons,
	setupTradingSystem = setupTradingSystem,
}
