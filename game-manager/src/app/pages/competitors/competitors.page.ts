import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

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
  selector: 'app-competitors',
  standalone: true,
  imports: [CommonModule, RouterLink, HlmCardImports, HlmBadgeImports],
  template: `
    <div class="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Competitors</h1>
        <p class="text-muted-foreground">Track and analyze competitor games</p>
      </div>

      @if (loading()) {
        <div class="text-center py-12 text-muted-foreground">
          Loading competitors...
        </div>
      } @else if (competitors().length === 0) {
        <div class="text-center py-12 text-muted-foreground">
          No competitors found
        </div>
      } @else {
        <div class="space-y-3">
          @for (game of competitors(); track game.id; let i = $index) {
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
  loading = signal(true);
  competitors = signal<Game[]>([]);

  ngOnInit() {
    this.loadCompetitors();
  }

  async loadCompetitors() {
    try {
      const response = await fetch('http://localhost:3333/api/games');
      const data = await response.json();
      const games: Game[] = (data.items || []).filter(
        (g: Game) => g.ownership === 'Competitor',
      );

      const sorted = games.sort(
        (a, b) =>
          (b.successMetrics?.revenueMonthly || 0) -
          (a.successMetrics?.revenueMonthly || 0),
      );
      this.competitors.set(sorted);
    } catch (error) {
      console.error('Failed to load competitors:', error);
    } finally {
      this.loading.set(false);
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}
