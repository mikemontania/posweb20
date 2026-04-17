import { Routes } from '@angular/router';

export const categoriaRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./categoria.component').then(m => m.CategoriaComponent),
  },
  {
    path: 'formulario',
    loadComponent: () => import('./categoria-form.component').then(m => m.CategoriaFormComponent),
  },
  {
    path: 'formulario/:id',
    loadComponent: () => import('./categoria-form.component').then(m => m.CategoriaFormComponent),
  },
];
