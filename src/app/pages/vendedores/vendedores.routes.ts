import { Routes } from '@angular/router';
export const vendedoresRoutes: Routes = [
  { path: '',               loadComponent: () => import('./vendedores.component').then(m => m.VendedoresComponent) },
  { path: 'formulario',     loadComponent: () => import('./vendedores-form.component').then(m => m.VendedoresForm) },
  { path: 'formulario/:id', loadComponent: () => import('./vendedores-form.component').then(m => m.VendedoresForm) },
];
