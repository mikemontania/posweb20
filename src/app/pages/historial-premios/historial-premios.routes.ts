import { Routes } from '@angular/router';
export const historialPremiosRoutes: Routes = [
  { path: '', loadComponent: () => import('./historial-premios.component').then(m => m.HistorialPremiosComponent) },
];
