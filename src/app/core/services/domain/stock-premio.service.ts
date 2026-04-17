import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { StockPremio } from '../../models/domain/stock-premio.model';
import { StockPremioCab } from '../../models/domain/stock-premio-cab.model';
import { CanjeDet } from '../../models/domain/canje-det.model';

@Injectable({ providedIn: 'root' })
export class StockPremioService {
  private readonly http      = inject(HttpClient);
  private readonly config    = inject(APP_CONFIG);
  private readonly base      = () => `${this.config.apiBaseUrl}stockpremios`;
  /** Endpoints heredados del backend usan "stockpremio" (singular) */
  private readonly baseLegacy = () => `${this.config.apiBaseUrl}stockpremio`;

  getAll(params?: Record<string, string | number>): Observable<StockPremio[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    return this.http.get<StockPremio[]>(this.base(), { params: httpParams }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getById(id: number): Observable<StockPremio> {
    return this.http.get<StockPremio>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  create(model: StockPremio): Observable<StockPremio> {
    return this.http.post<StockPremio>(this.base(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  update(id: number, model: StockPremio): Observable<StockPremio> {
    return this.http.put<StockPremio>(`${this.base()}/${id}`, model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** GET stockpremio?codempresa=X[&codsucursal=Y][&codpremio=Z]&size=10&page=N — lista paginada */
  traerStockPorPaginas(codEmpresa: number, codSucursal: number, codPremio: number, page: number): Observable<any> {
    let p = new HttpParams()
      .set('codempresa', codEmpresa)
      .set('size', 10)
      .set('page', page);
    if (codSucursal > 0) p = p.set('codsucursal', codSucursal);
    if (codPremio   > 0) p = p.set('codpremio', codPremio);
    return this.http.get<any>(this.baseLegacy(), { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** POST stockpremio/iniciarstock?codempresa=X&codpremio=Y — inicializa stock para un premio */
  iniciarstock(codEmpresa: number, codPremio: number): Observable<StockPremio[]> {
    const p = new HttpParams()
      .set('codempresa', codEmpresa)
      .set('codpremio', codPremio);
    return this.http.post<StockPremio[]>(`${this.baseLegacy()}/iniciarstock`, null, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** PUT stockpremio/ajustarstock?codstockpremio=X&cantidad=Y — ajusta existencia */
  ajustarstock(codStockPremio: number, cantidad: number): Observable<StockPremio> {
    const p = new HttpParams()
      .set('codstockpremio', codStockPremio)
      .set('cantidad', cantidad);
    return this.http.put<StockPremio>(`${this.baseLegacy()}/ajustarstock`, null, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** POST stockpremio/stockdoc — graba movimiento con cabecera + detalle */
  createMovimiento(body: StockPremioCab): Observable<StockPremioCab> {
    return this.http.post<StockPremioCab>(`${this.baseLegacy()}/stockdoc`, body).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** GET stockpremio/stockdocs — lista paginada de documentos de movimiento */
  findByFecha(size: number, page: number, fechainicio: string, fechafin: string,
              codSucursal: number, nroComprobante: string, operacion: string): Observable<any> {
    let p = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('fechainicio', fechainicio)
      .set('fechafin', fechafin);
    if (codSucursal > 0)     p = p.set('codsucursal', codSucursal);
    if (nroComprobante)      p = p.set('nrocomprobante', nroComprobante);
    if (operacion)           p = p.set('operacion', operacion);
    return this.http.get<any>(`${this.baseLegacy()}/stockdocs`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** GET stockpremio/canje?codsucursal=X&codpremio=Y — stock específico para canje */
  traerStockCanje(codSucursal: number, codPremio: number): Observable<StockPremio> {
    const params = new HttpParams()
      .set('codsucursal', codSucursal)
      .set('codpremio', codPremio);
    return this.http.get<StockPremio>(`${this.baseLegacy()}/canje`, { params }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** PUT stockpremio — actualiza stock (body completo, sin ID en URL) */
  updateStock(model: StockPremio): Observable<StockPremio> {
    return this.http.put<StockPremio>(this.baseLegacy(), model).pipe(
      catchError(e => throwError(() => e))
    );
  }

  /** PUT stockpremio/cancelarcomprometido?codsucursal=X — libera stock comprometido en bloque */
  cancelarComprometido(codSucursal: number, detalles: CanjeDet[]): Observable<any> {
    const params = new HttpParams().set('codsucursal', codSucursal);
    return this.http.put<any>(`${this.baseLegacy()}/cancelarcomprometido`, detalles, { params }).pipe(
      catchError(e => throwError(() => e))
    );
  }
}
