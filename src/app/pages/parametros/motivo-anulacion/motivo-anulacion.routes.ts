import { Routes } from '@angular/router';

export const motivo_anulacionRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./motivo-anulacion.component').then(m => m.MotivoAnulacionComponent),
  },
  {
    path: 'formulario',
    loadComponent: () => import('./motivo-anulacion-form.component').then(m => m.MotivoAnulacionFormComponent),
  },
  {
    path: 'formulario/:id',
    loadComponent: () => import('./motivo-anulacion-form.component').then(m => m.MotivoAnulacionFormComponent),
  },
];
