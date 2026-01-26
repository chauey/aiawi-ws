// Client entry point - runs in StarterPlayerScripts
import { Players, UserInputService } from "@rbxts/services";
import { formatMessage } from "shared/utils";

const player = Players.LocalPlayer;

print(formatMessage(`Client started for ${player.Name}`));

// Example: Handle keyboard input
UserInputService.InputBegan.Connect((input, gameProcessed) => {
	if (gameProcessed) return;

	if (input.KeyCode === Enum.KeyCode.E) {
		print("🎯 E key pressed - interact!");
	}
});
