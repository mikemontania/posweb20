import { Routes } from '@angular/router';

export const mvStockPremioDocsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./mv-stock-premio-docs.component').then(m => m.MvStockPremioDocsComponent),
  },
];
