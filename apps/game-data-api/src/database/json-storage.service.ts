import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GameDto } from '../shared/dtos/game.dto';
import { ProductDto } from '../shared/dtos/product.dto';
import { CompanyDto } from '../shared/dtos/company.dto';

/**
 * Multi-entity database structure
 */
export interface Database {
  // Legacy
  games: GameDto[];

  // New entities
  products: ProductDto[];
  companies: CompanyDto[];

  // Metadata
  metadata: {
    version: string;
    lastUpdated: string;
    totalGames: number;
    totalProducts: number;
    totalCompanies: number;
  };
}

// Legacy type alias for backwards compatibility
export type GameDatabase = Database;

export class JsonStorageService {
  private dataFilePath: string;
  private database: Database;

  constructor(dataDir: string = path.join(__dirname, '../../data')) {
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dataFilePath = path.join(dataDir, 'database.json');
    this.loadDatabase();
  }

  /**
   * Load database from JSON file or create new one
   */
  private loadDatabase(): void {
    // Try new database file first
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const fileContent = fs.readFileSync(this.dataFilePath, 'utf-8');
        this.database = JSON.parse(fileContent);

        // Ensure new arrays exist (migration)
        if (!this.database.products) this.database.products = [];
        if (!this.database.companies) this.database.companies = [];

        console.log(
          `✅ Loaded ${this.database.games?.length || 0} games, ${this.database.products?.length || 0} products, ${this.database.companies?.length || 0} companies`,
        );
      } catch (error) {
        console.error('Error loading database:', error);
        this.createNewDatabase();
      }
    } else {
      // Try legacy file
      const legacyPath = path.join(
        path.dirname(this.dataFilePath),
        'games-database.json',
      );
      if (fs.existsSync(legacyPath)) {
        try {
          const fileContent = fs.readFileSync(legacyPath, 'utf-8');
          const legacyDb = JSON.parse(fileContent);
          this.database = {
            games: legacyDb.games || [],
            products: [],
            companies: [],
            metadata: {
              version: '2.0.0',
              lastUpdated: new Date().toISOString(),
              totalGames: legacyDb.games?.length || 0,
              totalProducts: 0,
              totalCompanies: 0,
            },
          };
          this.saveDatabase();
          console.log(
            `✅ Migrated ${this.database.games.length} games from legacy database`,
          );
        } catch (error) {
          console.error('Error loading legacy database:', error);
          this.createNewDatabase();
        }
      } else {
        this.createNewDatabase();
      }
    }
  }

  /**
   * Create a new empty database
   */
  private createNewDatabase(): void {
    this.database = {
      games: [],
      products: [],
      companies: [],
      metadata: {
        version: '2.0.0',
        lastUpdated: new Date().toISOString(),
        totalGames: 0,
        totalProducts: 0,
        totalCompanies: 0,
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
    this.database.metadata.totalGames = this.database.games?.length || 0;
    this.database.metadata.totalProducts = this.database.products?.length || 0;
    this.database.metadata.totalCompanies =
      this.database.companies?.length || 0;

    const jsonContent = JSON.stringify(this.database, null, 2);
    fs.writeFileSync(this.dataFilePath, jsonContent, 'utf-8');
  }

  // ==========================================
  // GENERIC CRUD OPERATIONS
  // ==========================================

  /**
   * Get all entities of a collection
   */
  getAll<T>(collection: 'games' | 'products' | 'companies'): T[] {
    return (this.database[collection] as unknown as T[]) || [];
  }

  /**
   * Get entity by ID
   */
  getById<T extends { id: string }>(
    collection: 'games' | 'products' | 'companies',
    id: string,
  ): T | null {
    const items = this.database[collection] as unknown as T[];
    return items.find((item) => item.id === id) || null;
  }

  /**
   * Create entity
   */
  create<T extends { id: string }>(
    collection: 'games' | 'products' | 'companies',
    entity: T,
  ): void {
    (this.database[collection] as unknown as T[]).push(entity);
    this.saveDatabase();
  }

  /**
   * Update entity
   */
  update<T extends { id: string }>(
    collection: 'games' | 'products' | 'companies',
    id: string,
    updates: Partial<T>,
  ): boolean {
    const items = this.database[collection] as unknown as T[];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    items[index] = { ...items[index], ...updates };
    this.saveDatabase();
    return true;
  }

  /**
   * Delete entity
   */
  delete(collection: 'games' | 'products' | 'companies', id: string): boolean {
    const items = this.database[collection] as unknown as { id: string }[];
    const initialLength = items.length;

    (this.database[collection] as unknown as { id: string }[]) = items.filter(
      (item) => item.id !== id,
    );

    if (
      (this.database[collection] as unknown as { id: string }[]).length <
      initialLength
    ) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // ==========================================
  // LEGACY GAME-SPECIFIC METHODS (for backwards compatibility)
  // ==========================================

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
