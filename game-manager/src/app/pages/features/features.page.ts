import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FeatureAnalysis {
  name: string;
  gamesCount: number;
  avgEngagement: number;
  avgMonetization: number;
  topGames: string[];
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="features-page">
      <div class="page-header">
        <h1>Feature Analysis</h1>
        <p>Compare features across games to identify winning patterns</p>
      </div>

      <!-- Feature Flags Overview -->
      <div class="section">
        <h2>Feature Adoption</h2>
        <div class="flags-grid">
          @for (flag of featureFlags(); track flag.name) {
            <div class="flag-card" [class.popular]="flag.percentage >= 60">
              <div class="flag-header">
                <span class="flag-name">{{ flag.name }}</span>
                <span class="flag-percentage">{{ flag.percentage }}%</span>
              </div>
              <div class="flag-bar">
                <div class="flag-fill" [style.width.%]="flag.percentage"></div>
              </div>
              <span class="flag-count"
                >{{ flag.count }} / {{ totalGames() }} games</span
              >
            </div>
          }
        </div>
      </div>

      <!-- Feature Details -->
      <div class="section">
        <h2>Featured Systems</h2>
        @if (loading()) {
          <div class="loading">Analyzing features...</div>
        } @else {
          <div class="features-list">
            @for (feature of features(); track feature.name) {
              <div class="feature-detail-card">
                <div class="feature-main">
                  <h3>{{ feature.name }}</h3>
                  <span class="games-count"
                    >{{ feature.gamesCount }} games</span
                  >
                </div>
                <div class="feature-scores">
                  <div class="score-item">
                    <span class="score-label">Avg Engagement</span>
                    <div class="score-bar">
                      <div
                        class="score-fill engagement"
                        [style.width.%]="feature.avgEngagement * 10"
                      ></div>
                    </div>
                    <span class="score-value"
                      >{{ feature.avgEngagement.toFixed(1) }}/10</span
                    >
                  </div>
                  <div class="score-item">
                    <span class="score-label">Avg Monetization</span>
                    <div class="score-bar">
                      <div
                        class="score-fill monetization"
                        [style.width.%]="feature.avgMonetization * 10"
                      ></div>
                    </div>
                    <span class="score-value"
                      >{{ feature.avgMonetization.toFixed(1) }}/10</span
                    >
                  </div>
                </div>
                <div class="top-games">
                  <span class="label">Top Games:</span>
                  {{ feature.topGames.join(', ') }}
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .features-page {
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 2rem;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }
    .page-header p {
      color: var(--text-secondary, #666);
      margin: 0;
    }

    .section {
      margin-bottom: 2rem;
    }
    .section h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .flags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }

    .flag-card {
      padding: 1rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.5rem;
    }

    .flag-card.popular {
      border-color: oklch(0.65 0.2 145);
    }

    .flag-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .flag-name {
      font-weight: 500;
      font-size: 0.875rem;
    }
    .flag-percentage {
      font-weight: 700;
      color: oklch(0.6 0.2 260);
    }

    .flag-bar {
      height: 6px;
      background: var(--bg-tertiary, #eee);
      border-radius: 3px;
      margin-bottom: 0.5rem;
      overflow: hidden;
    }

    .flag-fill {
      height: 100%;
      background: linear-gradient(
        90deg,
        oklch(0.6 0.2 260),
        oklch(0.65 0.2 145)
      );
      border-radius: 3px;
    }

    .flag-count {
      font-size: 0.75rem;
      color: var(--text-secondary, #666);
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .feature-detail-card {
      padding: 1.25rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.75rem;
    }

    .feature-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .feature-main h3 {
      margin: 0;
      font-size: 1.125rem;
    }
    .games-count {
      padding: 0.25rem 0.5rem;
      background: oklch(0.6 0.2 260 / 0.15);
      color: oklch(0.5 0.2 260);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .feature-scores {
      display: flex;
      gap: 2rem;
      margin-bottom: 1rem;
    }

    .score-item {
      flex: 1;
    }
    .score-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-secondary, #666);
      margin-bottom: 0.25rem;
    }

    .score-bar {
      height: 8px;
      background: var(--bg-tertiary, #eee);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }

    .score-fill {
      height: 100%;
      border-radius: 4px;
    }
    .score-fill.engagement {
      background: oklch(0.6 0.2 260);
    }
    .score-fill.monetization {
      background: oklch(0.65 0.2 145);
    }

    .score-value {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .top-games {
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
    }
    .top-games .label {
      font-weight: 500;
    }

    .loading {
      padding: 2rem;
      text-align: center;
      color: var(--text-secondary, #666);
    }
  `,
})
export class FeaturesPage implements OnInit {
  loading = signal(true);
  totalGames = signal(0);
  featureFlags = signal<{ name: string; count: number; percentage: number }[]>(
    [],
  );
  features = signal<FeatureAnalysis[]>([]);

  ngOnInit() {
    this.analyzeFeatures();
  }

  async analyzeFeatures() {
    try {
      const response = await fetch('http://localhost:3333/api/games');
      const data = await response.json();
      const games = data.items || [];
      this.totalGames.set(games.length);

      // Analyze feature flags
      const flagCounts: Record<string, number> = {};
      const flagLabels: Record<string, string> = {
        hasCollectionSystem: 'Collection System',
        hasTradingSystem: 'Trading System',
        hasProgressionSystem: 'Progression',
        hasMultiplayer: 'Multiplayer',
        hasGachaSystem: 'Gacha',
        hasSeasonPass: 'Season Pass',
        hasLeaderboards: 'Leaderboards',
        hasDailyRewards: 'Daily Rewards',
        hasPvP: 'PvP',
        hasQuestSystem: 'Quests',
      };

      for (const game of games) {
        if (game.featureFlags) {
          for (const key of Object.keys(flagLabels)) {
            if (game.featureFlags[key]) {
              flagCounts[key] = (flagCounts[key] || 0) + 1;
            }
          }
        }
      }

      const flags = Object.entries(flagCounts)
        .map(([key, count]) => ({
          name: flagLabels[key] || key,
          count,
          percentage: Math.round((count / games.length) * 100),
        }))
        .sort((a, b) => b.percentage - a.percentage);

      this.featureFlags.set(flags);

      // Analyze features
      const featureMap: Record<
        string,
        { games: string[]; engagement: number[]; monetization: number[] }
      > = {};

      for (const game of games) {
        for (const feature of game.features || []) {
          if (!featureMap[feature.category]) {
            featureMap[feature.category] = {
              games: [],
              engagement: [],
              monetization: [],
            };
          }
          if (!featureMap[feature.category].games.includes(game.name)) {
            featureMap[feature.category].games.push(game.name);
          }
          featureMap[feature.category].engagement.push(
            feature.userEngagementImpact || 0,
          );
          featureMap[feature.category].monetization.push(
            feature.monetizationPotential || 0,
          );
        }
      }

      const features: FeatureAnalysis[] = Object.entries(featureMap)
        .map(([name, data]) => ({
          name,
          gamesCount: data.games.length,
          avgEngagement:
            data.engagement.reduce((a, b) => a + b, 0) / data.engagement.length,
          avgMonetization:
            data.monetization.reduce((a, b) => a + b, 0) /
            data.monetization.length,
          topGames: data.games.slice(0, 3),
        }))
        .sort((a, b) => b.gamesCount - a.gamesCount);

      this.features.set(features);
    } catch (error) {
      console.error('Failed to analyze features:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
