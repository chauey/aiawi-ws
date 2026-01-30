import { JsonStorageService } from './json-storage.service';
import { GameRepository } from '../repositories/game.repository';
import {
  GameGenre,
  MonetizationModel,
  Platform,
  AgeGroup,
  GameOwnership,
} from '../shared/dtos/game.dto';

export function seedDatabase() {
  const storage = new JsonStorageService();
  const repository = new GameRepository(storage);

  console.log('🌱 Seeding database with top successful games...');

  // 1. Adopt Me! (Roblox)
  const adoptMe = repository.create({
    name: 'Adopt Me!',
    developer: 'Uplift Games',
    genre: GameGenre.Simulation,
    releaseDate: new Date('2017-07-14'),
    platform: Platform.Roblox,
    ageGroup: AgeGroup.ElementaryAge,
    ownership: GameOwnership.Competitor,
    description:
      'Virtual pet adoption and nurturing game with trading, mini-games, and social features. One of the most successful games on Roblox.',
    monetizationModel: MonetizationModel.Freemium,
    tags: ['pets', 'trading', 'social', 'collection', 'family-friendly'],
    featureFlags: {
      hasCollectionSystem: true,
      hasTradingSystem: true,
      hasProgressionSystem: true,
      hasBuildingSystem: false,
      hasCraftingSystem: false,
      hasMultiplayer: true,
      hasGuilds: false,
      hasChat: true,
      hasFriendSystem: true,
      hasLeaderboards: false,
      hasInAppPurchases: true,
      hasGachaSystem: true, // Egg hatching
      hasSeasonPass: false,
      hasAds: false,
      hasVIPSystem: false,
      hasLevelSystem: false,
      hasSkillTree: false,
      hasAchievements: false,
      hasQuests: false,
      hasDailies: false,
      hasProcGeneratedContent: false,
      hasStoryMode: false,
      hasPvP: false,
      hasPvE: true,
      hasRaids: false,
      hasCharacterCustomization: true,
      hasHousingCustomization: true,
      hasSkinSystem: false,
      hasEmotes: false,
      hasVirtualCurrency: true,
      hasMarketplace: false,
      hasAuctions: false,
      hasCrossPlatform: false,
      hasCloudSaves: false,
      hasOfflineProgress: false,
    },
  });

  repository.updateSuccessMetrics(adoptMe.id, {
    totalPlays: 38000000000,
    concurrentPlayers: 500000,
    peakConcurrentPlayers: 1600000,
    averageSessionLength: 45,
    retentionRateDay1: 75,
    retentionRateDay7: 60,
    retentionRateDay30: 45,
    revenueTotal: 50000000,
    revenueMonthly: 3000000,
    conversionRate: 12,
    averageRevenuePerUser: 5.2,
  });

  repository.addFeature(adoptMe.id, {
    name: 'Pet Collection System',
    description: 'Extensive pet collection with different rarities and types',
    category: 'Core Gameplay',
    importance: 'Critical',
    implementationComplexity: 'Medium',
    userEngagementImpact: 10,
    monetizationPotential: 10,
    technicalNotes:
      'Use rarity tiers (Common, Uncommon, Rare, Ultra-Rare, Legendary). Implement egg hatching mechanics with probabilities.',
    codeSnippets: '',
    creatorId: undefined,
    lastModifierId: undefined,
  });

  repository.addFeature(adoptMe.id, {
    name: 'Trading System',
    description: 'Player-to-player trading with security measures',
    category: 'Social',
    importance: 'Critical',
    implementationComplexity: 'Hard',
    userEngagementImpact: 9,
    monetizationPotential: 8,
    technicalNotes:
      'Implement trade windows, confirmation dialogs, trade history, and scam prevention.',
    codeSnippets: '',
    creatorId: undefined,
    lastModifierId: undefined,
  });

  repository.addFeature(adoptMe.id, {
    name: 'Housing System',
    description: 'Customizable houses and furniture',
    category: 'Customization',
    importance: 'High',
    implementationComplexity: 'Medium',
    userEngagementImpact: 8,
    monetizationPotential: 9,
    technicalNotes:
      'Furniture placement system with snap-to-grid and rotation.',
    codeSnippets: '',
    creatorId: undefined,
    lastModifierId: undefined,
  });

  // 2. Blox Fruits (Roblox)
  const bloxFruits = repository.create({
    name: 'Blox Fruits',
    developer: 'Gamer Robot Inc.',
    genre: GameGenre.RPG,
    releaseDate: new Date('2019-01-10'),
    platform: Platform.Roblox,
    ageGroup: AgeGroup.Teen,
    ownership: GameOwnership.Competitor,
    description:
      'One Piece-inspired RPG with devil fruit powers, grinding mechanics, PvP combat, and progression systems.',
    monetizationModel: MonetizationModel.Freemium,
    tags: ['anime', 'grinding', 'pvp', 'progression', 'combat'],
    featureFlags: {
      hasCollectionSystem: true, // Devil Fruits
      hasTradingSystem: true,
      hasProgressionSystem: true,
      hasBuildingSystem: false,
      hasCraftingSystem: false,
      hasMultiplayer: true,
      hasGuilds: false,
      hasChat: true,
      hasFriendSystem: false,
      hasLeaderboards: true,
      hasInAppPurchases: true,
      hasGachaSystem: true, // Fruit spawns
      hasSeasonPass: false,
      hasAds: false,
      hasVIPSystem: false,
      hasLevelSystem: true,
      hasSkillTree: true,
      hasAchievements: false,
      hasQuests: true,
      hasDailies: false,
      hasProcGeneratedContent: false,
      hasStoryMode: false,
      hasPvP: true,
      hasPvE: true,
      hasRaids: true,
      hasCharacterCustomization: false,
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
  });

  repository.updateSuccessMetrics(bloxFruits.id, {
    totalPlays: 45000000000,
    concurrentPlayers: 600000,
    peakConcurrentPlayers: 800000,
    averageSessionLength: 90,
    retentionRateDay1: 70,
    retentionRateDay7: 55,
    retentionRateDay30: 40,
    revenueTotal: 40000000,
    revenueMonthly: 2500000,
    conversionRate: 15,
    averageRevenuePerUser: 4.8,
  });

  repository.addFeature(bloxFruits.id, {
    name: 'Devil Fruit System',
    description: 'Collectible powers with unique abilities',
    category: 'Core Gameplay',
    importance: 'Critical',
    implementationComplexity: 'Expert',
    userEngagementImpact: 10,
    monetizationPotential: 9,
    technicalNotes:
      'Each fruit has unique move sets. Implement spawn mechanics and fruit trading.',
    codeSnippets: '',
    creatorId: undefined,
    lastModifierId: undefined,
  });

  // 3. Dragon Legends (Our Game - In Development)
  // NOTE: Dragon Legends is defined in add-our-games.ts with full features
  // Run: npx tsx apps/game-data-api/src/scripts/add-our-games.ts

  console.log('✅ Database seeded with top successful games!');
  console.log(`📊 Total games: ${repository.getList({}).totalCount}`);
  console.log(`📁 Data saved to JSON file`);

  storage.saveDatabase();
}

// Run if executed directly
if (require.main === module) {
  seedDatabase();
}
