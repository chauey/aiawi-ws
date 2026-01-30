-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Daily Rewards System (Server)
-- 7-day escalating rewards with streak bonuses
local ReplicatedStorage = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").ReplicatedStorage
local GAME_CONFIG = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "config").GAME_CONFIG
local _dataStore = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore")
local getPlayerData = _dataStore.getPlayerData
local updatePlayerData = _dataStore.updatePlayerData
local addCoins = _dataStore.addCoins
local addGems = _dataStore.addGems
-- Get current date string (YYYY-MM-DD)
local function getDateString()
	local date = os.date("!*t")
	return `{date.year}-{string.format("%02d", date.month)}-{string.format("%02d", date.day)}`
end
-- Check and claim daily reward
local function claimDailyReward(player)
	local playerData = getPlayerData(player)
	if not playerData then
		return {
			success = false,
			error = "Player data not found",
		}
	end
	local today = getDateString()
	-- Check if already claimed today
	if playerData.lastLoginDate == today then
		return {
			success = false,
			error = "Already claimed today!",
		}
	end
	-- Calculate streak
	local yesterday = os.time() - 86400
	local yesterdayDate = os.date("!*t", yesterday)
	local yesterdayString = `{yesterdayDate.year}-{string.format("%02d", yesterdayDate.month)}-{string.format("%02d", yesterdayDate.day)}`
	if playerData.lastLoginDate == yesterdayString then
		-- Continuing streak
		playerData.loginStreak += 1
	else
		-- Streak broken, reset to 1
		playerData.loginStreak = 1
	end
	-- Cap streak at 7 for rewards
	local rewardDay = ((playerData.loginStreak - 1) % 7) + 1
	local rewardIndex = rewardDay - 1
	-- Get coin reward
	local _condition = GAME_CONFIG.DAILY_REWARDS[rewardIndex + 1]
	if not (_condition ~= 0 and _condition == _condition and _condition) then
		_condition = 50
	end
	local coinReward = _condition
	-- Bonus gems on day 7
	local gemReward = if rewardDay == 7 then 10 else 0
	-- Apply rewards
	addCoins(player, coinReward)
	if gemReward > 0 then
		addGems(player, gemReward)
	end
	-- Update last login
	playerData.lastLoginDate = today
	updatePlayerData(player, playerData)
	print(`📅 {player.Name} claimed Day {rewardDay} reward: {coinReward} coins{if gemReward > 0 then ` + {gemReward} gems` else ""}! Streak: {playerData.loginStreak}`)
	return {
		success = true,
		reward = {
			coins = coinReward,
			gems = gemReward,
			streak = playerData.loginStreak,
		},
	}
end
-- Get daily reward status
local function getDailyRewardStatus(player)
	local playerData = getPlayerData(player)
	if not playerData then
		return {
			canClaim = true,
			streak = 0,
			nextReward = GAME_CONFIG.DAILY_REWARDS[1],
			daysUntilReset = 0,
		}
	end
	local today = getDateString()
	local canClaim = playerData.lastLoginDate ~= today
	local nextDay = if canClaim then playerData.loginStreak else playerData.loginStreak + 1
	local rewardIndex = nextDay % 7
	local _condition = GAME_CONFIG.DAILY_REWARDS[rewardIndex + 1]
	if not (_condition ~= 0 and _condition == _condition and _condition) then
		_condition = 50
	end
	local nextReward = _condition
	return {
		canClaim = canClaim,
		streak = playerData.loginStreak,
		nextReward = nextReward,
		daysUntilReset = 7 - (playerData.loginStreak % 7),
	}
end
-- Setup daily rewards system
local function setupDailyRewards()
	local remotes = (ReplicatedStorage:FindFirstChild("DragonRemotes")) or Instance.new("Folder")
	remotes.Name = "DragonRemotes"
	remotes.Parent = ReplicatedStorage
	local claimDailyRemote = Instance.new("RemoteFunction")
	claimDailyRemote.Name = "ClaimDailyReward"
	claimDailyRemote.Parent = remotes
	local getDailyStatusRemote = Instance.new("RemoteFunction")
	getDailyStatusRemote.Name = "GetDailyRewardStatus"
	getDailyStatusRemote.Parent = remotes
	claimDailyRemote.OnServerInvoke = function(player)
		return claimDailyReward(player)
	end
	getDailyStatusRemote.OnServerInvoke = function(player)
		return getDailyRewardStatus(player)
	end
	print("📅 Daily Rewards System initialized!")
end
return {
	claimDailyReward = claimDailyReward,
	getDailyRewardStatus = getDailyRewardStatus,
	setupDailyRewards = setupDailyRewards,
}
