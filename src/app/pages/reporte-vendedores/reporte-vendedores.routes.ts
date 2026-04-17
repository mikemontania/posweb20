import { Routes } from '@angular/router';
export const reporteVendedoresRoutes: Routes = [
  { path: '', loadComponent: () => import('./reporte-vendedores.component').then(m => m.ReporteVendedoresComponent) },
];
