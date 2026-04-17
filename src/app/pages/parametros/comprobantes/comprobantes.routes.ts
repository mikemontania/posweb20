import { Routes } from '@angular/router';
export const comprobantesRoutes: Routes = [
  { path: '',               loadComponent: () => import('./comprobantes.component').then(m => m.Comprobantes) },
  { path: 'formulario',     loadComponent: () => import('./comprobantes-form.component').then(m => m.ComprobantesForm) },
  { path: 'formulario/:id', loadComponent: () => import('./comprobantes-form.component').then(m => m.ComprobantesForm) },
];
