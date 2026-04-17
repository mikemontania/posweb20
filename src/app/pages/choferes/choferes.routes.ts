import { Routes } from '@angular/router';
export const choferesRoutes: Routes = [
  { path: '',               loadComponent: () => import('./choferes.component').then(m => m.ChoferesComponent) },
  { path: 'formulario',     loadComponent: () => import('./choferes-form.component').then(m => m.ChoferesForm) },
  { path: 'formulario/:id', loadComponent: () => import('./choferes-form.component').then(m => m.ChoferesForm) },
];
