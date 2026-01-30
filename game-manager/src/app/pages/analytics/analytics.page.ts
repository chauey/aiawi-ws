import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { GameStore } from '@aiawi-ws/game-data';

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

      @if (store.loading()) {
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
  readonly store = inject(GameStore);

  totalRevenue = computed(() =>
    this.store
      .games()
      .reduce((sum, g) => sum + (g.successMetrics?.revenueMonthly || 0), 0),
  );

  totalPlayers = computed(() =>
    this.store
      .games()
      .reduce((sum, g) => sum + (g.successMetrics?.concurrentPlayers || 0), 0),
  );

  avgRetention = computed(() => {
    const games = this.store
      .games()
      .filter((g) => g.successMetrics?.retentionRateDay1);
    if (games.length === 0) return 0;
    const sum = games.reduce(
      (s, g) => s + (g.successMetrics?.retentionRateDay1 || 0),
      0,
    );
    return sum / games.length;
  });

  genreStats = computed<CategoryStats[]>(() => {
    const genres: Record<string, CategoryStats> = {};
    this.store.games().forEach((game) => {
      if (game.genre) {
        if (!genres[game.genre]) {
          genres[game.genre] = {
            name: game.genre,
            revenue: 0,
            players: 0,
            count: 0,
          };
        }
        genres[game.genre].revenue += game.successMetrics?.revenueMonthly || 0;
        genres[game.genre].players +=
          game.successMetrics?.concurrentPlayers || 0;
        genres[game.genre].count++;
      }
    });
    return Object.values(genres).sort((a, b) => b.revenue - a.revenue);
  });

  platformStats = computed<CategoryStats[]>(() => {
    const platforms: Record<string, CategoryStats> = {};
    this.store.games().forEach((game) => {
      if (game.platform) {
        if (!platforms[game.platform]) {
          platforms[game.platform] = {
            name: game.platform,
            revenue: 0,
            players: 0,
            count: 0,
          };
        }
        platforms[game.platform].revenue +=
          game.successMetrics?.revenueMonthly || 0;
        platforms[game.platform].players +=
          game.successMetrics?.concurrentPlayers || 0;
        platforms[game.platform].count++;
      }
    });
    return Object.values(platforms).sort((a, b) => b.revenue - a.revenue);
  });

  insights = computed(() => {
    const games = this.store.games();
    const platforms = this.store.platforms();
    const genres = this.genreStats();
    const topGenre = genres[0];

    const insightsList = [
      `${games.length} games are being tracked across ${platforms.length} platforms.`,
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

    return insightsList;
  });

  ngOnInit() {
    if (this.store.games().length === 0) {
      this.store.loadGames();
    }
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
