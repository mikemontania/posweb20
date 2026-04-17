import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Descuento } from '../../models/domain/descuento.model';

@Injectable({ providedIn: 'root' })
export class DescuentoService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}descuentos`;

  getAll(params?: Record<string, string | number>): Observable<Descuento[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Descuento[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Descuento> {
    return this.http.get<Descuento>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Descuento): Observable<Descuento> {
    return this.http.post<Descuento>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Descuento): Observable<Descuento> {
    return this.http.put<Descuento>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** Alterna el estado activo/inactivo sin eliminar — endpoint cajero_sup */
  toggleEstado(id: number): Observable<any> {
    return this.http.put<any>(
      `${this.config.apiBaseUrl}cajero_sup/descuentos/estado?coddescuento=${id}`,
      null
    ).pipe(catchError(e => throwError(() => e)));
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


  getDescuento(tipoDescuento: string, valor: number, cantidad: number, codListaPrecio: number): Observable<any> {
    let p = new HttpParams()
      .set('tipo', tipoDescuento)
      .set('cantidad', cantidad)
      .set('codlistaprecio', codListaPrecio);
    if (tipoDescuento !== 'SUCURSAL') p = p.set('valor', valor);
    return this.http.get<any>(`${this.base()}/venta`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getDescuentoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getDescuentoByTipo(tipoDescuento: string, codListaPrecio: number): Observable<any> {
    return this.http.get<any>(`${this.base()}/tipo/${tipoDescuento}/${codListaPrecio}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

}
