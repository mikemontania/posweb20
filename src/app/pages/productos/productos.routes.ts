import { Routes } from '@angular/router';
export const productosRoutes: Routes = [
  { path: '',               loadComponent: () => import('./productos.component').then(m => m.ProductosComponent) },
  { path: 'formulario',     loadComponent: () => import('./productos-form.component').then(m => m.ProductosForm) },
  { path: 'formulario/:id', loadComponent: () => import('./productos-form.component').then(m => m.ProductosForm) },
];
