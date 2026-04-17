import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { MotivoAnulacionCompra } from '../../models/domain/motivo-anulacion-compra.model';

@Injectable({ providedIn: 'root' })
export class MotivoAnulacionCompraService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}motivoAnulacionCompra`;

  getAll(params?: Record<string, string | number>): Observable<MotivoAnulacionCompra[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<MotivoAnulacionCompra[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<MotivoAnulacionCompra> {
    return this.http.get<MotivoAnulacionCompra>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: MotivoAnulacionCompra): Observable<MotivoAnulacionCompra> {
    return this.http.post<MotivoAnulacionCompra>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: MotivoAnulacionCompra): Observable<MotivoAnulacionCompra> {
    return this.http.put<MotivoAnulacionCompra>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }
}
