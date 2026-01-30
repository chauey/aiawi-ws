import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { GameStore } from '@aiawi-ws/game-data';

interface FeatureAnalysis {
  name: string;
  count: number;
  percentage: number;
}

interface SystemAnalysis {
  name: string;
  games: string[];
  avgEngagement: number;
  avgMonetization: number;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmBadgeImports],
  template: `
    <div class="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Feature Analysis</h1>
        <p class="text-muted-foreground">
          Compare feature adoption across games
        </p>
      </div>

      @if (store.loading()) {
        <div class="text-center py-12 text-muted-foreground">
          Loading features...
        </div>
      } @else {
        <!-- Feature Flags Adoption -->
        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Feature Flag Adoption</h3>
            <p hlmCardDescription>
              How common are these features across tracked games?
            </p>
          </div>
          <div hlmCardContent>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              @for (feature of featureAdoption(); track feature.name) {
                <div
                  class="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <span class="text-sm">{{ feature.name }}</span>
                  <div class="flex items-center gap-2">
                    <div
                      class="w-20 h-2 bg-background rounded-full overflow-hidden"
                    >
                      <div
                        class="h-full bg-primary rounded-full"
                        [style.width.%]="feature.percentage"
                      ></div>
                    </div>
                    <span hlmBadge variant="outline" class="text-xs">
                      {{ feature.percentage }}%
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- System Analysis -->
        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Game Systems Analysis</h3>
            <p hlmCardDescription>Detailed breakdown of implemented systems</p>
          </div>
          <div hlmCardContent>
            <div class="grid md:grid-cols-2 gap-4">
              @for (system of systemAnalysis(); track system.name) {
                <div class="p-4 border rounded-lg">
                  <div class="flex justify-between items-start mb-3">
                    <h4 class="font-medium">{{ system.name }}</h4>
                    <span hlmBadge variant="secondary"
                      >{{ system.games.length }} games</span
                    >
                  </div>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div class="text-muted-foreground">Avg Engagement</div>
                      <div class="font-semibold text-lg">
                        {{ system.avgEngagement.toFixed(1) }}/10
                      </div>
                    </div>
                    <div>
                      <div class="text-muted-foreground">Avg Monetization</div>
                      <div class="font-semibold text-lg">
                        {{ system.avgMonetization.toFixed(1) }}/10
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 text-xs text-muted-foreground">
                    Used by: {{ system.games.slice(0, 3).join(', ')
                    }}{{ system.games.length > 3 ? '...' : '' }}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class FeaturesPage implements OnInit {
  readonly store = inject(GameStore);

  private readonly labelMap: Record<string, string> = {
    hasCollectionSystem: 'Collection',
    hasTradingSystem: 'Trading',
    hasMultiplayer: 'Multiplayer',
    hasLeaderboards: 'Leaderboards',
    hasInAppPurchases: 'In-App Purchases',
    hasSeasonPass: 'Season Pass',
    hasDailyRewards: 'Daily Rewards',
    hasPvP: 'PvP',
    hasPvE: 'PvE',
    hasGuildSystem: 'Guilds',
  };

  featureAdoption = computed<FeatureAnalysis[]>(() => {
    const games = this.store.games();
    const flagCounts: Record<string, number> = {};

    games.forEach((game) => {
      if (game.featureFlags) {
        Object.entries(game.featureFlags).forEach(([key, value]) => {
          if (value && this.labelMap[key]) {
            flagCounts[this.labelMap[key]] =
              (flagCounts[this.labelMap[key]] || 0) + 1;
          }
        });
      }
    });

    const totalGames = games.length || 1;
    return Object.entries(flagCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalGames) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  });

  systemAnalysis = computed<SystemAnalysis[]>(() => {
    const games = this.store.games();
    const systems: Record<string, SystemAnalysis> = {};

    games.forEach((game) => {
      game.features?.forEach((feature) => {
        const category = feature.category || 'Other';
        if (!systems[category]) {
          systems[category] = {
            name: category,
            games: [],
            avgEngagement: 0,
            avgMonetization: 0,
          };
        }
        if (!systems[category].games.includes(game.name)) {
          systems[category].games.push(game.name);
        }
        systems[category].avgEngagement += feature.userEngagementImpact;
        systems[category].avgMonetization += feature.monetizationPotential;
      });
    });

    return Object.values(systems).map((s) => ({
      ...s,
      avgEngagement: s.avgEngagement / (s.games.length || 1),
      avgMonetization: s.avgMonetization / (s.games.length || 1),
    }));
  });

  ngOnInit() {
    if (this.store.games().length === 0) {
      this.store.loadGames();
    }
  }
}
