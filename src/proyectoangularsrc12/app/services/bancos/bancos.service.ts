import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Bancos } from '../../models/bancos.model';
@Injectable()
export class BancosService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
                public http: HttpClient,
                public router: Router,
              ) {}

   traerByCodEmp(codeEmpresa) {
   let url = BASE_URL + 'bancos?codempresa=' + codeEmpresa;
     console.log( url);
     return this.http.get( url)
     .map( (resp: any) => resp);
    }

    delete(id: number): Observable<Bancos> {
      return this.http.delete<Bancos>(BASE_URL + 'bancos' + `/${id}`).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    getById(id): Observable<Bancos> {
      return this.http.get<Bancos>(BASE_URL + 'bancos' + `/${id}`).pipe(
        catchError(e => {
          this.router.navigate(['/bancos']);
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    create(bancos: Bancos): Observable<Bancos> {
      return this.http.post(BASE_URL + 'bancos', bancos)
        .pipe(
          map((response: any) => response.bancos as Bancos),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(bancos: Bancos): Observable<any> {
      return this.http.put<any>(BASE_URL + 'bancos', bancos).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

}
