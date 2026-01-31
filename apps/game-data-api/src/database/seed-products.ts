import { JsonStorageService } from './json-storage.service';
import {
  CompanyDto,
  CompanyType,
  CompanySize,
  CompanyStage,
  CompanyRelationship,
} from '../shared/dtos/company.dto';
import {
  ProductDto,
  ProductCategory,
  ProductSubcategory,
  Platform,
  TargetAudience,
  MonetizationModel,
  ProductRelationship,
  ProductStatus,
} from '../shared/dtos/product.dto';
import { v4 as uuidv4 } from 'uuid';

const now = new Date();

/**
 * Seed sample companies and products for the Product Intelligence Platform
 */
export function seedProductDatabase(storage: JsonStorageService): void {
  console.log('🌱 Seeding Product Intelligence database...');

  // ==========================================
  // COMPANIES
  // ==========================================

  const companies: Partial<CompanyDto>[] = [
    // Online Training
    {
      id: uuidv4(),
      name: 'Coursera',
      slug: 'coursera',
      description:
        'Online learning platform partnering with universities and companies to offer courses, certificates, and degrees.',
      tagline: 'Learn without limits',
      companyType: CompanyType.EdTech,
      relationship: CompanyRelationship.Reference,
      size: CompanySize.Large,
      stage: CompanyStage.PubliclyTraded,
      foundedYear: 2012,
      contact: {
        website: 'https://coursera.org',
        linkedIn: 'https://linkedin.com/company/coursera',
        twitter: 'https://twitter.com/coursera',
        headquarters: 'Mountain View, CA',
        country: 'USA',
      },
      funding: {
        totalFunding: 464000000,
        isPublic: true,
        stockSymbol: 'COUR',
        employees: 1500,
        annualRevenue: 500000000,
      },
      metrics: {
        totalUsers: 136000000,
        monthlyActiveUsers: 20000000,
      },
      strengths: [
        'University partnerships',
        'Degree programs',
        'Enterprise sales',
      ],
      weaknesses: ['High course prices', 'Completion rates'],
      targetMarkets: [
        'Higher Education',
        'Professional Development',
        'Enterprise Training',
      ],
      threatLevel: 'High',
      tags: ['edtech', 'online-learning', 'mooc', 'certificates'],
    },
    {
      id: uuidv4(),
      name: 'Udemy',
      slug: 'udemy',
      description:
        'Marketplace for online learning with 200,000+ courses taught by expert instructors.',
      tagline: 'Learn anything, on your schedule',
      companyType: CompanyType.EdTech,
      relationship: CompanyRelationship.Competitor,
      size: CompanySize.Large,
      stage: CompanyStage.PubliclyTraded,
      foundedYear: 2010,
      contact: {
        website: 'https://udemy.com',
        headquarters: 'San Francisco, CA',
        country: 'USA',
      },
      funding: {
        totalFunding: 300000000,
        isPublic: true,
        stockSymbol: 'UDMY',
        employees: 1000,
        annualRevenue: 600000000,
      },
      metrics: {
        totalUsers: 67000000,
        monthlyActiveUsers: 15000000,
      },
      strengths: ['Marketplace model', 'Price flexibility', 'Course variety'],
      weaknesses: ['Quality inconsistency', 'No accreditation'],
      threatLevel: 'High',
      tags: ['edtech', 'marketplace', 'online-courses'],
    },
    // AI Companies
    {
      id: uuidv4(),
      name: 'Anthropic',
      slug: 'anthropic',
      description:
        'AI safety company building reliable, interpretable AI systems.',
      tagline: 'AI research company focused on safety',
      companyType: CompanyType.AICompany,
      relationship: CompanyRelationship.Reference,
      size: CompanySize.Medium,
      stage: CompanyStage.SeriesC,
      foundedYear: 2021,
      contact: {
        website: 'https://anthropic.com',
        headquarters: 'San Francisco, CA',
        country: 'USA',
      },
      funding: {
        totalFunding: 7300000000,
        lastRoundAmount: 4000000000,
        isPublic: false,
        employees: 500,
        valuation: 18000000000,
      },
      strengths: ['Safety focus', 'Constitutional AI', 'Enterprise adoption'],
      targetMarkets: ['Enterprise AI', 'Developer Tools', 'Consumer AI'],
      threatLevel: 'Low',
      tags: ['ai', 'llm', 'safety', 'claude'],
    },
    {
      id: uuidv4(),
      name: 'OpenAI',
      slug: 'openai',
      description:
        'AI research and deployment company with mission to ensure AGI benefits humanity.',
      tagline: 'Creating safe AGI',
      companyType: CompanyType.AICompany,
      relationship: CompanyRelationship.Reference,
      size: CompanySize.Medium,
      stage: CompanyStage.SeriesC,
      foundedYear: 2015,
      contact: {
        website: 'https://openai.com',
        headquarters: 'San Francisco, CA',
        country: 'USA',
      },
      funding: {
        totalFunding: 11300000000,
        isPublic: false,
        employees: 800,
        valuation: 86000000000,
        annualRevenue: 2000000000,
      },
      metrics: {
        totalUsers: 200000000,
        monthlyActiveUsers: 100000000,
      },
      strengths: ['Market leader', 'GPT models', 'Microsoft partnership'],
      weaknesses: ['Safety concerns', 'Competition increasing'],
      threatLevel: 'Low',
      tags: ['ai', 'llm', 'chatgpt', 'gpt'],
    },
    // Productivity
    {
      id: uuidv4(),
      name: 'Notion',
      slug: 'notion',
      description:
        'All-in-one workspace for notes, docs, wikis, and project management.',
      tagline: 'One tool for your whole team',
      companyType: CompanyType.Productivity,
      relationship: CompanyRelationship.Competitor,
      size: CompanySize.Medium,
      stage: CompanyStage.SeriesC,
      foundedYear: 2013,
      contact: {
        website: 'https://notion.so',
        headquarters: 'San Francisco, CA',
        country: 'USA',
      },
      funding: {
        totalFunding: 343000000,
        isPublic: false,
        employees: 500,
        valuation: 10000000000,
      },
      metrics: {
        totalUsers: 30000000,
        monthlyActiveUsers: 10000000,
      },
      strengths: ['Flexibility', 'Template ecosystem', 'AI integration'],
      weaknesses: ['Learning curve', 'Mobile experience'],
      threatLevel: 'Medium',
      tags: ['productivity', 'notes', 'wiki', 'project-management'],
    },
    {
      id: uuidv4(),
      name: 'Obsidian',
      slug: 'obsidian',
      description:
        'Knowledge base that works on local Markdown files with powerful linking.',
      tagline: 'A second brain, for you, forever',
      companyType: CompanyType.Productivity,
      relationship: CompanyRelationship.Complementary,
      size: CompanySize.Small,
      stage: CompanyStage.Bootstrapped,
      foundedYear: 2020,
      contact: {
        website: 'https://obsidian.md',
        country: 'Canada',
      },
      funding: {
        totalFunding: 0,
        isPublic: false,
        employees: 20,
      },
      metrics: {
        totalUsers: 1000000,
      },
      strengths: ['Local-first', 'Plugin ecosystem', 'Privacy'],
      weaknesses: ['No real-time collab', 'Developer-focused'],
      threatLevel: 'Low',
      tags: ['productivity', 'notes', 'markdown', 'pkm'],
    },
    // Family Tech
    {
      id: uuidv4(),
      name: 'Life360',
      slug: 'life360',
      description:
        'Family safety and location sharing platform with 50M active families.',
      tagline: 'Everyday family safety',
      companyType: CompanyType.FamilyTech,
      relationship: CompanyRelationship.Competitor,
      size: CompanySize.Medium,
      stage: CompanyStage.PubliclyTraded,
      foundedYear: 2008,
      contact: {
        website: 'https://life360.com',
        headquarters: 'San Francisco, CA',
        country: 'USA',
      },
      funding: {
        totalFunding: 160000000,
        isPublic: true,
        stockSymbol: 'LIF',
        employees: 500,
        annualRevenue: 300000000,
      },
      metrics: {
        totalUsers: 50000000,
        monthlyActiveUsers: 35000000,
      },
      strengths: ['Market leader', 'Location accuracy', 'Teen safety'],
      weaknesses: ['Privacy concerns', 'Battery drain'],
      threatLevel: 'High',
      tags: ['family', 'location', 'safety', 'mobile'],
    },
    {
      id: uuidv4(),
      name: 'Cozi',
      slug: 'cozi',
      description:
        'Family organizer app for shared calendars, lists, and meal planning.',
      tagline: 'The #1 organizing app for families',
      companyType: CompanyType.FamilyTech,
      relationship: CompanyRelationship.Reference,
      size: CompanySize.Small,
      stage: CompanyStage.Acquired,
      foundedYear: 2005,
      contact: {
        website: 'https://cozi.com',
        country: 'USA',
      },
      funding: {
        totalFunding: 25000000,
        isPublic: false,
        employees: 50,
      },
      metrics: {
        totalUsers: 25000000,
      },
      strengths: ['Simple UX', 'Shared calendars', 'Recipe integration'],
      weaknesses: ['Dated design', 'Limited features'],
      threatLevel: 'Low',
      tags: ['family', 'calendar', 'organization'],
    },
  ];

  // ==========================================
  // PRODUCTS
  // ==========================================

  const products: Partial<ProductDto>[] = [
    // AI Products
    {
      id: uuidv4(),
      name: 'Claude',
      slug: 'claude',
      tagline: 'AI assistant by Anthropic',
      description:
        'Constitutional AI assistant focused on being helpful, harmless, and honest.',
      category: ProductCategory.AIAssistant,
      subcategory: ProductSubcategory.Chatbot,
      platforms: [Platform.Web, Platform.API],
      targetAudiences: [
        TargetAudience.Developers,
        TargetAudience.Adults,
        TargetAudience.Enterprise,
      ],
      relationship: ProductRelationship.Reference,
      status: ProductStatus.Growing,
      monetizationModel: MonetizationModel.Freemium,
      hasFreeTier: true,
      startingPrice: 20,
      featureFlags: {
        hasUserAccounts: true,
        hasAPI: true,
        hasAIGeneration: true,
        hasAIAssistant: true,
        hasNaturalLanguage: true,
        hasFreeTier: true,
        hasSubscription: true,
      } as any,
      metrics: {
        totalUsers: 10000000,
        monthlyActiveUsers: 5000000,
        averageRating: 4.8,
      } as any,
      strengths: ['Safety', 'Long context', 'Coding ability'],
      uniqueSellingPoints: [
        '200K context window',
        'Constitutional AI',
        'Artifacts feature',
      ],
      priorityScore: 95,
      recommendedForStudy: true,
      tags: ['ai', 'chatbot', 'llm', 'productivity'],
    },
    {
      id: uuidv4(),
      name: 'ChatGPT',
      slug: 'chatgpt',
      tagline: 'Conversational AI by OpenAI',
      description:
        'AI chatbot powered by GPT models for conversation, writing, and coding.',
      category: ProductCategory.AIAssistant,
      subcategory: ProductSubcategory.Chatbot,
      platforms: [Platform.Web, Platform.iOS, Platform.Android, Platform.API],
      targetAudiences: [TargetAudience.General, TargetAudience.Developers],
      relationship: ProductRelationship.Competitor,
      status: ProductStatus.Mature,
      monetizationModel: MonetizationModel.Freemium,
      hasFreeTier: true,
      startingPrice: 20,
      featureFlags: {
        hasUserAccounts: true,
        hasAPI: true,
        hasMobileApp: true,
        hasAIGeneration: true,
        hasAIAssistant: true,
        hasNaturalLanguage: true,
        hasFreeTier: true,
        hasSubscription: true,
      } as any,
      metrics: {
        totalUsers: 200000000,
        monthlyActiveUsers: 100000000,
        averageRating: 4.6,
      } as any,
      strengths: ['Market leader', 'GPT-4', 'Plugin ecosystem'],
      weaknesses: ['Rate limits', 'Hallucinations'],
      priorityScore: 90,
      recommendedForStudy: true,
      tags: ['ai', 'chatbot', 'llm'],
    },
    // Online Courses
    {
      id: uuidv4(),
      name: 'Google Data Analytics Certificate',
      slug: 'google-data-analytics',
      tagline: 'Launch your career in data analytics',
      description:
        'Professional certificate program by Google covering data analysis, visualization, and SQL.',
      category: ProductCategory.Certification,
      subcategory: ProductSubcategory.DataScience,
      platforms: [Platform.Web],
      targetAudiences: [TargetAudience.Adults, TargetAudience.Students],
      relationship: ProductRelationship.Reference,
      status: ProductStatus.Mature,
      monetizationModel: MonetizationModel.Subscription,
      hasFreeTier: false,
      freeTrialDays: 7,
      startingPrice: 39,
      featureFlags: {
        hasUserAccounts: true,
        hasProgress: true,
        hasAchievements: true,
        hasContentCreation: false,
      } as any,
      metrics: {
        totalUsers: 2000000,
        averageRating: 4.8,
        reviewCount: 150000,
      } as any,
      strengths: ['Google brand', 'Job-ready skills', 'Capstone project'],
      priorityScore: 85,
      recommendedForStudy: true,
      tags: ['course', 'data-analytics', 'google', 'certificate'],
    },
    // Productivity Apps
    {
      id: uuidv4(),
      name: 'Notion',
      slug: 'notion-app',
      tagline: 'Your connected workspace',
      description:
        'All-in-one workspace combining notes, docs, wikis, and databases.',
      category: ProductCategory.SaaSApp,
      subcategory: ProductSubcategory.NotesTaking,
      platforms: [
        Platform.Web,
        Platform.iOS,
        Platform.Android,
        Platform.Windows,
        Platform.macOS,
      ],
      targetAudiences: [
        TargetAudience.Adults,
        TargetAudience.Startups,
        TargetAudience.Enterprise,
      ],
      relationship: ProductRelationship.Competitor,
      status: ProductStatus.Mature,
      monetizationModel: MonetizationModel.Freemium,
      hasFreeTier: true,
      startingPrice: 10,
      featureFlags: {
        hasUserAccounts: true,
        hasTeams: true,
        hasRealTimeCollab: true,
        hasTemplates: true,
        hasAPI: true,
        hasAIGeneration: true,
        hasMobileApp: true,
        hasFreeTier: true,
        hasSubscription: true,
      } as any,
      metrics: {
        totalUsers: 30000000,
        monthlyActiveUsers: 10000000,
        averageRating: 4.7,
      } as any,
      strengths: ['Flexibility', 'Database blocks', 'Template gallery'],
      weaknesses: ['Learning curve', 'Offline support'],
      priorityScore: 88,
      recommendedForStudy: true,
      tags: ['productivity', 'notes', 'database', 'wiki'],
    },
    // Family Apps
    {
      id: uuidv4(),
      name: 'Life360',
      slug: 'life360-app',
      tagline: 'Keep your family safe',
      description:
        'Family locator and safety app with location sharing, crash detection, and driving insights.',
      category: ProductCategory.FamilyApp,
      subcategory: ProductSubcategory.LocationSharing,
      platforms: [Platform.iOS, Platform.Android],
      targetAudiences: [TargetAudience.Parents, TargetAudience.Families],
      relationship: ProductRelationship.Competitor,
      status: ProductStatus.Mature,
      monetizationModel: MonetizationModel.Freemium,
      hasFreeTier: true,
      startingPrice: 8,
      featureFlags: {
        hasUserAccounts: true,
        hasMobileApp: true,
        hasPushNotifications: true,
        hasFreeTier: true,
        hasSubscription: true,
      } as any,
      metrics: {
        totalUsers: 50000000,
        monthlyActiveUsers: 35000000,
        averageRating: 4.5,
      } as any,
      strengths: ['Real-time location', 'Crash detection', 'Place alerts'],
      weaknesses: ['Battery usage', 'Privacy concerns'],
      priorityScore: 82,
      recommendedForStudy: true,
      tags: ['family', 'location', 'safety', 'parenting'],
    },
    {
      id: uuidv4(),
      name: 'OurHome',
      slug: 'ourhome',
      tagline: 'Family chores made easy',
      description:
        'Chore and reward system for families with task assignments and point tracking.',
      category: ProductCategory.FamilyApp,
      subcategory: ProductSubcategory.ChoreManagement,
      platforms: [Platform.iOS, Platform.Android, Platform.Web],
      targetAudiences: [
        TargetAudience.Parents,
        TargetAudience.Families,
        TargetAudience.Children,
      ],
      relationship: ProductRelationship.Reference,
      status: ProductStatus.Growing,
      monetizationModel: MonetizationModel.Freemium,
      hasFreeTier: true,
      startingPrice: 5,
      featureFlags: {
        hasUserAccounts: true,
        hasMobileApp: true,
        hasRewards: true,
        hasProgress: true,
        hasPushNotifications: true,
        hasFreeTier: true,
      } as any,
      metrics: {
        totalUsers: 2000000,
        averageRating: 4.6,
      } as any,
      strengths: ['Gamification', 'Kid-friendly', 'Reward system'],
      uniqueSellingPoints: ['Point-based rewards', 'Family banking'],
      priorityScore: 75,
      recommendedForStudy: true,
      tags: ['family', 'chores', 'kids', 'rewards', 'gamification'],
    },
    // Games
    {
      id: uuidv4(),
      name: 'Pet Simulator X',
      slug: 'pet-simulator-x',
      tagline: 'Collect and hatch epic pets!',
      description:
        'Roblox game where players collect coins, hatch eggs, and collect pets with trading.',
      category: ProductCategory.Game,
      subcategory: ProductSubcategory.Simulation,
      platforms: [Platform.Roblox],
      targetAudiences: [TargetAudience.Children, TargetAudience.Teens],
      relationship: ProductRelationship.Inspiration,
      status: ProductStatus.Mature,
      monetizationModel: MonetizationModel.InAppPurchases,
      hasFreeTier: true,
      featureFlags: {
        hasMultiplayer: true,
        hasLeaderboards: true,
        hasAchievements: true,
        hasRewards: true,
        hasProgress: true,
        hasMicroTransactions: true,
      } as any,
      metrics: {
        totalUsers: 100000000,
        monthlyActiveUsers: 20000000,
        averageRating: 4.8,
      } as any,
      strengths: ['Pet collection', 'Egg hatching', 'Trading system'],
      uniqueSellingPoints: [
        'Huge variety of pets',
        'Regular updates',
        'Events',
      ],
      priorityScore: 95,
      recommendedForStudy: true,
      tags: ['roblox', 'game', 'pets', 'simulator', 'collection'],
    },
  ];

  // Save to database
  for (const company of companies) {
    const fullCompany: CompanyDto = {
      id: company.id!,
      creationTime: now,
      lastModificationTime: now,
      creatorId: 'seed',
      lastModifierId: 'seed',
      name: company.name!,
      slug: company.slug!,
      description: company.description!,
      tagline: company.tagline,
      logoUrl: company.logoUrl,
      companyType: company.companyType!,
      relationship: company.relationship!,
      size: company.size!,
      stage: company.stage!,
      foundedYear: company.foundedYear,
      contact: company.contact || { website: '' },
      funding: company.funding || { totalFunding: 0, isPublic: false },
      metrics: company.metrics || {},
      productIds: [],
      strengths: company.strengths || [],
      weaknesses: company.weaknesses || [],
      opportunities: [],
      threats: [],
      targetMarkets: company.targetMarkets || [],
      primaryAudience: '',
      competitorIds: [],
      strategicNotes: '',
      threatLevel: company.threatLevel || 'Low',
      partnershipPotential: 5,
      acquisitionTarget: false,
      tags: company.tags || [],
    };
    storage.create('companies', fullCompany);
  }

  for (const product of products) {
    const fullProduct: ProductDto = {
      id: product.id!,
      creationTime: now,
      lastModificationTime: now,
      creatorId: 'seed',
      lastModifierId: 'seed',
      name: product.name!,
      slug: product.slug!,
      tagline: product.tagline || '',
      description: product.description!,
      screenshotUrls: [],
      category: product.category!,
      subcategory: product.subcategory || ProductSubcategory.Other,
      platforms: product.platforms || [],
      targetAudiences: product.targetAudiences || [],
      relationship: product.relationship!,
      status: product.status || ProductStatus.Launched,
      featureFlags: (product.featureFlags as any) || {},
      features: [],
      monetizationModel: product.monetizationModel || MonetizationModel.Free,
      pricingTiers: [],
      hasFreeTier: product.hasFreeTier ?? true,
      freeTrialDays: product.freeTrialDays,
      startingPrice: product.startingPrice,
      metrics: (product.metrics as any) || {},
      strengths: product.strengths || [],
      weaknesses: product.weaknesses || [],
      uniqueSellingPoints: product.uniqueSellingPoints || [],
      lessonsLearned: [],
      competitorIds: [],
      marketPosition: 'Niche',
      differentiators: [],
      threatLevel: 'Low',
      priorityScore: product.priorityScore || 50,
      recommendedForStudy: product.recommendedForStudy ?? false,
      replicationDifficulty: 'Medium',
      strategicNotes: '',
      technicalNotes: '',
      tags: product.tags || [],
    };
    storage.create('products', fullProduct);
  }

  console.log(
    `✅ Seeded ${companies.length} companies and ${products.length} products`,
  );
}

// Run if called directly
if (require.main === module) {
  const storage = new JsonStorageService();
  seedProductDatabase(storage);
}
