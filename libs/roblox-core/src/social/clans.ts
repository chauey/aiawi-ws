/**
 * Clan System - Reusable clan/guild system
 * Game-agnostic logic for social clan features
 */

// ==================== TYPES ====================

export type ClanRole = 'leader' | 'officer' | 'member';

export interface ClanMember {
  playerId: number;
  playerName: string;
  role: ClanRole;
  joinedAt: number;
  contributions: number;
  lastActive: number;
}

export interface ClanData {
  id: string;
  name: string;
  tag: string;
  description: string;
  ownerId: number;
  members: ClanMember[];
  totalContributions: number;
  warScore: number;
  createdAt: number;
  level: number;
}

export interface ClanConfig {
  createCost: number;
  maxMembers: number;
  bonusPercent: number;
  minNameLength: number;
  maxNameLength: number;
  minTagLength: number;
  maxTagLength: number;
  maxDescriptionLength: number;
  contributionBonusPerLevel: number;
  xpPerContribution: number;
}

export const DEFAULT_CLAN_CONFIG: ClanConfig = {
  createCost: 1000,
  maxMembers: 50,
  bonusPercent: 10,
  minNameLength: 3,
  maxNameLength: 20,
  minTagLength: 2,
  maxTagLength: 5,
  maxDescriptionLength: 200,
  contributionBonusPerLevel: 5,
  xpPerContribution: 1,
};

export interface ClanResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Helper to get current time (works in both Node.js and Roblox)
function getServerTime(): number {
  // In Node.js, Date.now exists. In Roblox-ts, os.time() is used
  if (typeof Date !== 'undefined' && Date.now) {
    return Date.now();
  }
  // Roblox fallback
  return (
    (globalThis as { os?: { time: () => number } }).os?.time?.() ?? 0 * 1000
  );
}

// ==================== VALIDATION ====================

export function validateClanName(name: string, config: ClanConfig): ClanResult {
  if (!name || name.length < config.minNameLength) {
    return {
      success: false,
      error: `Name must be at least ${config.minNameLength} characters`,
      code: 'NAME_TOO_SHORT',
    };
  }
  if (name.length > config.maxNameLength) {
    return {
      success: false,
      error: `Name must be at most ${config.maxNameLength} characters`,
      code: 'NAME_TOO_LONG',
    };
  }
  // Check for invalid characters (alphanumeric and spaces only)
  const validPattern = /^[a-zA-Z0-9 ]+$/;
  if (!name.match(validPattern)) {
    return {
      success: false,
      error: 'Name can only contain letters, numbers, and spaces',
      code: 'INVALID_CHARACTERS',
    };
  }
  return { success: true };
}

export function validateClanTag(tag: string, config: ClanConfig): ClanResult {
  if (!tag || tag.length < config.minTagLength) {
    return {
      success: false,
      error: `Tag must be at least ${config.minTagLength} characters`,
      code: 'TAG_TOO_SHORT',
    };
  }
  if (tag.length > config.maxTagLength) {
    return {
      success: false,
      error: `Tag must be at most ${config.maxTagLength} characters`,
      code: 'TAG_TOO_LONG',
    };
  }
  const validPattern = /^[A-Z0-9]+$/;
  if (!tag.toUpperCase().match(validPattern)) {
    return {
      success: false,
      error: 'Tag can only contain letters and numbers',
      code: 'INVALID_TAG_CHARACTERS',
    };
  }
  return { success: true };
}

export function validateClanDescription(
  description: string,
  config: ClanConfig,
): ClanResult {
  if (description.length > config.maxDescriptionLength) {
    return {
      success: false,
      error: `Description must be at most ${config.maxDescriptionLength} characters`,
      code: 'DESCRIPTION_TOO_LONG',
    };
  }
  return { success: true };
}

// ==================== CORE LOGIC ====================

export function generateClanId(): string {
  const timestamp = getServerTime();
  const random = Math.floor(Math.random() * 10000);
  return `clan_${timestamp}_${random}`;
}

export function createClanData(
  playerId: number,
  playerName: string,
  name: string,
  tag: string,
  description: string,
): ClanData {
  return {
    id: generateClanId(),
    name,
    tag: tag.toUpperCase(),
    description,
    ownerId: playerId,
    members: [
      {
        playerId,
        playerName,
        role: 'leader',
        joinedAt: getServerTime(),
        contributions: 0,
        lastActive: getServerTime(),
      },
    ],
    totalContributions: 0,
    warScore: 0,
    createdAt: getServerTime(),
    level: 1,
  };
}

export function canCreateClan(
  playerId: number,
  playerCoins: number,
  existingMembership: string | undefined,
  config: ClanConfig,
): ClanResult {
  if (existingMembership) {
    return {
      success: false,
      error: 'Already in a clan',
      code: 'ALREADY_IN_CLAN',
    };
  }
  if (playerCoins < config.createCost) {
    return {
      success: false,
      error: `Need ${config.createCost} coins to create a clan`,
      code: 'INSUFFICIENT_COINS',
    };
  }
  return { success: true };
}

export function canJoinClan(
  playerId: number,
  existingMembership: string | undefined,
  clan: ClanData | undefined,
  config: ClanConfig,
): ClanResult {
  if (existingMembership) {
    return {
      success: false,
      error: 'Already in a clan',
      code: 'ALREADY_IN_CLAN',
    };
  }
  if (!clan) {
    return {
      success: false,
      error: 'Clan not found',
      code: 'CLAN_NOT_FOUND',
    };
  }
  if (clan.members.length >= config.maxMembers) {
    return {
      success: false,
      error: 'Clan is full',
      code: 'CLAN_FULL',
    };
  }
  return { success: true };
}

export function addMemberToClan(
  clan: ClanData,
  playerId: number,
  playerName: string,
): ClanMember {
  const member: ClanMember = {
    playerId,
    playerName,
    role: 'member',
    joinedAt: getServerTime(),
    contributions: 0,
    lastActive: getServerTime(),
  };
  clan.members.push(member);
  return member;
}

export function removeMemberFromClan(
  clan: ClanData,
  playerId: number,
): ClanResult<{ newOwner?: number; disbanded: boolean }> {
  const memberIndex = clan.members.findIndex((m) => m.playerId === playerId);
  if (memberIndex === -1) {
    return {
      success: false,
      error: 'Not a member of this clan',
      code: 'NOT_A_MEMBER',
    };
  }

  const member = clan.members[memberIndex];
  clan.members.splice(memberIndex, 1);

  // Handle leader leaving
  if (member.role === 'leader') {
    if (clan.members.length === 0) {
      return {
        success: true,
        data: { disbanded: true },
      };
    }
    // Transfer to first officer, or first member
    const newLeader =
      clan.members.find((m) => m.role === 'officer') || clan.members[0];
    newLeader.role = 'leader';
    clan.ownerId = newLeader.playerId;
    return {
      success: true,
      data: { newOwner: newLeader.playerId, disbanded: false },
    };
  }

  return { success: true, data: { disbanded: false } };
}

export function contributeToClan(
  clan: ClanData,
  playerId: number,
  amount: number,
): ClanResult<{ newTotal: number }> {
  if (amount <= 0) {
    return {
      success: false,
      error: 'Amount must be positive',
      code: 'INVALID_AMOUNT',
    };
  }

  const member = clan.members.find((m) => m.playerId === playerId);
  if (!member) {
    return {
      success: false,
      error: 'Not a member of this clan',
      code: 'NOT_A_MEMBER',
    };
  }

  member.contributions += amount;
  clan.totalContributions += amount;

  return {
    success: true,
    data: { newTotal: clan.totalContributions },
  };
}

export function promoteMember(
  clan: ClanData,
  promoterId: number,
  targetId: number,
): ClanResult {
  const promoter = clan.members.find((m) => m.playerId === promoterId);
  const target = clan.members.find((m) => m.playerId === targetId);

  if (!promoter || promoter.role !== 'leader') {
    return {
      success: false,
      error: 'Only leader can promote members',
      code: 'NOT_LEADER',
    };
  }

  if (!target) {
    return {
      success: false,
      error: 'Target not found in clan',
      code: 'TARGET_NOT_FOUND',
    };
  }

  if (target.role === 'officer') {
    return {
      success: false,
      error: 'Already an officer',
      code: 'ALREADY_OFFICER',
    };
  }

  if (target.role === 'leader') {
    return {
      success: false,
      error: 'Cannot promote leader',
      code: 'CANNOT_PROMOTE_LEADER',
    };
  }

  target.role = 'officer';
  return { success: true };
}

export function demoteMember(
  clan: ClanData,
  demoterId: number,
  targetId: number,
): ClanResult {
  const demoter = clan.members.find((m) => m.playerId === demoterId);
  const target = clan.members.find((m) => m.playerId === targetId);

  if (!demoter || demoter.role !== 'leader') {
    return {
      success: false,
      error: 'Only leader can demote members',
      code: 'NOT_LEADER',
    };
  }

  if (!target) {
    return {
      success: false,
      error: 'Target not found in clan',
      code: 'TARGET_NOT_FOUND',
    };
  }

  if (target.role !== 'officer') {
    return {
      success: false,
      error: 'Target is not an officer',
      code: 'NOT_OFFICER',
    };
  }

  target.role = 'member';
  return { success: true };
}

export function transferLeadership(
  clan: ClanData,
  currentLeaderId: number,
  newLeaderId: number,
): ClanResult {
  const currentLeader = clan.members.find(
    (m) => m.playerId === currentLeaderId,
  );
  const newLeader = clan.members.find((m) => m.playerId === newLeaderId);

  if (!currentLeader || currentLeader.role !== 'leader') {
    return {
      success: false,
      error: 'Only leader can transfer leadership',
      code: 'NOT_LEADER',
    };
  }

  if (!newLeader) {
    return {
      success: false,
      error: 'Target not found in clan',
      code: 'TARGET_NOT_FOUND',
    };
  }

  if (currentLeaderId === newLeaderId) {
    return {
      success: false,
      error: 'Cannot transfer to yourself',
      code: 'SELF_TRANSFER',
    };
  }

  currentLeader.role = 'officer';
  newLeader.role = 'leader';
  clan.ownerId = newLeaderId;

  return { success: true };
}

export function kickMember(
  clan: ClanData,
  kickerId: number,
  targetId: number,
): ClanResult {
  const kicker = clan.members.find((m) => m.playerId === kickerId);
  const target = clan.members.find((m) => m.playerId === targetId);

  if (!kicker) {
    return {
      success: false,
      error: 'You are not in this clan',
      code: 'NOT_A_MEMBER',
    };
  }

  if (!target) {
    return {
      success: false,
      error: 'Target not found in clan',
      code: 'TARGET_NOT_FOUND',
    };
  }

  if (kickerId === targetId) {
    return {
      success: false,
      error: 'Cannot kick yourself, use leave instead',
      code: 'SELF_KICK',
    };
  }

  // Permission check
  if (kicker.role === 'member') {
    return {
      success: false,
      error: 'Only officers and leaders can kick members',
      code: 'INSUFFICIENT_PERMISSION',
    };
  }

  if (kicker.role === 'officer' && target.role !== 'member') {
    return {
      success: false,
      error: 'Officers can only kick regular members',
      code: 'INSUFFICIENT_PERMISSION',
    };
  }

  if (target.role === 'leader') {
    return {
      success: false,
      error: 'Cannot kick the leader',
      code: 'CANNOT_KICK_LEADER',
    };
  }

  // Use type assertion since removeMemberFromClan returns a compatible result
  const result = removeMemberFromClan(clan, targetId);
  return { success: result.success, error: result.error, code: result.code };
}

// ==================== UTILITIES ====================

export function calculateClanBonus(clan: ClanData, config: ClanConfig): number {
  const baseBonus = config.bonusPercent;
  const levelBonus = (clan.level - 1) * config.contributionBonusPerLevel;
  return baseBonus + levelBonus;
}

export function calculateClanLevel(totalContributions: number): number {
  // Every 10,000 contributions = 1 level (cap at 50)
  return Math.min(50, Math.floor(totalContributions / 10000) + 1);
}

export function getClanLeaderboard(
  clans: ClanData[],
  sortBy: 'contributions' | 'warScore' | 'members' = 'contributions',
): ClanData[] {
  return [...clans].sort((a, b) => {
    switch (sortBy) {
      case 'contributions':
        return b.totalContributions - a.totalContributions;
      case 'warScore':
        return b.warScore - a.warScore;
      case 'members':
        return b.members.length - a.members.length;
      default:
        return 0;
    }
  });
}

export function searchClans(clans: ClanData[], query: string): ClanData[] {
  const lowerQuery = query.toLowerCase();
  return clans.filter(
    (clan) =>
      clan.name.toLowerCase().includes(lowerQuery) ||
      clan.tag.toLowerCase().includes(lowerQuery),
  );
}

export function formatClanTag(clan: ClanData): string {
  return `[${clan.tag}]`;
}

export function getMemberCount(clan: ClanData): number {
  return clan.members.length;
}

export function isLeader(clan: ClanData, playerId: number): boolean {
  return clan.ownerId === playerId;
}

export function isOfficer(clan: ClanData, playerId: number): boolean {
  const member = clan.members.find((m) => m.playerId === playerId);
  return member?.role === 'officer' || member?.role === 'leader';
}

export function isMember(clan: ClanData, playerId: number): boolean {
  return clan.members.some((m) => m.playerId === playerId);
}
