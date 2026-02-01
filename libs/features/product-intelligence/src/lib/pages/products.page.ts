import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductIntelligenceStore } from '../store/product-intelligence.store';
import { QuickViewBarComponent } from '../components/quick-view-bar.component';
import { CategoryTabsComponent } from '../components/category-tabs.component';
import { FilterBarComponent } from '../components/filter-bar.component';
import { ProductTableComponent } from '../components/product-table.component';
import { ActiveFiltersComponent } from '../components/active-filters.component';

@Component({
  selector: 'lib-products-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuickViewBarComponent,
    CategoryTabsComponent,
    FilterBarComponent,
    ProductTableComponent,
    ActiveFiltersComponent,
  ],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <div class="border-b border-border bg-card">
        <div class="container mx-auto px-6 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-foreground">Products</h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Browse and filter all tracked products
              </p>
            </div>
            <button
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span>+</span> Add Product
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="container mx-auto px-6 py-6">
        <!-- Quick View Buttons -->
        <lib-quick-view-bar
          [activeView]="store.activeQuickView()"
          [counts]="{
            all: store.allProductsCount(),
            ourProducts: store.ourProductsCount(),
            competitors: store.competitorsCount(),
            recommended: store.recommendedCount(),
          }"
          (viewChange)="store.setQuickView($event)"
        />

        <!-- Category Tabs -->
        <lib-category-tabs
          [activeCategory]="store.activeCategory()"
          [counts]="{
            games: store.gamesCount(),
            aiAgents: store.aiAgentsCount(),
            courses: store.coursesCount(),
            saas: store.saasCount(),
            mobile: store.mobileAppsCount(),
          }"
          (categoryChange)="store.setCategory($event)"
        />

        <!-- Filter Bar -->
        <lib-filter-bar
          [filter]="store.filter()"
          (filterChange)="store.updateFilter($event)"
          (searchChange)="store.setSearch($event)"
          (sortChange)="store.setSort($event)"
          (recommendedToggle)="store.toggleRecommendedOnly()"
          (freeTierToggle)="store.toggleHasFreeTier()"
          (clearAll)="store.clearAllFilters()"
        />

        <!-- Active Filters -->
        @if (store.activeFilters().length > 0) {
          <lib-active-filters
            [filters]="store.activeFilters()"
            [visibleCount]="store.visibleCount()"
            [totalCount]="store.allProductsCount()"
            (removeFilter)="store.clearFilter($event)"
            (clearAll)="store.clearAllFilters()"
          />
        }

        <!-- Results Info -->
        <div class="mb-4 flex items-center justify-between">
          <p class="text-sm text-muted-foreground">
            Showing
            <span class="font-medium text-foreground">{{
              store.visibleCount()
            }}</span>
            of
            <span class="font-medium text-foreground">{{
              store.allProductsCount()
            }}</span>
            products
          </p>
        </div>

        <!-- Loading State -->
        @if (store.loading()) {
          <div
            class="flex h-64 items-center justify-center rounded-xl border border-border bg-card"
          >
            <div class="text-center">
              <div
                class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
              ></div>
              <p class="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          </div>
        }

        <!-- Error State -->
        @if (store.error()) {
          <div
            class="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center"
          >
            <p class="text-destructive">{{ store.error() }}</p>
            <button
              (click)="store.loadData()"
              class="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Retry
            </button>
          </div>
        }

        <!-- Empty State -->
        @if (!store.loading() && store.filteredProducts().length === 0) {
          <div
            class="flex h-64 items-center justify-center rounded-xl border border-border bg-card"
          >
            <div class="text-center">
              <p class="text-4xl">🔍</p>
              <p class="mt-4 text-lg font-medium text-foreground">
                No products found
              </p>
              <p class="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
              @if (store.activeFilters().length > 0) {
                <button
                  (click)="store.clearAllFilters()"
                  class="mt-4 rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
                >
                  Clear all filters
                </button>
              }
            </div>
          </div>
        }

        <!-- Products Table -->
        @if (!store.loading() && store.filteredProducts().length > 0) {
          <lib-product-table
            [products]="store.filteredProducts()"
            [selectedProduct]="store.selectedProduct()"
            (selectProduct)="store.selectProduct($event)"
          />
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ProductsPage implements OnInit {
  readonly store = inject(ProductIntelligenceStore);

  ngOnInit() {
    if (!this.store.isLoaded()) {
      this.store.loadData();
    }
  }
}
