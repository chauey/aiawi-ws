// Rainbow Roller Coaster - MULTI-RIDER VERSION
// Supports up to 8 riders at once!
import { Workspace, Players, RunService, ReplicatedStorage } from "@rbxts/services";

const COASTER_POSITION = new Vector3(-50, 0, 50);
const RIDE_SPEED = 20;
const MAX_RIDERS = 8;
const BOARDING_TIME = 5; // Seconds to wait for more riders

// Seat offsets for 8 riders (2 rows of 4)
const SEAT_OFFSETS = [
	new Vector3(-1.5, 0, -2),  // Row 1
	new Vector3(-0.5, 0, -2),
	new Vector3(0.5, 0, -2),
	new Vector3(1.5, 0, -2),
	new Vector3(-1.5, 0, 1),   // Row 2
	new Vector3(-0.5, 0, 1),
	new Vector3(0.5, 0, 1),
	new Vector3(1.5, 0, 1),
];

export function createRollerCoaster() {
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
	
	setupMultiRide(folder, car, path, exitRemote);
	
	print("🎢 Rainbow Coaster ready! Fits 8 riders! E = EXIT");
}

function generatePath(): Vector3[] {
	const pts: Vector3[] = [];
	const b = COASTER_POSITION;
	
	pts.push(b.add(new Vector3(0, 3, 0)));
	pts.push(b.add(new Vector3(8, 3.5, 0)));
	pts.push(b.add(new Vector3(16, 4.5, 0)));
	pts.push(b.add(new Vector3(24, 7, 0)));
	pts.push(b.add(new Vector3(32, 14, 2)));
	pts.push(b.add(new Vector3(40, 24, 4)));
	pts.push(b.add(new Vector3(48, 36, 6)));
	pts.push(b.add(new Vector3(56, 48, 8)));
	pts.push(b.add(new Vector3(64, 55, 10)));
	pts.push(b.add(new Vector3(72, 50, 15)));
	pts.push(b.add(new Vector3(80, 38, 22)));
	pts.push(b.add(new Vector3(86, 22, 30)));
	pts.push(b.add(new Vector3(90, 12, 38)));
	pts.push(b.add(new Vector3(88, 10, 48)));
	pts.push(b.add(new Vector3(80, 11, 55)));
	pts.push(b.add(new Vector3(68, 13, 58)));
	pts.push(b.add(new Vector3(54, 15, 54)));
	pts.push(b.add(new Vector3(42, 22, 46)));
	pts.push(b.add(new Vector3(34, 18, 38)));
	pts.push(b.add(new Vector3(26, 12, 28)));
	pts.push(b.add(new Vector3(18, 8, 18)));
	pts.push(b.add(new Vector3(10, 5, 10)));
	pts.push(b.add(new Vector3(2, 3.5, 2)));
	pts.push(b.add(new Vector3(-4, 3, -4)));
	
	return pts;
}

function createStation(parent: Folder) {
	const platform = new Instance("Part");
	platform.Name = "StationPlatform";
	platform.Size = new Vector3(25, 3, 25);
	platform.Position = COASTER_POSITION.add(new Vector3(0, 1.5, 0));
	platform.BrickColor = new BrickColor("Dark stone grey");
	platform.Material = Enum.Material.Concrete;
	platform.Anchored = true;
	platform.Parent = parent;
	
	const exitPad = new Instance("Part");
	exitPad.Name = "ExitPad";
	exitPad.Size = new Vector3(15, 1, 15);
	exitPad.Position = COASTER_POSITION.add(new Vector3(0, 3.5, -15));
	exitPad.BrickColor = new BrickColor("Bright green");
	exitPad.Material = Enum.Material.SmoothPlastic;
	exitPad.Anchored = true;
	exitPad.Parent = parent;
	
	const sign = new Instance("Part");
	sign.Name = "Sign";
	sign.Size = new Vector3(16, 6, 0.5);
	sign.Position = COASTER_POSITION.add(new Vector3(0, 18, -20));
	sign.Color = Color3.fromRGB(255, 150, 200);
	sign.Material = Enum.Material.Neon;
	sign.Anchored = true;
	sign.Parent = parent;
	
	const gui = new Instance("SurfaceGui");
	gui.Face = Enum.NormalId.Front;
	const lbl = new Instance("TextLabel");
	lbl.Size = new UDim2(1, 0, 1, 0);
	lbl.BackgroundTransparency = 1;
	lbl.Text = "🎢 RAINBOW COASTER 🌈\n8 RIDERS! +25 Coins! E=Exit";
	lbl.TextColor3 = new Color3(1, 1, 1);
	lbl.TextScaled = true;
	lbl.Font = Enum.Font.GothamBold;
	lbl.Parent = gui;
	gui.Parent = sign;
	
	// Rider count display
	const countSign = new Instance("Part");
	countSign.Name = "CountSign";
	countSign.Size = new Vector3(8, 3, 0.3);
	countSign.Position = COASTER_POSITION.add(new Vector3(0, 10, -8));
	countSign.Color = Color3.fromRGB(50, 50, 80);
	countSign.Material = Enum.Material.SmoothPlastic;
	countSign.Anchored = true;
	countSign.Parent = parent;
	
	const countGui = new Instance("SurfaceGui");
	countGui.Name = "CountGui";
	countGui.Face = Enum.NormalId.Front;
	const countLbl = new Instance("TextLabel");
	countLbl.Name = "CountLabel";
	countLbl.Size = new UDim2(1, 0, 1, 0);
	countLbl.BackgroundTransparency = 1;
	countLbl.Text = "🎫 0/8 Boarding...";
	countLbl.TextColor3 = Color3.fromRGB(100, 255, 150);
	countLbl.TextScaled = true;
	countLbl.Font = Enum.Font.GothamBold;
	countLbl.Parent = countGui;
	countGui.Parent = countSign;
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
	// Bigger car for 8 riders (2 rows of 4)
	const car = new Instance("Part");
	car.Name = "CoasterCar";
	car.Size = new Vector3(8, 2.5, 8);
	car.Color = Color3.fromRGB(255, 100, 150);
	car.Material = Enum.Material.SmoothPlastic;
	car.Anchored = true;
	car.CanCollide = false;
	car.CastShadow = false;
	car.Position = COASTER_POSITION.add(new Vector3(0, 5, 0));
	car.Parent = parent;
	
	// Seats visual (2 rows)
	for (let row = 0; row < 2; row++) {
		const seatRow = new Instance("Part");
		seatRow.Name = `SeatRow${row}`;
		seatRow.Size = new Vector3(6, 0.5, 2);
		seatRow.Color = Color3.fromRGB(80, 80, 100);
		seatRow.Material = Enum.Material.Fabric;
		seatRow.Anchored = true;
		seatRow.CanCollide = false;
		seatRow.CastShadow = false;
		seatRow.Parent = car;
	}
	
	const sp = new Instance("ParticleEmitter");
	sp.Name = "Sparkle";
	sp.Color = new ColorSequence(Color3.fromRGB(255, 220, 255));
	sp.Size = new NumberSequence(0.25, 0);
	sp.LightEmission = 1;
	sp.Rate = 15;
	sp.Lifetime = new NumberRange(0.5);
	sp.Speed = new NumberRange(1);
	sp.Enabled = false;
	sp.Parent = car;
	
	return car;
}

interface RiderInfo {
	player: Player;
	seatIndex: number;
	exited: boolean;
}

function setupMultiRide(parent: Folder, car: Part, path: Vector3[], exitRemote: RemoteEvent) {
	const trigger = new Instance("Part");
	trigger.Name = "BoardTrigger";
	trigger.Size = new Vector3(20, 6, 20);
	trigger.Position = COASTER_POSITION.add(new Vector3(0, 6, 0));
	trigger.Transparency = 1;
	trigger.CanCollide = false;
	trigger.Anchored = true;
	trigger.Parent = parent;
	
	let rideActive = false;
	let boarding = false;
	const riders: RiderInfo[] = [];
	const playersOnRide = new Set<Player>();
	
	// Get count label
	const countSign = parent.FindFirstChild("CountSign") as Part | undefined;
	const countGui = countSign?.FindFirstChild("CountGui") as SurfaceGui | undefined;
	const countLabel = countGui?.FindFirstChild("CountLabel") as TextLabel | undefined;
	
	function updateCountDisplay() {
		if (countLabel) {
			if (boarding) {
				countLabel.Text = `🎫 ${riders.size()}/${MAX_RIDERS} Boarding...`;
				countLabel.TextColor3 = Color3.fromRGB(255, 255, 100);
			} else if (rideActive) {
				countLabel.Text = `🎢 ${riders.size()} Riding!`;
				countLabel.TextColor3 = Color3.fromRGB(100, 200, 255);
			} else {
				countLabel.Text = `✅ Ready! (0/${MAX_RIDERS})`;
				countLabel.TextColor3 = Color3.fromRGB(100, 255, 150);
			}
		}
	}
	
	// E key exit
	exitRemote.OnServerEvent.Connect((player) => {
		const rider = riders.find((r) => r.player === player);
		if (rider && rideActive) {
			rider.exited = true;
			print(`🎢 ${player.Name} exiting!`);
			safeReturn(player);
			playersOnRide.delete(player);
		}
	});
	
	trigger.Touched.Connect((hit) => {
		if (rideActive) return;
		
		const player = Players.GetPlayerFromCharacter(hit.Parent);
		if (!player) return;
		if (playersOnRide.has(player)) return;
		
		const char = player.Character;
		const hum = char?.FindFirstChildOfClass("Humanoid");
		if (!hum) return;
		
		// Add rider if not full
		if (riders.size() < MAX_RIDERS && !riders.find((r) => r.player === player)) {
			const seatIdx = riders.size();
			riders.push({ player, seatIndex: seatIdx, exited: false });
			playersOnRide.add(player);
			
			// Position on car
			const hrp = char?.FindFirstChild("HumanoidRootPart") as Part | undefined;
			if (hrp) {
				hrp.Anchored = true;
				const offset = SEAT_OFFSETS[seatIdx];
				hrp.CFrame = car.CFrame.mul(new CFrame(offset)).mul(new CFrame(0, 2, 0));
			}
			
			print(`🎢 ${player.Name} boarded! Seat ${seatIdx + 1}/${MAX_RIDERS}`);
			updateCountDisplay();
			
			// Start boarding countdown on first rider
			if (!boarding && riders.size() === 1) {
				boarding = true;
				
				// Wait for more riders or timeout
				task.spawn(() => {
					for (let i = BOARDING_TIME; i > 0; i--) {
						if (riders.size() >= MAX_RIDERS) break;
						if (countLabel) {
							countLabel.Text = `🎫 ${riders.size()}/${MAX_RIDERS} - ${i}s`;
						}
						task.wait(1);
					}
					
					// Start ride!
					boarding = false;
					rideActive = true;
					updateCountDisplay();
					
					const sp = car.FindFirstChild("Sparkle") as ParticleEmitter | undefined;
					if (sp) sp.Enabled = true;
					
					print(`🎢 Launching with ${riders.size()} riders!`);
					
					// Run ride
					multiRide(car, path, riders).then(() => {
						if (sp) sp.Enabled = false;
						
						// Return all remaining riders and give rewards
						for (const rider of riders) {
							if (!rider.exited) {
								safeReturn(rider.player);
								
								const ls = rider.player.FindFirstChild("leaderstats") as Folder | undefined;
								const coins = ls?.FindFirstChild("Coins") as IntValue | undefined;
								if (coins) {
									coins.Value += 25;
								}
							}
							playersOnRide.delete(rider.player);
						}
						
						print(`🎢 Ride complete! All riders got +25 coins!`);
						
						// Reset
						riders.clear();
						rideActive = false;
						car.CFrame = new CFrame(COASTER_POSITION.add(new Vector3(0, 5, 0)));
						updateSeats(car);
						updateCountDisplay();
					});
				});
			}
		}
	});
	
	updateCountDisplay();
}

function safeReturn(player: Player) {
	const char = player.Character;
	if (!char) return;
	
	const hrp = char.FindFirstChild("HumanoidRootPart") as Part | undefined;
	const hum = char.FindFirstChildOfClass("Humanoid");
	
	if (hrp) {
		hrp.Anchored = false;
		hrp.AssemblyLinearVelocity = Vector3.zero;
		hrp.AssemblyAngularVelocity = Vector3.zero;
		hrp.CFrame = new CFrame(COASTER_POSITION.add(new Vector3(0, 6, -15)));
	}
	
	if (hum) {
		hum.PlatformStand = false;
	}
}

async function multiRide(car: Part, path: Vector3[], riders: RiderInfo[]): Promise<void> {
	let totalDist = 0;
	for (let i = 0; i < path.size() - 1; i++) {
		totalDist += path[i + 1].sub(path[i]).Magnitude;
	}
	
	let progress = 0;
	
	return new Promise((resolve) => {
		const conn = RunService.Heartbeat.Connect((dt) => {
			// Check if all exited
			const activeRiders = riders.filter((r) => !r.exited);
			if (activeRiders.size() === 0 || progress >= 1) {
				conn.Disconnect();
				resolve();
				return;
			}
			
			// Advance
			progress += (RIDE_SPEED * dt) / totalDist;
			progress = math.min(progress, 1);
			
			// Move car
			const pos = getPathPosition(path, progress);
			const lookAhead = getPathPosition(path, math.min(progress + 0.02, 1));
			const targetCF = CFrame.lookAt(pos.add(new Vector3(0, 2, 0)), lookAhead.add(new Vector3(0, 2, 0)));
			car.CFrame = car.CFrame.Lerp(targetCF, 0.25);
			
			// Update seat positions
			updateSeats(car);
			
			// Move all riders
			for (const rider of activeRiders) {
				const char = rider.player.Character;
				const hrp = char?.FindFirstChild("HumanoidRootPart") as Part | undefined;
				if (hrp) {
					const offset = SEAT_OFFSETS[rider.seatIndex];
					hrp.CFrame = car.CFrame.mul(new CFrame(offset)).mul(new CFrame(0, 2, 0));
				}
			}
		});
	});
}

function updateSeats(car: Part) {
	const seat0 = car.FindFirstChild("SeatRow0") as Part | undefined;
	const seat1 = car.FindFirstChild("SeatRow1") as Part | undefined;
	if (seat0) seat0.CFrame = car.CFrame.mul(new CFrame(0, 0.3, -2));
	if (seat1) seat1.CFrame = car.CFrame.mul(new CFrame(0, 0.3, 1));
}

function getPathPosition(path: Vector3[], t: number): Vector3 {
	if (t <= 0) return path[0];
	if (t >= 1) return path[path.size() - 1];
	
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
