import { Routes } from '@angular/router';

export const repartosRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./repartos.component').then(m => m.RepartosComponent),
  },
];
