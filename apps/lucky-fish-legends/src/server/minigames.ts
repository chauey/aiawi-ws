// Minigames System - Quick fun activities for variety
// PROVEN: Keeps players engaged between main activities
import { Players, ReplicatedStorage } from "@rbxts/services";

interface Minigame {
	id: string;
	name: string;
	emoji: string;
	description: string;
	reward: number;
	cooldown: number; // seconds
}

const MINIGAMES: Minigame[] = [
	{
		id: "coin_flip",
		name: "Coin Flip",
		emoji: "🪙",
		description: "Double or nothing!",
		reward: 50,
		cooldown: 30,
	},
	{
		id: "guess_number",
		name: "Guess Number",
		emoji: "🔢",
		description: "Guess 1-10 correctly!",
		reward: 100,
		cooldown: 45,
	},
	{
		id: "quick_math",
		name: "Quick Math",
		emoji: "➕",
		description: "Solve math fast!",
		reward: 75,
		cooldown: 30,
	},
	{
		id: "rock_paper",
		name: "Rock Paper Scissors",
		emoji: "✊",
		description: "Beat the computer!",
		reward: 60,
		cooldown: 20,
	},
];

// Track cooldowns
const playerCooldowns = new Map<Player, Map<string, number>>();

// Track active mini game answers
const activeAnswers = new Map<Player, { gameId: string; answer: number | string }>();

export function setupMinigames() {
	const getMinigamesRemote = new Instance("RemoteFunction");
	getMinigamesRemote.Name = "GetMinigames";
	getMinigamesRemote.Parent = ReplicatedStorage;
	
	const playMinigameRemote = new Instance("RemoteFunction");
	playMinigameRemote.Name = "PlayMinigame";
	playMinigameRemote.Parent = ReplicatedStorage;
	
	const submitAnswerRemote = new Instance("RemoteFunction");
	submitAnswerRemote.Name = "SubmitMinigameAnswer";
	submitAnswerRemote.Parent = ReplicatedStorage;
	
	// Initialize players
	Players.PlayerAdded.Connect((player) => {
		playerCooldowns.set(player, new Map());
	});
	
	Players.PlayerRemoving.Connect((player) => {
		playerCooldowns.delete(player);
		activeAnswers.delete(player);
	});
	
	// Get minigames list
	getMinigamesRemote.OnServerInvoke = (player) => {
		const cooldowns = playerCooldowns.get(player);
		const now = os.time();
		
		return MINIGAMES.map(g => ({
			id: g.id,
			name: g.name,
			emoji: g.emoji,
			description: g.description,
			reward: g.reward,
			canPlay: !cooldowns?.has(g.id) || (cooldowns.get(g.id) ?? 0) <= now,
			cooldownLeft: cooldowns?.has(g.id) ? math.max(0, (cooldowns.get(g.id) ?? 0) - now) : 0,
		}));
	};
	
	// Start minigame
	playMinigameRemote.OnServerInvoke = (player, gameId) => {
		if (!typeIs(gameId, "string")) return { success: false };
		
		const minigame = MINIGAMES.find(g => g.id === gameId);
		if (!minigame) return { success: false, message: "Minigame not found!" };
		
		const cooldowns = playerCooldowns.get(player);
		if (!cooldowns) return { success: false };
		
		const now = os.time();
		const cooldownEnd = cooldowns.get(gameId) ?? 0;
		
		if (cooldownEnd > now) {
			return { success: false, message: `Wait ${cooldownEnd - now}s!` };
		}
		
		// Generate game challenge
		let challenge = "";
		let correctAnswer: number | string = 0;
		
		switch (gameId) {
			case "coin_flip":
				correctAnswer = math.random(0, 1); // 0 = heads, 1 = tails
				challenge = "Pick: Heads (0) or Tails (1)";
				break;
			case "guess_number":
				correctAnswer = math.random(1, 10);
				challenge = "Guess a number from 1 to 10!";
				break;
			case "quick_math": {
				const a = math.random(1, 20);
				const b = math.random(1, 20);
				correctAnswer = a + b;
				challenge = `What is ${a} + ${b}?`;
				break;
			}
			case "rock_paper":
				correctAnswer = math.random(0, 2); // 0=rock, 1=paper, 2=scissors
				challenge = "Pick: Rock (0), Paper (1), or Scissors (2)";
				break;
		}
		
		activeAnswers.set(player, { gameId, answer: correctAnswer });
		
		return { success: true, challenge };
	};
	
	// Submit answer
	submitAnswerRemote.OnServerInvoke = (player, answer) => {
		if (!typeIs(answer, "number")) return { success: false };
		
		const active = activeAnswers.get(player);
		if (!active) return { success: false, message: "No active game!" };
		
		const minigame = MINIGAMES.find(g => g.id === active.gameId);
		if (!minigame) return { success: false };
		
		const cooldowns = playerCooldowns.get(player);
		if (cooldowns) {
			cooldowns.set(active.gameId, os.time() + minigame.cooldown);
		}
		
		activeAnswers.delete(player);
		
		// Check answer
		let won = false;
		
		if (active.gameId === "rock_paper") {
			// Rock paper scissors logic
			const playerChoice = answer;
			const cpuChoice = active.answer as number;
			// Player wins if (player - cpu) % 3 == 1
			won = (playerChoice - cpuChoice + 3) % 3 === 1;
		} else {
			won = answer === active.answer;
		}
		
		if (won) {
			const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
			const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
			if (coins) {
				coins.Value += minigame.reward;
			}
			
			print(`🎮 ${player.Name} won ${minigame.name}! +${minigame.reward} coins!`);
			return { success: true, won: true, reward: minigame.reward };
		}
		
		return { success: true, won: false, correct: active.answer };
	};
	
	print("🎮 Minigames ready! Quick activities for coins!");
}
