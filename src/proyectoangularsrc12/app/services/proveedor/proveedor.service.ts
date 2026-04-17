import { Injectable } from '@angular/core';
import {   HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { _throw as throwError } from 'rxjs/observable/throw';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Proveedor } from '../../models/proveedor.model';

@Injectable()
export class ProveedorService {
  constructor(
              public http: HttpClient,
              public router: Router,
             ) {}

  cargar() {
    return this.http.get(BASE_URL + 'proveedores?page=0')
      .map((response: any) => {
        return response;
      });
  }

  buscarClientes( termino: string) {
    let url = BASE_URL + 'proveedores?page=0' + '&keyword=' + termino;

    console.log(url);
   return this.http.get(url)
     .map((response: any) => {
      return response.content;
      });
 }
 buscarActivos( termino: string) {
  let url = BASE_URL + 'proveedores?page=0' + '&activo=true' + '&keyword=' + termino;

  console.log(url);
 return this.http.get(url)
   .map((response: any) => {
    return response.content;
    });
}
 
 traerPorTermino(termino) {
  let url = BASE_URL + 'proveedores?keyword=' + termino;
  return this.http.get( url)
  .map( (resp: any) => resp);
}


traerPorPaginas(page: number, termino: string) {
  let url = '';
  if (termino === '') {
     url = BASE_URL + 'proveedores?size=10&page=' + page;
   } else {
     url = BASE_URL + 'proveedores?size=10&page=' + page + '&keyword=' + termino;
  }
  console.log(url);
 return this.http.get(url)
   .map((response: any) => response );
}


  get(page: number): Observable<any> {
    return this.http.get(BASE_URL + 'proveedores?page=' + page).pipe(
      tap((response: any) => {
        console.log('ProveedorService: tap 1');
        (response.content as Proveedor[]).forEach(proveedor => console.log(proveedor.razonSocial));
      }),
      map((response: any) => {
        (response.content as Proveedor[]).map(proveedor => {
          proveedor.razonSocial = proveedor.razonSocial.toUpperCase();
          // let datePipe = new DatePipe('es');
          // cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
          // cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy', 'es');
          return proveedor;
        });
        return response;
      }),
      tap(response => {
        console.log('ClienteService: tap 2');
        (response.content as Proveedor[]).forEach(proveedor => console.log(proveedor.razonSocial));
      })
    );
  }

  create(proveedor: Proveedor): Observable<Proveedor> {
    console.log(proveedor);
    return this.http.post(BASE_URL + 'proveedores', proveedor)
      .pipe(
        map((response: any) => response as Proveedor),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  getById(id): Observable<Proveedor> {
    return this.http.get<Proveedor>(BASE_URL + 'proveedores' + `/${id}`).pipe(
      catchError(e => {
         console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  update(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(BASE_URL + 'proveedores', proveedor).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<Proveedor> {
    return this.http.delete<Proveedor>(BASE_URL + 'proveedores' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
