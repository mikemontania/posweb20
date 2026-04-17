import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { _throw as throwError } from 'rxjs/observable/throw';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Vendedor } from '../../models/vendedor.model';

@Injectable()
export class VendedorService {
  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  cargar() {
    return this.http.get(BASE_URL + 'vendedores?page=0')
      .map((response: any) => {
        return response;
      });
  }

  buscar(termino: string) {
    let url = BASE_URL + 'vendedores?page=0' + '&keyword=' + termino;

    console.log(url);
    return this.http.get(url)
      .map((response: any) => {
        return response.content;
      });
  }
  buscarActivos(termino: string) {
    let url = BASE_URL + 'vendedores?page=0' + '&activo=true' + '&keyword=' + termino;

    console.log(url);
    return this.http.get(url)
      .map((response: any) => {
        return response.content;
      });
  }


  traervendedoresPorTermino(termino) {
    let url = BASE_URL + 'vendedores?keyword=' + termino;
    return this.http.get(url)
      .map((resp: any) => resp);
  }


  getByPageAndkeyword(page: number, termino: string) {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'vendedores?size=10&page=' + page;
    } else {
      url = BASE_URL + 'vendedores?size=10&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }


  getPage(page: number): Observable<any> {
    return this.http.get(BASE_URL + 'vendedores?page=' + page)
      .pipe(
        map((response: any) => response.vendedor as Vendedor),
        catchError(e => {

          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  
  getDefault() {
    let url = BASE_URL + 'vendedores/default';
    console.log(url);
   return this.http.get(url)
     .map((response: any) => {
       console.log(response);
      return response;
      });
  }
  getByCodUser(codUsuario) {
    let url = BASE_URL + 'vendedores/byuser?codusuario=' + codUsuario;
    console.log(url);
   return this.http.get(url)
     .map((response: any) => {
       console.log(response);
      return response;
      });
  }
   

  create(vendedor: Vendedor): Observable<Vendedor> {
    console.log(vendedor);
    return this.http.post(BASE_URL + 'vendedores', vendedor)
      .pipe(
        map((response: any) => response.vendedor as Vendedor),
        catchError(e => {

          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  getVendedor(id): Observable<Vendedor> {
    return this.http.get<Vendedor>(BASE_URL + 'vendedores' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/vendedores']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  update(v: Vendedor): Observable<any> {
    return this.http.put<any>(BASE_URL + 'vendedores', v).pipe(
      catchError(e => {

        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<Vendedor> {
    return this.http.delete<Vendedor>(BASE_URL + 'vendedores' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
