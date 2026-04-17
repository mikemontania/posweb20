import { Routes } from '@angular/router';
export const canjesRoutes: Routes = [
  { path: '', loadComponent: () => import('./canjes.component').then(m => m.CanjesComponent) },
];
