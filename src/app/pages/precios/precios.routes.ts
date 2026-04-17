import { Routes } from '@angular/router';
export const preciosRoutes: Routes = [
  { path: '',               loadComponent: () => import('./precios.component').then(m => m.PreciosComponent) },
  { path: 'formulario',     loadComponent: () => import('./precios-form.component').then(m => m.PreciosForm) },
  { path: 'formulario/:id', loadComponent: () => import('./precios-form.component').then(m => m.PreciosForm) },
];
