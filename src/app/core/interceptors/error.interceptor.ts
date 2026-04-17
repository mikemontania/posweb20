// ============================================================
//  ErrorInterceptor — Angular 20 (functional interceptor)
//
//  Maneja errores HTTP que los componentes NO esperan:
//    - 403 Forbidden  → "Sin permisos" (componentes solo manejan 401)
//    - 0 Network      → "Sin conexión" (distinto del timeout ya manejado)
//
//  Los errores 4xx/5xx de negocio (400, 404, 422, 500) los
//  maneja cada componente con su propio mensaje contextual.
//  Si una request lleva X-Silent no se muestra ningún toast.
// ============================================================
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/components/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Requests silenciosas no muestran toast
      if (req.headers.has('X-Silent')) return throwError(() => err);

      if (err.status === 403) {
        toast.error('No tiene permisos para realizar esta operación.', {
          title: 'Acceso denegado',
        });
      } else if (err.status === 0 && err.error?.timeout !== true) {
        // status 0 = error de red (CORS, sin servidor)
        // excludimos timeouts que ya maneja timeoutInterceptor (timeout:true)
        toast.warning('No se pudo conectar con el servidor. Verificá tu conexión.', {
          title: 'Sin conexión',
        });
      }

      return throwError(() => err);
    })
  );
};
