import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Bonificacion } from '../../models/domain/bonificacion.model';

@Injectable({ providedIn: 'root' })
export class BonificacionService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}bonificacion`;

  getAll(params?: Record<string, string | number>): Observable<Bonificacion[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Bonificacion[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Bonificacion> {
    return this.http.get<Bonificacion>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Bonificacion): Observable<Bonificacion> {
    return this.http.post<Bonificacion>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Bonificacion): Observable<Bonificacion> {
    return this.http.put<Bonificacion>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** Búsqueda paginada */
  getPage(page: number, termino: string, codEmpresa: number, extraParams?: Record<string, any>): Observable<any> {
    let p = new HttpParams()
      .set('page', page)
      .set('size', 10)
      .set('codempresa', codEmpresa);
    if (termino && termino.trim()) p = p.set('keyword', termino.trim());
    if (extraParams) Object.entries(extraParams).forEach(([k, v]) => {
      if (v != null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<any>(this.base(), { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }


  getBonificacionProducto(cantidad: number, codListaPrecio: number, codProducto: number): Observable<any> {
    const cant = Math.round(cantidad);
    let p = new HttpParams().set('codlistaprecio', codListaPrecio).set('cantidad', cant).set('codproducto', codProducto);
    return this.http.get<any>(`${this.base()}/producto`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getBonificacionKit(cantidad: number, codListaPrecio: number, grpMaterial: string): Observable<any> {
    const cant = Math.round(cantidad);
    let p = new HttpParams().set('codlistaprecio', codListaPrecio).set('cantidad', cant).set('grpmaterial', grpMaterial);
    return this.http.get<any>(`${this.base()}/kit`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getBonificacionClnProducto(cantidad: number, codListaPrecio: number, codProducto: number, codCliente: number): Observable<any> {
    const cant = Math.round(cantidad);
    let p = new HttpParams().set('codlistaprecio', codListaPrecio).set('cantidad', cant).set('codproducto', codProducto).set('codcliente', codCliente);
    return this.http.get<any>(`${this.base()}/cliente_producto`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getBonificacionClnKit(cantidad: number, codListaPrecio: number, grpMaterial: string, codCliente: number): Observable<any> {
    const cant = Math.round(cantidad);
    let p = new HttpParams().set('codlistaprecio', codListaPrecio).set('cantidad', cant).set('grpmaterial', grpMaterial).set('codcliente', codCliente);
    return this.http.get<any>(`${this.base()}/cliente_kit`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

}
