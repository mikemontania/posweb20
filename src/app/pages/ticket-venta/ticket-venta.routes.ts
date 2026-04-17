import { Routes } from '@angular/router';
export const ticketVentaRoutes: Routes = [
  { path: ':id', loadComponent: () => import('./ticket-venta.component').then(m => m.TicketVentaComponent) },
];
