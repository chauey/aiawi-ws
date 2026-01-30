import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GameDto } from '../shared/dtos/game.dto';

export interface GameDatabase {
  games: GameDto[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalGames: number;
  };
}

export class JsonStorageService {
  private dataFilePath: string;
  private database: GameDatabase;

  constructor(dataDir: string = path.join(__dirname, '../../data')) {
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dataFilePath = path.join(dataDir, 'games-database.json');
    this.loadDatabase();
  }

  /**
   * Load database from JSON file or create new one
   */
  private loadDatabase(): void {
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const fileContent = fs.readFileSync(this.dataFilePath, 'utf-8');
        this.database = JSON.parse(fileContent);
        console.log(
          `✅ Loaded ${this.database.games.length} games from ${this.dataFilePath}`,
        );
      } catch (error) {
        console.error('Error loading database:', error);
        this.createNewDatabase();
      }
    } else {
      this.createNewDatabase();
    }
  }

  /**
   * Create a new empty database
   */
  private createNewDatabase(): void {
    this.database = {
      games: [],
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalGames: 0,
      },
    };
    this.saveDatabase();
    console.log(`✅ Created new database at ${this.dataFilePath}`);
  }

  /**
   * Save database to JSON file
   */
  saveDatabase(): void {
    this.database.metadata.lastUpdated = new Date().toISOString();
    this.database.metadata.totalGames = this.database.games.length;

    const jsonContent = JSON.stringify(this.database, null, 2);
    fs.writeFileSync(this.dataFilePath, jsonContent, 'utf-8');
    console.log(`💾 Saved ${this.database.games.length} games to database`);
  }

  /**
   * Get all games
   */
  getGames(): GameDto[] {
    return this.database.games;
  }

  /**
   * Get game by ID
   */
  getGameById(id: string): GameDto | undefined {
    return this.database.games.find((g) => g.id === id);
  }

  /**
   * Add a new game
   */
  addGame(game: GameDto): void {
    this.database.games.push(game);
    this.saveDatabase();
  }

  /**
   * Update a game
   */
  updateGame(id: string, updates: Partial<GameDto>): boolean {
    const index = this.database.games.findIndex((g) => g.id === id);
    if (index === -1) return false;

    this.database.games[index] = {
      ...this.database.games[index],
      ...updates,
      lastModificationTime: new Date(),
    };
    this.saveDatabase();
    return true;
  }

  /**
   * Delete a game
   */
  deleteGame(id: string): boolean {
    const initialLength = this.database.games.length;
    this.database.games = this.database.games.filter((g) => g.id !== id);

    if (this.database.games.length < initialLength) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  /**
   * Get database metadata
   */
  getMetadata() {
    return this.database.metadata;
  }

  /**
   * Export database to a specific file
   */
  exportToFile(filePath: string): void {
    const jsonContent = JSON.stringify(this.database, null, 2);
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    console.log(`📤 Exported database to ${filePath}`);
  }

  /**
   * Import database from a specific file
   */
  importFromFile(filePath: string): void {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    this.database = JSON.parse(fileContent);
    this.saveDatabase();
    console.log(
      `📥 Imported ${this.database.games.length} games from ${filePath}`,
    );
  }
}

export const generateId = (): string => uuidv4();
export const getCurrentTimestamp = (): Date => new Date();
