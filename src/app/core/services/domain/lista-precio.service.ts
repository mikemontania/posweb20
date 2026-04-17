import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { ListaPrecio } from '../../models/domain/lista-precio.model';

@Injectable({ providedIn: 'root' })
export class ListaPrecioService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}listaprecio`;

  getAll(params?: Record<string, string | number>): Observable<ListaPrecio[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<ListaPrecio[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<ListaPrecio> {
    return this.http.get<ListaPrecio>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: ListaPrecio): Observable<ListaPrecio> {
    return this.http.post<ListaPrecio>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: ListaPrecio): Observable<ListaPrecio> {
    return this.http.put<ListaPrecio>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getListEcommerce(): Observable<any> {
    return this.http.get<any>(`${this.base()}/ecommerce`).pipe(
      catchError(e => throwError(() => e))
    );
  }

}
