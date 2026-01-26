// Coin System - Server side
// Handles coin spawning, collection, and player stats
import { Players, Workspace, ServerStorage } from "@rbxts/services";

// Configuration
const COIN_SPAWN_COUNT = 15;
const COIN_RESPAWN_TIME = 5;
const COIN_VALUE = 10;
const SPAWN_AREA = { minX: -50, maxX: 50, minZ: -50, maxZ: 50, height: 3 };

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
		// Collect the coin
		coin.Destroy();
		coinsValue.Value += COIN_VALUE;
		print(`🪙 ${player.Name} collected a coin! Total: ${coinsValue.Value}`);

		// Respawn coin after delay
		task.delay(COIN_RESPAWN_TIME, () => {
			spawnCoin();
		});
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
	print(`💰 Spawning ${COIN_SPAWN_COUNT} coins...`);

	// Setup existing players
	Players.GetPlayers().forEach(setupLeaderstats);
	
	// Setup new players
	Players.PlayerAdded.Connect(setupLeaderstats);

	// Spawn initial coins
	for (let i = 0; i < COIN_SPAWN_COUNT; i++) {
		spawnCoin();
	}

	print("✅ Game ready! Collect coins to score points!");
}

init();
