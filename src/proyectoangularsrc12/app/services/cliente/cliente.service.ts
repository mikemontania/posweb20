import { Injectable } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import {   HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { _throw as throwError } from 'rxjs/observable/throw';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';


@Injectable()
export class ClienteService {
  cliente: Cliente[] = [];
  clnt: Cliente[] = [];
  constructor(
              public http: HttpClient,
              public router: Router,
             ) {}

  cargarClientes() {
    return this.http.get(BASE_URL + 'clientes?page=0')
      .map((response: any) => {
        return response;
      });
  }

  buscarClientes( termino: string) {
    let url = BASE_URL + 'clientes?page=0' + '&keyword=' + termino;

    console.log(url);
   return this.http.get(url)
     .map((response: any) => {
      return response.content;
      });
 }
 buscarClientesActivos( termino: string) {
  let url = BASE_URL + 'clientes?page=0' + '&activo=true' + '&keyword=' + termino;

  console.log(url);
 return this.http.get(url)
   .map((response: any) => {
    return response.content;
    });
}

 getClienteDefault() {
  let url = BASE_URL + 'clientes/default';

  console.log(url);
 return this.http.get(url)
   .map((response: any) => {
     console.log(response);
    return response;
    });
}

getClientePropietario() {
  let url = BASE_URL + 'clientes/propietario';
  console.log(url);
 return this.http.get(url)
   .map((response: any) => {
     console.log(response);
    return response;
    });
}
getHtmlFromUrl(url: string) {
  const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
  return this.http.get(proxyUrl, { responseType: 'text' });
}

 traerClientesPorTermino(termino) {
  let url = BASE_URL + 'clientes?keyword=' + termino;
  return this.http.get( url)
  .map( (resp: any) => resp);
}


traerClientesPorPaginas(page: number, termino: string) {
  let url = '';
  if (termino === '') {
     url = BASE_URL + 'clientes?size=10&page=' + page;
   } else {
     url = BASE_URL + 'clientes?size=10&page=' + page + '&keyword=' + termino;
  }
  console.log(url);
 return this.http.get(url)
   .map((response: any) => response );
}


  getClientes(page: number): Observable<any> {
    return this.http.get(BASE_URL + 'clientes?page=' + page).pipe(
      tap((response: any) => {
        console.log('ClienteService: tap 1');
        (response.content as Cliente[]).forEach(cliente => console.log(cliente.razonSocial));
      }),
      map((response: any) => {
        (response.content as Cliente[]).map(cliente => {
          cliente.razonSocial = cliente.razonSocial.toUpperCase();
          // let datePipe = new DatePipe('es');
          // cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
          // cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy', 'es');
          return cliente;
        });
        return response;
      }),
      tap(response => {
        console.log('ClienteService: tap 2');
        (response.content as Cliente[]).forEach(cliente => console.log(cliente.razonSocial));
      })
    );
  }

  create(cliente: Cliente): Observable<Cliente> {
    console.log(cliente);
    return this.http.post(BASE_URL + 'clientes', cliente)
      .pipe(
        map((response: any) => response.cliente as Cliente),
        catchError(e => {

          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  getCliente(id): Observable<Cliente> {
    return this.http.get<Cliente>(BASE_URL + 'clientes' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/clientes']);
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  update(cliente: Cliente): Observable<any> {
    return this.http.put<any>(BASE_URL + 'clientes', cliente).pipe(
      catchError(e => {

        // if (e.status == 400) {
        //   return throwError(e);
        // }

        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(BASE_URL + 'clientes' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
