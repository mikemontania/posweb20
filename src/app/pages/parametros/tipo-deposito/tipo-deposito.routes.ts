import { Routes } from '@angular/router';

export const tipo_depositoRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tipo-deposito.component').then(m => m.TipoDepositoComponent),
  },
  {
    path: 'formulario',
    loadComponent: () => import('./tipo-deposito-form.component').then(m => m.TipoDepositoFormComponent),
  },
  {
    path: 'formulario/:id',
    loadComponent: () => import('./tipo-deposito-form.component').then(m => m.TipoDepositoFormComponent),
  },
];
