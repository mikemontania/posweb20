import { Routes } from '@angular/router';
export const cobranzaListaRoutes: Routes = [
  { path: '', loadComponent: () => import('./cobranza-lista.component').then(m => m.CobranzaListaComponent) },
];
