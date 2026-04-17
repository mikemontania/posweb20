import { Routes } from '@angular/router';
export const ventasListaRoutes: Routes = [
  { path: '', loadComponent: () => import('./ventas-lista.component').then(m => m.VentasListaComponent) },
  { path: 'id/:id', loadComponent: () => import('./venta-detalle.component').then(m => m.VentaDetalleComponent) },
];
