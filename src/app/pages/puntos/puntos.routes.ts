import { Routes } from '@angular/router';
export const puntosRoutes: Routes = [
  { path: '',               loadComponent: () => import('./puntos.component').then(m => m.PuntosComponent) },
  { path: 'formulario',     loadComponent: () => import('./puntos-form.component').then(m => m.PuntosForm) },
  { path: 'formulario/:id', loadComponent: () => import('./puntos-form.component').then(m => m.PuntosForm) },
];
