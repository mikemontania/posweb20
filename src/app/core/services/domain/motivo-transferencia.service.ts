import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { MotivoTransferencia } from '../../models/domain/motivo-transferencia.model';

@Injectable({ providedIn: 'root' })
export class MotivoTransferenciaService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}motivostransferencia`;

  getAll(params?: Record<string, string | number>): Observable<MotivoTransferencia[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<MotivoTransferencia[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<MotivoTransferencia> {
    return this.http.get<MotivoTransferencia>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: MotivoTransferencia): Observable<MotivoTransferencia> {
    return this.http.post<MotivoTransferencia>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: MotivoTransferencia): Observable<MotivoTransferencia> {
    return this.http.put<MotivoTransferencia>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }
}
