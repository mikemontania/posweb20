import { Routes } from '@angular/router';
export const comprasListaRoutes: Routes = [
  { path: '', loadComponent: () => import('./compras-lista.component').then(m => m.ComprasListaComponent) },
  { path: 'id/:id', loadComponent: () => import('./compra-detalle.component').then(m => m.CompraDetalleComponent) },
];
