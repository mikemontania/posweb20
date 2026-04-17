import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Premio } from '../../models/domain/premio.model';

@Injectable({ providedIn: 'root' })
export class PremioService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}premios`;

  getAll(params?: Record<string, string | number>): Observable<Premio[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Premio[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Premio> {
    return this.http.get<Premio>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** Búsqueda paginada con puntosdesde/puntoshasta obligatorios */
  getPage(page: number, termino: string, codEmpresa: number,
          extraParams?: Record<string, any>): Observable<any> {
    let p = new HttpParams()
      .set('page', page)
      .set('size', 16)
      .set('codempresa', codEmpresa)
      .set('puntosdesde', extraParams?.['puntosdesde'] ?? 1)
      .set('puntoshasta', extraParams?.['puntoshasta'] ?? 999999999);
    if (termino && termino.trim()) p = p.set('keyword', termino.trim());
    if (extraParams) {
      Object.entries(extraParams)
        .filter(([k]) => !['puntosdesde', 'puntoshasta'].includes(k))
        .forEach(([k, v]) => { if (v != null && v !== '') p = p.set(k, String(v)); });
    }
    return this.http.get<any>(this.base(), { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Premio): Observable<Premio> {
    return this.http.post<Premio>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Premio): Observable<Premio> {
    return this.http.put<Premio>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  uploadImage(file: File, id: number): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>(`${this.base()}/upload-image/${id}`, formData).pipe(
      catchError(e => throwError(() => e))
    );
  }
}
