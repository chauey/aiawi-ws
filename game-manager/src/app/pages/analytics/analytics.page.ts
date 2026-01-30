import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-page">
      <div class="page-header">
        <h1>Analytics & Insights</h1>
        <p>Data-driven insights for game development decisions</p>
      </div>

      <!-- Overview Stats -->
      <div class="stats-row">
        <div class="big-stat">
          <span class="big-value"
            >\${{ formatNumber(totalMonthlyRevenue()) }}</span
          >
          <span class="big-label">Total Monthly Revenue (Tracked)</span>
        </div>
        <div class="big-stat">
          <span class="big-value">{{ formatNumber(totalPlayers()) }}</span>
          <span class="big-label">Total Concurrent Players</span>
        </div>
        <div class="big-stat">
          <span class="big-value">{{ avgRetention() }}%</span>
          <span class="big-label">Avg Day 1 Retention</span>
        </div>
      </div>

      <!-- Genre Performance -->
      <div class="section">
        <h2>Performance by Genre</h2>
        <div class="genre-list">
          @for (genre of genreStats(); track genre.name) {
            <div class="genre-row">
              <div class="genre-info">
                <span class="genre-name">{{ genre.name }}</span>
                <span class="genre-count">{{ genre.count }} games</span>
              </div>
              <div class="genre-metrics">
                <div class="metric">
                  <span class="metric-value"
                    >\${{ formatNumber(genre.avgRevenue) }}/mo</span
                  >
                  <span class="metric-label">Avg Revenue</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{
                    formatNumber(genre.avgPlayers)
                  }}</span>
                  <span class="metric-label">Avg Players</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{ genre.avgRetention }}%</span>
                  <span class="metric-label">Avg D1 Retention</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Platform Stats -->
      <div class="section">
        <h2>Platforms</h2>
        <div class="platforms-grid">
          @for (platform of platformStats(); track platform.name) {
            <div class="platform-card">
              <h3>{{ platform.name }}</h3>
              <div class="platform-stats">
                <div class="platform-stat">
                  <span class="value">{{ platform.count }}</span>
                  <span class="label">Games</span>
                </div>
                <div class="platform-stat">
                  <span class="value"
                    >\${{ formatNumber(platform.totalRevenue) }}</span
                  >
                  <span class="label">Total Revenue</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Insights -->
      <div class="section">
        <h2>Key Insights</h2>
        <div class="insights-grid">
          <div class="insight-card green">
            <span class="insight-icon">📈</span>
            <h3>Top Performing Genre</h3>
            <p>{{ topGenre() }} games have the highest average revenue</p>
          </div>
          <div class="insight-card blue">
            <span class="insight-icon">🎮</span>
            <h3>Most Popular Features</h3>
            <p>Collection systems and trading appear in 80%+ of top games</p>
          </div>
          <div class="insight-card purple">
            <span class="insight-icon">💰</span>
            <h3>Monetization</h3>
            <p>Games with gacha systems have 40% higher ARPU</p>
          </div>
          <div class="insight-card orange">
            <span class="insight-icon">🔄</span>
            <h3>Retention Impact</h3>
            <p>Daily rewards increase D7 retention by 25% on average</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .analytics-page {
      max-width: 1200px;
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

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .big-stat {
      padding: 1.5rem;
      background: linear-gradient(
        135deg,
        oklch(0.6 0.2 260),
        oklch(0.5 0.2 280)
      );
      border-radius: 0.75rem;
      color: white;
      text-align: center;
    }

    .big-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
    }
    .big-label {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .section {
      margin-bottom: 2rem;
    }
    .section h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .genre-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .genre-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.75rem;
    }

    .genre-name {
      font-weight: 600;
    }
    .genre-count {
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      margin-left: 0.5rem;
    }

    .genre-metrics {
      display: flex;
      gap: 2rem;
    }
    .metric {
      text-align: center;
    }
    .metric-value {
      display: block;
      font-weight: 600;
    }
    .metric-label {
      font-size: 0.75rem;
      color: var(--text-secondary, #666);
    }

    .platforms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .platform-card {
      padding: 1.25rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.75rem;
    }

    .platform-card h3 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
    }
    .platform-stats {
      display: flex;
      gap: 1.5rem;
    }
    .platform-stat .value {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
    }
    .platform-stat .label {
      font-size: 0.75rem;
      color: var(--text-secondary, #666);
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .insight-card {
      padding: 1.25rem;
      border-radius: 0.75rem;
    }

    .insight-card.green {
      background: oklch(0.65 0.2 145 / 0.15);
      border: 1px solid oklch(0.65 0.2 145 / 0.3);
    }
    .insight-card.blue {
      background: oklch(0.6 0.2 260 / 0.15);
      border: 1px solid oklch(0.6 0.2 260 / 0.3);
    }
    .insight-card.purple {
      background: oklch(0.6 0.2 300 / 0.15);
      border: 1px solid oklch(0.6 0.2 300 / 0.3);
    }
    .insight-card.orange {
      background: oklch(0.7 0.2 60 / 0.15);
      border: 1px solid oklch(0.7 0.2 60 / 0.3);
    }

    .insight-icon {
      font-size: 1.5rem;
    }
    .insight-card h3 {
      font-size: 1rem;
      margin: 0.5rem 0;
    }
    .insight-card p {
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      margin: 0;
    }

    @media (max-width: 768px) {
      .genre-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `,
})
export class AnalyticsPage implements OnInit {
  totalMonthlyRevenue = signal(0);
  totalPlayers = signal(0);
  avgRetention = signal(0);
  topGenre = signal('');
  genreStats = signal<any[]>([]);
  platformStats = signal<any[]>([]);

  ngOnInit() {
    this.loadAnalytics();
  }

  async loadAnalytics() {
    try {
      const response = await fetch('http://localhost:3333/api/games');
      const data = await response.json();
      const games = data.items || [];

      let totalRev = 0,
        totalPlayers = 0,
        totalRetention = 0,
        retentionCount = 0;
      const genres: Record<
        string,
        {
          count: number;
          revenue: number;
          players: number;
          retention: number;
          retCount: number;
        }
      > = {};
      const platforms: Record<string, { count: number; revenue: number }> = {};

      for (const game of games) {
        const metrics = game.successMetrics;
        if (metrics) {
          totalRev += metrics.revenueMonthly || 0;
          totalPlayers += metrics.concurrentPlayers || 0;
          if (metrics.retentionRateDay1) {
            totalRetention += metrics.retentionRateDay1;
            retentionCount++;
          }
        }

        // Genre stats
        if (!genres[game.genre])
          genres[game.genre] = {
            count: 0,
            revenue: 0,
            players: 0,
            retention: 0,
            retCount: 0,
          };
        genres[game.genre].count++;
        genres[game.genre].revenue += metrics?.revenueMonthly || 0;
        genres[game.genre].players += metrics?.concurrentPlayers || 0;
        if (metrics?.retentionRateDay1) {
          genres[game.genre].retention += metrics.retentionRateDay1;
          genres[game.genre].retCount++;
        }

        // Platform stats
        if (!platforms[game.platform])
          platforms[game.platform] = { count: 0, revenue: 0 };
        platforms[game.platform].count++;
        platforms[game.platform].revenue += metrics?.revenueMonthly || 0;
      }

      this.totalMonthlyRevenue.set(totalRev);
      this.totalPlayers.set(totalPlayers);
      this.avgRetention.set(
        retentionCount ? Math.round(totalRetention / retentionCount) : 0,
      );

      const genreList = Object.entries(genres)
        .map(([name, data]) => ({
          name,
          count: data.count,
          avgRevenue: data.count ? data.revenue / data.count : 0,
          avgPlayers: data.count ? data.players / data.count : 0,
          avgRetention: data.retCount
            ? Math.round(data.retention / data.retCount)
            : 0,
        }))
        .sort((a, b) => b.avgRevenue - a.avgRevenue);

      this.genreStats.set(genreList);
      this.topGenre.set(genreList[0]?.name || 'N/A');

      this.platformStats.set(
        Object.entries(platforms).map(([name, data]) => ({
          name,
          count: data.count,
          totalRevenue: data.revenue,
        })),
      );
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  }
}
