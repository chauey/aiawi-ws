import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

interface GameData {
  id: string;
  name: string;
  developer: string;
  genre: string;
  platform: string;
  ownership?: string;
  successMetrics?: {
    revenueTotal: number;
    revenueMonthly: number;
    totalPlays: number;
    concurrentPlayers: number;
    retentionRateDay1: number;
    retentionRateDay7: number;
    retentionRateDay30: number;
  };
  features?: Array<{
    id: string;
    name: string;
    description: string;
    importance: string;
    userEngagementImpact: number;
    monetizationPotential: number;
  }>;
  featureFlags?: Record<string, boolean>;
}

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
  ],
  template: `
    <div class="max-w-5xl mx-auto space-y-6">
      <a routerLink="/games" hlmBtn variant="ghost" size="sm"
        >← Back to Games</a
      >

      @if (loading()) {
        <div class="text-center py-12 text-muted-foreground">
          Loading game details...
        </div>
      } @else if (game()) {
        <!-- Header -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start gap-4"
        >
          <div>
            <h1 class="text-2xl font-bold">{{ game()!.name }}</h1>
            <p class="text-muted-foreground">
              {{ game()!.developer }} • {{ game()!.genre }} •
              {{ game()!.platform }}
            </p>
          </div>
          <span hlmBadge [variant]="getBadgeVariant(game()!.ownership)">
            {{ game()!.ownership || 'Reference' }}
          </span>
        </div>

        <!-- Stats -->
        @if (game()!.successMetrics) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div hlmCard>
              <div hlmCardContent class="pt-6 text-center">
                <div class="text-2xl font-bold text-primary">
                  {{ '$' + formatNumber(game()!.successMetrics!.revenueTotal) }}
                </div>
                <div class="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>
            <div hlmCard>
              <div hlmCardContent class="pt-6 text-center">
                <div class="text-2xl font-bold text-primary">
                  {{
                    '$' + formatNumber(game()!.successMetrics!.revenueMonthly)
                  }}/mo
                </div>
                <div class="text-sm text-muted-foreground">Monthly Revenue</div>
              </div>
            </div>
            <div hlmCard>
              <div hlmCardContent class="pt-6 text-center">
                <div class="text-2xl font-bold">
                  {{ formatNumber(game()!.successMetrics!.totalPlays) }}
                </div>
                <div class="text-sm text-muted-foreground">Total Plays</div>
              </div>
            </div>
            <div hlmCard>
              <div hlmCardContent class="pt-6 text-center">
                <div class="text-2xl font-bold">
                  {{ formatNumber(game()!.successMetrics!.concurrentPlayers) }}
                </div>
                <div class="text-sm text-muted-foreground">
                  Concurrent Players
                </div>
              </div>
            </div>
          </div>

          <!-- Retention -->
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Retention Rates</h3>
            </div>
            <div hlmCardContent class="space-y-4">
              @for (day of retentionDays; track day.label) {
                <div class="flex items-center gap-4">
                  <span class="w-16 text-sm text-muted-foreground">{{
                    day.label
                  }}</span>
                  <div class="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all"
                      [style.width.%]="getRetentionValue(day.key)"
                    ></div>
                  </div>
                  <span class="w-12 text-right font-medium">
                    {{ getRetentionValue(day.key) }}%
                  </span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Features -->
        @if (game()!.features?.length) {
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Features</h3>
            </div>
            <div hlmCardContent>
              <div class="grid md:grid-cols-2 gap-4">
                @for (feature of game()!.features; track feature.id) {
                  <div class="p-4 border rounded-lg">
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-medium">{{ feature.name }}</h4>
                      <span
                        hlmBadge
                        [variant]="getImportanceVariant(feature.importance)"
                        class="text-xs"
                      >
                        {{ feature.importance }}
                      </span>
                    </div>
                    <p class="text-sm text-muted-foreground mb-3">
                      {{ feature.description }}
                    </p>
                    <div class="flex gap-4 text-sm">
                      <div>
                        <span class="text-muted-foreground">Engagement:</span>
                        <span class="font-medium ml-1"
                          >{{ feature.userEngagementImpact }}/10</span
                        >
                      </div>
                      <div>
                        <span class="text-muted-foreground">Monetization:</span>
                        <span class="font-medium ml-1"
                          >{{ feature.monetizationPotential }}/10</span
                        >
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Feature Flags -->
        @if (game()!.featureFlags) {
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Feature Flags</h3>
            </div>
            <div hlmCardContent>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                @for (flag of getFeatureFlags(); track flag.key) {
                  <div
                    class="flex items-center gap-2 p-2 rounded text-sm"
                    [class]="
                      flag.value
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    "
                  >
                    <span>{{ flag.value ? '✓' : '✗' }}</span>
                    <span>{{ flag.label }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="text-center py-12 text-muted-foreground">
          Game not found
        </div>
      }
    </div>
  `,
})
export class GameDetailPage implements OnInit {
  private route = inject(ActivatedRoute);

  loading = signal(true);
  game = signal<GameData | null>(null);

  retentionDays = [
    { label: 'Day 1', key: 'retentionRateDay1' },
    { label: 'Day 7', key: 'retentionRateDay7' },
    { label: 'Day 30', key: 'retentionRateDay30' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGame(id);
    }
  }

  async loadGame(id: string) {
    try {
      const response = await fetch(`http://localhost:3333/api/games/${id}`);
      const data = await response.json();
      this.game.set(data);
    } catch (error) {
      console.error('Failed to load game:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getRetentionValue(key: string): number {
    const metrics = this.game()?.successMetrics;
    if (!metrics) return 0;
    return (metrics as Record<string, number>)[key] || 0;
  }

  getBadgeVariant(
    ownership: string | undefined,
  ): 'default' | 'secondary' | 'destructive' {
    switch (ownership) {
      case 'Our Game':
        return 'default';
      case 'Competitor':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  getImportanceVariant(
    importance: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (importance.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      default:
        return 'secondary';
    }
  }

  getFeatureFlags(): { key: string; label: string; value: boolean }[] {
    const flags = this.game()?.featureFlags;
    if (!flags) return [];

    const labelMap: Record<string, string> = {
      hasCollectionSystem: 'Collection System',
      hasTradingSystem: 'Trading System',
      hasProgressionSystem: 'Progression',
      hasCraftingSystem: 'Crafting',
      hasBuildingSystem: 'Building',
      hasMultiplayer: 'Multiplayer',
      hasGuildSystem: 'Guilds',
      hasChatSystem: 'Chat',
      hasFriendsSystem: 'Friends',
      hasLeaderboards: 'Leaderboards',
      hasInAppPurchases: 'IAP',
      hasGachaSystem: 'Gacha',
      hasSeasonPass: 'Season Pass',
      hasAds: 'Ads',
      hasVIPSystem: 'VIP',
      hasLevelSystem: 'Levels',
      hasSkillTree: 'Skills',
      hasAchievements: 'Achievements',
      hasQuestSystem: 'Quests',
      hasDailyRewards: 'Daily Rewards',
      hasPvP: 'PvP',
      hasPvE: 'PvE',
    };

    return Object.entries(flags)
      .filter(([key]) => labelMap[key])
      .map(([key, value]) => ({
        key,
        label: labelMap[key] || key,
        value: value as boolean,
      }));
  }

  formatNumber(num: number): string {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}
