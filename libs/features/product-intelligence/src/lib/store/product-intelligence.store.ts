import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { ProductIntelligenceFacade } from '../facades/product-intelligence.facade';
import {
  Product,
  Company,
  ProductFilter,
  ProductSort,
  QuickView,
  ProductCategory,
} from '../models/product.model';

export interface ProductIntelligenceState {
  products: Product[];
  companies: Company[];
  selectedProduct: Product | null;
  selectedCompany: Company | null;
  loading: boolean;
  error: string | null;
  filter: ProductFilter;
  activeQuickView: QuickView;
  activeCategory: ProductCategory | null;
}

const initialFilter: ProductFilter = {
  search: '',
  category: null,
  relationship: null,
  status: null,
  platform: null,
  monetization: null,
  recommendedOnly: false,
  hasFreeTier: false,
  sort: 'priority-desc',
};

const initialState: ProductIntelligenceState = {
  products: [],
  companies: [],
  selectedProduct: null,
  selectedCompany: null,
  loading: false,
  error: null,
  filter: initialFilter,
  activeQuickView: 'all',
  activeCategory: null,
};

export const ProductIntelligenceStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    // Filtered products based on all filter criteria
    filteredProducts: computed(() => {
      let filtered = [...store.products()];
      const filter = store.filter();

      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower) ||
            p.tags?.some((t) => t.toLowerCase().includes(searchLower)),
        );
      }

      // Category filter
      if (filter.category) {
        filtered = filtered.filter((p) => p.category === filter.category);
      }

      // Relationship filter
      if (filter.relationship) {
        filtered = filtered.filter(
          (p) => p.relationship === filter.relationship,
        );
      }

      // Status filter
      if (filter.status) {
        filtered = filtered.filter((p) => p.status === filter.status);
      }

      // Platform filter
      if (filter.platform) {
        filtered = filtered.filter((p) => p.platform === filter.platform);
      }

      // Monetization filter
      if (filter.monetization) {
        filtered = filtered.filter(
          (p) => p.monetization === filter.monetization,
        );
      }

      // Recommended only
      if (filter.recommendedOnly) {
        filtered = filtered.filter((p) => p.recommendedForStudy === true);
      }

      // Has free tier
      if (filter.hasFreeTier) {
        filtered = filtered.filter((p) => p.hasFreeTier === true);
      }

      // Sorting
      filtered.sort((a, b) => {
        switch (filter.sort) {
          case 'priority-desc':
            return (b.priorityScore || 0) - (a.priorityScore || 0);
          case 'priority-asc':
            return (a.priorityScore || 0) - (b.priorityScore || 0);
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'users-desc':
            return (
              (b.metrics?.activeUsers || 0) - (a.metrics?.activeUsers || 0)
            );
          case 'revenue-desc':
            return (
              (b.metrics?.revenueMonthly || 0) -
              (a.metrics?.revenueMonthly || 0)
            );
          default:
            return 0;
        }
      });

      return filtered;
    }),

    // Counts for quick views
    allProductsCount: computed(() => store.products().length),
    ourProductsCount: computed(
      () =>
        store.products().filter((p) => p.relationship === 'Our Product').length,
    ),
    competitorsCount: computed(
      () =>
        store.products().filter((p) => p.relationship === 'Competitor').length,
    ),
    recommendedCount: computed(
      () =>
        store.products().filter((p) => p.recommendedForStudy === true).length,
    ),

    // Category counts
    gamesCount: computed(
      () => store.products().filter((p) => p.category === 'Game').length,
    ),
    aiAgentsCount: computed(
      () => store.products().filter((p) => p.category === 'AI Agent').length,
    ),
    coursesCount: computed(
      () =>
        store.products().filter((p) => p.category === 'Online Course').length,
    ),
    saasCount: computed(
      () =>
        store.products().filter((p) => p.category === 'SaaS Application')
          .length,
    ),
    mobileAppsCount: computed(
      () => store.products().filter((p) => p.category === 'Mobile App').length,
    ),

    // Stats
    totalCompanies: computed(() => store.companies().length),

    // Active filters list for display
    activeFilters: computed(() => {
      const filter = store.filter();
      const filters: { label: string; key: keyof ProductFilter }[] = [];

      if (filter.search)
        filters.push({ label: `"${filter.search}"`, key: 'search' });
      if (filter.category)
        filters.push({ label: filter.category, key: 'category' });
      if (filter.relationship)
        filters.push({ label: filter.relationship, key: 'relationship' });
      if (filter.status) filters.push({ label: filter.status, key: 'status' });
      if (filter.platform)
        filters.push({ label: filter.platform, key: 'platform' });
      if (filter.monetization)
        filters.push({ label: filter.monetization, key: 'monetization' });
      if (filter.recommendedOnly)
        filters.push({ label: '⭐ Recommended', key: 'recommendedOnly' });
      if (filter.hasFreeTier)
        filters.push({ label: '🆓 Free Tier', key: 'hasFreeTier' });

      return filters;
    }),

    // Check if data is loaded
    isLoaded: computed(() => !store.loading() && store.products().length > 0),
    isEmpty: computed(() => !store.loading() && store.products().length === 0),
  })),

  // Second withComputed block to access filteredProducts
  withComputed((store) => ({
    visibleCount: computed(() => store.filteredProducts().length),
  })),

  withMethods((store, facade = inject(ProductIntelligenceFacade)) => ({
    // Load all data
    loadData: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          facade.loadAllData().pipe(
            tap(({ products, companies }) => {
              patchState(store, {
                products,
                companies,
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to load data',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    // Quick view actions
    setQuickView(view: QuickView) {
      const updates: Partial<ProductIntelligenceState> = {
        activeQuickView: view,
        activeCategory: null,
        filter: { ...initialFilter },
      };

      switch (view) {
        case 'our-products':
          updates.filter = { ...initialFilter, relationship: 'Our Product' };
          break;
        case 'competitors':
          updates.filter = { ...initialFilter, relationship: 'Competitor' };
          break;
        case 'recommended':
          updates.filter = { ...initialFilter, recommendedOnly: true };
          break;
      }

      patchState(store, updates);
    },

    // Category tab actions
    setCategory(category: ProductCategory | null) {
      patchState(store, {
        activeCategory: category,
        filter: { ...store.filter(), category },
      });
    },

    // Filter updates
    updateFilter(updates: Partial<ProductFilter>) {
      patchState(store, {
        filter: { ...store.filter(), ...updates },
      });
    },

    setSearch(search: string) {
      patchState(store, {
        filter: { ...store.filter(), search },
      });
    },

    setSort(sort: ProductSort) {
      patchState(store, {
        filter: { ...store.filter(), sort },
      });
    },

    toggleRecommendedOnly() {
      const current = store.filter().recommendedOnly;
      patchState(store, {
        filter: { ...store.filter(), recommendedOnly: !current },
      });
    },

    toggleHasFreeTier() {
      const current = store.filter().hasFreeTier;
      patchState(store, {
        filter: { ...store.filter(), hasFreeTier: !current },
      });
    },

    // Clear single filter
    clearFilter(key: keyof ProductFilter) {
      const filter = { ...store.filter() };
      if (key === 'recommendedOnly' || key === 'hasFreeTier') {
        (filter[key] as boolean) = false;
      } else if (key === 'sort') {
        filter.sort = 'priority-desc';
      } else {
        (filter[key] as string | null) = key === 'search' ? '' : null;
      }
      patchState(store, { filter });
    },

    // Clear all filters
    clearAllFilters() {
      patchState(store, {
        filter: initialFilter,
        activeQuickView: 'all',
        activeCategory: null,
      });
    },

    // Select product
    selectProduct(product: Product | null) {
      patchState(store, { selectedProduct: product });
    },

    // Select company
    selectCompany(company: Company | null) {
      patchState(store, { selectedCompany: company });
    },

    // Clear error
    clearError() {
      patchState(store, { error: null });
    },
  })),
);
