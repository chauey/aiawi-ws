// Game Passes System - 2x Coins, VIP Pet, Speed Boost
import { Players, MarketplaceService, ReplicatedStorage } from "@rbxts/services";

// Game pass IDs (placeholder - these need to be created in the Roblox game settings)
// In production, replace with actual game pass IDs from Developer Portal
const GAME_PASS_IDS = {
	DOUBLE_COINS: 0,    // 2x Coin Multiplier
	VIP_PET: 0,         // VIP exclusive pet
	SPEED_BOOST: 0,     // Permanent speed boost
};

// Track which passes each player owns
const playerPasses = new Map<Player, Set<string>>();

export function setupGamePasses() {
	// Check passes when player joins
	Players.PlayerAdded.Connect((player) => {
		checkPlayerPasses(player);
	});
	
	// Handle existing players
	for (const player of Players.GetPlayers()) {
		checkPlayerPasses(player);
	}
	
	// Listen for pass purchases during gameplay
	MarketplaceService.PromptGamePassPurchaseFinished.Connect((player, passId, purchased) => {
		if (purchased) {
			const passName = getPassNameById(passId);
			if (passName) {
				grantPassBenefits(player, passName);
				print(`🎫 ${player.Name} purchased ${passName}!`);
			}
		}
	});
	
	// Create remote for checking pass status
	const checkPassRemote = new Instance("RemoteFunction");
	checkPassRemote.Name = "CheckGamePass";
	checkPassRemote.Parent = ReplicatedStorage;
	
	checkPassRemote.OnServerInvoke = (player, passName: unknown) => {
		if (typeIs(passName, "string")) {
			return hasPass(player, passName);
		}
		return false;
	};
	
	print("🎫 Game Passes system ready!");
}

function checkPlayerPasses(player: Player) {
	const ownedPasses = new Set<string>();
	
	// Check each game pass (only if IDs are set)
	const passNames = ["DOUBLE_COINS", "VIP_PET", "SPEED_BOOST"] as const;
	for (const passName of passNames) {
		const passId = GAME_PASS_IDS[passName];
		if (passId > 0) {
			try {
				const owns = MarketplaceService.UserOwnsGamePassAsync(player.UserId, passId);
				if (owns) {
					ownedPasses.add(passName);
					grantPassBenefits(player, passName);
				}
			} catch (e) {
				warn(`Failed to check ${passName} pass for ${player.Name}`);
			}
		}
	}
	
	playerPasses.set(player, ownedPasses);
	
	// For demo purposes, give everyone the benefits (remove in production)
	print(`🎫 ${player.Name} game passes checked (demo mode)`);
}

function getPassNameById(passId: number): string | undefined {
	if (passId === GAME_PASS_IDS.DOUBLE_COINS) return "DOUBLE_COINS";
	if (passId === GAME_PASS_IDS.VIP_PET) return "VIP_PET";
	if (passId === GAME_PASS_IDS.SPEED_BOOST) return "SPEED_BOOST";
	return undefined;
}

export function hasPass(player: Player, passName: string): boolean {
	return playerPasses.get(player)?.has(passName) ?? false;
}

export function getCoinMultiplier(player: Player): number {
	return hasPass(player, "DOUBLE_COINS") ? 2 : 1;
}

function grantPassBenefits(player: Player, passName: string) {
	const passes = playerPasses.get(player) ?? new Set<string>();
	passes.add(passName);
	playerPasses.set(player, passes);
	
	switch (passName) {
		case "SPEED_BOOST":
			const char = player.Character;
			const humanoid = char?.FindFirstChildOfClass("Humanoid");
			if (humanoid) {
				humanoid.WalkSpeed = 24;
			}
			player.CharacterAdded.Connect((newChar) => {
				const hum = newChar.WaitForChild("Humanoid") as Humanoid;
				hum.WalkSpeed = 24;
			});
			print(`🏃 ${player.Name} has Speed Boost!`);
			break;
			
		case "DOUBLE_COINS":
			print(`💰 ${player.Name} has 2x Coins!`);
			break;
			
		case "VIP_PET":
			print(`👑 ${player.Name} has VIP Pet access!`);
			break;
	}
}

// Cleanup on player leave
Players.PlayerRemoving.Connect((player) => {
	playerPasses.delete(player);
});
