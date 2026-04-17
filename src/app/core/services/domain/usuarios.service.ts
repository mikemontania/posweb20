import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Usuarios }   from '../../models/domain/usuarios.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}usuarios`;

  getAll(params?: Record<string, any>): Observable<Usuarios[]> {
    let p = new HttpParams();
    if (params) Object.entries(params).filter(([,v]) => v != null && v !== '').forEach(([k, v]) => p = p.set(k, String(v)));
    return this.http.get<Usuarios[]>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getById(id: number): Observable<Usuarios> {
    return this.http.get<Usuarios>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  create(model: Usuarios): Observable<Usuarios> {
    return this.http.post<Usuarios>(this.base(), model).pipe(catchError(e => throwError(() => e)));
  }

  update(id: number, model: Usuarios): Observable<Usuarios> {
    return this.http.put<Usuarios>(`${this.base()}/${id}`, model).pipe(catchError(e => throwError(() => e)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  /** Usuarios de una sucursal específica */
  getBySucursal(codSucursal: number): Observable<Usuarios[]> {
    const p = new HttpParams().set('codsucursal', codSucursal);
    return this.http.get<Usuarios[]>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  /** Subir imagen de perfil */
  uploadImage(imagen: File, codUsuario: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', imagen);
    return this.http.post<any>(`${this.base()}/upload/${codUsuario}`, formData)
      .pipe(catchError(e => throwError(() => e)));
  }

  /** Cambiar contraseña */
  cambiarContrasena(codUsuario: number, contrasena: string): Observable<void> {
    const p = new HttpParams().set('contrasena', contrasena);
    return this.http.put<void>(`${this.base()}/contrasena/${codUsuario}`, null, { params: p })
      .pipe(catchError(e => throwError(() => e)));
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

}
