-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Dragon System (Server)
-- Core dragon management, spawning, and following behavior
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local Workspace = _services.Workspace
local ReplicatedStorage = _services.ReplicatedStorage
local _config = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "config")
local DRAGONS = _config.DRAGONS
local RARITIES = _config.RARITIES
local GAME_CONFIG = _config.GAME_CONFIG
local DRAGON_EMOJIS = TS.import(script, game:GetService("ReplicatedStorage"), "Shared", "theme").DRAGON_EMOJIS
-- Store active dragon models
local activeDragonModels = {}
local playerDragons = {}
-- Generate unique instance ID
local function generateInstanceId()
	local chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	local result = ""
	for i = 0, 15 do
		local idx = math.floor(math.random() * #chars)
		local _arg0 = idx + 1
		local _arg1 = idx + 1
		result ..= string.sub(chars, _arg0, _arg1)
	end
	return result
end
-- Create dragon model in world
local getDragonSize, getElementBrickColor, addElementEffects
local function createDragonModel(dragon, position)
	local def = DRAGONS[dragon.dragonId]
	if not def then
		error(`Unknown dragon: {dragon.dragonId}`)
	end
	local model = Instance.new("Model")
	model.Name = `Dragon_{dragon.instanceId}`
	-- Create dragon body based on element and evolution stage
	local body = Instance.new("Part")
	body.Name = "Body"
	body.Size = getDragonSize(dragon.evolutionStage)
	body.Position = position
	body.BrickColor = getElementBrickColor(def.element)
	body.Material = Enum.Material.SmoothPlastic
	body.CanCollide = false
	body.Anchored = false
	body.Parent = model
	-- Add transparent flying effect
	local bodyForce = Instance.new("BodyForce")
	bodyForce.Force = Vector3.new(0, body.Mass * 196.2, 0)
	bodyForce.Parent = body
	-- Add glow for rarity
	if dragon.rarity == "Legendary" or dragon.rarity == "Mythic" then
		local pointLight = Instance.new("PointLight")
		pointLight.Color = RARITIES[dragon.rarity].color
		pointLight.Brightness = 2
		pointLight.Range = 8
		pointLight.Parent = body
	end
	-- Add shiny sparkle effect
	if dragon.isShiny then
		local sparkle = Instance.new("ParticleEmitter")
		sparkle.Color = ColorSequence.new(Color3.fromRGB(255, 255, 200))
		sparkle.LightEmission = 1
		sparkle.Size = NumberSequence.new(0.3)
		sparkle.Rate = 5
		sparkle.Lifetime = NumberRange.new(0.5, 1)
		sparkle.Speed = NumberRange.new(1, 2)
		sparkle.Parent = body
	end
	-- Add element-specific effects
	addElementEffects(body, def.element)
	-- Add name tag
	local billboard = Instance.new("BillboardGui")
	billboard.Size = UDim2.new(0, 100, 0, 50)
	billboard.StudsOffset = Vector3.new(0, 2.5, 0)
	billboard.AlwaysOnTop = true
	local nameLabel = Instance.new("TextLabel")
	nameLabel.Size = UDim2.new(1, 0, 0.6, 0)
	nameLabel.Position = UDim2.new(0, 0, 0, 0)
	nameLabel.BackgroundTransparency = 1
	local _condition = dragon.nickname
	if not (_condition ~= "" and _condition) then
		_condition = def.name
	end
	nameLabel.Text = _condition
	nameLabel.TextColor3 = RARITIES[dragon.rarity].color
	nameLabel.TextStrokeColor3 = Color3.fromRGB(0, 0, 0)
	nameLabel.TextStrokeTransparency = 0
	nameLabel.TextScaled = true
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.Parent = billboard
	local levelLabel = Instance.new("TextLabel")
	levelLabel.Size = UDim2.new(1, 0, 0.4, 0)
	levelLabel.Position = UDim2.new(0, 0, 0.6, 0)
	levelLabel.BackgroundTransparency = 1
	local _exp = dragon.level
	local _condition_1 = DRAGON_EMOJIS[dragon.dragonId]
	if not (_condition_1 ~= "" and _condition_1) then
		_condition_1 = "🐉"
	end
	levelLabel.Text = `Lv.{_exp} {_condition_1}`
	levelLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	levelLabel.TextStrokeColor3 = Color3.fromRGB(0, 0, 0)
	levelLabel.TextStrokeTransparency = 0
	levelLabel.TextScaled = true
	levelLabel.Font = Enum.Font.Gotham
	levelLabel.Parent = billboard
	billboard.Parent = body
	-- Set primary part
	model.PrimaryPart = body
	model.Parent = Workspace
	return model
end
function getDragonSize(stage)
	repeat
		if stage == 1 then
			return Vector3.new(1.5, 1.5, 2)
		end
		if stage == 2 then
			return Vector3.new(2.5, 2.5, 3.5)
		end
		if stage == 3 then
			return Vector3.new(4, 4, 5)
		end
		if stage == 4 then
			return Vector3.new(6, 6, 8)
		end
	until true
end
function getElementBrickColor(element)
	repeat
		if element == "fire" then
			return BrickColor.new("Bright red")
		end
		if element == "water" then
			return BrickColor.new("Bright blue")
		end
		if element == "ice" then
			return BrickColor.new("Light blue")
		end
		if element == "electric" then
			return BrickColor.new("Bright yellow")
		end
		if element == "nature" then
			return BrickColor.new("Bright green")
		end
		if element == "shadow" then
			return BrickColor.new("Really black")
		end
		if element == "light" then
			return BrickColor.new("Institutional white")
		end
		return BrickColor.new("Medium stone grey")
	until true
end
function addElementEffects(part, element)
	local emitter = Instance.new("ParticleEmitter")
	emitter.Size = NumberSequence.new(0.2)
	emitter.Rate = 3
	emitter.Lifetime = NumberRange.new(0.5, 1)
	emitter.Speed = NumberRange.new(1, 2)
	emitter.LightEmission = 0.5
	repeat
		if element == "fire" then
			emitter.Color = ColorSequence.new(Color3.fromRGB(255, 100, 0))
			emitter.Speed = NumberRange.new(2, 4)
			break
		end
		if element == "water" then
			emitter.Color = ColorSequence.new(Color3.fromRGB(50, 150, 255))
			break
		end
		if element == "ice" then
			emitter.Color = ColorSequence.new(Color3.fromRGB(200, 230, 255))
			break
		end
		if element == "electric" then
			emitter.Color = ColorSequence.new(Color3.fromRGB(255, 255, 100))
			emitter.Rate = 5
			break
		end
		if element == "nature" then
			emitter.Color = ColorSequence.new(Color3.fromRGB(100, 200, 50))
			break
		end
		if element == "shadow" then
			emitter.Color = ColorSequence.new(Color3.fromRGB(50, 0, 80))
			emitter.LightEmission = 0
			break
		end
		if element == "light" then
			emitter.Color = ColorSequence.new(Color3.fromRGB(255, 255, 200))
			emitter.LightEmission = 1
			break
		end
	until true
	emitter.Parent = part
end
-- Make dragon follow player
local function followPlayer(dragonModel, player)
	task.spawn(function()
		local targetOffset = Vector3.new(3, 2, 0)
		local offsetAngle = 0
		while dragonModel.Parent and player.Character do
			local humanoidRootPart = player.Character:FindFirstChild("HumanoidRootPart")
			if humanoidRootPart and dragonModel.PrimaryPart then
				-- Create circular orbit pattern
				offsetAngle += 0.02
				local orbitX = math.cos(offsetAngle) * 4
				local orbitZ = math.sin(offsetAngle) * 4
				local _position = humanoidRootPart.Position
				local _vector3 = Vector3.new(orbitX, 3, orbitZ)
				local targetPos = _position + _vector3
				local currentPos = dragonModel.PrimaryPart.Position
				local newPos = currentPos:Lerp(targetPos, 0.05)
				-- Look at player
				local lookDir = humanoidRootPart.Position - newPos
				if lookDir.Magnitude > 0.1 then
					local lookCFrame = CFrame.lookAt(newPos, humanoidRootPart.Position)
					dragonModel.PrimaryPart.CFrame = dragonModel.PrimaryPart.CFrame:Lerp(lookCFrame, 0.1)
				end
				-- Bob up and down
				local bobOffset = math.sin(tick() * 2) * 0.3
				local _vector3_1 = Vector3.new(0, bobOffset, 0)
				dragonModel.PrimaryPart.Position = newPos + _vector3_1
			end
			task.wait(0.03)
		end
	end)
end
-- Create a new dragon for a player
local function createPlayerDragon(player, dragonId, isShiny)
	if isShiny == nil then
		isShiny = false
	end
	local def = DRAGONS[dragonId]
	if not def then
		warn(`Unknown dragon: {dragonId}`)
		return nil
	end
	local _object = {
		instanceId = generateInstanceId(),
		dragonId = dragonId,
		level = 1,
		experience = 0,
	}
	local _left = "stats"
	local _object_1 = table.clone(def.baseStats)
	setmetatable(_object_1, nil)
	_object[_left] = _object_1
	_object.element = def.element
	_object.rarity = def.rarity
	_object.evolutionStage = def.evolutionStage
	_object.isShiny = isShiny
	_object.obtainedAt = os.time()
	_object.breedCount = 0
	_object.battleWins = 0
	_object.battleLosses = 0
	_object.isFavorite = false
	local dragon = _object
	-- Store dragon
	local _userId = player.UserId
	local _condition = playerDragons[_userId]
	if not _condition then
		_condition = {}
	end
	local existing = _condition
	table.insert(existing, dragon)
	local _userId_1 = player.UserId
	playerDragons[_userId_1] = existing
	print(`🐉 {player.Name} obtained {if isShiny then "✨SHINY✨ " else ""}{def.name}!`)
	return dragon
end
-- Spawn dragon in world for player
local function spawnDragonForPlayer(player, dragon)
	local character = player.Character
	if not character then
		return nil
	end
	local hrp = character:FindFirstChild("HumanoidRootPart")
	if not hrp then
		return nil
	end
	-- Remove existing dragon model if any
	local existingKey = `{player.UserId}_{dragon.instanceId}`
	local existing = activeDragonModels[existingKey]
	if existing then
		existing:Destroy()
	end
	-- Create new dragon
	local _position = hrp.Position
	local _vector3 = Vector3.new(3, 2, 0)
	local position = _position + _vector3
	local model = createDragonModel(dragon, position)
	activeDragonModels[existingKey] = model
	-- Start following
	followPlayer(model, player)
	return model
end
-- Remove dragon from world
local function despawnDragon(player, dragon)
	local key = `{player.UserId}_{dragon.instanceId}`
	local model = activeDragonModels[key]
	if model then
		model:Destroy()
		activeDragonModels[key] = nil
	end
end
-- Get player's dragons
local function getPlayerDragons(player)
	local _userId = player.UserId
	local _condition = playerDragons[_userId]
	if not _condition then
		_condition = {}
	end
	return _condition
end
-- Add XP to dragon
local function addDragonXP(player, dragon, xp)
	dragon.experience += xp
	-- Check for level up
	local xpNeeded = dragon.level * GAME_CONFIG.XP_PER_LEVEL
	if dragon.experience >= xpNeeded and dragon.level < GAME_CONFIG.MAX_DRAGON_LEVEL then
		dragon.level += 1
		dragon.experience -= xpNeeded
		-- Increase stats on level up
		dragon.stats.power += 2
		dragon.stats.speed += 1
		dragon.stats.health += 3
		dragon.stats.luck += 1
		print(`⬆️ {player.Name}'s dragon leveled up to {dragon.level}!`)
		-- Check for evolution
		local def = DRAGONS[dragon.dragonId]
		local _result = def
		if _result ~= nil then
			_result = _result.evolvesTo
		end
		local _condition = _result
		if _condition ~= "" and _condition then
			local _eVOLUTION_LEVELS = GAME_CONFIG.EVOLUTION_LEVELS
			local _level = dragon.level
			_condition = table.find(_eVOLUTION_LEVELS, _level) ~= nil
		end
		if _condition ~= "" and _condition then
			return true
		end
	end
	return false
end
-- Evolve dragon
local function evolveDragon(player, dragon)
	local def = DRAGONS[dragon.dragonId]
	local _result = def
	if _result ~= nil then
		_result = _result.evolvesTo
	end
	if not (_result ~= "" and _result) then
		warn(`Dragon {dragon.dragonId} cannot evolve`)
		return nil
	end
	local newDef = DRAGONS[def.evolvesTo]
	if not newDef then
		warn(`Evolution target {def.evolvesTo} not found`)
		return nil
	end
	-- Despawn old dragon
	despawnDragon(player, dragon)
	-- Update dragon data
	dragon.dragonId = newDef.id
	dragon.evolutionStage = newDef.evolutionStage
	dragon.rarity = newDef.rarity
	-- Boost stats on evolution
	local statMultiplier = 1.5
	dragon.stats.power = math.floor(dragon.stats.power * statMultiplier)
	dragon.stats.speed = math.floor(dragon.stats.speed * statMultiplier)
	dragon.stats.health = math.floor(dragon.stats.health * statMultiplier)
	dragon.stats.luck = math.floor(dragon.stats.luck * statMultiplier)
	print(`✨ {player.Name}'s dragon evolved into {newDef.name}!`)
	-- Spawn new evolved dragon
	spawnDragonForPlayer(player, dragon)
	return dragon
end
-- Setup dragon system
local function setupDragonSystem()
	-- Create remote events
	local remotes = Instance.new("Folder")
	remotes.Name = "DragonRemotes"
	remotes.Parent = ReplicatedStorage
	local spawnDragonRemote = Instance.new("RemoteEvent")
	spawnDragonRemote.Name = "SpawnDragon"
	spawnDragonRemote.Parent = remotes
	local despawnDragonRemote = Instance.new("RemoteEvent")
	despawnDragonRemote.Name = "DespawnDragon"
	despawnDragonRemote.Parent = remotes
	local evolveRemote = Instance.new("RemoteEvent")
	evolveRemote.Name = "EvolveDragon"
	evolveRemote.Parent = remotes
	-- Handle spawn requests
	spawnDragonRemote.OnServerEvent:Connect(function(player, instanceId)
		local _instanceId = instanceId
		if not (type(_instanceId) == "string") then
			return nil
		end
		local dragons = getPlayerDragons(player)
		-- ▼ ReadonlyArray.find ▼
		local _callback = function(d)
			return d.instanceId == instanceId
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
		if dragon then
			spawnDragonForPlayer(player, dragon)
		end
	end)
	-- Handle despawn requests
	despawnDragonRemote.OnServerEvent:Connect(function(player, instanceId)
		local _instanceId = instanceId
		if not (type(_instanceId) == "string") then
			return nil
		end
		local dragons = getPlayerDragons(player)
		-- ▼ ReadonlyArray.find ▼
		local _callback = function(d)
			return d.instanceId == instanceId
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
		if dragon then
			despawnDragon(player, dragon)
		end
	end)
	-- Handle evolution requests
	evolveRemote.OnServerEvent:Connect(function(player, instanceId)
		local _instanceId = instanceId
		if not (type(_instanceId) == "string") then
			return nil
		end
		local dragons = getPlayerDragons(player)
		-- ▼ ReadonlyArray.find ▼
		local _callback = function(d)
			return d.instanceId == instanceId
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
		if dragon then
			evolveDragon(player, dragon)
		end
	end)
	-- Clean up when players leave
	Players.PlayerRemoving:Connect(function(player)
		local _userId = player.UserId
		local dragons = playerDragons[_userId]
		if dragons then
			-- ▼ ReadonlyArray.forEach ▼
			local _callback = function(d)
				return despawnDragon(player, d)
			end
			for _k, _v in dragons do
				_callback(_v, _k - 1, dragons)
			end
			-- ▲ ReadonlyArray.forEach ▲
			local _userId_1 = player.UserId
			playerDragons[_userId_1] = nil
		end
	end)
	print("🐉 Dragon System initialized!")
end
return {
	createPlayerDragon = createPlayerDragon,
	spawnDragonForPlayer = spawnDragonForPlayer,
	despawnDragon = despawnDragon,
	getPlayerDragons = getPlayerDragons,
	addDragonXP = addDragonXP,
	evolveDragon = evolveDragon,
	setupDragonSystem = setupDragonSystem,
}
