import { Routes } from '@angular/router';

export const unidad_medidaRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./unidad-medida.component').then(m => m.UnidadMedidaComponent),
  },
  {
    path: 'formulario',
    loadComponent: () => import('./unidad-medida-form.component').then(m => m.UnidadMedidaFormComponent),
  },
  {
    path: 'formulario/:id',
    loadComponent: () => import('./unidad-medida-form.component').then(m => m.UnidadMedidaFormComponent),
  },
];
