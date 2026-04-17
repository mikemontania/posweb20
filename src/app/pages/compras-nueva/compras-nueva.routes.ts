import { Routes } from '@angular/router';
export const comprasNuevaRoutes: Routes = [
  { path: '', loadComponent: () => import('./compras-nueva.component').then(m => m.ComprasNuevaComponent) },
];
