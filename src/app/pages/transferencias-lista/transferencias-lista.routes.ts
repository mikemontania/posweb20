import { Routes } from '@angular/router';
export const transferenciasListaRoutes: Routes = [
  { path: '', loadComponent: () => import('./transferencias-lista.component').then(m => m.TransferenciasListaComponent) },
  { path: 'id/:id', loadComponent: () => import('./transferencia-detalle.component').then(m => m.TransferenciaDetalleComponent) },
];
