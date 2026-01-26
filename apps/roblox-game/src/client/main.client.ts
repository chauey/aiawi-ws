// Client-side UI and effects for coin game
import { Players, UserInputService, StarterGui, ReplicatedStorage } from "@rbxts/services";

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

// Double jump ability for fun movement
let canDoubleJump = true;
let hasJumped = false;

function onJumpRequest() {
	const character = player.Character;
	const humanoid = character?.FindFirstChildOfClass("Humanoid");
	
	if (!humanoid) return;

	if (humanoid.FloorMaterial === Enum.Material.Air && canDoubleJump && hasJumped) {
		canDoubleJump = false;
		humanoid.ChangeState(Enum.HumanoidStateType.Jumping);
		print("🦘 Double jump!");
		
		// Reset after landing
		const connection = humanoid.StateChanged.Connect((_, newState) => {
			if (newState === Enum.HumanoidStateType.Landed) {
				canDoubleJump = true;
				hasJumped = false;
				connection.Disconnect();
			}
		});
	} else if (humanoid.FloorMaterial !== Enum.Material.Air) {
		hasJumped = true;
	}
}

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

// Initialize
createUI();
print("💡 Tips: Hold SHIFT to sprint, press SPACE twice to double jump!");
