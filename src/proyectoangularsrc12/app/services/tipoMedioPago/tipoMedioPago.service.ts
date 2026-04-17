import { Injectable } from '@angular/core';

import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UsuarioService } from '../usuario/usuario.service';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { TipoMedioPago } from '../../models/tipoMedioPago.model';
import { LoginService } from '../login/login.service';

@Injectable()
export class TipoMedioPagoService {

 
  constructor(
                public http: HttpClient,
                public router: Router,
                public _loginService: LoginService
              ) { }

   traerByCodEmp(codeEmpresa) {
   let url = BASE_URL + 'tipomediopago?codempresa=' + codeEmpresa;
     console.log( url);
     return this.http.get( url )
     .map( (resp: any) => resp);
    }

    delete(id: number): Observable<TipoMedioPago> {
      return this.http.delete<TipoMedioPago>(BASE_URL + 'tipomediopago' + `/${id}` ).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    getById(id): Observable<TipoMedioPago> {
      return this.http.get<TipoMedioPago>(BASE_URL + 'tipomediopago' + `/${id}` ).pipe(
        catchError(e => {
          this.router.navigate(['/tipoMedioPago']);
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    create(tipomediopago: TipoMedioPago): Observable<TipoMedioPago> {
      return this.http.post(BASE_URL + 'tipomediopago', tipomediopago,  )
        .pipe(
          map((response: any) => response.tipomediopago as TipoMedioPago),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(tipomediopago: TipoMedioPago): Observable<any> {
      return this.http.put<any>(BASE_URL + 'tipomediopago', tipomediopago).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

}