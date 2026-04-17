import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Precio } from '../../models/domain/precio.model';

@Injectable({ providedIn: 'root' })
export class PrecioService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}precios`;

  getAll(params?: Record<string, string | number>): Observable<Precio[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Precio[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Precio> {
    return this.http.get<Precio>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Precio): Observable<Precio> {
    return this.http.post<Precio>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Precio): Observable<Precio> {
    return this.http.put<Precio>(`${this.base()}/${id}`, model).pipe(
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


  getPrecio(cantidad: number, codProducto: number, codListaPrecio: number, codCliente: number): Observable<any> {
    const cant = Math.round(cantidad);
    let p = new HttpParams()
      .set('cantidad', cant).set('codproducto', codProducto)
      .set('codlistaprecio', codListaPrecio).set('codcliente', codCliente);
    return this.http.get<any>(`${this.base()}/venta`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

}
