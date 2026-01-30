// Lucky Wheel - Spin for random prizes!
// Creates addictive gambling-like excitement (without real money!)
import { Players, ReplicatedStorage } from "@rbxts/services";

// Wheel prizes with weights (higher = more common)
const WHEEL_PRIZES = [
	{ name: "5 Coins", value: 5, weight: 30, color: Color3.fromRGB(200, 200, 200) },
	{ name: "25 Coins", value: 25, weight: 25, color: Color3.fromRGB(180, 180, 180) },
	{ name: "50 Coins", value: 50, weight: 20, color: Color3.fromRGB(100, 200, 100) },
	{ name: "100 Coins", value: 100, weight: 12, color: Color3.fromRGB(100, 150, 255) },
	{ name: "250 Coins", value: 250, weight: 8, color: Color3.fromRGB(180, 100, 255) },
	{ name: "500 Coins", value: 500, weight: 4, color: Color3.fromRGB(255, 200, 50) },
	{ name: "JACKPOT!", value: 1000, weight: 1, color: Color3.fromRGB(255, 100, 150) },
];

const SPIN_COST = 25; // Coins to spin
const FREE_SPIN_INTERVAL = 300; // Free spin every 5 minutes

// Track last free spin time
const playerLastFreeSpin = new Map<Player, number>();

export function setupLuckyWheel() {
	const spinRemote = new Instance("RemoteFunction");
	spinRemote.Name = "SpinWheel";
	spinRemote.Parent = ReplicatedStorage;
	
	const getSpinInfoRemote = new Instance("RemoteFunction");
	getSpinInfoRemote.Name = "GetSpinInfo";
	getSpinInfoRemote.Parent = ReplicatedStorage;
	
	// Initialize players
	Players.PlayerAdded.Connect((player) => {
		playerLastFreeSpin.set(player, 0);
	});
	
	Players.PlayerRemoving.Connect((player) => {
		playerLastFreeSpin.delete(player);
	});
	
	// Get spin info
	getSpinInfoRemote.OnServerInvoke = (player) => {
		const lastFree = playerLastFreeSpin.get(player) ?? 0;
		const now = os.time();
		const canFreeSpin = now - lastFree >= FREE_SPIN_INTERVAL;
		const nextFreeIn = canFreeSpin ? 0 : FREE_SPIN_INTERVAL - (now - lastFree);
		
		return {
			canFreeSpin,
			nextFreeIn,
			spinCost: SPIN_COST,
			prizes: WHEEL_PRIZES.map(p => ({ name: p.name, color: [p.color.R * 255, p.color.G * 255, p.color.B * 255] }))
		};
	};
	
	// Spin the wheel
	spinRemote.OnServerInvoke = (player, useFree) => {
		const lastFree = playerLastFreeSpin.get(player) ?? 0;
		const now = os.time();
		const canFreeSpin = now - lastFree >= FREE_SPIN_INTERVAL;
		
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		
		if (useFree && canFreeSpin) {
			// Use free spin
			playerLastFreeSpin.set(player, now);
		} else {
			// Pay for spin
			if (!coins || coins.Value < SPIN_COST) {
				return { success: false, message: `Need ${SPIN_COST} coins!` };
			}
			coins.Value -= SPIN_COST;
		}
		
		// Roll for prize
		const prize = rollPrize();
		
		// Give prize
		if (coins) {
			coins.Value += prize.value;
		}
		
		print(`🎡 ${player.Name} spun the wheel and won ${prize.name}!`);
		
		return { 
			success: true, 
			prize: prize.name, 
			value: prize.value,
			colorR: prize.color.R * 255,
			colorG: prize.color.G * 255,
			colorB: prize.color.B * 255
		};
	};
	
	print("🎡 Lucky wheel ready! Spin for prizes!");
}

function rollPrize() {
	let totalWeight = 0;
	for (const p of WHEEL_PRIZES) {
		totalWeight += p.weight;
	}
	
	let roll = math.random() * totalWeight;
	
	for (const p of WHEEL_PRIZES) {
		roll -= p.weight;
		if (roll <= 0) {
			return p;
		}
	}
	
	return WHEEL_PRIZES[0];
}
