import { Routes } from '@angular/router';
export const forma_ventaRoutes: Routes = [
  { path: '', loadComponent: () => import('./forma-venta.component').then(m => m.FormaVentaComponent) },
  { path: 'formulario', loadComponent: () => import('./forma-venta-form.component').then(m => m.FormaVentaFormComponent) },
  { path: 'formulario/:id', loadComponent: () => import('./forma-venta-form.component').then(m => m.FormaVentaFormComponent) },
];
