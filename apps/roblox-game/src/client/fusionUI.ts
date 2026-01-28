// Pet Fusion UI - Combine pets interface
import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

const TIER_COLORS: { [key: string]: Color3 } = {
	Normal: Color3.fromRGB(180, 180, 180),
	Golden: Color3.fromRGB(255, 215, 0),
	Rainbow: Color3.fromRGB(255, 100, 255),
	"Dark Matter": Color3.fromRGB(50, 0, 100),
};

export function createFusionUI() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "FusionUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 94;
	
	// Fusion button
	const fusionBtn = new Instance("TextButton");
	fusionBtn.Name = "FusionBtn";
	fusionBtn.Size = new UDim2(0, 50, 0, 50);
	fusionBtn.Position = new UDim2(0, 175, 1, -105);
	fusionBtn.BackgroundColor3 = Color3.fromRGB(200, 100, 255);
	fusionBtn.Text = "✨";
	fusionBtn.TextSize = 28;
	fusionBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 12);
	btnCorner.Parent = fusionBtn;
	
	// Fusion panel
	const panel = new Instance("Frame");
	panel.Name = "FusionPanel";
	panel.Size = new UDim2(0, 320, 0, 300);
	panel.Position = new UDim2(0.5, -160, 0.5, -150);
	panel.BackgroundColor3 = Color3.fromRGB(35, 25, 45);
	panel.Visible = false;
	panel.Parent = screenGui;
	
	const panelCorner = new Instance("UICorner");
	panelCorner.CornerRadius = new UDim(0, 16);
	panelCorner.Parent = panel;
	
	// Title
	const title = new Instance("TextLabel");
	title.Size = new UDim2(1, 0, 0, 45);
	title.BackgroundTransparency = 1;
	title.Text = "✨ PET FUSION ✨";
	title.TextColor3 = Color3.fromRGB(200, 150, 255);
	title.TextSize = 22;
	title.Font = Enum.Font.GothamBold;
	title.Parent = panel;
	
	// Pet list
	const petList = new Instance("ScrollingFrame");
	petList.Name = "PetList";
	petList.Size = new UDim2(1, -20, 0, 200);
	petList.Position = new UDim2(0, 10, 0, 50);
	petList.BackgroundColor3 = Color3.fromRGB(45, 35, 55);
	petList.ScrollBarThickness = 6;
	petList.Parent = panel;
	
	const listCorner = new Instance("UICorner");
	listCorner.CornerRadius = new UDim(0, 8);
	listCorner.Parent = petList;
	
	const listLayout = new Instance("UIListLayout");
	listLayout.SortOrder = Enum.SortOrder.LayoutOrder;
	listLayout.Padding = new UDim(0, 5);
	listLayout.Parent = petList;
	
	// Close button
	const closeBtn = new Instance("TextButton");
	closeBtn.Size = new UDim2(0, 80, 0, 30);
	closeBtn.Position = new UDim2(0.5, -40, 1, -38);
	closeBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 100);
	closeBtn.Text = "CLOSE";
	closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
	closeBtn.TextSize = 12;
	closeBtn.Font = Enum.Font.GothamBold;
	closeBtn.Parent = panel;
	
	const closeCorner = new Instance("UICorner");
	closeCorner.CornerRadius = new UDim(0, 8);
	closeCorner.Parent = closeBtn;
	
	// Refresh pets
	const refreshPets = () => {
		// Clear existing
		for (const child of petList.GetChildren()) {
			if (child.IsA("Frame")) child.Destroy();
		}
		
		const remote = ReplicatedStorage.FindFirstChild("GetPetInventory") as RemoteFunction | undefined;
		if (!remote) return;
		
		const pets = remote.InvokeServer() as { name: string; tier: string; count: number; canFuse: boolean }[];
		
		for (let i = 0; i < pets.size(); i++) {
			const pet = pets[i];
			createPetRow(petList, pet, i, refreshPets);
		}
		
		petList.CanvasSize = new UDim2(0, 0, 0, pets.size() * 45);
	};
	
	// Toggle
	fusionBtn.MouseButton1Click.Connect(() => {
		panel.Visible = !panel.Visible;
		if (panel.Visible) refreshPets();
	});
	
	closeBtn.MouseButton1Click.Connect(() => {
		panel.Visible = false;
	});
	
	// Fusion celebration
	const fusionNotify = ReplicatedStorage.WaitForChild("FusionNotify", 1) as RemoteEvent | undefined;
	if (fusionNotify) {
		fusionNotify.OnClientEvent.Connect((petName: string, newTier: string, multiplier: number) => {
			// Show celebration
			const celebFrame = new Instance("Frame");
			celebFrame.Size = new UDim2(1, 0, 1, 0);
			celebFrame.BackgroundColor3 = TIER_COLORS[newTier] ?? Color3.fromRGB(255, 255, 255);
			celebFrame.BackgroundTransparency = 0.5;
			celebFrame.ZIndex = 100;
			celebFrame.Parent = screenGui;
			
			const celebText = new Instance("TextLabel");
			celebText.Size = new UDim2(1, 0, 0, 100);
			celebText.Position = new UDim2(0, 0, 0.4, 0);
			celebText.BackgroundTransparency = 1;
			celebText.Text = `✨ ${newTier.upper()} ${petName.upper()}! ✨\n${multiplier}x POWER!`;
			celebText.TextColor3 = Color3.fromRGB(255, 255, 255);
			celebText.TextSize = 36;
			celebText.Font = Enum.Font.GothamBold;
			celebText.ZIndex = 101;
			celebText.Parent = celebFrame;
			
			wait(2);
			celebFrame.Destroy();
			refreshPets();
		});
	}
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("✨ Fusion UI ready!");
}

function createPetRow(parent: ScrollingFrame, pet: { name: string; tier: string; count: number; canFuse: boolean }, index: number, refreshFn: () => void) {
	const row = new Instance("Frame");
	row.Size = new UDim2(1, -10, 0, 40);
	row.BackgroundColor3 = TIER_COLORS[pet.tier] ?? Color3.fromRGB(100, 100, 100);
	row.BackgroundTransparency = 0.5;
	row.LayoutOrder = index;
	row.Parent = parent;
	
	const rowCorner = new Instance("UICorner");
	rowCorner.CornerRadius = new UDim(0, 8);
	rowCorner.Parent = row;
	
	// Pet info
	const info = new Instance("TextLabel");
	info.Size = new UDim2(0.6, 0, 1, 0);
	info.BackgroundTransparency = 1;
	info.Text = `${pet.tier} ${pet.name} x${pet.count}`;
	info.TextColor3 = Color3.fromRGB(255, 255, 255);
	info.TextSize = 14;
	info.Font = Enum.Font.GothamBold;
	info.TextXAlignment = Enum.TextXAlignment.Left;
	info.Position = new UDim2(0, 10, 0, 0);
	info.Parent = row;
	
	// Fuse button
	if (pet.canFuse) {
		const fuseBtn = new Instance("TextButton");
		fuseBtn.Size = new UDim2(0, 60, 0, 28);
		fuseBtn.Position = new UDim2(1, -70, 0.5, -14);
		fuseBtn.BackgroundColor3 = Color3.fromRGB(150, 100, 255);
		fuseBtn.Text = "FUSE";
		fuseBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
		fuseBtn.TextSize = 12;
		fuseBtn.Font = Enum.Font.GothamBold;
		fuseBtn.Parent = row;
		
		const fuseBtnCorner = new Instance("UICorner");
		fuseBtnCorner.CornerRadius = new UDim(0, 6);
		fuseBtnCorner.Parent = fuseBtn;
		
		fuseBtn.MouseButton1Click.Connect(() => {
			const remote = ReplicatedStorage.FindFirstChild("FusePets") as RemoteFunction | undefined;
			if (remote) {
				remote.InvokeServer(pet.name, pet.tier);
			}
		});
	}
}
