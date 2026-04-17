import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG }        from '../../tokens/app-config.token';
import { Cobranza }          from '../../models/domain/cobranza.model';
import { CobranzaResumen }   from '../../models/domain/cobranza-resumen.model';
import { ResumenMedioPago }  from '../../models/domain/resumen-medio-pago.model';

@Injectable({ providedIn: 'root' })
export class CobranzaService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}cobranzas`;

  getAll(params?: Record<string, any>): Observable<any> {
    let p = new HttpParams();
    if (params) Object.entries(params).filter(([,v]) => v != null && v !== '').forEach(([k, v]) => p = p.set(k, String(v)));
    return this.http.get<any>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getById(id: number): Observable<Cobranza> {
    return this.http.get<Cobranza>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  // ── Resúmenes para dashboard ───────────────────────────
  getResumenMedioPago(fechaInicio: string, fechaFin: string, codUsuario = 0, codSucursal = 0): Observable<ResumenMedioPago[]> {
    let p = new HttpParams().set('fechainicio', fechaInicio).set('fechafin', fechaFin);
    if (codUsuario)  p = p.set('codusuario', codUsuario);
    if (codSucursal) p = p.set('codsucursal', codSucursal);
    return this.http.get<ResumenMedioPago[]>(`${this.base()}/resumenmediopago`, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }

  // ── Reporte detalle cobranza ───────────────────────────
  getDetalleCobranza(
    page: number, fechainicio: string, fechafin: string,
    codMedioPago: number, codUsuario: number, codSucursal: number, size: number
  ): Observable<any> {
    let p = new HttpParams()
      .set('fechainicio', fechainicio).set('fechafin', fechafin)
      .set('page', page).set('size', size);
    if (codMedioPago) p = p.set('codmediopago', codMedioPago);
    if (codUsuario)   p = p.set('codusuario', codUsuario);
    if (codSucursal)  p = p.set('codsucursal', codSucursal);
    return this.http.get<any>(`${this.base()}/detallemediopago`, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }

  /** Reporte Excel detalle cobranza */
  getReporteDetalleCobranza(
    fechainicio: string, fechafin: string,
    codMedioPago: number, codUsuario: number, codSucursal: number
  ): Observable<CobranzaResumen[]> {
    let p = new HttpParams().set('fechainicio', fechainicio).set('fechafin', fechafin);
    if (codMedioPago) p = p.set('codmediopago', codMedioPago);
    if (codUsuario)   p = p.set('codusuario', codUsuario);
    if (codSucursal)  p = p.set('codsucursal', codSucursal);
    return this.http.get<CobranzaResumen[]>(`${this.base()}/reportedetallemediopago`, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }
}
