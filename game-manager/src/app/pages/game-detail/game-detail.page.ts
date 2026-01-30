import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
  imports: [CommonModule, RouterLink],
  template: `
    <div class="game-detail">
      <a routerLink="/games" class="back-link">← Back to Games</a>

      @if (loading()) {
        <div class="loading">Loading game details...</div>
      } @else if (game()) {
        <div class="game-header">
          <div>
            <h1>{{ game()!.name }}</h1>
            <p class="meta">
              {{ game()!.developer }} • {{ game()!.genre }} •
              {{ game()!.platform }}
            </p>
          </div>
          <span class="badge" [class]="getOwnershipClass(game()!.ownership)">
            {{ game()!.ownership || 'Reference' }}
          </span>
        </div>

        <!-- Stats -->
        @if (game()!.successMetrics) {
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-value"
                >\${{ formatNumber(game()!.successMetrics.revenueTotal) }}</span
              >
              <span class="stat-label">Total Revenue</span>
            </div>
            <div class="stat-card">
              <span class="stat-value"
                >\${{
                  formatNumber(game()!.successMetrics.revenueMonthly)
                }}/mo</span
              >
              <span class="stat-label">Monthly Revenue</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{
                formatNumber(game()!.successMetrics.totalPlays)
              }}</span>
              <span class="stat-label">Total Plays</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{
                formatNumber(game()!.successMetrics.concurrentPlayers)
              }}</span>
              <span class="stat-label">Concurrent Players</span>
            </div>
          </div>

          <div class="retention-section">
            <h2>Retention Rates</h2>
            <div class="retention-bars">
              <div class="retention-bar">
                <span class="label">Day 1</span>
                <div class="bar-bg">
                  <div
                    class="bar-fill"
                    [style.width.%]="game()!.successMetrics.retentionRateDay1"
                  ></div>
                </div>
                <span class="value"
                  >{{ game()!.successMetrics.retentionRateDay1 }}%</span
                >
              </div>
              <div class="retention-bar">
                <span class="label">Day 7</span>
                <div class="bar-bg">
                  <div
                    class="bar-fill"
                    [style.width.%]="game()!.successMetrics.retentionRateDay7"
                  ></div>
                </div>
                <span class="value"
                  >{{ game()!.successMetrics.retentionRateDay7 }}%</span
                >
              </div>
              <div class="retention-bar">
                <span class="label">Day 30</span>
                <div class="bar-bg">
                  <div
                    class="bar-fill"
                    [style.width.%]="game()!.successMetrics.retentionRateDay30"
                  ></div>
                </div>
                <span class="value"
                  >{{ game()!.successMetrics.retentionRateDay30 }}%</span
                >
              </div>
            </div>
          </div>
        }

        <!-- Features -->
        @if (game()!.features?.length) {
          <div class="section">
            <h2>Features</h2>
            <div class="features-grid">
              @for (feature of game()!.features; track feature.id) {
                <div class="feature-card">
                  <div class="feature-header">
                    <h3>{{ feature.name }}</h3>
                    <span
                      class="importance-badge"
                      [class]="feature.importance.toLowerCase()"
                    >
                      {{ feature.importance }}
                    </span>
                  </div>
                  <p>{{ feature.description }}</p>
                  <div class="feature-scores">
                    <div class="score">
                      <span class="score-label">Engagement</span>
                      <span class="score-value"
                        >{{ feature.userEngagementImpact }}/10</span
                      >
                    </div>
                    <div class="score">
                      <span class="score-label">Monetization</span>
                      <span class="score-value"
                        >{{ feature.monetizationPotential }}/10</span
                      >
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Feature Flags -->
        @if (game()!.featureFlags) {
          <div class="section">
            <h2>Feature Flags</h2>
            <div class="flags-grid">
              @for (flag of getFeatureFlags(); track flag.key) {
                <div class="flag" [class.enabled]="flag.value">
                  <span class="flag-icon">{{ flag.value ? '✓' : '✗' }}</span>
                  <span class="flag-name">{{ flag.label }}</span>
                </div>
              }
            </div>
          </div>
        }
      } @else {
        <div class="error">Game not found</div>
      }
    </div>
  `,
  styles: `
    .game-detail {
      max-width: 1200px;
      margin: 0 auto;
    }

    .back-link {
      display: inline-block;
      color: oklch(0.6 0.2 260);
      text-decoration: none;
      margin-bottom: 1.5rem;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .game-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .meta {
      color: var(--text-secondary, #666);
      margin: 0;
    }

    .badge {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      border-radius: 9999px;
    }

    .badge.our-game {
      background: oklch(0.65 0.2 145 / 0.2);
      color: oklch(0.5 0.2 145);
    }
    .badge.competitor {
      background: oklch(0.6 0.25 25 / 0.2);
      color: oklch(0.5 0.25 25);
    }
    .badge.reference {
      background: oklch(0.6 0.2 260 / 0.2);
      color: oklch(0.5 0.2 260);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      padding: 1.25rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.75rem;
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: oklch(0.6 0.2 260);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
    }

    .retention-section {
      margin-bottom: 2rem;
    }

    .retention-section h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .retention-bars {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .retention-bar {
      display: grid;
      grid-template-columns: 80px 1fr 60px;
      align-items: center;
      gap: 1rem;
    }

    .bar-bg {
      height: 24px;
      background: var(--bg-secondary, #f5f5f5);
      border-radius: 12px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(
        90deg,
        oklch(0.6 0.2 260),
        oklch(0.65 0.2 145)
      );
      border-radius: 12px;
      transition: width 0.5s ease;
    }

    .section {
      margin-bottom: 2rem;
    }

    .section h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .feature-card {
      padding: 1.25rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.75rem;
    }

    .feature-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .feature-header h3 {
      margin: 0;
      font-size: 1rem;
    }

    .importance-badge {
      padding: 0.25rem 0.5rem;
      font-size: 0.7rem;
      font-weight: 600;
      border-radius: 0.25rem;
    }

    .importance-badge.critical {
      background: oklch(0.6 0.25 25 / 0.2);
      color: oklch(0.5 0.25 25);
    }
    .importance-badge.high {
      background: oklch(0.7 0.2 60 / 0.2);
      color: oklch(0.55 0.2 60);
    }
    .importance-badge.medium {
      background: oklch(0.7 0.15 200 / 0.2);
      color: oklch(0.5 0.15 200);
    }
    .importance-badge.low {
      background: var(--bg-tertiary, #eee);
      color: var(--text-secondary, #666);
    }

    .feature-card p {
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      margin: 0 0 1rem 0;
    }

    .feature-scores {
      display: flex;
      gap: 1rem;
    }

    .score {
      display: flex;
      flex-direction: column;
    }

    .score-label {
      font-size: 0.75rem;
      color: var(--text-secondary, #666);
    }

    .score-value {
      font-weight: 600;
    }

    .flags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.5rem;
    }

    .flag {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--bg-secondary, #f5f5f5);
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .flag.enabled {
      background: oklch(0.65 0.2 145 / 0.1);
    }

    .flag-icon {
      font-size: 0.875rem;
    }

    .flag.enabled .flag-icon {
      color: oklch(0.5 0.2 145);
    }

    .loading,
    .error {
      padding: 3rem;
      text-align: center;
      color: var(--text-secondary, #666);
    }
  `,
})
export class GameDetailPage implements OnInit {
  private route = inject(ActivatedRoute);

  loading = signal(true);
  game = signal<GameData | null>(null);

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

  getOwnershipClass(ownership: string | undefined): string {
    if (!ownership) return 'reference';
    return ownership.toLowerCase().replace(' ', '-');
  }

  getFeatureFlags(): { key: string; label: string; value: boolean }[] {
    const flags = this.game()?.featureFlags;
    if (!flags) return [];

    const labelMap: Record<string, string> = {
      hasCollectionSystem: 'Collection System',
      hasTradingSystem: 'Trading System',
      hasProgressionSystem: 'Progression System',
      hasCraftingSystem: 'Crafting System',
      hasBuildingSystem: 'Building System',
      hasMultiplayer: 'Multiplayer',
      hasGuildSystem: 'Guild System',
      hasChatSystem: 'Chat System',
      hasFriendsSystem: 'Friends System',
      hasLeaderboards: 'Leaderboards',
      hasInAppPurchases: 'In-App Purchases',
      hasGachaSystem: 'Gacha System',
      hasSeasonPass: 'Season Pass',
      hasAds: 'Ads',
      hasVIPSystem: 'VIP System',
      hasLevelSystem: 'Level System',
      hasSkillTree: 'Skill Tree',
      hasAchievements: 'Achievements',
      hasQuestSystem: 'Quest System',
      hasDailyRewards: 'Daily Rewards',
      hasProceduralGeneration: 'Procedural Gen',
      hasStoryMode: 'Story Mode',
      hasPvP: 'PvP',
      hasPvE: 'PvE',
      hasRaids: 'Raids',
      hasCharacterCustomization: 'Character Custom',
      hasHousingSystem: 'Housing System',
      hasSkinSystem: 'Skin System',
      hasEmotes: 'Emotes',
      hasVirtualCurrency: 'Virtual Currency',
      hasMarketplace: 'Marketplace',
      hasAuctionHouse: 'Auction House',
      hasCrossPlatform: 'Cross-Platform',
      hasCloudSaves: 'Cloud Saves',
      hasOfflineProgress: 'Offline Progress',
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
