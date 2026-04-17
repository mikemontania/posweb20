import { Routes } from '@angular/router';

export const motivo_transferenciaRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./motivo-transferencia.component').then(m => m.MotivoTransferenciaComponent),
  },
  {
    path: 'formulario',
    loadComponent: () => import('./motivo-transferencia-form.component').then(m => m.MotivoTransferenciaFormComponent),
  },
  {
    path: 'formulario/:id',
    loadComponent: () => import('./motivo-transferencia-form.component').then(m => m.MotivoTransferenciaFormComponent),
  },
];
