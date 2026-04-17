import { Routes } from '@angular/router';
export const usuariosRoutes: Routes = [
  { path: '',               loadComponent: () => import('./usuarios.component').then(m => m.UsuariosComponent) },
  { path: 'formulario',     loadComponent: () => import('./usuarios-form.component').then(m => m.UsuariosForm) },
  { path: 'formulario/:id', loadComponent: () => import('./usuarios-form.component').then(m => m.UsuariosForm) },
];
