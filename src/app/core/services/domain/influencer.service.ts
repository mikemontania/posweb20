import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Influencer } from '../../models/domain/influencer.model';

@Injectable({ providedIn: 'root' })
export class InfluencerService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}influencers`;

  getAll(params?: Record<string, string | number>): Observable<Influencer[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Influencer[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Influencer> {
    return this.http.get<Influencer>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Influencer): Observable<Influencer> {
    return this.http.post<Influencer>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Influencer): Observable<Influencer> {
    return this.http.put<Influencer>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }
  /** Obtiene el descuento de un cupón influencer — idéntico a ng12 obtenerDescuento */
  obtenerDescuento(codEmpresa: number, cupon: string, codCliente: number): Observable<any> {
    const p = new HttpParams()
      .set('codempresa', codEmpresa)
      .set('cupon', cupon)
      .set('codcliente', codCliente);
    return this.http.get<any>(`${this.base()}/descuentocupon`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }
}