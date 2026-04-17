import { Routes } from '@angular/router';

export const stockPremioRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./stock-premio.component').then(m => m.StockPremioComponent),
  },
];
