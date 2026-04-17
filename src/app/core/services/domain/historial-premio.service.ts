import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { HistorialPremio } from '../../models/domain/historial-premio.model';

@Injectable({ providedIn: 'root' })
export class HistorialPremioService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}historialespremios`;
  private readonly baseLegacy = () => `${this.config.apiBaseUrl}historialpremio`;

  getAll(params?: Record<string, string | number>): Observable<HistorialPremio[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<HistorialPremio[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<HistorialPremio> {
    return this.http.get<HistorialPremio>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: HistorialPremio): Observable<HistorialPremio> {
    return this.http.post<HistorialPremio>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: HistorialPremio): Observable<HistorialPremio> {
    return this.http.put<HistorialPremio>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getLista(codSucursal: number, codPremio: number, fechaInicio: string): Observable<HistorialPremio[]> {
    let p = new HttpParams().set('fechainicio', fechaInicio);
    if (codSucursal) p = p.set('codSucursal', codSucursal);
    if (codPremio)   p = p.set('codPremio', codPremio);
    return this.http.get<HistorialPremio[]>(this.baseLegacy(), { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }
}
