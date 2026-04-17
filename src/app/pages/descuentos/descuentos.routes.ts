import { Routes } from '@angular/router';
export const descuentosRoutes: Routes = [
  { path: '',               loadComponent: () => import('./descuentos.component').then(m => m.DescuentosComponent) },
  { path: 'formulario',     loadComponent: () => import('./descuentos-form.component').then(m => m.DescuentosForm) },
  { path: 'formulario/:id', loadComponent: () => import('./descuentos-form.component').then(m => m.DescuentosForm) },
];
