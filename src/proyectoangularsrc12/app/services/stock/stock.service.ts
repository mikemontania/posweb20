import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Stock } from '../../models/stock.model';
import { VentaDetalle } from '../../models/VentaDetalle.model';
import { TransferenciaDetalle } from '../../models/transferenciaDetalle.model';

@Injectable()
export class StockService {

  constructor(
    public http: HttpClient,
    public router: Router,
  ) {

  }


  traerStock(codDeposito, codproducto) {
    let url = BASE_URL + 'stock/venta?codedeposito=' + codDeposito + '&codeproducto=' + codproducto;
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



  



  getStockDisponible(codempresa,  coddeposito) {
    let url = BASE_URL + 'stock/stockdisponible?codempresa=' + codempresa + '&coddeposito=' + coddeposito;
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


  getListStock(codempresa, codsucursal, coddeposito) {
    let url = BASE_URL + 'stock/reportestock?codempresa=' + codempresa + '&codsucursal=' + codsucursal+ '&coddeposito=' + coddeposito;
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

  getListStockMinimo(codempresa, codsucursal, coddeposito) {
    let url = BASE_URL + 'stock/reportestockminimo?codempresa=' + codempresa + '&codsucursal=' + codsucursal+ '&coddeposito=' + coddeposito;
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




  create(stock: Stock): Observable<Stock> {
    console.log(stock);
    return this.http.post(BASE_URL + 'stock', stock)
      .pipe(
        map((response: any) => response.stock as Stock),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getById(id): Observable<Stock> {
    return this.http.get<Stock>(BASE_URL + 'stock' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/stock']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  update(stock: Stock): Observable<any> {
    return this.http.put<any>(BASE_URL + 'stock', stock).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  cancelarComprometido(codDeposito: number, detalles: VentaDetalle[]): Observable<any> {
    let url = BASE_URL + 'stock/cancelarcomprometido?codedeposito=' + codDeposito;
    return this.http.put<any>(url, detalles).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  cancelarComprometidoTransferencia(codDeposito: number, detalles: TransferenciaDetalle[]): Observable<any> {
    let url = BASE_URL + 'stock/cancelarcomprometidotransferencia?codedeposito=' + codDeposito;
    return this.http.put<any>(url, detalles).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


  reembolsarStockExistencia(codDeposito: number, detalles: VentaDetalle[]): Observable<any> {
    console.log('detalles', detalles)
    let url = BASE_URL + 'stock/reembolarstock?codedeposito=' + codDeposito;
    return this.http.put<any>(url, detalles).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<Stock> {
    return this.http.delete<Stock>(BASE_URL + 'stock' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  actualizarStock(): Observable<any> {
    console.log('actualizarStock')
    let url = BASE_URL + 'stock/ajustarStock' ;
    return this.http.put<any>(url, null).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


  traerStockPorPaginas(codEmpresa: number, codSucursal: number, codDeposito: number, codproducto: number, codunidad: number, page: number) {
    let url = '';
    url = BASE_URL + 'stock?codempresa=' + codEmpresa;

    if (codDeposito > 0) {
      url = url + '&codedeposito=' + codDeposito;
    }

    if (codSucursal > 0) {
      url = url + '&codsucursal=' + codSucursal;
    }

    if (codproducto > 0) {
      url = url + '&codproducto=' + codproducto;
    }

    if (codunidad > 0) {
      url = url + '&codunidad=' + codunidad;
    }

    url = url + '&size=10&page=' + page;

    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

}
