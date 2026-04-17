import { Routes } from '@angular/router';
export const premiosRoutes: Routes = [
  { path: '',               loadComponent: () => import('./premios.component').then(m => m.PremiosComponent) },
  { path: 'formulario',     loadComponent: () => import('./premios-form.component').then(m => m.PremiosForm) },
  { path: 'formulario/:id', loadComponent: () => import('./premios-form.component').then(m => m.PremiosForm) },
];
