import { Routes } from '@angular/router';
export const proveedoresRoutes: Routes = [
  { path: '',               loadComponent: () => import('./proveedores.component').then(m => m.ProveedoresComponent) },
  { path: 'formulario',     loadComponent: () => import('./proveedores-form.component').then(m => m.ProveedoresForm) },
  { path: 'formulario/:id', loadComponent: () => import('./proveedores-form.component').then(m => m.ProveedoresForm) },
];
