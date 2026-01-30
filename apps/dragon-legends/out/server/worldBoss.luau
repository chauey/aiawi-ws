-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - World Boss System (Server)
-- Server-wide cooperative boss battles with contribution rewards
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local ReplicatedStorage = _services.ReplicatedStorage
local Workspace = _services.Workspace
local DRAGONS = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "config").DRAGONS
local _dataStore = TS.import(script, game:GetService("ServerScriptService"), "Server", "dataStore")
local addCoins = _dataStore.addCoins
local addGems = _dataStore.addGems
local getPlayerData = _dataStore.getPlayerData
local createPlayerDragon = TS.import(script, game:GetService("ServerScriptService"), "Server", "dragons").createPlayerDragon
local addWarScore = TS.import(script, game:GetService("ServerScriptService"), "Server", "clans").addWarScore
-- World boss definitions
local WORLD_BOSSES = { {
	id = "ancient_fire_titan",
	name = "Ancient Fire Titan",
	element = "fire",
	baseHp = 1000000,
	dragonDrops = { "inferno_drake", "solar_phoenix" },
	dropChance = 0.05,
}, {
	id = "ice_colossus",
	name = "Ice Colossus",
	element = "ice",
	baseHp = 1200000,
	dragonDrops = { "blizzard_king", "crystal_dragon" },
	dropChance = 0.05,
}, {
	id = "storm_leviathan",
	name = "Storm Leviathan",
	element = "electric",
	baseHp = 1500000,
	dragonDrops = { "storm_emperor", "cosmic_dragon" },
	dropChance = 0.03,
}, {
	id = "void_emperor",
	name = "Void Emperor",
	element = "shadow",
	baseHp = 2000000,
	dragonDrops = { "void_dragon", "chaos_lord" },
	dropChance = 0.01,
} }
-- Current world boss state
local currentBoss
local bossModel
-- Boss spawn timing
local BOSS_DURATION = 30 * 60
local BOSS_COOLDOWN = 2 * 60 * 60
-- Create boss model in world
local function createBossModel(boss)
	local model = Instance.new("Model")
	model.Name = `WorldBoss_{boss.id}`
	-- Giant boss body
	local body = Instance.new("Part")
	body.Name = "Body"
	body.Size = Vector3.new(30, 30, 40)
	body.Position = Vector3.new(0, 50, -150)
	body.BrickColor = if boss.element == "fire" then BrickColor.new("Bright red") elseif boss.element == "ice" then BrickColor.new("Light blue") elseif boss.element == "electric" then BrickColor.new("Bright yellow") else BrickColor.new("Really black")
	body.Material = Enum.Material.Neon
	body.Anchored = true
	body.CanCollide = false
	body.Parent = model
	-- Intimidating glow
	local light = Instance.new("PointLight")
	light.Color = body.BrickColor.Color
	light.Brightness = 5
	light.Range = 60
	light.Parent = body
	-- Particle effects
	local particles = Instance.new("ParticleEmitter")
	particles.Color = ColorSequence.new(body.BrickColor.Color)
	particles.LightEmission = 1
	particles.Size = NumberSequence.new(2)
	particles.Rate = 20
	particles.Lifetime = NumberRange.new(1, 2)
	particles.Speed = NumberRange.new(5, 10)
	particles.Parent = body
	-- Health bar
	local billboard = Instance.new("BillboardGui")
	billboard.Size = UDim2.new(0, 400, 0, 100)
	billboard.StudsOffset = Vector3.new(0, 25, 0)
	billboard.AlwaysOnTop = true
	local nameLabel = Instance.new("TextLabel")
	nameLabel.Size = UDim2.new(1, 0, 0.4, 0)
	nameLabel.Position = UDim2.new(0, 0, 0, 0)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text = `🐲 {boss.name} 🐲`
	nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	nameLabel.TextStrokeColor3 = Color3.fromRGB(0, 0, 0)
	nameLabel.TextStrokeTransparency = 0
	nameLabel.TextScaled = true
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.Parent = billboard
	-- HP bar background
	local hpBg = Instance.new("Frame")
	hpBg.Size = UDim2.new(1, 0, 0.3, 0)
	hpBg.Position = UDim2.new(0, 0, 0.5, 0)
	hpBg.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
	hpBg.BorderSizePixel = 3
	hpBg.Parent = billboard
	local hpBar = Instance.new("Frame")
	hpBar.Name = "HPBar"
	hpBar.Size = UDim2.new(1, 0, 1, 0)
	hpBar.BackgroundColor3 = Color3.fromRGB(200, 50, 50)
	hpBar.BorderSizePixel = 0
	hpBar.Parent = hpBg
	local hpLabel = Instance.new("TextLabel")
	hpLabel.Name = "HPLabel"
	hpLabel.Size = UDim2.new(1, 0, 1, 0)
	hpLabel.BackgroundTransparency = 1
	hpLabel.Text = `{tostring(boss.baseHp)} / {tostring(boss.baseHp)}`
	hpLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	hpLabel.TextStrokeTransparency = 0
	hpLabel.TextScaled = true
	hpLabel.Font = Enum.Font.GothamBold
	hpLabel.Parent = hpBg
	billboard.Parent = body
	-- Animation - floating and rotating
	task.spawn(function()
		local angle = 0
		while model.Parent do
			angle += 0.01
			local bobY = math.sin(angle * 2) * 2
			body.Position = Vector3.new(0, 50 + bobY, -150)
			local _cFrame = body.CFrame
			local _arg0 = CFrame.Angles(0, 0.005, 0)
			body.CFrame = _cFrame * _arg0
			task.wait(0.03)
		end
	end)
	model.PrimaryPart = body
	model.Parent = Workspace
	return model
end
-- Update boss health bar
local function updateBossHealthBar()
	if not bossModel or not currentBoss then
		return nil
	end
	local body = bossModel:FindFirstChild("Body")
	if not body then
		return nil
	end
	local billboard = body:FindFirstChildOfClass("BillboardGui")
	if not billboard then
		return nil
	end
	local hpBg = billboard:FindFirstChild("Frame")
	if not hpBg then
		return nil
	end
	local hpBar = hpBg:FindFirstChild("HPBar")
	local hpLabel = hpBg:FindFirstChild("HPLabel")
	if hpBar then
		local hpPercent = currentBoss.currentHp / currentBoss.maxHp
		hpBar.Size = UDim2.new(math.max(0, hpPercent), 0, 1, 0)
	end
	if hpLabel then
		hpLabel.Text = `{tostring(math.floor(currentBoss.currentHp))} / {tostring(currentBoss.maxHp)}`
	end
end
-- Spawn a world boss
local endBoss
local function spawnWorldBoss()
	-- Pick random boss
	local bossConfig = WORLD_BOSSES[math.floor(math.random() * #WORLD_BOSSES) + 1]
	currentBoss = {
		bossId = bossConfig.id,
		name = bossConfig.name,
		element = bossConfig.element,
		currentHp = bossConfig.baseHp,
		maxHp = bossConfig.baseHp,
		phase = 1,
		participants = {},
		startTime = os.time(),
		isDefeated = false,
	}
	bossModel = createBossModel(bossConfig)
	-- Announce to all players
	for _, player in Players:GetPlayers() do
		-- Would use remote event to show notification
		print(`🐲 WORLD BOSS SPAWNED: {bossConfig.name}!`)
	end
	print(`🐲 World Boss {bossConfig.name} has appeared!`)
	-- Set timeout
	task.delay(BOSS_DURATION, function()
		if currentBoss and not currentBoss.isDefeated then
			endBoss(false)
		end
	end)
end
-- Deal damage to boss
local function damageBoss(player, damage)
	if not currentBoss then
		return {
			success = false,
			bossDefeated = false,
			error = "No active boss",
		}
	end
	if currentBoss.isDefeated then
		return {
			success = false,
			bossDefeated = false,
			error = "Boss already defeated",
		}
	end
	-- Record participation
	local _exp = currentBoss.participants
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(p)
		return p.playerId == player.UserId
	end
	local _result
	for _i, _v in _exp do
		if _callback(_v, _i - 1, _exp) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local existing = _result
	if existing then
		existing.damage += damage
	else
		local _participants = currentBoss.participants
		local _arg0 = {
			playerId = player.UserId,
			damage = damage,
		}
		table.insert(_participants, _arg0)
	end
	-- Apply damage
	currentBoss.currentHp = math.max(0, currentBoss.currentHp - damage)
	updateBossHealthBar()
	-- Check phases
	local hpPercent = currentBoss.currentHp / currentBoss.maxHp
	if hpPercent <= 0.5 and currentBoss.phase == 1 then
		currentBoss.phase = 2
		print("🐲 World Boss entered Phase 2!")
	elseif hpPercent <= 0.25 and currentBoss.phase == 2 then
		currentBoss.phase = 3
		print("🐲 World Boss entered Final Phase!")
	end
	-- Check if defeated
	if currentBoss.currentHp <= 0 then
		currentBoss.isDefeated = true
		endBoss(true)
		return {
			success = true,
			bossDefeated = true,
		}
	end
	return {
		success = true,
		bossDefeated = false,
	}
end
-- End boss fight and distribute rewards
function endBoss(victory)
	if not currentBoss then
		return nil
	end
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(b)
		return b.id == currentBoss.bossId
	end
	local _result
	for _i, _v in WORLD_BOSSES do
		if _callback(_v, _i - 1, WORLD_BOSSES) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	local bossConfig = _result
	if victory and bossConfig then
		-- Sort participants by damage
		-- Sort participants by damage (bubble sort since roblox-ts sort needs boolean)
		local _array = {}
		local _length = #_array
		local _array_1 = currentBoss.participants
		table.move(_array_1, 1, #_array_1, _length + 1, _array)
		local participantsCopy = _array
		for i = 0, #participantsCopy - 1 do
			do
				local j = i + 1
				local _shouldIncrement = false
				while true do
					if _shouldIncrement then
						j += 1
					else
						_shouldIncrement = true
					end
					if not (j < #participantsCopy) then
						break
					end
					if participantsCopy[j + 1].damage > participantsCopy[i + 1].damage then
						local _index = i + 1
						local _index_1 = j + 1
						participantsCopy[_index], participantsCopy[_index_1] = participantsCopy[j + 1], participantsCopy[i + 1]
					end
				end
			end
		end
		local sorted = participantsCopy
		local totalDamage = 0
		for _, p in sorted do
			totalDamage += p.damage
		end
		-- Distribute rewards
		-- ▼ ReadonlyArray.forEach ▼
		local _callback_1 = function(participant, rank)
			local player = Players:GetPlayerByUserId(participant.playerId)
			if not player then
				return nil
			end
			-- Calculate reward based on contribution
			local contributionPercent = participant.damage / totalDamage
			local baseCoins = 1000
			local coinReward = math.floor(baseCoins + baseCoins * contributionPercent * 10)
			local gemReward = if rank < 3 then 20 - rank * 5 else 5
			addCoins(player, coinReward)
			addGems(player, gemReward)
			-- Dragon drop chance (higher for top contributors)
			local dropChance = bossConfig.dropChance * (if rank < 10 then 2 else 1) * (1 + contributionPercent)
			if math.random() < dropChance then
				local dragonId = bossConfig.dragonDrops[math.floor(math.random() * #bossConfig.dragonDrops) + 1]
				local isShiny = math.random() < 0.1
				createPlayerDragon(player, dragonId, isShiny)
				local _exp = player.Name
				local _exp_1 = if isShiny then " SHINY" else ""
				local _result_1 = DRAGONS[dragonId]
				if _result_1 ~= nil then
					_result_1 = _result_1.name
				end
				print(`🎉 {_exp} got{_exp_1} {_result_1} from boss!`)
			end
			-- Add clan war score if in clan
			local playerData = getPlayerData(player)
			local _result_1 = playerData
			if _result_1 ~= nil then
				_result_1 = _result_1.clanId
			end
			if _result_1 ~= "" and _result_1 then
				addWarScore(playerData.clanId, math.floor(contributionPercent * 100))
			end
			print(`🏆 {player.Name} earned {coinReward} coins, {gemReward} gems from boss!`)
		end
		for _k, _v in sorted do
			_callback_1(_v, _k - 1, sorted)
		end
		-- ▲ ReadonlyArray.forEach ▲
		print(`🎉 World Boss {currentBoss.name} defeated!`)
	else
		print(`💀 World Boss {currentBoss.name} was not defeated in time!`)
	end
	-- Cleanup
	if bossModel then
		bossModel:Destroy()
		bossModel = nil
	end
	currentBoss = nil
	-- Schedule next boss
	task.delay(BOSS_COOLDOWN, function()
		spawnWorldBoss()
	end)
end
-- Get current boss state
local function getCurrentBoss()
	return currentBoss
end
-- Setup world boss system
local function setupWorldBoss()
	local remotes = (ReplicatedStorage:FindFirstChild("DragonRemotes")) or Instance.new("Folder")
	remotes.Name = "DragonRemotes"
	remotes.Parent = ReplicatedStorage
	local attackBossRemote = Instance.new("RemoteFunction")
	attackBossRemote.Name = "AttackWorldBoss"
	attackBossRemote.Parent = remotes
	local getBossStateRemote = Instance.new("RemoteFunction")
	getBossStateRemote.Name = "GetWorldBossState"
	getBossStateRemote.Parent = remotes
	attackBossRemote.OnServerInvoke = function(player, damage)
		local _damage = damage
		local _condition = not (type(_damage) == "number")
		if not _condition then
			_condition = damage <= 0
		end
		if _condition then
			return {
				success = false,
				error = "Invalid damage",
			}
		end
		return damageBoss(player, damage)
	end
	getBossStateRemote.OnServerInvoke = function()
		return getCurrentBoss()
	end
	-- Spawn first boss after delay
	task.delay(60, function()
		spawnWorldBoss()
	end)
	print("🐲 World Boss System initialized!")
end
return {
	damageBoss = damageBoss,
	getCurrentBoss = getCurrentBoss,
	setupWorldBoss = setupWorldBoss,
}
