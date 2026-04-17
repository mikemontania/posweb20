import { Routes } from '@angular/router';

export const grupo_materialRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./grupo-material.component').then(m => m.GrupoMaterialComponent),
  },
  {
    path: 'formulario',
    loadComponent: () => import('./grupo-material-form.component').then(m => m.GrupoMaterialFormComponent),
  },
  {
    path: 'formulario/:id',
    loadComponent: () => import('./grupo-material-form.component').then(m => m.GrupoMaterialFormComponent),
  },
];
