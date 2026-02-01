/**
 * Roblox Game Intelligence Seed Data
 *
 * Top games analyzed with:
 * - WHY they're successful
 * - WHAT features drive engagement
 * - LESSONS for our games
 */

import {
  JsonStorageService,
  generateId,
  getCurrentTimestamp,
} from './json-storage.service';

interface RobloxGameAnalysis {
  id: string;
  name: string;
  robloxId: string;
  genre: string;

  // Metrics
  concurrentPlayers: number;
  totalVisits: number;
  likesPercent: number;
  estimatedMonthlyRevenue: number;

  // WHY Analysis
  whyPopular: string[];
  coreLoop: string;
  retentionHooks: string[];
  monetizationStrategies: string[];

  // Features
  keyFeatures: {
    name: string;
    category: string;
    importance: 'Critical' | 'High' | 'Medium';
    description: string;
    whyItWorks: string;
    implementationNotes: string;
  }[];

  // Learnings
  lessonsLearned: string[];
  featuresToCopy: string[];
  mistakesToAvoid: string[];

  // For our planning
  recommendedForStudy: boolean;
  studyPriority: number; // 1-100

  lastUpdated: Date;
}

const topRobloxGames: RobloxGameAnalysis[] = [
  {
    id: generateId(),
    name: 'Pet Simulator X',
    robloxId: '6284583030',
    genre: 'Simulator',

    concurrentPlayers: 150000,
    totalVisits: 30000000000,
    likesPercent: 89,
    estimatedMonthlyRevenue: 3000000,

    whyPopular: [
      'Deeply satisfying collection loop - always something new to get',
      'Massive variety of pets with clear rarity tiers',
      'Regular updates (weekly) keep content fresh',
      'Strong social features - trading creates economy',
      'YouTuber partnerships drive massive awareness',
      'Events create urgency and FOMO',
      'Simple to understand, hard to master',
    ],

    coreLoop:
      'Collect coins → Buy eggs → Hatch pets → Upgrade pets → Trade → Repeat with better areas',

    retentionHooks: [
      'Daily login rewards with escalating value',
      'Limited-time events with exclusive pets',
      'Trading economy creates social investment',
      'Rebirth system resets progress for permanent boosts',
      'Leaderboards for competitive players',
      'Group rewards for joining studio group',
    ],

    monetizationStrategies: [
      'Gamepasses: 2x coins, auto-collect, bigger backpack',
      'Robux eggs with better odds',
      'Premium exclusive areas',
      'Exclusive pets only available for Robux',
      'Season passes with tiered rewards',
    ],

    keyFeatures: [
      {
        name: 'Egg Hatching System',
        category: 'Collection',
        importance: 'Critical',
        description:
          'Buy eggs, watch them hatch with animation, get random pet from pool',
        whyItWorks:
          'Slot machine psychology - anticipation + surprise + variable rewards',
        implementationNotes:
          'Need: egg types, rarity weights, hatch animation, inventory system',
      },
      {
        name: 'Pet Fusion/Enchanting',
        category: 'Progression',
        importance: 'High',
        description:
          'Combine multiple pets to create stronger golden/rainbow versions',
        whyItWorks: 'Gives purpose to duplicate pets, creates long-term goals',
        implementationNotes:
          'Requires inventory management, clear UI for selection',
      },
      {
        name: 'Trading System',
        category: 'Social',
        importance: 'Critical',
        description: 'Player-to-player pet trading with offer/counter system',
        whyItWorks: 'Creates player economy, social bonds, and perceived value',
        implementationNotes:
          'Anti-scam UI important, trade history, value indicators',
      },
      {
        name: 'Rebirth/Prestige',
        category: 'Progression',
        importance: 'High',
        description: 'Reset progress for permanent multipliers',
        whyItWorks:
          'Extends game lifecycle, gives veterans advantage, satisfying reset',
        implementationNotes:
          'Clear benefits display, confirmation dialogs, milestone rewards',
      },
      {
        name: 'World Unlocks',
        category: 'Progression',
        importance: 'Medium',
        description:
          'New areas unlock with better eggs/coins as player progresses',
        whyItWorks:
          'Clear goals, sense of advancement, content gating keeps things fresh',
        implementationNotes:
          'Portal with cost displayed, visual previews of new areas',
      },
    ],

    lessonsLearned: [
      'Update frequency matters more than update size',
      'YouTuber codes drive massive traffic spikes',
      'Rarity tiers should be clearly communicated visually',
      'Trading adds 10x retention vs collect-only games',
      'Events should last 1-2 weeks max for urgency',
    ],

    featuresToCopy: [
      'Egg hatching with animation anticipation',
      'Visual rarity tiers (normal/gold/rainbow/dark matter)',
      'Weekly events with exclusive rewards',
      'Promo code system for marketing',
      'Auto-collect gamepasses for QoL monetization',
    ],

    mistakesToAvoid: [
      'Dont make rarest pets too impossible - frustrates players',
      'Dont make trading too complex - simple offer UI',
      'Dont update without testing - bugs kill retention',
    ],

    recommendedForStudy: true,
    studyPriority: 98,
    lastUpdated: new Date(),
  },
  {
    id: generateId(),
    name: 'Adopt Me',
    robloxId: '920587237',
    genre: 'Social/Roleplay',

    concurrentPlayers: 200000,
    totalVisits: 35000000000,
    likesPercent: 85,
    estimatedMonthlyRevenue: 5000000,

    whyPopular: [
      'Appeals to younger demographic (casual, cute, non-violent)',
      'Pet collection with emotional attachment',
      'Housing/decoration satisfies creative players',
      'Trading economy is massive social driver',
      'Family roleplay creates repeat play sessions',
      'Simple enough for 6 year olds to enjoy',
    ],

    coreLoop:
      'Earn money → Buy/hatch pets → Care for pets → Trade → Decorate house → Roleplay',

    retentionHooks: [
      'Pet aging system - log in to age up',
      'Daily login streak rewards',
      'Seasonal events with exclusive pets',
      'House building progress',
      'Trading for dream pets',
    ],

    monetizationStrategies: [
      'Premium eggs with rare pets',
      'Fly/Ride potions for pet upgrades',
      'Premium house packs',
      'Premium currency for exclusive items',
      'VIP servers',
    ],

    keyFeatures: [
      {
        name: 'Pet Aging System',
        category: 'Engagement',
        importance: 'Critical',
        description:
          'Pets age through stages (baby→junior→pre-teen→teen→post-teen→full grown) with care tasks',
        whyItWorks:
          'Creates daily login habit, emotional investment, sense of nurturing',
        implementationNotes:
          'Care minigames, progress bar, visual changes per stage',
      },
      {
        name: 'Fly/Ride Potions',
        category: 'Monetization',
        importance: 'Critical',
        description:
          'One-time purchases that permanently let pets fly or be ridden',
        whyItWorks:
          'Clear value, permanent upgrade, applies to any pet, visible status',
        implementationNotes:
          'Premium currency purchase, visual indicators on pets',
      },
      {
        name: 'House Building',
        category: 'Creative',
        importance: 'High',
        description: 'Build and decorate your own house with furniture',
        whyItWorks:
          'Self-expression, showing off to friends, endless customization',
        implementationNotes: 'Placement system, furniture variety, house types',
      },
    ],

    lessonsLearned: [
      'Cute aesthetic appeals to huge young demographic',
      'Lower skill ceiling = more accessible = more players',
      'Care mechanics create emotional bonds with virtual items',
      'Housing/decoration is underrated retention driver',
      'Seasonal events drive massive return traffic',
    ],

    featuresToCopy: [
      'Pet aging creates daily login habit',
      'Fly/Ride as premium upgrades (clear value)',
      'Housing lets players express creativity',
      'Care tasks as simple engagement loops',
    ],

    mistakesToAvoid: [
      'Dont make it too grindy - casual audience',
      'Dont neglect moderation - young players',
      'Dont make pet values unclear - economy gets messy',
    ],

    recommendedForStudy: true,
    studyPriority: 95,
    lastUpdated: new Date(),
  },
  {
    id: generateId(),
    name: 'Blox Fruits',
    robloxId: '2753915549',
    genre: 'Adventure/Fighting',

    concurrentPlayers: 300000,
    totalVisits: 45000000000,
    likesPercent: 88,
    estimatedMonthlyRevenue: 4000000,

    whyPopular: [
      'Anime inspiration (One Piece) taps huge fanbase',
      'Deep combat system with skill ceiling',
      'Fruit hunting creates treasure hunt excitement',
      'PvP creates competitive replayability',
      'Massive world to explore',
      'Clear progression (levels, fruits, gear)',
    ],

    coreLoop:
      'Fight NPCs → Level up → Find fruits → Learn moves → Fight players → Raid bosses',

    retentionHooks: [
      'Fruit spawning creates constant hunt',
      'Level progression (1-2550) takes months',
      'Rare fruits are status symbols',
      'Guilds create social bonds',
      'Boss raids require coordination',
    ],

    monetizationStrategies: [
      '2x XP/mastery/drop gamepasses',
      'Fruit storage gamepass',
      'Race awakening gamepass',
      'Premium Robux fruits (guaranteed)',
      'Permanent fruits (dont lose on death)',
    ],

    keyFeatures: [
      {
        name: 'Devil Fruit System',
        category: 'Core',
        importance: 'Critical',
        description: 'Random spawning fruits grant unique powers and movesets',
        whyItWorks:
          'Treasure hunting excitement, build diversity, trading value, status',
        implementationNotes:
          'Spawn timer, rarity tiers, moveset per fruit, visual effects',
      },
      {
        name: 'Mastery System',
        category: 'Progression',
        importance: 'High',
        description: 'Using abilities levels them up, unlocking more moves',
        whyItWorks:
          'Rewards consistent play, feeling of getting stronger, skill investment',
        implementationNotes: 'XP per use, unlock thresholds, UI for progress',
      },
      {
        name: 'Sea Events/Raids',
        category: 'Social',
        importance: 'Medium',
        description: 'Group content requiring multiple players',
        whyItWorks: 'Forces social play, guild engagement, shared achievements',
        implementationNotes:
          'Difficulty scaling, reward distribution, coordination mechanics',
      },
    ],

    lessonsLearned: [
      'Anime IP inspiration draws built-in audience',
      'Long progression (months) keeps hardcore players',
      'Combat skill ceiling creates competitive scene',
      'Rare random drops create memorable moments',
      'Trading rare items creates player economy',
    ],

    featuresToCopy: [
      'Random spawning rare items (treasure hunt)',
      'Mastery/ability unlock progression',
      'Guild system for social retention',
      'Multiple progression paths (combat, exploration)',
    ],

    mistakesToAvoid: [
      'Dont make early game too punishing',
      'Dont make fruits too pay-to-win',
      'Dont neglect balance - OP fruits kill PvP',
    ],

    recommendedForStudy: true,
    studyPriority: 92,
    lastUpdated: new Date(),
  },
  {
    id: generateId(),
    name: 'Brookhaven RP',
    robloxId: '4924922222',
    genre: 'Roleplay',

    concurrentPlayers: 400000,
    totalVisits: 40000000000,
    likesPercent: 86,
    estimatedMonthlyRevenue: 2500000,

    whyPopular: [
      'Complete sandbox freedom appeals to all ages',
      'No objectives = no fail state = relaxing',
      'Social hub for hanging out with friends',
      'Houses/cars as status symbols',
      'Roleplay scenarios endless variety',
      'Minimal learning curve',
    ],

    coreLoop:
      'Get house → Get car → Customize → Roleplay with friends → Show off → Repeat',

    retentionHooks: [
      'Social pressure to have coolest stuff',
      'Regular updates add new items',
      'Friends invite friends',
      'No progression to "finish"',
    ],

    monetizationStrategies: [
      'Premium houses only',
      'Premium vehicles only',
      'Premium accessories',
      'Game passes for special abilities',
    ],

    keyFeatures: [
      {
        name: 'Free Roam Sandbox',
        category: 'Core',
        importance: 'Critical',
        description: 'No objectives, just a town to explore and roleplay in',
        whyItWorks:
          'No pressure, pure social experience, imagination drives play',
        implementationNotes:
          'Need variety of locations, interactive objects, vehicles',
      },
      {
        name: 'House Selection',
        category: 'Social',
        importance: 'Critical',
        description: 'Pick any house in town as your own',
        whyItWorks: 'Identity, status, base for roleplay, reason to show off',
        implementationNotes: 'Variety of styles and sizes, premium options',
      },
    ],

    lessonsLearned: [
      'Sometimes no objectives is the feature',
      'Social games need a nice environment to hang out',
      'Status items (houses, cars) drive spending',
      'Simple games scale better - less complexity to maintain',
      'Target young/casual players = massive audience',
    ],

    featuresToCopy: [
      'Clean aesthetic environment',
      'Variety of status items',
      'Simple interaction systems',
    ],

    mistakesToAvoid: [
      'Dont add complex systems - keep it simple',
      'Dont force objectives on sandbox players',
    ],

    recommendedForStudy: true,
    studyPriority: 75,
    lastUpdated: new Date(),
  },
  {
    id: generateId(),
    name: 'Murder Mystery 2',
    robloxId: '142823291',
    genre: 'Horror/Social',

    concurrentPlayers: 80000,
    totalVisits: 6000000000,
    likesPercent: 87,
    estimatedMonthlyRevenue: 1500000,

    whyPopular: [
      'Simple rules everyone understands',
      'Short rounds = quick dopamine hits',
      'Knife collecting creates long-term goals',
      'Trading economy older than most Roblox economies',
      'Perfect for groups of friends',
      'Social deduction is inherently fun',
    ],

    coreLoop:
      'Play round → Get coins → Unbox knives → Trade for rare knives → Show off → Play more',

    retentionHooks: [
      'Knife rarity creates collection goals',
      'Trading for rare items',
      'Daily rewards',
      'Seasonal crates with exclusive items',
    ],

    monetizationStrategies: [
      'Premium crates',
      'Radio gamepass',
      'Exclusive knife bundles',
    ],

    keyFeatures: [
      {
        name: 'Role Assignment',
        category: 'Core',
        importance: 'Critical',
        description: 'Random innocent/sheriff/murderer assignment each round',
        whyItWorks:
          'Variety in gameplay, social deduction fun, no main character',
        implementationNotes: 'Random selection, clear role UI, round timers',
      },
      {
        name: 'Knife Trading',
        category: 'Economy',
        importance: 'High',
        description: 'Player economy for cosmetic knives',
        whyItWorks: 'Status symbols, collection goals, social interaction',
        implementationNotes: 'Trade UI, rarity system, secure trading',
      },
    ],

    lessonsLearned: [
      'Simple core gameplay + deep collection = winning formula',
      'Short rounds fit mobile/casual sessions',
      'Cosmetic trading creates game-outside-game',
      'Social games create viral growth (friends invite friends)',
    ],

    featuresToCopy: [
      'Quick round-based gameplay',
      'Cosmetic collection with trading',
      'Clear rarity tiers with visual distinction',
    ],

    mistakesToAvoid: [
      'Dont make cosmetics affect gameplay (P2W)',
      'Dont make rounds too long',
    ],

    recommendedForStudy: true,
    studyPriority: 70,
    lastUpdated: new Date(),
  },
];

// Feature synthesis - what features appear across top games
const featureImportanceMatrix = {
  'Pet/Item Collection': {
    games: 5,
    importance: 'Must Have',
    reason: 'Collection creates long-term goals and trading economy',
  },
  'Trading System': {
    games: 4,
    importance: 'Must Have',
    reason:
      'Trading creates social bonds, perceived value, and extended retention',
  },
  'Daily Rewards': {
    games: 5,
    importance: 'Must Have',
    reason: 'Creates daily login habit with minimal development',
  },
  'Rarity Tiers': {
    games: 5,
    importance: 'Must Have',
    reason: 'Clear progression, status symbols, trading value',
  },
  'Weekly Events': {
    games: 4,
    importance: 'High',
    reason: 'Drives return traffic, creates urgency/FOMO',
  },
  'Promo Codes': {
    games: 4,
    importance: 'High',
    reason: 'Free marketing through YouTubers/streamers',
  },
  'Rebirth/Prestige': {
    games: 3,
    importance: 'High',
    reason: 'Extends game lifecycle for engaged players',
  },
  'Guilds/Clans': {
    games: 3,
    importance: 'Medium',
    reason: 'Social retention, group goals',
  },
  Leaderboards: {
    games: 4,
    importance: 'Medium',
    reason: 'Competition for top players',
  },
  'Housing/Customization': {
    games: 2,
    importance: 'Medium',
    reason: 'Self-expression, status, roleplay',
  },
};

// Strategic recommendation synthesis
const strategicRecommendations = {
  bestGenreToMake: {
    genre: 'Simulator with Collection',
    reason: 'Highest revenue potential, proven formula, replicable systems',
    examples: ['Pet Simulator X', 'Mining Simulator', 'Bee Swarm Simulator'],
    risk: 'Medium - saturated market requires differentiation',
  },

  mustHaveFeatures: [
    {
      feature: 'Collection System',
      reason: 'Every top game has something to collect',
      priority: 1,
    },
    {
      feature: 'Trading',
      reason: 'Creates organic economy and social retention',
      priority: 2,
    },
    {
      feature: 'Daily Rewards',
      reason: 'Low effort, high retention impact',
      priority: 3,
    },
    {
      feature: 'Rarity System',
      reason: 'Drives collecting motivation and spending',
      priority: 4,
    },
    {
      feature: 'Rebirth/Prestige',
      reason: 'Extends endgame for engaged players',
      priority: 5,
    },
  ],

  differentiationIdeas: [
    'Unique theme (dragons, dinosaurs, robots)',
    'Better narrative/lore',
    'More satisfying animations/effects',
    'Innovative collection twist',
    'Better new player experience',
  ],

  launchStrategy: [
    { phase: 'Week 1-2', action: 'Core loop + 3 areas + 50 items' },
    { phase: 'Week 3-4', action: 'Trading system + daily rewards' },
    { phase: 'Week 5-6', action: 'First event + promo codes' },
    { phase: 'Month 2+', action: 'Weekly updates, YouTuber outreach' },
  ],
};

export function seedRobloxGameIntelligence(storage: JsonStorageService): void {
  console.log('🎮 Seeding Roblox Game Intelligence...');

  // Store in games collection with extended data
  topRobloxGames.forEach((game) => {
    const gameData = {
      id: game.id,
      name: game.name,
      robloxId: game.robloxId,
      genre: game.genre,
      platform: 'Roblox',

      // Metrics
      metrics: {
        concurrentPlayers: game.concurrentPlayers,
        totalVisits: game.totalVisits,
        likesPercent: game.likesPercent,
        estimatedMonthlyRevenue: game.estimatedMonthlyRevenue,
      },

      // Analysis
      analysis: {
        whyPopular: game.whyPopular,
        coreLoop: game.coreLoop,
        retentionHooks: game.retentionHooks,
        monetizationStrategies: game.monetizationStrategies,
        keyFeatures: game.keyFeatures,
        lessonsLearned: game.lessonsLearned,
        featuresToCopy: game.featuresToCopy,
        mistakesToAvoid: game.mistakesToAvoid,
      },

      recommendedForStudy: game.recommendedForStudy,
      studyPriority: game.studyPriority,

      creationTime: getCurrentTimestamp(),
      lastModificationTime: getCurrentTimestamp(),
    };

    // Add to products collection as reference games
    storage.create('products', {
      id: game.id,
      name: game.name,
      slug: game.name.toLowerCase().replace(/\s+/g, '-'),
      description: game.whyPopular.join('. '),
      category: 'Game',
      subcategory: game.genre,
      platforms: ['Roblox'],
      relationship: 'Reference',
      status: 'Mature',
      priorityScore: game.studyPriority,
      recommendedForStudy: game.recommendedForStudy,

      featureFlags: {
        hasMultiplayer: true,
        hasLeaderboards: true,
        hasInAppPurchases: true,
        hasSocialFeatures: true,
      },

      strengths: game.whyPopular,
      lessonsLearned: game.lessonsLearned,

      metrics: {
        totalUsers: game.totalVisits,
        averageRating: game.likesPercent / 20, // Convert to 5-star scale
      },

      tags: ['roblox', game.genre.toLowerCase(), 'reference'],

      creationTime: getCurrentTimestamp(),
      lastModificationTime: getCurrentTimestamp(),
    } as any);
  });

  console.log(`✅ Seeded ${topRobloxGames.length} Roblox games with analysis`);
}

// Export for API endpoints
export { topRobloxGames, featureImportanceMatrix, strategicRecommendations };
