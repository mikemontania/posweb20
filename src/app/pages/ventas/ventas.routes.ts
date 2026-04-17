import { Routes } from '@angular/router';
export const ventasRoutes: Routes = [
  { path: 'nueva',     loadComponent: () => import('./ventas.component').then(m => m.VentasComponent) },
  { path: 'obsequios', loadComponent: () => import('./obsequios.component').then(m => m.ObsequiosComponent) },
];
