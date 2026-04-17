import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthRoutingModule } from './auth/auth.routing';
  
import { NopagefoundComponent } from './layout/nopagefound/nopagefound.component';
import { PagesRoutingModule } from './pages/pages.routing';
const routes: Routes = [
  //  { path: 'login', component: LoginComponent }, 
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '**', component: NopagefoundComponent }
];

 

@NgModule({
    imports: [
      RouterModule.forRoot( routes, { useHash: true } ),
      PagesRoutingModule,
      AuthRoutingModule
    ],
    exports: [ RouterModule ]
  })
  export class AppRoutingModule { }