import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Deposito } from '../../models/domain/deposito.model';

@Injectable({ providedIn: 'root' })
export class DepositoService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}depositos`;

  getAll(params?: Record<string, string | number>): Observable<Deposito[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Deposito[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Deposito> {
    return this.http.get<Deposito>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Deposito): Observable<Deposito> {
    return this.http.post<Deposito>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Deposito): Observable<Deposito> {
    return this.http.put<Deposito>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getDepositoVenta(codEmpresa: number, codSucursal: number): Observable<any> {
    let p = new HttpParams().set('codempresa', codEmpresa).set('codsucursal', codSucursal);
    return this.http.get<any>(`${this.base()}/venta`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

}
