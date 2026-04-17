import { Injectable } from '@angular/core';
import {   HttpClient } from '@angular/common/http';
 import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
 import {  map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Comprobantes } from '../../models/comprobantes.model';
@Injectable()
export class ComprobantesService {
  constructor(
                public http: HttpClient,
                public router: Router,
              ) {}

   traerComprobantes(codeEmpresa) {
   let url = BASE_URL + 'comprobantes?codempresa=' + codeEmpresa;
     console.log( url);
     return this.http.get( url)
     .map( (resp: any) => resp);
    }

    delete(id: number): Observable<Comprobantes> {
      return this.http.delete<Comprobantes>(BASE_URL + 'comprobantes' + `/${id}`).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }
    getComprobanteByTerminalId(id): Observable<Comprobantes> {
      return this.http.get<Comprobantes>(BASE_URL + 'comprobantes/terminal' + `/${id}`).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }



    getComprobanteById(id): Observable<Comprobantes> {
      return this.http.get<Comprobantes>(BASE_URL + 'comprobantes' + `/${id}`).pipe(
        catchError(e => {
          this.router.navigate(['/comprobantes']);
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    create(comprobantes: Comprobantes): Observable<Comprobantes> {
      return this.http.post(BASE_URL + 'comprobantes', comprobantes)
        .pipe(
          map((response: any) => response.comprobantes as Comprobantes),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(comprobantes: Comprobantes): Observable<any> {
      return this.http.put<any>(BASE_URL + 'comprobantes', comprobantes).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

}
