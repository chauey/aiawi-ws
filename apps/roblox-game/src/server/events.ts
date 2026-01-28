// Limited Time Events - FOMO-driven seasonal content
// PROVEN: Pet Simulator X runs constant events with exclusive pets, drives massive engagement
import { Players, ReplicatedStorage } from "@rbxts/services";

export interface EventData {
	id: string;
	name: string;
	description: string;
	emoji: string;
	startTime: number;  // Unix timestamp
	endTime: number;    // Unix timestamp
	bonusMultiplier: number;
	exclusivePet?: string;
	exclusivePetRarity: number; // Gacha weight (lower = rarer)
}

// Current events - update these for seasonal content!
const ACTIVE_EVENTS: EventData[] = [
	{
		id: "launch_event",
		name: "🎉 LAUNCH WEEK",
		description: "2x coins for everyone!",
		emoji: "🎉",
		startTime: 0, // Always active for testing
		endTime: 9999999999,
		bonusMultiplier: 2.0,
		exclusivePet: "rocket",
		exclusivePetRarity: 5, // 5% chance
	},
	// Example seasonal events (uncomment when ready):
	// {
	// 	id: "winter_2026",
	// 	name: "❄️ WINTER WONDERLAND",
	// 	description: "Collect snowflakes for ice pets!",
	// 	emoji: "❄️",
	// 	startTime: 1735689600, // Dec 2026
	// 	endTime: 1736294400,
	// 	bonusMultiplier: 1.5,
	// 	exclusivePet: "ice_dragon",
	// 	exclusivePetRarity: 1, // 1% = super rare
	// },
];

export function setupEventSystem() {
	const getEventsRemote = new Instance("RemoteFunction");
	getEventsRemote.Name = "GetActiveEvents";
	getEventsRemote.Parent = ReplicatedStorage;
	
	const eventNotifyRemote = new Instance("RemoteEvent");
	eventNotifyRemote.Name = "EventNotify";
	eventNotifyRemote.Parent = ReplicatedStorage;
	
	// Get active events
	getEventsRemote.OnServerInvoke = () => {
		const now = os.time();
		const activeEvents = ACTIVE_EVENTS.filter(e => now >= e.startTime && now <= e.endTime);
		
		return activeEvents.map(e => ({
			id: e.id,
			name: e.name,
			description: e.description,
			emoji: e.emoji,
			bonusMultiplier: e.bonusMultiplier,
			hasExclusivePet: e.exclusivePet !== undefined,
			endsIn: e.endTime - now,
		}));
	};
	
	// Notify players when they join during event
	Players.PlayerAdded.Connect((player) => {
		wait(3); // Wait for UI to load
		
		const now = os.time();
		for (const event of ACTIVE_EVENTS) {
			if (now >= event.startTime && now <= event.endTime) {
				eventNotifyRemote.FireClient(player, event.name, event.description, event.emoji);
			}
		}
	});
	
	print("🎉 Event system ready! Limited time events active!");
}

// Get current coin multiplier from events
export function getEventMultiplier(): number {
	const now = os.time();
	let multiplier = 1.0;
	
	for (const event of ACTIVE_EVENTS) {
		if (now >= event.startTime && now <= event.endTime) {
			multiplier *= event.bonusMultiplier;
		}
	}
	
	return multiplier;
}

// Get exclusive pet for current event (for gacha)
export function getEventExclusivePet(): { name: string; rarity: number } | undefined {
	const now = os.time();
	
	for (const event of ACTIVE_EVENTS) {
		if (now >= event.startTime && now <= event.endTime && event.exclusivePet) {
			return { name: event.exclusivePet, rarity: event.exclusivePetRarity };
		}
	}
	
	return undefined;
}
