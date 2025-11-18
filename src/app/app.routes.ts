import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'environment',
    loadComponent: () => import('./pages/environment/environment.page').then(m => m.EnvironmentPage)
  }
];
