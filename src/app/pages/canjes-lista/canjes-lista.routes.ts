import { Routes } from '@angular/router';
export const canjesListaRoutes: Routes = [
  { path: '', loadComponent: () => import('./canjes-lista.component').then(m => m.CanjesListaComponent) },
  { path: 'id/:id', loadComponent: () => import('./canje-detalle.component').then(m => m.CanjeDetalleComponent) },
];
