import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { MotivoAnulacion } from '../../models/domain/motivo-anulacion.model';

@Injectable({ providedIn: 'root' })
export class MotivoAnulacionService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}motivoanulacion`;

  getAll(params?: Record<string, string | number>): Observable<MotivoAnulacion[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<MotivoAnulacion[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<MotivoAnulacion> {
    return this.http.get<MotivoAnulacion>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: MotivoAnulacion): Observable<MotivoAnulacion> {
    return this.http.post<MotivoAnulacion>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: MotivoAnulacion): Observable<MotivoAnulacion> {
    return this.http.put<MotivoAnulacion>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }
}
