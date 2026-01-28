// Premium Pass - Monthly subscription with exclusive benefits
// PROVEN: Pet Simulator X and Blox Fruits use passes for recurring revenue
import { Players, ReplicatedStorage, MarketplaceService } from "@rbxts/services";

// Premium pass game pass ID (replace with real ID when published)
const PREMIUM_PASS_ID = 123456789; // TODO: Replace with actual game pass ID

interface PremiumBenefits {
	coinMultiplier: number;
	dailyBonus: number;
	exclusivePets: string[];
	vipAccess: boolean;
	noAds: boolean;
	extraEggSlots: number;
}

const PREMIUM_BENEFITS: PremiumBenefits = {
	coinMultiplier: 2.0,    // 2x coins!
	dailyBonus: 1000,       // 1000 extra daily coins
	exclusivePets: ["diamond_dragon", "golden_unicorn", "cyber_phoenix"],
	vipAccess: true,
	noAds: true,
	extraEggSlots: 3,
};

// Track premium players
const premiumPlayers = new Set<Player>();

export function setupPremiumPass() {
	const checkPremiumRemote = new Instance("RemoteFunction");
	checkPremiumRemote.Name = "CheckPremium";
	checkPremiumRemote.Parent = ReplicatedStorage;
	
	const getPremiumBenefitsRemote = new Instance("RemoteFunction");
	getPremiumBenefitsRemote.Name = "GetPremiumBenefits";
	getPremiumBenefitsRemote.Parent = ReplicatedStorage;
	
	const claimDailyBonusRemote = new Instance("RemoteFunction");
	claimDailyBonusRemote.Name = "ClaimPremiumDaily";
	claimDailyBonusRemote.Parent = ReplicatedStorage;
	
	const premiumNotifyRemote = new Instance("RemoteEvent");
	premiumNotifyRemote.Name = "PremiumNotify";
	premiumNotifyRemote.Parent = ReplicatedStorage;
	
	// Track daily claims
	const dailyClaims = new Map<Player, number>();
	
	// Check premium status on join
	Players.PlayerAdded.Connect((player) => {
		// For testing, simulate premium. In production use MarketplaceService
		// const hasPremium = MarketplaceService.UserOwnsGamePassAsync(player.UserId, PREMIUM_PASS_ID);
		const hasPremium = false; // Default to false, player can "unlock" for testing
		
		if (hasPremium) {
			premiumPlayers.add(player);
			print(`⭐ ${player.Name} has Premium Pass!`);
		}
	});
	
	Players.PlayerRemoving.Connect((player) => {
		premiumPlayers.delete(player);
		dailyClaims.delete(player);
	});
	
	// Check if player has premium
	checkPremiumRemote.OnServerInvoke = (player) => {
		return { hasPremium: premiumPlayers.has(player) };
	};
	
	// Get premium benefits
	getPremiumBenefitsRemote.OnServerInvoke = () => {
		return {
			coinMultiplier: PREMIUM_BENEFITS.coinMultiplier,
			dailyBonus: PREMIUM_BENEFITS.dailyBonus,
			exclusivePets: PREMIUM_BENEFITS.exclusivePets,
			vipAccess: PREMIUM_BENEFITS.vipAccess,
			noAds: PREMIUM_BENEFITS.noAds,
			extraEggSlots: PREMIUM_BENEFITS.extraEggSlots,
		};
	};
	
	// Claim premium daily bonus
	claimDailyBonusRemote.OnServerInvoke = (player) => {
		if (!premiumPlayers.has(player)) {
			return { success: false, message: "Need Premium Pass!" };
		}
		
		const today = math.floor(os.time() / 86400);
		const lastClaim = dailyClaims.get(player) ?? 0;
		
		if (lastClaim === today) {
			return { success: false, message: "Already claimed today!" };
		}
		
		dailyClaims.set(player, today);
		
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		
		if (coins) {
			coins.Value += PREMIUM_BENEFITS.dailyBonus;
		}
		
		print(`⭐ ${player.Name} claimed premium daily bonus: +${PREMIUM_BENEFITS.dailyBonus}!`);
		
		return { success: true, bonus: PREMIUM_BENEFITS.dailyBonus };
	};
	
	print("⭐ Premium Pass system ready! 2x coins + exclusive perks!");
}

// Check if player is premium (call from other systems)
export function isPremium(player: Player): boolean {
	return premiumPlayers.has(player);
}

// Get premium coin multiplier
export function getPremiumMultiplier(player: Player): number {
	return premiumPlayers.has(player) ? PREMIUM_BENEFITS.coinMultiplier : 1.0;
}

// Simulate unlocking premium (for testing)
export function grantPremium(player: Player) {
	premiumPlayers.add(player);
	print(`⭐ ${player.Name} unlocked Premium Pass!`);
}
