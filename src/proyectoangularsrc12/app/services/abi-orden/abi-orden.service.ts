import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import Swal from 'sweetalert2';
import { ABI_PATH } from '../../config/config';
import { ABI_Punto_Retiro } from '../../models/abi-punto-retiro.model';
import { ABI_Pedido } from '../../models/abi-pedido.model';
import { ABI_Producto } from '../../models/abi-producto.model';

@Injectable()
export class AbiOrdenService {
 
  constructor(
    public http: HttpClient,
    public router: Router 
  ) {
   

   }

   createPuntoRetiro(puntoRetiro: ABI_Punto_Retiro){
    return this.http.post<ABI_Punto_Retiro>(ABI_PATH+ '/punto-retiro/', puntoRetiro )
      .pipe(
        tap((response: any) => response as ABI_Punto_Retiro),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getPuntoRetiro( ) {
    let url = ABI_PATH+'/punto-retiro/' ;
     console.log(url);
   return this.http.get(url )
   .pipe(
    catchError(e => {
      console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
      return throwError(e);
    })
  ); 
  }

  getPuntoRetiroById(id): Observable<ABI_Punto_Retiro> {
    return this.http.get<ABI_Punto_Retiro>(ABI_PATH+ `/punto-retiro/${id}/` ).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  updatePuntoRetiro(puntoRetiro: ABI_Punto_Retiro) {
    return this.http.patch<ABI_Punto_Retiro>( ABI_PATH+ `/punto-retiro/${puntoRetiro.id}/`, puntoRetiro ).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
 
  deletePuntoRetiro(id: number)  {
    return this.http.delete (ABI_PATH+ `/punto-retiro/${id}/` ).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  
 
  /** ********************Orden**************************** */
  getOrdenPorPaginas(page: number, size: number ) {
    let url = ABI_PATH+'/orden_venta/?page='+page+'&page_size='+size;
     console.log(url);
   return this.http.get(url )
   .pipe(
    catchError(e => {
      console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
      return throwError(e);
    })
  );
     
  }


  getOrdenById(id) {
    return this.http.get<ABI_Pedido>(ABI_PATH+ `/orden_venta/${id}/` ).pipe(
      tap((response: ABI_Pedido) => response as ABI_Pedido),
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
 
  aprobarOrden(objeto){
    return this.http.post (ABI_PATH+ '/orden_venta/aprobar/', objeto )
      .pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  /** ********************PRECIOS**************************** */
  ActualizarPrecios(precios){
    return this.http.post (ABI_PATH+ '/producto/precios/', precios )
      .pipe(
        tap((response: any) => response  ),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getPrecios( ) {
    let url = ABI_PATH+'/producto/precios/' ;
     console.log(url);
   return this.http.get(url )
   .pipe(
    catchError(e => {
      console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
      return throwError(e);
    })
  ); 
  }

  /** ********************STOCK**************************** */
  ActualizarStock(stock){
    return this.http.post (ABI_PATH+ '/producto/disponibilidades/', stock )
      .pipe(
        tap((response: any) => response  ),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getStock( ) {
    let url = ABI_PATH+'/producto/disponibilidades/' ;
     console.log(url);
   return this.http.get(url )
   .pipe(
    catchError(e => {
      console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
      return throwError(e);
    })
  ); 
  }

  /***************************PRODUCTOS************************ */

  getProductos() {
    let url = ABI_PATH+'/producto/?page=1&page_size='+9999 ;
     console.log(url);
   return this.http.get(url )
   .pipe(
    map((response: any) => response.results as ABI_Producto[]),
    catchError(e => {
      console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
      return throwError(e);
    })
  );
     
  }
}
