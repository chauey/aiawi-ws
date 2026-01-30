/**
 * Clan System - Comprehensive Unit Tests
 * Tests clan creation, membership, permissions, and clan wars
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ==================== TYPES ====================

type ClanRole = 'leader' | 'officer' | 'member';

interface ClanMember {
  playerId: number;
  playerName: string;
  role: ClanRole;
  joinedAt: number;
  contribution: number;
  lastActive: number;
}

interface ClanData {
  clanId: string;
  name: string;
  tag: string;
  description: string;
  level: number;
  experience: number;
  members: ClanMember[];
  maxMembers: number;
  createdAt: number;
  leaderPlayerId: number;
  weeklyWarScore: number;
  territoryCount: number;
  perks: string[];
}

interface PlayerData {
  coins: number;
  clanId?: string;
  clanRole?: ClanRole;
}

// ==================== MOCK IMPLEMENTATION ====================

const clans = new Map<string, ClanData>();
const playerClanMembership = new Map<number, string>();
const playerDataStore = new Map<number, PlayerData>();

const CLAN_CREATION_COST = 1000;
let clanIdCounter = 0;
let currentTime = 0;

function setTime(t: number) {
  currentTime = t;
}
function osTime() {
  return currentTime;
}

function getPlayerData(playerId: number): PlayerData | undefined {
  return playerDataStore.get(playerId);
}

function generateClanId(): string {
  return `clan_${++clanIdCounter}`;
}

function createClan(
  playerId: number,
  playerName: string,
  name: string,
  tag: string,
  description: string,
): { success: boolean; clan?: ClanData; error?: string } {
  // Validate input
  if (name.length < 3 || name.length > 20) {
    return { success: false, error: 'Name must be 3-20 characters' };
  }

  if (tag.length < 2 || tag.length > 5) {
    return { success: false, error: 'Tag must be 2-5 characters' };
  }

  // Check if player already in clan
  if (playerClanMembership.has(playerId)) {
    return { success: false, error: 'You are already in a clan' };
  }

  // Check if name/tag already exists
  for (const clan of clans.values()) {
    if (clan.name.toLowerCase() === name.toLowerCase()) {
      return { success: false, error: 'Clan name already taken' };
    }
    if (clan.tag.toLowerCase() === tag.toLowerCase()) {
      return { success: false, error: 'Clan tag already taken' };
    }
  }

  // Check cost
  const playerData = getPlayerData(playerId);
  if (!playerData || playerData.coins < CLAN_CREATION_COST) {
    return { success: false, error: 'Need 1000 coins to create clan' };
  }

  playerData.coins -= CLAN_CREATION_COST;

  const clanId = generateClanId();
  const founder: ClanMember = {
    playerId,
    playerName,
    role: 'leader',
    joinedAt: osTime(),
    contribution: 0,
    lastActive: osTime(),
  };

  const clan: ClanData = {
    clanId,
    name,
    tag: tag.toUpperCase(),
    description,
    level: 1,
    experience: 0,
    members: [founder],
    maxMembers: 20,
    createdAt: osTime(),
    leaderPlayerId: playerId,
    weeklyWarScore: 0,
    territoryCount: 0,
    perks: [],
  };

  clans.set(clanId, clan);
  playerClanMembership.set(playerId, clanId);
  playerData.clanId = clanId;
  playerData.clanRole = 'leader';

  return { success: true, clan };
}

function joinClan(
  playerId: number,
  playerName: string,
  clanId: string,
): { success: boolean; error?: string } {
  if (playerClanMembership.has(playerId)) {
    return { success: false, error: 'Already in a clan' };
  }

  const clan = clans.get(clanId);
  if (!clan) {
    return { success: false, error: 'Clan not found' };
  }

  if (clan.members.length >= clan.maxMembers) {
    return { success: false, error: 'Clan is full' };
  }

  const member: ClanMember = {
    playerId,
    playerName,
    role: 'member',
    joinedAt: osTime(),
    contribution: 0,
    lastActive: osTime(),
  };

  clan.members.push(member);
  playerClanMembership.set(playerId, clanId);

  const playerData = getPlayerData(playerId);
  if (playerData) {
    playerData.clanId = clanId;
    playerData.clanRole = 'member';
  }

  return { success: true };
}

function leaveClan(playerId: number): { success: boolean; error?: string } {
  const clanId = playerClanMembership.get(playerId);
  if (!clanId) {
    return { success: false, error: 'Not in a clan' };
  }

  const clan = clans.get(clanId);
  if (!clan) {
    playerClanMembership.delete(playerId);
    return { success: false, error: 'Clan not found' };
  }

  // Can't leave if leader and there are other members
  if (clan.leaderPlayerId === playerId && clan.members.length > 1) {
    return { success: false, error: 'Transfer leadership before leaving' };
  }

  // Remove from clan
  clan.members = clan.members.filter((m) => m.playerId !== playerId);
  playerClanMembership.delete(playerId);

  // If no members left, delete clan
  if (clan.members.length === 0) {
    clans.delete(clanId);
  }

  const playerData = getPlayerData(playerId);
  if (playerData) {
    playerData.clanId = undefined;
    playerData.clanRole = undefined;
  }

  return { success: true };
}

function contributeToClan(
  playerId: number,
  amount: number,
): { success: boolean; error?: string } {
  const clanId = playerClanMembership.get(playerId);
  if (!clanId) {
    return { success: false, error: 'Not in a clan' };
  }

  const clan = clans.get(clanId);
  if (!clan) {
    return { success: false, error: 'Clan not found' };
  }

  const playerData = getPlayerData(playerId);
  if (!playerData || playerData.coins < amount) {
    return { success: false, error: 'Not enough coins' };
  }

  if (amount <= 0) {
    return { success: false, error: 'Invalid amount' };
  }

  playerData.coins -= amount;
  clan.experience += amount;

  // Find member and add contribution
  const member = clan.members.find((m) => m.playerId === playerId);
  if (member) {
    member.contribution += amount;
    member.lastActive = osTime();
  }

  return { success: true };
}

function promoteToOfficer(
  leaderId: number,
  targetPlayerId: number,
): { success: boolean; error?: string } {
  const clanId = playerClanMembership.get(leaderId);
  if (!clanId) {
    return { success: false, error: 'Not in a clan' };
  }

  const clan = clans.get(clanId);
  if (!clan) {
    return { success: false, error: 'Clan not found' };
  }

  // Check if leader
  if (clan.leaderPlayerId !== leaderId) {
    return { success: false, error: 'Only leader can promote' };
  }

  const targetMember = clan.members.find((m) => m.playerId === targetPlayerId);
  if (!targetMember) {
    return { success: false, error: 'Player not in clan' };
  }

  if (targetMember.role !== 'member') {
    return { success: false, error: 'Can only promote members' };
  }

  targetMember.role = 'officer';
  return { success: true };
}

function transferLeadership(
  leaderId: number,
  newLeaderId: number,
): { success: boolean; error?: string } {
  const clanId = playerClanMembership.get(leaderId);
  if (!clanId) {
    return { success: false, error: 'Not in a clan' };
  }

  const clan = clans.get(clanId);
  if (!clan) {
    return { success: false, error: 'Clan not found' };
  }

  if (clan.leaderPlayerId !== leaderId) {
    return { success: false, error: 'Only leader can transfer' };
  }

  const newLeader = clan.members.find((m) => m.playerId === newLeaderId);
  if (!newLeader) {
    return { success: false, error: 'New leader not in clan' };
  }

  // Update roles
  const oldLeader = clan.members.find((m) => m.playerId === leaderId);
  if (oldLeader) oldLeader.role = 'officer';
  newLeader.role = 'leader';
  clan.leaderPlayerId = newLeaderId;

  const oldLeaderData = getPlayerData(leaderId);
  if (oldLeaderData) oldLeaderData.clanRole = 'officer';

  const newLeaderData = getPlayerData(newLeaderId);
  if (newLeaderData) newLeaderData.clanRole = 'leader';

  return { success: true };
}

function kickMember(
  kickerId: number,
  targetPlayerId: number,
): { success: boolean; error?: string } {
  const clanId = playerClanMembership.get(kickerId);
  if (!clanId) {
    return { success: false, error: 'Not in a clan' };
  }

  const clan = clans.get(clanId);
  if (!clan) {
    return { success: false, error: 'Clan not found' };
  }

  const kicker = clan.members.find((m) => m.playerId === kickerId);
  if (!kicker || kicker.role === 'member') {
    return { success: false, error: 'No permission to kick' };
  }

  const target = clan.members.find((m) => m.playerId === targetPlayerId);
  if (!target) {
    return { success: false, error: 'Player not in clan' };
  }

  // Can't kick leader
  if (target.role === 'leader') {
    return { success: false, error: 'Cannot kick the leader' };
  }

  // Officers can only kick members
  if (kicker.role === 'officer' && target.role !== 'member') {
    return { success: false, error: 'Officers can only kick members' };
  }

  // Remove from clan
  clan.members = clan.members.filter((m) => m.playerId !== targetPlayerId);
  playerClanMembership.delete(targetPlayerId);

  const targetData = getPlayerData(targetPlayerId);
  if (targetData) {
    targetData.clanId = undefined;
    targetData.clanRole = undefined;
  }

  return { success: true };
}

function addWarScore(clanId: string, score: number): void {
  const clan = clans.get(clanId);
  if (clan) {
    clan.weeklyWarScore += score;
  }
}

// ==================== TESTS ====================

describe('Clan System', () => {
  beforeEach(() => {
    clans.clear();
    playerClanMembership.clear();
    playerDataStore.clear();
    clanIdCounter = 0;
    setTime(0);
  });

  describe('Clan Creation', () => {
    beforeEach(() => {
      playerDataStore.set(100, { coins: 2000 });
    });

    it('should create clan successfully', () => {
      const result = createClan(
        100,
        'TestPlayer',
        'TestClan',
        'TEST',
        'A test clan',
      );
      expect(result.success).toBe(true);
      expect(result.clan).toBeDefined();
      expect(result.clan?.name).toBe('TestClan');
      expect(result.clan?.tag).toBe('TEST');
    });

    it('should deduct creation cost', () => {
      createClan(100, 'TestPlayer', 'TestClan', 'TEST', 'A test clan');
      expect(getPlayerData(100)?.coins).toBe(1000);
    });

    it('should make creator the leader', () => {
      const result = createClan(
        100,
        'TestPlayer',
        'TestClan',
        'TEST',
        'A test clan',
      );
      expect(result.clan?.leaderPlayerId).toBe(100);
      expect(result.clan?.members[0].role).toBe('leader');
    });

    it('should reject invalid name length', () => {
      const short = createClan(100, 'TestPlayer', 'AB', 'TEST', 'desc');
      expect(short.success).toBe(false);
      expect(short.error).toContain('3-20');

      const long = createClan(
        100,
        'TestPlayer',
        'A'.repeat(25),
        'TEST',
        'desc',
      );
      expect(long.success).toBe(false);
    });

    it('should reject invalid tag length', () => {
      const short = createClan(100, 'TestPlayer', 'TestClan', 'A', 'desc');
      expect(short.success).toBe(false);
      expect(short.error).toContain('2-5');
    });

    it('should reject if already in clan', () => {
      createClan(100, 'TestPlayer', 'TestClan', 'TEST', 'desc');
      const result = createClan(100, 'TestPlayer', 'NewClan', 'NEW', 'desc');
      expect(result.success).toBe(false);
      expect(result.error).toContain('already in a clan');
    });

    it('should reject duplicate name', () => {
      createClan(100, 'Player1', 'TestClan', 'TEST', 'desc');
      playerDataStore.set(200, { coins: 2000 });

      const result = createClan(200, 'Player2', 'TestClan', 'NEW', 'desc');
      expect(result.success).toBe(false);
      expect(result.error).toContain('name already taken');
    });

    it('should reject duplicate tag', () => {
      createClan(100, 'Player1', 'TestClan', 'TEST', 'desc');
      playerDataStore.set(200, { coins: 2000 });

      const result = createClan(200, 'Player2', 'NewClan', 'TEST', 'desc');
      expect(result.success).toBe(false);
      expect(result.error).toContain('tag already taken');
    });

    it('should reject if insufficient coins', () => {
      playerDataStore.set(200, { coins: 500 });
      const result = createClan(200, 'Player2', 'NewClan', 'NEW', 'desc');
      expect(result.success).toBe(false);
      expect(result.error).toContain('1000 coins');
    });
  });

  describe('Clan Membership', () => {
    let clanId: string;

    beforeEach(() => {
      playerDataStore.set(100, { coins: 2000 });
      playerDataStore.set(200, { coins: 500 });
      playerDataStore.set(300, { coins: 500 });

      const result = createClan(100, 'Leader', 'TestClan', 'TEST', 'desc');
      clanId = result.clan!.clanId;
    });

    it('should allow joining clan', () => {
      const result = joinClan(200, 'Member', clanId);
      expect(result.success).toBe(true);
    });

    it('should add member to clan list', () => {
      joinClan(200, 'Member', clanId);
      const clan = clans.get(clanId);
      expect(clan?.members.length).toBe(2);
    });

    it('should reject if already in a clan', () => {
      joinClan(200, 'Member', clanId);
      const result = joinClan(200, 'Member', clanId);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Already in a clan');
    });

    it('should reject if clan full', () => {
      const clan = clans.get(clanId)!;
      clan.maxMembers = 1;

      const result = joinClan(200, 'Member', clanId);
      expect(result.success).toBe(false);
      expect(result.error).toContain('full');
    });

    it('should allow leaving clan', () => {
      joinClan(200, 'Member', clanId);
      const result = leaveClan(200);
      expect(result.success).toBe(true);
    });

    it('should prevent leader from leaving with members', () => {
      joinClan(200, 'Member', clanId);
      const result = leaveClan(100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Transfer leadership');
    });

    it('should disband clan when last member leaves', () => {
      const result = leaveClan(100);
      expect(result.success).toBe(true);
      expect(clans.has(clanId)).toBe(false);
    });
  });

  describe('Clan Permissions', () => {
    let clanId: string;

    beforeEach(() => {
      playerDataStore.set(100, { coins: 2000 });
      playerDataStore.set(200, { coins: 500 });
      playerDataStore.set(300, { coins: 500 });

      const result = createClan(100, 'Leader', 'TestClan', 'TEST', 'desc');
      clanId = result.clan!.clanId;
      joinClan(200, 'Officer', clanId);
      joinClan(300, 'Member', clanId);
    });

    it('should allow leader to promote', () => {
      const result = promoteToOfficer(100, 200);
      expect(result.success).toBe(true);

      const clan = clans.get(clanId)!;
      const officer = clan.members.find((m) => m.playerId === 200);
      expect(officer?.role).toBe('officer');
    });

    it('should prevent non-leader from promoting', () => {
      promoteToOfficer(100, 200); // Make 200 an officer
      const result = promoteToOfficer(200, 300); // Officer tries to promote
      expect(result.success).toBe(false);
    });

    it('should allow leader to transfer leadership', () => {
      const result = transferLeadership(100, 200);
      expect(result.success).toBe(true);

      const clan = clans.get(clanId)!;
      expect(clan.leaderPlayerId).toBe(200);
    });

    it('should allow leader to kick members', () => {
      const result = kickMember(100, 300);
      expect(result.success).toBe(true);
    });

    it('should allow officer to kick members', () => {
      promoteToOfficer(100, 200);
      const result = kickMember(200, 300);
      expect(result.success).toBe(true);
    });

    it('should prevent officer from kicking other officers', () => {
      promoteToOfficer(100, 200);
      promoteToOfficer(100, 300);

      const result = kickMember(200, 300);
      expect(result.success).toBe(false);
    });

    it('should prevent kicking the leader', () => {
      promoteToOfficer(100, 200);
      const result = kickMember(200, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot kick the leader');
    });

    it('should prevent member from kicking', () => {
      const result = kickMember(300, 200);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No permission');
    });
  });

  describe('Clan Contributions', () => {
    let clanId: string;

    beforeEach(() => {
      playerDataStore.set(100, { coins: 2000 });
      playerDataStore.set(200, { coins: 500 });

      const result = createClan(100, 'Leader', 'TestClan', 'TEST', 'desc');
      clanId = result.clan!.clanId;
      joinClan(200, 'Member', clanId);
    });

    it('should allow contributions', () => {
      const result = contributeToClan(200, 100);
      expect(result.success).toBe(true);
      expect(getPlayerData(200)?.coins).toBe(400);
    });

    it('should add to clan experience', () => {
      contributeToClan(200, 100);
      const clan = clans.get(clanId)!;
      expect(clan.experience).toBe(100);
    });

    it('should track member contributions', () => {
      contributeToClan(200, 100);
      const clan = clans.get(clanId)!;
      const member = clan.members.find((m) => m.playerId === 200);
      expect(member?.contribution).toBe(100);
    });

    it('should reject if not enough coins', () => {
      const result = contributeToClan(200, 1000);
      expect(result.success).toBe(false);
    });

    it('should reject negative contributions', () => {
      const result = contributeToClan(200, -100);
      expect(result.success).toBe(false);
    });
  });

  describe('Clan Wars', () => {
    let clanId: string;

    beforeEach(() => {
      playerDataStore.set(100, { coins: 2000 });
      const result = createClan(100, 'Leader', 'TestClan', 'TEST', 'desc');
      clanId = result.clan!.clanId;
    });

    it('should track war score', () => {
      addWarScore(clanId, 100);
      const clan = clans.get(clanId)!;
      expect(clan.weeklyWarScore).toBe(100);
    });

    it('should accumulate war score', () => {
      addWarScore(clanId, 100);
      addWarScore(clanId, 50);
      const clan = clans.get(clanId)!;
      expect(clan.weeklyWarScore).toBe(150);
    });
  });
});

describe('Clan Exploit Prevention', () => {
  beforeEach(() => {
    clans.clear();
    playerClanMembership.clear();
    playerDataStore.clear();
    clanIdCounter = 0;
  });

  it('should prevent joining non-existent clan', () => {
    playerDataStore.set(100, { coins: 500 });
    const result = joinClan(100, 'Player', 'fake_clan');
    expect(result.success).toBe(false);
  });

  it('should prevent contribution manipulation', () => {
    playerDataStore.set(100, { coins: 2000 });
    playerDataStore.set(200, { coins: 100 });

    const { clan } = createClan(100, 'Leader', 'TestClan', 'TEST', 'desc');
    joinClan(200, 'Member', clan!.clanId);

    // Try to contribute more than owned
    const result = contributeToClan(200, 500);
    expect(result.success).toBe(false);
    expect(getPlayerData(200)?.coins).toBe(100); // Unchanged
  });

  it('should prevent permission escalation', () => {
    playerDataStore.set(100, { coins: 2000 });
    playerDataStore.set(200, { coins: 500 });

    const { clan } = createClan(100, 'Leader', 'TestClan', 'TEST', 'desc');
    joinClan(200, 'Member', clan!.clanId);

    // Member tries to promote self
    const result = promoteToOfficer(200, 200);
    expect(result.success).toBe(false);
  });
});
