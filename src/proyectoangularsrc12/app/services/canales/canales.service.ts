import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Canal } from '../../models/canales.model';
@Injectable()
export class CanalService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
                public http: HttpClient,
                public router: Router,
              ) {}

   traerByCodEmp(codeEmpresa) {
   let url = BASE_URL + 'canales?codempresa=' + codeEmpresa;
     console.log( url);
     return this.http.get( url)
     .map( (resp: any) => resp);
    }

 getCanal() {
  let url = BASE_URL + 'canales/principal';
  console.log(url);
 return this.http.get(url)
   .map((response: any) => {
     console.log(response);
    return response;
    });
}

    delete(id: number): Observable<Canal> {
      return this.http.delete<Canal>(BASE_URL + 'canales' + `/${id}`).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    getById(id): Observable<Canal> {
      return this.http.get<Canal>(BASE_URL + 'canales' + `/${id}`).pipe(
        catchError(e => {
          this.router.navigate(['/canales']);
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    create(canales: Canal): Observable<Canal> {
      return this.http.post(BASE_URL + 'canales', canales)
        .pipe(
          map((response: any) => response.canales as Canal),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(canales: Canal): Observable<any> {
      return this.http.put<any>(BASE_URL + 'canales', canales).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

}
