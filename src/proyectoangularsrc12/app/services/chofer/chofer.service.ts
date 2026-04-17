import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { _throw as throwError } from 'rxjs/observable/throw';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Chofer } from '../../models/chofer.model';

@Injectable()
export class ChoferService {
  constructor(public http: HttpClient, public router: Router) { }

  cargar() {
    return this.http.get(BASE_URL + 'choferes?page=0')
      .map((response: any) => {
        return response.content;
      });
  }

  buscar(termino: string) {
    let url = BASE_URL + 'choferes?page=0' + '&keyword=' + termino;
    console.log(url);
    return this.http.get(url)
      .map((response: any) => {
        return response.content;
      });
  }
  buscarActivos(termino: string) {
    let url = BASE_URL + 'choferes?page=0' + '&activo=true' + '&keyword=' + termino;

    console.log(url);
    return this.http.get(url)
      .map((response: any) => {
        return response.content;
      });
  }

  traerClientesPorPaginas(page: number, termino: string) {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'choferes?size=10&page=' + page;
    } else {
      url = BASE_URL + 'choferes?size=10&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

  create(chofer: Chofer): Observable<Chofer> {
    console.log(chofer);
    return this.http.post(BASE_URL + 'choferes', chofer)
      .pipe(
        map((response: any) => response.chofer as Chofer),
        catchError(e => {

          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  getChoferById(id): Observable<Chofer> {
    return this.http.get<Chofer>(BASE_URL + 'choferes' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/choferes']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  update(chofer: Chofer): Observable<any> {
    return this.http.put<any>(BASE_URL + 'choferes', chofer).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<Chofer> {
    return this.http.delete<Chofer>(BASE_URL + 'choferes' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


}
