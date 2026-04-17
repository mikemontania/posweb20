import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { StockPremio } from 'src/app/models/stockPremio.model';
import { CanjeDet } from 'src/app/models/canjeDet.model';
import { StockPremioCab } from 'src/app/models/stockPremioCab.model';
import * as moment from 'moment';
@Injectable()
export class StockPremioService {

  constructor(
    public http: HttpClient,
    public router: Router,
  ) {

  }

  traerStockPorPaginas(codEmpresa: number, codSucursal: number, codpremio: number, page: number) {
    let url = '';
    url = BASE_URL + 'stockpremio?codempresa=' + codEmpresa;

    if (codpremio > 0) {
      url = url + '&codpremio=' + codpremio;
    }

    if (codSucursal > 0) {
      url = url + '&codsucursal=' + codSucursal;
    }

    url = url + '&size=10&page=' + page;

    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

  getListStock(codempresa, codsucursal, codpremio, size) {
    let url = BASE_URL + 'stockpremio/stockpremio?codempresa=' + codempresa + '&codsucursal=' + codsucursal + '&codpremio=' + codpremio + '&size=' + size;
    console.log(url);
    return this.http.get(url)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  traerStock(codsucursal, codpremio) {
    let url = BASE_URL + 'stockpremio/canje?codsucursal=' + codsucursal + '&codpremio=' + codpremio;
    console.log(url);
    return this.http.get(url)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  iniciarstock(codempresa: number, codpremio: number): Observable<StockPremio[]> {
    const url = `${BASE_URL}stockpremio/iniciarstock?codempresa=${codempresa}&codpremio=${codpremio}`;
    return this.http.post(url, null).pipe(
      map((response: any) => response as StockPremio[]),
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  ajustarstock(codStockPremio: number, cantidad: number): Observable<StockPremio> {
    const url = `${BASE_URL}stockpremio/ajustarstock?codstockpremio=${codStockPremio}&cantidad=${cantidad}`;
    return this.http.put(url, null).pipe(
      map((response: any) => response as StockPremio),
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getById(id): Observable<StockPremio> {
    return this.http.get<StockPremio>(BASE_URL + 'stockpremio' + `/${id}`).pipe(
      catchError(e => {

        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


  findByFecha(size: number,page: number, fechainicio, fechafin,  codSucursal: number,  nroComprobante: string,  operacion:string, ) {
    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let url = BASE_URL + 'stockpremio/stockdocs?page=' + page + '&size=' + size;
    url += '&fechainicio=' + fechainicio + '&fechafin=' + fechafin;

    if (codSucursal > 0) {
      url += '&codsucursal=' + codSucursal;
    }
    if (nroComprobante) {
      url += '&nrocomprobante=' + nroComprobante;
    }
    if (operacion) {
      url += '&operacion=' + operacion;
    }

    console.log(url);
    return this.http.get<any>(url)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );

  }




  create(body: StockPremioCab) {
    console.log(body);

    let url = BASE_URL + 'stockpremio/stockdoc';
    return this.http.post(url, body)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  update(stock: StockPremio): Observable<any> {
    return this.http.put<any>(BASE_URL + 'stockpremio', stock).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  cancelarComprometido(codsucursal: number, detalles: CanjeDet[]): Observable<any> {
    let url = BASE_URL + 'stockpremio/cancelarcomprometido?codsucursal=' + codsucursal;
    return this.http.put<any>(url, detalles).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }



  reembolsarStockExistencia(codDeposito: number, detalles: CanjeDet[]): Observable<any> {
    console.log('detalles', detalles)
    let url = BASE_URL + 'stockpremio/reembolarstock?codedeposito=' + codDeposito;
    return this.http.put<any>(url, detalles).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }



}
