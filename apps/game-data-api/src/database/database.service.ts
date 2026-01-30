import Database from 'better-sqlite3';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseService {
  private db: Database.Database;

  constructor(dbPath: string = path.join(__dirname, '../../data/gamedata.db')) {
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize(): void {
    // Games table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        developer TEXT NOT NULL,
        genre TEXT NOT NULL,
        releaseDate TEXT NOT NULL,
        platform TEXT NOT NULL,
        description TEXT,
        thumbnailUrl TEXT,
        gameUrl TEXT,
        monetizationModel TEXT NOT NULL,
        pricePoint REAL,
        priorityScore INTEGER DEFAULT 50,
        recommendedForReplication INTEGER DEFAULT 0,
        tags TEXT,
        strengths TEXT,
        weaknesses TEXT,
        uniqueSellingPoints TEXT,
        lessonsLearned TEXT,
        creationTime TEXT NOT NULL,
        creatorId TEXT,
        lastModificationTime TEXT,
        lastModifierId TEXT
      );
    `);

    // Success Metrics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS success_metrics (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        totalPlays INTEGER DEFAULT 0,
        concurrentPlayers INTEGER DEFAULT 0,
        peakConcurrentPlayers INTEGER DEFAULT 0,
        averageSessionLength REAL DEFAULT 0,
        retentionRateDay1 REAL DEFAULT 0,
        retentionRateDay7 REAL DEFAULT 0,
        retentionRateDay30 REAL DEFAULT 0,
        revenueTotal REAL DEFAULT 0,
        revenueMonthly REAL DEFAULT 0,
        conversionRate REAL DEFAULT 0,
        averageRevenuePerUser REAL DEFAULT 0,
        creationTime TEXT NOT NULL,
        lastModificationTime TEXT,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      );
    `);

    // Features table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_features (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        importance TEXT NOT NULL,
        implementationComplexity TEXT NOT NULL,
        userEngagementImpact INTEGER DEFAULT 5,
        monetizationPotential INTEGER DEFAULT 5,
        technicalNotes TEXT,
        codeSnippets TEXT,
        creationTime TEXT NOT NULL,
        creatorId TEXT,
        lastModificationTime TEXT,
        lastModifierId TEXT,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      );
    `);

    // Systems table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_systems (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        systemType TEXT NOT NULL,
        algorithmDescription TEXT,
        pseudocode TEXT,
        performance TEXT DEFAULT 'Average',
        scalability TEXT DEFAULT 'Medium',
        dependencies TEXT,
        creationTime TEXT NOT NULL,
        creatorId TEXT,
        lastModificationTime TEXT,
        lastModifierId TEXT,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      );
    `);

    // Rewards table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reward_structures (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        name TEXT NOT NULL,
        rewardType TEXT NOT NULL,
        triggerCondition TEXT,
        value REAL DEFAULT 0,
        rarity TEXT DEFAULT 'Common',
        playerEngagement INTEGER DEFAULT 5,
        balanceNotes TEXT,
        creationTime TEXT NOT NULL,
        creatorId TEXT,
        lastModificationTime TEXT,
        lastModifierId TEXT,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      );
    `);

    // Mechanics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_mechanics (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        mechanicType TEXT NOT NULL,
        funFactor INTEGER DEFAULT 5,
        retentionImpact INTEGER DEFAULT 5,
        implementationGuide TEXT,
        videoReferenceUrl TEXT,
        creationTime TEXT NOT NULL,
        creatorId TEXT,
        lastModificationTime TEXT,
        lastModifierId TEXT,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      );
    `);

    // Success Factors table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS success_factors (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        factor TEXT NOT NULL,
        impact TEXT NOT NULL,
        description TEXT,
        evidenceSource TEXT,
        replicability INTEGER DEFAULT 5,
        creationTime TEXT NOT NULL,
        creatorId TEXT,
        lastModificationTime TEXT,
        lastModifierId TEXT,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      );
    `);

    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre);
      CREATE INDEX IF NOT EXISTS idx_games_monetization ON games(monetizationModel);
      CREATE INDEX IF NOT EXISTS idx_games_priority ON games(priorityScore);
      CREATE INDEX IF NOT EXISTS idx_features_game ON game_features(gameId);
      CREATE INDEX IF NOT EXISTS idx_systems_game ON game_systems(gameId);
      CREATE INDEX IF NOT EXISTS idx_rewards_game ON reward_structures(gameId);
      CREATE INDEX IF NOT EXISTS idx_mechanics_game ON game_mechanics(gameId);
      CREATE INDEX IF NOT EXISTS idx_success_factors_game ON success_factors(gameId);
    `);

    console.log('✅ Database initialized successfully');
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  close(): void {
    this.db.close();
  }
}

export const generateId = (): string => uuidv4();
export const getCurrentTimestamp = (): string => new Date().toISOString();
