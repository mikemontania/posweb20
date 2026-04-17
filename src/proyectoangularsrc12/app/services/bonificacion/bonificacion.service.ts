import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Bonificacion } from '../../models/bonificacion.model';

@Injectable()
export class BonificacionService {

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  get(cantidad: number, codListaPrecio: number) {
    // Redondea la cantidad al entero más cercano
    let cantidadRedondeada = Math.round(cantidad);
    if (cantidadRedondeada == 0) {
      cantidadRedondeada = 1;
    }
    let url: string = BASE_URL + 'bonificacion/venta?codlistaprecio=' + codListaPrecio + '&cantidad=' + cantidadRedondeada;
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  getBonificacionProducto(cantidad: number, codListaPrecio: number, codProducto: number) {
    // Redondea la cantidad al entero más cercano
    let cantidadRedondeada = Math.round(cantidad);
    if (cantidadRedondeada == 0) {
      cantidadRedondeada = 1;
    }
    let url: string = BASE_URL + 'bonificacion/producto?codlistaprecio=' + codListaPrecio + '&cantidad=' + cantidadRedondeada + '&codproducto=' + codProducto;
    return this.http.get(url)
      .map((resp: any) => resp);
  }
  getBonificacionKit(cantidad: number, codListaPrecio: number, grpMaterial: string) {
    // Redondea la cantidad al entero más cercano
    let cantidadRedondeada = Math.round(cantidad);
    if (cantidadRedondeada == 0) {
      cantidadRedondeada = 1;
    }
    let url: string = BASE_URL + 'bonificacion/kit?codlistaprecio=' + codListaPrecio + '&cantidad=' + cantidadRedondeada + '&grpmaterial=' + grpMaterial;
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  getBonificacionClnProducto(cantidad: number, codListaPrecio: number, codProducto: number, codCliente: number) {
    // Redondea la cantidad al entero más cercano
    let cantidadRedondeada = Math.round(cantidad);
    if (cantidadRedondeada == 0) {
      cantidadRedondeada = 1;
    }
    let url: string = BASE_URL + 'bonificacion/cliente_producto?codlistaprecio=' + codListaPrecio + '&cantidad=' + cantidadRedondeada + '&codproducto=' + codProducto + '&codcliente=' + codCliente;
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  getBonificacionClnKit(cantidad: number, codListaPrecio: number, grpMaterial: string, codCliente: number) {
    // Redondea la cantidad al entero más cercano
    let cantidadRedondeada = Math.round(cantidad);
    if (cantidadRedondeada == 0) {
      cantidadRedondeada = 1;
    }
    let url: string = BASE_URL + 'bonificacion/cliente_kit?codlistaprecio=' + codListaPrecio + '&cantidad=' + cantidadRedondeada + '&grpmaterial=' + grpMaterial + '&codcliente=' + codCliente;
    return this.http.get(url)
      .map((resp: any) => resp);
  }





  getByPage(page: number, termino: string) {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'bonificacion?size=10&page=' + page;
    } else {
      url = BASE_URL + 'bonificacion?size=10&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

  getById(id): Observable<Bonificacion> {
    return this.http.get<Bonificacion>(BASE_URL + 'bonificacion' + `/${id}`).pipe(
      catchError(e => {
        console.error(e.error.mensaje);
        Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  create(bonificacion: Bonificacion): Observable<Bonificacion> {
    console.log(bonificacion);
    return this.http.post(BASE_URL + 'bonificacion', bonificacion)
      .pipe(
        map((response: any) => response.bonificacion as Bonificacion),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  update(b: Bonificacion): Observable<Bonificacion> {
    return this.http.put<any>(BASE_URL + 'bonificacion', b).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


  delete(id: number) {
    return this.http.delete(BASE_URL + 'bonificacion' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
