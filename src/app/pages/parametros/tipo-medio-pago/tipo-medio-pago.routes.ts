import { Routes } from '@angular/router';
export const tipo_medio_pagoRoutes: Routes = [
  { path: '', loadComponent: () => import('./tipo-medio-pago.component').then(m => m.TipoMedioPagoComponent) },
  { path: 'formulario', loadComponent: () => import('./tipo-medio-pago-form.component').then(m => m.TipoMedioPagoFormComponent) },
  { path: 'formulario/:id', loadComponent: () => import('./tipo-medio-pago-form.component').then(m => m.TipoMedioPagoFormComponent) },
];
