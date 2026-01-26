// Server entry point - runs in ServerScriptService
import { Players } from "@rbxts/services";

print("🎮 Hello, Roblox! Server is running.");

// Greet players when they join
Players.PlayerAdded.Connect((player) => {
	print(`👋 Welcome to the game, ${player.Name}!`);
});

// Example: Handle player leaving
Players.PlayerRemoving.Connect((player) => {
	print(`👋 ${player.Name} has left the game.`);
});
