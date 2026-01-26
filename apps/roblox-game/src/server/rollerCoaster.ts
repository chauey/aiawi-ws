// Rainbow Roller Coaster - FIXED VERSION
// Proper E key exit, safe spawn after ride
import { Workspace, Players, RunService, ReplicatedStorage } from "@rbxts/services";

const COASTER_POSITION = new Vector3(-50, 0, 50);
const RIDE_SPEED = 20; // Studs per second (slower = smoother)
const STATION_SPAWN = new Vector3(-50, 5, 42); // Safe spawn on platform

export function createRollerCoaster() {
	// Create exit remote FIRST so client can find it
	const existingRemote = ReplicatedStorage.FindFirstChild("CoasterExit");
	if (existingRemote) existingRemote.Destroy();
	
	const exitRemote = new Instance("RemoteEvent");
	exitRemote.Name = "CoasterExit";
	exitRemote.Parent = ReplicatedStorage;
	
	const folder = new Instance("Folder");
	folder.Name = "RainbowCoaster";
	folder.Parent = Workspace;
	
	const path = generatePath();
	createStation(folder);
	createTrack(folder, path);
	const car = createCar(folder);
	
	// Setup with exit remote reference
	setupRide(folder, car, path, exitRemote);
	
	print("🎢 Rainbow Coaster ready! Walk on to ride, E = EXIT");
}

function generatePath(): Vector3[] {
	const pts: Vector3[] = [];
	const b = COASTER_POSITION;
	
	// Start on platform
	pts.push(b.add(new Vector3(0, 3, 0)));
	pts.push(b.add(new Vector3(8, 3.5, 0)));
	pts.push(b.add(new Vector3(16, 4.5, 0)));
	pts.push(b.add(new Vector3(24, 7, 0)));
	
	// Hill climb
	pts.push(b.add(new Vector3(32, 14, 2)));
	pts.push(b.add(new Vector3(40, 24, 4)));
	pts.push(b.add(new Vector3(48, 36, 6)));
	pts.push(b.add(new Vector3(56, 48, 8)));
	pts.push(b.add(new Vector3(64, 55, 10)));
	
	// Drop
	pts.push(b.add(new Vector3(72, 50, 15)));
	pts.push(b.add(new Vector3(80, 38, 22)));
	pts.push(b.add(new Vector3(86, 22, 30)));
	pts.push(b.add(new Vector3(90, 12, 38)));
	
	// Wide turn
	pts.push(b.add(new Vector3(88, 10, 48)));
	pts.push(b.add(new Vector3(80, 11, 55)));
	pts.push(b.add(new Vector3(68, 13, 58)));
	pts.push(b.add(new Vector3(54, 15, 54)));
	
	// Small hill
	pts.push(b.add(new Vector3(42, 22, 46)));
	pts.push(b.add(new Vector3(34, 18, 38)));
	
	// Return to station
	pts.push(b.add(new Vector3(26, 12, 28)));
	pts.push(b.add(new Vector3(18, 8, 18)));
	pts.push(b.add(new Vector3(10, 5, 10)));
	pts.push(b.add(new Vector3(2, 3.5, 2)));
	pts.push(b.add(new Vector3(-4, 3, -4)));
	
	return pts;
}

function createStation(parent: Folder) {
	// Main platform - larger for safe landing
	const platform = new Instance("Part");
	platform.Name = "StationPlatform";
	platform.Size = new Vector3(20, 3, 20);
	platform.Position = COASTER_POSITION.add(new Vector3(0, 1.5, 0));
	platform.BrickColor = new BrickColor("Dark stone grey");
	platform.Material = Enum.Material.Concrete;
	platform.Anchored = true;
	platform.Parent = parent;
	
	// Exit area - separate safe zone
	const exitPad = new Instance("Part");
	exitPad.Name = "ExitPad";
	exitPad.Size = new Vector3(10, 1, 10);
	exitPad.Position = COASTER_POSITION.add(new Vector3(0, 3.5, -10));
	exitPad.BrickColor = new BrickColor("Bright green");
	exitPad.Material = Enum.Material.SmoothPlastic;
	exitPad.Anchored = true;
	exitPad.Parent = parent;
	
	// Sign
	const sign = new Instance("Part");
	sign.Name = "Sign";
	sign.Size = new Vector3(14, 5, 0.5);
	sign.Position = COASTER_POSITION.add(new Vector3(0, 15, -15));
	sign.Color = Color3.fromRGB(255, 150, 200);
	sign.Material = Enum.Material.Neon;
	sign.Anchored = true;
	sign.Parent = parent;
	
	const gui = new Instance("SurfaceGui");
	gui.Face = Enum.NormalId.Front;
	const lbl = new Instance("TextLabel");
	lbl.Size = new UDim2(1, 0, 1, 0);
	lbl.BackgroundTransparency = 1;
	lbl.Text = "🎢 RAINBOW COASTER 🌈\n+25 Coins! PRESS E = Exit";
	lbl.TextColor3 = new Color3(1, 1, 1);
	lbl.TextScaled = true;
	lbl.Font = Enum.Font.GothamBold;
	lbl.Parent = gui;
	gui.Parent = sign;
}

function createTrack(parent: Folder, pts: Vector3[]) {
	const colors = [
		Color3.fromRGB(255, 100, 100),
		Color3.fromRGB(255, 180, 80),
		Color3.fromRGB(255, 255, 100),
		Color3.fromRGB(100, 255, 120),
		Color3.fromRGB(100, 180, 255),
		Color3.fromRGB(180, 100, 255),
	];
	
	for (let i = 0; i < pts.size() - 1; i++) {
		const a = pts[i];
		const c = pts[i + 1];
		const mid = a.add(c).div(2);
		const len = c.sub(a).Magnitude;
		if (len < 2) continue;
		
		const rail = new Instance("Part");
		rail.Name = `Rail${i}`;
		rail.Size = new Vector3(1.5, 0.6, len);
		rail.Color = colors[i % colors.size()];
		rail.Material = Enum.Material.Neon;
		rail.CFrame = CFrame.lookAt(mid, c);
		rail.Anchored = true;
		rail.CanCollide = false;
		rail.CastShadow = false;
		rail.Parent = parent;
		
		if (i % 4 === 0 && a.Y > 8) {
			const sup = new Instance("Part");
			sup.Name = `Sup${i}`;
			sup.Size = new Vector3(0.5, a.Y - 2, 0.5);
			sup.Position = new Vector3(a.X, a.Y / 2, a.Z);
			sup.BrickColor = new BrickColor("Medium stone grey");
			sup.Material = Enum.Material.Metal;
			sup.Anchored = true;
			sup.CastShadow = false;
			sup.Parent = parent;
		}
	}
}

function createCar(parent: Folder): Part {
	const car = new Instance("Part");
	car.Name = "CoasterCar";
	car.Size = new Vector3(4, 2.5, 5);
	car.Color = Color3.fromRGB(255, 100, 150);
	car.Material = Enum.Material.SmoothPlastic;
	car.Anchored = true;
	car.CanCollide = false;
	car.CastShadow = false;
	car.Position = COASTER_POSITION.add(new Vector3(0, 5, 0));
	car.Parent = parent;
	
	const sp = new Instance("ParticleEmitter");
	sp.Name = "Sparkle";
	sp.Color = new ColorSequence(Color3.fromRGB(255, 220, 255));
	sp.Size = new NumberSequence(0.2, 0);
	sp.LightEmission = 1;
	sp.Rate = 10;
	sp.Lifetime = new NumberRange(0.5);
	sp.Speed = new NumberRange(1);
	sp.Enabled = false;
	sp.Parent = car;
	
	return car;
}

function setupRide(parent: Folder, car: Part, path: Vector3[], exitRemote: RemoteEvent) {
	const trigger = new Instance("Part");
	trigger.Name = "BoardTrigger";
	trigger.Size = new Vector3(15, 6, 15);
	trigger.Position = COASTER_POSITION.add(new Vector3(0, 6, 0));
	trigger.Transparency = 1;
	trigger.CanCollide = false;
	trigger.Anchored = true;
	trigger.Parent = parent;
	
	let riding = false;
	let currentRider: Player | undefined;
	let exitRequested = false;
	
	// E key exit listener
	exitRemote.OnServerEvent.Connect((player) => {
		if (player === currentRider && riding) {
			exitRequested = true;
			print(`🎢 ${player.Name} pressed E - exiting!`);
		}
	});
	
	trigger.Touched.Connect((hit) => {
		if (riding) return;
		
		const player = Players.GetPlayerFromCharacter(hit.Parent);
		if (!player) return;
		
		const char = player.Character;
		const hum = char?.FindFirstChildOfClass("Humanoid");
		if (!hum) return;
		
		riding = true;
		currentRider = player;
		exitRequested = false;
		
		print(`🎢 ${player.Name} boarding! PRESS E TO EXIT!`);
		
		const sp = car.FindFirstChild("Sparkle") as ParticleEmitter | undefined;
		if (sp) sp.Enabled = true;
		
		// Run ride
		smoothRide(car, path, player, () => exitRequested).then(() => {
			if (sp) sp.Enabled = false;
			
			// SAFE TELEPORT - to green exit pad
			safeReturn(player);
			
			// Reward if completed
			if (!exitRequested) {
				const ls = player.FindFirstChild("leaderstats") as Folder | undefined;
				const coins = ls?.FindFirstChild("Coins") as IntValue | undefined;
				if (coins) {
					coins.Value += 25;
					print(`🎢 ${player.Name} finished! +25 coins!`);
				}
			}
			
			riding = false;
			currentRider = undefined;
			exitRequested = false;
			
			// Reset car
			car.CFrame = new CFrame(COASTER_POSITION.add(new Vector3(0, 5, 0)));
		});
	});
}

function safeReturn(player: Player) {
	const char = player.Character;
	if (!char) return;
	
	const hrp = char.FindFirstChild("HumanoidRootPart") as Part | undefined;
	const hum = char.FindFirstChildOfClass("Humanoid");
	
	if (hrp) {
		// First unanchor
		hrp.Anchored = false;
		
		// Reset velocity
		hrp.AssemblyLinearVelocity = Vector3.zero;
		hrp.AssemblyAngularVelocity = Vector3.zero;
		
		// Teleport to safe exit pad (green platform)
		hrp.CFrame = new CFrame(COASTER_POSITION.add(new Vector3(0, 6, -10)));
	}
	
	if (hum) {
		hum.PlatformStand = false;
	}
}

async function smoothRide(car: Part, path: Vector3[], player: Player, checkExit: () => boolean): Promise<void> {
	const char = player.Character;
	const hrp = char?.FindFirstChild("HumanoidRootPart") as Part | undefined;
	const hum = char?.FindFirstChildOfClass("Humanoid");
	
	if (!hrp || !hum) return;
	
	hrp.Anchored = true;
	
	// Calculate total distance
	let totalDist = 0;
	for (let i = 0; i < path.size() - 1; i++) {
		totalDist += path[i + 1].sub(path[i]).Magnitude;
	}
	
	let progress = 0;
	
	return new Promise((resolve) => {
		const conn = RunService.Heartbeat.Connect((dt) => {
			// Check exit
			if (checkExit() || progress >= 1) {
				conn.Disconnect();
				resolve();
				return;
			}
			
			// Advance progress
			const distThisFrame = RIDE_SPEED * dt;
			progress += distThisFrame / totalDist;
			progress = math.min(progress, 1);
			
			// Get position on path
			const pos = getPathPosition(path, progress);
			const lookAhead = getPathPosition(path, math.min(progress + 0.02, 1));
			
			// Move car smoothly
			const targetCF = CFrame.lookAt(pos.add(new Vector3(0, 2, 0)), lookAhead.add(new Vector3(0, 2, 0)));
			car.CFrame = car.CFrame.Lerp(targetCF, 0.25);
			
			// Keep player attached
			hrp.CFrame = car.CFrame.mul(new CFrame(0, 2, 0));
		});
	});
}

function getPathPosition(path: Vector3[], t: number): Vector3 {
	if (t <= 0) return path[0];
	if (t >= 1) return path[path.size() - 1];
	
	// Calculate distances
	const dists: number[] = [0];
	let total = 0;
	for (let i = 0; i < path.size() - 1; i++) {
		total += path[i + 1].sub(path[i]).Magnitude;
		dists.push(total);
	}
	
	const targetDist = t * total;
	
	for (let i = 0; i < dists.size() - 1; i++) {
		if (targetDist >= dists[i] && targetDist <= dists[i + 1]) {
			const segLen = dists[i + 1] - dists[i];
			const segT = segLen > 0 ? (targetDist - dists[i]) / segLen : 0;
			return path[i].Lerp(path[i + 1], segT);
		}
	}
	
	return path[path.size() - 1];
}
