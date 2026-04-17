import { Routes } from '@angular/router';
export const vehiculosRoutes: Routes = [
  { path: '',               loadComponent: () => import('./vehiculos.component').then(m => m.VehiculosComponent) },
  { path: 'formulario',     loadComponent: () => import('./vehiculos-form.component').then(m => m.VehiculosForm) },
  { path: 'formulario/:id', loadComponent: () => import('./vehiculos-form.component').then(m => m.VehiculosForm) },
];
