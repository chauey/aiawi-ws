// Map System - Create and manage different world areas
import { Players, Workspace, ReplicatedStorage } from "@rbxts/services";

// Map prices (must match client)
const MAP_PRICES: { [key: string]: number } = {
	beach: 10,
	volcano: 100,
	space: 1000,
	candy: 5000,
	ice: 10000,
	rainbow: 50000,
};

// Map spawn positions
const MAP_POSITIONS: { [key: string]: Vector3 } = {
	beach: new Vector3(200, 5, 0),
	volcano: new Vector3(0, 5, 200),
	space: new Vector3(-200, 50, 0),
	candy: new Vector3(0, 5, -200),
	ice: new Vector3(200, 5, 200),
	rainbow: new Vector3(-200, 100, -200),
};

// Track owned maps per player
const playerMaps = new Map<Player, Set<string>>();

export function setupMapSystem() {
	// Create teleport remote
	const teleportRemote = new Instance("RemoteEvent");
	teleportRemote.Name = "TeleportToMap";
	teleportRemote.Parent = ReplicatedStorage;
	
	// Handle teleport requests
	teleportRemote.OnServerEvent.Connect((player, mapId, price) => {
		if (!typeIs(mapId, "string") || !typeIs(price, "number")) return;
		
		const actualPrice = MAP_PRICES[mapId];
		if (actualPrice === undefined || actualPrice !== price) return;
		
		const owned = playerMaps.get(player) ?? new Set<string>();
		
		// If already own, just teleport
		if (owned.has(mapId)) {
			teleportPlayer(player, mapId);
			return;
		}
		
		// Check coins for purchase
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coinsValue = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		if (!coinsValue || coinsValue.Value < actualPrice) {
			print(`❌ ${player.Name} can't afford ${mapId} map (needs ${actualPrice})`);
			return;
		}
		
		// Deduct coins and unlock map
		coinsValue.Value -= actualPrice;
		owned.add(mapId);
		playerMaps.set(player, owned);
		
		print(`🗺️ ${player.Name} unlocked ${mapId} for ${actualPrice} coins!`);
		teleportPlayer(player, mapId);
	});
	
	// Create the map areas
	createBeachMap();
	createVolcanoMap();
	createSpaceMap();
	createCandyMap();
	createIceMap();
	createRainbowMap();
	
	// Cleanup on leave
	Players.PlayerRemoving.Connect((player) => {
		playerMaps.delete(player);
	});
	
	print("🗺️ Map system ready with 6 worlds!");
}

function teleportPlayer(player: Player, mapId: string) {
	const char = player.Character;
	const hrp = char?.FindFirstChild("HumanoidRootPart") as Part | undefined;
	if (hrp) {
		const pos = MAP_POSITIONS[mapId];
		if (pos) {
			hrp.CFrame = new CFrame(pos);
			print(`✈️ ${player.Name} teleported to ${mapId}!`);
		}
	}
}

// ==================== FUN ELEMENTS ====================
function createBouncyPad(parent: Folder, pos: Vector3, color: BrickColor, bouncePower: number = 80) {
	const pad = new Instance("Part");
	pad.Size = new Vector3(6, 1, 6);
	pad.Position = pos;
	pad.Anchored = true;
	pad.BrickColor = color;
	pad.Material = Enum.Material.Neon;
	pad.Parent = parent;
	
	const corner = new Instance("UICorner");
	
	// Bounce effect
	pad.Touched.Connect((hit) => {
		const humanoid = hit.Parent?.FindFirstChildOfClass("Humanoid");
		const hrp = hit.Parent?.FindFirstChild("HumanoidRootPart") as Part | undefined;
		if (humanoid && hrp) {
			hrp.AssemblyLinearVelocity = new Vector3(hrp.AssemblyLinearVelocity.X, bouncePower, hrp.AssemblyLinearVelocity.Z);
		}
	});
	
	return pad;
}

function createSpinningPlatform(parent: Folder, pos: Vector3, size: Vector3, color: BrickColor) {
	const platform = new Instance("Part");
	platform.Size = size;
	platform.Position = pos;
	platform.Anchored = true;
	platform.BrickColor = color;
	platform.Material = Enum.Material.SmoothPlastic;
	platform.Parent = parent;
	
	// Spin animation
	task.spawn(() => {
		while (platform.Parent) {
			platform.CFrame = platform.CFrame.mul(CFrame.Angles(0, math.rad(1), 0));
			task.wait(0.03);
		}
	});
	
	return platform;
}

function createCollectible(parent: Folder, pos: Vector3, emoji: string, value: number) {
	const part = new Instance("Part");
	part.Shape = Enum.PartType.Ball;
	part.Size = new Vector3(3, 3, 3);
	part.Position = pos;
	part.Anchored = true;
	part.CanCollide = false;
	part.BrickColor = new BrickColor("Bright yellow");
	part.Material = Enum.Material.Neon;
	part.Parent = parent;
	
	const billboard = new Instance("BillboardGui");
	billboard.Size = new UDim2(0, 50, 0, 50);
	billboard.AlwaysOnTop = true;
	const label = new Instance("TextLabel");
	label.Size = new UDim2(1, 0, 1, 0);
	label.BackgroundTransparency = 1;
	label.Text = emoji;
	label.TextScaled = true;
	label.Parent = billboard;
	billboard.Parent = part;
	
	// Spin and bob
	const startY = pos.Y;
	task.spawn(() => {
		let t = 0;
		while (part.Parent) {
			t += 0.05;
			part.CFrame = new CFrame(pos.X, startY + math.sin(t) * 0.5, pos.Z).mul(CFrame.Angles(0, t, 0));
			task.wait(0.03);
		}
	});
	
	// Collect on touch
	part.Touched.Connect((hit) => {
		const player = Players.GetPlayerFromCharacter(hit.Parent);
		if (player && part.Parent) {
			const ls = player.FindFirstChild("leaderstats") as Folder | undefined;
			const coins = ls?.FindFirstChild("Coins") as IntValue | undefined;
			if (coins) {
				coins.Value += value;
				part.Destroy();
			}
		}
	});
}

// ==================== BEACH MAP ====================
function createBeachMap() {
	const folder = new Instance("Folder");
	folder.Name = "BeachMap";
	folder.Parent = Workspace;
	
	// Sand platform
	const sand = new Instance("Part");
	sand.Size = new Vector3(100, 3, 100);
	sand.Position = new Vector3(200, 1, 0);
	sand.Anchored = true;
	sand.BrickColor = new BrickColor("Cool yellow");
	sand.Material = Enum.Material.Sand;
	sand.Parent = folder;
	
	// Water around
	const water = new Instance("Part");
	water.Size = new Vector3(200, 1, 200);
	water.Position = new Vector3(200, -1, 0);
	water.Anchored = true;
	water.BrickColor = new BrickColor("Cyan");
	water.Material = Enum.Material.Glass;
	water.Transparency = 0.4;
	water.Parent = folder;
	
	// Palm trees
	for (let i = 0; i < 6; i++) {
		const angle = (i / 6) * math.pi * 2;
		const x = 200 + math.cos(angle) * 40;
		const z = math.sin(angle) * 40;
		createPalmTree(folder, new Vector3(x, 2.5, z));
	}
	
	// Beach sign
	const sign = new Instance("Part");
	sign.Size = new Vector3(6, 3, 0.5);
	sign.Position = new Vector3(200, 5, -45);
	sign.Anchored = true;
	sign.BrickColor = new BrickColor("Brown");
	sign.Parent = folder;
	
	const signGui = new Instance("SurfaceGui");
	signGui.Face = Enum.NormalId.Front;
	const signText = new Instance("TextLabel");
	signText.Size = new UDim2(1, 0, 1, 0);
	signText.BackgroundTransparency = 1;
	signText.Text = "🏖️ BEACH";
	signText.TextColor3 = new Color3(1, 1, 1);
	signText.TextScaled = true;
	signText.Font = Enum.Font.GothamBold;
	signText.Parent = signGui;
	signGui.Parent = sign;
	
	// FUN: Bouncy beach balls
	createBouncyPad(folder, new Vector3(180, 3, 15), new BrickColor("Hot pink"), 60);
	createBouncyPad(folder, new Vector3(220, 3, -15), new BrickColor("Cyan"), 70);
	createBouncyPad(folder, new Vector3(200, 3, 30), new BrickColor("Bright orange"), 80);
	
	// FUN: Collectible shells
	createCollectible(folder, new Vector3(190, 4, 10), "🐚", 5);
	createCollectible(folder, new Vector3(210, 4, -10), "🐚", 5);
	createCollectible(folder, new Vector3(200, 4, 25), "⭐", 10);
	
	// COINS: Scattered on beach
	for (let i = 0; i < 8; i++) {
		createCollectible(folder, new Vector3(
			200 + math.random() * 60 - 30,
			4,
			math.random() * 60 - 30
		), "🪙", 2);
	}
}

function createPalmTree(parent: Folder, pos: Vector3) {
	const trunk = new Instance("Part");
	trunk.Shape = Enum.PartType.Cylinder;
	trunk.Size = new Vector3(10, 1.5, 1.5);
	trunk.CFrame = new CFrame(pos.add(new Vector3(0, 5, 0))).mul(CFrame.Angles(0, 0, math.rad(90)));
	trunk.Anchored = true;
	trunk.BrickColor = new BrickColor("Brown");
	trunk.Parent = parent;
	
	const leaves = new Instance("Part");
	leaves.Size = new Vector3(6, 2, 6);
	leaves.Position = pos.add(new Vector3(0, 11, 0));
	leaves.Anchored = true;
	leaves.BrickColor = new BrickColor("Lime green");
	leaves.Parent = parent;
}

// ==================== VOLCANO MAP ====================
function createVolcanoMap() {
	const folder = new Instance("Folder");
	folder.Name = "VolcanoMap";
	folder.Parent = Workspace;
	
	// Dark rock platform
	const rock = new Instance("Part");
	rock.Size = new Vector3(100, 3, 100);
	rock.Position = new Vector3(0, 1, 200);
	rock.Anchored = true;
	rock.BrickColor = new BrickColor("Dark stone grey");
	rock.Material = Enum.Material.Slate;
	rock.Parent = folder;
	
	// Lava rivers
	for (let i = 0; i < 3; i++) {
		const lava = new Instance("Part");
		lava.Size = new Vector3(80, 0.5, 4);
		lava.Position = new Vector3(0, 2.8, 180 + i * 20);
		lava.CFrame = lava.CFrame.mul(CFrame.Angles(0, math.rad(30 + i * 40), 0));
		lava.Anchored = true;
		lava.BrickColor = new BrickColor("Bright orange");
		lava.Material = Enum.Material.Neon;
		lava.Parent = folder;
	}
	
	// Volcano cone
	const cone = new Instance("Part");
	cone.Size = new Vector3(30, 25, 30);
	cone.Position = new Vector3(0, 15, 200);
	cone.Anchored = true;
	cone.BrickColor = new BrickColor("Really red");
	cone.Material = Enum.Material.Rock;
	cone.Parent = folder;
	
	// Volcano sign
	const sign = new Instance("Part");
	sign.Size = new Vector3(6, 3, 0.5);
	sign.Position = new Vector3(0, 5, 155);
	sign.Anchored = true;
	sign.BrickColor = new BrickColor("Bright red");
	sign.Parent = folder;
	
	const signGui = new Instance("SurfaceGui");
	signGui.Face = Enum.NormalId.Front;
	const signText = new Instance("TextLabel");
	signText.Size = new UDim2(1, 0, 1, 0);
	signText.BackgroundTransparency = 1;
	signText.Text = "🌋 VOLCANO";
	signText.TextColor3 = new Color3(1, 1, 1);
	signText.TextScaled = true;
	signText.Font = Enum.Font.GothamBold;
	signText.Parent = signGui;
	signGui.Parent = sign;
	
	// FUN: Super-bounce lava pads
	createBouncyPad(folder, new Vector3(-20, 3, 180), new BrickColor("Really red"), 100);
	createBouncyPad(folder, new Vector3(20, 3, 220), new BrickColor("Bright orange"), 90);
	
	// FUN: Fire gems
	createCollectible(folder, new Vector3(-15, 5, 190), "🔥", 15);
	createCollectible(folder, new Vector3(15, 5, 210), "🔥", 15);
	createCollectible(folder, new Vector3(0, 30, 200), "💎", 50); // On top of volcano!
	
	// FUN: Spinning platform
	createSpinningPlatform(folder, new Vector3(30, 8, 180), new Vector3(12, 2, 12), new BrickColor("Dark stone grey"));
	
	// COINS: Scattered on volcanic rock
	for (let i = 0; i < 8; i++) {
		createCollectible(folder, new Vector3(
			math.random() * 60 - 30,
			4,
			200 + math.random() * 60 - 30
		), "🪙", 3);
	}
}

// ==================== SPACE MAP ====================
function createSpaceMap() {
	const folder = new Instance("Folder");
	folder.Name = "SpaceMap";
	folder.Parent = Workspace;
	
	// Space station platform
	const station = new Instance("Part");
	station.Size = new Vector3(80, 2, 80);
	station.Position = new Vector3(-200, 50, 0);
	station.Anchored = true;
	station.BrickColor = new BrickColor("Medium stone grey");
	station.Material = Enum.Material.Metal;
	station.Parent = folder;
	
	// Glowing rings
	for (let i = 0; i < 4; i++) {
		const ring = new Instance("Part");
		ring.Size = new Vector3(60 - i * 10, 1, 60 - i * 10);
		ring.Position = new Vector3(-200, 51 + i * 0.5, 0);
		ring.Anchored = true;
		ring.BrickColor = new BrickColor("Cyan");
		ring.Material = Enum.Material.Neon;
		ring.Transparency = 0.3;
		ring.Parent = folder;
	}
	
	// Satellite dishes
	for (let i = 0; i < 4; i++) {
		const angle = (i / 4) * math.pi * 2;
		const x = -200 + math.cos(angle) * 35;
		const z = math.sin(angle) * 35;
		
		const dish = new Instance("Part");
		dish.Size = new Vector3(5, 8, 5);
		dish.Position = new Vector3(x, 56, z);
		dish.Anchored = true;
		dish.BrickColor = new BrickColor("White");
		dish.Material = Enum.Material.SmoothPlastic;
		dish.Parent = folder;
	}
	
	// Space sign
	const sign = new Instance("Part");
	sign.Size = new Vector3(8, 3, 0.5);
	sign.Position = new Vector3(-200, 55, -38);
	sign.Anchored = true;
	sign.BrickColor = new BrickColor("Really blue");
	sign.Parent = folder;
	
	const signGui = new Instance("SurfaceGui");
	signGui.Face = Enum.NormalId.Front;
	const signText = new Instance("TextLabel");
	signText.Size = new UDim2(1, 0, 1, 0);
	signText.BackgroundTransparency = 1;
	signText.Text = "🚀 SPACE";
	signText.TextColor3 = new Color3(1, 1, 1);
	signText.TextScaled = true;
	signText.Font = Enum.Font.GothamBold;
	signText.Parent = signGui;
	signGui.Parent = sign;
	
	// FUN: Low gravity mega-bounce pads
	createBouncyPad(folder, new Vector3(-220, 52, 10), new BrickColor("Cyan"), 120);
	createBouncyPad(folder, new Vector3(-180, 52, -10), new BrickColor("Magenta"), 120);
	createBouncyPad(folder, new Vector3(-200, 52, 25), new BrickColor("Lime green"), 150);
	
	// FUN: Space gems (high value!)
	createCollectible(folder, new Vector3(-215, 55, 0), "🌟", 25);
	createCollectible(folder, new Vector3(-185, 55, 0), "🌟", 25);
	createCollectible(folder, new Vector3(-200, 70, 0), "🛸", 100); // High in the sky!
	
	// FUN: Spinning platforms
	createSpinningPlatform(folder, new Vector3(-230, 55, 20), new Vector3(10, 1, 10), new BrickColor("Cyan"));
	createSpinningPlatform(folder, new Vector3(-170, 55, -20), new Vector3(10, 1, 10), new BrickColor("Magenta"));
	
	// COINS: Floating in space
	for (let i = 0; i < 10; i++) {
		createCollectible(folder, new Vector3(
			-200 + math.random() * 50 - 25,
			52 + math.random() * 15,
			math.random() * 50 - 25
		), "🪙", 5);
	}
}

// ==================== CANDY MAP ====================
function createCandyMap() {
	const folder = new Instance("Folder");
	folder.Name = "CandyMap";
	folder.Parent = Workspace;
	
	// Pink candy platform
	const platform = new Instance("Part");
	platform.Size = new Vector3(100, 3, 100);
	platform.Position = new Vector3(0, 1, -200);
	platform.Anchored = true;
	platform.BrickColor = new BrickColor("Hot pink");
	platform.Material = Enum.Material.SmoothPlastic;
	platform.Parent = folder;
	
	// Giant lollipops
	for (let i = 0; i < 8; i++) {
		const angle = (i / 8) * math.pi * 2;
		const x = math.cos(angle) * 35;
		const z = -200 + math.sin(angle) * 35;
		
		const stick = new Instance("Part");
		stick.Shape = Enum.PartType.Cylinder;
		stick.Size = new Vector3(12, 0.8, 0.8);
		stick.CFrame = new CFrame(new Vector3(x, 7, z)).mul(CFrame.Angles(0, 0, math.rad(90)));
		stick.Anchored = true;
		stick.BrickColor = new BrickColor("White");
		stick.Parent = folder;
		
		const candy = new Instance("Part");
		candy.Shape = Enum.PartType.Ball;
		candy.Size = new Vector3(5, 5, 5);
		candy.Position = new Vector3(x, 14, z);
		candy.Anchored = true;
		candy.BrickColor = i % 2 === 0 ? new BrickColor("Really red") : new BrickColor("Lime green");
		candy.Material = Enum.Material.Neon;
		candy.Parent = folder;
	}
	
	// Candy sign
	const sign = new Instance("Part");
	sign.Size = new Vector3(8, 3, 0.5);
	sign.Position = new Vector3(0, 5, -245);
	sign.Anchored = true;
	sign.BrickColor = new BrickColor("Hot pink");
	sign.Parent = folder;
	
	const signGui = new Instance("SurfaceGui");
	signGui.Face = Enum.NormalId.Front;
	const signText = new Instance("TextLabel");
	signText.Size = new UDim2(1, 0, 1, 0);
	signText.BackgroundTransparency = 1;
	signText.Text = "🍭 CANDY";
	signText.TextColor3 = new Color3(1, 1, 1);
	signText.TextScaled = true;
	signText.Font = Enum.Font.GothamBold;
	signText.Parent = signGui;
	signGui.Parent = sign;
	
	// FUN: Gummy bouncy pads
	createBouncyPad(folder, new Vector3(-20, 3, -180), new BrickColor("Hot pink"), 85);
	createBouncyPad(folder, new Vector3(20, 3, -220), new BrickColor("Lime green"), 85);
	createBouncyPad(folder, new Vector3(0, 3, -200), new BrickColor("Bright yellow"), 100);
	
	// FUN: Candy collectibles
	createCollectible(folder, new Vector3(-25, 5, -190), "🍬", 20);
	createCollectible(folder, new Vector3(25, 5, -210), "🍭", 20);
	createCollectible(folder, new Vector3(0, 5, -180), "🍩", 30);
	createCollectible(folder, new Vector3(0, 20, -200), "🎂", 75); // High cake!
	
	// FUN: Spinning platforms
	createSpinningPlatform(folder, new Vector3(-30, 8, -200), new Vector3(8, 2, 8), new BrickColor("Hot pink"));
	createSpinningPlatform(folder, new Vector3(30, 8, -200), new Vector3(8, 2, 8), new BrickColor("Lime green"));
	
	// COINS: Scattered in candy land
	for (let i = 0; i < 10; i++) {
		createCollectible(folder, new Vector3(
			math.random() * 60 - 30,
			4,
			-200 + math.random() * 60 - 30
		), "🪙", 6);
	}
}

// ==================== ICE MAP ====================
function createIceMap() {
	const folder = new Instance("Folder");
	folder.Name = "IceMap";
	folder.Parent = Workspace;
	
	// Ice platform
	const ice = new Instance("Part");
	ice.Size = new Vector3(100, 3, 100);
	ice.Position = new Vector3(200, 1, 200);
	ice.Anchored = true;
	ice.BrickColor = new BrickColor("Pastel Blue");
	ice.Material = Enum.Material.Ice;
	ice.Transparency = 0.2;
	ice.Parent = folder;
	
	// Ice crystals
	for (let i = 0; i < 10; i++) {
		const crystal = new Instance("Part");
		crystal.Size = new Vector3(3 + math.random() * 3, 8 + math.random() * 10, 3 + math.random() * 3);
		crystal.Position = new Vector3(200 + math.random() * 60 - 30, 8, 200 + math.random() * 60 - 30);
		crystal.Anchored = true;
		crystal.BrickColor = new BrickColor("Cyan");
		crystal.Material = Enum.Material.Glass;
		crystal.Transparency = 0.3;
		crystal.Parent = folder;
	}
	
	// Frozen castle walls
	for (let i = 0; i < 4; i++) {
		const wall = new Instance("Part");
		wall.Size = new Vector3(30, 20, 3);
		const angle = (i / 4) * math.pi * 2;
		wall.Position = new Vector3(200 + math.cos(angle) * 40, 12, 200 + math.sin(angle) * 40);
		wall.CFrame = new CFrame(wall.Position).mul(CFrame.Angles(0, angle + math.rad(90), 0));
		wall.Anchored = true;
		wall.BrickColor = new BrickColor("Light blue");
		wall.Material = Enum.Material.Ice;
		wall.Transparency = 0.4;
		wall.Parent = folder;
	}
	
	// Ice sign
	const sign = new Instance("Part");
	sign.Size = new Vector3(8, 3, 0.5);
	sign.Position = new Vector3(200, 5, 155);
	sign.Anchored = true;
	sign.BrickColor = new BrickColor("Cyan");
	sign.Parent = folder;
	
	const signGui = new Instance("SurfaceGui");
	signGui.Face = Enum.NormalId.Front;
	const signText = new Instance("TextLabel");
	signText.Size = new UDim2(1, 0, 1, 0);
	signText.BackgroundTransparency = 1;
	signText.Text = "❄️ ICE";
	signText.TextColor3 = new Color3(1, 1, 1);
	signText.TextScaled = true;
	signText.Font = Enum.Font.GothamBold;
	signText.Parent = signGui;
	signGui.Parent = sign;
	
	// FUN: Icy bouncy pads
	createBouncyPad(folder, new Vector3(180, 3, 180), new BrickColor("Pastel Blue"), 90);
	createBouncyPad(folder, new Vector3(220, 3, 220), new BrickColor("Cyan"), 90);
	createBouncyPad(folder, new Vector3(200, 3, 200), new BrickColor("Light blue"), 110);
	
	// FUN: Snowflake collectibles
	createCollectible(folder, new Vector3(185, 5, 190), "❄️", 35);
	createCollectible(folder, new Vector3(215, 5, 210), "❄️", 35);
	createCollectible(folder, new Vector3(200, 5, 180), "⛄", 50);
	createCollectible(folder, new Vector3(200, 25, 200), "💠", 150); // Diamond on top!
	
	// FUN: Spinning ice platforms
	createSpinningPlatform(folder, new Vector3(170, 8, 200), new Vector3(10, 1, 10), new BrickColor("Cyan"));
	createSpinningPlatform(folder, new Vector3(230, 8, 200), new Vector3(10, 1, 10), new BrickColor("Pastel Blue"));
	
	// COINS: Frozen coins on ice
	for (let i = 0; i < 10; i++) {
		createCollectible(folder, new Vector3(
			200 + math.random() * 60 - 30,
			4,
			200 + math.random() * 60 - 30
		), "🪙", 8);
	}
}

// ==================== RAINBOW MAP ====================
function createRainbowMap() {
	const folder = new Instance("Folder");
	folder.Name = "RainbowMap";
	folder.Parent = Workspace;
	
	// Cloud platforms
	for (let i = 0; i < 7; i++) {
		const cloud = new Instance("Part");
		cloud.Size = new Vector3(25 + math.random() * 15, 4, 25 + math.random() * 15);
		cloud.Position = new Vector3(-200 + math.random() * 40 - 20, 100 + i * 5, -200 + math.random() * 40 - 20);
		cloud.Anchored = true;
		cloud.BrickColor = new BrickColor("Institutional white");
		cloud.Material = Enum.Material.SmoothPlastic;
		cloud.Parent = folder;
	}
	
	// Rainbow arcs
	const rainbowColors = [
		new BrickColor("Really red"),
		new BrickColor("Neon orange"),
		new BrickColor("New Yeller"),
		new BrickColor("Lime green"),
		new BrickColor("Cyan"),
		new BrickColor("Really blue"),
		new BrickColor("Magenta"),
	];
	
	for (let i = 0; i < rainbowColors.size(); i++) {
		const arc = new Instance("Part");
		arc.Size = new Vector3(60 - i * 5, 3, 3);
		arc.Position = new Vector3(-200, 120 + i * 4, -200);
		arc.CFrame = arc.CFrame.mul(CFrame.Angles(0, 0, math.rad(45)));
		arc.Anchored = true;
		arc.BrickColor = rainbowColors[i];
		arc.Material = Enum.Material.Neon;
		arc.Parent = folder;
	}
	
	// Golden pot at the end
	const pot = new Instance("Part");
	pot.Shape = Enum.PartType.Cylinder;
	pot.Size = new Vector3(6, 8, 8);
	pot.Position = new Vector3(-175, 130, -175);
	pot.CFrame = pot.CFrame.mul(CFrame.Angles(math.rad(90), 0, 0));
	pot.Anchored = true;
	pot.BrickColor = new BrickColor("Bright yellow");
	pot.Material = Enum.Material.Neon;
	pot.Parent = folder;
	
	// Rainbow sign
	const sign = new Instance("Part");
	sign.Size = new Vector3(10, 3, 0.5);
	sign.Position = new Vector3(-200, 105, -245);
	sign.Anchored = true;
	sign.BrickColor = new BrickColor("Magenta");
	sign.Parent = folder;
	
	const signGui = new Instance("SurfaceGui");
	signGui.Face = Enum.NormalId.Front;
	const signText = new Instance("TextLabel");
	signText.Size = new UDim2(1, 0, 1, 0);
	signText.BackgroundTransparency = 1;
	signText.Text = "🌈 RAINBOW";
	signText.TextColor3 = new Color3(1, 1, 1);
	signText.TextScaled = true;
	signText.Font = Enum.Font.GothamBold;
	signText.Parent = signGui;
	signGui.Parent = sign;
	
	// FUN: Rainbow bouncy pads (super high!)
	createBouncyPad(folder, new Vector3(-220, 102, -180), new BrickColor("Really red"), 130);
	createBouncyPad(folder, new Vector3(-180, 102, -220), new BrickColor("Cyan"), 130);
	createBouncyPad(folder, new Vector3(-200, 102, -200), new BrickColor("Magenta"), 150);
	
	// FUN: Rainbow collectibles (highest value!)
	createCollectible(folder, new Vector3(-210, 105, -190), "🌈", 100);
	createCollectible(folder, new Vector3(-190, 105, -210), "🌈", 100);
	createCollectible(folder, new Vector3(-200, 115, -200), "🏆", 250);
	createCollectible(folder, new Vector3(-175, 135, -175), "👑", 500); // Near the pot of gold!
	
	// COINS: Lots of coins scattered on clouds
	for (let i = 0; i < 10; i++) {
		createCollectible(folder, new Vector3(
			-200 + math.random() * 50 - 25,
			102 + math.random() * 20,
			-200 + math.random() * 50 - 25
		), "🪙", 10);
	}
}
