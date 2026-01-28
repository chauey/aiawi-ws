// Clans System - Group up with friends for bonuses
// PROVEN: Social features increase retention, players stay for friends
import { Players, ReplicatedStorage } from "@rbxts/services";

interface Clan {
	id: string;
	name: string;
	tag: string;
	owner: Player;
	members: Set<Player>;
	totalCoins: number;
	created: number;
}

// Cost to create a clan
const CLAN_CREATE_COST = 500;
const MAX_CLAN_MEMBERS = 10;
const CLAN_BONUS = 0.1; // 10% bonus coins when in clan

// Active clans
const clans = new Map<string, Clan>();
const playerClan = new Map<Player, string>();

export function setupClanSystem() {
	const getClanInfoRemote = new Instance("RemoteFunction");
	getClanInfoRemote.Name = "GetClanInfo";
	getClanInfoRemote.Parent = ReplicatedStorage;
	
	const createClanRemote = new Instance("RemoteFunction");
	createClanRemote.Name = "CreateClan";
	createClanRemote.Parent = ReplicatedStorage;
	
	const joinClanRemote = new Instance("RemoteFunction");
	joinClanRemote.Name = "JoinClan";
	joinClanRemote.Parent = ReplicatedStorage;
	
	const leaveClanRemote = new Instance("RemoteFunction");
	leaveClanRemote.Name = "LeaveClan";
	leaveClanRemote.Parent = ReplicatedStorage;
	
	const listClansRemote = new Instance("RemoteFunction");
	listClansRemote.Name = "ListClans";
	listClansRemote.Parent = ReplicatedStorage;
	
	// Cleanup on player leave
	Players.PlayerRemoving.Connect((player) => {
		const clanId = playerClan.get(player);
		if (clanId) {
			const clan = clans.get(clanId);
			if (clan) {
				clan.members.delete(player);
				if (clan.owner === player) {
					// Transfer ownership or disband
					const newOwner = [...clan.members][0];
					if (newOwner) {
						clan.owner = newOwner;
					} else {
						clans.delete(clanId);
					}
				}
			}
		}
		playerClan.delete(player);
	});
	
	// Get player's clan info
	getClanInfoRemote.OnServerInvoke = (player) => {
		const clanId = playerClan.get(player);
		if (!clanId) return { inClan: false };
		
		const clan = clans.get(clanId);
		if (!clan) return { inClan: false };
		
		return {
			inClan: true,
			name: clan.name,
			tag: clan.tag,
			memberCount: clan.members.size(),
			maxMembers: MAX_CLAN_MEMBERS,
			totalCoins: clan.totalCoins,
			isOwner: clan.owner === player,
			bonus: CLAN_BONUS * 100,
		};
	};
	
	// Create clan
	createClanRemote.OnServerInvoke = (player, name, tag) => {
		if (!typeIs(name, "string") || !typeIs(tag, "string")) {
			return { success: false, message: "Invalid input!" };
		}
		
		if (playerClan.has(player)) {
			return { success: false, message: "Already in a clan!" };
		}
		
		if (name.size() < 3 || name.size() > 20) {
			return { success: false, message: "Name must be 3-20 chars!" };
		}
		
		if (tag.size() < 2 || tag.size() > 5) {
			return { success: false, message: "Tag must be 2-5 chars!" };
		}
		
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coins = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		
		if (!coins || coins.Value < CLAN_CREATE_COST) {
			return { success: false, message: `Need ${CLAN_CREATE_COST} coins!` };
		}
		
		coins.Value -= CLAN_CREATE_COST;
		
		const clanId = `clan_${os.time()}_${math.random(1000, 9999)}`;
		const clan: Clan = {
			id: clanId,
			name: name,
			tag: string.upper(tag),
			owner: player,
			members: new Set([player]),
			totalCoins: 0,
			created: os.time(),
		};
		
		clans.set(clanId, clan);
		playerClan.set(player, clanId);
		
		print(`👥 ${player.Name} created clan: [${tag}] ${name}!`);
		
		return { success: true, clanId };
	};
	
	// List clans
	listClansRemote.OnServerInvoke = () => {
		const clanList: { id: string; name: string; tag: string; members: number; totalCoins: number }[] = [];
		
		for (const [id, clan] of clans) {
			clanList.push({
				id,
				name: clan.name,
				tag: clan.tag,
				members: clan.members.size(),
				totalCoins: clan.totalCoins,
			});
		}
		
		// Sort by total coins
		clanList.sort((a, b) => b.totalCoins > a.totalCoins);
		
		return clanList;
	};
	
	// Join clan
	joinClanRemote.OnServerInvoke = (player, clanId) => {
		if (!typeIs(clanId, "string")) return { success: false };
		
		if (playerClan.has(player)) {
			return { success: false, message: "Already in a clan!" };
		}
		
		const clan = clans.get(clanId);
		if (!clan) return { success: false, message: "Clan not found!" };
		
		if (clan.members.size() >= MAX_CLAN_MEMBERS) {
			return { success: false, message: "Clan is full!" };
		}
		
		clan.members.add(player);
		playerClan.set(player, clanId);
		
		print(`👥 ${player.Name} joined clan: [${clan.tag}] ${clan.name}!`);
		
		return { success: true };
	};
	
	// Leave clan
	leaveClanRemote.OnServerInvoke = (player) => {
		const clanId = playerClan.get(player);
		if (!clanId) return { success: false, message: "Not in a clan!" };
		
		const clan = clans.get(clanId);
		if (!clan) return { success: false };
		
		clan.members.delete(player);
		playerClan.delete(player);
		
		if (clan.owner === player) {
			const newOwner = [...clan.members][0];
			if (newOwner) {
				clan.owner = newOwner;
			} else {
				clans.delete(clanId);
			}
		}
		
		print(`👥 ${player.Name} left their clan!`);
		
		return { success: true };
	};
	
	print("👥 Clans ready! Create or join a clan for 10% bonus!");
}

// Get clan bonus for player (call when collecting coins)
export function getClanBonus(player: Player): number {
	const clanId = playerClan.get(player);
	if (!clanId) return 0;
	
	const clan = clans.get(clanId);
	if (!clan) return 0;
	
	return CLAN_BONUS;
}

// Add to clan total (call when collecting coins)
export function addToClanTotal(player: Player, amount: number) {
	const clanId = playerClan.get(player);
	if (!clanId) return;
	
	const clan = clans.get(clanId);
	if (clan) {
		clan.totalCoins += amount;
	}
}
