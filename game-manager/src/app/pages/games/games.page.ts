import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

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
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmCardImports,
    HlmBadgeImports,
    BrnSelectImports,
    HlmSelectImports,
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
      >
        <div>
          <h1 class="text-2xl font-bold">Games Database</h1>
          <p class="text-muted-foreground">
            Browse and manage all tracked games
          </p>
        </div>
        <button hlmBtn>+ Add Game</button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-6">
        <input
          hlmInput
          type="text"
          placeholder="Search games..."
          [formControl]="searchControl"
          class="flex-1 min-w-[200px]"
        />

        <brn-select [formControl]="genreControl" placeholder="All Genres">
          <hlm-select-trigger class="w-[150px]">
            <hlm-select-value />
          </hlm-select-trigger>
          <hlm-select-content>
            <hlm-option value="">All Genres</hlm-option>
            @for (genre of genres(); track genre) {
              <hlm-option [value]="genre">{{ genre }}</hlm-option>
            }
          </hlm-select-content>
        </brn-select>

        <brn-select [formControl]="ownershipControl" placeholder="All Types">
          <hlm-select-trigger class="w-[150px]">
            <hlm-select-value />
          </hlm-select-trigger>
          <hlm-select-content>
            <hlm-option value="">All Types</hlm-option>
            <hlm-option value="Our Game">Our Games</hlm-option>
            <hlm-option value="Competitor">Competitors</hlm-option>
            <hlm-option value="Reference">Reference</hlm-option>
          </hlm-select-content>
        </brn-select>
      </div>

      <!-- Games Grid -->
      @if (loading()) {
        <div class="text-center py-12 text-muted-foreground">
          Loading games...
        </div>
      } @else if (filteredGames().length === 0) {
        <div class="text-center py-12 text-muted-foreground">
          No games found
        </div>
      } @else {
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          @for (game of filteredGames(); track game.id) {
            <a
              [routerLink]="['/games', game.id]"
              hlmCard
              class="block hover:border-primary transition-colors"
            >
              <div hlmCardHeader class="pb-2">
                <div class="flex justify-between items-start gap-2">
                  <h3 hlmCardTitle class="text-base">{{ game.name }}</h3>
                  <span hlmBadge [variant]="getBadgeVariant(game.ownership)">
                    {{ game.ownership || 'Reference' }}
                  </span>
                </div>
                <p hlmCardDescription>
                  {{ game.developer }} • {{ game.genre }}
                </p>
              </div>

              @if (game.successMetrics) {
                <div hlmCardContent class="pt-0">
                  <div class="grid grid-cols-3 gap-2 p-3 bg-muted rounded-lg">
                    <div class="text-center">
                      <div class="text-sm font-semibold">
                        {{
                          '$' +
                            formatNumber(game.successMetrics.revenueMonthly)
                        }}/mo
                      </div>
                      <div class="text-xs text-muted-foreground">Revenue</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm font-semibold">
                        {{
                          formatNumber(game.successMetrics.concurrentPlayers)
                        }}
                      </div>
                      <div class="text-xs text-muted-foreground">Players</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm font-semibold">
                        {{ game.successMetrics.retentionRateDay1 }}%
                      </div>
                      <div class="text-xs text-muted-foreground">D1 Ret.</div>
                    </div>
                  </div>
                </div>
              }

              <div hlmCardFooter class="pt-2">
                <span class="text-xs px-2 py-1 bg-secondary rounded">{{
                  game.platform
                }}</span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class GamesPage implements OnInit {
  private fb = inject(FormBuilder);

  loading = signal(true);
  games = signal<Game[]>([]);
  genres = signal<string[]>([]);

  searchControl = this.fb.control('');
  genreControl = this.fb.control('');
  ownershipControl = this.fb.control('');

  filteredGames = computed(() => {
    let filtered = this.games();
    const search = this.searchControl.value?.toLowerCase() || '';
    const genre = this.genreControl.value || '';
    const ownership = this.ownershipControl.value || '';

    if (search) {
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(search) ||
          g.developer.toLowerCase().includes(search),
      );
    }
    if (genre) {
      filtered = filtered.filter((g) => g.genre === genre);
    }
    if (ownership) {
      filtered = filtered.filter((g) => g.ownership === ownership);
    }
    return filtered;
  });

  ngOnInit() {
    this.loadGames();

    // Subscribe to form changes to trigger recompute
    this.searchControl.valueChanges.subscribe(() => this.filteredGames());
    this.genreControl.valueChanges.subscribe(() => this.filteredGames());
    this.ownershipControl.valueChanges.subscribe(() => this.filteredGames());
  }

  async loadGames() {
    try {
      const response = await fetch('http://localhost:3333/api/games');
      const data = await response.json();
      const games = data.items || [];

      this.games.set(games);

      const uniqueGenres = [...new Set(games.map((g: Game) => g.genre))]
        .filter(Boolean)
        .sort() as string[];
      this.genres.set(uniqueGenres);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getBadgeVariant(
    ownership: string | undefined,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (ownership) {
      case 'Our Game':
        return 'default';
      case 'Competitor':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}
