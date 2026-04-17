import { Routes } from '@angular/router';
export const depositosRoutes: Routes = [
  { path: '',               loadComponent: () => import('./depositos.component').then(m => m.Depositos) },
  { path: 'formulario',     loadComponent: () => import('./depositos-form.component').then(m => m.DepositosForm) },
  { path: 'formulario/:id', loadComponent: () => import('./depositos-form.component').then(m => m.DepositosForm) },
];
