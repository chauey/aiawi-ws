// Obby Tower - Server side
// Creates a parkour challenge tower with checkpoints and rewards
import { Workspace, Players } from "@rbxts/services";

// Tower configuration
const TOWER_LEVELS = 10;
const LEVEL_HEIGHT = 15;
const TOWER_POSITION = new Vector3(70, 0, 0); // East of spawn
const BONUS_COINS = 50;

// Materials for variety
const LEVEL_MATERIALS = [
	Enum.Material.SmoothPlastic,
	Enum.Material.Neon,
	Enum.Material.Glass,
	Enum.Material.Marble,
	Enum.Material.Granite,
];

const LEVEL_COLORS = [
	new BrickColor("Bright red"),
	new BrickColor("Bright orange"),
	new BrickColor("Bright yellow"),
	new BrickColor("Bright green"),
	new BrickColor("Cyan"),
	new BrickColor("Bright blue"),
	new BrickColor("Bright violet"),
	new BrickColor("Hot pink"),
	new BrickColor("White"),
	new BrickColor("Institutional white"),
];

// Create obby tower
export function createObbyTower() {
	const towerFolder = new Instance("Folder");
	towerFolder.Name = "ObbyTower";
	towerFolder.Parent = Workspace;
	
	// Base platform
	const base = new Instance("Part");
	base.Name = "TowerBase";
	base.Size = new Vector3(30, 2, 30);
	base.Position = TOWER_POSITION.add(new Vector3(0, 1, 0));
	base.BrickColor = new BrickColor("Dark stone grey");
	base.Material = Enum.Material.Concrete;
	base.Anchored = true;
	base.Parent = towerFolder;
	
	// Start sign
	const sign = new Instance("Part");
	sign.Name = "StartSign";
	sign.Size = new Vector3(8, 5, 0.5);
	sign.Position = TOWER_POSITION.add(new Vector3(0, 10, 14));
	sign.BrickColor = new BrickColor("Really black");
	sign.Anchored = true;
	sign.Parent = towerFolder;
	
	const signGui = new Instance("SurfaceGui");
	signGui.Face = Enum.NormalId.Back; // Facing towards spawn
	const signLabel = new Instance("TextLabel");
	signLabel.Size = new UDim2(1, 0, 1, 0);
	signLabel.BackgroundTransparency = 1;
	signLabel.Text = "🗼 OBBY TOWER\nClimb for 50 bonus coins!";
	signLabel.TextColor3 = new Color3(1, 0.8, 0);
	signLabel.TextScaled = true;
	signLabel.Font = Enum.Font.GothamBold;
	signLabel.Parent = signGui;
	signGui.Parent = sign;
	
	// Create levels with platforms
	for (let level = 0; level < TOWER_LEVELS; level++) {
		createObbyLevel(towerFolder, level);
	}
	
	// Create reward chest at top
	createRewardChest(towerFolder);
	
	print(`🗼 Obby Tower created with ${TOWER_LEVELS} levels!`);
}

function createObbyLevel(parent: Folder, level: number) {
	const levelHeight = TOWER_POSITION.Y + 2 + (level * LEVEL_HEIGHT);
	const color = LEVEL_COLORS[level % LEVEL_COLORS.size()];
	const material = LEVEL_MATERIALS[level % LEVEL_MATERIALS.size()];
	
	// Main platform
	const platform = new Instance("Part");
	platform.Name = `Level${level + 1}_Platform`;
	platform.Size = new Vector3(6, 1, 6);
	platform.BrickColor = color;
	platform.Material = material;
	platform.Anchored = true;
	platform.Parent = parent;
	
	// Alternate positions around tower (rotated 180 degrees)
	const angle = ((level * 90) + 180) * (math.pi / 180);
	const radius = 12;
	const xOffset = math.cos(angle) * radius;
	const zOffset = math.sin(angle) * radius;
	
	platform.Position = new Vector3(
		TOWER_POSITION.X + xOffset,
		levelHeight,
		TOWER_POSITION.Z + zOffset
	);
	
	// Add checkpoint
	const checkpoint = new Instance("Part");
	checkpoint.Name = `Checkpoint${level + 1}`;
	checkpoint.Size = new Vector3(4, 0.3, 4);
	checkpoint.Position = platform.Position.add(new Vector3(0, 0.65, 0));
	checkpoint.BrickColor = new BrickColor("Lime green");
	checkpoint.Material = Enum.Material.Neon;
	checkpoint.Transparency = 0.5;
	checkpoint.Anchored = true;
	checkpoint.CanCollide = false;
	checkpoint.Parent = parent;
	
	// Jumping platforms between levels
	if (level > 0) {
		const prevAngle = (((level - 1) * 90) + 180) * (math.pi / 180);
		const prevX = TOWER_POSITION.X + math.cos(prevAngle) * radius;
		const prevZ = TOWER_POSITION.Z + math.sin(prevAngle) * radius;
		const prevY = levelHeight - LEVEL_HEIGHT;
		
		// Intermediate jump platforms
		for (let i = 1; i <= 3; i++) {
			const jumpPlat = new Instance("Part");
			jumpPlat.Name = `Jump${level}_${i}`;
			jumpPlat.Size = new Vector3(3, 0.5, 3);
			
			const t = i / 4;
			jumpPlat.Position = new Vector3(
				prevX + (platform.Position.X - prevX) * t,
				prevY + (levelHeight - prevY) * t + 2,
				prevZ + (platform.Position.Z - prevZ) * t
			);
			
			jumpPlat.BrickColor = color;
			jumpPlat.Material = Enum.Material.SmoothPlastic;
			jumpPlat.Anchored = true;
			jumpPlat.Parent = parent;
		}
		
		// Connect with rail/beam
		const startPos = new Vector3(prevX, prevY + 1, prevZ);
		const endPos = platform.Position.add(new Vector3(0, 1, 0));
		const midPos = startPos.add(endPos).div(2);
		const railLength = endPos.sub(startPos).Magnitude;
		
		const rail = new Instance("Part");
		rail.Name = `Rail${level}`;
		rail.Size = new Vector3(0.3, 0.3, railLength);
		rail.BrickColor = new BrickColor("Medium stone grey");
		rail.Material = Enum.Material.Metal;
		rail.CFrame = CFrame.lookAt(midPos, endPos);
		rail.Anchored = true;
		rail.CanCollide = false;
		rail.Parent = parent;
	}
	
	// Add level number billboard
	const billboard = new Instance("BillboardGui");
	billboard.Size = new UDim2(0, 50, 0, 30);
	billboard.StudsOffset = new Vector3(0, 3, 0);
	billboard.AlwaysOnTop = true;
	
	const levelLabel = new Instance("TextLabel");
	levelLabel.Size = new UDim2(1, 0, 1, 0);
	levelLabel.BackgroundTransparency = 1;
	levelLabel.Text = `${level + 1}`;
	levelLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
	levelLabel.TextStrokeTransparency = 0;
	levelLabel.TextScaled = true;
	levelLabel.Font = Enum.Font.GothamBold;
	levelLabel.Parent = billboard;
	
	billboard.Parent = platform;
}

function createRewardChest(parent: Folder) {
	const topHeight = TOWER_POSITION.Y + 2 + (TOWER_LEVELS * LEVEL_HEIGHT);
	
	// Top platform
	const topPlatform = new Instance("Part");
	topPlatform.Name = "TopPlatform";
	topPlatform.Size = new Vector3(12, 2, 12);
	topPlatform.Position = new Vector3(TOWER_POSITION.X, topHeight, TOWER_POSITION.Z);
	topPlatform.BrickColor = new BrickColor("Institutional white");
	topPlatform.Material = Enum.Material.Neon;
	topPlatform.Anchored = true;
	topPlatform.Parent = parent;
	
	// Reward chest
	const chest = new Instance("Part");
	chest.Name = "RewardChest";
	chest.Size = new Vector3(4, 3, 3);
	chest.Position = topPlatform.Position.add(new Vector3(0, 2.5, 0));
	chest.BrickColor = new BrickColor("Bright yellow");
	chest.Material = Enum.Material.Neon;
	chest.Anchored = true;
	chest.Parent = parent;
	
	// Sparkle effect
	const sparkle = new Instance("ParticleEmitter");
	sparkle.Color = new ColorSequence(new Color3(1, 0.8, 0));
	sparkle.LightEmission = 1;
	sparkle.Size = new NumberSequence(0.3);
	sparkle.Rate = 20;
	sparkle.Lifetime = new NumberRange(1, 2);
	sparkle.Speed = new NumberRange(2, 4);
	sparkle.Parent = chest;
	
	// Victory sign
	const victorySign = new Instance("Part");
	victorySign.Size = new Vector3(10, 5, 0.5);
	victorySign.Position = topPlatform.Position.add(new Vector3(0, 6, -5));
	victorySign.BrickColor = new BrickColor("Institutional white");
	victorySign.Anchored = true;
	victorySign.Parent = parent;
	
	const victorySurface = new Instance("SurfaceGui");
	victorySurface.Face = Enum.NormalId.Front;
	const victoryLabel = new Instance("TextLabel");
	victoryLabel.Size = new UDim2(1, 0, 1, 0);
	victoryLabel.BackgroundTransparency = 1;
	victoryLabel.Text = "🏆 VICTORY! +50 Coins!\n\n💡 TIP: Triple Jump!\nPress SPACE 3x fast!";
	victoryLabel.TextColor3 = new Color3(1, 0.8, 0);
	victoryLabel.TextScaled = true;
	victoryLabel.Font = Enum.Font.GothamBold;
	victoryLabel.Parent = victorySurface;
	victorySurface.Parent = victorySign;
	
	// Track who claimed reward
	const claimedPlayers = new Set<Player>();
	
	// Award coins on touch
	chest.Touched.Connect((otherPart) => {
		const player = Players.GetPlayerFromCharacter(otherPart.Parent);
		if (!player) return;
		
		if (claimedPlayers.has(player)) return;
		claimedPlayers.add(player);
		
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		
		if (coins) {
			coins.Value += BONUS_COINS;
			print(`🏆 ${player.Name} completed the obby and earned ${BONUS_COINS} bonus coins!`);
			
			// Allow re-claim after 60 seconds
			task.delay(60, () => {
				claimedPlayers.delete(player);
			});
		}
	});
}
