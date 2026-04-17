import { Routes } from '@angular/router';

export const motivo_anulacion_compraRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./motivo-anulacion-compra.component').then(m => m.MotivoAnulacionCompraComponent),
  },
  {
    path: 'formulario',
    loadComponent: () => import('./motivo-anulacion-compra-form.component').then(m => m.MotivoAnulacionCompraFormComponent),
  },
  {
    path: 'formulario/:id',
    loadComponent: () => import('./motivo-anulacion-compra-form.component').then(m => m.MotivoAnulacionCompraFormComponent),
  },
];
