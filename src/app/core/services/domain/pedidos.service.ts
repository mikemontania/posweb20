import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG }      from '../../tokens/app-config.token';
import { Pedido }          from '../../models/domain/pedido.model';
import { MotivoAnulacion } from '../../models/domain/motivo-anulacion.model';
import { Cliente }         from '../../models/domain/cliente.model';
import { Usuarios }        from '../../models/domain/usuarios.model';
import { TotalModel }      from '../../models/domain/total-model.model';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}pedidos`;

  getAll(params?: Record<string, any>): Observable<any> {
    let p = new HttpParams();
    if (params) Object.entries(params).filter(([,v]) => v != null && v !== '').forEach(([k, v]) => p = p.set(k, String(v)));
    return this.http.get<any>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  /** Crear / concretar pedido */
  create(pedido: any): Observable<any> {
    return this.http.post<any>(this.base(), pedido).pipe(catchError(e => throwError(() => e)));
  }

  update(pedido: any): Observable<any> {
    return this.http.put<any>(this.base(), pedido).pipe(catchError(e => throwError(() => e)));
  }

  anular(id: number, motivo?: MotivoAnulacion): Observable<void> {
    return this.http.put<void>(`${this.base()}/anular/${id}`, motivo ?? null).pipe(catchError(e => throwError(() => e)));
  }

  confirmar(id: number): Observable<void> {
    return this.http.put<void>(`${this.base()}/confirmar/${id}`, null).pipe(catchError(e => throwError(() => e)));
  }

  procesar(id: number): Observable<void> {
    return this.http.put<void>(`${this.base()}/procesar/${id}`, null).pipe(catchError(e => throwError(() => e)));
  }

  entregar(id: number): Observable<void> {
    return this.http.put<void>(`${this.base()}/entregar/${id}`, null).pipe(catchError(e => throwError(() => e)));
  }

  /** Pedidos PENDIENTE (últimos 90 días) para el indicador del header */
  findPendientes(codSucursal: number): Observable<any> {
    const today = new Date().toISOString().slice(0, 10);
    const from  = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return this.findByFecha(0, from, today, null, null, codSucursal, 100, 'PENDIENTE', null, '', 0);
  }

  // ── Búsqueda paginada ──────────────────────────────────
  findByFecha(
    page: number, fechainicio: string, fechafin: string,
    cliente: Cliente | null, usuario: Usuarios | null, codSucursal: number,
    size: number, estado: string, anulado: any, tipoPedido: string, nroPedido: number
  ): Observable<any> {
    let p = new HttpParams()
      .set('page', page).set('size', size)
      .set('fechainicio', fechainicio).set('fechafin', fechafin);
    if (cliente)            p = p.set('codcliente', cliente.codCliente);
    if (usuario)            p = p.set('codusuario', usuario.codUsuario);
    if (codSucursal > 0)    p = p.set('codsucursal', codSucursal);
    if (estado && estado !== 'TODOS') p = p.set('estado', estado);
    if (anulado != null)    p = p.set('anulado', String(anulado));
    if (tipoPedido)         p = p.set('tipopedido', tipoPedido);
    if (nroPedido > 0)      p = p.set('nropedido', nroPedido);
    return this.http.get<any>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  // ── Totales para footer ───────────────────────────────
  findTotal(
    fechainicio: string, fechafin: string,
    cliente: Cliente | null, usuario: Usuarios | null, codSucursal: number,
    estado: string, tipoPedido: string, nroPedido: number
  ): Observable<TotalModel> {
    let p = new HttpParams().set('fechainicio', fechainicio).set('fechafin', fechafin);
    if (cliente)           p = p.set('codcliente', cliente.codCliente);
    if (usuario)           p = p.set('codusuario', usuario.codUsuario);
    if (codSucursal > 0)   p = p.set('codsucursal', codSucursal);
    if (estado && estado !== 'TODOS') p = p.set('estado', estado);
    if (tipoPedido)        p = p.set('tipo', tipoPedido);
    if (nroPedido > 0)     p = p.set('nropedido', nroPedido);
    return this.http.get<TotalModel>(`${this.base()}/totales`, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }

  /** Actualiza la fecha real de retiro */
  updateFechaReal(id: number, fechaReal: string): Observable<void> {
    let p = new HttpParams().set('fechaReal', fechaReal);
    return this.http.put<void>(`${this.base()}/fechaReal/${id}`, null, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }

  /** Actualiza contraseña de retiro (ABI) */
  updateContrasena(codOrdenAbi: number, contrasena: string): Observable<void> {
    let p = new HttpParams().set('codOrdenAbi', codOrdenAbi).set('contrasena', contrasena);
    return this.http.put<void>(`${this.base()}/contrasena`, null, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }

  /** Confirma fecha retiro ABI */
  confirmarFechaRetiro(codOrdenAbi: number, fechaRetiro: string): Observable<void> {
    let p = new HttpParams().set('codOrdenAbi', codOrdenAbi).set('fechaRetiro', fechaRetiro);
    return this.http.put<void>(`${this.base()}/confirmarFechaRetiro`, null, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }
}
