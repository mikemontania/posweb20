import { Routes } from '@angular/router';

export const repartoDocsRoutes: Routes = [
  {
    path: ':codReparto/:codSucursal',
    loadComponent: () => import('./reparto-docs.component').then(m => m.RepartoDocsComponent),
  },
];
