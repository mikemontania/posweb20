import { Routes } from '@angular/router';
export const pedidosRoutes: Routes = [
  { path: 'nueva',     loadComponent: () => import('./pedidos.component').then(m => m.PedidosComponent) }, 
];
