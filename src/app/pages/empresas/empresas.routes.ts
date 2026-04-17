import { Routes } from '@angular/router';
export const empresasRoutes: Routes = [
  { path: '', loadComponent: () => import('./empresas.component').then(m => m.EmpresasComponent) },
];
