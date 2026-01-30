// Daily Quests System - Goals to complete for rewards
// Like Fortnite daily challenges - keeps players coming back!
import { Players, ReplicatedStorage } from "@rbxts/services";

interface Quest {
	id: string;
	name: string;
	description: string;
	target: number;
	reward: number;
	type: "collect" | "steal" | "rebirth" | "hatch" | "visit";
}

// Daily quest pool (randomly pick 3 each day)
const QUEST_POOL: Quest[] = [
	{ id: "collect_50", name: "Coin Hunter", description: "Collect 50 coins", target: 50, reward: 100, type: "collect" },
	{ id: "collect_200", name: "Coin Master", description: "Collect 200 coins", target: 200, reward: 500, type: "collect" },
	{ id: "steal_5", name: "Sneaky Thief", description: "Steal from 5 players", target: 5, reward: 200, type: "steal" },
	{ id: "steal_10", name: "Master Thief", description: "Steal from 10 players", target: 10, reward: 400, type: "steal" },
	{ id: "hatch_3", name: "Egg Collector", description: "Hatch 3 eggs", target: 3, reward: 300, type: "hatch" },
	{ id: "hatch_5", name: "Pet Hoarder", description: "Hatch 5 eggs", target: 5, reward: 600, type: "hatch" },
	{ id: "visit_3", name: "Explorer", description: "Visit 3 different maps", target: 3, reward: 150, type: "visit" },
	{ id: "visit_all", name: "World Traveler", description: "Visit all 6 maps", target: 6, reward: 500, type: "visit" },
];

// Player quest progress
interface PlayerQuests {
	quests: { quest: Quest; progress: number; completed: boolean }[];
	lastReset: number;
}

const playerQuests = new Map<Player, PlayerQuests>();

export function setupQuestSystem() {
	// Create remotes
	const getQuestsRemote = new Instance("RemoteFunction");
	getQuestsRemote.Name = "GetQuests";
	getQuestsRemote.Parent = ReplicatedStorage;
	
	const claimQuestRemote = new Instance("RemoteFunction");
	claimQuestRemote.Name = "ClaimQuest";
	claimQuestRemote.Parent = ReplicatedStorage;
	
	const questProgressRemote = new Instance("RemoteEvent");
	questProgressRemote.Name = "QuestProgress";
	questProgressRemote.Parent = ReplicatedStorage;
	
	// Initialize players
	Players.PlayerAdded.Connect((player) => {
		initializePlayerQuests(player);
	});
	
	Players.PlayerRemoving.Connect((player) => {
		playerQuests.delete(player);
	});
	
	// Get quests
	getQuestsRemote.OnServerInvoke = (player) => {
		checkQuestReset(player);
		const data = playerQuests.get(player);
		return data?.quests ?? [];
	};
	
	// Claim completed quest
	claimQuestRemote.OnServerInvoke = (player, questId) => {
		if (!typeIs(questId, "string")) return { success: false };
		
		const data = playerQuests.get(player);
		if (!data) return { success: false };
		
		const questEntry = data.quests.find(q => q.quest.id === questId);
		if (!questEntry || questEntry.completed || questEntry.progress < questEntry.quest.target) {
			return { success: false, message: "Quest not complete!" };
		}
		
		// Mark completed and give reward
		questEntry.completed = true;
		
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		if (coins) {
			coins.Value += questEntry.quest.reward;
		}
		
		print(`✅ ${player.Name} completed quest: ${questEntry.quest.name}! +${questEntry.quest.reward} coins`);
		
		return { success: true, reward: questEntry.quest.reward };
	};
	
	print("📋 Quest system ready! Complete daily quests for rewards!");
}

function initializePlayerQuests(player: Player) {
	const today = os.date("!*t").yday;
	
	// Pick 3 random quests using Fisher-Yates shuffle
	const pool = [...QUEST_POOL];
	for (let i = pool.size() - 1; i > 0; i--) {
		const j = math.floor(math.random() * (i + 1));
		const temp = pool[i];
		pool[i] = pool[j];
		pool[j] = temp;
	}
	
	// Take first 3
	const selectedQuests: Quest[] = [];
	for (let i = 0; i < 3 && i < pool.size(); i++) {
		selectedQuests.push(pool[i]);
	}
	
	const quests = selectedQuests.map((q: Quest) => ({
		quest: q,
		progress: 0,
		completed: false
	}));
	
	playerQuests.set(player, {
		quests,
		lastReset: today
	});
}

function checkQuestReset(player: Player) {
	const data = playerQuests.get(player);
	if (!data) return;
	
	const today = os.date("!*t").yday;
	if (data.lastReset !== today) {
		// New day - reset quests
		initializePlayerQuests(player);
	}
}

// Update quest progress (call from other systems)
export function updateQuestProgress(player: Player, questType: Quest["type"], amount = 1) {
	const data = playerQuests.get(player);
	if (!data) return;
	
	for (const entry of data.quests) {
		if (entry.quest.type === questType && !entry.completed) {
			entry.progress = math.min(entry.progress + amount, entry.quest.target);
			
			// Notify client of progress
			const progressRemote = ReplicatedStorage.FindFirstChild("QuestProgress") as RemoteEvent | undefined;
			if (progressRemote) {
				progressRemote.FireClient(player, entry.quest.id, entry.progress, entry.quest.target);
			}
		}
	}
}
