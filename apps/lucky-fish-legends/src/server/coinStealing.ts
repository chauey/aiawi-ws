// Coin Stealing System - Touch to steal coins
// Best practices from popular games:
// 1. Steal only a percentage (not all) - prevents griefing
// 2. Cooldown between steals - prevents spam
// 3. Protection timer after being robbed - fair play
// 4. Visual feedback - clear what happened
import { Players, ReplicatedStorage } from "@rbxts/services";

// Configuration - tweak for balance
const STEAL_PERCENTAGE = 0.25; // Steal 25% of victim's coins
const STEAL_COOLDOWN = 5; // Seconds between steals
const PROTECTION_TIME = 3; // Seconds of protection after being robbed
const MIN_STEAL_AMOUNT = 1; // Minimum coins to steal

// Track cooldowns and protection
const stealCooldowns = new Map<Player, number>();
const protectedPlayers = new Map<Player, number>();

export function setupCoinStealingSystem() {
	// Create remote for steal notifications
	const stealNotifyRemote = new Instance("RemoteEvent");
	stealNotifyRemote.Name = "CoinStealNotify";
	stealNotifyRemote.Parent = ReplicatedStorage;
	
	// Connect to each player
	Players.PlayerAdded.Connect((player) => {
		player.CharacterAdded.Connect((character) => {
			setupStealingForCharacter(player, character, stealNotifyRemote);
		});
		
		// If character already exists
		if (player.Character) {
			setupStealingForCharacter(player, player.Character, stealNotifyRemote);
		}
	});
	
	// Handle existing players
	for (const player of Players.GetPlayers()) {
		if (player.Character) {
			setupStealingForCharacter(player, player.Character, stealNotifyRemote);
		}
		player.CharacterAdded.Connect((character) => {
			setupStealingForCharacter(player, character, stealNotifyRemote);
		});
	}
	
	// Cleanup on player leave
	Players.PlayerRemoving.Connect((player) => {
		stealCooldowns.delete(player);
		protectedPlayers.delete(player);
	});
	
	print("💰 Coin stealing system ready! Touch others to steal 25% of their coins!");
}

function setupStealingForCharacter(thief: Player, character: Model, notifyRemote: RemoteEvent) {
	const hrp = character.WaitForChild("HumanoidRootPart", 5) as Part | undefined;
	if (!hrp) return;
	
	hrp.Touched.Connect((hit) => {
		// Check if hit another player
		const hitCharacter = hit.Parent as Model | undefined;
		if (!hitCharacter) return;
		
		const victim = Players.GetPlayerFromCharacter(hitCharacter);
		if (!victim || victim === thief) return;
		
		// Attempt steal
		tryStealCoins(thief, victim, notifyRemote);
	});
}

function tryStealCoins(thief: Player, victim: Player, notifyRemote: RemoteEvent) {
	const now = os.time();
	
	// Check thief cooldown
	const thiefCooldown = stealCooldowns.get(thief) ?? 0;
	if (now < thiefCooldown) return;
	
	// Check victim protection
	const victimProtection = protectedPlayers.get(victim) ?? 0;
	if (now < victimProtection) return;
	
	// Get coin values
	const thiefStats = thief.FindFirstChild("leaderstats") as Folder | undefined;
	const victimStats = victim.FindFirstChild("leaderstats") as Folder | undefined;
	const thiefCoins = thiefStats?.FindFirstChild("Coins") as IntValue | undefined;
	const victimCoins = victimStats?.FindFirstChild("Coins") as IntValue | undefined;
	
	if (!thiefCoins || !victimCoins) return;
	if (victimCoins.Value < MIN_STEAL_AMOUNT) return;
	
	// Calculate steal amount
	const stealAmount = math.max(MIN_STEAL_AMOUNT, math.floor(victimCoins.Value * STEAL_PERCENTAGE));
	
	// Execute steal
	victimCoins.Value -= stealAmount;
	thiefCoins.Value += stealAmount;
	
	// Set cooldowns
	stealCooldowns.set(thief, now + STEAL_COOLDOWN);
	protectedPlayers.set(victim, now + PROTECTION_TIME);
	
	// Notify both players
	notifyRemote.FireClient(thief, "stole", victim.Name, stealAmount);
	notifyRemote.FireClient(victim, "robbed", thief.Name, stealAmount);
	
	print(`💰 ${thief.Name} stole ${stealAmount} coins from ${victim.Name}!`);
}

// Export config for UI to read
export const STEAL_CONFIG = {
	percentage: STEAL_PERCENTAGE,
	cooldown: STEAL_COOLDOWN,
	protection: PROTECTION_TIME
};
