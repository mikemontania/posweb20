import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Empresas } from '../../models/domain/empresas.model';

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}empresas`;

  getAll(params?: Record<string, string | number>): Observable<Empresas[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<Empresas[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<Empresas> {
    return this.http.get<Empresas>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: Empresas): Observable<Empresas> {
    return this.http.post<Empresas>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: Empresas): Observable<Empresas> {
    return this.http.put<Empresas>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** PUT body-only (sin ID en URL) — idéntico al ng12 */
  updateBody(model: Empresas): Observable<Empresas> {
    return this.http.put<Empresas>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  uploadImage(image: File, codEmpresa: number): Observable<Empresas> {
    const form = new FormData();
    form.append('id', String(codEmpresa));
    form.append('image', image);
    return this.http.post<Empresas>(`${this.base()}/upload-image`, form).pipe(
      catchError(e => throwError(() => e))
    );
  }

  uploadImageReport(image: File, codEmpresa: number): Observable<Empresas> {
    const form = new FormData();
    form.append('id', String(codEmpresa));
    form.append('image', image);
    return this.http.post<Empresas>(`${this.base()}/upload-image/reportes`, form).pipe(
      catchError(e => throwError(() => e))
    );
  }
}
