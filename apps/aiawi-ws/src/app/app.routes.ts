import { Route } from '@angular/router';
import { Layout } from '@aiawi-ws/layout';

export const appRoutes: Route[] = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('@aiawi-ws/dashboard').then(m => m.dashboardRoutes)
      },
      {
        path: 'games',
        loadChildren: () => import('@aiawi-ws/games').then(m => m.gamesRoutes)
      }
    ]
  }
];
