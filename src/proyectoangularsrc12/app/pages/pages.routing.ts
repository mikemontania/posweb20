import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuardGuard } from '../services/service.index';
import { PagesComponent } from './pages.component';

 
const pagesRoutes: Routes = [
    { 
        path: '', 
        component: PagesComponent,
        canActivate: [ LoginGuardGuard ],
      loadChildren: () => import('./child-routes.module').then( m => m.ChildRoutesModule )
    },
]; 
@NgModule({
    imports: [ RouterModule.forChild(pagesRoutes) ],
    exports: [ RouterModule ]
})
export class PagesRoutingModule {}