// ============================================================
//  AuthInterceptor — Angular 20 (functional interceptor)
//  Agrega Bearer token. Maneja 401 → logout automático.
//  Usa AuthService.token (getter plano) en lugar de
//  leer localStorage directamente.
// ============================================================
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { APP_CONFIG } from '../tokens/app-config.token';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(APP_CONFIG);
  const auth   = inject(AuthService);

  // Solo interceptar requests a nuestra API (no a ABI u otros)
  const isApiRequest = req.url.startsWith(config.apiBaseUrl);
  if (!isApiRequest) return next(req);

  const token = auth.token;

  const authReq = token
    ? req.clone({
        headers: req.headers
          .set('Authorization', `Bearer ${token}`)
          // No pisar Content-Type si ya viene definido (ej: multipart/form-data)
          .set('Content-Type', req.headers.get('Content-Type') ?? 'application/json'),
      })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // El interceptor limpia sesión; AuthService.logout() hace el redirect
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};

// ── LoadingInterceptor — spinner global opcional ──────────
import { HttpInterceptorFn as Fn2 } from '@angular/common/http';
import { signal } from '@angular/core';
import { finalize } from 'rxjs/operators';

// Signal importable desde cualquier componente para mostrar spinner
export const globalLoadingCount = signal(0);
export const isLoading = () => globalLoadingCount() > 0;

export const loadingInterceptor: Fn2 = (req, next) => {
  const silent = req.headers.has('X-Silent');
  if (silent) return next(req);

  globalLoadingCount.update(n => n + 1);

  return next(req).pipe(
    finalize(() => globalLoadingCount.update(n => Math.max(0, n - 1)))
  );
};
