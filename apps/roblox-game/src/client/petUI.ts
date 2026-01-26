// Pet Selection UI - Client side
// Lets players choose between Pink Cat, Blue Dog, and Purple Bat
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

// Create pet selection UI
export function createPetSelectionUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "PetSelectionUI";
	screenGui.ResetOnSpawn = false;
	
	// Main container - bottom right
	const container = new Instance("Frame");
	container.Name = "PetContainer";
	container.Size = new UDim2(0, 180, 0, 220);
	container.Position = new UDim2(1, -190, 1, -230);
	container.BackgroundColor3 = Color3.fromRGB(30, 30, 40);
	container.BackgroundTransparency = 0.2;
	container.BorderSizePixel = 0;
	container.Parent = screenGui;
	
	// Round corners
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 16);
	corner.Parent = container;
	
	// Gradient
	const gradient = new Instance("UIGradient");
	gradient.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(50, 40, 60)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(30, 25, 40)),
	]);
	gradient.Rotation = 90;
	gradient.Parent = container;
	
	// Title
	const title = new Instance("TextLabel");
	title.Name = "Title";
	title.Size = new UDim2(1, 0, 0, 35);
	title.Position = new UDim2(0, 0, 0, 5);
	title.BackgroundTransparency = 1;
	title.Text = "🐾 Choose Pet";
	title.TextColor3 = Color3.fromRGB(255, 255, 255);
	title.TextSize = 18;
	title.Font = Enum.Font.GothamBold;
	title.Parent = container;
	
	// Pet buttons
	const pets = [
		{ id: "cat", name: "🐱 Pink Cat", color: Color3.fromRGB(255, 150, 200) },
		{ id: "dog", name: "🐕 Blue Dog", color: Color3.fromRGB(100, 180, 255) },
		{ id: "bat", name: "🦇 Purple Bat", color: Color3.fromRGB(180, 100, 255) },
	];
	
	pets.forEach((pet, index) => {
		const button = new Instance("TextButton");
		button.Name = `${pet.id}Button`;
		button.Size = new UDim2(1, -20, 0, 45);
		button.Position = new UDim2(0, 10, 0, 45 + index * 55);
		button.BackgroundColor3 = pet.color;
		button.BackgroundTransparency = 0.3;
		button.BorderSizePixel = 0;
		button.Text = pet.name;
		button.TextColor3 = Color3.fromRGB(255, 255, 255);
		button.TextSize = 16;
		button.Font = Enum.Font.GothamBold;
		button.Parent = container;
		
		const btnCorner = new Instance("UICorner");
		btnCorner.CornerRadius = new UDim(0, 10);
		btnCorner.Parent = button;
		
		// Hover effect
		button.MouseEnter.Connect(() => {
			button.BackgroundTransparency = 0.1;
		});
		button.MouseLeave.Connect(() => {
			button.BackgroundTransparency = 0.3;
		});
		
		// Click to select pet
		button.MouseButton1Click.Connect(() => {
			selectPet(pet.id);
			highlightSelected(container, button);
		});
	});
	
	screenGui.Parent = player.WaitForChild("PlayerGui");
	return screenGui;
}

function selectPet(petId: string) {
	// Fire remote to server to change pet
	const changePetRemote = ReplicatedStorage.FindFirstChild("ChangePet") as RemoteEvent | undefined;
	if (changePetRemote) {
		changePetRemote.FireServer(petId);
	}
	print(`🐾 Selected: ${petId}`);
}

function highlightSelected(container: Frame, selectedButton: TextButton) {
	// Reset all buttons
	for (const child of container.GetChildren()) {
		if (child.IsA("TextButton")) {
			child.BackgroundTransparency = 0.3;
			// Remove old selection indicator
			const indicator = child.FindFirstChild("Selected");
			if (indicator) indicator.Destroy();
		}
	}
	
	// Highlight selected
	selectedButton.BackgroundTransparency = 0;
	
	const indicator = new Instance("Frame");
	indicator.Name = "Selected";
	indicator.Size = new UDim2(0, 4, 1, -10);
	indicator.Position = new UDim2(0, -8, 0, 5);
	indicator.BackgroundColor3 = Color3.fromRGB(255, 255, 255);
	indicator.BorderSizePixel = 0;
	indicator.Parent = selectedButton;
	
	const indCorner = new Instance("UICorner");
	indCorner.CornerRadius = new UDim(0, 2);
	indCorner.Parent = indicator;
}
