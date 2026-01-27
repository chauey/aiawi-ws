// NPC Companion System - Friendly bots that PLAY the game with players
import { Workspace, Players, RunService, ReplicatedStorage } from "@rbxts/services";

const NPC_COLORS = [
	Color3.fromRGB(255, 150, 150),
	Color3.fromRGB(150, 255, 150),
	Color3.fromRGB(150, 150, 255),
	Color3.fromRGB(255, 255, 150),
	Color3.fromRGB(255, 150, 255),
	Color3.fromRGB(150, 255, 255),
	Color3.fromRGB(255, 200, 150),
	Color3.fromRGB(200, 150, 255),
];

// Game locations for NPCs to visit
const GAME_LOCATIONS = {
	obby: new Vector3(0, 5, 0),       // Obby tower base
	coaster: new Vector3(-50, 5, 50), // Roller coaster station
	spawn: new Vector3(0, 5, 0),      // Spawn area
};

type NPCActivity = "following" | "collecting" | "obby" | "coaster" | "wandering";

interface NPCData {
	model: Model;
	ownerPlayer: Player;
	npcNumber: number;
	wanderTarget: Vector3;
	lastAction: number;
	activity: NPCActivity;
	activityTimer: number;
}

const activeNPCs = new Map<Player, NPCData[]>();
const MAX_NPCS_PER_PLAYER = 10;

export function setupNPCSystem() {
	// Create remote for spawning NPCs (accepts count parameter)
	const existingRemote = ReplicatedStorage.FindFirstChild("SpawnNPCCompanions");
	if (existingRemote) existingRemote.Destroy();
	
	const spawnRemote = new Instance("RemoteEvent");
	spawnRemote.Name = "SpawnNPCCompanions";
	spawnRemote.Parent = ReplicatedStorage;
	
	spawnRemote.OnServerEvent.Connect((player, count?: unknown) => {
		const numNPCs = typeIs(count, "number") ? math.clamp(count, 1, MAX_NPCS_PER_PLAYER) : 2;
		spawnNPCsForPlayer(player, numNPCs);
	});
	
	// Cleanup when player leaves
	Players.PlayerRemoving.Connect((player) => {
		const npcs = activeNPCs.get(player);
		if (npcs) {
			for (const npc of npcs) {
				npc.model.Destroy();
			}
			activeNPCs.delete(player);
		}
	});
	
	// NPC behavior loop
	RunService.Heartbeat.Connect((dt) => {
		updateAllNPCs(dt);
	});
	
	print("🤖 NPC Companion system ready! (up to 10 per player)");
}

function spawnNPCsForPlayer(player: Player, count: number) {
	// Don't spawn if already has NPCs
	if (activeNPCs.has(player)) {
		print(`🤖 ${player.Name} already has NPC companions!`);
		return;
	}
	
	const char = player.Character;
	if (!char) return;
	
	const hrp = char.FindFirstChild("HumanoidRootPart") as Part | undefined;
	if (!hrp) return;
	
	const npcs: NPCData[] = [];
	
	for (let i = 0; i < count; i++) {
		const npc = createNPC(player.Name, i, hrp.Position);
		npcs.push({
			model: npc,
			ownerPlayer: player,
			npcNumber: i + 1,
			wanderTarget: hrp.Position,
			lastAction: tick(),
			activity: "following",
			activityTimer: 0,
		});
	}
	
	activeNPCs.set(player, npcs);
	print(`🤖 Spawned ${count} NPC companions for ${player.Name}!`);
}

function createNPC(ownerName: string, index: number, spawnPos: Vector3): Model {
	const color = NPC_COLORS[index % NPC_COLORS.size()];
	const npcName = `${ownerName}'s NPC`;
	
	const model = new Instance("Model");
	model.Name = `NPC_${ownerName}_${index + 1}`;
	
	// Create simple humanoid NPC
	const humanoid = new Instance("Humanoid");
	humanoid.WalkSpeed = 16;
	humanoid.JumpPower = 50;
	humanoid.Parent = model;
	
	// Torso (main part)
	const torso = new Instance("Part");
	torso.Name = "HumanoidRootPart";
	torso.Size = new Vector3(2, 2, 1);
	torso.Color = color;
	torso.Material = Enum.Material.SmoothPlastic;
	torso.Position = spawnPos.add(new Vector3(math.random(-5, 5), 3, math.random(-5, 5)));
	torso.Anchored = false;
	torso.CanCollide = true;
	torso.Parent = model;
	
	// Head
	const head = new Instance("Part");
	head.Name = "Head";
	head.Size = new Vector3(1.5, 1.5, 1.5);
	head.Shape = Enum.PartType.Ball;
	head.Color = color;
	head.Material = Enum.Material.SmoothPlastic;
	head.Position = torso.Position.add(new Vector3(0, 1.75, 0));
	head.Anchored = false;
	head.CanCollide = false;
	head.Parent = model;
	
	// Weld head to torso
	const headWeld = new Instance("Weld");
	headWeld.Part0 = torso;
	headWeld.Part1 = head;
	headWeld.C0 = new CFrame(0, 1.75, 0);
	headWeld.Parent = head;
	
	// Name label - "{Player}'s NPC"
	const billboard = new Instance("BillboardGui");
	billboard.Size = new UDim2(0, 120, 0, 30);
	billboard.StudsOffset = new Vector3(0, 2.5, 0);
	billboard.AlwaysOnTop = true;
	
	const nameLabel = new Instance("TextLabel");
	nameLabel.Size = new UDim2(1, 0, 1, 0);
	nameLabel.BackgroundTransparency = 1;
	nameLabel.Text = `🤖 ${npcName}`;
	nameLabel.TextColor3 = new Color3(1, 1, 1);
	nameLabel.TextStrokeTransparency = 0.5;
	nameLabel.TextScaled = true;
	nameLabel.Font = Enum.Font.GothamBold;
	nameLabel.Parent = billboard;
	billboard.Parent = head;
	
	// Simple legs (visual only)
	for (let legX = -0.5; legX <= 0.5; legX += 1) {
		const leg = new Instance("Part");
		leg.Name = legX < 0 ? "LeftLeg" : "RightLeg";
		leg.Size = new Vector3(0.8, 1.5, 0.8);
		leg.Color = Color3.fromRGB(80, 80, 100);
		leg.Material = Enum.Material.SmoothPlastic;
		leg.Position = torso.Position.add(new Vector3(legX, -1.75, 0));
		leg.Anchored = false;
		leg.CanCollide = false;
		leg.Parent = model;
		
		const legWeld = new Instance("Weld");
		legWeld.Part0 = torso;
		legWeld.Part1 = leg;
		legWeld.C0 = new CFrame(legX, -1.75, 0);
		legWeld.Parent = leg;
	}
	
	model.PrimaryPart = torso;
	model.Parent = Workspace;
	
	return model;
}

function updateAllNPCs(dt: number) {
	for (const [player, npcs] of activeNPCs) {
		const char = player.Character;
		const playerHrp = char?.FindFirstChild("HumanoidRootPart") as Part | undefined;
		
		if (!playerHrp) continue;
		
		for (const npc of npcs) {
			updateNPC(npc, playerHrp, dt);
		}
	}
}

function updateNPC(npc: NPCData, playerHrp: Part, dt: number) {
	const hrp = npc.model.FindFirstChild("HumanoidRootPart") as Part | undefined;
	const humanoid = npc.model.FindFirstChildOfClass("Humanoid");
	
	if (!hrp || !humanoid) return;
	
	const now = tick();
	
	// Update activity timer
	npc.activityTimer += dt;
	
	// NPCs ONLY collect coins and wander - no following, no jumping
	humanoid.WalkSpeed = 16;
	
	// Look for coins in Workspace (coins are named "Coin" and are Parts)
	let nearestCoin: Part | undefined;
	let nearestDist = 80;
	
	for (const child of Workspace.GetChildren()) {
		if (child.IsA("Part") && child.Name === "Coin") {
			const dist = child.Position.sub(hrp.Position).Magnitude;
			if (dist < nearestDist) {
				nearestDist = dist;
				nearestCoin = child;
			}
		}
	}
	
	if (nearestCoin) {
		// Move toward the coin
		humanoid.MoveTo(nearestCoin.Position);
		
		// If close enough, "collect" the coin (destroy it and give coins to owner)
		if (nearestDist < 4) {
			nearestCoin.Destroy();
			
			// Give coin to the NPC's owner
			const ls = npc.ownerPlayer.FindFirstChild("leaderstats") as Folder | undefined;
			const coinsValue = ls?.FindFirstChild("Coins") as IntValue | undefined;
			if (coinsValue) {
				coinsValue.Value += 1;
			}
			print(`🤖 ${npc.ownerPlayer.Name}'s NPC collected a coin!`);
		}
		return;
	}
	
	// No coins found - wander around the map looking for them
	if (now - npc.lastAction > 3) {
		npc.lastAction = now;
		npc.wanderTarget = new Vector3(
			math.random() * 100 - 50,
			3,
			math.random() * 100 - 50
		);
	}
	humanoid.MoveTo(npc.wanderTarget);
}

function changeActivity(npc: NPCData) {
	const activities: NPCActivity[] = ["following", "collecting", "obby", "wandering"];
	const randomActivity = activities[math.floor(math.random() * activities.size())];
	npc.activity = randomActivity;
	npc.lastAction = tick();
	print(`🤖 ${npc.ownerPlayer.Name}'s NPC #${npc.npcNumber} is now ${randomActivity}!`);
}

function doFollowBehavior(npc: NPCData, hrp: Part, humanoid: Humanoid, playerHrp: Part, distToPlayer: number, now: number) {
	if (distToPlayer > 30) {
		// Too far - run to player
		humanoid.WalkSpeed = 22;
		humanoid.MoveTo(playerHrp.Position);
	} else if (distToPlayer > 10) {
		// Follow player casually
		humanoid.WalkSpeed = 16;
		humanoid.MoveTo(playerHrp.Position);
	} else {
		// Near player - wander around them
		humanoid.WalkSpeed = 12;
		if (now - npc.lastAction > 2) {
			npc.lastAction = now;
			const offset = new Vector3(math.random() * 12 - 6, 0, math.random() * 12 - 6);
			npc.wanderTarget = playerHrp.Position.add(offset);
		}
		humanoid.MoveTo(npc.wanderTarget);
	}
}

function doCollectBehavior(npc: NPCData, hrp: Part, humanoid: Humanoid, playerHrp: Part, now: number) {
	humanoid.WalkSpeed = 18;
	
	// Look for coins near the player
	const coinFolder = Workspace.FindFirstChild("CoinFolder");
	if (coinFolder) {
		let nearestCoin: Part | undefined;
		let nearestDist = 50;
		
		for (const child of coinFolder.GetChildren()) {
			if (child.IsA("Part")) {
				const dist = child.Position.sub(hrp.Position).Magnitude;
				if (dist < nearestDist) {
					nearestDist = dist;
					nearestCoin = child;
				}
			}
		}
		
		if (nearestCoin) {
			humanoid.MoveTo(nearestCoin.Position);
			return;
		}
	}
	
	// No coins found - wander around spawn area looking
	if (now - npc.lastAction > 3) {
		npc.lastAction = now;
		npc.wanderTarget = GAME_LOCATIONS.spawn.add(new Vector3(math.random() * 40 - 20, 0, math.random() * 40 - 20));
	}
	humanoid.MoveTo(npc.wanderTarget);
}

function doObbyBehavior(npc: NPCData, hrp: Part, humanoid: Humanoid, playerHrp: Part, now: number) {
	humanoid.WalkSpeed = 16;
	
	// Go to obby tower area
	const obbyFolder = Workspace.FindFirstChild("ObbyTower");
	if (obbyFolder) {
		const platform = obbyFolder.FindFirstChild("Platform1") as Part | undefined;
		if (platform) {
			humanoid.MoveTo(platform.Position.add(new Vector3(math.random() * 4 - 2, 0, math.random() * 4 - 2)));
			
			// Jump frequently when doing obby
			if (math.random() < 0.03) {
				humanoid.Jump = true;
			}
			return;
		}
	}
	
	// No obby found - go to approximate location
	humanoid.MoveTo(GAME_LOCATIONS.obby.add(new Vector3(math.random() * 10 - 5, 0, math.random() * 10 - 5)));
	
	// Jump a lot when doing obby
	if (math.random() < 0.025) {
		humanoid.Jump = true;
	}
}

function doWanderBehavior(npc: NPCData, hrp: Part, humanoid: Humanoid, playerHrp: Part, now: number) {
	humanoid.WalkSpeed = 10;
	
	// Just wander around the map
	if (now - npc.lastAction > 4) {
		npc.lastAction = now;
		npc.wanderTarget = new Vector3(
			math.random() * 80 - 40,
			3,
			math.random() * 80 - 40
		);
	}
	
	humanoid.MoveTo(npc.wanderTarget);
}
