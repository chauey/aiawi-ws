// DataStore Helpers - Safe wrapper for Roblox DataStore
// Handles retries, error handling, and type safety

import { DataStoreService, Players } from "@rbxts/services";

export interface PlayerData {
	coins: number;
	gems: number;
	rebirths: number;
	pets: string[];
	achievements: string[];
	settings: Record<string, unknown>;
	lastLogin: number;
	playTime: number;
}

export const DEFAULT_PLAYER_DATA: PlayerData = {
	coins: 100,
	gems: 5,
	rebirths: 0,
	pets: [],
	achievements: [],
	settings: {},
	lastLogin: 0,
	playTime: 0,
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1;

export function getDataStore(name: string) {
	return DataStoreService.GetDataStore(name);
}

export async function loadPlayerData(
	player: Player,
	storeName: string
): Promise<PlayerData> {
	const store = getDataStore(storeName);
	const key = `Player_${player.UserId}`;
	
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			const data = store.GetAsync(key) as PlayerData | undefined;
			return data ?? { ...DEFAULT_PLAYER_DATA };
		} catch (err) {
			warn(`DataStore load attempt ${attempt} failed: ${err}`);
			if (attempt < MAX_RETRIES) {
				wait(RETRY_DELAY);
			}
		}
	}
	
	warn(`Failed to load data for ${player.Name}, using defaults`);
	return { ...DEFAULT_PLAYER_DATA };
}

export async function savePlayerData(
	player: Player,
	storeName: string,
	data: PlayerData
): Promise<boolean> {
	const store = getDataStore(storeName);
	const key = `Player_${player.UserId}`;
	
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			store.SetAsync(key, data);
			return true;
		} catch (err) {
			warn(`DataStore save attempt ${attempt} failed: ${err}`);
			if (attempt < MAX_RETRIES) {
				wait(RETRY_DELAY);
			}
		}
	}
	
	warn(`Failed to save data for ${player.Name}`);
	return false;
}
