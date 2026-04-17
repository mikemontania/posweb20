import { Routes } from '@angular/router';
export const bonificacionesRoutes: Routes = [
  { path: '',               loadComponent: () => import('./bonificaciones.component').then(m => m.BonificacionesComponent) },
  { path: 'formulario',     loadComponent: () => import('./bonificaciones-form.component').then(m => m.BonificacionesForm) },
  { path: 'formulario/:id', loadComponent: () => import('./bonificaciones-form.component').then(m => m.BonificacionesForm) },
];
