import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-competitors',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="competitors-page">
      <div class="page-header">
        <h1>Competitor Analysis</h1>
        <p>Study what makes top games successful</p>
      </div>

      @if (loading()) {
        <div class="loading">Loading competitors...</div>
      } @else {
        <div class="competitors-list">
          @for (game of competitors(); track game.id) {
            <a [routerLink]="['/games', game.id]" class="competitor-card">
              <div class="competitor-rank">#{{ $index + 1 }}</div>
              <div class="competitor-info">
                <h3>{{ game.name }}</h3>
                <p>{{ game.developer }} • {{ game.genre }}</p>
              </div>
              <div class="competitor-stats">
                <div class="stat">
                  <span class="value"
                    >\${{
                      formatNumber(game.successMetrics?.revenueMonthly || 0)
                    }}/mo</span
                  >
                  <span class="label">Revenue</span>
                </div>
                <div class="stat">
                  <span class="value">{{
                    formatNumber(game.successMetrics?.concurrentPlayers || 0)
                  }}</span>
                  <span class="label">Players</span>
                </div>
                <div class="stat">
                  <span class="value"
                    >{{ game.successMetrics?.retentionRateDay1 || 0 }}%</span
                  >
                  <span class="label">D1 Retention</span>
                </div>
              </div>
              <div class="arrow">→</div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .competitors-page {
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

    .competitors-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .competitor-card {
      display: grid;
      grid-template-columns: 60px 1fr auto 40px;
      align-items: center;
      gap: 1.5rem;
      padding: 1.25rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.75rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }

    .competitor-card:hover {
      border-color: oklch(0.6 0.2 260);
      transform: translateX(4px);
    }

    .competitor-rank {
      font-size: 1.5rem;
      font-weight: 700;
      color: oklch(0.6 0.2 260);
      text-align: center;
    }

    .competitor-info h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.125rem;
    }
    .competitor-info p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
    }

    .competitor-stats {
      display: flex;
      gap: 2rem;
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat .value {
      font-weight: 600;
      font-size: 1rem;
    }
    .stat .label {
      font-size: 0.75rem;
      color: var(--text-secondary, #666);
    }

    .arrow {
      color: var(--text-secondary, #666);
      font-size: 1.25rem;
    }

    .loading {
      padding: 3rem;
      text-align: center;
      color: var(--text-secondary, #666);
    }

    @media (max-width: 768px) {
      .competitor-card {
        grid-template-columns: 40px 1fr 30px;
      }
      .competitor-stats {
        display: none;
      }
    }
  `,
})
export class CompetitorsPage implements OnInit {
  loading = signal(true);
  competitors = signal<any[]>([]);

  ngOnInit() {
    this.loadCompetitors();
  }

  async loadCompetitors() {
    try {
      const response = await fetch(
        'http://localhost:3333/api/games?ownership=Competitor',
      );
      const data = await response.json();
      const sorted = (data.items || []).sort(
        (a: any, b: any) =>
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
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  }
}
