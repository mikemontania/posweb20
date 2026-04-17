import { Routes } from '@angular/router';
export const terminalesRoutes: Routes = [
  { path: '', loadComponent: () => import('./terminales.component').then(m => m.TerminalesComponent) },
  { path: 'formulario', loadComponent: () => import('./terminales-form.component').then(m => m.TerminalesFormComponent) },
  { path: 'formulario/:id', loadComponent: () => import('./terminales-form.component').then(m => m.TerminalesFormComponent) },
];
