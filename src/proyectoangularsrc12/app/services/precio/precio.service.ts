import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Precio } from '../../models/precio.model';
import Swal from 'sweetalert2';

@Injectable()
export class PrecioService {
  precio: Precio;

  constructor(
    public http: HttpClient,
    public router: Router,
  ) {

  }

  cambiarPrecios(codListaPrecio: number, nuevosPrecios: Precio[]): Observable<any> {
    console.log('nuevosPrecios', nuevosPrecios)
    let url = BASE_URL + 'precios/cambioprecioporlista?codListaPrecio=' + codListaPrecio;
    return this.http.put<any>(url, nuevosPrecios).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


  getPrecioActual(codProductoErp: string, codListaPrecio: number): Observable<any> {
    return this.http.get(BASE_URL + 'precios/getByCodErp?codProductoErp=' + codProductoErp + '&codListaPrecio=' + codListaPrecio).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  traerPrecio(cantidad, codproducto, codlistaprecio, codcliente) {
    // Redondea la cantidad al entero más cercano
    let cantidadRedondeada = Math.round(cantidad);
    if (cantidadRedondeada == 0) {
      cantidadRedondeada =1;
    }

    let url = BASE_URL + 'precios/venta?cantidad=' + cantidadRedondeada + '&codproducto='
        + codproducto + '&codlistaprecio=' + codlistaprecio + '&codcliente=' + codcliente;
    console.log(url);
    return this.http.get(url)
        .map((resp: any) => {
            this.precio = resp;
            console.log(resp);
            return this.precio;
        });
}

  createPrecio(precio: Precio): Observable<Precio> {
    console.log(precio);
    return this.http.post(BASE_URL + 'precios', precio)
      .pipe(
        map((response: any) => response.precio as Precio),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  crearPrecios(precios )  {
     return this.http.post(BASE_URL + 'precios/all', precios)
      .pipe(
        map((response: any) => response ),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getPrecio(id): Observable<Precio> {
    return this.http.get<Precio>(BASE_URL + 'precios' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/precios']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  updatePrecio(precio: Precio): Observable<any> {
    return this.http.put<any>(BASE_URL + 'precios', precio).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  deletePrecio(id: number): Observable<Precio> {
    return this.http.delete<Precio>(BASE_URL + 'precios' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


  traerPreciosPorPaginasComponente(page: number, termino: string, codProd: number, codList: number) {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'precios?size=10&page=' + page;
    } else if (termino === 'PRODUCTO') {
      url = BASE_URL + 'precios?size=10&page=' + page + '&codproducto=' + codProd;
    } else if (termino === 'LISTAPRECIO') {
      url = BASE_URL + 'precios?size=10&page=' + page + '&codlistaprecio=' + codList;
    } else if (termino === 'LISTAPRECIO&PRODUCTO') {
      url = BASE_URL + 'precios?size=10&page=' + page + '&codlistaprecio=' + codList + '&codproducto=' + codProd;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

}
