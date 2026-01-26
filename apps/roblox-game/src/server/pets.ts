// Pet System - Cute Animal-Shaped Pets!
// Pink Cat, Blue Dog, Purple Bat - with proper body shapes!
import { Players, Workspace, RunService } from "@rbxts/services";

// Pet configuration
const PET_TYPES = {
	cat: { 
		name: "Pink Cat 🐱", 
		bodyColor: Color3.fromRGB(255, 150, 200),
		eyeColor: Color3.fromRGB(100, 255, 150),
		magnetRange: 10, 
		speed: 1.3,
		bobSpeed: 4,
	},
	dog: { 
		name: "Blue Dog 🐕", 
		bodyColor: Color3.fromRGB(100, 180, 255),
		eyeColor: Color3.fromRGB(80, 50, 20),
		magnetRange: 12, 
		speed: 1.0,
		bobSpeed: 3,
	},
	bat: { 
		name: "Purple Bat 🦇", 
		bodyColor: Color3.fromRGB(180, 100, 255),
		eyeColor: Color3.fromRGB(255, 50, 50),
		magnetRange: 15, 
		speed: 1.5,
		bobSpeed: 6,
	},
};

export type PetType = keyof typeof PET_TYPES;
const playerPets = new Map<Player, Model>();

// Create a cute pet with proper animal shape
export function createPet(player: Player, petType: PetType = "cat"): Model | undefined {
	const character = player.Character;
	if (!character) return undefined;
	
	removePet(player);
	const config = PET_TYPES[petType];
	
	const pet = new Instance("Model");
	pet.Name = `Pet_${player.Name}`;
	
	if (petType === "cat") {
		createCatBody(pet, config);
	} else if (petType === "dog") {
		createDogBody(pet, config);
	} else if (petType === "bat") {
		createBatBody(pet, config);
	}
	
	// Add sparkles
	const body = pet.PrimaryPart!;
	const sparkle = new Instance("ParticleEmitter");
	sparkle.Color = new ColorSequence(config.bodyColor);
	sparkle.LightEmission = 0.8;
	sparkle.Size = new NumberSequence(0.1, 0);
	sparkle.Rate = 5;
	sparkle.Lifetime = new NumberRange(0.5, 1);
	sparkle.Speed = new NumberRange(0.5, 1);
	sparkle.Parent = body;
	
	// Glow
	const light = new Instance("PointLight");
	light.Brightness = 0.5;
	light.Range = 6;
	light.Color = config.bodyColor;
	light.Parent = body;
	
	// Position near player
	const hrp = character.FindFirstChild("HumanoidRootPart") as Part | undefined;
	if (hrp) {
		body.Position = hrp.Position.add(new Vector3(3, 2, 3));
	}
	
	pet.Parent = Workspace;
	playerPets.set(player, pet);
	
	startPetFollow(player, pet, config, petType);
	startCoinMagnet(player, body as Part, config.magnetRange);
	
	print(`✨ ${config.name} is now following ${player.Name}!`);
	return pet;
}

// ==================== CAT ====================
function createCatBody(pet: Model, config: typeof PET_TYPES["cat"]) {
	// Head (oval)
	const head = new Instance("Part");
	head.Name = "Head";
	head.Size = new Vector3(1.8, 1.5, 1.6);
	head.Color = config.bodyColor;
	head.Material = Enum.Material.SmoothPlastic;
	head.CanCollide = false;
	head.Anchored = true;
	head.Parent = pet;
	pet.PrimaryPart = head;
	
	// Body (longer oval)
	const body = new Instance("Part");
	body.Name = "Body";
	body.Size = new Vector3(1.4, 1.2, 2);
	body.Color = config.bodyColor;
	body.Material = Enum.Material.SmoothPlastic;
	body.CanCollide = false;
	body.Anchored = true;
	body.Parent = pet;
	
	// Cute big eyes
	createCuteEyes(pet, head, config.eyeColor, 0.35);
	
	// Pink nose (tiny triangle)
	const nose = new Instance("WedgePart");
	nose.Name = "Nose";
	nose.Size = new Vector3(0.2, 0.15, 0.15);
	nose.Color = Color3.fromRGB(255, 120, 150);
	nose.Material = Enum.Material.SmoothPlastic;
	nose.CanCollide = false;
	nose.Anchored = true;
	nose.Parent = pet;
	
	// POINTY CAT EARS! 🐱
	const rightEar = new Instance("WedgePart");
	rightEar.Name = "RightEar";
	rightEar.Size = new Vector3(0.4, 0.7, 0.5);
	rightEar.Color = config.bodyColor;
	rightEar.Material = Enum.Material.SmoothPlastic;
	rightEar.CanCollide = false;
	rightEar.Anchored = true;
	rightEar.Parent = pet;
	
	// Inner ear pink
	const rightEarInner = new Instance("WedgePart");
	rightEarInner.Name = "RightEarInner";
	rightEarInner.Size = new Vector3(0.2, 0.4, 0.3);
	rightEarInner.Color = Color3.fromRGB(255, 180, 200);
	rightEarInner.Material = Enum.Material.SmoothPlastic;
	rightEarInner.CanCollide = false;
	rightEarInner.Anchored = true;
	rightEarInner.Parent = pet;
	
	const leftEar = rightEar.Clone();
	leftEar.Name = "LeftEar";
	leftEar.Parent = pet;
	
	const leftEarInner = rightEarInner.Clone();
	leftEarInner.Name = "LeftEarInner";
	leftEarInner.Parent = pet;
	
	// Curly tail
	for (let i = 0; i < 5; i++) {
		const tail = new Instance("Part");
		tail.Name = `Tail${i}`;
		tail.Size = new Vector3(0.25 - i * 0.03, 0.25 - i * 0.03, 0.3);
		tail.Color = config.bodyColor;
		tail.Material = Enum.Material.SmoothPlastic;
		tail.Shape = Enum.PartType.Ball;
		tail.CanCollide = false;
		tail.Anchored = true;
		tail.Parent = pet;
	}
	
	// Whiskers (thin parts)
	createWhiskers(pet, config.bodyColor);
}

// ==================== DOG ====================
function createDogBody(pet: Model, config: typeof PET_TYPES["dog"]) {
	// Head (rounder)
	const head = new Instance("Part");
	head.Name = "Head";
	head.Size = new Vector3(1.8, 1.6, 1.7);
	head.Color = config.bodyColor;
	head.Material = Enum.Material.SmoothPlastic;
	head.CanCollide = false;
	head.Anchored = true;
	head.Parent = pet;
	pet.PrimaryPart = head;
	
	// Snout
	const snout = new Instance("Part");
	snout.Name = "Snout";
	snout.Size = new Vector3(0.8, 0.6, 0.7);
	snout.Color = config.bodyColor;
	snout.Material = Enum.Material.SmoothPlastic;
	snout.CanCollide = false;
	snout.Anchored = true;
	snout.Parent = pet;
	
	// Body
	const body = new Instance("Part");
	body.Name = "Body";
	body.Size = new Vector3(1.5, 1.3, 2.2);
	body.Color = config.bodyColor;
	body.Material = Enum.Material.SmoothPlastic;
	body.CanCollide = false;
	body.Anchored = true;
	body.Parent = pet;
	
	// Cute eyes
	createCuteEyes(pet, head, config.eyeColor, 0.4);
	
	// Black nose
	const nose = new Instance("Part");
	nose.Name = "Nose";
	nose.Size = new Vector3(0.3, 0.25, 0.2);
	nose.Color = Color3.fromRGB(30, 30, 30);
	nose.Material = Enum.Material.SmoothPlastic;
	nose.Shape = Enum.PartType.Ball;
	nose.CanCollide = false;
	nose.Anchored = true;
	nose.Parent = pet;
	
	// FLOPPY DOG EARS! 🐕
	const rightEar = new Instance("Part");
	rightEar.Name = "RightEar";
	rightEar.Size = new Vector3(0.5, 0.9, 0.3);
	rightEar.Color = config.bodyColor;
	rightEar.Material = Enum.Material.SmoothPlastic;
	rightEar.CanCollide = false;
	rightEar.Anchored = true;
	rightEar.Parent = pet;
	
	const leftEar = rightEar.Clone();
	leftEar.Name = "LeftEar";
	leftEar.Parent = pet;
	
	// Wagging tail
	const tail = new Instance("Part");
	tail.Name = "Tail";
	tail.Size = new Vector3(0.3, 0.3, 0.8);
	tail.Color = config.bodyColor;
	tail.Material = Enum.Material.SmoothPlastic;
	tail.CanCollide = false;
	tail.Anchored = true;
	tail.Parent = pet;
	
	// Tongue (cute!)
	const tongue = new Instance("Part");
	tongue.Name = "Tongue";
	tongue.Size = new Vector3(0.3, 0.08, 0.4);
	tongue.Color = Color3.fromRGB(255, 120, 150);
	tongue.Material = Enum.Material.SmoothPlastic;
	tongue.CanCollide = false;
	tongue.Anchored = true;
	tongue.Parent = pet;
}

// ==================== BAT ====================
function createBatBody(pet: Model, config: typeof PET_TYPES["bat"]) {
	// Head (round with fuzzy look)
	const head = new Instance("Part");
	head.Name = "Head";
	head.Size = new Vector3(1.6, 1.4, 1.4);
	head.Color = config.bodyColor;
	head.Material = Enum.Material.SmoothPlastic;
	head.CanCollide = false;
	head.Anchored = true;
	head.Parent = pet;
	pet.PrimaryPart = head;
	
	// Small body
	const body = new Instance("Part");
	body.Name = "Body";
	body.Size = new Vector3(1.2, 1, 1.4);
	body.Color = config.bodyColor;
	body.Material = Enum.Material.SmoothPlastic;
	body.CanCollide = false;
	body.Anchored = true;
	body.Parent = pet;
	
	// Big cute red eyes
	createCuteEyes(pet, head, config.eyeColor, 0.45);
	
	// Tiny nose
	const nose = new Instance("Part");
	nose.Name = "Nose";
	nose.Size = new Vector3(0.15, 0.12, 0.1);
	nose.Color = Color3.fromRGB(100, 50, 80);
	nose.Material = Enum.Material.SmoothPlastic;
	nose.Shape = Enum.PartType.Ball;
	nose.CanCollide = false;
	nose.Anchored = true;
	nose.Parent = pet;
	
	// BIG POINTY BAT EARS! 🦇
	const rightEar = new Instance("WedgePart");
	rightEar.Name = "RightEar";
	rightEar.Size = new Vector3(0.3, 1.2, 0.7);
	rightEar.Color = config.bodyColor;
	rightEar.Material = Enum.Material.SmoothPlastic;
	rightEar.CanCollide = false;
	rightEar.Anchored = true;
	rightEar.Parent = pet;
	
	const leftEar = rightEar.Clone();
	leftEar.Name = "LeftEar";
	leftEar.Parent = pet;
	
	// WINGS! 🦇
	const rightWing = new Instance("Part");
	rightWing.Name = "RightWing";
	rightWing.Size = new Vector3(0.08, 1.2, 2);
	rightWing.Color = config.bodyColor;
	rightWing.Material = Enum.Material.Neon;
	rightWing.Transparency = 0.2;
	rightWing.CanCollide = false;
	rightWing.Anchored = true;
	rightWing.Parent = pet;
	
	const leftWing = rightWing.Clone();
	leftWing.Name = "LeftWing";
	leftWing.Parent = pet;
	
	// Little fangs
	const rightFang = new Instance("WedgePart");
	rightFang.Name = "RightFang";
	rightFang.Size = new Vector3(0.08, 0.15, 0.08);
	rightFang.Color = Color3.fromRGB(255, 255, 255);
	rightFang.Material = Enum.Material.SmoothPlastic;
	rightFang.CanCollide = false;
	rightFang.Anchored = true;
	rightFang.Parent = pet;
	
	const leftFang = rightFang.Clone();
	leftFang.Name = "LeftFang";
	leftFang.Parent = pet;
}

// ==================== SHARED ====================
function createCuteEyes(pet: Model, head: Part, eyeColor: Color3, size: number) {
	// Big white eyes
	const rightEyeWhite = new Instance("Part");
	rightEyeWhite.Name = "RightEyeWhite";
	rightEyeWhite.Size = new Vector3(size, size * 1.3, size * 0.5);
	rightEyeWhite.Color = Color3.fromRGB(255, 255, 255);
	rightEyeWhite.Material = Enum.Material.SmoothPlastic;
	rightEyeWhite.Shape = Enum.PartType.Ball;
	rightEyeWhite.CanCollide = false;
	rightEyeWhite.Anchored = true;
	rightEyeWhite.Parent = pet;
	
	const leftEyeWhite = rightEyeWhite.Clone();
	leftEyeWhite.Name = "LeftEyeWhite";
	leftEyeWhite.Parent = pet;
	
	// Colored iris
	const rightIris = new Instance("Part");
	rightIris.Name = "RightIris";
	rightIris.Size = new Vector3(size * 0.6, size * 0.8, size * 0.3);
	rightIris.Color = eyeColor;
	rightIris.Material = Enum.Material.Neon;
	rightIris.Shape = Enum.PartType.Ball;
	rightIris.CanCollide = false;
	rightIris.Anchored = true;
	rightIris.Parent = pet;
	
	const leftIris = rightIris.Clone();
	leftIris.Name = "LeftIris";
	leftIris.Parent = pet;
	
	// Black pupil
	const rightPupil = new Instance("Part");
	rightPupil.Name = "RightPupil";
	rightPupil.Size = new Vector3(size * 0.3, size * 0.4, size * 0.2);
	rightPupil.Color = Color3.fromRGB(0, 0, 0);
	rightPupil.Material = Enum.Material.SmoothPlastic;
	rightPupil.Shape = Enum.PartType.Ball;
	rightPupil.CanCollide = false;
	rightPupil.Anchored = true;
	rightPupil.Parent = pet;
	
	const leftPupil = rightPupil.Clone();
	leftPupil.Name = "LeftPupil";
	leftPupil.Parent = pet;
	
	// Cute sparkle/shine in eyes!
	const rightShine = new Instance("Part");
	rightShine.Name = "RightShine";
	rightShine.Size = new Vector3(size * 0.15, size * 0.15, size * 0.1);
	rightShine.Color = Color3.fromRGB(255, 255, 255);
	rightShine.Material = Enum.Material.Neon;
	rightShine.Shape = Enum.PartType.Ball;
	rightShine.CanCollide = false;
	rightShine.Anchored = true;
	rightShine.Parent = pet;
	
	const leftShine = rightShine.Clone();
	leftShine.Name = "LeftShine";
	leftShine.Parent = pet;
}

function createWhiskers(pet: Model, _color: Color3) {
	for (let side = -1; side <= 1; side += 2) {
		for (let i = 0; i < 3; i++) {
			const whisker = new Instance("Part");
			whisker.Name = `Whisker_${side}_${i}`;
			whisker.Size = new Vector3(0.5, 0.02, 0.02);
			whisker.Color = Color3.fromRGB(50, 50, 50);
			whisker.Material = Enum.Material.SmoothPlastic;
			whisker.CanCollide = false;
			whisker.Anchored = true;
			whisker.Parent = pet;
		}
	}
}

// Pet follow behavior - positions all parts relative to head
function startPetFollow(player: Player, pet: Model, config: typeof PET_TYPES[PetType], petType: PetType) {
	const followOffset = new Vector3(3, 2.5, 3);
	let bobPhase = 0;
	let wingPhase = 0;
	let tailWagPhase = 0;
	
	const head = pet.PrimaryPart;
	if (!head) return;
	
	const connection = RunService.Heartbeat.Connect((dt) => {
		const character = player.Character;
		const hrp = character?.FindFirstChild("HumanoidRootPart") as Part | undefined;
		
		if (!hrp || !pet.Parent) {
			connection.Disconnect();
			return;
		}
		
		bobPhase += dt * config.bobSpeed;
		wingPhase += dt * 12;
		tailWagPhase += dt * 8;
		
		const bobHeight = math.sin(bobPhase) * 0.3;
		const targetPos = hrp.Position.add(followOffset);
		const newPos = head.Position.Lerp(targetPos.add(new Vector3(0, bobHeight, 0)), dt * 5 * config.speed);
		
		// Look at owner!
		const lookCFrame = CFrame.lookAt(newPos, hrp.Position);
		head.CFrame = lookCFrame;
		
		// Position all parts relative to head
		const body = pet.FindFirstChild("Body") as Part | undefined;
		if (body) {
			body.CFrame = head.CFrame.mul(new CFrame(0, -0.2, 0.9));
		}
		
		// Position eyes to look at owner
		positionEyes(pet, head as Part);
		
		// Position ears
		positionEars(pet, head as Part, petType);
		
		// Position nose
		const nose = pet.FindFirstChild("Nose") as Part | undefined;
		if (nose) {
			if (petType === "dog") {
				const snout = pet.FindFirstChild("Snout") as Part | undefined;
				if (snout) {
					snout.CFrame = head.CFrame.mul(new CFrame(0, -0.2, -0.8));
					nose.CFrame = snout.CFrame.mul(new CFrame(0, 0.1, -0.3));
				}
			} else {
				nose.CFrame = head.CFrame.mul(new CFrame(0, -0.2, -0.75));
			}
		}
		
		// Animate tail
		if (petType === "cat") {
			for (let i = 0; i < 5; i++) {
				const tail = pet.FindFirstChild(`Tail${i}`) as Part | undefined;
				if (tail && body) {
					const curve = math.sin(tailWagPhase + i * 0.5) * 0.2;
					tail.CFrame = body.CFrame.mul(new CFrame(curve, 0.3 + i * 0.25, 0.8 + i * 0.2));
				}
			}
		} else if (petType === "dog") {
			const tail = pet.FindFirstChild("Tail") as Part | undefined;
			const tongue = pet.FindFirstChild("Tongue") as Part | undefined;
			if (tail && body) {
				const wag = math.sin(tailWagPhase) * 0.4;
				tail.CFrame = body.CFrame.mul(new CFrame(wag, 0.3, 1)).mul(CFrame.Angles(0.5, wag, 0));
			}
			if (tongue) {
				tongue.CFrame = head.CFrame.mul(new CFrame(0, -0.5, -0.6));
			}
		}
		
		// Animate wings for bat
		if (petType === "bat") {
			const rightWing = pet.FindFirstChild("RightWing") as Part | undefined;
			const leftWing = pet.FindFirstChild("LeftWing") as Part | undefined;
			const wingFlap = math.sin(wingPhase) * 0.4;
			if (rightWing && body) {
				rightWing.CFrame = body.CFrame.mul(new CFrame(0.8, 0.2, 0)).mul(CFrame.Angles(0, 0, 0.3 + wingFlap));
			}
			if (leftWing && body) {
				leftWing.CFrame = body.CFrame.mul(new CFrame(-0.8, 0.2, 0)).mul(CFrame.Angles(0, 0, -0.3 - wingFlap));
			}
			
			// Position fangs
			const rightFang = pet.FindFirstChild("RightFang") as Part | undefined;
			const leftFang = pet.FindFirstChild("LeftFang") as Part | undefined;
			if (rightFang) rightFang.CFrame = head.CFrame.mul(new CFrame(0.15, -0.5, -0.5));
			if (leftFang) leftFang.CFrame = head.CFrame.mul(new CFrame(-0.15, -0.5, -0.5));
		}
		
		// Whiskers for cat
		if (petType === "cat") {
			let idx = 0;
			for (let side = -1; side <= 1; side += 2) {
				for (let i = 0; i < 3; i++) {
					const whisker = pet.FindFirstChild(`Whisker_${side}_${i}`) as Part | undefined;
					if (whisker) {
						const yOffset = -0.15 + i * 0.1;
						whisker.CFrame = head.CFrame.mul(new CFrame(side * 0.5, yOffset, -0.5)).mul(CFrame.Angles(0, side * 0.3, i * 0.1 - 0.1));
					}
					idx++;
				}
			}
		}
	});
	
	player.AncestryChanged.Connect(() => {
		if (!player.Parent) {
			connection.Disconnect();
			pet.Destroy();
			playerPets.delete(player);
		}
	});
}

function positionEyes(pet: Model, head: Part) {
	const parts = ["RightEyeWhite", "LeftEyeWhite", "RightIris", "LeftIris", "RightPupil", "LeftPupil", "RightShine", "LeftShine"];
	const offsets: Record<string, Vector3> = {
		"RightEyeWhite": new Vector3(0.35, 0.15, -0.7),
		"LeftEyeWhite": new Vector3(-0.35, 0.15, -0.7),
		"RightIris": new Vector3(0.35, 0.15, -0.82),
		"LeftIris": new Vector3(-0.35, 0.15, -0.82),
		"RightPupil": new Vector3(0.35, 0.15, -0.88),
		"LeftPupil": new Vector3(-0.35, 0.15, -0.88),
		"RightShine": new Vector3(0.42, 0.25, -0.9),
		"LeftShine": new Vector3(-0.28, 0.25, -0.9),
	};
	
	for (const name of parts) {
		const part = pet.FindFirstChild(name) as Part | undefined;
		if (part && offsets[name]) {
			part.CFrame = head.CFrame.mul(new CFrame(offsets[name]));
		}
	}
}

function positionEars(pet: Model, head: Part, petType: PetType) {
	const rightEar = pet.FindFirstChild("RightEar") as Part | undefined;
	const leftEar = pet.FindFirstChild("LeftEar") as Part | undefined;
	
	if (petType === "cat") {
		if (rightEar) rightEar.CFrame = head.CFrame.mul(new CFrame(0.5, 0.7, -0.1)).mul(CFrame.Angles(0, 0, -0.3));
		if (leftEar) leftEar.CFrame = head.CFrame.mul(new CFrame(-0.5, 0.7, -0.1)).mul(CFrame.Angles(0, 0, 0.3));
		
		const rightInner = pet.FindFirstChild("RightEarInner") as Part | undefined;
		const leftInner = pet.FindFirstChild("LeftEarInner") as Part | undefined;
		if (rightInner) rightInner.CFrame = head.CFrame.mul(new CFrame(0.5, 0.65, -0.15)).mul(CFrame.Angles(0, 0, -0.3));
		if (leftInner) leftInner.CFrame = head.CFrame.mul(new CFrame(-0.5, 0.65, -0.15)).mul(CFrame.Angles(0, 0, 0.3));
	} else if (petType === "dog") {
		// Floppy ears hang down
		if (rightEar) rightEar.CFrame = head.CFrame.mul(new CFrame(0.7, 0.1, 0)).mul(CFrame.Angles(0, 0, 0.8));
		if (leftEar) leftEar.CFrame = head.CFrame.mul(new CFrame(-0.7, 0.1, 0)).mul(CFrame.Angles(0, 0, -0.8));
	} else if (petType === "bat") {
		// Big pointy bat ears
		if (rightEar) rightEar.CFrame = head.CFrame.mul(new CFrame(0.5, 0.85, -0.1)).mul(CFrame.Angles(0, 0, -0.2));
		if (leftEar) leftEar.CFrame = head.CFrame.mul(new CFrame(-0.5, 0.85, -0.1)).mul(CFrame.Angles(0, 0, 0.2));
	}
}

function startCoinMagnet(player: Player, petBody: Part, magnetRange: number) {
	const connection = RunService.Heartbeat.Connect((dt) => {
		const character = player.Character;
		const hrp = character?.FindFirstChild("HumanoidRootPart") as Part | undefined;
		
		if (!hrp || !petBody.Parent) {
			connection.Disconnect();
			return;
		}
		
		const coins = Workspace.GetChildren().filter((child) => child.Name === "Coin" && child.IsA("Part"));
		
		for (const coin of coins as Part[]) {
			const distance = (coin.Position.sub(petBody.Position)).Magnitude;
			if (distance < magnetRange) {
				const direction = hrp.Position.sub(coin.Position).Unit;
				coin.Position = coin.Position.add(direction.mul(20 * dt));
			}
		}
	});
}

export function removePet(player: Player) {
	const pet = playerPets.get(player);
	if (pet) {
		pet.Destroy();
		playerPets.delete(player);
	}
}

export function hasPet(player: Player): boolean {
	return playerPets.has(player);
}

export function getPetTypes(): PetType[] {
	return ["cat", "dog", "bat"];
}
