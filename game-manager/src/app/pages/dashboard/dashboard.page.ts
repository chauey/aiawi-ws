import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface GameSummary {
  name: string;
  genre: string;
  revenueMonthly: number;
  concurrentPlayers: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Game Development Intelligence Overview</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">🎮</div>
          <div class="stat-content">
            <span class="stat-value">{{ totalGames() }}</span>
            <span class="stat-label">Total Games</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">👥</div>
          <div class="stat-content">
            <span class="stat-value">{{ totalCompetitors() }}</span>
            <span class="stat-label">Competitors</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">💰</div>
          <div class="stat-content">
            <span class="stat-value">\${{ formatNumber(totalRevenue()) }}</span>
            <span class="stat-label">Total Revenue/mo</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orange">🔥</div>
          <div class="stat-content">
            <span class="stat-value">{{ formatNumber(totalPlayers()) }}</span>
            <span class="stat-label">Concurrent Players</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <a routerLink="/games" class="action-card">
            <span class="action-icon">📊</span>
            <span class="action-title">View All Games</span>
            <span class="action-desc">Browse and manage game database</span>
          </a>

          <a routerLink="/competitors" class="action-card">
            <span class="action-icon">🔍</span>
            <span class="action-title">Analyze Competitors</span>
            <span class="action-desc">Study top performing games</span>
          </a>

          <a routerLink="/features" class="action-card">
            <span class="action-icon">⚡</span>
            <span class="action-title">Feature Analysis</span>
            <span class="action-desc">Compare features & systems</span>
          </a>

          <a routerLink="/analytics" class="action-card">
            <span class="action-icon">📈</span>
            <span class="action-title">Analytics</span>
            <span class="action-desc">ROI estimates & metrics</span>
          </a>
        </div>
      </div>

      <!-- Top Games -->
      <div class="section">
        <div class="section-header">
          <h2>Top Revenue Games</h2>
          <a routerLink="/games" class="view-all">View All →</a>
        </div>

        @if (loading()) {
          <div class="loading">Loading games...</div>
        } @else {
          <div class="games-table">
            <div class="table-header">
              <span>Game</span>
              <span>Genre</span>
              <span>Monthly Revenue</span>
              <span>Players</span>
            </div>
            @for (game of topGames(); track game.name) {
              <div class="table-row">
                <span class="game-name">{{ game.name }}</span>
                <span class="badge">{{ game.genre }}</span>
                <span class="revenue"
                  >\${{ formatNumber(game.revenueMonthly) }}</span
                >
                <span class="players">{{
                  formatNumber(game.concurrentPlayers)
                }}</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
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

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--bg-secondary, #f5f5f5);
      border-radius: 0.75rem;
      border: 1px solid var(--border-color, #e0e0e0);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      border-radius: 0.5rem;
    }

    .stat-icon.blue {
      background: oklch(0.6 0.2 260 / 0.15);
    }
    .stat-icon.purple {
      background: oklch(0.6 0.2 300 / 0.15);
    }
    .stat-icon.green {
      background: oklch(0.65 0.2 145 / 0.15);
    }
    .stat-icon.orange {
      background: oklch(0.7 0.2 60 / 0.15);
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
    }

    /* Section */
    .section {
      margin-bottom: 2rem;
    }

    .section h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .view-all {
      color: oklch(0.6 0.2 260);
      text-decoration: none;
      font-weight: 500;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    /* Actions Grid */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.75rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }

    .action-card:hover {
      border-color: oklch(0.6 0.2 260);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px oklch(0 0 0 / 0.1);
    }

    .action-icon {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }

    .action-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .action-desc {
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
    }

    /* Games Table */
    .games-table {
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .table-header,
    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      padding: 0.75rem 1rem;
      gap: 1rem;
    }

    .table-header {
      background: var(--bg-tertiary, #eee);
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
    }

    .table-row {
      border-top: 1px solid var(--border-color, #e0e0e0);
    }

    .table-row:hover {
      background: var(--bg-tertiary, #eee);
    }

    .game-name {
      font-weight: 500;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      background: oklch(0.6 0.2 260 / 0.15);
      color: oklch(0.5 0.2 260);
      border-radius: 9999px;
      width: fit-content;
    }

    .revenue {
      color: oklch(0.5 0.2 145);
      font-weight: 600;
    }

    .loading {
      padding: 2rem;
      text-align: center;
      color: var(--text-secondary, #666);
    }

    @media (max-width: 640px) {
      .table-header,
      .table-row {
        grid-template-columns: 1fr 1fr;
      }

      .table-header span:nth-child(3),
      .table-header span:nth-child(4),
      .table-row span:nth-child(3),
      .table-row span:nth-child(4) {
        display: none;
      }
    }
  `,
})
export class DashboardPage implements OnInit {
  private http = inject(HttpClient);

  loading = signal(true);
  totalGames = signal(0);
  totalCompetitors = signal(0);
  totalRevenue = signal(0);
  totalPlayers = signal(0);
  topGames = signal<GameSummary[]>([]);

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const response = await fetch('http://localhost:3333/api/games');
      const data = await response.json();

      const games = data.items || [];
      this.totalGames.set(games.length);
      this.totalCompetitors.set(
        games.filter((g: any) => g.ownership === 'Competitor').length,
      );

      let revenue = 0;
      let players = 0;

      const topGames: GameSummary[] = [];

      for (const game of games) {
        if (game.successMetrics) {
          revenue += game.successMetrics.revenueMonthly || 0;
          players += game.successMetrics.concurrentPlayers || 0;
        }

        topGames.push({
          name: game.name,
          genre: game.genre,
          revenueMonthly: game.successMetrics?.revenueMonthly || 0,
          concurrentPlayers: game.successMetrics?.concurrentPlayers || 0,
        });
      }

      this.totalRevenue.set(revenue);
      this.totalPlayers.set(players);
      this.topGames.set(
        topGames
          .sort((a, b) => b.revenueMonthly - a.revenueMonthly)
          .slice(0, 5),
      );
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      this.loading.set(false);
    }
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
}
