// Trading System - Server-side pet and coin trading with scam protection
import { Players, ReplicatedStorage } from "@rbxts/services";

// Active trade sessions
interface TradeSession {
	player1: Player;
	player2: Player;
	player1Offer: { coins: number; pet: string | undefined };
	player2Offer: { coins: number; pet: string | undefined };
	player1Confirmed: boolean;
	player2Confirmed: boolean;
}

const activeTrades = new Map<string, TradeSession>();
const tradeRequests = new Map<string, { from: Player; to: Player; timestamp: number }>();

// Player's owned pets (simplified - in production use DataStore)
const playerPets = new Map<Player, string[]>();

export function setupTradingSystem() {
	// Create remotes
	const requestTradeRemote = new Instance("RemoteEvent");
	requestTradeRemote.Name = "RequestTrade";
	requestTradeRemote.Parent = ReplicatedStorage;
	
	const respondTradeRemote = new Instance("RemoteEvent");
	respondTradeRemote.Name = "RespondTrade";
	respondTradeRemote.Parent = ReplicatedStorage;
	
	const updateOfferRemote = new Instance("RemoteEvent");
	updateOfferRemote.Name = "UpdateTradeOffer";
	updateOfferRemote.Parent = ReplicatedStorage;
	
	const confirmTradeRemote = new Instance("RemoteEvent");
	confirmTradeRemote.Name = "ConfirmTrade";
	confirmTradeRemote.Parent = ReplicatedStorage;
	
	const cancelTradeRemote = new Instance("RemoteEvent");
	cancelTradeRemote.Name = "CancelTrade";
	cancelTradeRemote.Parent = ReplicatedStorage;
	
	const tradeUpdateRemote = new Instance("RemoteEvent");
	tradeUpdateRemote.Name = "TradeUpdate";
	tradeUpdateRemote.Parent = ReplicatedStorage;
	
	const getOwnedPetsRemote = new Instance("RemoteFunction");
	getOwnedPetsRemote.Name = "GetOwnedPets";
	getOwnedPetsRemote.Parent = ReplicatedStorage;
	
	// Initialize player pets
	Players.PlayerAdded.Connect((player) => {
		playerPets.set(player, []);
	});
	
	Players.PlayerRemoving.Connect((player) => {
		playerPets.delete(player);
		// Cancel any active trades
		cancelPlayerTrades(player, tradeUpdateRemote);
	});
	
	// Get owned pets
	getOwnedPetsRemote.OnServerInvoke = (player) => {
		return playerPets.get(player) ?? [];
	};
	
	// Request trade
	requestTradeRemote.OnServerEvent.Connect((fromPlayer, targetPlayerName) => {
		if (!typeIs(targetPlayerName, "string")) return;
		
		const targetPlayer = Players.FindFirstChild(targetPlayerName) as Player | undefined;
		if (!targetPlayer || targetPlayer === fromPlayer) return;
		
		const requestKey = `${fromPlayer.Name}_${targetPlayer.Name}`;
		tradeRequests.set(requestKey, {
			from: fromPlayer,
			to: targetPlayer,
			timestamp: os.time()
		});
		
		// Notify target player
		tradeUpdateRemote.FireClient(targetPlayer, "request", fromPlayer.Name);
		print(`📦 ${fromPlayer.Name} requested trade with ${targetPlayer.Name}`);
	});
	
	// Respond to trade request
	respondTradeRemote.OnServerEvent.Connect((player, fromPlayerName, accepted) => {
		if (!typeIs(fromPlayerName, "string") || !typeIs(accepted, "boolean")) return;
		
		const requestKey = `${fromPlayerName}_${player.Name}`;
		const request = tradeRequests.get(requestKey);
		
		if (!request) return;
		tradeRequests.delete(requestKey);
		
		if (accepted) {
			// Start trade session
			const tradeKey = `${request.from.Name}_${player.Name}`;
			const session: TradeSession = {
				player1: request.from,
				player2: player,
				player1Offer: { coins: 0, pet: undefined },
				player2Offer: { coins: 0, pet: undefined },
				player1Confirmed: false,
				player2Confirmed: false
			};
			activeTrades.set(tradeKey, session);
			
			// Notify both players
			tradeUpdateRemote.FireClient(request.from, "started", player.Name);
			tradeUpdateRemote.FireClient(player, "started", request.from.Name);
			print(`🤝 Trade started between ${request.from.Name} and ${player.Name}`);
		} else {
			tradeUpdateRemote.FireClient(request.from, "declined", player.Name);
		}
	});
	
	// Update trade offer
	updateOfferRemote.OnServerEvent.Connect((player, coins, petName) => {
		if (!typeIs(coins, "number")) return;
		
		const session = findPlayerSession(player);
		if (!session) return;
		
		// Validate coins
		const leaderstats = player.FindFirstChild("leaderstats") as Folder | undefined;
		const coinsValue = leaderstats?.FindFirstChild("Coins") as IntValue | undefined;
		const maxCoins = coinsValue?.Value ?? 0;
		const validCoins = math.clamp(coins, 0, maxCoins);
		
		// Update offer
		if (session.player1 === player) {
			session.player1Offer = { coins: validCoins, pet: typeIs(petName, "string") ? petName : undefined };
			session.player1Confirmed = false;
			session.player2Confirmed = false;
		} else {
			session.player2Offer = { coins: validCoins, pet: typeIs(petName, "string") ? petName : undefined };
			session.player1Confirmed = false;
			session.player2Confirmed = false;
		}
		
		// Notify both players of updated offers
		tradeUpdateRemote.FireClient(session.player1, "offer_update", session.player1Offer, session.player2Offer, false, false);
		tradeUpdateRemote.FireClient(session.player2, "offer_update", session.player2Offer, session.player1Offer, false, false);
	});
	
	// Confirm trade (both must confirm)
	confirmTradeRemote.OnServerEvent.Connect((player) => {
		const session = findPlayerSession(player);
		if (!session) return;
		
		if (session.player1 === player) {
			session.player1Confirmed = true;
		} else {
			session.player2Confirmed = true;
		}
		
		// Notify both of confirmation status
		tradeUpdateRemote.FireClient(session.player1, "confirm_status", session.player1Confirmed, session.player2Confirmed);
		tradeUpdateRemote.FireClient(session.player2, "confirm_status", session.player2Confirmed, session.player1Confirmed);
		
		// If both confirmed, execute trade
		if (session.player1Confirmed && session.player2Confirmed) {
			executeTrade(session, tradeUpdateRemote);
		}
	});
	
	// Cancel trade
	cancelTradeRemote.OnServerEvent.Connect((player) => {
		cancelPlayerTrades(player, tradeUpdateRemote);
	});
	
	print("🔄 Trading system ready!");
}

function findPlayerSession(player: Player): TradeSession | undefined {
	for (const [key, session] of activeTrades) {
		if (session.player1 === player || session.player2 === player) {
			return session;
		}
	}
	return undefined;
}

function cancelPlayerTrades(player: Player, tradeUpdateRemote: RemoteEvent) {
	for (const [key, session] of activeTrades) {
		if (session.player1 === player || session.player2 === player) {
			const otherPlayer = session.player1 === player ? session.player2 : session.player1;
			tradeUpdateRemote.FireClient(otherPlayer, "cancelled");
			activeTrades.delete(key);
			print(`❌ Trade cancelled between ${session.player1.Name} and ${session.player2.Name}`);
		}
	}
}

function executeTrade(session: TradeSession, tradeUpdateRemote: RemoteEvent) {
	const p1Stats = session.player1.FindFirstChild("leaderstats") as Folder | undefined;
	const p2Stats = session.player2.FindFirstChild("leaderstats") as Folder | undefined;
	const p1Coins = p1Stats?.FindFirstChild("Coins") as IntValue | undefined;
	const p2Coins = p2Stats?.FindFirstChild("Coins") as IntValue | undefined;
	
	if (!p1Coins || !p2Coins) {
		tradeUpdateRemote.FireClient(session.player1, "failed", "Could not complete trade");
		tradeUpdateRemote.FireClient(session.player2, "failed", "Could not complete trade");
		return;
	}
	
	// Final validation
	if (p1Coins.Value < session.player1Offer.coins || p2Coins.Value < session.player2Offer.coins) {
		tradeUpdateRemote.FireClient(session.player1, "failed", "Not enough coins");
		tradeUpdateRemote.FireClient(session.player2, "failed", "Not enough coins");
		return;
	}
	
	// Execute coin transfer
	p1Coins.Value -= session.player1Offer.coins;
	p1Coins.Value += session.player2Offer.coins;
	p2Coins.Value -= session.player2Offer.coins;
	p2Coins.Value += session.player1Offer.coins;
	
	// Transfer pets (if any)
	const p1Pets = playerPets.get(session.player1) ?? [];
	const p2Pets = playerPets.get(session.player2) ?? [];
	
	if (session.player1Offer.pet) {
		const idx = p1Pets.indexOf(session.player1Offer.pet);
		if (idx >= 0) {
			p1Pets.remove(idx);
			p2Pets.push(session.player1Offer.pet);
		}
	}
	
	if (session.player2Offer.pet) {
		const idx = p2Pets.indexOf(session.player2Offer.pet);
		if (idx >= 0) {
			p2Pets.remove(idx);
			p1Pets.push(session.player2Offer.pet);
		}
	}
	
	// Notify success
	tradeUpdateRemote.FireClient(session.player1, "completed", session.player2.Name);
	tradeUpdateRemote.FireClient(session.player2, "completed", session.player1.Name);
	
	// Remove session
	for (const [key, s] of activeTrades) {
		if (s === session) {
			activeTrades.delete(key);
			break;
		}
	}
	
	print(`✅ Trade completed: ${session.player1.Name} ↔️ ${session.player2.Name}`);
}

// Add pet to player's inventory
export function givePlayerPet(player: Player, petName: string) {
	const pets = playerPets.get(player) ?? [];
	pets.push(petName);
	playerPets.set(player, pets);
}
