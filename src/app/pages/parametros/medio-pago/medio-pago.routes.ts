import { Routes } from '@angular/router';
export const medio_pagoRoutes: Routes = [
  { path: '', loadComponent: () => import('./medio-pago.component').then(m => m.MedioPagoComponent) },
  { path: 'formulario', loadComponent: () => import('./medio-pago-form.component').then(m => m.MedioPagoFormComponent) },
  { path: 'formulario/:id', loadComponent: () => import('./medio-pago-form.component').then(m => m.MedioPagoFormComponent) },
];
