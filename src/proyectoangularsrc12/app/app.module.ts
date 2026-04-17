import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Rutas
import { AppRoutingModule  } from './app-routing.module';

// Modulos
import { PagesModule } from './pages/pages.module';

// temporal
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Servicios
import { ServiceModule } from './services/service.module';




// Componentes
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './services/interceptor/interceptor.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';  
import { AuthModule } from './auth/auth.module';
import { ComponentsModule } from './components/components.module';
import { NopagefoundComponent } from './layout/nopagefound/nopagefound.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';




@NgModule({
  declarations: [
    AppComponent,
    NopagefoundComponent,  
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    PagesModule,
    AuthModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceModule, 
    NgbModule,
    ToastrModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js'
    
   /* , {
      enabled: environment.production,
      // Registre el ServiceWorker tan pronto como la aplicación sea estable
      // o después de 30 segundos (lo que ocurra primero).
      registrationStrategy: 'registerWhenStable:30000'
    }*/
    ), 

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
