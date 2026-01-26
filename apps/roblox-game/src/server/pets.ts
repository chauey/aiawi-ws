// Pet System - PRODUCTION QUALITY Pets!
// Ultra-smooth, adorable, viral-worthy designs with maximum visual appeal
import { Players, Workspace, RunService } from "@rbxts/services";

// Pet configuration with enhanced visuals
const PET_TYPES = {
	cat: { 
		name: "Pink Cat 🐱", 
		bodyColor: Color3.fromRGB(255, 180, 210),
		accentColor: Color3.fromRGB(255, 130, 180),
		eyeColor: Color3.fromRGB(120, 255, 180),
		glowColor: Color3.fromRGB(255, 200, 230),
		magnetRange: 10, 
		speed: 1.3,
		bobSpeed: 4,
		scale: 1.0,
	},
	dog: { 
		name: "Blue Dog 🐕", 
		bodyColor: Color3.fromRGB(130, 200, 255),
		accentColor: Color3.fromRGB(80, 150, 220),
		eyeColor: Color3.fromRGB(100, 70, 40),
		glowColor: Color3.fromRGB(180, 220, 255),
		magnetRange: 12, 
		speed: 1.0,
		bobSpeed: 3,
		scale: 1.1,
	},
	bat: { 
		name: "Purple Bat 🦇", 
		bodyColor: Color3.fromRGB(180, 120, 255),
		accentColor: Color3.fromRGB(120, 60, 200),
		eyeColor: Color3.fromRGB(255, 80, 80),
		glowColor: Color3.fromRGB(200, 150, 255),
		magnetRange: 15, 
		speed: 1.5,
		bobSpeed: 6,
		scale: 0.9,
	},
	dragon: { 
		name: "Silver Dragon 🐉", 
		bodyColor: Color3.fromRGB(220, 220, 240),
		accentColor: Color3.fromRGB(180, 180, 200),
		eyeColor: Color3.fromRGB(255, 180, 50),
		glowColor: Color3.fromRGB(255, 200, 100),
		magnetRange: 18, 
		speed: 1.4,
		bobSpeed: 3,
		scale: 1.3,
	},
	unicorn: { 
		name: "Rainbow Unicorn 🦄", 
		bodyColor: Color3.fromRGB(255, 255, 255),
		accentColor: Color3.fromRGB(255, 200, 255),
		eyeColor: Color3.fromRGB(200, 130, 255),
		glowColor: Color3.fromRGB(255, 220, 255),
		magnetRange: 14, 
		speed: 1.2,
		bobSpeed: 5,
		scale: 1.1,
	},
};

export type PetType = keyof typeof PET_TYPES;
const playerPets = new Map<Player, Model>();

// ==================== MAIN CREATE FUNCTION ====================
export function createPet(player: Player, petType: PetType = "cat"): Model | undefined {
	const character = player.Character;
	if (!character) return undefined;
	
	removePet(player);
	const config = PET_TYPES[petType];
	const s = config.scale;
	
	const pet = new Instance("Model");
	pet.Name = `Pet_${player.Name}`;
	
	// Create smooth, rounded body based on pet type
	const head = createSmoothHead(pet, config, s);
	const body = createSmoothBody(pet, config, s);
	createAdorableEyes(pet, config, s);
	createCuteNose(pet, config, s, petType);
	createSoftBlush(pet, config, s);
	
	// Type-specific features
	if (petType === "cat") {
		createCatFeatures(pet, config, s);
	} else if (petType === "dog") {
		createDogFeatures(pet, config, s);
	} else if (petType === "bat") {
		createBatFeatures(pet, config, s);
	} else if (petType === "dragon") {
		createDragonFeatures(pet, config, s);
	} else if (petType === "unicorn") {
		createUnicornFeatures(pet, config, s);
	}
	
	// Add magical aura & particles
	addMagicalEffects(pet, head, config);
	
	// Position near player
	const hrp = character.FindFirstChild("HumanoidRootPart") as Part | undefined;
	if (hrp) {
		head.Position = hrp.Position.add(new Vector3(3, 2.5, 3));
	}
	
	pet.Parent = Workspace;
	playerPets.set(player, pet);
	
	startPetFollow(player, pet, config, petType);
	startCoinMagnet(player, head as Part, config.magnetRange);
	
	print(`✨ ${config.name} is now following ${player.Name}!`);
	return pet;
}

// ==================== SMOOTH BASE SHAPES ====================
function createSmoothHead(pet: Model, config: typeof PET_TYPES[PetType], s: number): Part {
	// Main head - perfectly smooth sphere
	const head = new Instance("Part");
	head.Name = "Head";
	head.Size = new Vector3(2.2 * s, 2 * s, 2 * s);
	head.Color = config.bodyColor;
	head.Material = Enum.Material.SmoothPlastic;
	head.Shape = Enum.PartType.Ball;
	head.CanCollide = false;
	head.Anchored = true;
	head.Parent = pet;
	pet.PrimaryPart = head;
	
	// Subtle highlight on top for 3D depth
	const highlight = new Instance("Part");
	highlight.Name = "HeadHighlight";
	highlight.Size = new Vector3(1.4 * s, 0.6 * s, 1.4 * s);
	highlight.Color = Color3.fromRGB(255, 255, 255);
	highlight.Material = Enum.Material.SmoothPlastic;
	highlight.Shape = Enum.PartType.Ball;
	highlight.Transparency = 0.7;
	highlight.CanCollide = false;
	highlight.Anchored = true;
	highlight.Parent = pet;
	
	return head;
}

function createSmoothBody(pet: Model, config: typeof PET_TYPES[PetType], s: number): Part {
	// Chubby oval body - smooth and adorable
	const body = new Instance("Part");
	body.Name = "Body";
	body.Size = new Vector3(1.8 * s, 1.6 * s, 2.4 * s);
	body.Color = config.bodyColor;
	body.Material = Enum.Material.SmoothPlastic;
	body.Shape = Enum.PartType.Ball;
	body.CanCollide = false;
	body.Anchored = true;
	body.Parent = pet;
	
	// Body highlight
	const bodyHighlight = new Instance("Part");
	bodyHighlight.Name = "BodyHighlight";
	bodyHighlight.Size = new Vector3(1 * s, 0.8 * s, 1.2 * s);
	bodyHighlight.Color = Color3.fromRGB(255, 255, 255);
	bodyHighlight.Material = Enum.Material.SmoothPlastic;
	bodyHighlight.Shape = Enum.PartType.Ball;
	bodyHighlight.Transparency = 0.75;
	bodyHighlight.CanCollide = false;
	bodyHighlight.Anchored = true;
	bodyHighlight.Parent = pet;
	
	return body;
}

// ==================== ADORABLE EYES ====================
function createAdorableEyes(pet: Model, config: typeof PET_TYPES[PetType], s: number) {
	// BIG anime-style eyes for maximum cuteness
	for (let side = -1; side <= 1; side += 2) {
		const xOff = 0.45 * s * side;
		
		// White of eye (large and round)
		const eyeWhite = new Instance("Part");
		eyeWhite.Name = side > 0 ? "RightEyeWhite" : "LeftEyeWhite";
		eyeWhite.Size = new Vector3(0.55 * s, 0.7 * s, 0.35 * s);
		eyeWhite.Color = Color3.fromRGB(255, 255, 255);
		eyeWhite.Material = Enum.Material.SmoothPlastic;
		eyeWhite.Shape = Enum.PartType.Ball;
		eyeWhite.CanCollide = false;
		eyeWhite.Anchored = true;
		eyeWhite.Parent = pet;
		
		// Colored iris (glowing)
		const iris = new Instance("Part");
		iris.Name = side > 0 ? "RightIris" : "LeftIris";
		iris.Size = new Vector3(0.35 * s, 0.45 * s, 0.2 * s);
		iris.Color = config.eyeColor;
		iris.Material = Enum.Material.Neon;
		iris.Shape = Enum.PartType.Ball;
		iris.CanCollide = false;
		iris.Anchored = true;
		iris.Parent = pet;
		
		// Black pupil
		const pupil = new Instance("Part");
		pupil.Name = side > 0 ? "RightPupil" : "LeftPupil";
		pupil.Size = new Vector3(0.18 * s, 0.22 * s, 0.12 * s);
		pupil.Color = Color3.fromRGB(0, 0, 0);
		pupil.Material = Enum.Material.SmoothPlastic;
		pupil.Shape = Enum.PartType.Ball;
		pupil.CanCollide = false;
		pupil.Anchored = true;
		pupil.Parent = pet;
		
		// SPARKLE SHINE (key to cute look!)
		const shine1 = new Instance("Part");
		shine1.Name = side > 0 ? "RightShine1" : "LeftShine1";
		shine1.Size = new Vector3(0.12 * s, 0.12 * s, 0.06 * s);
		shine1.Color = Color3.fromRGB(255, 255, 255);
		shine1.Material = Enum.Material.Neon;
		shine1.Shape = Enum.PartType.Ball;
		shine1.CanCollide = false;
		shine1.Anchored = true;
		shine1.Parent = pet;
		
		// Second smaller sparkle
		const shine2 = new Instance("Part");
		shine2.Name = side > 0 ? "RightShine2" : "LeftShine2";
		shine2.Size = new Vector3(0.06 * s, 0.06 * s, 0.04 * s);
		shine2.Color = Color3.fromRGB(255, 255, 255);
		shine2.Material = Enum.Material.Neon;
		shine2.Shape = Enum.PartType.Ball;
		shine2.CanCollide = false;
		shine2.Anchored = true;
		shine2.Parent = pet;
	}
}

function createCuteNose(pet: Model, config: typeof PET_TYPES[PetType], s: number, petType: PetType) {
	const nose = new Instance("Part");
	nose.Name = "Nose";
	
	if (petType === "dog" || petType === "dragon") {
		// Rounded triangle nose
		nose.Size = new Vector3(0.25 * s, 0.2 * s, 0.15 * s);
		nose.Color = Color3.fromRGB(40, 40, 40);
	} else {
		// Tiny pink nose
		nose.Size = new Vector3(0.18 * s, 0.14 * s, 0.1 * s);
		nose.Color = Color3.fromRGB(255, 150, 180);
	}
	
	nose.Material = Enum.Material.SmoothPlastic;
	nose.Shape = Enum.PartType.Ball;
	nose.CanCollide = false;
	nose.Anchored = true;
	nose.Parent = pet;
	
	// Nose shine
	const noseShine = new Instance("Part");
	noseShine.Name = "NoseShine";
	noseShine.Size = new Vector3(0.06 * s, 0.06 * s, 0.04 * s);
	noseShine.Color = Color3.fromRGB(255, 255, 255);
	noseShine.Material = Enum.Material.Neon;
	noseShine.Shape = Enum.PartType.Ball;
	noseShine.Transparency = 0.3;
	noseShine.CanCollide = false;
	noseShine.Anchored = true;
	noseShine.Parent = pet;
}

function createSoftBlush(pet: Model, config: typeof PET_TYPES[PetType], s: number) {
	// Soft pink blush circles for kawaii look
	for (let side = -1; side <= 1; side += 2) {
		const blush = new Instance("Part");
		blush.Name = side > 0 ? "RightBlush" : "LeftBlush";
		blush.Size = new Vector3(0.35 * s, 0.2 * s, 0.08 * s);
		blush.Color = Color3.fromRGB(255, 150, 180);
		blush.Material = Enum.Material.Neon;
		blush.Transparency = 0.5;
		blush.Shape = Enum.PartType.Ball;
		blush.CanCollide = false;
		blush.Anchored = true;
		blush.Parent = pet;
	}
}

// ==================== CAT FEATURES ====================
function createCatFeatures(pet: Model, config: typeof PET_TYPES["cat"], s: number) {
	// Rounded triangle ears with inner pink
	for (let side = -1; side <= 1; side += 2) {
		// Outer ear (3 spheres forming triangle shape)
		const earBase = new Instance("Part");
		earBase.Name = side > 0 ? "RightEarBase" : "LeftEarBase";
		earBase.Size = new Vector3(0.4 * s, 0.35 * s, 0.25 * s);
		earBase.Color = config.bodyColor;
		earBase.Material = Enum.Material.SmoothPlastic;
		earBase.Shape = Enum.PartType.Ball;
		earBase.CanCollide = false;
		earBase.Anchored = true;
		earBase.Parent = pet;
		
		const earTip = new Instance("Part");
		earTip.Name = side > 0 ? "RightEarTip" : "LeftEarTip";
		earTip.Size = new Vector3(0.25 * s, 0.35 * s, 0.2 * s);
		earTip.Color = config.bodyColor;
		earTip.Material = Enum.Material.SmoothPlastic;
		earTip.Shape = Enum.PartType.Ball;
		earTip.CanCollide = false;
		earTip.Anchored = true;
		earTip.Parent = pet;
		
		// Inner pink
		const earInner = new Instance("Part");
		earInner.Name = side > 0 ? "RightEarInner" : "LeftEarInner";
		earInner.Size = new Vector3(0.15 * s, 0.2 * s, 0.08 * s);
		earInner.Color = Color3.fromRGB(255, 180, 200);
		earInner.Material = Enum.Material.SmoothPlastic;
		earInner.Shape = Enum.PartType.Ball;
		earInner.CanCollide = false;
		earInner.Anchored = true;
		earInner.Parent = pet;
	}
	
	// Fluffy curled tail (chain of spheres)
	for (let i = 0; i < 6; i++) {
		const tailSeg = new Instance("Part");
		tailSeg.Name = `Tail${i}`;
		tailSeg.Size = new Vector3((0.28 - i * 0.03) * s, (0.28 - i * 0.03) * s, (0.28 - i * 0.03) * s);
		tailSeg.Color = config.bodyColor;
		tailSeg.Material = Enum.Material.SmoothPlastic;
		tailSeg.Shape = Enum.PartType.Ball;
		tailSeg.CanCollide = false;
		tailSeg.Anchored = true;
		tailSeg.Parent = pet;
	}
	
	// Whiskers
	createWhiskers(pet, s);
}

function createWhiskers(pet: Model, s: number) {
	for (let side = -1; side <= 1; side += 2) {
		for (let i = 0; i < 3; i++) {
			const whisker = new Instance("Part");
			whisker.Name = `Whisker_${side}_${i}`;
			whisker.Size = new Vector3(0.4 * s, 0.015 * s, 0.015 * s);
			whisker.Color = Color3.fromRGB(80, 80, 80);
			whisker.Material = Enum.Material.SmoothPlastic;
			whisker.CanCollide = false;
			whisker.Anchored = true;
			whisker.Parent = pet;
		}
	}
}

// ==================== DOG FEATURES ====================
function createDogFeatures(pet: Model, config: typeof PET_TYPES["dog"], s: number) {
	// Floppy rounded ears
	for (let side = -1; side <= 1; side += 2) {
		const ear = new Instance("Part");
		ear.Name = side > 0 ? "RightEar" : "LeftEar";
		ear.Size = new Vector3(0.5 * s, 0.7 * s, 0.25 * s);
		ear.Color = config.accentColor;
		ear.Material = Enum.Material.SmoothPlastic;
		ear.Shape = Enum.PartType.Ball;
		ear.CanCollide = false;
		ear.Anchored = true;
		ear.Parent = pet;
	}
	
	// Snout
	const snout = new Instance("Part");
	snout.Name = "Snout";
	snout.Size = new Vector3(0.7 * s, 0.5 * s, 0.6 * s);
	snout.Color = config.bodyColor;
	snout.Material = Enum.Material.SmoothPlastic;
	snout.Shape = Enum.PartType.Ball;
	snout.CanCollide = false;
	snout.Anchored = true;
	snout.Parent = pet;
	
	// Cute tongue
	const tongue = new Instance("Part");
	tongue.Name = "Tongue";
	tongue.Size = new Vector3(0.25 * s, 0.08 * s, 0.35 * s);
	tongue.Color = Color3.fromRGB(255, 130, 160);
	tongue.Material = Enum.Material.SmoothPlastic;
	tongue.Shape = Enum.PartType.Ball;
	tongue.CanCollide = false;
	tongue.Anchored = true;
	tongue.Parent = pet;
	
	// Wagging tail
	for (let i = 0; i < 4; i++) {
		const tailSeg = new Instance("Part");
		tailSeg.Name = `Tail${i}`;
		tailSeg.Size = new Vector3((0.25 - i * 0.04) * s, (0.25 - i * 0.04) * s, 0.3 * s);
		tailSeg.Color = config.bodyColor;
		tailSeg.Material = Enum.Material.SmoothPlastic;
		tailSeg.Shape = Enum.PartType.Ball;
		tailSeg.CanCollide = false;
		tailSeg.Anchored = true;
		tailSeg.Parent = pet;
	}
}

// ==================== BAT FEATURES ====================
function createBatFeatures(pet: Model, config: typeof PET_TYPES["bat"], s: number) {
	// Big pointy ears (stacked spheres)
	for (let side = -1; side <= 1; side += 2) {
		for (let i = 0; i < 3; i++) {
			const earPart = new Instance("Part");
			earPart.Name = `${side > 0 ? "Right" : "Left"}Ear${i}`;
			earPart.Size = new Vector3((0.35 - i * 0.08) * s, 0.35 * s, (0.25 - i * 0.05) * s);
			earPart.Color = config.bodyColor;
			earPart.Material = Enum.Material.SmoothPlastic;
			earPart.Shape = Enum.PartType.Ball;
			earPart.CanCollide = false;
			earPart.Anchored = true;
			earPart.Parent = pet;
		}
	}
	
	// Membrane wings (multiple overlapping spheres for smooth look)
	for (let side = -1; side <= 1; side += 2) {
		for (let i = 0; i < 4; i++) {
			const wingPart = new Instance("Part");
			wingPart.Name = `${side > 0 ? "Right" : "Left"}Wing${i}`;
			wingPart.Size = new Vector3(0.08 * s, (0.8 - i * 0.1) * s, (1.2 - i * 0.15) * s);
			wingPart.Color = config.accentColor;
			wingPart.Material = Enum.Material.Neon;
			wingPart.Transparency = 0.3;
			wingPart.Shape = Enum.PartType.Ball;
			wingPart.CanCollide = false;
			wingPart.Anchored = true;
			wingPart.Parent = pet;
		}
	}
	
	// Tiny fangs
	for (let side = -1; side <= 1; side += 2) {
		const fang = new Instance("Part");
		fang.Name = side > 0 ? "RightFang" : "LeftFang";
		fang.Size = new Vector3(0.06 * s, 0.12 * s, 0.06 * s);
		fang.Color = Color3.fromRGB(255, 255, 255);
		fang.Material = Enum.Material.SmoothPlastic;
		fang.Shape = Enum.PartType.Ball;
		fang.CanCollide = false;
		fang.Anchored = true;
		fang.Parent = pet;
	}
}

// ==================== DRAGON FEATURES ====================
function createDragonFeatures(pet: Model, config: typeof PET_TYPES["dragon"], s: number) {
	// Curved horns (chain of spheres)
	for (let side = -1; side <= 1; side += 2) {
		for (let i = 0; i < 4; i++) {
			const hornPart = new Instance("Part");
			hornPart.Name = `${side > 0 ? "Right" : "Left"}Horn${i}`;
			hornPart.Size = new Vector3((0.18 - i * 0.03) * s, (0.18 - i * 0.03) * s, 0.2 * s);
			hornPart.Color = Color3.fromRGB(200, 180, 150);
			hornPart.Material = Enum.Material.SmoothPlastic;
			hornPart.Shape = Enum.PartType.Ball;
			hornPart.CanCollide = false;
			hornPart.Anchored = true;
			hornPart.Parent = pet;
		}
	}
	
	// Majestic wings
	for (let side = -1; side <= 1; side += 2) {
		for (let i = 0; i < 5; i++) {
			const wingPart = new Instance("Part");
			wingPart.Name = `${side > 0 ? "Right" : "Left"}Wing${i}`;
			wingPart.Size = new Vector3(0.1 * s, (1.2 - i * 0.15) * s, (1.8 - i * 0.2) * s);
			wingPart.Color = config.accentColor;
			wingPart.Material = Enum.Material.SmoothPlastic;
			wingPart.Transparency = 0.15;
			wingPart.Shape = Enum.PartType.Ball;
			wingPart.CanCollide = false;
			wingPart.Anchored = true;
			wingPart.Parent = pet;
		}
	}
	
	// Spiked tail
	for (let i = 0; i < 5; i++) {
		const tailSeg = new Instance("Part");
		tailSeg.Name = `Tail${i}`;
		tailSeg.Size = new Vector3((0.35 - i * 0.05) * s, (0.35 - i * 0.05) * s, 0.4 * s);
		tailSeg.Color = config.bodyColor;
		tailSeg.Material = Enum.Material.SmoothPlastic;
		tailSeg.Shape = Enum.PartType.Ball;
		tailSeg.CanCollide = false;
		tailSeg.Anchored = true;
		tailSeg.Parent = pet;
	}
	
	// Tail spike
	const tailSpike = new Instance("Part");
	tailSpike.Name = "TailSpike";
	tailSpike.Size = new Vector3(0.12 * s, 0.25 * s, 0.12 * s);
	tailSpike.Color = Color3.fromRGB(200, 180, 150);
	tailSpike.Material = Enum.Material.Neon;
	tailSpike.Shape = Enum.PartType.Ball;
	tailSpike.CanCollide = false;
	tailSpike.Anchored = true;
	tailSpike.Parent = pet;
	
	// FIRE BREATH PARTICLES 🔥
	const head = pet.PrimaryPart!;
	const fireEmitter = new Instance("ParticleEmitter");
	fireEmitter.Name = "FireBreath";
	fireEmitter.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 200)),
		new ColorSequenceKeypoint(0.3, Color3.fromRGB(255, 150, 50)),
		new ColorSequenceKeypoint(0.7, Color3.fromRGB(255, 80, 20)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(100, 20, 0)),
	]);
	fireEmitter.Size = new NumberSequence([
		new NumberSequenceKeypoint(0, 0.2 * s),
		new NumberSequenceKeypoint(0.5, 0.5 * s),
		new NumberSequenceKeypoint(1, 0.1 * s),
	]);
	fireEmitter.Transparency = new NumberSequence([
		new NumberSequenceKeypoint(0, 0),
		new NumberSequenceKeypoint(0.8, 0.3),
		new NumberSequenceKeypoint(1, 1),
	]);
	fireEmitter.LightEmission = 1;
	fireEmitter.LightInfluence = 0;
	fireEmitter.Rate = 40;
	fireEmitter.Lifetime = new NumberRange(0.3, 0.6);
	fireEmitter.Speed = new NumberRange(6, 10);
	fireEmitter.SpreadAngle = new Vector2(20, 20);
	fireEmitter.Parent = head;
}

// ==================== UNICORN FEATURES ====================
function createUnicornFeatures(pet: Model, config: typeof PET_TYPES["unicorn"], s: number) {
	// Elegant golden horn (stacked glowing spheres)
	for (let i = 0; i < 5; i++) {
		const hornPart = new Instance("Part");
		hornPart.Name = `Horn${i}`;
		hornPart.Size = new Vector3((0.2 - i * 0.03) * s, (0.2 - i * 0.03) * s, 0.22 * s);
		hornPart.Color = Color3.fromRGB(255, 220, 100);
		hornPart.Material = Enum.Material.Neon;
		hornPart.Shape = Enum.PartType.Ball;
		hornPart.CanCollide = false;
		hornPart.Anchored = true;
		hornPart.Parent = pet;
	}
	
	// Horn sparkles
	const hornTip = pet.FindFirstChild("Horn4") as Part;
	if (hornTip) {
		const hornSparkle = new Instance("ParticleEmitter");
		hornSparkle.Name = "HornSparkle";
		hornSparkle.Color = new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromRGB(255, 220, 255)),
			new ColorSequenceKeypoint(0.5, Color3.fromRGB(255, 255, 200)),
			new ColorSequenceKeypoint(1, Color3.fromRGB(200, 255, 255)),
		]);
		hornSparkle.Size = new NumberSequence(0.15 * s, 0);
		hornSparkle.LightEmission = 1;
		hornSparkle.Rate = 20;
		hornSparkle.Lifetime = new NumberRange(0.5, 1.2);
		hornSparkle.Speed = new NumberRange(1, 3);
		hornSparkle.SpreadAngle = new Vector2(360, 360);
		hornSparkle.Parent = hornTip;
	}
	
	// Delicate ears
	for (let side = -1; side <= 1; side += 2) {
		const ear = new Instance("Part");
		ear.Name = side > 0 ? "RightEar" : "LeftEar";
		ear.Size = new Vector3(0.2 * s, 0.45 * s, 0.15 * s);
		ear.Color = config.bodyColor;
		ear.Material = Enum.Material.SmoothPlastic;
		ear.Shape = Enum.PartType.Ball;
		ear.CanCollide = false;
		ear.Anchored = true;
		ear.Parent = pet;
		
		const earInner = new Instance("Part");
		earInner.Name = side > 0 ? "RightEarInner" : "LeftEarInner";
		earInner.Size = new Vector3(0.1 * s, 0.25 * s, 0.06 * s);
		earInner.Color = Color3.fromRGB(255, 200, 220);
		earInner.Material = Enum.Material.SmoothPlastic;
		earInner.Shape = Enum.PartType.Ball;
		earInner.CanCollide = false;
		earInner.Anchored = true;
		earInner.Parent = pet;
	}
	
	// RAINBOW FLOWING MANE 🌈
	const rainbowColors = [
		Color3.fromRGB(255, 100, 100),
		Color3.fromRGB(255, 180, 80),
		Color3.fromRGB(255, 255, 100),
		Color3.fromRGB(100, 255, 100),
		Color3.fromRGB(100, 200, 255),
		Color3.fromRGB(200, 100, 255),
	];
	
	for (let i = 0; i < 6; i++) {
		const mane = new Instance("Part");
		mane.Name = `Mane${i}`;
		mane.Size = new Vector3(0.15 * s, 0.5 * s, 0.6 * s);
		mane.Color = rainbowColors[i];
		mane.Material = Enum.Material.Neon;
		mane.Shape = Enum.PartType.Ball;
		mane.CanCollide = false;
		mane.Anchored = true;
		mane.Parent = pet;
	}
	
	// RAINBOW FLOWING TAIL 🌈
	for (let i = 0; i < 6; i++) {
		for (let j = 0; j < 3; j++) {
			const tailPart = new Instance("Part");
			tailPart.Name = `RainbowTail${i}_${j}`;
			tailPart.Size = new Vector3(0.1 * s, (0.25 - j * 0.05) * s, (0.8 - j * 0.15) * s);
			tailPart.Color = rainbowColors[i];
			tailPart.Material = Enum.Material.Neon;
			tailPart.Shape = Enum.PartType.Ball;
			tailPart.CanCollide = false;
			tailPart.Anchored = true;
			tailPart.Parent = pet;
		}
	}
}

// ==================== MAGICAL EFFECTS ====================
function addMagicalEffects(pet: Model, head: Part, config: typeof PET_TYPES[PetType]) {
	// Soft outer glow aura
	const aura = new Instance("Part");
	aura.Name = "Aura";
	aura.Size = head.Size.mul(1.5);
	aura.Color = config.glowColor;
	aura.Material = Enum.Material.ForceField;
	aura.Transparency = 0.85;
	aura.Shape = Enum.PartType.Ball;
	aura.CanCollide = false;
	aura.Anchored = true;
	aura.Parent = pet;
	
	// Floating sparkle particles
	const sparkles = new Instance("ParticleEmitter");
	sparkles.Name = "Sparkles";
	sparkles.Color = new ColorSequence(config.glowColor);
	sparkles.Size = new NumberSequence(0.1, 0);
	sparkles.LightEmission = 1;
	sparkles.Rate = 8;
	sparkles.Lifetime = new NumberRange(0.8, 1.5);
	sparkles.Speed = new NumberRange(0.5, 1.5);
	sparkles.SpreadAngle = new Vector2(360, 360);
	sparkles.Parent = head;
	
	// Inner glow point light
	const glow = new Instance("PointLight");
	glow.Name = "InnerGlow";
	glow.Brightness = 0.8;
	glow.Range = 10;
	glow.Color = config.glowColor;
	glow.Parent = head;
	
	// Trail effect
	const trail = new Instance("Trail");
	trail.Name = "MotionTrail";
	trail.Color = new ColorSequence(config.glowColor);
	trail.Transparency = new NumberSequence([
		new NumberSequenceKeypoint(0, 0.5),
		new NumberSequenceKeypoint(1, 1),
	]);
	trail.Lifetime = 0.3;
	trail.MinLength = 0.1;
	trail.WidthScale = new NumberSequence(1, 0);
	
	// Create attachments for trail
	const att0 = new Instance("Attachment");
	att0.Name = "TrailAtt0";
	att0.Position = new Vector3(0, 0.5, 0);
	att0.Parent = head;
	
	const att1 = new Instance("Attachment");
	att1.Name = "TrailAtt1";
	att1.Position = new Vector3(0, -0.5, 0);
	att1.Parent = head;
	
	trail.Attachment0 = att0;
	trail.Attachment1 = att1;
	trail.Parent = head;
}

// ==================== ANIMATION ====================
function startPetFollow(player: Player, pet: Model, config: typeof PET_TYPES[PetType], petType: PetType) {
	const followOffset = new Vector3(3, 2.5, 3);
	let phase = 0;
	let breathePhase = 0;
	const s = config.scale;
	
	const head = pet.PrimaryPart;
	if (!head) return;
	
	const connection = RunService.Heartbeat.Connect((dt) => {
		const character = player.Character;
		const hrp = character?.FindFirstChild("HumanoidRootPart") as Part | undefined;
		
		if (!hrp || !pet.Parent) {
			connection.Disconnect();
			return;
		}
		
		phase += dt * config.bobSpeed;
		breathePhase += dt * 2;
		
		// Smooth bobbing
		const bobHeight = math.sin(phase) * 0.25;
		const tilt = math.sin(phase * 0.7) * 0.05;
		
		// Follow player smoothly
		const targetPos = hrp.Position.add(followOffset);
		const newPos = head.Position.Lerp(targetPos.add(new Vector3(0, bobHeight, 0)), dt * 5 * config.speed);
		
		// Look at owner with slight tilt
		const lookCFrame = CFrame.lookAt(newPos, hrp.Position).mul(CFrame.Angles(tilt, 0, 0));
		head.CFrame = lookCFrame;
		
		// Breathing scale effect
		const breathe = 1 + math.sin(breathePhase) * 0.02;
		
		// Update body position
		const body = pet.FindFirstChild("Body") as Part | undefined;
		if (body) {
			body.CFrame = head.CFrame.mul(new CFrame(0, -0.3 * s, 0.8 * s));
		}
		
		// Update highlights
		updateHighlights(pet, head as Part, body, s);
		
		// Update eyes
		updateEyes(pet, head as Part, s);
		
		// Update features based on type
		updateFeatures(pet, head as Part, body, petType, config, phase, s);
		
		// Update aura
		const aura = pet.FindFirstChild("Aura") as Part | undefined;
		if (aura) {
			aura.CFrame = head.CFrame;
			aura.Size = head.Size.mul(1.5 + math.sin(breathePhase) * 0.1);
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

function updateHighlights(pet: Model, head: Part, body: Part | undefined, s: number) {
	const headHL = pet.FindFirstChild("HeadHighlight") as Part | undefined;
	if (headHL) {
		headHL.CFrame = head.CFrame.mul(new CFrame(0, 0.4 * s, -0.2 * s));
	}
	
	const bodyHL = pet.FindFirstChild("BodyHighlight") as Part | undefined;
	if (bodyHL && body) {
		bodyHL.CFrame = body.CFrame.mul(new CFrame(0, 0.3 * s, -0.3 * s));
	}
}

function updateEyes(pet: Model, head: Part, s: number) {
	const eyeParts = [
		{ name: "RightEyeWhite", offset: new Vector3(0.4 * s, 0.15 * s, -0.85 * s) },
		{ name: "LeftEyeWhite", offset: new Vector3(-0.4 * s, 0.15 * s, -0.85 * s) },
		{ name: "RightIris", offset: new Vector3(0.4 * s, 0.15 * s, -0.95 * s) },
		{ name: "LeftIris", offset: new Vector3(-0.4 * s, 0.15 * s, -0.95 * s) },
		{ name: "RightPupil", offset: new Vector3(0.4 * s, 0.15 * s, -1.0 * s) },
		{ name: "LeftPupil", offset: new Vector3(-0.4 * s, 0.15 * s, -1.0 * s) },
		{ name: "RightShine1", offset: new Vector3(0.48 * s, 0.25 * s, -1.02 * s) },
		{ name: "LeftShine1", offset: new Vector3(-0.32 * s, 0.25 * s, -1.02 * s) },
		{ name: "RightShine2", offset: new Vector3(0.35 * s, 0.05 * s, -1.0 * s) },
		{ name: "LeftShine2", offset: new Vector3(-0.45 * s, 0.05 * s, -1.0 * s) },
		{ name: "RightBlush", offset: new Vector3(0.65 * s, -0.1 * s, -0.7 * s) },
		{ name: "LeftBlush", offset: new Vector3(-0.65 * s, -0.1 * s, -0.7 * s) },
		{ name: "Nose", offset: new Vector3(0, -0.25 * s, -0.95 * s) },
		{ name: "NoseShine", offset: new Vector3(0.03 * s, -0.2 * s, -0.98 * s) },
	];
	
	for (const item of eyeParts) {
		const part = pet.FindFirstChild(item.name) as Part | undefined;
		if (part) {
			part.CFrame = head.CFrame.mul(new CFrame(item.offset));
		}
	}
}

function updateFeatures(pet: Model, head: Part, body: Part | undefined, petType: PetType, config: typeof PET_TYPES[PetType], phase: number, s: number) {
	// Type-specific updates
	if (petType === "cat") {
		updateCatFeatures(pet, head, body, phase, s);
	} else if (petType === "dog") {
		updateDogFeatures(pet, head, body, phase, s);
	} else if (petType === "bat") {
		updateBatFeatures(pet, head, body, phase, s);
	} else if (petType === "dragon") {
		updateDragonFeatures(pet, head, body, phase, s);
	} else if (petType === "unicorn") {
		updateUnicornFeatures(pet, head, body, phase, s);
	}
}

function updateCatFeatures(pet: Model, head: Part, body: Part | undefined, phase: number, s: number) {
	// Ears
	for (let side = -1; side <= 1; side += 2) {
		const earBase = pet.FindFirstChild(side > 0 ? "RightEarBase" : "LeftEarBase") as Part | undefined;
		const earTip = pet.FindFirstChild(side > 0 ? "RightEarTip" : "LeftEarTip") as Part | undefined;
		const earInner = pet.FindFirstChild(side > 0 ? "RightEarInner" : "LeftEarInner") as Part | undefined;
		
		if (earBase) earBase.CFrame = head.CFrame.mul(new CFrame(0.5 * s * side, 0.7 * s, -0.1 * s));
		if (earTip) earTip.CFrame = head.CFrame.mul(new CFrame(0.55 * s * side, 1.0 * s, -0.15 * s));
		if (earInner) earInner.CFrame = head.CFrame.mul(new CFrame(0.5 * s * side, 0.85 * s, -0.18 * s));
	}
	
	// Animated tail
	if (body) {
		for (let i = 0; i < 6; i++) {
			const tailSeg = pet.FindFirstChild(`Tail${i}`) as Part | undefined;
			if (tailSeg) {
				const wave = math.sin(phase * 2 + i * 0.5) * 0.15;
				tailSeg.CFrame = body.CFrame.mul(new CFrame(wave * (i + 1), 0.2 * s + i * 0.18 * s, 0.9 * s + i * 0.22 * s));
			}
		}
	}
	
	// Whiskers
	for (let side = -1; side <= 1; side += 2) {
		for (let i = 0; i < 3; i++) {
			const whisker = pet.FindFirstChild(`Whisker_${side}_${i}`) as Part | undefined;
			if (whisker) {
				const yOff = -0.15 + i * 0.08;
				whisker.CFrame = head.CFrame.mul(new CFrame(0.5 * s * side, yOff * s, -0.6 * s)).mul(CFrame.Angles(0, side * 0.25, (i - 1) * 0.1));
			}
		}
	}
}

function updateDogFeatures(pet: Model, head: Part, body: Part | undefined, phase: number, s: number) {
	// Floppy ears
	const earBounce = math.sin(phase * 3) * 0.05;
	for (let side = -1; side <= 1; side += 2) {
		const ear = pet.FindFirstChild(side > 0 ? "RightEar" : "LeftEar") as Part | undefined;
		if (ear) {
			ear.CFrame = head.CFrame.mul(new CFrame(0.7 * s * side, 0.1 * s + earBounce, 0)).mul(CFrame.Angles(0.8 * side, 0, 0));
		}
	}
	
	// Snout
	const snout = pet.FindFirstChild("Snout") as Part | undefined;
	if (snout) snout.CFrame = head.CFrame.mul(new CFrame(0, -0.2 * s, -0.85 * s));
	
	// Tongue
	const tongue = pet.FindFirstChild("Tongue") as Part | undefined;
	if (tongue) {
		const tongueWag = math.sin(phase * 4) * 0.03;
		tongue.CFrame = head.CFrame.mul(new CFrame(tongueWag, -0.5 * s, -0.75 * s));
	}
	
	// Wagging tail
	if (body) {
		const wag = math.sin(phase * 6) * 0.4;
		for (let i = 0; i < 4; i++) {
			const tailSeg = pet.FindFirstChild(`Tail${i}`) as Part | undefined;
			if (tailSeg) {
				tailSeg.CFrame = body.CFrame.mul(new CFrame(wag * (i + 1) * 0.3, 0.3 * s + i * 0.15 * s, 0.9 * s + i * 0.25 * s));
			}
		}
	}
}

function updateBatFeatures(pet: Model, head: Part, body: Part | undefined, phase: number, s: number) {
	// Big ears
	for (let side = -1; side <= 1; side += 2) {
		for (let i = 0; i < 3; i++) {
			const earPart = pet.FindFirstChild(`${side > 0 ? "Right" : "Left"}Ear${i}`) as Part | undefined;
			if (earPart) {
				earPart.CFrame = head.CFrame.mul(new CFrame(0.4 * s * side, 0.7 * s + i * 0.25 * s, -0.1 * s));
			}
		}
	}
	
	// Flapping wings
	const flapAngle = math.sin(phase * 8) * 0.5;
	if (body) {
		for (let side = -1; side <= 1; side += 2) {
			for (let i = 0; i < 4; i++) {
				const wingPart = pet.FindFirstChild(`${side > 0 ? "Right" : "Left"}Wing${i}`) as Part | undefined;
				if (wingPart) {
					const xOff = (0.7 + i * 0.3) * s * side;
					wingPart.CFrame = body.CFrame.mul(new CFrame(xOff, 0.2 * s, i * 0.1 * s)).mul(CFrame.Angles(0, 0, flapAngle * side));
				}
			}
		}
	}
	
	// Fangs
	for (let side = -1; side <= 1; side += 2) {
		const fang = pet.FindFirstChild(side > 0 ? "RightFang" : "LeftFang") as Part | undefined;
		if (fang) {
			fang.CFrame = head.CFrame.mul(new CFrame(0.12 * s * side, -0.45 * s, -0.7 * s));
		}
	}
}

function updateDragonFeatures(pet: Model, head: Part, body: Part | undefined, phase: number, s: number) {
	// Curved horns
	for (let side = -1; side <= 1; side += 2) {
		for (let i = 0; i < 4; i++) {
			const hornPart = pet.FindFirstChild(`${side > 0 ? "Right" : "Left"}Horn${i}`) as Part | undefined;
			if (hornPart) {
				const angle = i * 0.2;
				hornPart.CFrame = head.CFrame.mul(new CFrame(0.35 * s * side + i * 0.08 * s * side, 0.6 * s + i * 0.2 * s, -0.1 * s + i * 0.15 * s)).mul(CFrame.Angles(-angle, 0, -0.3 * side));
			}
		}
	}
	
	// Majestic flapping wings
	const wingFlap = math.sin(phase * 4) * 0.3;
	if (body) {
		for (let side = -1; side <= 1; side += 2) {
			for (let i = 0; i < 5; i++) {
				const wingPart = pet.FindFirstChild(`${side > 0 ? "Right" : "Left"}Wing${i}`) as Part | undefined;
				if (wingPart) {
					const xOff = (0.8 + i * 0.35) * s * side;
					wingPart.CFrame = body.CFrame.mul(new CFrame(xOff, 0.3 * s + i * 0.05 * s, i * 0.1 * s)).mul(CFrame.Angles(0, 0, (wingFlap + i * 0.1) * side));
				}
			}
		}
	}
	
	// Tail
	if (body) {
		for (let i = 0; i < 5; i++) {
			const tailSeg = pet.FindFirstChild(`Tail${i}`) as Part | undefined;
			if (tailSeg) {
				const wave = math.sin(phase * 2 + i * 0.4) * 0.1;
				tailSeg.CFrame = body.CFrame.mul(new CFrame(wave * (i + 1), 0.1 * s, 1.0 * s + i * 0.35 * s));
			}
		}
		
		const tailSpike = pet.FindFirstChild("TailSpike") as Part | undefined;
		if (tailSpike) {
			tailSpike.CFrame = body!.CFrame.mul(new CFrame(0, 0.2 * s, 2.8 * s));
		}
	}
}

function updateUnicornFeatures(pet: Model, head: Part, body: Part | undefined, phase: number, s: number) {
	// Spiral horn
	for (let i = 0; i < 5; i++) {
		const hornPart = pet.FindFirstChild(`Horn${i}`) as Part | undefined;
		if (hornPart) {
			const spiralAngle = i * 0.8;
			const radius = 0.05 * s;
			hornPart.CFrame = head.CFrame.mul(new CFrame(
				math.sin(spiralAngle) * radius,
				0.85 * s + i * 0.22 * s,
				-0.15 * s + math.cos(spiralAngle) * radius
			));
		}
	}
	
	// Ears
	for (let side = -1; side <= 1; side += 2) {
		const ear = pet.FindFirstChild(side > 0 ? "RightEar" : "LeftEar") as Part | undefined;
		const earInner = pet.FindFirstChild(side > 0 ? "RightEarInner" : "LeftEarInner") as Part | undefined;
		if (ear) ear.CFrame = head.CFrame.mul(new CFrame(0.4 * s * side, 0.65 * s, -0.1 * s)).mul(CFrame.Angles(0, 0, -0.2 * side));
		if (earInner) earInner.CFrame = head.CFrame.mul(new CFrame(0.4 * s * side, 0.6 * s, -0.15 * s)).mul(CFrame.Angles(0, 0, -0.2 * side));
	}
	
	// Flowing rainbow mane
	for (let i = 0; i < 6; i++) {
		const mane = pet.FindFirstChild(`Mane${i}`) as Part | undefined;
		if (mane) {
			const flow = math.sin(phase * 3 + i * 0.5) * 0.1;
			mane.CFrame = head.CFrame.mul(new CFrame(flow + (i - 2.5) * 0.12 * s, 0.5 * s - i * 0.05 * s, 0.3 * s + i * 0.1 * s));
		}
	}
	
	// Flowing rainbow tail
	if (body) {
		for (let i = 0; i < 6; i++) {
			for (let j = 0; j < 3; j++) {
				const tailPart = pet.FindFirstChild(`RainbowTail${i}_${j}`) as Part | undefined;
				if (tailPart) {
					const flow = math.sin(phase * 2 + i * 0.4 + j * 0.3) * 0.15;
					tailPart.CFrame = body.CFrame.mul(new CFrame(
						(i - 2.5) * 0.08 * s + flow,
						0.1 * s + j * 0.1 * s,
						0.9 * s + j * 0.4 * s
					));
				}
			}
		}
	}
}

// ==================== COIN MAGNET ====================
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

// ==================== UTILITY ====================
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
	return ["cat", "dog", "bat", "dragon", "unicorn"];
}
