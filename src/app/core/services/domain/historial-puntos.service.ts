import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { HistorialPunto } from '../../models/domain/historial-punto.model';

@Injectable({ providedIn: 'root' })
export class HistorialPuntoService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}historialespuntos`;
  private readonly baseLegacy = () => `${this.config.apiBaseUrl}historialpuntos`;

  getAll(params?: Record<string, string | number>): Observable<HistorialPunto[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<HistorialPunto[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<HistorialPunto> {
    return this.http.get<HistorialPunto>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: HistorialPunto): Observable<HistorialPunto> {
    return this.http.post<HistorialPunto>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: HistorialPunto): Observable<HistorialPunto> {
    return this.http.put<HistorialPunto>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getLista(codCliente: number | null, fechaInicio: string): Observable<HistorialPunto[]> {
    let p = new HttpParams().set('fechainicio', fechaInicio);
    if (codCliente) p = p.set('codCliente', codCliente);
    return this.http.get<HistorialPunto[]>(this.baseLegacy(), { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }
}
