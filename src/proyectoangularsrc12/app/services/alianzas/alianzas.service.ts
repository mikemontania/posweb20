import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Alianza } from '../../models/alianza.model';
@Injectable()
export class AlianzasService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  traerByCodEmp(codeEmpresa) {
    let url = BASE_URL + 'alianzas?codempresa=' + codeEmpresa;
    console.log(url);
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  delete(id: number): Observable<Alianza> {
    return this.http.delete<Alianza>(BASE_URL + 'alianzas' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getById(id): Observable<Alianza> {
    return this.http.get<Alianza>(BASE_URL + 'alianzas' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/Alianzas']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  create(Alianzas: Alianza): Observable<Alianza> {
    return this.http.post(BASE_URL + 'alianzas', Alianzas)
      .pipe(
        map((response: any) => response.alianzas as Alianza),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  update(Alianzas: Alianza): Observable<any> {
    return this.http.put<any>(BASE_URL + 'alianzas', Alianzas).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
