import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { GameStore } from '@aiawi-ws/game-data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
  ],
  template: `
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-muted-foreground">
          Game Development Intelligence Overview
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div hlmCard>
          <div
            hlmCardHeader
            class="flex flex-row items-center justify-between pb-2"
          >
            <h3 hlmCardTitle class="text-sm font-medium">Total Games</h3>
            <span class="text-2xl">🎮</span>
          </div>
          <div hlmCardContent>
            <div class="text-3xl font-bold">{{ store.totalCount() }}</div>
          </div>
        </div>

        <div hlmCard>
          <div
            hlmCardHeader
            class="flex flex-row items-center justify-between pb-2"
          >
            <h3 hlmCardTitle class="text-sm font-medium">Competitors</h3>
            <span class="text-2xl">🏆</span>
          </div>
          <div hlmCardContent>
            <div class="text-3xl font-bold">
              {{ store.competitorGames().length }}
            </div>
          </div>
        </div>

        <div hlmCard>
          <div
            hlmCardHeader
            class="flex flex-row items-center justify-between pb-2"
          >
            <h3 hlmCardTitle class="text-sm font-medium">Total Revenue/mo</h3>
            <span class="text-2xl">💰</span>
          </div>
          <div hlmCardContent>
            <div class="text-3xl font-bold text-primary">
              {{ '$' + formatNumber(totalRevenue()) }}
            </div>
          </div>
        </div>

        <div hlmCard>
          <div
            hlmCardHeader
            class="flex flex-row items-center justify-between pb-2"
          >
            <h3 hlmCardTitle class="text-sm font-medium">Concurrent Players</h3>
            <span class="text-2xl">👥</span>
          </div>
          <div hlmCardContent>
            <div class="text-3xl font-bold">
              {{ formatNumber(totalPlayers()) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>Quick Actions</h3>
        </div>
        <div hlmCardContent>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              routerLink="/games"
              hlmBtn
              variant="outline"
              class="h-auto py-4 flex-col gap-2"
            >
              <span class="text-2xl">🎮</span>
              <span>View All Games</span>
            </a>
            <a
              routerLink="/competitors"
              hlmBtn
              variant="outline"
              class="h-auto py-4 flex-col gap-2"
            >
              <span class="text-2xl">🏆</span>
              <span>Competitors</span>
            </a>
            <a
              routerLink="/features"
              hlmBtn
              variant="outline"
              class="h-auto py-4 flex-col gap-2"
            >
              <span class="text-2xl">⚡</span>
              <span>Features</span>
            </a>
            <a
              routerLink="/analytics"
              hlmBtn
              variant="outline"
              class="h-auto py-4 flex-col gap-2"
            >
              <span class="text-2xl">📊</span>
              <span>Analytics</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Top Revenue Games -->
      <div hlmCard>
        <div hlmCardHeader class="flex flex-row items-center justify-between">
          <h3 hlmCardTitle>Top Revenue Games</h3>
          <a routerLink="/games" class="text-sm text-primary hover:underline"
            >View All →</a
          >
        </div>
        <div hlmCardContent>
          @if (store.loading()) {
            <div class="text-center py-8 text-muted-foreground">Loading...</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b">
                    <th
                      class="text-left py-3 px-2 text-sm font-medium text-muted-foreground"
                    >
                      Game
                    </th>
                    <th
                      class="text-left py-3 px-2 text-sm font-medium text-muted-foreground"
                    >
                      Genre
                    </th>
                    <th
                      class="text-right py-3 px-2 text-sm font-medium text-muted-foreground"
                    >
                      Monthly Revenue
                    </th>
                    <th
                      class="text-right py-3 px-2 text-sm font-medium text-muted-foreground"
                    >
                      Players
                    </th>
                  </tr>
                </thead>
                <tbody>
                  @for (
                    game of store.topRevenueGames().slice(0, 5);
                    track game.id
                  ) {
                    <tr class="border-b hover:bg-muted/50 transition-colors">
                      <td class="py-3 px-2">
                        <a
                          [routerLink]="['/games', game.id]"
                          class="font-medium hover:text-primary"
                        >
                          {{ game.name }}
                        </a>
                      </td>
                      <td class="py-3 px-2">
                        <span hlmBadge variant="secondary">{{
                          game.genre
                        }}</span>
                      </td>
                      <td class="py-3 px-2 text-right text-primary font-medium">
                        {{
                          '$' +
                            formatNumber(
                              game.successMetrics?.revenueMonthly || 0
                            )
                        }}
                      </td>
                      <td class="py-3 px-2 text-right">
                        {{
                          formatNumber(
                            game.successMetrics?.concurrentPlayers || 0
                          )
                        }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class DashboardPage implements OnInit {
  readonly store = inject(GameStore);

  // Computed values from store
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

  ngOnInit() {
    // Load games if not already loaded
    if (this.store.games().length === 0) {
      this.store.loadGames();
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}
