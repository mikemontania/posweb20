import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Credito } from '../../models/domain/credito.model';

@Injectable({ providedIn: 'root' })
export class CreditosService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}creditos`;

  getAll(params?: Record<string, string | number>): Observable<Credito[]> {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => p = p.set(k, String(v)));
    return this.http.get<Credito[]>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getById(id: number): Observable<Credito> {
    return this.http.get<Credito>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  buscarPaginado(
    fechaDesde: string, fechaHasta: string, codEmpresa: number,
    page: number, size: number,
    codCliente?: number, nroComprobante?: string, estado?: string, vencido?: boolean
  ): Observable<any> {
    let p = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta)
      .set('codEmpresa', codEmpresa)
      .set('page', page)
      .set('size', size);
    if (codCliente)     p = p.set('codCliente', codCliente);
    if (nroComprobante) p = p.set('nroComprobante', nroComprobante);
    if (vencido)        p = p.set('diasmora', 1);
    else if (estado && estado !== 'TODOS') p = p.set('estado', estado);
    return this.http.get<any>(`${this.base()}/buscar/paginado`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  buscarResumen(fechaDesde: string, fechaHasta: string, codEmpresa: number): Observable<any> {
    let p = new HttpParams()
      .set('fecini', fechaDesde)
      .set('fecfin', fechaHasta)
      .set('codempresa', codEmpresa);
    return this.http.get<any>(`${this.base()}/resumen`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }
}
