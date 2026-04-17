import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { TipoDeposito } from '../../models/tipoDeposito.model';
 @Injectable()
export class TipoDepositoService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
                public http: HttpClient,
                public router: Router,
              ) {}

   getByCodEmpr(codeEmpresa) {
   let url = BASE_URL + 'tipodeposito?codempresa=' + codeEmpresa;
     console.log( url);
     return this.http.get( url)
     .map( (resp: any) => resp);
    }

    delete(id: number): Observable<TipoDeposito> {
      return this.http.delete<TipoDeposito>(BASE_URL + 'tipodeposito' + `/${id}`).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    getById(id): Observable<TipoDeposito> {
      return this.http.get<TipoDeposito>(BASE_URL + 'tipodeposito' + `/${id}`).pipe(
        catchError(e => {
          this.router.navigate(['/tipoDeposito']);
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    create(tipoDeposito: TipoDeposito): Observable<TipoDeposito> {
      return this.http.post(BASE_URL + 'tipodeposito', tipoDeposito)
        .pipe(
          map((response: any) => response.tipoDeposito as TipoDeposito),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(tipoDeposito: TipoDeposito): Observable<any> {
      return this.http.put<any>(BASE_URL + 'tipodeposito', tipoDeposito).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }
}
