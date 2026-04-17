import { Routes } from '@angular/router';
export const pedidosListaRoutes: Routes = [
  { path: '', loadComponent: () => import('./pedidos-lista.component').then(m => m.PedidosListaComponent) },
  { path: 'id/:id', loadComponent: () => import('./pedido-detalle.component').then(m => m.PedidoDetalleComponent) },
];
