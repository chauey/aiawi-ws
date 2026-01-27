// NPC Companion System - Friendly bots that play alongside players
import { Workspace, Players, RunService, ReplicatedStorage } from "@rbxts/services";

const NPC_NAMES = ["Buddy", "Sparky", "Ziggy", "Pip", "Luna", "Max", "Coco", "Rex"];
const NPC_COLORS = [
	Color3.fromRGB(255, 150, 150),
	Color3.fromRGB(150, 255, 150),
	Color3.fromRGB(150, 150, 255),
	Color3.fromRGB(255, 255, 150),
	Color3.fromRGB(255, 150, 255),
	Color3.fromRGB(150, 255, 255),
];

interface NPCData {
	model: Model;
	targetPlayer: Player;
	wanderTarget: Vector3;
	lastAction: number;
}

const activeNPCs = new Map<Player, NPCData[]>();

export function setupNPCSystem() {
	// Create remote for spawning NPCs
	const existingRemote = ReplicatedStorage.FindFirstChild("SpawnNPCCompanions");
	if (existingRemote) existingRemote.Destroy();
	
	const spawnRemote = new Instance("RemoteEvent");
	spawnRemote.Name = "SpawnNPCCompanions";
	spawnRemote.Parent = ReplicatedStorage;
	
	spawnRemote.OnServerEvent.Connect((player) => {
		spawnNPCsForPlayer(player);
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
	
	print("🤖 NPC Companion system ready!");
}

function spawnNPCsForPlayer(player: Player) {
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
	const numNPCs = 2; // Spawn 2 friendly NPCs
	
	for (let i = 0; i < numNPCs; i++) {
		const npc = createNPC(i, hrp.Position);
		npcs.push({
			model: npc,
			targetPlayer: player,
			wanderTarget: hrp.Position,
			lastAction: tick(),
		});
	}
	
	activeNPCs.set(player, npcs);
	print(`🤖 Spawned ${numNPCs} NPC companions for ${player.Name}!`);
}

function createNPC(index: number, spawnPos: Vector3): Model {
	const name = NPC_NAMES[index % NPC_NAMES.size()];
	const color = NPC_COLORS[index % NPC_COLORS.size()];
	
	const model = new Instance("Model");
	model.Name = `NPC_${name}`;
	
	// Create simple humanoid NPC
	const humanoid = new Instance("Humanoid");
	humanoid.WalkSpeed = 14;
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
	
	// Name label
	const billboard = new Instance("BillboardGui");
	billboard.Size = new UDim2(0, 100, 0, 30);
	billboard.StudsOffset = new Vector3(0, 2.5, 0);
	billboard.AlwaysOnTop = true;
	
	const nameLabel = new Instance("TextLabel");
	nameLabel.Size = new UDim2(1, 0, 1, 0);
	nameLabel.BackgroundTransparency = 1;
	nameLabel.Text = `🤖 ${name}`;
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
	
	const distToPlayer = hrp.Position.sub(playerHrp.Position).Magnitude;
	const now = tick();
	
	// Behavior: Follow player but wander around them
	if (distToPlayer > 25) {
		// Too far - run to player
		humanoid.WalkSpeed = 20;
		humanoid.MoveTo(playerHrp.Position);
	} else if (distToPlayer > 12) {
		// Follow player casually
		humanoid.WalkSpeed = 14;
		humanoid.MoveTo(playerHrp.Position);
	} else {
		// Near player - wander around
		humanoid.WalkSpeed = 10;
		
		// Pick new wander target every 3-5 seconds
		if (now - npc.lastAction > math.random() * 2 + 3) {
			npc.lastAction = now;
			const offset = new Vector3(
				math.random() * 16 - 8,
				0,
				math.random() * 16 - 8
			);
			npc.wanderTarget = playerHrp.Position.add(offset);
		}
		
		humanoid.MoveTo(npc.wanderTarget);
	}
	
	// Jump occasionally when near player
	if (distToPlayer < 15 && math.random() < 0.005) {
		humanoid.Jump = true;
	}
}
