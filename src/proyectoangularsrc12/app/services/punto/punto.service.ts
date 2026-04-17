import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Punto } from '../../models/punto.model';
import Swal from 'sweetalert2';

@Injectable()
export class PuntoService {
  punto: Punto;


  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }
  getPunto(tipoPunto: string, valor: number, cantidad: number, codListaPrecio: number) {
    let url: string;
    switch (tipoPunto) {
      case 'UNO_DE_DOS': url = BASE_URL + 'puntos/venta?tipo=UNO_DE_DOS&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
      break;
      case 'UNO_DE_TRES': url = BASE_URL + 'puntos/venta?tipo=UNO_DE_TRES&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
      break;
      case 'UNO_DE_CUATRO': url = BASE_URL + 'puntos/venta?tipo=UNO_DE_CUATRO&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
      break;
      case 'UNO_DE_CINCO': url = BASE_URL + 'puntos/venta?tipo=UNO_DE_CINCO&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
      break;
      case 'UNO_DE_TODOS': url = BASE_URL + 'puntos/venta?tipo=UNO_DE_TODOS&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
      break;
      case 'PRODUCTO': url = BASE_URL + 'puntos/venta?tipo=PRODUCTO&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'CLIENTE': url = BASE_URL + 'puntos/venta?tipo=CLIENTE&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'IMPORTE': url = BASE_URL + 'puntos/venta?tipo=IMPORTE&valor=' + valor + '&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
      case 'SUCURSAL': url = BASE_URL + 'puntos/venta?tipo=SUCURSAL&cantidad=' + cantidad + '&codlistaprecio=' + codListaPrecio;
        break;
    }

    return this.http.get(url)
      .map((resp: any) => resp);
  }

  getPuntoByTipo(tipoPunto: string, codListaPrecio: number) {
    let url: string = BASE_URL + 'puntos/tipo/' + tipoPunto + '/' + codListaPrecio;
    return this.http.get(url)
      .map((resp: any) => resp[0]);
  }
  searchPuntos(termino: string) {
    let url = BASE_URL + 'puntos?page=0' + '&keyword=' + termino;
    console.log(url);
    return this.http.get(url)
      .map((response: any) => {
        return response.content;
      });
  }
  getPuntosPorPaginas(page: number, termino: string) {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'puntos?size=10&page=' + page;
    } else {
      url = BASE_URL + 'puntos?size=10&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

  getPuntosPorTermino(termino) {
    let url = BASE_URL + 'puntos?keyword=' + termino;
    return this.http.get(url)
      .map((resp: any) => resp);
  }
  delete(id: number) {
    return this.http.delete(BASE_URL + 'puntos' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  createPunto(punto: Punto): Observable<Punto> {
    console.log(punto);
    return this.http.post(BASE_URL + 'puntos', punto)
      .pipe(
        map((response: any) => response.punto as Punto),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getPuntoById(id): Observable<Punto> {
    return this.http.get<Punto>(BASE_URL + 'puntos' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/puntos']);
        console.error(e.error.mensaje);
        Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }


  updateEstado(codPunto): Observable<any> {
    let url: string = BASE_URL + 'cajero_sup/puntos/estado?codpunto=' + codPunto ;
    return this.http.put<any>(url,null).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  updatePunto(punto: Punto): Observable<any> {
    return this.http.put<any>(BASE_URL + 'puntos', punto).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  deletePunto(id: number): Observable<Punto> {
    return this.http.delete<Punto>(BASE_URL + 'puntos' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
