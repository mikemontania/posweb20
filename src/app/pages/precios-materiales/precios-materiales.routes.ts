import { Routes } from '@angular/router';
export const precios_materialesRoutes: Routes = [
  { path: '',               loadComponent: () => import('./precios-materiales.component').then(m => m.PreciosMaterialesComponent) },
  { path: 'formulario',     loadComponent: () => import('./precios-materiales-form.component').then(m => m.PreciosMaterialesForm) },
  { path: 'formulario/:id', loadComponent: () => import('./precios-materiales-form.component').then(m => m.PreciosMaterialesForm) },
];
