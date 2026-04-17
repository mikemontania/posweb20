import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideRouter, withComponentInputBinding,
  withViewTransitions, withRouterConfig
} from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { authInterceptor }    from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/auth.interceptor';
import { timeoutInterceptor } from './core/interceptors/timeout.interceptor';
import { APP_CONFIG }         from './core/tokens/app-config.token';
import { environment }        from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([
        // Orden importa:
        // 1. timeout  → aborta si tarda demasiado (opera sobre la respuesta)
        // 2. auth     → agrega Bearer token y maneja 401
        // 3. loading  → contador global de requests activas
        timeoutInterceptor,
        authInterceptor,
        loadingInterceptor,
      ])
    ),

    provideAnimationsAsync(),

    provideToastr({
      timeOut:           4000,
      positionClass:     'toast-top-right',
      preventDuplicates: true,
      progressBar:       true,
      closeButton:       true,
      maxOpened:         5,
    }),

    { provide: APP_CONFIG, useValue: environment },
  ],
};
