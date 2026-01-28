// Codes System - Redeem codes for rewards
// PROVEN: Every top Roblox game has codes - drives YouTube content, Twitter engagement, virality
import { Players, ReplicatedStorage } from "@rbxts/services";

interface CodeData {
	reward: number;
	rewardType: "coins" | "gems" | "pet";
	petName?: string;
	uses: number; // -1 = unlimited
	expiry?: number; // Unix timestamp, undefined = never expires
}

// Active codes - update these for marketing campaigns!
const ACTIVE_CODES: { [code: string]: CodeData } = {
	// Launch codes
	"LAUNCH": { reward: 500, rewardType: "coins", uses: -1 },
	"WELCOME": { reward: 100, rewardType: "coins", uses: -1 },
	"PETS": { reward: 250, rewardType: "coins", uses: -1 },
	
	// Social media codes
	"YOUTUBE": { reward: 200, rewardType: "coins", uses: -1 },
	"TWITTER": { reward: 150, rewardType: "coins", uses: -1 },
	"DISCORD": { reward: 300, rewardType: "coins", uses: -1 },
	
	// Limited codes (change these for events!)
	"UPDATE1": { reward: 1000, rewardType: "coins", uses: -1 },
	"THANKYOU": { reward: 500, rewardType: "coins", uses: -1 },
};

// Track which codes each player has used
const playerUsedCodes = new Map<Player, Set<string>>();
const codeUseCounts = new Map<string, number>();

export function setupCodesSystem() {
	const redeemCodeRemote = new Instance("RemoteFunction");
	redeemCodeRemote.Name = "RedeemCode";
	redeemCodeRemote.Parent = ReplicatedStorage;
	
	// Initialize players
	Players.PlayerAdded.Connect((player) => {
		playerUsedCodes.set(player, new Set<string>());
	});
	
	Players.PlayerRemoving.Connect((player) => {
		playerUsedCodes.delete(player);
	});
	
	// Redeem code
	redeemCodeRemote.OnServerInvoke = (player, inputCode) => {
		if (!typeIs(inputCode, "string")) {
			return { success: false, message: "Invalid code!" };
		}
		
		// Normalize code (uppercase, trim)
		const code = string.upper(inputCode);
		
		// Check if code exists
		const codeData = ACTIVE_CODES[code];
		if (!codeData) {
			return { success: false, message: "Invalid code!" };
		}
		
		// Check expiry
		if (codeData.expiry && os.time() > codeData.expiry) {
			return { success: false, message: "Code expired!" };
		}
		
		// Check uses
		if (codeData.uses !== -1) {
			const useCount = codeUseCounts.get(code) ?? 0;
			if (useCount >= codeData.uses) {
				return { success: false, message: "Code fully redeemed!" };
			}
		}
		
		// Check if player already used
		const usedCodes = playerUsedCodes.get(player);
		if (usedCodes?.has(code)) {
			return { success: false, message: "Already redeemed!" };
		}
		
		// Redeem!
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		
		if (codeData.rewardType === "coins" && coins) {
			coins.Value += codeData.reward;
		}
		
		// Mark as used
		usedCodes?.add(code);
		if (codeData.uses !== -1) {
			codeUseCounts.set(code, (codeUseCounts.get(code) ?? 0) + 1);
		}
		
		print(`🎁 ${player.Name} redeemed code ${code} for ${codeData.reward} ${codeData.rewardType}!`);
		
		return { 
			success: true, 
			reward: codeData.reward,
			rewardType: codeData.rewardType,
			message: `+${codeData.reward} ${codeData.rewardType}!`
		};
	};
	
	print("🎁 Codes system ready! Redeem codes for rewards!");
}

// Helper to add new codes at runtime (for live events)
export function addCode(code: string, data: CodeData) {
	ACTIVE_CODES[string.upper(code)] = data;
}
