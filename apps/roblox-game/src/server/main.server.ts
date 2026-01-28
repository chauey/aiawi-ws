// Coin System - Server side
// Handles coin spawning, collection, player stats, and environment
import { Players, Workspace, Lighting, ReplicatedStorage } from "@rbxts/services";
import { createPet, PetType } from "./pets";
import { createObbyTower } from "./obby";
import { createRollerCoaster } from "./rollerCoaster";
import { setupNPCSystem } from "./npcCompanions";
import { setupDailyRewards } from "./dailyRewards";
import { setupGamePasses } from "./gamePasses";
import { setupMapSystem } from "./maps";
import { setupLeaderboardSystem } from "./leaderboard";
import { setupTradingSystem } from "./trading";
import { setupCoinStealingSystem } from "./coinStealing";
import { setupEggSystem } from "./eggHatching";
import { setupRebirthSystem } from "./rebirth";
import { setupQuestSystem } from "./quests";
import { setupLuckyWheel } from "./luckyWheel";
import { setupPetEvolution } from "./petEvolution";
import { setupCodesSystem } from "./codes";
import { setupVIPZone } from "./vipZone";

// Create remote event for pet selection
const changePetRemote = new Instance("RemoteEvent");
changePetRemote.Name = "ChangePet";
changePetRemote.Parent = ReplicatedStorage;

// Pet prices (must match client shopUI)
const PET_PRICES: { [key: string]: number } = {
	crab: 5, fish: 10, turtle: 15, frog: 20, duck: 25,
	cat: 30, dog: 35, rabbit: 40, fox: 45, bear: 50,
	penguin: 55, owl: 60, bat: 65, dragon: 70, unicorn: 75, phoenix: 80
};

// Handle pet purchase requests
changePetRemote.OnServerEvent.Connect((player, petType, price) => {
	if (!typeIs(petType, "string") || !typeIs(price, "number")) return;
	
	const actualPrice = PET_PRICES[petType];
	if (actualPrice === undefined || actualPrice !== price) return;
	
	// Check coins
	const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
	const coinsValue = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
	if (!coinsValue || coinsValue.Value < actualPrice) {
		print(`❌ ${player.Name} can't afford ${petType} (needs ${actualPrice}, has ${coinsValue?.Value ?? 0})`);
		return;
	}
	
	// Deduct coins and create pet
	coinsValue.Value -= actualPrice;
	createPet(player, petType as PetType);
	print(`🐾 ${player.Name} bought ${petType} for ${actualPrice} coins!`);
});

// Configuration
const COIN_SPAWN_COUNT = 8;
const COIN_RESPAWN_TIME = 5;
const COIN_VALUE = 1;
const SPAWN_AREA = { minX: -50, maxX: 50, minZ: -50, maxZ: 50, height: 3 };

// Setup sunset sky and environment
function setupEnvironment() {
	// Sunset time
	Lighting.ClockTime = 18.5; // Evening sunset
	Lighting.GeographicLatitude = 35;
	
	// Warm sunset colors
	Lighting.Ambient = new Color3(0.4, 0.3, 0.2);
	Lighting.OutdoorAmbient = new Color3(0.5, 0.35, 0.25);
	Lighting.ColorShift_Top = new Color3(1, 0.7, 0.4);
	
	// Atmosphere for sunset glow
	const atmosphere = new Instance("Atmosphere");
	atmosphere.Density = 0.3;
	atmosphere.Offset = 0.25;
	atmosphere.Color = new Color3(0.9, 0.6, 0.4);
	atmosphere.Decay = new Color3(0.9, 0.5, 0.3);
	atmosphere.Glare = 0.5;
	atmosphere.Haze = 1.5;
	atmosphere.Parent = Lighting;
	
	// Sky with sunset colors
	const sky = new Instance("Sky");
	sky.SunAngularSize = 15;
	sky.MoonAngularSize = 8;
	sky.Parent = Lighting;
	
	// Create nice grass floor
	const floor = Workspace.FindFirstChild("Baseplate") as Part | undefined;
	if (floor) {
		floor.BrickColor = new BrickColor("Bright green");
		floor.Material = Enum.Material.Grass;
		floor.Size = new Vector3(200, 1, 200);
		floor.Position = new Vector3(0, -0.5, 0);
	} else {
		// Create floor if none exists
		const newFloor = new Instance("Part");
		newFloor.Name = "Floor";
		newFloor.Anchored = true;
		newFloor.Size = new Vector3(200, 1, 200);
		newFloor.Position = new Vector3(0, -0.5, 0);
		newFloor.BrickColor = new BrickColor("Bright green");
		newFloor.Material = Enum.Material.Grass;
		newFloor.Parent = Workspace;
	}
	
	print("🌅 Sunset environment created!");
}

// Create leaderstats for player
function setupLeaderstats(player: Player) {
	const leaderstats = new Instance("Folder");
	leaderstats.Name = "leaderstats";
	leaderstats.Parent = player;

	const coins = new Instance("IntValue");
	coins.Name = "Coins";
	coins.Value = 0;
	coins.Parent = leaderstats;

	print(`📊 Created leaderstats for ${player.Name}`);
}

// Create a spinning coin at position
function createCoin(position: Vector3): Part {
	const coin = new Instance("Part");
	coin.Name = "Coin";
	coin.Shape = Enum.PartType.Cylinder;
	coin.Size = new Vector3(0.5, 2, 2);
	coin.BrickColor = new BrickColor("Bright yellow");
	coin.Material = Enum.Material.Neon;
	coin.Anchored = true;
	coin.CanCollide = false;
	coin.CFrame = new CFrame(position).mul(CFrame.Angles(0, 0, math.rad(90)));
	
	// Add sparkle effect
	const sparkle = new Instance("ParticleEmitter");
	sparkle.Color = new ColorSequence(new Color3(1, 1, 0));
	sparkle.LightEmission = 1;
	sparkle.Size = new NumberSequence(0.2);
	sparkle.Rate = 10;
	sparkle.Lifetime = new NumberRange(0.5, 1);
	sparkle.Speed = new NumberRange(1, 2);
	sparkle.Parent = coin;

	// Spin animation using a loop
	task.spawn(() => {
		while (coin.Parent) {
			coin.CFrame = coin.CFrame.mul(CFrame.Angles(0, math.rad(2), 0));
			task.wait(0.03);
		}
	});

	coin.Parent = Workspace;
	return coin;
}

// Get random spawn position
function getRandomPosition(): Vector3 {
	const x = math.random(SPAWN_AREA.minX, SPAWN_AREA.maxX);
	const z = math.random(SPAWN_AREA.minZ, SPAWN_AREA.maxZ);
	return new Vector3(x, SPAWN_AREA.height, z);
}

// Handle coin collection
function onCoinTouched(coin: Part, otherPart: BasePart) {
	const player = Players.GetPlayerFromCharacter(otherPart.Parent);
	if (!player) return;

	const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
	const coinsValue = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
	
	if (coinsValue) {
		// Create floating +1 popup
		const coinPos = coin.Position;
		const popupPart = new Instance("Part");
		popupPart.Name = "CoinPopup";
		popupPart.Size = new Vector3(0.1, 0.1, 0.1);
		popupPart.Position = coinPos;
		popupPart.Anchored = true;
		popupPart.CanCollide = false;
		popupPart.Transparency = 1;
		popupPart.Parent = Workspace;
		
		const billboard = new Instance("BillboardGui");
		billboard.Size = new UDim2(0, 60, 0, 40);
		billboard.StudsOffset = new Vector3(0, 0, 0);
		billboard.AlwaysOnTop = true;
		
		const label = new Instance("TextLabel");
		label.Size = new UDim2(1, 0, 1, 0);
		label.BackgroundTransparency = 1;
		label.Text = "+1 🪙";
		label.TextColor3 = Color3.fromRGB(255, 220, 50);
		label.TextStrokeColor3 = Color3.fromRGB(100, 80, 0);
		label.TextStrokeTransparency = 0;
		label.TextScaled = true;
		label.Font = Enum.Font.GothamBold;
		label.Parent = billboard;
		billboard.Parent = popupPart;
		
		// Animate popup rising and fading
		task.spawn(() => {
			for (let i = 0; i < 20; i++) {
				popupPart.Position = popupPart.Position.add(new Vector3(0, 0.15, 0));
				label.TextTransparency = i / 20;
				label.TextStrokeTransparency = i / 20;
				task.wait(0.03);
			}
			popupPart.Destroy();
		});
		
		// Play coin sound
		const sound = new Instance("Sound");
		sound.SoundId = "rbxassetid://5964495032"; // Coin collect sound
		sound.Volume = 0.5;
		sound.PlayOnRemove = true;
		sound.Parent = coin;
		
		// Collect the coin
		coin.Destroy();
		coinsValue.Value += COIN_VALUE;
		print(`🪙 ${player.Name} collected a coin! Total: ${coinsValue.Value}`);

		// Respawn coin immediately
		spawnCoin();
	}
}

// Spawn a single coin
function spawnCoin() {
	const coin = createCoin(getRandomPosition());
	coin.Touched.Connect((otherPart) => onCoinTouched(coin, otherPart));
}

// Initialize game
function init() {
	print("🎮 Coin Collection Game Starting!");
	
	// Setup environment first
	setupEnvironment();
	
	print(`💰 Spawning ${COIN_SPAWN_COUNT} coins...`);

	// Setup existing players
	Players.GetPlayers().forEach(setupLeaderstats);
	
	// Setup new players
	Players.PlayerAdded.Connect(setupLeaderstats);

	// Spawn initial coins
	for (let i = 0; i < COIN_SPAWN_COUNT; i++) {
		spawnCoin();
	}
	
	// Create obby tower
	createObbyTower();
	
	// Give pets to new players
	Players.PlayerAdded.Connect((player) => {
		player.CharacterAdded.Connect(() => {
			task.delay(2, () => createPet(player, "dog"));
		});
	});
	
	// Give pets to existing players
	Players.GetPlayers().forEach((player) => {
		if (player.Character) {
			task.delay(2, () => createPet(player, "dog"));
		}
	});

	// Create the roller coaster!
	createRollerCoaster();
	
	// Setup NPC companion system
	setupNPCSystem();
	
	// Setup daily rewards system
	setupDailyRewards();
	
	// Setup game passes
	setupGamePasses();
	
	// Setup map system
	setupMapSystem();
	
	// Setup leaderboard
	setupLeaderboardSystem();
	
	// Setup trading
	setupTradingSystem();
	
	// Setup coin stealing
	setupCoinStealingSystem();
	
	// Setup egg hatching
	setupEggSystem();
	
	// Setup rebirth
	setupRebirthSystem();
	
	// Setup quests
	setupQuestSystem();
	
	// Setup lucky wheel
	setupLuckyWheel();
	
	// Setup pet evolution
	setupPetEvolution();
	
	// Setup codes
	setupCodesSystem();
	
	// Setup VIP zone
	setupVIPZone();

	print("✅ Game ready! 20+ systems loaded!");
}

init();
