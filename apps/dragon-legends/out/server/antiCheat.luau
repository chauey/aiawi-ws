-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Anti-Cheat & Security System
-- Validates all server requests and prevents common exploits
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local RunService = _services.RunService
local getPlayerData = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore").getPlayerData
-- ==================== RATE LIMITING ====================
local rateLimits = {}
local RATE_LIMITS = {
	egg_hatch = {
		maxRequests = 10,
		windowSeconds = 60,
	},
	breed = {
		maxRequests = 5,
		windowSeconds = 60,
	},
	trade_request = {
		maxRequests = 10,
		windowSeconds = 60,
	},
	arena_queue = {
		maxRequests = 5,
		windowSeconds = 30,
	},
	world_boss_attack = {
		maxRequests = 60,
		windowSeconds = 60,
	},
	coin_collect = {
		maxRequests = 100,
		windowSeconds = 10,
	},
}
local function checkRateLimit(player, action)
	local limitKey = `{player.UserId}_{action}`
	local config = RATE_LIMITS[action]
	if not config then
		return true
	end
	local now = os.time()
	local entry = rateLimits[limitKey]
	if not entry or now >= entry.resetTime then
		-- Start new window
		local _arg1 = {
			count = 1,
			resetTime = now + config.windowSeconds,
		}
		rateLimits[limitKey] = _arg1
		return true
	end
	if entry.count >= config.maxRequests then
		warn(`[AntiCheat] Rate limit exceeded: {player.Name} - {action}`)
		return false
	end
	entry.count += 1
	return true
end
-- ==================== VALUE VALIDATION ====================
local function validateCoins(player, amount)
	local data = getPlayerData(player)
	if not data then
		return false
	end
	if amount < 0 or amount > data.coins then
		warn(`[AntiCheat] Invalid coin amount: {player.Name} tried {amount}, has {data.coins}`)
		return false
	end
	return true
end
local function validateGems(player, amount)
	local data = getPlayerData(player)
	if not data then
		return false
	end
	if amount < 0 or amount > data.gems then
		warn(`[AntiCheat] Invalid gem amount: {player.Name} tried {amount}, has {data.gems}`)
		return false
	end
	return true
end
local function validateDragonOwnership(player, dragonInstanceId)
	local data = getPlayerData(player)
	if not data then
		return false
	end
	local _exp = data.dragons
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(d)
		return d.instanceId == dragonInstanceId
	end
	local _result
	for _i, _v in _exp do
		if _callback(_v, _i - 1, _exp) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local owned = _result
	if not owned then
		warn(`[AntiCheat] Dragon not owned: {player.Name} tried to use {dragonInstanceId}`)
		return false
	end
	return true
end
-- ==================== TELEPORT/SPEED VALIDATION ====================
local playerPositions = {}
local MAX_SPEED = 100
local function validateMovement(player)
	local character = player.Character
	if not character then
		return true
	end
	local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
	if not humanoidRootPart then
		return true
	end
	local currentPos = humanoidRootPart.Position
	local now = os.time()
	local _userId = player.UserId
	local lastEntry = playerPositions[_userId]
	if not lastEntry then
		local _userId_1 = player.UserId
		local _arg1 = {
			position = currentPos,
			time = now,
		}
		playerPositions[_userId_1] = _arg1
		return true
	end
	local timeDelta = now - lastEntry.time
	if timeDelta < 1 then
		return true
	end
	local _position = lastEntry.position
	local distance = (currentPos - _position).Magnitude
	local speed = distance / timeDelta
	local _userId_1 = player.UserId
	local _arg1 = {
		position = currentPos,
		time = now,
	}
	playerPositions[_userId_1] = _arg1
	if speed > MAX_SPEED then
		warn(`[AntiCheat] Speed hack detected: {player.Name} moving at {speed} studs/s`)
		-- Teleport back to last valid position
		humanoidRootPart.CFrame = CFrame.new(lastEntry.position)
		return false
	end
	return true
end
-- ==================== ACTION VALIDATION ====================
local function validateAction(player, actionName, payload, validator)
	-- Rate limit check
	if not checkRateLimit(player, actionName) then
		return false
	end
	-- Payload validation
	if not validator(payload) then
		warn(`[AntiCheat] Invalid payload: {player.Name} - {actionName}`)
		return false
	end
	return true
end
-- ==================== SUSPICIOUS ACTIVITY TRACKING ====================
local suspiciousPlayers = {}
local KICK_THRESHOLD = 10
local function reportSuspiciousActivity(player, reason)
	local _userId = player.UserId
	local _condition = suspiciousPlayers[_userId]
	if _condition == nil then
		_condition = {
			count = 0,
			lastReported = 0,
		}
	end
	local activity = _condition
	activity.count += 1
	activity.lastReported = os.time()
	local _userId_1 = player.UserId
	suspiciousPlayers[_userId_1] = activity
	warn(`[AntiCheat] Suspicious: {player.Name} - {reason} (Count: {activity.count})`)
	if activity.count >= KICK_THRESHOLD then
		player:Kick("Suspicious activity detected. Please rejoin.")
		warn(`[AntiCheat] KICKED: {player.Name} for repeated violations`)
	end
end
-- ==================== SECURE RANDOM ====================
-- Server-side random to prevent client prediction
local function secureRandom(min, max)
	return math.floor(math.random() * (max - min + 1)) + min
end
local function secureRandomFloat()
	return math.random()
end
-- Weighted random with server-side validation
local function secureWeightedRandom(items)
	if #items == 0 then
		error("Cannot select from empty weighted list")
	end
	local totalWeight = 0
	for _, entry in items do
		totalWeight += entry.weight
	end
	local random = secureRandomFloat() * totalWeight
	for _, entry in items do
		random -= entry.weight
		if random <= 0 then
			return entry.item
		end
	end
	return items[#items].item
end
-- ==================== SETUP ====================
local function setupAntiCheat()
	-- Clean up on player leave
	Players.PlayerRemoving:Connect(function(player)
		local _userId = player.UserId
		playerPositions[_userId] = nil
		local _userId_1 = player.UserId
		suspiciousPlayers[_userId_1] = nil
		-- Clean up rate limits for this player
		for key in rateLimits do
			local _arg1 = #tostring(player.UserId)
			if string.sub(key, 1, _arg1) == tostring(player.UserId) then
				rateLimits[key] = nil
			end
		end
	end)
	-- Periodic movement validation (if enabled)
	if RunService:IsServer() then
		task.spawn(function()
			while true do
				task.wait(2)
				for _, player in Players:GetPlayers() do
					validateMovement(player)
				end
			end
		end)
	end
	print("[AntiCheat] Security system initialized")
end
return {
	checkRateLimit = checkRateLimit,
	validateCoins = validateCoins,
	validateGems = validateGems,
	validateDragonOwnership = validateDragonOwnership,
	validateMovement = validateMovement,
	validateAction = validateAction,
	reportSuspiciousActivity = reportSuspiciousActivity,
	secureRandom = secureRandom,
	secureRandomFloat = secureRandomFloat,
	secureWeightedRandom = secureWeightedRandom,
	setupAntiCheat = setupAntiCheat,
}
