import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG }             from '../../tokens/app-config.token';
import { Compra }                 from '../../models/domain/compra.model';
import { MotivoAnulacionCompra }  from '../../models/domain/motivo-anulacion-compra.model';
import { Proveedor }              from '../../models/domain/proveedor.model';
import { Usuarios }               from '../../models/domain/usuarios.model';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}compras`;

  getAll(params?: Record<string, any>): Observable<any> {
    let p = new HttpParams();
    if (params) Object.entries(params).filter(([,v]) => v != null && v !== '').forEach(([k, v]) => p = p.set(k, String(v)));
    return this.http.get<any>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getById(id: number): Observable<Compra> {
    return this.http.get<Compra>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  create(compra: any): Observable<any> {
    return this.http.post<any>(this.base(), compra).pipe(catchError(e => throwError(() => e)));
  }

  anular(id: number, motivo: MotivoAnulacionCompra): Observable<void> {
    return this.http.put<void>(`${this.base()}/anular/${id}`, motivo).pipe(catchError(e => throwError(() => e)));
  }

  // ── Búsqueda paginada ──────────────────────────────────
  findByFecha(
    page: number, fechainicio: string, fechafin: string,
    proveedor: Proveedor | null, usuario: Usuarios | null,
    nroComprobante: string, estado: string, size: number
  ): Observable<any> {
    let p = new HttpParams()
      .set('page', page).set('size', size)
      .set('fechainicio', fechainicio).set('fechafin', fechafin);
    if (proveedor)      p = p.set('codproveedor', proveedor.codProveedor);
    if (usuario)        p = p.set('codusuario', usuario.codUsuario);
    if (nroComprobante) p = p.set('nrocomprobante', nroComprobante);
    if (estado && estado !== 'TODOS') p = p.set('estado', estado);
    return this.http.get<any>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }
}
