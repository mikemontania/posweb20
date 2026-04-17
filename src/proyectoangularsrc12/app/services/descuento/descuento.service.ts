import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Descuento } from '../../models/descuento.model';
import Swal from 'sweetalert2';
import { convertToObject } from 'typescript';

@Injectable()
export class DescuentoService {
  descuento: Descuento;


  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }
  getDescuento(tipoDescuento: string, valor: number, cantidadValor: number, codListaPrecio: number) {
    let url: string;
    let cantidad = Math.round(cantidadValor);
    if (cantidad == 0) {
      cantidad =1;
    }
    switch (tipoDescuento) {
      case 'UNO_DE_DOS': url = BASE_URL + 'descuentos/venta?tipo=UNO_DE_DOS&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'UNO_DE_TRES': url = BASE_URL + 'descuentos/venta?tipo=UNO_DE_TRES&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'UNO_DE_CUATRO': url = BASE_URL + 'descuentos/venta?tipo=UNO_DE_CUATRO&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'UNO_DE_CINCO': url = BASE_URL + 'descuentos/venta?tipo=UNO_DE_CINCO&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'UNO_DE_TODOS': url = BASE_URL + 'descuentos/venta?tipo=UNO_DE_TODOS&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'PRODUCTO': url = BASE_URL + 'descuentos/venta?tipo=PRODUCTO&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'CLIENTE': url = BASE_URL + 'descuentos/venta?tipo=CLIENTE&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'CLIENTE_FULL': url = BASE_URL + 'descuentos/venta?tipo=CLIENTE_FULL&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'IMPORTE': url = BASE_URL + 'descuentos/venta?tipo=IMPORTE&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'SUCURSAL': url = BASE_URL + 'descuentos/venta?tipo=SUCURSAL&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
    }
    console.log(url);
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  getDescuentoByTipo(tipoDescuento: string, codListaPrecio: number) {
    let url: string = BASE_URL + 'descuentos/tipo/' + tipoDescuento + '/' + codListaPrecio;
    return this.http.get(url)
      .map((resp: any) => resp[0]);
  }
  searchDescuentos(termino: string) {
    let url = BASE_URL + 'descuentos?page=0' + '&keyword=' + termino;
    console.log(url);
    return this.http.get(url)
      .map((response: any) => {
        return response.content;
      });
  }
  getDescuentosPorPaginas(page: number, termino: string) {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'descuentos?size=10&page=' + page;
    } else {
      url = BASE_URL + 'descuentos?size=10&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

  getDescuentosPorTermino(termino) {
    let url = BASE_URL + 'descuentos?keyword=' + termino;
    return this.http.get(url)
      .map((resp: any) => resp);
  }
  delete(id: number) {
    return this.http.delete(BASE_URL + 'descuentos' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  createDescuento(descuento: Descuento): Observable<Descuento> {
    console.log(descuento);
    return this.http.post(BASE_URL + 'descuentos', descuento)
      .pipe(
        map((response: any) => response.descuento as Descuento),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getDescuentoById(id): Observable<Descuento> {
    return this.http.get<Descuento>(BASE_URL + 'descuentos' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/descuentos']);
        console.error(e.error.mensaje);
        Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }


  updateEstado(codDescuento): Observable<any> {
    let url: string = BASE_URL + 'cajero_sup/descuentos/estado?coddescuento=' + codDescuento;
    return this.http.put<any>(url, null).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  updateDescuento(descuento: Descuento): Observable<any> {
    return this.http.put<any>(BASE_URL + 'descuentos', descuento).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  deleteDescuento(id: number): Observable<Descuento> {
    return this.http.delete<Descuento>(BASE_URL + 'descuentos' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
