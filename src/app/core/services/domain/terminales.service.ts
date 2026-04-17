import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Terminales } from '../../models/domain/terminales.model';

@Injectable({ providedIn: 'root' })
export class TerminalesService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}terminales`;

  getAll(params?: Record<string, string | number>): Observable<Terminales[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Terminales[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Terminales> {
    return this.http.get<Terminales>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Terminales): Observable<Terminales> {
    return this.http.post<Terminales>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Terminales): Observable<Terminales> {
    return this.http.put<Terminales>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  traerterminalesDisponibles(codEmpresa: number, codSucursal: number): Observable<any> {
    let p = new HttpParams().set('codempresa', codEmpresa);
    if (codSucursal > 0) p = p.set('codsucursal', codSucursal);
    return this.http.get<any>(this.base(), { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

}
