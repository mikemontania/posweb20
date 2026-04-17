import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { PrecioMaterial } from '../../models/domain/precio-material.model';

@Injectable({ providedIn: 'root' })
export class PrecioMaterialService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}precioMaterial`;

  getAll(params?: Record<string, string | number>): Observable<PrecioMaterial[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<PrecioMaterial[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<PrecioMaterial> {
    return this.http.get<PrecioMaterial>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: PrecioMaterial): Observable<PrecioMaterial> {
    return this.http.post<PrecioMaterial>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: PrecioMaterial): Observable<PrecioMaterial> {
    return this.http.put<PrecioMaterial>(`${this.base()}/${id}`, model).pipe(
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

  /** Precio costo actual por producto y sucursal — idéntico a ng12 findByPrecioCostoActual */
  findByPrecioCostoActual(codProductoErp: string, codSucursalErp: string): Observable<PrecioMaterial> {
    const p = new HttpParams()
      .set('codproductoerp', codProductoErp)
      .set('codsucursalerp', codSucursalErp);
    return this.http.get<PrecioMaterial>(`${this.base()}/precioCosto`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }
}