import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'summary',
        loadComponent: () =>
          import('../pages/summary/summary.page').then((m) => m.SummaryPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('../pages/alerts/alerts.page').then((m) => m.AlertsPage),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('../pages/history/history.page').then((m) => m.HistoryPage),
      },
      {
        path: 'environment',
        loadComponent: () =>
          import('../pages/environment/environment.page').then((m) => m.EnvironmentPage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
