// Background Music System
// Best practices: On by default, mute toggle, loops, volume control
import { Players, SoundService, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;

// IMPORTANT: Replace with your actual Roblox audio asset ID after uploading
// Upload your MP3 at: https://create.roblox.com/dashboard/creations?activeTab=Audio
const MUSIC_ASSET_ID = "rbxassetid://72021911185868";

let musicSound: Sound | undefined;
let isMuted = false;

export function createMusicSystem() {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "MusicUI";
	screenGui.ResetOnSpawn = false;
	screenGui.DisplayOrder = 75;
	
	// Music toggle button (hidden - in settings or action bar instead)
	const musicBtn = new Instance("TextButton");
	musicBtn.Name = "MusicToggle";
	musicBtn.Size = new UDim2(0, 50, 0, 50);
	musicBtn.Position = new UDim2(1, -60, 0, 70);
	musicBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
	musicBtn.Text = "🎵";
	musicBtn.TextSize = 28;
	musicBtn.Font = Enum.Font.GothamBold;
	musicBtn.Visible = false; // Hidden - use settings instead
	musicBtn.Parent = screenGui;
	
	const btnCorner = new Instance("UICorner");
	btnCorner.CornerRadius = new UDim(0, 12);
	btnCorner.Parent = musicBtn;
	
	// Create the music sound
	musicSound = new Instance("Sound");
	musicSound.Name = "BackgroundMusic";
	musicSound.SoundId = MUSIC_ASSET_ID;
	musicSound.Volume = 0.5;
	musicSound.Looped = true;
	musicSound.Parent = SoundService;
	
	// Start playing (on by default - best practice for atmosphere)
	musicSound.Play();
	
	// Toggle mute on click
	musicBtn.MouseButton1Click.Connect(() => {
		isMuted = !isMuted;
		
		if (musicSound) {
			if (isMuted) {
				musicSound.Volume = 0;
				musicBtn.Text = "🔇";
				musicBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 100);
			} else {
				musicSound.Volume = 0.5;
				musicBtn.Text = "🎵";
				musicBtn.BackgroundColor3 = Color3.fromRGB(80, 180, 80);
			}
		}
	});
	
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	screenGui.Parent = playerGui;
	
	print("🎵 Music system ready! Click the music button to toggle.");
}

// Optional: Get/set music state for persistence
export function setMusicVolume(volume: number) {
	if (musicSound) {
		musicSound.Volume = math.clamp(volume, 0, 1);
	}
}

export function isMusicPlaying(): boolean {
	return musicSound?.IsPlaying ?? false;
}
