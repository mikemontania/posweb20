import { Routes } from '@angular/router';
export const lista_precioRoutes: Routes = [
  { path: '', loadComponent: () => import('./lista-precio.component').then(m => m.ListaPrecioComponent) },
  { path: 'formulario', loadComponent: () => import('./lista-precio-form.component').then(m => m.ListaPrecioFormComponent) },
  { path: 'formulario/:id', loadComponent: () => import('./lista-precio-form.component').then(m => m.ListaPrecioFormComponent) },
];
