// Dragon Legends - Clan System (Server)
// Clans with wars, territories, and perks

import { Players, ReplicatedStorage } from '@rbxts/services';
import { ClanData, ClanMember } from '../shared/types';
import { getPlayerData, updatePlayerData } from './dataStore';

// Active clans storage
const clans = new Map<string, ClanData>();
const playerClanMembership = new Map<number, string>(); // UserId -> ClanId

// Generate clan ID
function generateClanId(): string {
  return `clan_${os.time()}_${math.random(1000, 9999)}`;
}

// Create a new clan
export function createClan(
  player: Player,
  name: string,
  tag: string,
  description: string,
): { success: boolean; clan?: ClanData; error?: string } {
  // Validate input
  if (name.size() < 3 || name.size() > 20) {
    return { success: false, error: 'Name must be 3-20 characters' };
  }

  if (tag.size() < 2 || tag.size() > 5) {
    return { success: false, error: 'Tag must be 2-5 characters' };
  }

  // Check if player already in clan
  if (playerClanMembership.has(player.UserId)) {
    return { success: false, error: 'You are already in a clan' };
  }

  // Check if name/tag already exists
  for (const [_, clan] of clans) {
    if (clan.name.lower() === name.lower()) {
      return { success: false, error: 'Clan name already taken' };
    }
    if (clan.tag.lower() === tag.lower()) {
      return { success: false, error: 'Clan tag already taken' };
    }
  }

  // Check cost (1000 coins)
  const playerData = getPlayerData(player);
  if (!playerData || playerData.coins < 1000) {
    return { success: false, error: 'Need 1000 coins to create clan' };
  }

  playerData.coins -= 1000;

  const clanId = generateClanId();
  const founder: ClanMember = {
    playerId: player.UserId,
    playerName: player.Name,
    role: 'leader',
    joinedAt: os.time(),
    contribution: 0,
    lastActive: os.time(),
  };

  const clan: ClanData = {
    clanId,
    name,
    tag: tag.upper(),
    description,
    level: 1,
    experience: 0,
    members: [founder],
    maxMembers: 20,
    createdAt: os.time(),
    leaderPlayerId: player.UserId,
    weeklyWarScore: 0,
    territoryCount: 0,
    perks: [],
  };

  clans.set(clanId, clan);
  playerClanMembership.set(player.UserId, clanId);
  playerData.clanId = clanId;
  playerData.clanRole = 'leader';
  updatePlayerData(player, playerData);

  print(`🏰 ${player.Name} created clan [${tag}] ${name}!`);

  return { success: true, clan };
}

// Join a clan
export function joinClan(
  player: Player,
  clanId: string,
): { success: boolean; error?: string } {
  if (playerClanMembership.has(player.UserId)) {
    return { success: false, error: 'Already in a clan' };
  }

  const clan = clans.get(clanId);
  if (!clan) {
    return { success: false, error: 'Clan not found' };
  }

  if (clan.members.size() >= clan.maxMembers) {
    return { success: false, error: 'Clan is full' };
  }

  const member: ClanMember = {
    playerId: player.UserId,
    playerName: player.Name,
    role: 'member',
    joinedAt: os.time(),
    contribution: 0,
    lastActive: os.time(),
  };

  clan.members.push(member);
  playerClanMembership.set(player.UserId, clanId);

  const playerData = getPlayerData(player);
  if (playerData) {
    playerData.clanId = clanId;
    playerData.clanRole = 'member';
    updatePlayerData(player, playerData);
  }

  print(`👋 ${player.Name} joined [${clan.tag}] ${clan.name}!`);

  return { success: true };
}

// Leave clan
export function leaveClan(player: Player): {
  success: boolean;
  error?: string;
} {
  const clanId = playerClanMembership.get(player.UserId);
  if (!clanId) {
    return { success: false, error: 'Not in a clan' };
  }

  const clan = clans.get(clanId);
  if (!clan) {
    playerClanMembership.delete(player.UserId);
    return { success: false, error: 'Clan not found' };
  }

  // Can't leave if leader and there are other members
  if (clan.leaderPlayerId === player.UserId && clan.members.size() > 1) {
    return {
      success: false,
      error: 'Transfer leadership before leaving',
    };
  }

  // Remove from clan
  const memberIndex = clan.members.findIndex(
    (m) => m.playerId === player.UserId,
  );
  if (memberIndex >= 0) {
    clan.members.remove(memberIndex);
  }

  playerClanMembership.delete(player.UserId);

  // If no members left, delete clan
  if (clan.members.size() === 0) {
    clans.delete(clanId);
    print(`💀 Clan [${clan.tag}] ${clan.name} disbanded!`);
  }

  const playerData = getPlayerData(player);
  if (playerData) {
    playerData.clanId = undefined;
    playerData.clanRole = undefined;
    updatePlayerData(player, playerData);
  }

  print(`👋 ${player.Name} left [${clan.tag}] ${clan.name}`);

  return { success: true };
}

// Contribute coins to clan
export function contributeToeClan(
  player: Player,
  amount: number,
): { success: boolean; error?: string } {
  const clanId = playerClanMembership.get(player.UserId);
  if (!clanId) {
    return { success: false, error: 'Not in a clan' };
  }

  const clan = clans.get(clanId);
  if (!clan) {
    return { success: false, error: 'Clan not found' };
  }

  const playerData = getPlayerData(player);
  if (!playerData || playerData.coins < amount) {
    return { success: false, error: 'Not enough coins' };
  }

  playerData.coins -= amount;

  // Add to member contribution
  const member = clan.members.find((m) => m.playerId === player.UserId);
  if (member) {
    member.contribution += amount;
    member.lastActive = os.time();
  }

  // Add to clan XP
  clan.experience += amount;

  // Level up clan if enough XP
  const xpNeeded = clan.level * 10000;
  if (clan.experience >= xpNeeded) {
    clan.level++;
    clan.experience -= xpNeeded;
    clan.maxMembers = math.min(50, 20 + clan.level * 3);
    print(`🎉 Clan [${clan.tag}] leveled up to ${clan.level}!`);
  }

  updatePlayerData(player, playerData);

  print(`💰 ${player.Name} contributed ${amount} coins to clan!`);

  return { success: true };
}

// Add war score
export function addWarScore(clanId: string, score: number): void {
  const clan = clans.get(clanId);
  if (clan) {
    clan.weeklyWarScore += score;
    print(`⚔️ Clan [${clan.tag}] +${score} war points!`);
  }
}

// Get clan leaderboard
export function getClanLeaderboard(): ClanData[] {
  const allClans: ClanData[] = [];
  for (const [, clan] of clans) {
    allClans.push(clan);
  }
  // Sort by war score (bubble sort for roblox-ts)
  for (let i = 0; i < allClans.size(); i++) {
    for (let j = i + 1; j < allClans.size(); j++) {
      if (allClans[j].weeklyWarScore > allClans[i].weeklyWarScore) {
        [allClans[i], allClans[j]] = [allClans[j], allClans[i]];
      }
    }
  }
  return allClans;
}

// Get player's clan
export function getPlayerClan(player: Player): ClanData | undefined {
  const clanId = playerClanMembership.get(player.UserId);
  if (!clanId) return undefined;
  return clans.get(clanId);
}

// Search clans
export function searchClans(query: string): ClanData[] {
  const results: ClanData[] = [];
  const lowerQuery = query.lower();

  for (const [_, clan] of clans) {
    if (
      clan.name.lower().find(lowerQuery)[0] ||
      clan.tag.lower().find(lowerQuery)[0]
    ) {
      results.push(clan);
    }
  }

  return results;
}

// Promote member
export function promoteMember(
  player: Player,
  targetPlayerId: number,
): { success: boolean; error?: string } {
  const clanId = playerClanMembership.get(player.UserId);
  if (!clanId) {
    return { success: false, error: 'Not in a clan' };
  }

  const clan = clans.get(clanId);
  if (!clan) {
    return { success: false, error: 'Clan not found' };
  }

  // Must be leader
  if (clan.leaderPlayerId !== player.UserId) {
    return { success: false, error: 'Only leader can promote' };
  }

  const member = clan.members.find((m) => m.playerId === targetPlayerId);
  if (!member) {
    return { success: false, error: 'Member not found' };
  }

  if (member.role === 'officer') {
    return { success: false, error: 'Already an officer' };
  }

  member.role = 'officer';
  print(`⬆️ ${member.playerName} promoted to officer!`);

  return { success: true };
}

// Transfer leadership
export function transferLeadership(
  player: Player,
  targetPlayerId: number,
): { success: boolean; error?: string } {
  const clanId = playerClanMembership.get(player.UserId);
  if (!clanId) {
    return { success: false, error: 'Not in a clan' };
  }

  const clan = clans.get(clanId);
  if (!clan) {
    return { success: false, error: 'Clan not found' };
  }

  if (clan.leaderPlayerId !== player.UserId) {
    return { success: false, error: 'Only leader can transfer' };
  }

  const newLeader = clan.members.find((m) => m.playerId === targetPlayerId);
  if (!newLeader) {
    return { success: false, error: 'Member not found' };
  }

  // Update roles
  const oldLeader = clan.members.find((m) => m.playerId === player.UserId);
  if (oldLeader) {
    oldLeader.role = 'member';
  }
  newLeader.role = 'leader';
  clan.leaderPlayerId = targetPlayerId;

  print(`👑 ${newLeader.playerName} is now clan leader!`);

  return { success: true };
}

// Setup clan system
export function setupClanSystem(): void {
  const remotes =
    (ReplicatedStorage.FindFirstChild('DragonRemotes') as Folder) ||
    new Instance('Folder');
  remotes.Name = 'DragonRemotes';
  remotes.Parent = ReplicatedStorage;

  const createClanRemote = new Instance('RemoteFunction');
  createClanRemote.Name = 'CreateClan';
  createClanRemote.Parent = remotes;

  const joinClanRemote = new Instance('RemoteFunction');
  joinClanRemote.Name = 'JoinClan';
  joinClanRemote.Parent = remotes;

  const leaveClanRemote = new Instance('RemoteFunction');
  leaveClanRemote.Name = 'LeaveClan';
  leaveClanRemote.Parent = remotes;

  const contributeClanRemote = new Instance('RemoteFunction');
  contributeClanRemote.Name = 'ContributeClan';
  contributeClanRemote.Parent = remotes;

  const getClanRemote = new Instance('RemoteFunction');
  getClanRemote.Name = 'GetPlayerClan';
  getClanRemote.Parent = remotes;

  const searchClansRemote = new Instance('RemoteFunction');
  searchClansRemote.Name = 'SearchClans';
  searchClansRemote.Parent = remotes;

  const getClanLeaderboardRemote = new Instance('RemoteFunction');
  getClanLeaderboardRemote.Name = 'GetClanLeaderboard';
  getClanLeaderboardRemote.Parent = remotes;

  createClanRemote.OnServerInvoke = (player, name, tag, description) => {
    if (
      !typeIs(name, 'string') ||
      !typeIs(tag, 'string') ||
      !typeIs(description, 'string')
    ) {
      return { success: false, error: 'Invalid parameters' };
    }
    return createClan(player, name, tag, description);
  };

  joinClanRemote.OnServerInvoke = (player, clanId) => {
    if (!typeIs(clanId, 'string')) {
      return { success: false, error: 'Invalid clan ID' };
    }
    return joinClan(player, clanId);
  };

  leaveClanRemote.OnServerInvoke = (player) => {
    return leaveClan(player);
  };

  contributeClanRemote.OnServerInvoke = (player, amount) => {
    if (!typeIs(amount, 'number') || amount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }
    return contributeToeClan(player, amount);
  };

  getClanRemote.OnServerInvoke = (player) => {
    return getPlayerClan(player);
  };

  searchClansRemote.OnServerInvoke = (player, query) => {
    if (!typeIs(query, 'string')) return [];
    return searchClans(query);
  };

  getClanLeaderboardRemote.OnServerInvoke = () => {
    return getClanLeaderboard();
  };

  print('🏰 Clan System initialized!');
}
