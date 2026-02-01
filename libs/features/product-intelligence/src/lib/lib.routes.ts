import { Route } from '@angular/router';

export const productIntelligenceRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products.page').then((m) => m.ProductsPage),
  },
  {
    path: 'comparison',
    loadComponent: () =>
      import('./pages/product-comparison/product-comparison.page').then(
        (m) => m.ProductComparisonPage,
      ),
  },
  {
    path: 'companies',
    loadComponent: () =>
      import('./pages/companies.page').then((m) => m.CompaniesPage),
  },
  {
    path: 'market',
    loadComponent: () =>
      import('./pages/market.page').then((m) => m.MarketPage),
  },
  {
    path: 'planning',
    loadComponent: () =>
      import('./pages/planning.page').then((m) => m.PlanningPage),
  },
  {
    path: 'features',
    loadComponent: () =>
      import('./pages/feature-matrix/feature-matrix.page').then(
        (m) => m.FeatureMatrixPage,
      ),
  },
];
