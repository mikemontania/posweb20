import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Cliente } from '../../models/domain/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}clientes`;

  getAll(params?: Record<string, string | number>): Observable<Cliente[]> {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => p = p.set(k, String(v)));
    return this.http.get<Cliente[]>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.base(), cliente).pipe(catchError(e => throwError(() => e)));
  }

  update(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.base()}/${id}`, cliente).pipe(catchError(e => throwError(() => e)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  search(query: string, codEmpresa: number): Observable<any> {
    const params = new HttpParams().set('q', query).set('codempresa', codEmpresa);
    return this.http.get<any>(`${this.base()}/search`, { params }).pipe(catchError(e => throwError(() => e)));
  }

  getByDoc(doc: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.base()}/bydoc/${doc}`).pipe(catchError(e => throwError(() => e)));
  }

  /** Búsqueda paginada — responde con Page<T> de Spring */
  getPage(page: number, termino: string, codEmpresa: number, extraParams?: Record<string, any>): Observable<any> {
    let p = new HttpParams()
      .set('page', page)
      .set('size', 10)
      .set('codempresa', codEmpresa);
    if (termino && termino.trim()) {
      p = p.set('keyword', termino.trim());
    }
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => {
        if (v != null && v !== '') p = p.set(k, String(v));
      });
    }
    return this.http.get<any>(this.base(), { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }


  getClienteDefault(): Observable<any> {
    return this.http.get<any>(`${this.base()}/default`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** Cliente propietario de la empresa — usado en obsequios */
  getClientePropietario(): Observable<any> {
    return this.http.get<any>(`${this.base()}/propietario`).pipe(
      catchError(e => throwError(() => e))
    );
  }
}