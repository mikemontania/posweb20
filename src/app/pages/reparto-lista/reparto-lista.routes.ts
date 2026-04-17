import { Routes } from '@angular/router';
export const repartoListaRoutes: Routes = [
  { path: '', loadComponent: () => import('./reparto-lista.component').then(m => m.RepartoListaComponent) },
  { path: ':id', loadComponent: () => import('./reparto-lista.component').then(m => m.RepartoListaComponent) },
];
