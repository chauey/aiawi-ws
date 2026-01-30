import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Game {
  id: string;
  name: string;
  developer: string;
  genre: string;
  platform: string;
  ownership?: string;
  successMetrics?: {
    revenueMonthly: number;
    concurrentPlayers: number;
    retentionRateDay1: number;
  };
}

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="games-page">
      <div class="page-header">
        <div>
          <h1>Games Database</h1>
          <p>Browse and manage all tracked games</p>
        </div>
        <button class="btn-primary" (click)="showAddModal = true">
          + Add Game
        </button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <input
          type="text"
          placeholder="Search games..."
          [(ngModel)]="searchQuery"
          (input)="filterGames()"
          class="search-input"
        />

        <select
          [(ngModel)]="genreFilter"
          (change)="filterGames()"
          class="filter-select"
        >
          <option value="">All Genres</option>
          @for (genre of genres(); track genre) {
            <option [value]="genre">{{ genre }}</option>
          }
        </select>

        <select
          [(ngModel)]="ownershipFilter"
          (change)="filterGames()"
          class="filter-select"
        >
          <option value="">All Types</option>
          <option value="Our Game">Our Games</option>
          <option value="Competitor">Competitors</option>
          <option value="Reference">Reference</option>
        </select>
      </div>

      <!-- Games Grid -->
      @if (loading()) {
        <div class="loading">Loading games...</div>
      } @else if (filteredGames().length === 0) {
        <div class="empty">No games found</div>
      } @else {
        <div class="games-grid">
          @for (game of filteredGames(); track game.id) {
            <a [routerLink]="['/games', game.id]" class="game-card">
              <div class="game-header">
                <h3>{{ game.name }}</h3>
                <span class="badge" [class]="getOwnershipClass(game.ownership)">
                  {{ game.ownership || 'Reference' }}
                </span>
              </div>

              <div class="game-meta">
                <span>{{ game.developer }}</span>
                <span class="dot">•</span>
                <span>{{ game.genre }}</span>
              </div>

              @if (game.successMetrics) {
                <div class="game-stats">
                  <div class="stat">
                    <span class="stat-value"
                      >\${{
                        formatNumber(game.successMetrics.revenueMonthly)
                      }}/mo</span
                    >
                    <span class="stat-label">Revenue</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value">{{
                      formatNumber(game.successMetrics.concurrentPlayers)
                    }}</span>
                    <span class="stat-label">Players</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value"
                      >{{ game.successMetrics.retentionRateDay1 }}%</span
                    >
                    <span class="stat-label">D1 Retention</span>
                  </div>
                </div>
              }

              <div class="game-platform">
                <span class="platform-badge">{{ game.platform }}</span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .games-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .page-header p {
      color: var(--text-secondary, #666);
      margin: 0;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: oklch(0.6 0.2 260);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      background: oklch(0.55 0.22 260);
    }

    /* Filters */
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .search-input {
      flex: 1;
      min-width: 200px;
      padding: 0.75rem 1rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.5rem;
      color: inherit;
      font-size: 1rem;
    }

    .search-input:focus {
      outline: none;
      border-color: oklch(0.6 0.2 260);
    }

    .filter-select {
      padding: 0.75rem 1rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.5rem;
      color: inherit;
      font-size: 1rem;
      cursor: pointer;
    }

    /* Games Grid */
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .game-card {
      display: block;
      padding: 1.25rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.75rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }

    .game-card:hover {
      border-color: oklch(0.6 0.2 260);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px oklch(0 0 0 / 0.1);
    }

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .game-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      border-radius: 9999px;
    }

    .badge.our-game {
      background: oklch(0.65 0.2 145 / 0.2);
      color: oklch(0.5 0.2 145);
    }

    .badge.competitor {
      background: oklch(0.6 0.25 25 / 0.2);
      color: oklch(0.5 0.25 25);
    }

    .badge.reference {
      background: oklch(0.6 0.2 260 / 0.2);
      color: oklch(0.5 0.2 260);
    }

    .game-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      margin-bottom: 1rem;
    }

    .dot {
      opacity: 0.5;
    }

    .game-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--bg-tertiary, #eee);
      border-radius: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat-value {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .stat-label {
      font-size: 0.7rem;
      color: var(--text-secondary, #666);
    }

    .game-platform {
      display: flex;
    }

    .platform-badge {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      background: var(--bg-tertiary, #eee);
      border-radius: 0.25rem;
    }

    .loading,
    .empty {
      padding: 3rem;
      text-align: center;
      color: var(--text-secondary, #666);
    }

    @media (max-width: 640px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .btn-primary {
        width: 100%;
      }
    }
  `,
})
export class GamesPage implements OnInit {
  loading = signal(true);
  games = signal<Game[]>([]);
  filteredGames = signal<Game[]>([]);
  genres = signal<string[]>([]);

  searchQuery = '';
  genreFilter = '';
  ownershipFilter = '';
  showAddModal = false;

  ngOnInit() {
    this.loadGames();
  }

  async loadGames() {
    try {
      const response = await fetch('http://localhost:3333/api/games');
      const data = await response.json();
      const games = data.items || [];

      this.games.set(games);
      this.filteredGames.set(games);

      const uniqueGenres = [...new Set(games.map((g: Game) => g.genre))]
        .filter(Boolean)
        .sort();
      this.genres.set(uniqueGenres as string[]);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      this.loading.set(false);
    }
  }

  filterGames() {
    let filtered = this.games();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.developer.toLowerCase().includes(query),
      );
    }

    if (this.genreFilter) {
      filtered = filtered.filter((g) => g.genre === this.genreFilter);
    }

    if (this.ownershipFilter) {
      filtered = filtered.filter((g) => g.ownership === this.ownershipFilter);
    }

    this.filteredGames.set(filtered);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getOwnershipClass(ownership: string | undefined): string {
    if (!ownership) return 'reference';
    return ownership.toLowerCase().replace(' ', '-');
  }
}
