import { Routes } from '@angular/router';

export const mvStockPremioRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./mv-stock-premio.component').then(m => m.MvStockPremioComponent),
  },
];
