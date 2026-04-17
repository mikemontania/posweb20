import { Routes } from '@angular/router';
export const creditosListaRoutes: Routes = [
  { path: '', loadComponent: () => import('./creditos-lista.component').then(m => m.CreditosListaComponent) },
];
