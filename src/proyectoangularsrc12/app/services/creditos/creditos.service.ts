import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { _throw as throwError } from 'rxjs/observable/throw';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Venta } from 'src/app/models/venta.model';
import { Credito } from 'src/app/models/credito';
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
@Injectable()
export class CreditosService {

  constructor(public http: HttpClient, public router: Router) { }

 // Crear crédito a partir de una venta
 crearCredito(venta: Venta): Observable<any> {
  return this.http.post<any>(`${BASE_URL}/crear`, venta).pipe(
    catchError((error) => {
      Swal.fire('Error', 'No se pudo crear el crédito', 'error');
      return throwError(error);
    })
  );
}

// Anular crédito por código de venta
anularCredito(codVenta: number): Observable<any> {
  return this.http.put<any>(`${BASE_URL}anular/${codVenta}`, {}).pipe(
    catchError((error) => {
      Swal.fire('Error', 'No se pudo anular el crédito', 'error');
      return throwError(error);
    })
  );
}

// Pagar crédito
pagarCredito(codCredito: number): Observable<any> {
  return this.http.put<any>(`${BASE_URL}creditos/pagar/${codCredito}`, {}).pipe(
    catchError((error) => {
      Swal.fire('Error', 'No se pudo pagar el crédito', 'error');
      return throwError(error);
    })
  );
}



buscarCreditos(
  fechaDesde: string,
  fechaHasta: string,
  codEmpresa: number,
  codCliente?: any,
  nroComprobante?: any,
  estado?: any,
  pagina: number = 0,
  tamanoPagina: number = 10
): Observable<Page<Credito>> {

  let params = new HttpParams()
    .set('fechaDesde', fechaDesde)
    .set('fechaHasta', fechaHasta)
    .set('codEmpresa', codEmpresa.toString())
    .set('page', pagina.toString())
    .set('size', tamanoPagina.toString());

  if (codCliente) {
    params = params.set('codCliente', codCliente.toString());
  }
  if (nroComprobante) {
    params = params.set('nroComprobante', nroComprobante);
  }
  if (estado) {
      if (estado == 'VENCIDO') {
        estado = null;
        params = params.set('diasmora', 1);
      }else if(estado != 'TODOS'){
        params = params.set('estado', estado);
      }
  }
  return this.http.get<Page<Credito>>(`${BASE_URL}creditos/buscar/paginado`, { params }).pipe(
    catchError((error) => {
      Swal.fire('Error', 'No se pudieron obtener los créditos en mora', 'error');
      return throwError(error);
    })
  );
}
buscarResumen(
  fechaDesde: string,
  fechaHasta: string,
  codEmpresa: number

): Observable<any> {

  let params = new HttpParams()
    .set('fecini', fechaDesde)
    .set('fecfin', fechaHasta)
    .set('codempresa', codEmpresa.toString())

  return this.http.get<any>(`${BASE_URL}creditos/resumen`, { params }).pipe(
    catchError((error) => {
      Swal.fire('Error', 'No se pudieron obtener los créditos en mora', 'error');
      return throwError(error);
    })
  );
}


// Obtener créditos en mora (No paginado)
obtenerCreditosEnMora(fechaVencimiento: string, estado: string): Observable<any[]> {
  const params = new HttpParams()
    .set('fechaVencimiento', fechaVencimiento)
    .set('estado', estado);

  return this.http.get<any[]>(`${BASE_URL}reportes/mora`, { params }).pipe(
    catchError((error) => {
      Swal.fire('Error', 'No se pudieron obtener los créditos en mora', 'error');
      return throwError(error);
    })
  );
}

// Obtener créditos en mora (Paginado)
obtenerCreditosEnMoraPaginado(fechaVencimiento: string, estado: string, pagina: number, tamanoPagina: number): Observable<any> {
  const params = new HttpParams()
    .set('fechaVencimiento', fechaVencimiento)
    .set('estado', estado)
    .set('pagina', pagina.toString())
    .set('tamanoPagina', tamanoPagina.toString());

  return this.http.get<any>(`${BASE_URL}reportes/mora/paginado`, { params }).pipe(
    catchError((error) => {
      Swal.fire('Error', 'No se pudieron obtener los créditos en mora paginados', 'error');
      return throwError(error);
    })
  );
}
}
