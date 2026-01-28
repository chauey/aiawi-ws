// Pet Battles - PvP with pets for rewards
// PROVEN: Competitive features drive engagement and rewatches of YouTubers
import { Players, ReplicatedStorage } from "@rbxts/services";

interface BattlePet {
	name: string;
	power: number;
	tier: string;
}

interface Battle {
	id: string;
	player1: Player;
	player2: Player;
	pet1: BattlePet;
	pet2: BattlePet;
	wager: number;
	status: "pending" | "active" | "finished";
	winner?: Player;
}

// Active battles and challenges
const pendingChallenges = new Map<Player, { target: Player; wager: number; pet: BattlePet }>();
const activeBattles = new Map<string, Battle>();

// Battle rewards multiplier
const WIN_MULTIPLIER = 2.0;

export function setupPetBattles() {
	const challengeRemote = new Instance("RemoteFunction");
	challengeRemote.Name = "ChallengeBattle";
	challengeRemote.Parent = ReplicatedStorage;
	
	const acceptChallengeRemote = new Instance("RemoteFunction");
	acceptChallengeRemote.Name = "AcceptChallenge";
	acceptChallengeRemote.Parent = ReplicatedStorage;
	
	const declineChallengeRemote = new Instance("RemoteFunction");
	declineChallengeRemote.Name = "DeclineChallenge";
	declineChallengeRemote.Parent = ReplicatedStorage;
	
	const battleNotifyRemote = new Instance("RemoteEvent");
	battleNotifyRemote.Name = "BattleNotify";
	battleNotifyRemote.Parent = ReplicatedStorage;
	
	const challengeNotifyRemote = new Instance("RemoteEvent");
	challengeNotifyRemote.Name = "ChallengeNotify";
	challengeNotifyRemote.Parent = ReplicatedStorage;
	
	// Cleanup on leave
	Players.PlayerRemoving.Connect((player) => {
		pendingChallenges.delete(player);
	});
	
	// Challenge another player
	challengeRemote.OnServerInvoke = (player, targetName, wager, petName, petPower) => {
		if (!typeIs(targetName, "string") || !typeIs(wager, "number") || !typeIs(petName, "string") || !typeIs(petPower, "number")) {
			return { success: false, message: "Invalid request!" };
		}
		
		const target = Players.FindFirstChild(targetName) as Player | undefined;
		if (!target || target === player) {
			return { success: false, message: "Player not found!" };
		}
		
		if (wager < 10) {
			return { success: false, message: "Min wager: 10 coins!" };
		}
		
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		
		if (!coins || coins.Value < wager) {
			return { success: false, message: "Not enough coins!" };
		}
		
		// Create challenge
		const pet: BattlePet = { name: petName, power: petPower, tier: "Normal" };
		pendingChallenges.set(player, { target, wager, pet });
		
		// Notify target
		challengeNotifyRemote.FireClient(target, player.Name, wager, petName);
		
		print(`⚔️ ${player.Name} challenged ${target.Name} to battle for ${wager} coins!`);
		
		return { success: true, message: "Challenge sent!" };
	};
	
	// Accept challenge
	acceptChallengeRemote.OnServerInvoke = (player, challengerName, petName, petPower) => {
		if (!typeIs(challengerName, "string") || !typeIs(petName, "string") || !typeIs(petPower, "number")) {
			return { success: false, message: "Invalid!" };
		}
		
		const challenger = Players.FindFirstChild(challengerName) as Player | undefined;
		if (!challenger) {
			return { success: false, message: "Challenger left!" };
		}
		
		const challenge = pendingChallenges.get(challenger);
		if (!challenge || challenge.target !== player) {
			return { success: false, message: "No challenge found!" };
		}
		
		// Check both have coins
		const ls1 = challenger.FindFirstChild("leaderstats") as Folder | undefined;
		const ls2 = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins1 = ls1?.FindFirstChild("Coins") as IntValue | undefined;
		const coins2 = ls2?.FindFirstChild("Coins") as IntValue | undefined;
		
		if (!coins1 || coins1.Value < challenge.wager || !coins2 || coins2.Value < challenge.wager) {
			pendingChallenges.delete(challenger);
			return { success: false, message: "Not enough coins!" };
		}
		
		// Start battle!
		pendingChallenges.delete(challenger);
		
		const pet2: BattlePet = { name: petName, power: petPower, tier: "Normal" };
		
		// Simple battle: compare power with randomness
		const roll1 = challenge.pet.power * (0.8 + math.random() * 0.4);
		const roll2 = pet2.power * (0.8 + math.random() * 0.4);
		
		const winner = roll1 > roll2 ? challenger : player;
		const loser = winner === challenger ? player : challenger;
		
		// Transfer coins
		if (winner === challenger) {
			coins1.Value += challenge.wager;
			coins2.Value -= challenge.wager;
		} else {
			coins1.Value -= challenge.wager;
			coins2.Value += challenge.wager;
		}
		
		// Notify both players
		battleNotifyRemote.FireClient(challenger, winner === challenger, winner.Name, challenge.wager);
		battleNotifyRemote.FireClient(player, winner === player, winner.Name, challenge.wager);
		
		print(`⚔️ Battle: ${winner.Name} won ${challenge.wager} coins!`);
		
		return { success: true, winner: winner.Name };
	};
	
	// Decline challenge
	declineChallengeRemote.OnServerInvoke = (player, challengerName) => {
		if (!typeIs(challengerName, "string")) return { success: false };
		
		const challenger = Players.FindFirstChild(challengerName) as Player | undefined;
		if (!challenger) return { success: false };
		
		const challenge = pendingChallenges.get(challenger);
		if (!challenge || challenge.target !== player) return { success: false };
		
		pendingChallenges.delete(challenger);
		
		// Notify challenger
		battleNotifyRemote.FireClient(challenger, false, "", 0);
		
		return { success: true };
	};
	
	print("⚔️ Pet Battles ready! Challenge players and wager coins!");
}
