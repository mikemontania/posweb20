import { Routes } from '@angular/router';
export const transferenciasNuevaRoutes: Routes = [
  { path: '', loadComponent: () => import('./transferencias-nueva.component').then(m => m.TransferenciasNuevaComponent) },
];
