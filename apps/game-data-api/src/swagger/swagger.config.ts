import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Game Data API',
      version: '1.0.0',
      description:
        'API for managing game data intelligence - track games, competitors, features, and success metrics',
      contact: {
        name: 'Game Manager',
      },
    },
    servers: [
      {
        url: 'http://localhost:3333/api',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Games',
        description: 'Game CRUD operations',
      },
      {
        name: 'Features',
        description: 'Game features management',
      },
      {
        name: 'Metrics',
        description: 'Success metrics tracking',
      },
      {
        name: 'Health',
        description: 'API health status',
      },
    ],
    components: {
      schemas: {
        Game: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            developer: { type: 'string' },
            genre: {
              type: 'string',
              enum: [
                'Action',
                'Adventure',
                'RPG',
                'Strategy',
                'Simulation',
                'Shooter',
                'Racing',
                'Sports',
                'Horror',
                'Puzzle',
                'Platformer',
                'MMO',
                'Survival',
                'OpenWorld',
                'BattleRoyale',
                'Other',
              ],
            },
            releaseDate: { type: 'string', format: 'date-time' },
            platform: {
              type: 'string',
              enum: [
                'Roblox',
                'Mobile',
                'PC',
                'Console',
                'Web',
                'CrossPlatform',
              ],
            },
            ageGroup: { type: 'string' },
            ownership: {
              type: 'string',
              enum: ['Our Game', 'Competitor', 'Reference'],
            },
            description: { type: 'string' },
            thumbnailUrl: { type: 'string' },
            gameUrl: { type: 'string' },
            featureFlags: { $ref: '#/components/schemas/FeatureFlags' },
            monetizationModel: { type: 'string' },
            pricePoint: { type: 'number' },
            successMetrics: { $ref: '#/components/schemas/SuccessMetric' },
            features: {
              type: 'array',
              items: { $ref: '#/components/schemas/Feature' },
            },
            priorityScore: { type: 'number' },
            recommendedForReplication: { type: 'boolean' },
            tags: { type: 'array', items: { type: 'string' } },
            creationTime: { type: 'string', format: 'date-time' },
            lastModificationTime: { type: 'string', format: 'date-time' },
          },
        },
        FeatureFlags: {
          type: 'object',
          properties: {
            hasCollectionSystem: { type: 'boolean' },
            hasTradingSystem: { type: 'boolean' },
            hasProgressionSystem: { type: 'boolean' },
            hasCraftingSystem: { type: 'boolean' },
            hasBuildingSystem: { type: 'boolean' },
            hasMultiplayer: { type: 'boolean' },
            hasGuilds: { type: 'boolean' },
            hasChat: { type: 'boolean' },
            hasFriendSystem: { type: 'boolean' },
            hasLeaderboards: { type: 'boolean' },
            hasInAppPurchases: { type: 'boolean' },
            hasGachaSystem: { type: 'boolean' },
            hasSeasonPass: { type: 'boolean' },
            hasAds: { type: 'boolean' },
            hasVIPSystem: { type: 'boolean' },
          },
        },
        SuccessMetric: {
          type: 'object',
          properties: {
            totalPlays: { type: 'number' },
            concurrentPlayers: { type: 'number' },
            peakConcurrentPlayers: { type: 'number' },
            averageSessionLength: { type: 'number' },
            retentionRateDay1: { type: 'number' },
            retentionRateDay7: { type: 'number' },
            retentionRateDay30: { type: 'number' },
            revenueTotal: { type: 'number' },
            revenueMonthly: { type: 'number' },
            conversionRate: { type: 'number' },
            averageRevenuePerUser: { type: 'number' },
          },
        },
        Feature: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            gameId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            importance: {
              type: 'string',
              enum: ['Critical', 'High', 'Medium', 'Low'],
            },
            implementationComplexity: {
              type: 'string',
              enum: ['Easy', 'Medium', 'Hard', 'Expert'],
            },
            userEngagementImpact: { type: 'number', minimum: 1, maximum: 10 },
            monetizationPotential: { type: 'number', minimum: 1, maximum: 10 },
            technicalNotes: { type: 'string' },
          },
        },
        CreateGame: {
          type: 'object',
          required: ['name', 'developer', 'genre', 'platform', 'description'],
          properties: {
            name: { type: 'string' },
            developer: { type: 'string' },
            genre: { type: 'string' },
            releaseDate: { type: 'string', format: 'date-time' },
            platform: { type: 'string' },
            ageGroup: { type: 'string' },
            ownership: { type: 'string' },
            description: { type: 'string' },
            thumbnailUrl: { type: 'string' },
            gameUrl: { type: 'string' },
            featureFlags: { $ref: '#/components/schemas/FeatureFlags' },
            monetizationModel: { type: 'string' },
            pricePoint: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
        UpdateGame: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            developer: { type: 'string' },
            genre: { type: 'string' },
            releaseDate: { type: 'string', format: 'date-time' },
            platform: { type: 'string' },
            ageGroup: { type: 'string' },
            ownership: { type: 'string' },
            description: { type: 'string' },
            thumbnailUrl: { type: 'string' },
            gameUrl: { type: 'string' },
            featureFlags: { $ref: '#/components/schemas/FeatureFlags' },
            monetizationModel: { type: 'string' },
            pricePoint: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
            priorityScore: { type: 'number' },
            recommendedForReplication: { type: 'boolean' },
          },
        },
        PagedResult: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/Game' },
            },
            totalCount: { type: 'number' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: [
    './apps/game-data-api/src/routes/*.ts',
    './apps/game-data-api/src/main.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
