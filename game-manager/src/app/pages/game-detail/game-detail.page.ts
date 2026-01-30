import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import {
  GameStore,
  GameFeatureFlags,
  SuccessMetricDto,
} from '@aiawi-ws/game-data';

interface SystemInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  sourcePath: string;
  version: string;
  status: string;
  documentation: string;
  configKeys: string[];
  linkedGames: string[];
  features: string[];
}

type TabId =
  | 'overview'
  | 'systems'
  | 'requirements'
  | 'settings'
  | 'tutorials'
  | 'docs';

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
    <div class="max-w-6xl mx-auto space-y-6">
      <a routerLink="/games" hlmBtn variant="ghost" size="sm"
        >← Back to Games</a
      >

      @if (store.loading()) {
        <div class="text-center py-12 text-muted-foreground">
          Loading game details...
        </div>
      } @else if (store.selectedGame(); as game) {
        <!-- Header -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start gap-4"
        >
          <div>
            <h1 class="text-2xl font-bold">{{ game.name }}</h1>
            <p class="text-muted-foreground">
              {{ game.developer }} • {{ game.genre }} • {{ game.platform }}
            </p>
          </div>
          <span hlmBadge [variant]="getBadgeVariant(game.ownership)">
            {{ game.ownership || 'Reference' }}
          </span>
        </div>

        <!-- Tab Navigation -->
        <div class="flex gap-2 border-b border-border pb-2 overflow-x-auto">
          @for (tab of tabs; track tab.id) {
            <button
              (click)="activeTab.set(tab.id)"
              class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap"
              [class]="
                activeTab() === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              "
            >
              {{ tab.icon }} {{ tab.label }}
              @if (tab.count) {
                <span
                  class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-background/50"
                >
                  {{ tab.count(game) }}
                </span>
              }
            </button>
          }
        </div>

        <!-- Tab Content -->
        <div class="min-h-[400px]">
          <!-- Overview Tab -->
          @if (activeTab() === 'overview') {
            <div class="space-y-6">
              <!-- Stats -->
              @if (game.successMetrics) {
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div hlmCard>
                    <div hlmCardContent class="pt-6 text-center">
                      <div class="text-2xl font-bold text-primary">
                        {{
                          '$' + formatNumber(game.successMetrics.revenueTotal)
                        }}
                      </div>
                      <div class="text-sm text-muted-foreground">
                        Total Revenue
                      </div>
                    </div>
                  </div>
                  <div hlmCard>
                    <div hlmCardContent class="pt-6 text-center">
                      <div class="text-2xl font-bold text-primary">
                        {{
                          '$' +
                            formatNumber(game.successMetrics.revenueMonthly)
                        }}/mo
                      </div>
                      <div class="text-sm text-muted-foreground">
                        Monthly Revenue
                      </div>
                    </div>
                  </div>
                  <div hlmCard>
                    <div hlmCardContent class="pt-6 text-center">
                      <div class="text-2xl font-bold">
                        {{ formatNumber(game.successMetrics.totalPlays) }}
                      </div>
                      <div class="text-sm text-muted-foreground">
                        Total Plays
                      </div>
                    </div>
                  </div>
                  <div hlmCard>
                    <div hlmCardContent class="pt-6 text-center">
                      <div class="text-2xl font-bold">
                        {{
                          formatNumber(game.successMetrics.concurrentPlayers)
                        }}
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
                        <div
                          class="flex-1 h-3 bg-muted rounded-full overflow-hidden"
                        >
                          <div
                            class="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all"
                            [style.width.%]="
                              getRetentionValue(game.successMetrics, day.key)
                            "
                          ></div>
                        </div>
                        <span class="w-12 text-right font-medium">
                          {{ getRetentionValue(game.successMetrics, day.key) }}%
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Feature Flags -->
              @if (game.featureFlags) {
                <div hlmCard>
                  <div hlmCardHeader>
                    <h3 hlmCardTitle>Feature Flags</h3>
                  </div>
                  <div hlmCardContent>
                    <div
                      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                    >
                      @for (
                        flag of getFeatureFlags(game.featureFlags);
                        track flag.key
                      ) {
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
            </div>
          }

          <!-- Requirements Tab -->
          @if (activeTab() === 'requirements') {
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">📋 Requirements & Tasks</h2>
                <button hlmBtn size="sm">+ Add Requirement</button>
              </div>

              @if (game.requirements?.length) {
                <div class="grid gap-4">
                  @for (req of game.requirements; track req.id) {
                    <div hlmCard>
                      <div hlmCardContent class="pt-4">
                        <div
                          class="flex flex-wrap justify-between items-start gap-2 mb-2"
                        >
                          <div class="flex items-center gap-2">
                            <span
                              hlmBadge
                              [variant]="getStatusVariant(req.status)"
                              class="text-xs"
                            >
                              {{ req.status }}
                            </span>
                            <span hlmBadge variant="outline" class="text-xs">
                              {{ req.category }}
                            </span>
                          </div>
                          <span
                            hlmBadge
                            [variant]="getPriorityVariant(req.priority)"
                            class="text-xs"
                          >
                            {{ req.priority }}
                          </span>
                        </div>
                        <h4 class="font-medium mb-1">{{ req.title }}</h4>
                        <p class="text-sm text-muted-foreground mb-3">
                          {{ req.description }}
                        </p>

                        @if (req.acceptanceCriteria?.length) {
                          <div class="mt-3 pt-3 border-t border-border">
                            <div
                              class="text-xs font-medium text-muted-foreground mb-2"
                            >
                              Acceptance Criteria:
                            </div>
                            <ul class="text-sm space-y-1">
                              @for (
                                criteria of req.acceptanceCriteria;
                                track criteria
                              ) {
                                <li class="flex items-start gap-2">
                                  <span class="text-muted-foreground">•</span>
                                  <span>{{ criteria }}</span>
                                </li>
                              }
                            </ul>
                          </div>
                        }

                        <div
                          class="flex gap-4 mt-3 text-xs text-muted-foreground"
                        >
                          @if (req.estimatedHours) {
                            <span>Est: {{ req.estimatedHours }}h</span>
                          }
                          @if (req.actualHours) {
                            <span>Actual: {{ req.actualHours }}h</span>
                          }
                          @if (req.assignee) {
                            <span>Assignee: {{ req.assignee }}</span>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div
                  class="text-center py-12 text-muted-foreground border border-dashed rounded-lg"
                >
                  No requirements yet. Click "+ Add Requirement" to get started.
                </div>
              }
            </div>
          }

          <!-- Settings Tab -->
          @if (activeTab() === 'settings') {
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">
                  ⚙️ Game Settings & Configuration
                </h2>
                <button hlmBtn size="sm">+ Add Setting</button>
              </div>

              @if (game.settings?.length) {
                <div class="grid gap-3">
                  @for (setting of game.settings; track setting.id) {
                    <div hlmCard>
                      <div hlmCardContent class="py-3">
                        <div
                          class="flex flex-wrap justify-between items-center gap-2"
                        >
                          <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                              <code
                                class="text-xs bg-muted px-2 py-0.5 rounded font-mono"
                              >
                                {{ setting.key }}
                              </code>
                              <span hlmBadge variant="outline" class="text-xs">
                                {{ setting.category }}
                              </span>
                              @if (!setting.isActive) {
                                <span
                                  hlmBadge
                                  variant="secondary"
                                  class="text-xs"
                                  >Inactive</span
                                >
                              }
                            </div>
                            <div class="font-medium">{{ setting.name }}</div>
                            <p class="text-sm text-muted-foreground">
                              {{ setting.description }}
                            </p>
                          </div>
                          <div class="text-right">
                            <div class="text-lg font-bold text-primary">
                              @if (setting.valueType === 'boolean') {
                                {{
                                  setting.value === 'true' ? '✓ ON' : '✗ OFF'
                                }}
                              } @else {
                                {{ setting.value }}
                              }
                            </div>
                            <div class="text-xs text-muted-foreground">
                              Default: {{ setting.defaultValue }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div
                  class="text-center py-12 text-muted-foreground border border-dashed rounded-lg"
                >
                  No settings configured. Click "+ Add Setting" to add game
                  configuration.
                </div>
              }
            </div>
          }

          <!-- Tutorials Tab -->
          @if (activeTab() === 'tutorials') {
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">🎓 Tutorials & Onboarding</h2>
                <button hlmBtn size="sm">+ Add Tutorial</button>
              </div>

              @if (game.tutorials?.length) {
                @for (
                  tutorial of groupTutorials(game.tutorials ?? []);
                  track tutorial.name
                ) {
                  <div hlmCard>
                    <div hlmCardHeader>
                      <h3 hlmCardTitle>{{ tutorial.name }}</h3>
                      <p class="text-sm text-muted-foreground">
                        {{ tutorial.steps.length }} steps
                      </p>
                    </div>
                    <div hlmCardContent>
                      <div class="space-y-3">
                        @for (step of tutorial.steps; track step.id) {
                          <div
                            class="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <div
                              class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold"
                            >
                              {{ step.stepNumber }}
                            </div>
                            <div class="flex-1">
                              <div class="flex items-center gap-2">
                                <span class="font-medium">{{
                                  step.title
                                }}</span>
                                <span
                                  hlmBadge
                                  variant="outline"
                                  class="text-xs"
                                  >{{ step.action }}</span
                                >
                                @if (step.isRequired) {
                                  <span class="text-xs text-destructive"
                                    >Required</span
                                  >
                                }
                              </div>
                              <p class="text-sm text-muted-foreground">
                                {{ step.instruction }}
                              </p>
                              @if (step.targetElement) {
                                <code class="text-xs mt-1 inline-block"
                                  >Target: {{ step.targetElement }}</code
                                >
                              }
                              @if (step.rewardOnComplete) {
                                <div class="text-xs text-green-600 mt-1">
                                  🎁 Reward: {{ step.rewardOnComplete }}
                                </div>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              } @else {
                <div
                  class="text-center py-12 text-muted-foreground border border-dashed rounded-lg"
                >
                  No tutorials created. Click "+ Add Tutorial" to start building
                  onboarding flows.
                </div>
              }
            </div>
          }

          <!-- Documentation Tab -->
          @if (activeTab() === 'docs') {
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">
                  📖 Documentation & Manuals
                </h2>
                <button hlmBtn size="sm">+ Add Document</button>
              </div>

              @if (game.documentation?.length) {
                <div class="grid md:grid-cols-2 gap-4">
                  @for (doc of game.documentation; track doc.id) {
                    <div
                      hlmCard
                      class="cursor-pointer hover:border-primary transition-colors"
                    >
                      <div hlmCardContent class="pt-4">
                        <div
                          class="flex items-start justify-between gap-2 mb-2"
                        >
                          <span hlmBadge variant="outline" class="text-xs">{{
                            doc.docType
                          }}</span>
                          <span class="text-xs text-muted-foreground"
                            >v{{ doc.version }}</span
                          >
                        </div>
                        <h4 class="font-medium mb-2">{{ doc.title }}</h4>
                        <p class="text-sm text-muted-foreground line-clamp-3">
                          {{ doc.content.substring(0, 200) }}...
                        </p>
                        <div class="flex gap-2 mt-3">
                          @for (tag of doc.tags?.slice(0, 3); track tag) {
                            <span
                              class="text-xs bg-muted px-2 py-0.5 rounded"
                              >{{ tag }}</span
                            >
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div
                  class="text-center py-12 text-muted-foreground border border-dashed rounded-lg"
                >
                  No documentation yet. Click "+ Add Document" to create game
                  design docs.
                </div>
              }
            </div>
          }

          <!-- Systems Tab -->
          @if (activeTab() === 'systems') {
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">
                  🔧 Linked Systems (from roblox-core)
                </h2>
                <a
                  href="vscode://file/c:/ws/aiawi-ws/libs/roblox-core"
                  class="text-sm text-primary hover:underline"
                >
                  Open in VS Code →
                </a>
              </div>

              @if (linkedSystems().length) {
                <div class="grid gap-4">
                  @for (system of linkedSystems(); track system.id) {
                    <div hlmCard>
                      <div hlmCardContent class="pt-4">
                        <div
                          class="flex flex-wrap justify-between items-start gap-2 mb-2"
                        >
                          <div class="flex items-center gap-2">
                            <span hlmBadge variant="default" class="text-xs">{{
                              system.category
                            }}</span>
                            <span hlmBadge variant="outline" class="text-xs"
                              >v{{ system.version }}</span
                            >
                            <span
                              hlmBadge
                              [variant]="
                                system.status === 'Production'
                                  ? 'default'
                                  : 'secondary'
                              "
                              class="text-xs"
                            >
                              {{ system.status }}
                            </span>
                          </div>
                        </div>
                        <h4 class="font-medium mb-1">{{ system.name }}</h4>
                        <p class="text-sm text-muted-foreground mb-3">
                          {{ system.description }}
                        </p>

                        <!-- Source Path -->
                        <div class="text-xs mb-3">
                          <span class="text-muted-foreground">Source: </span>
                          <code class="bg-muted px-1 py-0.5 rounded">{{
                            system.sourcePath
                          }}</code>
                        </div>

                        <!-- Config Keys -->
                        @if (system.configKeys?.length) {
                          <div class="mb-3">
                            <div
                              class="text-xs font-medium text-muted-foreground mb-1"
                            >
                              Config Keys:
                            </div>
                            <div class="flex flex-wrap gap-1">
                              @for (key of system.configKeys; track key) {
                                <code
                                  class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                                  >{{ key }}</code
                                >
                              }
                            </div>
                          </div>
                        }

                        <!-- Features -->
                        @if (system.features?.length) {
                          <div class="pt-3 border-t border-border">
                            <div
                              class="text-xs font-medium text-muted-foreground mb-2"
                            >
                              Features:
                            </div>
                            <div class="flex flex-wrap gap-2">
                              @for (feature of system.features; track feature) {
                                <span class="text-xs bg-muted px-2 py-1 rounded"
                                  >✓ {{ feature }}</span
                                >
                              }
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div
                  class="text-center py-12 text-muted-foreground border border-dashed rounded-lg"
                >
                  No systems linked to this game yet.
                </div>
              }
            </div>
          }
        </div>
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
  private http = inject(HttpClient);
  readonly store = inject(GameStore);

  activeTab = signal<TabId>('overview');
  allSystems = signal<SystemInfo[]>([]);
  linkedSystems = signal<SystemInfo[]>([]);

  tabs: {
    id: TabId;
    label: string;
    icon: string;
    count?: (game: any) => number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    {
      id: 'systems',
      label: 'Systems',
      icon: '🔧',
      count: () => this.linkedSystems().length,
    },
    {
      id: 'requirements',
      label: 'Requirements',
      icon: '📋',
      count: (g) => g.requirements?.length || 0,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      count: (g) => g.settings?.length || 0,
    },
    {
      id: 'tutorials',
      label: 'Tutorials',
      icon: '🎓',
      count: (g) => g.tutorials?.length || 0,
    },
    {
      id: 'docs',
      label: 'Documentation',
      icon: '📖',
      count: (g) => g.documentation?.length || 0,
    },
  ];

  retentionDays = [
    { label: 'Day 1', key: 'retentionRateDay1' },
    { label: 'Day 7', key: 'retentionRateDay7' },
    { label: 'Day 30', key: 'retentionRateDay30' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.loadGame(id);
      this.loadSystems(id);
    }
  }

  private loadSystems(gameId: string) {
    this.http
      .get<{ systems: SystemInfo[] }>('http://localhost:3333/api/systems')
      .subscribe({
        next: (response) => {
          this.allSystems.set(response.systems || []);
          const linked = (response.systems || []).filter((s) =>
            s.linkedGames?.includes(gameId),
          );
          this.linkedSystems.set(linked);
        },
        error: () => {
          // Systems API not available yet
          this.linkedSystems.set([]);
        },
      });
  }

  groupTutorials(tutorials: any[]): { name: string; steps: any[] }[] {
    const grouped = tutorials.reduce(
      (acc, step) => {
        const name = step.tutorialName || 'Unnamed Tutorial';
        if (!acc[name]) acc[name] = [];
        acc[name].push(step);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return Object.entries(grouped).map(([name, steps]) => ({
      name,
      steps: (steps as any[]).sort((a, b) => a.stepNumber - b.stepNumber),
    }));
  }

  getRetentionValue(metrics: SuccessMetricDto, key: string): number {
    return (metrics as unknown as Record<string, number>)[key] || 0;
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

  getStatusVariant(
    status: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'Done':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  getPriorityVariant(
    priority: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (priority) {
      case 'Must Have':
        return 'destructive';
      case 'Should Have':
        return 'default';
      case 'Nice to Have':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  getFeatureFlags(
    flags: GameFeatureFlags,
  ): { key: string; label: string; value: boolean }[] {
    const labelMap: Record<string, string> = {
      hasCollectionSystem: 'Collection System',
      hasTradingSystem: 'Trading System',
      hasProgressionSystem: 'Progression',
      hasCraftingSystem: 'Crafting',
      hasBuildingSystem: 'Building',
      hasMultiplayer: 'Multiplayer',
      hasGuilds: 'Guilds',
      hasChat: 'Chat',
      hasFriendSystem: 'Friends',
      hasLeaderboards: 'Leaderboards',
      hasInAppPurchases: 'IAP',
      hasGachaSystem: 'Gacha',
      hasSeasonPass: 'Season Pass',
      hasAds: 'Ads',
      hasVIPSystem: 'VIP',
      hasLevelSystem: 'Levels',
      hasSkillTree: 'Skills',
      hasAchievements: 'Achievements',
      hasQuests: 'Quests',
      hasDailies: 'Daily Rewards',
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
