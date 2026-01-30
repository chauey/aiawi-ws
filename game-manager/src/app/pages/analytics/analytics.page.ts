import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

interface Game {
  genre: string;
  platform: string;
  successMetrics?: {
    revenueMonthly: number;
    concurrentPlayers: number;
    retentionRateDay1: number;
  };
}

interface CategoryStats {
  name: string;
  revenue: number;
  players: number;
  count: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmBadgeImports],
  template: `
    <div class="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Analytics</h1>
        <p class="text-muted-foreground">Aggregated performance insights</p>
      </div>

      @if (loading()) {
        <div class="text-center py-12 text-muted-foreground">
          Loading analytics...
        </div>
      } @else {
        <!-- Summary Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div hlmCard>
            <div hlmCardContent class="pt-6 text-center">
              <div class="text-3xl font-bold text-primary">
                {{ '$' + formatNumber(totalRevenue()) }}
              </div>
              <div class="text-sm text-muted-foreground">
                Total Monthly Revenue
              </div>
            </div>
          </div>
          <div hlmCard>
            <div hlmCardContent class="pt-6 text-center">
              <div class="text-3xl font-bold">
                {{ formatNumber(totalPlayers()) }}
              </div>
              <div class="text-sm text-muted-foreground">
                Total Concurrent Players
              </div>
            </div>
          </div>
          <div hlmCard>
            <div hlmCardContent class="pt-6 text-center">
              <div class="text-3xl font-bold">
                {{ avgRetention().toFixed(1) }}%
              </div>
              <div class="text-sm text-muted-foreground">
                Average D1 Retention
              </div>
            </div>
          </div>
        </div>

        <!-- Genre Breakdown -->
        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Performance by Genre</h3>
          </div>
          <div hlmCardContent>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (genre of genreStats(); track genre.name) {
                <div class="p-4 border rounded-lg">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">{{ genre.name }}</span>
                    <span hlmBadge variant="outline"
                      >{{ genre.count }} games</span
                    >
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div class="text-muted-foreground">Revenue</div>
                      <div class="font-semibold text-primary">
                        {{ '$' + formatNumber(genre.revenue) }}
                      </div>
                    </div>
                    <div>
                      <div class="text-muted-foreground">Players</div>
                      <div class="font-semibold">
                        {{ formatNumber(genre.players) }}
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Platform Breakdown -->
        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Performance by Platform</h3>
          </div>
          <div hlmCardContent>
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              @for (platform of platformStats(); track platform.name) {
                <div class="p-4 border rounded-lg text-center">
                  <div class="text-2xl mb-2">
                    {{ getPlatformEmoji(platform.name) }}
                  </div>
                  <div class="font-medium">{{ platform.name }}</div>
                  <div class="text-sm text-muted-foreground mb-2">
                    {{ platform.count }} games
                  </div>
                  <div class="text-lg font-bold text-primary">
                    {{ '$' + formatNumber(platform.revenue) }}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Key Insights -->
        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Key Insights</h3>
          </div>
          <div hlmCardContent>
            <div class="space-y-3">
              @for (insight of insights(); track insight) {
                <div class="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <span class="text-xl">💡</span>
                  <p class="text-sm">{{ insight }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AnalyticsPage implements OnInit {
  loading = signal(true);
  totalRevenue = signal(0);
  totalPlayers = signal(0);
  avgRetention = signal(0);
  genreStats = signal<CategoryStats[]>([]);
  platformStats = signal<CategoryStats[]>([]);
  insights = signal<string[]>([]);

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const response = await fetch('http://localhost:3333/api/games');
      const data = await response.json();
      const games: Game[] = data.items || [];

      this.calculateStats(games);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private calculateStats(games: Game[]) {
    let revenue = 0;
    let players = 0;
    let retention = 0;
    let retentionCount = 0;

    const genres: Record<string, CategoryStats> = {};
    const platforms: Record<string, CategoryStats> = {};

    games.forEach((game) => {
      const metrics = game.successMetrics;
      if (metrics) {
        revenue += metrics.revenueMonthly;
        players += metrics.concurrentPlayers;
        if (metrics.retentionRateDay1) {
          retention += metrics.retentionRateDay1;
          retentionCount++;
        }
      }

      if (game.genre) {
        if (!genres[game.genre]) {
          genres[game.genre] = {
            name: game.genre,
            revenue: 0,
            players: 0,
            count: 0,
          };
        }
        genres[game.genre].revenue += metrics?.revenueMonthly || 0;
        genres[game.genre].players += metrics?.concurrentPlayers || 0;
        genres[game.genre].count++;
      }

      if (game.platform) {
        if (!platforms[game.platform]) {
          platforms[game.platform] = {
            name: game.platform,
            revenue: 0,
            players: 0,
            count: 0,
          };
        }
        platforms[game.platform].revenue += metrics?.revenueMonthly || 0;
        platforms[game.platform].players += metrics?.concurrentPlayers || 0;
        platforms[game.platform].count++;
      }
    });

    this.totalRevenue.set(revenue);
    this.totalPlayers.set(players);
    this.avgRetention.set(retentionCount > 0 ? retention / retentionCount : 0);
    this.genreStats.set(
      Object.values(genres).sort((a, b) => b.revenue - a.revenue),
    );
    this.platformStats.set(
      Object.values(platforms).sort((a, b) => b.revenue - a.revenue),
    );

    const topGenre = Object.values(genres).sort(
      (a, b) => b.revenue - a.revenue,
    )[0];
    const insightsList = [
      `${games.length} games are being tracked across ${Object.keys(platforms).length} platforms.`,
    ];
    if (topGenre) {
      insightsList.push(
        `${topGenre.name} is the highest-grossing genre with $${this.formatNumber(topGenre.revenue)}/mo.`,
      );
    }
    if (this.avgRetention() > 50) {
      insightsList.push(
        `Average D1 retention of ${this.avgRetention().toFixed(1)}% is above industry average.`,
      );
    }
    this.insights.set(insightsList);
  }

  getPlatformEmoji(platform: string): string {
    const emojis: Record<string, string> = {
      Roblox: '🎮',
      Steam: '🖥️',
      Mobile: '📱',
      Console: '🎯',
    };
    return emojis[platform] || '🎮';
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}
