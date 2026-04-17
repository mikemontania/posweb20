import { Routes } from '@angular/router';
export const historialPuntosRoutes: Routes = [
  { path: '', loadComponent: () => import('./historial-puntos.component').then(m => m.HistorialPuntosComponent) },
];
