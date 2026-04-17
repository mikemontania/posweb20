import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG }        from '../../tokens/app-config.token';
import { Stock }             from '../../models/domain/stock.model';
import { StockReport }       from '../../models/domain/stock-report.model';
import { VentaDetalle }      from '../../models/domain/venta-detalle.model';
import { TransferenciaDetalle } from '../../models/domain/transferencia-detalle.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}stock`;

  getAll(params?: Record<string, any>): Observable<any> {
    let p = new HttpParams();
    if (params) Object.entries(params).filter(([,v]) => v != null).forEach(([k, v]) => p = p.set(k, String(v)));
    return this.http.get<any>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getById(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  create(stock: Stock): Observable<Stock> {
    return this.http.post<Stock>(this.base(), stock).pipe(catchError(e => throwError(() => e)));
  }

  update(stock: Stock): Observable<Stock> {
    return this.http.put<Stock>(this.base(), stock).pipe(catchError(e => throwError(() => e)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  // ── Métodos específicos ────────────────────────────────

  /** Stock disponible para venta por producto/depósito */
  getStockVenta(codDeposito: number, codProducto: number): Observable<any> {
    let p = new HttpParams().set('codedeposito', codDeposito).set('codeproducto', codProducto);
    return this.http.get<any>(`${this.base()}/venta`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  /** Lista de stock disponible del depósito */
  getStockDisponible(codEmpresa: number, codDeposito: number): Observable<Stock[]> {
    let p = new HttpParams().set('codempresa', codEmpresa).set('coddeposito', codDeposito);
    return this.http.get<Stock[]>(`${this.base()}/stockdisponible`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  /** Reporte de stock por empresa/sucursal/depósito */
  getReport(codEmpresa: number, codSucursal: number, codDeposito: number): Observable<StockReport[]> {
    let p = new HttpParams()
      .set('codempresa', codEmpresa).set('codsucursal', codSucursal).set('coddeposito', codDeposito);
    return this.http.get<StockReport[]>(`${this.base()}/reportestock`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  /** Reporte stock mínimo */
  getReportMinimo(codEmpresa: number, codSucursal: number, codDeposito: number): Observable<StockReport[]> {
    let p = new HttpParams()
      .set('codempresa', codEmpresa).set('codsucursal', codSucursal).set('coddeposito', codDeposito);
    return this.http.get<StockReport[]>(`${this.base()}/reportestockminimo`, { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  

  /** Cancela comprometidos al anular una transferencia */
  cancelarComprometidoTransferencia(codDeposito: number, detalles: TransferenciaDetalle[]): Observable<void> {
    let p = new HttpParams().set('codedeposito', codDeposito);
    return this.http.put<void>(`${this.base()}/cancelarcomprometidotransferencia`, detalles, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }

  /** Reembolsa stock al anular una venta */
  reembolsarStockExistencia(codDeposito: number, detalles: VentaDetalle[]): Observable<void> {
    let p = new HttpParams().set('codedeposito', codDeposito);
    return this.http.put<void>(`${this.base()}/reembolarstock`, detalles, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }

  /** Ajusta/recalcula el stock general */
  actualizarStock(): Observable<void> {
    return this.http.put<void>(`${this.base()}/ajustarStock`, null).pipe(catchError(e => throwError(() => e)));
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


  traerStock(codDeposito: number, codProducto: number): Observable<any> {
    let p = new HttpParams().set('codedeposito', codDeposito).set('codeproducto', codProducto);
    return this.http.get<any>(`${this.base()}/venta`, { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

 
/** Cancela comprometidos al anular una venta */
  cancelarComprometido(codDeposito: number, detalles: VentaDetalle[]): Observable<void> {
    let p = new HttpParams().set('codedeposito', codDeposito);
    return this.http.put<void>(`${this.base()}/cancelarcomprometido`, detalles, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }
}
