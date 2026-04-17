import { Routes } from '@angular/router';
export const clientesRoutes: Routes = [
  { path: '',               loadComponent: () => import('./clientes.component').then(m => m.ClientesComponent) },
  { path: 'formulario',     loadComponent: () => import('./clientes-form.component').then(m => m.ClientesForm) },
  { path: 'formulario/:id', loadComponent: () => import('./clientes-form.component').then(m => m.ClientesForm) },
];
