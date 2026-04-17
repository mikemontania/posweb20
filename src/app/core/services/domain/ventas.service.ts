import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Venta }             from '../../models/domain/venta.model';
import { MotivoAnulacion }   from '../../models/domain/motivo-anulacion.model';
import { TopProductos }      from '../../models/domain/top-productos.model';
import { TopClientes }       from '../../models/domain/top-clientes.model';
import { ResumenSucursal }   from '../../models/domain/resumen-sucursal.model';
import { ResumenUsuario }    from '../../models/domain/resumen-usuario.model';
import { ResumenMedioPago, ResumenCanal } from '../../models/domain/resumen-medio-pago.model';
import { TotalModel }        from '../../models/domain/total-model.model';
import { Cliente }           from '../../models/domain/cliente.model';
import { Usuarios }          from '../../models/domain/usuarios.model';
import { Sucursal }          from '../../models/domain/sucursal.model';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}ventas`;

  // ── CRUD base ─────────────────────────────────────────
  getAll(params?: Record<string, any>): Observable<any> {
    let p = new HttpParams();
    if (params) Object.entries(params).filter(([,v]) => v != null && v !== '').forEach(([k, v]) => p = p.set(k, String(v)));
    return this.http.get<any>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.base()}/model/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  create(venta: Venta): Observable<Venta> {
    return this.http.post<Venta>(this.base(), venta).pipe(catchError(e => throwError(() => e)));
  }

  update(venta: Venta): Observable<Venta> {
    return this.http.put<Venta>(this.base(), venta).pipe(catchError(e => throwError(() => e)));
  }

  anular(id: number, motivo?: MotivoAnulacion): Observable<void> {
    return this.http.put<void>(`${this.base()}/anular/${id}`, motivo ?? null).pipe(catchError(e => throwError(() => e)));
  }

  // ── Búsqueda paginada (reemplaza findByFecha original) ─
  findByFecha(
    page: number, fechainicio: string, fechafin: string,
    cliente: Cliente | null, usuario: Usuarios | null, sucursal: Sucursal | null,
    nroComprobante: string, tipoVenta: string, estado: string,
    size: number, anulado: boolean | null
  ): Observable<any> {
    let p = new HttpParams()
      .set('page', page).set('size', size)
      .set('fechainicio', fechainicio).set('fechafin', fechafin);
    if (cliente)         p = p.set('codcliente', cliente.codCliente);
    if (usuario)         p = p.set('codusuario', usuario.codUsuario);
    if (sucursal)        p = p.set('codsucursal', sucursal.codSucursal);
    if (nroComprobante)  p = p.set('nrocomprobante', nroComprobante);
    if (tipoVenta)       p = p.set('tipo', tipoVenta);
    if (estado && estado !== 'TODOS') p = p.set('estado', estado);
    if (anulado != null) p = p.set('anulado', String(anulado));
    return this.http.get<any>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  // ── Lista completa para exportar (sin paginación) ──────
  listaVentas(
    fechainicio: string, fechafin: string,
    cliente: Cliente | null, usuario: Usuarios | null, sucursal: Sucursal | null,
    nroComprobante: string, tipo: string, estado: string, anulado: boolean | null
  ): Observable<Venta[]> {
    let p = new HttpParams().set('fechainicio', fechainicio).set('fechafin', fechafin);
    if (cliente)         p = p.set('codcliente', cliente.codCliente);
    if (usuario)         p = p.set('codusuario', usuario.codUsuario);
    if (sucursal)        p = p.set('codsucursal', sucursal.codSucursal);
    if (nroComprobante)  p = p.set('nrocomprobante', nroComprobante);
    if (tipo)            p = p.set('tipo', tipo);
    if (estado && estado !== 'TODOS') p = p.set('estado', estado);
    if (anulado != null) p = p.set('anulado', String(anulado));
    return this.http.get<Venta[]>(`${this.base()}/listadoventas`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  // ── Totales para footer ────────────────────────────────
  findTotal(
    fechainicio: string, fechafin: string,
    cliente: Cliente | null, usuario: Usuarios | null, sucursal: Sucursal | null,
    nroComprobante: string, tipo: string, estado: string
  ): Observable<TotalModel> {
    let p = new HttpParams().set('fechainicio', fechainicio).set('fechafin', fechafin);
    if (cliente)        p = p.set('codcliente', cliente.codCliente);
    if (usuario)        p = p.set('codusuario', usuario.codUsuario);
    if (sucursal)       p = p.set('codsucursal', sucursal.codSucursal);
    if (nroComprobante) p = p.set('nrocomprobante', nroComprobante);
    if (tipo)           p = p.set('tipo', tipo);
    if (estado && estado !== 'TODOS') p = p.set('estado', estado);
    return this.http.get<TotalModel>(`${this.base()}/totales`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  // ── PDF / Tickets ──────────────────────────────────────
  verTicketPdf(ventaId: number, tipo: string): Observable<Blob> {
    return this.http.get(`${this.base()}/report/`, {
      params: new HttpParams().set('venta_id', ventaId).set('tipo', tipo),
      responseType: 'blob'
    }).pipe(catchError(e => throwError(() => e)));
  }

  verTicket80Pdf(codVenta: number, tipoCopia: string): Observable<Blob> {
    return this.http.get(`${this.base()}/ticket/`, {
      params: new HttpParams().set('codVenta', codVenta).set('tipoCopia', tipoCopia),
      responseType: 'blob'
    }).pipe(catchError(e => throwError(() => e)));
  }

  traercomprobante(codVenta: number): Observable<Blob> {
    return this.http.get(`${this.base()}/comprobante/${codVenta}`, { responseType: 'blob' })
      .pipe(catchError(e => throwError(() => e)));
  }

  verReporteVendedoresPdf(fechaInicio: string, fechaFin: string, codEmpresa: number, codSucursal: number, codVendedor: number): Observable<Blob> {
    let p = new HttpParams()
      .set('fechainicio', fechaInicio).set('fechafin', fechaFin)
      .set('codempresa', codEmpresa).set('codsucursal', codSucursal).set('codvendedor', codVendedor);
    return this.http.get(`${this.base()}/reporteventasvendedor/`, { params: p, responseType: 'blob' })
      .pipe(catchError(e => throwError(() => e)));
  }

  // ── Dashboard ──────────────────────────────────────────
  getTopProductos(fechaInicio: string, fechaFin: string, codUsuario = 0, codSucursal = 0): Observable<TopProductos[]> {
    let p = new HttpParams().set('fechainicio', fechaInicio).set('fechafin', fechaFin);
    if (codUsuario)  p = p.set('codusuario', codUsuario);
    if (codSucursal) p = p.set('codsucursal', codSucursal);
    return this.http.get<TopProductos[]>(`${this.base()}/topproductos`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getTopClientes(fechaInicio: string, fechaFin: string, codUsuario = 0, codSucursal = 0): Observable<TopClientes[]> {
    let p = new HttpParams().set('fechainicio', fechaInicio).set('fechafin', fechaFin);
    if (codUsuario)  p = p.set('codusuario', codUsuario);
    if (codSucursal) p = p.set('codsucursal', codSucursal);
    return this.http.get<TopClientes[]>(`${this.base()}/topclientes`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getResumenSucursal(fechaInicio: string, fechaFin: string, codSucursal = 0): Observable<ResumenSucursal[]> {
    let p = new HttpParams().set('fechainicio', fechaInicio).set('fechafin', fechaFin);
    if (codSucursal) p = p.set('codsucursal', codSucursal);
    return this.http.get<ResumenSucursal[]>(`${this.base()}/resumensucursal`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getResumenUsuario(fechaInicio: string, fechaFin: string, codUsuario = 0, codSucursal = 0): Observable<ResumenUsuario[]> {
    let p = new HttpParams().set('fechainicio', fechaInicio).set('fechafin', fechaFin);
    if (codUsuario)  p = p.set('codusuario', codUsuario);
    if (codSucursal) p = p.set('codsucursal', codSucursal);
    return this.http.get<ResumenUsuario[]>(`${this.base()}/resumenusuario`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getResumenCanal(fechaInicio: string, fechaFin: string, codSucursal = 0): Observable<ResumenCanal[]> {
    let p = new HttpParams().set('fechainicio', fechaInicio).set('fechafin', fechaFin);
    if (codSucursal) p = p.set('codsucursal', codSucursal);
    return this.http.get<ResumenCanal[]>(`${this.base()}/resumencanal`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getResumenReparto(fechaInicio: string, fechaFin: string, codSucursal = 0): Observable<ResumenSucursal[]> {
    let p = new HttpParams().set('fechainicio', fechaInicio).set('fechafin', fechaFin);
    if (codSucursal) p = p.set('codsucursal', codSucursal);
    return this.http.get<ResumenSucursal[]>(`${this.base()}/resumensucursalreparto`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  /** Cierra la venta con cobranza — endpoint principal del POS */
  cerrarVenta(payload: { venta: any; descuentos?: any[] }): Observable<any> {
    return this.http.post<any>(`${this.base()}`, payload).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** Cierra un obsequio (esObsequio=true, sin cobranza real) */
  cerrarObsequio(payload: { venta: any; descuentos?: any[] }): Observable<any> {
    return this.http.post<any>(`${this.base()}/obsequio`, payload).pipe(
      catchError(e => throwError(() => e))
    );
  }

}
