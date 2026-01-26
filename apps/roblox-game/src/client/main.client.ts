// Client-side UI and effects for coin game
import { Players, UserInputService, StarterGui, ReplicatedStorage } from "@rbxts/services";
import { createPetSelectionUI } from "./petUI";

const player = Players.LocalPlayer;

print(`🎮 Welcome ${player.Name}! Collect the golden coins!`);

// Create a simple UI to show controls
function createUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "CoinGameUI";
	screenGui.ResetOnSpawn = false;

	// Instructions panel
	const frame = new Instance("Frame");
	frame.Name = "Instructions";
	frame.Size = new UDim2(0, 250, 0, 80);
	frame.Position = new UDim2(0, 10, 1, -90);
	frame.BackgroundColor3 = new Color3(0, 0, 0);
	frame.BackgroundTransparency = 0.5;
	frame.BorderSizePixel = 0;
	frame.Parent = screenGui;

	// Round corners
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 12);
	corner.Parent = frame;

	// Title
	const title = new Instance("TextLabel");
	title.Name = "Title";
	title.Size = new UDim2(1, 0, 0, 30);
	title.Position = new UDim2(0, 0, 0, 5);
	title.BackgroundTransparency = 1;
	title.Text = "🪙 COIN COLLECTION";
	title.TextColor3 = new Color3(1, 0.85, 0);
	title.TextSize = 18;
	title.Font = Enum.Font.GothamBold;
	title.Parent = frame;

	// Instructions text
	const instructions = new Instance("TextLabel");
	instructions.Name = "InstructionsText";
	instructions.Size = new UDim2(1, -20, 0, 40);
	instructions.Position = new UDim2(0, 10, 0, 35);
	instructions.BackgroundTransparency = 1;
	instructions.Text = "Walk into golden coins to collect them!\nYour score shows on the leaderboard.";
	instructions.TextColor3 = new Color3(1, 1, 1);
	instructions.TextSize = 12;
	instructions.Font = Enum.Font.Gotham;
	instructions.TextWrapped = true;
	instructions.TextXAlignment = Enum.TextXAlignment.Left;
	instructions.Parent = frame;

	screenGui.Parent = player.WaitForChild("PlayerGui");
	
	// Fade out after 10 seconds
	task.delay(10, () => {
		for (let i = 0; i <= 20; i++) {
			frame.BackgroundTransparency = 0.5 + (i * 0.025);
			title.TextTransparency = i * 0.05;
			instructions.TextTransparency = i * 0.05;
			task.wait(0.05);
		}
		screenGui.Destroy();
	});
}

// Triple jump ability for fun movement
let jumpsRemaining = 2; // 2 extra jumps (3 total)
const MAX_EXTRA_JUMPS = 2;

function onJumpRequest() {
	const character = player.Character;
	const humanoid = character?.FindFirstChildOfClass("Humanoid");
	
	if (!humanoid) return;

	if (humanoid.FloorMaterial === Enum.Material.Air && jumpsRemaining > 0) {
		jumpsRemaining--;
		humanoid.ChangeState(Enum.HumanoidStateType.Jumping);
		print(`🦘 Jump ${MAX_EXTRA_JUMPS + 1 - jumpsRemaining}/3!`);
	}
}

// Reset jumps when landing
function setupJumpReset() {
	const character = player.Character || player.CharacterAdded.Wait()[0];
	const humanoid = character?.FindFirstChildOfClass("Humanoid");
	
	if (humanoid) {
		humanoid.StateChanged.Connect((_, newState) => {
			if (newState === Enum.HumanoidStateType.Landed) {
				jumpsRemaining = MAX_EXTRA_JUMPS;
			}
		});
	}
}

player.CharacterAdded.Connect(setupJumpReset);
if (player.Character) setupJumpReset();

// Sprint ability with Shift
let isSprinting = false;
const DEFAULT_SPEED = 16;
const SPRINT_SPEED = 32;

function updateSpeed() {
	const character = player.Character;
	const humanoid = character?.FindFirstChildOfClass("Humanoid");
	if (humanoid) {
		humanoid.WalkSpeed = isSprinting ? SPRINT_SPEED : DEFAULT_SPEED;
	}
}

UserInputService.InputBegan.Connect((input, gameProcessed) => {
	if (gameProcessed) return;
	
	if (input.KeyCode === Enum.KeyCode.LeftShift) {
		isSprinting = true;
		updateSpeed();
		print("🏃 Sprint activated!");
	}
	
	if (input.KeyCode === Enum.KeyCode.Space) {
		onJumpRequest();
	}
});

UserInputService.InputEnded.Connect((input) => {
	if (input.KeyCode === Enum.KeyCode.LeftShift) {
		isSprinting = false;
		updateSpeed();
	}
});

// E key to exit roller coaster
UserInputService.InputBegan.Connect((input, processed) => {
	if (processed) return;
	if (input.KeyCode === Enum.KeyCode.E) {
		const exitRemote = ReplicatedStorage.FindFirstChild("CoasterExit") as RemoteEvent | undefined;
		if (exitRemote) {
			exitRemote.FireServer();
		}
	}
});

// Tutorial popup for new players
function showTutorial() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "TutorialUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 100;
	
	// Dark overlay
	const overlay = new Instance("Frame");
	overlay.Name = "Overlay";
	overlay.Size = new UDim2(1, 0, 1, 0);
	overlay.BackgroundColor3 = new Color3(0, 0, 0);
	overlay.BackgroundTransparency = 0.5;
	overlay.BorderSizePixel = 0;
	overlay.Parent = screenGui;
	
	// Tutorial box
	const box = new Instance("Frame");
	box.Name = "TutorialBox";
	box.Size = new UDim2(0, 400, 0, 200);
	box.Position = new UDim2(0.5, -200, 0.5, -100);
	box.BackgroundColor3 = Color3.fromRGB(40, 45, 60);
	box.BorderSizePixel = 0;
	box.Parent = overlay;
	
	const boxCorner = new Instance("UICorner");
	boxCorner.CornerRadius = new UDim(0, 16);
	boxCorner.Parent = box;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 40);
	title.Position = new UDim2(0, 0, 0, 10);
	title.BackgroundTransparency = 1;
	title.Text = "👋 Hi! Would you like to do the tutorial?";
	title.TextColor3 = new Color3(1, 1, 1);
	title.TextSize = 20;
	title.Font = Enum.Font.GothamBold;
	title.Parent = box;
	
	// Yes button
	const yesBtn = new Instance("TextButton");
	yesBtn.Name = "YesButton";
	yesBtn.Size = new UDim2(0, 120, 0, 45);
	yesBtn.Position = new UDim2(0.5, -130, 1, -70);
	yesBtn.BackgroundColor3 = Color3.fromRGB(80, 200, 120);
	yesBtn.Text = "✅ Yes!";
	yesBtn.TextColor3 = new Color3(1, 1, 1);
	yesBtn.TextSize = 18;
	yesBtn.Font = Enum.Font.GothamBold;
	yesBtn.Parent = box;
	
	const yesBtnCorner = new Instance("UICorner");
	yesBtnCorner.CornerRadius = new UDim(0, 10);
	yesBtnCorner.Parent = yesBtn;
	
	// No button
	const noBtn = new Instance("TextButton");
	noBtn.Name = "NoButton";
	noBtn.Size = new UDim2(0, 120, 0, 45);
	noBtn.Position = new UDim2(0.5, 10, 1, -70);
	noBtn.BackgroundColor3 = Color3.fromRGB(180, 80, 80);
	noBtn.Text = "❌ No thanks";
	noBtn.TextColor3 = new Color3(1, 1, 1);
	noBtn.TextSize = 18;
	noBtn.Font = Enum.Font.GothamBold;
	noBtn.Parent = box;
	
	const noBtnCorner = new Instance("UICorner");
	noBtnCorner.CornerRadius = new UDim(0, 10);
	noBtnCorner.Parent = noBtn;
	
	// Add to player GUI
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	// Handle Yes click - show tutorial info
	yesBtn.MouseButton1Click.Connect(() => {
		title.Text = "🎮 Welcome to the Game!";
		title.TextSize = 18;
		
		// Tutorial content
		const content = new Instance("TextLabel");
		content.Size = new UDim2(1, -40, 0, 100);
		content.Position = new UDim2(0, 20, 0, 50);
		content.BackgroundTransparency = 1;
		content.Text = "🏃 Hold LEFT SHIFT to SPRINT!\n\n🦘 You can TRIPLE JUMP! Press SPACE 3x fast!\n\n🗼 Play on the OBBY tower for +50 coins!\n\n🎢 Ride the ROLLER COASTER for +25 coins!\n\n🐕 PETS help you collect coins faster! Pick a pet at bottom right! →";
		content.TextColor3 = Color3.fromRGB(220, 220, 255);
		content.TextSize = 15;
		content.TextXAlignment = Enum.TextXAlignment.Left;
		content.TextYAlignment = Enum.TextYAlignment.Top;
		content.Font = Enum.Font.Gotham;
		content.TextWrapped = true;
		content.Parent = box;
		
		// Hide yes button, change no to close
		yesBtn.Visible = false;
		noBtn.Text = "👍 Got it!";
		noBtn.BackgroundColor3 = Color3.fromRGB(80, 150, 220);
		noBtn.Position = new UDim2(0.5, -60, 1, -60);
		
		// Resize box
		box.Size = new UDim2(0, 420, 0, 260);
		box.Position = new UDim2(0.5, -210, 0.5, -130);
	});
	
	// Handle No/Close click
	noBtn.MouseButton1Click.Connect(() => {
		screenGui.Destroy();
	});
}

// Initialize
createUI();
createPetSelectionUI();
showTutorial(); // Show tutorial for new players
print("💡 Tips: SHIFT=sprint, SPACE=jump, E=exit coaster!");

