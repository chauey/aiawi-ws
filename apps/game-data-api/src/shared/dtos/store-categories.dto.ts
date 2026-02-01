/**
 * Store Categories - Maps to App Store and Google Play Store categories
 * This provides granular classification like the official stores
 */

// ==========================================
// APP STORE CATEGORIES (iOS)
// ==========================================

export enum AppStoreCategory {
  // Games
  Games = 'Games',
  GamesAction = 'Games - Action',
  GamesAdventure = 'Games - Adventure',
  GamesArcade = 'Games - Arcade',
  GamesBoard = 'Games - Board',
  GamesCard = 'Games - Card',
  GamesCasino = 'Games - Casino',
  GamesCasual = 'Games - Casual',
  GamesEducational = 'Games - Educational',
  GamesFamily = 'Games - Family',
  GamesMusic = 'Games - Music',
  GamesPuzzle = 'Games - Puzzle',
  GamesRacing = 'Games - Racing',
  GamesRolePlaying = 'Games - Role Playing',
  GamesSimulation = 'Games - Simulation',
  GamesSports = 'Games - Sports',
  GamesStrategy = 'Games - Strategy',
  GamesTrivia = 'Games - Trivia',
  GamesWord = 'Games - Word',

  // Apps
  Books = 'Books',
  Business = 'Business',
  DeveloperTools = 'Developer Tools',
  Education = 'Education',
  Entertainment = 'Entertainment',
  Finance = 'Finance',
  FoodDrink = 'Food & Drink',
  GraphicsDesign = 'Graphics & Design',
  HealthFitness = 'Health & Fitness',
  Lifestyle = 'Lifestyle',
  Medical = 'Medical',
  Music = 'Music',
  Navigation = 'Navigation',
  News = 'News',
  PhotoVideo = 'Photo & Video',
  Productivity = 'Productivity',
  Reference = 'Reference',
  Shopping = 'Shopping',
  SocialNetworking = 'Social Networking',
  Sports = 'Sports',
  Travel = 'Travel',
  Utilities = 'Utilities',
  Weather = 'Weather',
  Kids = 'Kids',
}

// ==========================================
// GOOGLE PLAY STORE CATEGORIES (Android)
// ==========================================

export enum PlayStoreCategory {
  // Games
  Games = 'Games',
  GamesAction = 'Games - Action',
  GamesAdventure = 'Games - Adventure',
  GamesArcade = 'Games - Arcade',
  GamesBoard = 'Games - Board',
  GamesCard = 'Games - Card',
  GamesCasino = 'Games - Casino',
  GamesCasual = 'Games - Casual',
  GamesEducational = 'Games - Educational',
  GamesMusic = 'Games - Music',
  GamesPuzzle = 'Games - Puzzle',
  GamesRacing = 'Games - Racing',
  GamesRolePlaying = 'Games - Role Playing',
  GamesSimulation = 'Games - Simulation',
  GamesSports = 'Games - Sports',
  GamesStrategy = 'Games - Strategy',
  GamesTrivia = 'Games - Trivia',
  GamesWord = 'Games - Word',

  // Apps
  ArtDesign = 'Art & Design',
  AutoVehicles = 'Auto & Vehicles',
  Beauty = 'Beauty',
  BooksReference = 'Books & Reference',
  Business = 'Business',
  Comics = 'Comics',
  Communication = 'Communication',
  Dating = 'Dating',
  Education = 'Education',
  Entertainment = 'Entertainment',
  Events = 'Events',
  Finance = 'Finance',
  FoodDrink = 'Food & Drink',
  HealthFitness = 'Health & Fitness',
  HouseHome = 'House & Home',
  Libraries = 'Libraries & Demo',
  Lifestyle = 'Lifestyle',
  MapsNavigation = 'Maps & Navigation',
  Medical = 'Medical',
  MusicAudio = 'Music & Audio',
  NewsReading = 'News & Magazines',
  Parenting = 'Parenting',
  Personalization = 'Personalization',
  Photography = 'Photography',
  Productivity = 'Productivity',
  Shopping = 'Shopping',
  Social = 'Social',
  Sports = 'Sports',
  Tools = 'Tools',
  TravelLocal = 'Travel & Local',
  VideoPlayers = 'Video Players & Editors',
  Weather = 'Weather',
}

// ==========================================
// ROBLOX CATEGORIES
// ==========================================

export enum RobloxCategory {
  // Main Categories
  All = 'All',
  Featured = 'Featured',
  Popular = 'Popular',
  TopRated = 'Top Rated',
  RecentlyUpdated = 'Recently Updated',

  // Genres
  Adventure = 'Adventure',
  BuildingCreation = 'Building & Creation',
  Comedy = 'Comedy',
  Fighting = 'Fighting',
  FPS = 'FPS',
  Horror = 'Horror',
  Medieval = 'Medieval',
  Military = 'Military',
  NavalPirate = 'Naval / Pirate',
  Obby = 'Obby',
  RPG = 'RPG',
  Racing = 'Racing',
  RealWorld = 'Real World',
  Roleplay = 'Roleplay',
  SciFi = 'Sci-Fi',
  Simulator = 'Simulator',
  Social = 'Social',
  Sports = 'Sports',
  Strategy = 'Strategy',
  Survival = 'Survival',
  TowerDefense = 'Tower Defense',
  Tycoon = 'Tycoon',
  Western = 'Western',
  Wild = 'Wild West',
}

// ==========================================
// STEAM CATEGORIES
// ==========================================

export enum SteamCategory {
  // Genres
  Action = 'Action',
  Adventure = 'Adventure',
  Casual = 'Casual',
  EarlyAccess = 'Early Access',
  FreeToPlay = 'Free to Play',
  Indie = 'Indie',
  MassivelyMultiplayer = 'Massively Multiplayer',
  Racing = 'Racing',
  RPG = 'RPG',
  Simulation = 'Simulation',
  Sports = 'Sports',
  Strategy = 'Strategy',

  // Sub-genres
  ActionAdventure = 'Action-Adventure',
  BulletHell = 'Bullet Hell',
  CardBattler = 'Card Battler',
  CityBuilder = 'City Builder',
  Deckbuilder = 'Deckbuilder',
  FightingMartialArts = 'Fighting & Martial Arts',
  HackAndSlash = 'Hack and Slash',
  HiddenObject = 'Hidden Object',
  JRPG = 'JRPG',
  Metroidvania = 'Metroidvania',
  Platformer = 'Platformer',
  PointAndClick = 'Point & Click',
  Puzzle = 'Puzzle',
  RealTimeStrategy = 'Real-Time Strategy',
  Roguelike = 'Roguelike',
  Sandbox = 'Sandbox',
  Shooter = 'Shooter',
  SurvivalCraft = 'Survival Craft',
  TacticalRPG = 'Tactical RPG',
  TowerDefense = 'Tower Defense',
  TurnBased = 'Turn-Based',
  VisualNovel = 'Visual Novel',
}

// ==========================================
// STORE LISTING INFO
// ==========================================

export interface StoreListingInfo {
  // App Store
  appStoreId?: string;
  appStoreUrl?: string;
  appStoreCategory?: AppStoreCategory;
  appStoreRating?: number;
  appStoreReviewCount?: number;
  appStorePosition?: number; // Ranking in category

  // Play Store
  playStoreId?: string;
  playStoreUrl?: string;
  playStoreCategory?: PlayStoreCategory;
  playStoreRating?: number;
  playStoreReviewCount?: number;
  playStoreDownloads?: string; // e.g., "10M+"
  playStorePosition?: number;

  // Roblox
  robloxId?: string;
  robloxUrl?: string;
  robloxCategory?: RobloxCategory;
  robloxRating?: number;
  robloxVisits?: number;
  robloxFavorites?: number;
  robloxConcurrentPlayers?: number;

  // Steam
  steamId?: string;
  steamUrl?: string;
  steamCategory?: SteamCategory;
  steamRating?: string; // e.g., "Overwhelmingly Positive"
  steamReviewCount?: number;
  steamPrice?: number;

  // Web
  webUrl?: string;
  chromeExtensionId?: string;
  chromeExtensionUsers?: number;
  chromeExtensionRating?: number;

  // Other Stores
  amazonAppStoreId?: string;
  snapStoreId?: string;
  microsoftStoreId?: string;
  macAppStoreId?: string;
}

// ==========================================
// CONTENT RATING
// ==========================================

export enum ContentRating {
  // ESRB (US)
  ESRB_Everyone = 'ESRB: Everyone',
  ESRB_Everyone10Plus = 'ESRB: Everyone 10+',
  ESRB_Teen = 'ESRB: Teen',
  ESRB_Mature = 'ESRB: Mature 17+',
  ESRB_AdultsOnly = 'ESRB: Adults Only 18+',
  ESRB_RatingPending = 'ESRB: Rating Pending',

  // PEGI (Europe)
  PEGI_3 = 'PEGI 3',
  PEGI_7 = 'PEGI 7',
  PEGI_12 = 'PEGI 12',
  PEGI_16 = 'PEGI 16',
  PEGI_18 = 'PEGI 18',

  // App Store / Play Store
  Ages4Plus = '4+',
  Ages9Plus = '9+',
  Ages12Plus = '12+',
  Ages17Plus = '17+',
}

// ==========================================
// CATEGORY METADATA
// ==========================================

export interface CategoryMetadata {
  id: string;
  name: string;
  icon: string;
  description: string;
  parentCategory?: string;
  subCategories?: string[];
  marketSize?: string; // e.g., "$50B"
  growthRate?: string; // e.g., "15% YoY"
  competitorCount?: number;
  topProducts?: string[];
  keyMetrics?: string[];
  trends?: string[];
}

// ==========================================
// CATEGORY HIERARCHY
// ==========================================

export const CATEGORY_HIERARCHY: Record<string, CategoryMetadata> = {
  // Top-Level Categories
  games: {
    id: 'games',
    name: 'Games',
    icon: '🎮',
    description: 'Video games across all platforms',
    subCategories: [
      'mobile-games',
      'pc-games',
      'console-games',
      'web-games',
      'roblox-games',
    ],
    marketSize: '$200B+',
    growthRate: '8% YoY',
  },
  productivity: {
    id: 'productivity',
    name: 'Productivity',
    icon: '⚡',
    description: 'Tools that help people work more efficiently',
    subCategories: [
      'project-management',
      'note-taking',
      'time-tracking',
      'automation',
      'collaboration',
    ],
    marketSize: '$90B',
    growthRate: '12% YoY',
  },
  'ai-tools': {
    id: 'ai-tools',
    name: 'AI Tools',
    icon: '🤖',
    description: 'AI-powered applications and services',
    subCategories: [
      'ai-assistants',
      'ai-generators',
      'ai-agents',
      'ai-developers',
    ],
    marketSize: '$50B',
    growthRate: '35% YoY',
  },
  education: {
    id: 'education',
    name: 'Education',
    icon: '📚',
    description: 'Learning and educational content',
    subCategories: [
      'online-courses',
      'certifications',
      'tutoring',
      'educational-apps',
    ],
    marketSize: '$300B',
    growthRate: '10% YoY',
  },
  family: {
    id: 'family',
    name: 'Family',
    icon: '👨‍👩‍👧‍👦',
    description: 'Apps for families and parents',
    subCategories: [
      'parental-controls',
      'family-organization',
      'kids-apps',
      'family-safety',
    ],
    marketSize: '$15B',
    growthRate: '18% YoY',
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    description: 'Financial tools and services',
    subCategories: ['banking', 'investing', 'budgeting', 'crypto', 'payments'],
    marketSize: '$150B',
    growthRate: '20% YoY',
  },
  'health-fitness': {
    id: 'health-fitness',
    name: 'Health & Fitness',
    icon: '🏃',
    description: 'Health, wellness, and fitness apps',
    subCategories: [
      'fitness-tracking',
      'nutrition',
      'mental-health',
      'meditation',
      'sleep',
    ],
    marketSize: '$75B',
    growthRate: '15% YoY',
  },
  social: {
    id: 'social',
    name: 'Social',
    icon: '💬',
    description: 'Social networking and communication',
    subCategories: ['messaging', 'social-networks', 'dating', 'community'],
    marketSize: '$100B',
    growthRate: '5% YoY',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    description: 'Entertainment and media apps',
    subCategories: ['streaming', 'music', 'video', 'podcasts'],
    marketSize: '$180B',
    growthRate: '8% YoY',
  },
  'developer-tools': {
    id: 'developer-tools',
    name: 'Developer Tools',
    icon: '🛠️',
    description: 'Tools for software developers',
    subCategories: ['ide', 'devops', 'testing', 'documentation', 'apis'],
    marketSize: '$40B',
    growthRate: '25% YoY',
  },

  // Sub-Categories: Games
  'mobile-games': {
    id: 'mobile-games',
    name: 'Mobile Games',
    icon: '📱',
    description: 'Games on iOS and Android',
    parentCategory: 'games',
    subCategories: ['hyper-casual', 'mid-core', 'hardcore'],
    marketSize: '$100B',
  },
  'roblox-games': {
    id: 'roblox-games',
    name: 'Roblox Games',
    icon: '🎲',
    description: 'Games on Roblox platform',
    parentCategory: 'games',
    subCategories: ['simulators', 'obbies', 'tycoons', 'rpg', 'roleplay'],
    marketSize: '$4B',
    growthRate: '25% YoY',
  },

  // Sub-Categories: AI
  'ai-assistants': {
    id: 'ai-assistants',
    name: 'AI Assistants',
    icon: '🧠',
    description: 'Conversational AI assistants',
    parentCategory: 'ai-tools',
    topProducts: ['ChatGPT', 'Claude', 'Gemini', 'Copilot'],
  },
  'ai-generators': {
    id: 'ai-generators',
    name: 'AI Generators',
    icon: '🎨',
    description: 'AI content generation tools',
    parentCategory: 'ai-tools',
    subCategories: ['image-gen', 'video-gen', 'audio-gen', 'text-gen'],
    topProducts: ['Midjourney', 'DALL-E', 'Suno', 'Runway'],
  },
  'ai-agents': {
    id: 'ai-agents',
    name: 'AI Agents',
    icon: '🤖',
    description: 'Autonomous AI agents',
    parentCategory: 'ai-tools',
    topProducts: ['Devin', 'Cursor', 'Replit Agent', 'GitHub Copilot'],
    growthRate: '100% YoY',
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getCategoryHierarchy(categoryId: string): CategoryMetadata[] {
  const result: CategoryMetadata[] = [];
  let current = CATEGORY_HIERARCHY[categoryId];

  while (current) {
    result.unshift(current);
    current = current.parentCategory
      ? CATEGORY_HIERARCHY[current.parentCategory]
      : undefined;
  }

  return result;
}

export function getCategoryBreadcrumb(categoryId: string): string {
  return getCategoryHierarchy(categoryId)
    .map((c) => c.name)
    .join(' > ');
}

export function getSubCategories(categoryId: string): CategoryMetadata[] {
  const category = CATEGORY_HIERARCHY[categoryId];
  if (!category?.subCategories) return [];
  return category.subCategories
    .map((id) => CATEGORY_HIERARCHY[id])
    .filter(Boolean);
}
