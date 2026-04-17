import { Routes } from '@angular/router';
export const grupo_descuentoRoutes: Routes = [
  { path: '', loadComponent: () => import('./grupo-descuento.component').then(m => m.GrupoDescuentoComponent) },
  { path: 'formulario', loadComponent: () => import('./grupo-descuento-form.component').then(m => m.GrupoDescuentoFormComponent) },
  { path: 'formulario/:id', loadComponent: () => import('./grupo-descuento-form.component').then(m => m.GrupoDescuentoFormComponent) },
];
