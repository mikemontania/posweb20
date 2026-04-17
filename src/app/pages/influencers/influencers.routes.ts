import { Routes } from '@angular/router';
export const influencersRoutes: Routes = [
  { path: '', loadComponent: () => import('./influencers.component').then(m => m.InfluencersComponent) },
];
