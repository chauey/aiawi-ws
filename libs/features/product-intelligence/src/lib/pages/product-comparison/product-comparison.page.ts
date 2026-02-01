import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface ProductMetrics {
  totalUsers?: number;
  concurrentPlayers?: number;
  monthlyActiveUsers?: number;
  dailyActiveUsers?: number;
  revenueMonthly?: number;
  revenueAnnual?: number;
  averageRating?: number;
  reviewCount?: number;
  retentionDay1?: number;
  retentionDay7?: number;
  retentionDay30?: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  category: string;
  subcategory?: string;
  platforms?: string[];
  targetAudiences?: string[];
  relationship: string;
  status: string;
  monetizationModel?: string;
  launchDate?: string;
  metrics?: ProductMetrics;
  featureFlags?: Record<string, boolean>;
  strengths?: string[];
  weaknesses?: string[];
  uniqueSellingPoints?: string[];
  priorityScore?: number;
  tags?: string[];
}

interface ProductResponse {
  items: Product[];
  totalCount: number;
}

@Component({
  selector: 'lib-product-comparison-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6 max-w-full overflow-x-auto">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">
            Product Comparison Matrix
          </h1>
          <p class="text-muted-foreground">
            Compare revenue, players, features, and metrics across all products
          </p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="viewMode.set('metrics')"
            [class.bg-primary]="viewMode() === 'metrics'"
            [class.text-primary-foreground]="viewMode() === 'metrics'"
            class="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            📊 Metrics
          </button>
          <button
            (click)="viewMode.set('features')"
            [class.bg-primary]="viewMode() === 'features'"
            [class.text-primary-foreground]="viewMode() === 'features'"
            class="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            ⚙️ Features
          </button>
          <button
            (click)="viewMode.set('cards')"
            [class.bg-primary]="viewMode() === 'cards'"
            [class.text-primary-foreground]="viewMode() === 'cards'"
            class="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            🃏 Cards
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-6 gap-4">
        <div class="p-4 rounded-xl bg-card border border-border">
          <div class="text-3xl font-bold text-primary">
            {{ products().length }}
          </div>
          <div class="text-sm text-muted-foreground">Total Products</div>
        </div>
        <div class="p-4 rounded-xl bg-card border border-border">
          <div class="text-3xl font-bold text-green-500">
            {{ ourProducts().length }}
          </div>
          <div class="text-sm text-muted-foreground">Our Products</div>
        </div>
        <div class="p-4 rounded-xl bg-card border border-border">
          <div class="text-3xl font-bold text-blue-500">
            {{ competitors().length }}
          </div>
          <div class="text-sm text-muted-foreground">Competitors</div>
        </div>
        <div class="p-4 rounded-xl bg-card border border-border">
          <div class="text-3xl font-bold text-purple-500">
            {{ formatNumber(totalPlayers()) }}
          </div>
          <div class="text-sm text-muted-foreground">Total Players (all)</div>
        </div>
        <div class="p-4 rounded-xl bg-card border border-border">
          <div class="text-3xl font-bold text-amber-500">
            {{ formatCurrency(totalRevenue()) }}
          </div>
          <div class="text-sm text-muted-foreground">Monthly Revenue</div>
        </div>
        <div class="p-4 rounded-xl bg-card border border-border">
          <div class="text-3xl font-bold text-cyan-500">
            {{ averageRating() | number : '1.1-1' }}
          </div>
          <div class="text-sm text-muted-foreground">Avg Rating</div>
        </div>
      </div>

      <!-- Filters -->
      <div
        class="flex flex-wrap gap-4 p-4 rounded-xl bg-card border border-border"
      >
        <select
          [ngModel]="filterRelationship()"
          (ngModelChange)="filterRelationship.set($event)"
          class="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="">All Relationships</option>
          <option value="Our Product">Our Products</option>
          <option value="Competitor">Competitors</option>
          <option value="Inspiration">Inspiration</option>
          <option value="Reference">Reference</option>
        </select>
        <select
          [ngModel]="filterCategory()"
          (ngModelChange)="filterCategory.set($event)"
          class="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="">All Categories</option>
          <option value="Game">Games</option>
          <option value="Online Course">Courses</option>
          <option value="SaaS Application">SaaS</option>
          <option value="AI Agent">AI Agents</option>
        </select>
        <select
          [ngModel]="sortBy()"
          (ngModelChange)="sortBy.set($event)"
          class="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="revenue">Sort by Revenue</option>
          <option value="players">Sort by Players</option>
          <option value="rating">Sort by Rating</option>
          <option value="name">Sort by Name</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>

      <!-- Metrics Matrix View -->
      @if (viewMode() === 'metrics') {
      <div class="overflow-x-auto rounded-xl border border-border">
        <table class="w-full text-sm">
          <thead class="bg-muted/50">
            <tr>
              <th
                class="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-semibold min-w-[180px]"
              >
                Product
              </th>
              <th class="px-3 py-3 text-center font-semibold min-w-[80px]">
                Type
              </th>
              <th class="px-3 py-3 text-center font-semibold min-w-[100px]">
                Status
              </th>
              <th class="px-3 py-3 text-right font-semibold min-w-[120px]">
                💵 Revenue/mo
              </th>
              <th class="px-3 py-3 text-right font-semibold min-w-[100px]">
                👥 Total Users
              </th>
              <th class="px-3 py-3 text-right font-semibold min-w-[80px]">
                🎮 CCU
              </th>
              <th class="px-3 py-3 text-right font-semibold min-w-[100px]">
                📱 MAU
              </th>
              <th class="px-3 py-3 text-center font-semibold min-w-[60px]">
                ⭐ Rating
              </th>
              <th class="px-3 py-3 text-right font-semibold min-w-[80px]">
                📅 DAU
              </th>
              <th class="px-3 py-3 text-center font-semibold min-w-[100px]">
                🚀 Launch
              </th>
              <th class="px-3 py-3 text-center font-semibold min-w-[80px]">
                Genre
              </th>
              <th class="px-3 py-3 text-center font-semibold min-w-[80px]">
                Priority
              </th>
            </tr>
          </thead>
          <tbody>
            @for (product of filteredProducts(); track product.id) {
            <tr
              class="border-t border-border hover:bg-muted/30"
              [class.bg-green-500/5]="product.relationship === 'Our Product'"
            >
              <td
                class="sticky left-0 z-10 bg-background px-4 py-3 border-r border-border"
                [class.bg-green-500/5]="product.relationship === 'Our Product'"
              >
                <div class="font-medium">{{ product.name }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ product.relationship }}
                </div>
              </td>
              <td class="px-3 py-3 text-center">
                <span
                  class="px-2 py-1 rounded-full text-xs"
                  [class.bg-purple-500/20]="product.category === 'Game'"
                  [class.text-purple-500]="product.category === 'Game'"
                  [class.bg-blue-500/20]="product.category === 'Online Course'"
                  [class.text-blue-500]="product.category === 'Online Course'"
                  [class.bg-cyan-500/20]="
                    product.category === 'SaaS Application'
                  "
                  [class.text-cyan-500]="
                    product.category === 'SaaS Application'
                  "
                >
                  {{ product.category }}
                </span>
              </td>
              <td class="px-3 py-3 text-center">
                <span
                  class="px-2 py-1 rounded-full text-xs"
                  [class.bg-green-500/20]="product.status === 'Mature'"
                  [class.text-green-500]="product.status === 'Mature'"
                  [class.bg-blue-500/20]="product.status === 'Growing'"
                  [class.text-blue-500]="product.status === 'Growing'"
                  [class.bg-yellow-500/20]="
                    product.status === 'In Development'
                  "
                  [class.text-yellow-500]="
                    product.status === 'In Development'
                  "
                >
                  {{ product.status }}
                </span>
              </td>
              <td class="px-3 py-3 text-right font-mono">
                @if (product.metrics?.revenueMonthly) {
                <span class="text-green-500 font-semibold">
                  {{ formatCurrency(product.metrics!.revenueMonthly!) }}
                </span>
                } @else {
                <span class="text-muted-foreground">—</span>
                }
              </td>
              <td class="px-3 py-3 text-right font-mono">
                @if (product.metrics?.totalUsers) {
                {{ formatNumber(product.metrics!.totalUsers!) }}
                } @else {
                <span class="text-muted-foreground">—</span>
                }
              </td>
              <td class="px-3 py-3 text-right font-mono">
                @if (product.metrics?.concurrentPlayers) {
                {{ formatNumber(product.metrics!.concurrentPlayers!) }}
                } @else {
                <span class="text-muted-foreground">—</span>
                }
              </td>
              <td class="px-3 py-3 text-right font-mono">
                @if (product.metrics?.monthlyActiveUsers) {
                {{ formatNumber(product.metrics!.monthlyActiveUsers!) }}
                } @else {
                <span class="text-muted-foreground">—</span>
                }
              </td>
              <td class="px-3 py-3 text-center">
                @if (product.metrics?.averageRating) {
                <span
                  class="font-semibold"
                  [class.text-green-500]="
                    (product.metrics!.averageRating || 0) >= 4.5
                  "
                  [class.text-yellow-500]="
                    (product.metrics!.averageRating || 0) >= 4 &&
                    (product.metrics!.averageRating || 0) < 4.5
                  "
                  [class.text-red-500]="
                    (product.metrics!.averageRating || 0) < 4
                  "
                >
                  {{ product.metrics!.averageRating | number : '1.1-1' }}
                </span>
                } @else {
                <span class="text-muted-foreground">—</span>
                }
              </td>
              <td class="px-3 py-3 text-right font-mono">
                @if (product.metrics?.dailyActiveUsers) {
                {{ formatNumber(product.metrics!.dailyActiveUsers!) }}
                } @else {
                <span class="text-muted-foreground">—</span>
                }
              </td>
              <td class="px-3 py-3 text-center">
                @if (product.launchDate) {
                <div class="text-xs">
                  {{ formatLaunchDate(product.launchDate) }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ calculateAge(product.launchDate) }}
                </div>
                } @else {
                <span class="text-muted-foreground">—</span>
                }
              </td>
              <td class="px-3 py-3 text-center">
                <span class="text-xs">{{ product.subcategory || '—' }}</span>
              </td>
              <td class="px-3 py-3 text-center">
                @if (product.priorityScore) {
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  [class.bg-red-500/20]="(product.priorityScore || 0) >= 90"
                  [class.text-red-500]="(product.priorityScore || 0) >= 90"
                  [class.bg-orange-500/20]="
                    (product.priorityScore || 0) >= 70 &&
                    (product.priorityScore || 0) < 90
                  "
                  [class.text-orange-500]="
                    (product.priorityScore || 0) >= 70 &&
                    (product.priorityScore || 0) < 90
                  "
                >
                  {{ product.priorityScore }}
                </span>
                } @else {
                <span class="text-muted-foreground">—</span>
                }
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      }

      <!-- Features Matrix View -->
      @if (viewMode() === 'features') {
      <div class="overflow-x-auto rounded-xl border border-border">
        <table class="w-full text-sm">
          <thead class="bg-muted/50">
            <tr>
              <th
                class="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-semibold min-w-[180px]"
              >
                Product
              </th>
              @for (feature of featureColumns; track feature) {
              <th class="px-3 py-3 text-center font-semibold min-w-[80px]">
                {{ feature.label }}
              </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (product of filteredProducts(); track product.id) {
            <tr
              class="border-t border-border hover:bg-muted/30"
              [class.bg-green-500/5]="product.relationship === 'Our Product'"
            >
              <td
                class="sticky left-0 z-10 bg-background px-4 py-3 border-r border-border"
                [class.bg-green-500/5]="product.relationship === 'Our Product'"
              >
                <div class="font-medium">{{ product.name }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ product.subcategory }}
                </div>
              </td>
              @for (feature of featureColumns; track feature) {
              <td class="px-3 py-3 text-center">
                @if (hasFeature(product, feature.key)) {
                <span class="text-green-500">✓</span>
                } @else {
                <span class="text-muted-foreground/30">—</span>
                }
              </td>
              }
            </tr>
            }
          </tbody>
        </table>
      </div>
      }

      <!-- Cards View -->
      @if (viewMode() === 'cards') {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (product of filteredProducts(); track product.id) {
        <div
          class="p-5 rounded-xl border bg-card"
          [class.border-green-500/50]="product.relationship === 'Our Product'"
          [class.border-blue-500/50]="product.relationship === 'Competitor'"
          [class.border-border]="
            product.relationship !== 'Our Product' &&
            product.relationship !== 'Competitor'
          "
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-semibold text-lg">{{ product.name }}</h3>
              <p class="text-sm text-muted-foreground">{{ product.tagline }}</p>
            </div>
            <span
              class="px-2 py-1 rounded-full text-xs"
              [class.bg-green-500/20]="product.relationship === 'Our Product'"
              [class.text-green-500]="product.relationship === 'Our Product'"
              [class.bg-blue-500/20]="product.relationship === 'Competitor'"
              [class.text-blue-500]="product.relationship === 'Competitor'"
            >
              {{ product.relationship }}
            </span>
          </div>

          <!-- Metrics Grid -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="p-2 rounded-lg bg-muted/50">
              <div class="text-xs text-muted-foreground">Revenue/mo</div>
              <div class="font-semibold text-green-500">
                {{
                  product.metrics?.revenueMonthly
                    ? formatCurrency(product.metrics!.revenueMonthly!)
                    : '—'
                }}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-muted/50">
              <div class="text-xs text-muted-foreground">MAU</div>
              <div class="font-semibold">
                {{
                  product.metrics?.monthlyActiveUsers
                    ? formatNumber(product.metrics!.monthlyActiveUsers!)
                    : '—'
                }}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-muted/50">
              <div class="text-xs text-muted-foreground">DAU</div>
              <div class="font-semibold text-blue-500">
                {{
                  product.metrics?.dailyActiveUsers
                    ? formatNumber(product.metrics!.dailyActiveUsers!)
                    : '—'
                }}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-muted/50">
              <div class="text-xs text-muted-foreground">CCU</div>
              <div class="font-semibold">
                {{
                  product.metrics?.concurrentPlayers
                    ? formatNumber(product.metrics!.concurrentPlayers!)
                    : '—'
                }}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-muted/50">
              <div class="text-xs text-muted-foreground">Rating</div>
              <div class="font-semibold">
                ⭐
                {{
                  product.metrics?.averageRating
                    ? (product.metrics!.averageRating! | number : '1.1-1')
                    : '—'
                }}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-muted/50">
              <div class="text-xs text-muted-foreground">🚀 Launched</div>
              <div class="font-semibold text-xs">
                {{ product.launchDate ? formatLaunchDate(product.launchDate) : '—' }}
              </div>
            </div>
          </div>

          <!-- Retention Metrics -->
          @if (product.metrics?.retentionDay1) {
          <div class="mb-4 p-2 rounded-lg bg-muted/30">
            <div class="text-xs text-muted-foreground mb-2">📊 Retention</div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div>
                <div class="text-xs text-muted-foreground">D1</div>
                <div class="text-sm font-semibold text-green-500">{{ product.metrics!.retentionDay1 }}%</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">D7</div>
                <div class="text-sm font-semibold text-yellow-500">{{ product.metrics!.retentionDay7 }}%</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">D30</div>
                <div class="text-sm font-semibold text-red-400">{{ product.metrics!.retentionDay30 }}%</div>
              </div>
            </div>
          </div>
          }

          <!-- Tags -->
          <div class="flex flex-wrap gap-1 mb-3">
            <span
              class="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
            >
              {{ product.category }}
            </span>
            @if (product.subcategory) {
            <span
              class="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
            >
              {{ product.subcategory }}
            </span>
            }
            @if (product.monetizationModel) {
            <span
              class="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
            >
              {{ product.monetizationModel }}
            </span>
            }
          </div>

          <!-- Strengths -->
          @if (product.strengths && product.strengths.length > 0) {
          <div class="text-xs">
            <span class="text-muted-foreground">Strengths:</span>
            <span class="text-green-500 ml-1">
              {{ product.strengths.slice(0, 3).join(', ') }}
            </span>
          </div>
          }
        </div>
        }
      </div>
      }

      <!-- Loading State -->
      @if (loading()) {
      <div class="flex items-center justify-center py-12">
        <div class="text-muted-foreground">Loading products...</div>
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
export class ProductComparisonPage implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3333/api';

  // State
  loading = signal(true);
  products = signal<Product[]>([]);
  viewMode = signal<'metrics' | 'features' | 'cards'>('metrics');

  // Filters
  filterRelationship = signal<string>('');
  filterCategory = signal<string>('');
  sortBy = signal<string>('revenue');

  // Feature columns for the features matrix
  featureColumns = [
    { key: 'hasMultiplayer', label: '👥 Multi' },
    { key: 'hasCollection', label: '🏆 Collect' },
    { key: 'hasTrading', label: '🔄 Trade' },
    { key: 'hasLeaderboards', label: '📊 Boards' },
    { key: 'hasPvP', label: '⚔️ PvP' },
    { key: 'hasQuests', label: '📋 Quests' },
    { key: 'hasLevelSystem', label: '📈 Levels' },
    { key: 'hasHousing', label: '🏠 Housing' },
    { key: 'hasMicroTransactions', label: '💰 MTX' },
  ];

  // Computed
  ourProducts = computed(() =>
    this.products().filter((p) => p.relationship === 'Our Product'),
  );

  competitors = computed(() =>
    this.products().filter((p) => p.relationship === 'Competitor'),
  );

  totalPlayers = computed(() =>
    this.products().reduce(
      (sum, p) => sum + (p.metrics?.monthlyActiveUsers || 0),
      0,
    ),
  );

  totalRevenue = computed(() =>
    this.products().reduce(
      (sum, p) => sum + (p.metrics?.revenueMonthly || 0),
      0,
    ),
  );

  averageRating = computed(() => {
    const rated = this.products().filter((p) => p.metrics?.averageRating);
    if (rated.length === 0) return 0;
    return (
      rated.reduce((sum, p) => sum + (p.metrics?.averageRating || 0), 0) /
      rated.length
    );
  });

  filteredProducts = computed(() => {
    let result = [...this.products()];

    // Filter by relationship
    if (this.filterRelationship()) {
      result = result.filter(
        (p) => p.relationship === this.filterRelationship(),
      );
    }

    // Filter by category
    if (this.filterCategory()) {
      result = result.filter((p) => p.category === this.filterCategory());
    }

    // Sort
    const sort = this.sortBy();
    result.sort((a, b) => {
      switch (sort) {
        case 'revenue':
          return (
            (b.metrics?.revenueMonthly || 0) - (a.metrics?.revenueMonthly || 0)
          );
        case 'players':
          return (
            (b.metrics?.monthlyActiveUsers || 0) -
            (a.metrics?.monthlyActiveUsers || 0)
          );
        case 'rating':
          return (
            (b.metrics?.averageRating || 0) - (a.metrics?.averageRating || 0)
          );
        case 'priority':
          return (b.priorityScore || 0) - (a.priorityScore || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.http.get<ProductResponse>(`${this.apiUrl}/products`).subscribe({
      next: (data) => {
        this.products.set(data.items || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading.set(false);
      },
    });
  }

  hasFeature(product: Product, featureKey: string): boolean {
    if (!product.featureFlags) return false;
    return !!product.featureFlags[featureKey];
  }

  formatNumber(value: number): string {
    if (!value) return '—';
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'B';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
    return value.toString();
  }

  formatCurrency(value: number): string {
    if (!value) return '—';
    if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return '$' + (value / 1_000).toFixed(0) + 'K';
    return '$' + value;
  }

  formatLaunchDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
    } catch {
      return '—';
    }
  }

  calculateAge(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const launchDate = new Date(dateStr);
      const now = new Date();
      const years = now.getFullYear() - launchDate.getFullYear();
      const months = now.getMonth() - launchDate.getMonth();

      if (years > 0) {
        return `${years}y ${months >= 0 ? months : 12 + months}mo`;
      } else if (months > 0) {
        return `${months}mo`;
      } else {
        const days = Math.floor(
          (now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        return `${days}d`;
      }
    } catch {
      return '';
    }
  }
}
