import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { GameStore } from '@aiawi-ws/game-data';

@Component({
  selector: 'app-competitors',
  standalone: true,
  imports: [CommonModule, RouterLink, HlmCardImports, HlmBadgeImports],
  template: `
    <div class="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Competitors</h1>
        <p class="text-muted-foreground">Track and analyze competitor games</p>
      </div>

      @if (store.loading()) {
        <div class="text-center py-12 text-muted-foreground">
          Loading competitors...
        </div>
      } @else if (store.competitorGames().length === 0) {
        <div class="text-center py-12 text-muted-foreground">
          No competitors found
        </div>
      } @else {
        <div class="space-y-3">
          @for (game of sortedCompetitors(); track game.id; let i = $index) {
            <a
              [routerLink]="['/games', game.id]"
              hlmCard
              class="block hover:border-primary transition-colors"
            >
              <div hlmCardContent class="flex items-center gap-4 py-4">
                <div
                  class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold"
                >
                  {{ i + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium truncate">{{ game.name }}</h3>
                  <p class="text-sm text-muted-foreground">
                    {{ game.developer }} • {{ game.genre }}
                  </p>
                </div>
                <div class="hidden sm:flex items-center gap-6 text-sm">
                  <div class="text-right">
                    <div class="font-semibold text-primary">
                      {{
                        '$' +
                          formatNumber(
                            game.successMetrics?.revenueMonthly || 0
                          )
                      }}/mo
                    </div>
                    <div class="text-muted-foreground">Revenue</div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold">
                      {{
                        formatNumber(
                          game.successMetrics?.concurrentPlayers || 0
                        )
                      }}
                    </div>
                    <div class="text-muted-foreground">Players</div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold">
                      {{ game.successMetrics?.retentionRateDay1 || 0 }}%
                    </div>
                    <div class="text-muted-foreground">D1 Ret.</div>
                  </div>
                </div>
                <span
                  hlmBadge
                  variant="secondary"
                  class="hidden md:inline-flex"
                  >{{ game.platform }}</span
                >
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class CompetitorsPage implements OnInit {
  readonly store = inject(GameStore);

  ngOnInit() {
    if (this.store.games().length === 0) {
      this.store.loadGames();
    }
  }

  sortedCompetitors() {
    return [...this.store.competitorGames()].sort(
      (a, b) =>
        (b.successMetrics?.revenueMonthly || 0) -
        (a.successMetrics?.revenueMonthly || 0),
    );
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}
