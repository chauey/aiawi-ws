import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
  Feature,
  FeatureMatrix,
  ProductFeature,
  FeatureComparisonResponse,
  FeatureCategory,
} from '../../models/feature.model';

@Component({
  selector: 'lib-feature-matrix-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6 max-w-full overflow-x-auto">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Feature Matrix</h1>
          <p class="text-muted-foreground">
            Compare features across products • Identify gaps • Plan development
          </p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="viewMode.set('matrix')"
            [class.bg-primary]="viewMode() === 'matrix'"
            [class.text-primary-foreground]="viewMode() === 'matrix'"
            class="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            Matrix View
          </button>
          <button
            (click)="viewMode.set('gaps')"
            [class.bg-primary]="viewMode() === 'gaps'"
            [class.text-primary-foreground]="viewMode() === 'gaps'"
            class="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            Gap Analysis
          </button>
          <button
            (click)="viewMode.set('priorities')"
            [class.bg-primary]="viewMode() === 'priorities'"
            [class.text-primary-foreground]="viewMode() === 'priorities'"
            class="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            Priorities
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      @if (comparison()) {
      <div class="grid grid-cols-5 gap-4">
        <div class="p-4 rounded-xl bg-card border border-border">
          <div class="text-3xl font-bold text-primary">
            {{ comparison()?.stats?.totalFeatures }}
          </div>
          <div class="text-sm text-muted-foreground">Total Features</div>
        </div>
        <div class="p-4 rounded-xl bg-card border border-border">
          <div class="text-3xl font-bold text-green-500">
            {{ comparison()?.stats?.ourProductCount }}
          </div>
          <div class="text-sm text-muted-foreground">Our Products</div>
        </div>
        <div class="p-4 rounded-xl bg-card border border-border">
          <div class="text-3xl font-bold text-blue-500">
            {{ comparison()?.stats?.competitorCount }}
          </div>
          <div class="text-sm text-muted-foreground">Competitors Tracked</div>
        </div>
        <div class="p-4 rounded-xl bg-card border border-border">
          <div class="text-3xl font-bold text-amber-500">
            {{ comparison()?.stats?.gapCount }}
          </div>
          <div class="text-sm text-muted-foreground">Feature Gaps</div>
        </div>
        <div class="p-4 rounded-xl bg-card border border-border">
          <div class="text-3xl font-bold text-red-500">
            {{ comparison()?.stats?.prioritizeCount }}
          </div>
          <div class="text-sm text-muted-foreground">Critical to Add</div>
        </div>
      </div>
      }

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 p-4 rounded-xl bg-card border border-border">
        <select
          [ngModel]="filterCategory()"
          (ngModelChange)="filterCategory.set($event)"
          class="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="">All Categories</option>
          @for (cat of categories; track cat) {
          <option [value]="cat">{{ cat }}</option>
          }
        </select>
        <select
          [ngModel]="filterImportance()"
          (ngModelChange)="filterImportance.set($event)"
          class="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="">All Importance</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            [ngModel]="showGapsOnly()"
            (ngModelChange)="showGapsOnly.set($event)"
            class="w-4 h-4 rounded"
          />
          <span class="text-sm">Show Gaps Only</span>
        </label>
      </div>

      <!-- Matrix View -->
      @if (viewMode() === 'matrix' && matrix()) {
      <div class="overflow-x-auto rounded-xl border border-border">
        <table class="w-full text-sm">
          <thead class="bg-muted/50">
            <tr>
              <th
                class="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-semibold min-w-[200px]"
              >
                Feature
              </th>
              <th class="px-3 py-3 text-center font-semibold min-w-[80px]">
                Priority
              </th>
              <th class="px-3 py-3 text-center font-semibold min-w-[80px]">
                Impact
              </th>
              @for (product of filteredProducts(); track product.id) {
              <th
                class="px-3 py-3 text-center font-semibold min-w-[100px]"
                [class.bg-green-500/10]="product.relationship === 'Our Product'"
                [class.bg-blue-500/10]="product.relationship === 'Competitor'"
              >
                <div class="text-xs opacity-60">{{ product.relationship }}</div>
                <div>{{ product.name }}</div>
              </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (feature of filteredFeatures(); track feature.id) {
            <tr class="border-t border-border hover:bg-muted/30">
              <td
                class="sticky left-0 z-10 bg-background px-4 py-3 border-r border-border"
              >
                <div class="font-medium">{{ feature.name }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ feature.category }}
                </div>
                @if (feature.notes) {
                <div class="text-xs text-muted-foreground mt-1 max-w-[300px] truncate" [title]="feature.notes">
                  💡 {{ feature.notes }}
                </div>
                }
              </td>
              <td class="px-3 py-3 text-center">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  [class.bg-red-500/20]="feature.priority?.includes('P0')"
                  [class.text-red-500]="feature.priority?.includes('P0')"
                  [class.bg-orange-500/20]="feature.priority?.includes('P1')"
                  [class.text-orange-500]="feature.priority?.includes('P1')"
                  [class.bg-yellow-500/20]="feature.priority?.includes('P2')"
                  [class.text-yellow-500]="feature.priority?.includes('P2')"
                  [class.bg-blue-500/20]="feature.priority?.includes('P3')"
                  [class.text-blue-500]="feature.priority?.includes('P3')"
                >
                  {{ (feature.priority || '').split(' ')[0] || '-' }}
                </span>
              </td>
              <td class="px-3 py-3 text-center">
                <div class="flex flex-col gap-1 text-xs">
                  <span [class.text-green-500]="feature.monetizationImpact === 'High' || feature.monetizationImpact === 'Critical'">
                    💰 {{ feature.monetizationImpact }}
                  </span>
                  <span [class.text-blue-500]="feature.retentionImpact === 'High' || feature.retentionImpact === 'Critical'">
                    📈 {{ feature.retentionImpact }}
                  </span>
                </div>
              </td>
              @for (product of filteredProducts(); track product.id) {
              <td
                class="px-3 py-3 text-center"
                [class.bg-green-500/10]="product.relationship === 'Our Product'"
                [class.bg-blue-500/10]="product.relationship === 'Competitor'"
              >
                @if (getProductFeature(product.slug, feature.id); as pf) {
                <div
                  class="flex flex-col items-center gap-1"
                  [title]="pf.implementationNotes || pf.whyHave || pf.whyNotHave || ''"
                >
                  @switch (pf.status) { @case ('Implemented') {
                  <span class="text-green-500 text-lg">✅</span>
                  @if (pf.implementationQuality) {
                  <span class="text-xs text-muted-foreground">{{ pf.implementationQuality }}</span>
                  }
                  } @case ('In Progress') {
                  <span class="text-yellow-500 text-lg">🔨</span>
                  } @case ('Planned') {
                  <span class="text-blue-500 text-lg">📋</span>
                  } @case ('Not Planned') {
                  <span class="text-red-500/50 text-lg">❌</span>
                  } @default {
                  <span class="text-muted-foreground">—</span>
                  } }
                </div>
                } @else {
                <span class="text-muted-foreground">—</span>
                }
              </td>
              }
            </tr>
            }
          </tbody>
        </table>
      </div>
      }

      <!-- Gap Analysis View -->
      @if (viewMode() === 'gaps' && comparison()) {
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-foreground">
          ⚠️ Features Competitors Have That We Don't
        </h2>
        <div class="grid gap-4">
          @for (item of gapFeatures(); track item.feature.id) {
          <div
            class="p-4 rounded-xl border border-border bg-card"
            [class.border-red-500/50]="item.shouldPrioritize"
          >
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold">{{ item.feature.name }}</span>
                  <span
                    class="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-500"
                  >
                    {{ item.competitorCount }} competitors have this
                  </span>
                  @if (item.shouldPrioritize) {
                  <span
                    class="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-500"
                  >
                    🔥 CRITICAL GAP
                  </span>
                  }
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ item.feature.description }}
                </p>
                @if (item.feature.notes) {
                <p class="text-sm text-blue-500 mt-2">
                  💡 {{ item.feature.notes }}
                </p>
                }
              </div>
              <div class="text-right">
                <div class="text-sm">
                  <span class="text-muted-foreground">Complexity:</span>
                  <span class="ml-1 font-medium">{{
                    item.feature.implementationComplexity
                  }}</span>
                </div>
                @if (item.feature.estimatedDevDays) {
                <div class="text-sm">
                  <span class="text-muted-foreground">Est. Days:</span>
                  <span class="ml-1 font-medium">{{
                    item.feature.estimatedDevDays
                  }}</span>
                </div>
                }
              </div>
            </div>
          </div>
          }
        </div>
      </div>
      }

      <!-- Priorities View -->
      @if (viewMode() === 'priorities' && comparison()) {
      <div class="space-y-6">
        @for (priority of priorities; track priority) {
        <div>
          <h2
            class="text-lg font-semibold mb-3"
            [class.text-red-500]="priority === 'P0 - Launch Blocker'"
            [class.text-orange-500]="priority === 'P1 - Must Have'"
            [class.text-yellow-600]="priority === 'P2 - Should Have'"
          >
            {{ priority }}
          </h2>
          <div class="grid gap-3">
            @for (feature of getFeaturesByPriority(priority); track feature.id)
            {
            <div
              class="p-4 rounded-xl border border-border bg-card flex items-center justify-between"
            >
              <div>
                <div class="font-medium">{{ feature.name }}</div>
                <div class="text-sm text-muted-foreground">
                  {{ feature.category }} • {{ feature.importance }} importance
                </div>
              </div>
              <div class="flex items-center gap-4 text-sm">
                <div>
                  <span class="text-muted-foreground">💰</span>
                  {{ feature.monetizationImpact }}
                </div>
                <div>
                  <span class="text-muted-foreground">📈</span>
                  {{ feature.retentionImpact }}
                </div>
                <div>
                  <span class="text-muted-foreground">🚀</span>
                  {{ feature.viralityImpact }}
                </div>
                <div
                  class="px-3 py-1 rounded-lg bg-muted text-muted-foreground"
                >
                  {{ feature.implementationComplexity }}
                </div>
              </div>
            </div>
            }
          </div>
        </div>
        }
      </div>
      }

      <!-- Loading State -->
      @if (loading()) {
      <div class="flex items-center justify-center py-12">
        <div class="text-muted-foreground">Loading feature data...</div>
      </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class FeatureMatrixPage implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3333/api';

  // State
  loading = signal(true);
  matrix = signal<FeatureMatrix | null>(null);
  comparison = signal<FeatureComparisonResponse | null>(null);
  viewMode = signal<'matrix' | 'gaps' | 'priorities'>('matrix');

  // Filters
  filterCategory = signal<string>('');
  filterImportance = signal<string>('');
  showGapsOnly = signal(false);

  // Static data
  categories: FeatureCategory[] = [
    'Core Gameplay',
    'Retention & Engagement',
    'Monetization',
    'Social & Multiplayer',
    'Progression & Rewards',
    'Content & Variety',
    'User Experience',
    'Technical & Performance',
    'Safety & Moderation',
  ];

  priorities = [
    'P0 - Launch Blocker',
    'P1 - Must Have',
    'P2 - Should Have',
    'P3 - Nice to Have',
    'P4 - Future Consider',
  ];

  // Computed
  filteredFeatures = computed(() => {
    const m = this.matrix();
    if (!m) return [];

    let features = m.features;

    if (this.filterCategory()) {
      features = features.filter((f) => f.category === this.filterCategory());
    }

    if (this.filterImportance()) {
      features = features.filter(
        (f) => f.importance === this.filterImportance(),
      );
    }

    return features.sort((a, b) => {
      // Sort by priority
      const priorityOrder = ['P0', 'P1', 'P2', 'P3', 'P4'];
      const aP = priorityOrder.indexOf(a.priority?.split(' ')[0] || 'P4');
      const bP = priorityOrder.indexOf(b.priority?.split(' ')[0] || 'P4');
      return aP - bP;
    });
  });

  filteredProducts = computed(() => {
    const m = this.matrix();
    if (!m) return [];

    // Sort: Our Products first, then Competitors
    return [...m.products].sort((a, b) => {
      const order = ['Our Product', 'Competitor', 'Inspiration', 'Reference'];
      return order.indexOf(a.relationship) - order.indexOf(b.relationship);
    });
  });

  gapFeatures = computed(() => {
    const c = this.comparison();
    if (!c) return [];

    return c.items
      .filter((i) => i.gap)
      .sort((a, b) => {
        if (a.shouldPrioritize && !b.shouldPrioritize) return -1;
        if (!a.shouldPrioritize && b.shouldPrioritize) return 1;
        return b.competitorCount - a.competitorCount;
      });
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    // Load matrix
    this.http
      .get<FeatureMatrix>(`${this.apiUrl}/features/matrix/view`)
      .subscribe({
        next: (data) => {
          this.matrix.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading matrix:', err);
          this.loading.set(false);
        },
      });

    // Load comparison
    this.http
      .get<FeatureComparisonResponse>(
        `${this.apiUrl}/features/comparison/summary`,
      )
      .subscribe({
        next: (data) => {
          this.comparison.set(data);
        },
        error: (err) => {
          console.error('Error loading comparison:', err);
        },
      });
  }

  getProductFeature(
    productSlug: string,
    featureId: string,
  ): ProductFeature | undefined {
    const m = this.matrix();
    if (!m) return undefined;

    return m.matrix.find(
      (pf) => pf.productId === productSlug && pf.featureId === featureId,
    );
  }

  getFeaturesByPriority(priority: string): Feature[] {
    const m = this.matrix();
    if (!m) return [];

    return m.features.filter((f) => f.priority === priority);
  }
}
