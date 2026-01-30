import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'games',
    loadComponent: () =>
      import('./pages/games/games.page').then((m) => m.GamesPage),
  },
  {
    path: 'games/:id',
    loadComponent: () =>
      import('./pages/game-detail/game-detail.page').then(
        (m) => m.GameDetailPage,
      ),
  },
  {
    path: 'competitors',
    loadComponent: () =>
      import('./pages/competitors/competitors.page').then(
        (m) => m.CompetitorsPage,
      ),
  },
  {
    path: 'features',
    loadComponent: () =>
      import('./pages/features/features.page').then((m) => m.FeaturesPage),
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./pages/analytics/analytics.page').then((m) => m.AnalyticsPage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },
  { path: '**', redirectTo: 'dashboard' },
];
