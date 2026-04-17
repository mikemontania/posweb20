import { Routes } from '@angular/router';
export const alianzasRoutes: Routes = [
  { path: '',               loadComponent: () => import('./alianzas.component').then(m => m.AlianzasComponent) },
  { path: 'formulario',     loadComponent: () => import('./alianzas-form.component').then(m => m.AlianzasForm) },
  { path: 'formulario/:id', loadComponent: () => import('./alianzas-form.component').then(m => m.AlianzasForm) },
];
