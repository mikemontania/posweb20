import { Routes } from '@angular/router';
export const stockRoutes: Routes = [
  { path: '',               loadComponent: () => import('./stock.component').then(m => m.StockComponent) },
  { path: 'formulario',     loadComponent: () => import('./stock-form.component').then(m => m.StockForm) },
  { path: 'formulario/:id', loadComponent: () => import('./stock-form.component').then(m => m.StockForm) },
];
