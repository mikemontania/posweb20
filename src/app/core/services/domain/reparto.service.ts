import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Reparto } from '../../models/domain/reparto.model';

@Injectable({ providedIn: 'root' })
export class RepartoService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}repartos`;

  getAll(params?: Record<string, string | number>): Observable<Reparto[]> {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => p = p.set(k, String(v)));
    return this.http.get<Reparto[]>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  getById(id: number): Observable<Reparto> {
    return this.http.get<Reparto>(`${this.base()}/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  create(reparto: Reparto): Observable<Reparto> {
    return this.http.post<Reparto>(this.base(), reparto).pipe(catchError(e => throwError(() => e)));
  }

  update(id: number, reparto: Reparto): Observable<Reparto> {
    return this.http.put<Reparto>(`${this.base()}/${id}`, reparto).pipe(catchError(e => throwError(() => e)));
  }

  anular(id: number): Observable<void> {
    return this.http.put<void>(`${this.base()}/anular/${id}`, null).pipe(catchError(e => throwError(() => e)));
  }

  findByFecha(
    page: number, fechainicio: string, fechafin: string,
    codSucursal: number, size = 20
  ): Observable<any> {
    let p = new HttpParams()
      .set('page', page).set('size', size)
      .set('fechainicio', fechainicio).set('fechafin', fechafin);
    if (codSucursal > 0) p = p.set('codsucursal', codSucursal);
    return this.http.get<any>(this.base(), { params: p }).pipe(catchError(e => throwError(() => e)));
  }

  /** GET repartos/marcadores?codreparto=X */
  getMarcadoresById(codReparto: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base()}/marcadores`, {
      params: new HttpParams().set('codreparto', codReparto)
    }).pipe(catchError(e => throwError(() => e)));
  }

  /** PUT repartos/marcadoreschangeorder?codreparto=X&codrepartodocs=Y&direccion=Z */
  changeOrder(codReparto: number, codRepartoDocs: number, direccion: string): Observable<any[]> {
    const p = new HttpParams()
      .set('codreparto', codReparto)
      .set('codrepartodocs', codRepartoDocs)
      .set('direccion', direccion);
    return this.http.put<any[]>(`${this.base()}/marcadoreschangeorder`, null, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }

  /** PUT repartos/marcadoressortsucursal?codreparto=X&codsucursal=Y */
  sortMarkerBySuc(codReparto: number, codSucursal: number): Observable<any[]> {
    const p = new HttpParams()
      .set('codreparto', codReparto)
      .set('codsucursal', codSucursal);
    return this.http.put<any[]>(`${this.base()}/marcadoressortsucursal`, null, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }

  /** PUT repartos/marcadoressortbymarcador?codreparto=X&codrepartodoc=Y */
  sortMarkerByMarcador(codReparto: number, codRepartoDocs: number): Observable<any[]> {
    const p = new HttpParams()
      .set('codreparto', codReparto)
      .set('codrepartodoc', codRepartoDocs);
    return this.http.put<any[]>(`${this.base()}/marcadoressortbymarcador`, null, { params: p })
      .pipe(catchError(e => throwError(() => e)));
  }

  /** GET repartos/reportedetalle/?fecha=X&codempresa=Y&codreparto=Z */
  verReporteDetallePdf(fecha: string, codEmpresa: number, codReparto: number): Observable<Blob> {
    const p = new HttpParams()
      .set('fecha', fecha).set('codempresa', codEmpresa).set('codreparto', codReparto);
    return this.http.get(`${this.base()}/reportedetalle/`, { params: p, responseType: 'blob' })
      .pipe(catchError(e => throwError(() => e)));
  }

  /** GET repartos/reportedocs/?fecha=X&codempresa=Y&codreparto=Z */
  verReporteDocsPdf(fecha: string, codEmpresa: number, codReparto: number): Observable<Blob> {
    const p = new HttpParams()
      .set('fecha', fecha).set('codempresa', codEmpresa).set('codreparto', codReparto);
    return this.http.get(`${this.base()}/reportedocs/`, { params: p, responseType: 'blob' })
      .pipe(catchError(e => throwError(() => e)));
  }

}
