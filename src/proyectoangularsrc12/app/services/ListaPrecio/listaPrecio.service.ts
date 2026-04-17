import { Injectable } from '@angular/core';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { ListaPrecio } from '../../models/listaPrecio.model';
import Swal from 'sweetalert2';
import { LoginService } from '../../services/login/login.service';

@Injectable()
export class ListaPrecioService {

  lista: ListaPrecio[] = [];

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
    public http: HttpClient,
    public router: Router,
    private _loginService: LoginService
  ) { }

  //Retorna las listas de precios visibles para el usuario logueado
  //ROLE_ADMIN -> todas las listas
  //Otros roles -> solo listas con esAdmin = false

  traerListaPrecio(codeEmpresa): Observable<ListaPrecio[]> {
    let url = BASE_URL + 'listaprecio?codempresa=' + codeEmpresa;
    const user = this._loginService.user;
    const rolUsuario = user?.authorities?.[0];
    const username = user?.username.toUpperCase();
    return this.http.get(url).pipe(
      map((resp:any) => {
        const lista = resp as ListaPrecio[];
        //Caso 1: si es admin, retorna todas las listas
        if(rolUsuario === 'ROLE_ADMIN') {
          return lista;
        }
        //Caso 2: usuario especifico, solo la lista institucional
        if(username?.includes('EXTERNO')) {
          return lista.filter(lp => lp.descripcion.toUpperCase().includes('INSTITUCIONAL'));
        }
        //Caso 3: otros roles, retorna solo listas con esAdmin = false
        return lista.filter(lp => lp.esAdmin === false);
      }),
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire('Error', 'No se pudo obtener las listas de precios', 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<ListaPrecio> {
    return this.http.delete<ListaPrecio>(BASE_URL + 'listaprecio' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getById(id): Observable<ListaPrecio> {
    return this.http.get<ListaPrecio>(BASE_URL + 'listaprecio' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/listaPrecio']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getListEcommerce(): Observable<ListaPrecio> {
    console.log('GET LISTA ECOMMERCE');
    return this.http.get<ListaPrecio>(BASE_URL + 'listaprecio/ecommerce' ).pipe(
      catchError(e => {
         console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  create(lista: ListaPrecio): Observable<ListaPrecio> {
    return this.http.post(BASE_URL + 'listaprecio', lista)
      .pipe(
        map((response: any) => response.listaPrecio as ListaPrecio),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  update(lista: ListaPrecio): Observable<any> {
    return this.http.put<any>(BASE_URL + 'listaprecio', lista).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


}