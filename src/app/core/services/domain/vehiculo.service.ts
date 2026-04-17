import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Vehiculo } from '../../models/domain/vehiculo.model';

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}vehiculos`;

  getAll(params?: Record<string, string | number>): Observable<Vehiculo[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Vehiculo[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** Búsqueda paginada — responde con Page<T> de Spring */
  getPage(page: number, termino: string, codEmpresa: number, extraParams?: Record<string, any>): Observable<any> {
    let p = new HttpParams()
      .set('page', page)
      .set('size', 10)
      .set('codempresa', codEmpresa);
    if (termino && termino.trim()) {
      p = p.set('keyword', termino.trim());
    }
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => {
        if (v != null && v !== '') p = p.set(k, String(v));
      });
    }
    return this.http.get<any>(this.base(), { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

}
