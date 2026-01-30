import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(
  process.cwd(),
  'apps/game-data-api/data/games-database.json',
);

interface GameData {
  games: any[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalGames: number;
  };
}

function loadData(): GameData {
  const content = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(content);
}

function saveData(data: GameData): void {
  data.metadata.lastUpdated = new Date().toISOString();
  data.metadata.totalGames = data.games.length;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Our existing game: Coin Collector
const coinCollector = {
  id: generateId(),
  name: 'Coin Collector',
  developer: 'AIAWI Studios',
  genre: 'Simulation',
  releaseDate: '2026-01-28T00:00:00.000Z',
  platform: 'Roblox',
  ageGroup: 'Elementary (6-12)',
  ownership: 'Our Game',
  description:
    'The ultimate coin collecting, pet raising, obstacle course game! Collect coins, buy pets from 16 types, explore 6 unique maps, compete on leaderboards, and steal coins from other players! Features daily rewards, egg hatching, rebirth system, lucky wheel, and more.',
  thumbnailUrl: '',
  gameUrl: '',
  monetizationModel: 'Freemium',
  tags: [
    'pets',
    'collection',
    'coins',
    'obby',
    'social',
    'trading',
    'gacha',
    'minigames',
    'roller-coasters',
  ],
  featureFlags: {
    hasCollectionSystem: true,
    hasTradingSystem: true,
    hasProgressionSystem: true,
    hasCraftingSystem: false,
    hasBuildingSystem: false,
    hasMultiplayer: true,
    hasGuilds: true,
    hasChat: true,
    hasFriendSystem: true,
    hasLeaderboards: true,
    hasInAppPurchases: true,
    hasGachaSystem: true,
    hasSeasonPass: false,
    hasAds: false,
    hasVIPSystem: true,
    hasLevelSystem: true,
    hasSkillTree: false,
    hasAchievements: true,
    hasQuests: true,
    hasDailies: true,
    hasProcGeneratedContent: false,
    hasStoryMode: false,
    hasPvP: true,
    hasPvE: true,
    hasRaids: false,
    hasCharacterCustomization: true,
    hasHousingCustomization: false,
    hasSkinSystem: false,
    hasEmotes: false,
    hasVirtualCurrency: true,
    hasMarketplace: false,
    hasAuctions: false,
    hasCrossPlatform: false,
    hasCloudSaves: false,
    hasOfflineProgress: false,
  },
  priorityScore: 95,
  recommendedForReplication: false,
  strengths: [
    '27 implemented features',
    'Proven Pet Simulator formula',
    'Multiple engagement loops',
    'Strong monetization hooks',
  ],
  weaknesses: ['New game, building player base', 'Competitive market'],
  uniqueSellingPoints: [
    'Coin stealing PvP mechanic',
    'Roller coaster social rides',
    'Pet evolution and fusion',
    'Limited seasonal events',
  ],
  lessonsLearned: [
    'Gacha drives early revenue',
    'Daily rewards boost D1 retention',
    'Trading creates social stickiness',
  ],
  features: [
    {
      id: generateId(),
      name: 'Egg Hatching (Gacha)',
      description: 'RNG-based pet acquisition with tiered rarity system',
      category: 'Core Gameplay',
      importance: 'Critical',
      implementationComplexity: 'Medium',
      userEngagementImpact: 10,
      monetizationPotential: 10,
      technicalNotes:
        'Common 50%, Uncommon 30%, Rare 15%, Epic 4%, Legendary 0.5%, Mythic 0.1%',
      whatMakesItGreat: [
        'Drives repeat purchases',
        'Creates scarcity',
        'Emotional wins',
      ],
      improvementOpportunities: ['Pity system', 'Guaranteed rates'],
      competitiveAdvantage: 'Higher legendary rates than competitors',
      creationTime: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Pet Collection System',
      description: '16 unique pets across 4 tiers with collection bonuses',
      category: 'Core Gameplay',
      importance: 'Critical',
      implementationComplexity: 'Hard',
      userEngagementImpact: 10,
      monetizationPotential: 9,
      technicalNotes:
        'Pets follow player, auto-collect coins, have unique animations',
      whatMakesItGreat: [
        'Pokemon-style addiction',
        'Completionist appeal',
        'Social flex',
      ],
      improvementOpportunities: ['More pets', 'Shiny variants'],
      competitiveAdvantage: 'Pets have gameplay utility not just cosmetic',
      creationTime: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Rebirth/Prestige System',
      description: 'Reset progress for permanent multipliers',
      category: 'Progression',
      importance: 'Critical',
      implementationComplexity: 'Easy',
      userEngagementImpact: 9,
      monetizationPotential: 7,
      technicalNotes: 'Cost scaling: base * (1.5 ^ rebirthCount)',
      whatMakesItGreat: [
        'Extends game life',
        'Creates goals',
        'Sense of achievement',
      ],
      improvementOpportunities: ['Rebirth exclusive pets'],
      competitiveAdvantage: 'Rebirth unlocks exclusive areas',
      creationTime: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Daily Login Rewards',
      description: '7-day escalating reward calendar that repeats',
      category: 'Retention',
      importance: 'Critical',
      implementationComplexity: 'Easy',
      userEngagementImpact: 8,
      monetizationPotential: 5,
      technicalNotes: 'Rewards: 10 → 25 → 50 → 100 → 200 → 350 → 500 coins',
      whatMakesItGreat: [
        'Simple but effective',
        'Creates habit',
        'FOMO for missed days',
      ],
      improvementOpportunities: ['Premium streak track'],
      competitiveAdvantage: 'Streak resets give catch-up mechanics',
      creationTime: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Trading System',
      description: 'Secure player-to-player trading with confirmation',
      category: 'Social',
      importance: 'High',
      implementationComplexity: 'Hard',
      userEngagementImpact: 8,
      monetizationPotential: 6,
      technicalNotes: 'Double confirm, trade history, scam prevention',
      whatMakesItGreat: ['Creates community', 'Player economy', 'Social bonds'],
      improvementOpportunities: ['Trade value estimator'],
      competitiveAdvantage: 'Secure trade logs prevent scams',
      creationTime: new Date().toISOString(),
    },
  ],
  systems: [],
  rewards: [],
  mechanics: [],
  successFactors: [],
  successMetrics: {
    totalPlays: 0, // New game
    concurrentPlayers: 0,
    peakConcurrentPlayers: 0,
    averageSessionLength: 0,
    retentionRateDay1: 0,
    retentionRateDay7: 0,
    retentionRateDay30: 0,
    revenueTotal: 0,
    revenueMonthly: 0,
    conversionRate: 0,
    averageRevenuePerUser: 0,
  },
  creationTime: new Date().toISOString(),
  lastModificationTime: new Date().toISOString(),
};

// New game concept: Dragon Legends
const dragonLegends = {
  id: generateId(),
  name: 'Dragon Legends',
  developer: 'AIAWI Studios',
  genre: 'RPG',
  releaseDate: '2026-03-01T00:00:00.000Z', // Planned release
  platform: 'Roblox',
  ageGroup: 'Teen (13-17)',
  ownership: 'Our Game',
  description:
    'Dragon Legends combines pet collection with anime-style combat! Collect 50+ dragons, breed rare hybrids, battle in elemental combat, raid world bosses, and compete in clan wars. Dragon breeding, evolution, and PvP arena create deep engagement loops.',
  thumbnailUrl: '',
  gameUrl: '',
  monetizationModel: 'Freemium',
  tags: [
    'dragons',
    'collection',
    'breeding',
    'combat',
    'pvp',
    'gacha',
    'clans',
    'anime',
    'rpg',
    'boss-raids',
  ],
  featureFlags: {
    hasCollectionSystem: true,
    hasTradingSystem: true,
    hasProgressionSystem: true,
    hasCraftingSystem: true, // Dragon breeding
    hasBuildingSystem: false,
    hasMultiplayer: true,
    hasGuilds: true, // Clans
    hasChat: true,
    hasFriendSystem: true,
    hasLeaderboards: true,
    hasInAppPurchases: true,
    hasGachaSystem: true, // Egg hatching
    hasSeasonPass: true, // Battle pass
    hasAds: false,
    hasVIPSystem: true,
    hasLevelSystem: true, // Dragon levels
    hasSkillTree: true, // Dragon abilities
    hasAchievements: true,
    hasQuests: true,
    hasDailies: true,
    hasProcGeneratedContent: false,
    hasStoryMode: false,
    hasPvP: true, // Arena battles
    hasPvE: true, // Wild dragon battles
    hasRaids: true, // World bosses
    hasCharacterCustomization: true,
    hasHousingCustomization: false,
    hasSkinSystem: true, // Dragon skins
    hasEmotes: false,
    hasVirtualCurrency: true,
    hasMarketplace: true, // Dragon trading
    hasAuctions: false,
    hasCrossPlatform: false,
    hasCloudSaves: false,
    hasOfflineProgress: false,
  },
  priorityScore: 98,
  recommendedForReplication: true,
  strengths: [
    'Combines proven formulas (Pet Sim + Blox Fruits)',
    'Dragon breeding creates unique value',
    'Elemental combat adds depth',
    'Strong clan/social features',
    'Multiple monetization points',
  ],
  weaknesses: [
    'Higher development complexity',
    'Requires combat balancing',
    'Competitive RPG market',
  ],
  uniqueSellingPoints: [
    'Dragon breeding system with genetic inheritance',
    'Elemental rock-paper-scissors combat',
    '3-stage dragon evolution with legendary forms',
    'Weekly clan wars with territory control',
    'World boss raids with server-wide participation',
  ],
  lessonsLearned: [
    'Breeding creates endless content without dev work',
    'Elemental combat easy to understand, hard to master',
    'Clans drive long-term retention',
    'World bosses create community events',
  ],
  features: [
    {
      id: generateId(),
      name: 'Dragon Breeding System',
      description:
        'Combine two dragons to create unique hybrid offspring with inherited traits',
      category: 'Core Gameplay',
      importance: 'Critical',
      implementationComplexity: 'Expert',
      userEngagementImpact: 10,
      monetizationPotential: 10,
      technicalNotes:
        'Genetic system: element inheritance, stat variance, rare mutation chance (5%)',
      whatMakesItGreat: [
        'User-generated content',
        'Infinite replayability',
        'Trading value',
      ],
      improvementOpportunities: ['Shiny breeding', 'Legendary fusion'],
      competitiveAdvantage:
        'True genetic system not found in other Roblox games',
      creationTime: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Elemental Combat System',
      description: 'Turn-based battles with elemental type advantages',
      category: 'Core Gameplay',
      importance: 'Critical',
      implementationComplexity: 'Hard',
      userEngagementImpact: 9,
      monetizationPotential: 7,
      technicalNotes:
        'Fire > Ice > Electric > Water > Fire. Nature, Shadow, Light triangle.',
      whatMakesItGreat: ['Strategic depth', 'Easy to learn', 'Team building'],
      improvementOpportunities: ['Weather effects', 'Terrain bonuses'],
      competitiveAdvantage: 'More strategic than button-mashing combat',
      creationTime: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Dragon Evolution',
      description: '3-stage evolution with legendary transformation',
      category: 'Progression',
      importance: 'Critical',
      implementationComplexity: 'Medium',
      userEngagementImpact: 9,
      monetizationPotential: 8,
      technicalNotes:
        'Baby (1-10) → Teen (11-25) → Adult (26-50) → Legendary (50 + item)',
      whatMakesItGreat: [
        'Visual progression',
        'Power growth',
        'Investment feeling',
      ],
      improvementOpportunities: ['Branch evolution paths'],
      competitiveAdvantage: 'Legendary forms require rare items from raids',
      creationTime: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Clan Wars',
      description: 'Weekly team-based battles with territory control',
      category: 'Social',
      importance: 'High',
      implementationComplexity: 'Hard',
      userEngagementImpact: 9,
      monetizationPotential: 6,
      technicalNotes:
        'Up to 50 members, weekly reset, exclusive dragon rewards',
      whatMakesItGreat: ['Team bonding', 'Competitive drive', 'Weekly events'],
      improvementOpportunities: ['Clan levels', 'Perks system'],
      competitiveAdvantage: 'Territory control gives clan-wide bonuses',
      creationTime: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'World Boss Raids',
      description: 'Server-wide cooperative boss battles',
      category: 'Content',
      importance: 'High',
      implementationComplexity: 'Expert',
      userEngagementImpact: 10,
      monetizationPotential: 8,
      technicalNotes:
        'Multi-phase battles, contribution-based rewards, rare dragon drops',
      whatMakesItGreat: ['Community events', 'Epic scale', 'Rare rewards'],
      improvementOpportunities: ['Rotating boss schedule'],
      competitiveAdvantage: 'Exclusive legendary dragons only from raids',
      creationTime: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'PvP Arena',
      description: 'Ranked 1v1 and 3v3 dragon battles with seasonal rewards',
      category: 'Content',
      importance: 'High',
      implementationComplexity: 'Hard',
      userEngagementImpact: 8,
      monetizationPotential: 7,
      technicalNotes:
        'ELO-based matchmaking, season reset, exclusive ranked rewards',
      whatMakesItGreat: [
        'Competitive drive',
        'Skill expression',
        'Bragging rights',
      ],
      improvementOpportunities: ['Tournaments', 'Spectator mode'],
      competitiveAdvantage: 'Balanced matchmaking prevents newbie stomping',
      creationTime: new Date().toISOString(),
    },
  ],
  systems: [],
  rewards: [],
  mechanics: [],
  successFactors: [],
  successMetrics: {
    totalPlays: 0, // Not released yet
    concurrentPlayers: 0,
    peakConcurrentPlayers: 0,
    averageSessionLength: 0,
    retentionRateDay1: 0,
    retentionRateDay7: 0,
    retentionRateDay30: 0,
    revenueTotal: 0,
    revenueMonthly: 0,
    conversionRate: 0,
    averageRevenuePerUser: 0,
  },
  creationTime: new Date().toISOString(),
  lastModificationTime: new Date().toISOString(),
};

// Main script
function main() {
  console.log('📊 Adding our games to the database...\n');

  const data = loadData();

  // Check if games already exist
  const coinCollectorExists = data.games.some(
    (g) => g.name === 'Coin Collector' && g.ownership === 'Our Game',
  );
  const dragonLegendsExists = data.games.some(
    (g) => g.name === 'Dragon Legends' && g.ownership === 'Our Game',
  );

  if (!coinCollectorExists) {
    data.games.push(coinCollector);
    console.log('✅ Added: Coin Collector (Our Game)');
  } else {
    console.log('⏭️  Skipped: Coin Collector (already exists)');
  }

  if (!dragonLegendsExists) {
    data.games.push(dragonLegends);
    console.log('✅ Added: Dragon Legends (Our Game)');
  } else {
    console.log('⏭️  Skipped: Dragon Legends (already exists)');
  }

  saveData(data);

  console.log(`\n📈 Total games in database: ${data.games.length}`);
  console.log('🎮 Our Games:');
  data.games
    .filter((g) => g.ownership === 'Our Game')
    .forEach((g) => {
      console.log(`   - ${g.name} (Priority: ${g.priorityScore})`);
    });
}

main();
