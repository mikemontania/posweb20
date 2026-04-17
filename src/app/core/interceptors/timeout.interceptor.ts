// ============================================================
//  TimeoutInterceptor — Angular 20 (functional interceptor)
//
//  Aplica un timeout máximo a TODAS las requests HTTP.
//  Valor por defecto: 30 segundos (configurable por request).
//
//  Para sobrescribir en una request específica:
//    headers: new HttpHeaders({ 'X-Timeout': '60000' })  // 60s
//    headers: new HttpHeaders({ 'X-Timeout': '0' })      // sin límite
//
//  Si la request supera el tiempo → lanza TimeoutError
//  que el servicio puede capturar con catchError.
// ============================================================
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { timeout, catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/components/toast/toast.service';

// Timeout por defecto: 30 segundos
const DEFAULT_TIMEOUT_MS = 30_000;

export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  // Leer timeout personalizado del header X-Timeout
  const headerValue = req.headers.get('X-Timeout');
  const timeoutMs = headerValue !== null
    ? parseInt(headerValue, 10)
    : DEFAULT_TIMEOUT_MS;

  // Limpiar el header interno antes de enviar
  const cleanReq = req.clone({
    headers: req.headers.delete('X-Timeout'),
  });

  // Si timeoutMs === 0 → sin límite (útil para uploads grandes)
  if (timeoutMs === 0) return next(cleanReq);

  return next(cleanReq).pipe(
    timeout(timeoutMs),
    catchError(err => {
      // TimeoutError tiene name === 'TimeoutError'
      if (err?.name === 'TimeoutError') {
        const url  = req.url.split('?')[0].split('/').slice(-2).join('/');
        const secs = Math.round(timeoutMs / 1000);
        console.warn(`[TimeoutInterceptor] Request superó ${secs}s: ${url}`);

        // Solo mostrar toast si no es un request silencioso
        if (!req.headers.has('X-Silent')) {
          toast.warning(
            `La solicitud tardó más de ${secs} segundos. Verificá tu conexión.`,
            { title: 'Sin respuesta del servidor', timeOut: 6000 }
          );
        }

        // Convertir a HttpErrorResponse estándar para que los servicios
        // lo puedan manejar igual que cualquier otro error HTTP
        return throwError(() => new HttpErrorResponse({
          error: { message: `Timeout después de ${secs}s`, timeout: true },
          status: 0,
          statusText: 'Timeout',
          url: req.url,
        }));
      }
      return throwError(() => err);
    })
  );
};
