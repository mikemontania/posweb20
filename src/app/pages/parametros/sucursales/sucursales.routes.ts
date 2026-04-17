import { Routes } from '@angular/router';
export const sucursalesRoutes: Routes = [
  { path: '',               loadComponent: () => import('./sucursales.component').then(m => m.SucursalesComponent) },
  { path: 'formulario',     loadComponent: () => import('./sucursales-form.component').then(m => m.SucursalesComponentForm) },
  { path: 'formulario/:id', loadComponent: () => import('./sucursales-form.component').then(m => m.SucursalesComponentForm) },
];
