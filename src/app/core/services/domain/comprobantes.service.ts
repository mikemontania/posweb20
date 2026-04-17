import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Comprobantes } from '../../models/domain/comprobantes.model';

@Injectable({ providedIn: 'root' })
export class ComprobantesService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}comprobantes`;

  getAll(params?: Record<string, string | number>): Observable<Comprobantes[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Comprobantes[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Comprobantes> {
    return this.http.get<Comprobantes>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Comprobantes): Observable<Comprobantes> {
    return this.http.post<Comprobantes>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Comprobantes): Observable<Comprobantes> {
    return this.http.put<Comprobantes>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getComprobanteByTerminalId(codTerminal: number): Observable<any> {
    return this.http.get<any>(`${this.base()}/terminal/${codTerminal}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

}
