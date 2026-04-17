import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Rol } from '../../models/domain/rol.model';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}roles`;

  getAll(params?: Record<string, string | number>): Observable<Rol[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Rol[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Rol): Observable<Rol> {
    return this.http.post<Rol>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Rol): Observable<Rol> {
    return this.http.put<Rol>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }
}
