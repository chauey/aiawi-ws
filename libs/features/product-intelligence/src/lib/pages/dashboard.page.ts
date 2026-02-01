import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductIntelligenceStore } from '../store/product-intelligence.store';

@Component({
  selector: 'lib-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header Section -->
      <div class="border-b border-border bg-card">
        <div class="container mx-auto px-6 py-8">
          <h1 class="text-3xl font-bold text-foreground">
            Product Intelligence
          </h1>
          <p class="mt-2 text-muted-foreground">
            Track and analyze products, competitors, and market trends
          </p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="container mx-auto px-6 py-8">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <!-- All Products Card -->
          <a
            routerLink="products"
            class="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary hover:shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl"
              >
                📦
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  All Products
                </p>
                <p class="text-2xl font-bold text-foreground">
                  {{ store.allProductsCount() }}
                </p>
              </div>
            </div>
          </a>

          <!-- Our Products Card -->
          <a
            routerLink="products"
            [queryParams]="{ view: 'our-products' }"
            class="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-green-500 hover:shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-2xl"
              >
                🚀
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Our Products
                </p>
                <p class="text-2xl font-bold text-green-600">
                  {{ store.ourProductsCount() }}
                </p>
              </div>
            </div>
          </a>

          <!-- Competitors Card -->
          <a
            routerLink="products"
            [queryParams]="{ view: 'competitors' }"
            class="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-orange-500 hover:shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-2xl"
              >
                ⚔️
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Competitors
                </p>
                <p class="text-2xl font-bold text-orange-600">
                  {{ store.competitorsCount() }}
                </p>
              </div>
            </div>
          </a>

          <!-- Companies Card -->
          <a
            routerLink="companies"
            class="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-2xl"
              >
                🏢
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">
                  Companies
                </p>
                <p class="text-2xl font-bold text-blue-600">
                  {{ store.totalCompanies() }}
                </p>
              </div>
            </div>
          </a>
        </div>

        <!-- Quick Links Section -->
        <div class="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Categories Breakdown -->
          <div class="rounded-xl border border-border bg-card p-6">
            <h2 class="mb-4 text-lg font-semibold text-foreground">
              By Category
            </h2>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">🎮 Games</span>
                <span class="font-medium">{{ store.gamesCount() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">🤖 AI Agents</span>
                <span class="font-medium">{{ store.aiAgentsCount() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">📚 Courses</span>
                <span class="font-medium">{{ store.coursesCount() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">💻 SaaS</span>
                <span class="font-medium">{{ store.saasCount() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">📱 Mobile Apps</span>
                <span class="font-medium">{{ store.mobileAppsCount() }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="rounded-xl border border-border bg-card p-6">
            <h2 class="mb-4 text-lg font-semibold text-foreground">
              Quick Actions
            </h2>
            <div class="grid grid-cols-2 gap-3">
              <a
                routerLink="products"
                class="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/80"
              >
                📦 View All Products
              </a>
              <a
                routerLink="companies"
                class="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/80"
              >
                🏢 View Companies
              </a>
              <a
                routerLink="market"
                class="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/80"
              >
                📈 Market Analysis
              </a>
              <a
                routerLink="planning"
                class="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/80"
              >
                📋 Planning
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class DashboardPage implements OnInit {
  readonly store = inject(ProductIntelligenceStore);

  ngOnInit() {
    if (!this.store.isLoaded()) {
      this.store.loadData();
    }
  }
}
