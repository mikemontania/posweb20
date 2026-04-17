import { Routes } from '@angular/router';
export const cuponesRoutes: Routes = [
  { path: '', loadComponent: () => import('./cupones.component').then(m => m.CuponesComponent) },
];
