import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Canje }      from '../../models/domain/canje.model';
import { Cliente }    from '../../models/domain/cliente.model';
import { Usuarios }   from '../../models/domain/usuarios.model';

@Injectable({ providedIn: 'root' })
export class CanjeService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}canjes`;

  getAll(params?: Record<string, any>): Observable<any> {
    let p = new HttpParams();
    if (params) Object.entries(params).filter(([,v]) => v != null && v !== '').forEach(([k, v]) => p = p.set(k, String(v)));
    return this.http.get<any>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getById(id: number): Observable<Canje> {
    return this.http.get<Canje>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  create(canje: any): Observable<any> {
    return this.http.post<any>(this.base(), canje).pipe(catchError(e => throwError(() => e)));
  }

  update(canje: any): Observable<any> {
    return this.http.put<any>(this.base(), canje).pipe(catchError(e => throwError(() => e)));
  }

  anular(id: number): Observable<void> {
    return this.http.put<void>(`${this.base()}/anular/${id}`, null).pipe(catchError(e => throwError(() => e)));
  }

  // ── Búsqueda paginada ──────────────────────────────────
  findByFecha(
    page: number, fechainicio: string, fechafin: string,
    cliente: Cliente | null, usuario: Usuarios | null,
    codSucursal: number, size: number, estado: string, anulado: any, nroCanje: number
  ): Observable<any> {
    let p = new HttpParams()
      .set('page', page).set('size', size)
      .set('fechainicio', fechainicio).set('fechafin', fechafin);
    if (cliente)         p = p.set('codcliente', cliente.codCliente);
    if (usuario)         p = p.set('codusuario', usuario.codUsuario);
    if (codSucursal > 0) p = p.set('codsucursal', codSucursal);
    if (estado)          p = p.set('estado', estado);
    if (anulado != null) p = p.set('anulado', String(anulado));
    if (nroCanje > 0)    p = p.set('nrocanje', nroCanje);
    return this.http.get<any>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }
}
