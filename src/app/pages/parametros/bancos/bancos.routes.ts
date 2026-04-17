import { Routes } from '@angular/router';

export const bancosRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./bancos.component').then(m => m.BancosComponent),
  },
  {
    path: 'formulario',
    loadComponent: () => import('./bancos-form.component').then(m => m.BancosFormComponent),
  },
  {
    path: 'formulario/:id',
    loadComponent: () => import('./bancos-form.component').then(m => m.BancosFormComponent),
  },
];
