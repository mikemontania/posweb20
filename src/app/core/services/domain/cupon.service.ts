import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Cupon } from '../../models/domain/cupon.model';

@Injectable({ providedIn: 'root' })
export class CuponService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}cupones`;

  getAll(params?: Record<string, string | number>): Observable<Cupon[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Cupon[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Cupon> {
    return this.http.get<Cupon>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Cupon): Observable<Cupon> {
    return this.http.post<Cupon>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Cupon): Observable<Cupon> {
    return this.http.put<Cupon>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }
  /** Busca un cupón por código — idéntico a ng12 getCuponByCupon */
  getByCupon(codEmpresa: number, cupon: string): Observable<Cupon> {
    const p = new HttpParams().set('codempresa', codEmpresa).set('cupon', cupon);
    return this.http.get<Cupon>(`${this.base()}/cupon`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** Lista paginada con keyword opcional — idéntico a ng12 getCuponesPorPaginas */
  getPage(page: number, keyword: string): Observable<any> {
    let p = new HttpParams().set('page', page).set('size', 20);
    if (keyword) p = p.set('keyword', keyword);
    return this.http.get<any>(`${this.base()}/paginado`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** Cambia estado activo de un cupón — idéntico a ng12 updateEstado */
  updateEstado(codCupon: number): Observable<any> {
    const p = new HttpParams().set('codcupon', codCupon);
    return this.http.put<any>(`${this.config.apiBaseUrl}cajero_sup/cupones/estado`, null, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** Invalida un cupón usado — idéntico a ng12 invalidarCupon */
  invalidarCupon(cupon: string, docNro: string, razonSocial: string): Observable<any> {
    const p = new HttpParams()
      .set('cupon', cupon)
      .set('docnro', docNro)
      .set('razonsocial', razonSocial);
    return this.http.put<any>(`${this.base()}/invalidar`, null, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }
}