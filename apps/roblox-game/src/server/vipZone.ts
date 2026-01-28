// VIP Zone - Premium exclusive area with better rewards
// PROVEN: Premium areas drive direct Robux purchases (Pet Simulator X: "Huge Games VIP")
import { Players, Workspace, ReplicatedStorage } from "@rbxts/services";

// VIP zone settings
const VIP_COIN_VALUE = 10; // 10x normal coins!
const VIP_COIN_COUNT = 8;
const VIP_UNLOCK_COST = 2500; // One-time unlock (or game pass)
const VIP_RESPAWN_TIME = 8;

// Track VIP access
const vipPlayers = new Set<Player>();

export function setupVIPZone() {
	// Create remotes
	const checkVIPRemote = new Instance("RemoteFunction");
	checkVIPRemote.Name = "CheckVIP";
	checkVIPRemote.Parent = ReplicatedStorage;
	
	const unlockVIPRemote = new Instance("RemoteFunction");
	unlockVIPRemote.Name = "UnlockVIP";
	unlockVIPRemote.Parent = ReplicatedStorage;
	
	const teleportVIPRemote = new Instance("RemoteEvent");
	teleportVIPRemote.Name = "TeleportVIP";
	teleportVIPRemote.Parent = ReplicatedStorage;
	
	// Check VIP
	checkVIPRemote.OnServerInvoke = (player) => {
		return { 
			hasVIP: vipPlayers.has(player),
			cost: VIP_UNLOCK_COST
		};
	};
	
	// Unlock VIP
	unlockVIPRemote.OnServerInvoke = (player) => {
		if (vipPlayers.has(player)) {
			return { success: false, message: "Already have VIP!" };
		}
		
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		
		if (!coins || coins.Value < VIP_UNLOCK_COST) {
			return { success: false, message: `Need ${VIP_UNLOCK_COST} coins!` };
		}
		
		coins.Value -= VIP_UNLOCK_COST;
		vipPlayers.add(player);
		
		print(`👑 ${player.Name} unlocked VIP access!`);
		return { success: true };
	};
	
	// Teleport to VIP
	teleportVIPRemote.OnServerEvent.Connect((player) => {
		if (!vipPlayers.has(player)) return;
		
		const character = player.Character;
		if (!character) return;
		
		const root = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
		if (root) {
			root.CFrame = new CFrame(new Vector3(500, 50, 500)); // VIP zone position
		}
	});
	
	// Cleanup
	Players.PlayerRemoving.Connect((player) => {
		vipPlayers.delete(player);
	});
	
	// Create VIP zone
	createVIPZone();
	
	print("👑 VIP zone ready! Premium rewards await!");
}

function createVIPZone() {
	// VIP Zone folder
	const vipFolder = new Instance("Folder");
	vipFolder.Name = "VIPZone";
	vipFolder.Parent = Workspace;
	
	// Platform
	const platform = new Instance("Part");
	platform.Name = "VIPPlatform";
	platform.Size = new Vector3(100, 5, 100);
	platform.Position = new Vector3(500, 45, 500);
	platform.Anchored = true;
	platform.Material = Enum.Material.Neon;
	platform.BrickColor = new BrickColor("Really red");
	platform.Parent = vipFolder;
	
	// VIP Sign
	const sign = new Instance("Part");
	sign.Name = "VIPSign";
	sign.Size = new Vector3(20, 10, 2);
	sign.Position = new Vector3(500, 60, 450);
	sign.Anchored = true;
	sign.BrickColor = new BrickColor("Gold");
	sign.Parent = vipFolder;
	
	const signGui = new Instance("SurfaceGui");
	signGui.Face = Enum.NormalId.Front;
	const signText = new Instance("TextLabel");
	signText.Size = new UDim2(1, 0, 1, 0);
	signText.BackgroundTransparency = 1;
	signText.Text = "👑 VIP ZONE 👑";
	signText.TextColor3 = Color3.fromRGB(255, 215, 0);
	signText.TextScaled = true;
	signText.Font = Enum.Font.GothamBold;
	signText.Parent = signGui;
	signGui.Parent = sign;
	
	// Golden coins folder
	const coinsFolder = new Instance("Folder");
	coinsFolder.Name = "VIPCoins";
	coinsFolder.Parent = vipFolder;
	
	// Spawn premium coins
	for (let i = 0; i < VIP_COIN_COUNT; i++) {
		const angle = (i / VIP_COIN_COUNT) * math.pi * 2;
		const radius = 35;
		const x = 500 + math.cos(angle) * radius;
		const z = 500 + math.sin(angle) * radius;
		
		createVIPCoin(coinsFolder, new Vector3(x, 52, z), i);
	}
}

function createVIPCoin(parent: Folder, pos: Vector3, index: number) {
	const coin = new Instance("Part");
	coin.Name = `VIPCoin_${index}`;
	coin.Size = new Vector3(3, 3, 0.5);
	coin.Position = pos;
	coin.Anchored = true;
	coin.BrickColor = new BrickColor("Gold");
	coin.Material = Enum.Material.Neon;
	coin.Shape = Enum.PartType.Cylinder;
	coin.Orientation = new Vector3(0, 0, 90);
	coin.Parent = parent;
	
	// Gold sparkle effect
	const sparkle = new Instance("Sparkles");
	sparkle.SparkleColor = Color3.fromRGB(255, 215, 0);
	sparkle.Parent = coin;
	
	// Label
	const gui = new Instance("BillboardGui");
	gui.Size = new UDim2(2, 0, 0.8, 0);
	gui.StudsOffset = new Vector3(0, 2, 0);
	const label = new Instance("TextLabel");
	label.Size = new UDim2(1, 0, 1, 0);
	label.BackgroundTransparency = 1;
	label.Text = `💎 ${VIP_COIN_VALUE}`;
	label.TextColor3 = Color3.fromRGB(255, 215, 0);
	label.TextScaled = true;
	label.Font = Enum.Font.GothamBold;
	label.Parent = gui;
	gui.Parent = coin;
	
	// Touch collection (VIP only)
	coin.Touched.Connect((hit) => {
		const player = Players.GetPlayerFromCharacter(hit.Parent);
		if (!player || !vipPlayers.has(player)) return;
		
		coin.Transparency = 1;
		coin.CanCollide = false;
		
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		if (coins) {
			coins.Value += VIP_COIN_VALUE;
		}
		
		// Respawn
		wait(VIP_RESPAWN_TIME);
		coin.Transparency = 0;
		coin.CanCollide = true;
	});
}
