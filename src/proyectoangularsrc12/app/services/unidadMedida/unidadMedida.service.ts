import { Injectable } from '@angular/core';

import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UsuarioService } from '../usuario/usuario.service';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { UnidadMedida } from '../../models/unidadMedida.model';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { LoginService } from '../login/login.service';
@Injectable()
export class UnidadMedidaService {

  unidad: UnidadMedida[] = [];


  constructor(
                public http: HttpClient,
                public router: Router,
              ) {}

   traerUnidadMedida(codeEmpresa) {
   let url = BASE_URL + 'unidades?codempresa=' + codeEmpresa;
     return this.http.get( url)
     .map( (resp: any) => resp);
    }

    getUnidad(id): Observable<UnidadMedida> {
      return this.http.get<UnidadMedida>(BASE_URL + 'unidades' + `/${id}`).pipe(
        catchError(e => {
          this.router.navigate(['/unidadMedida']);
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    create(unidad: UnidadMedida): Observable<UnidadMedida> {
      return this.http.post(BASE_URL + 'unidades', unidad)
        .pipe(
          map((response: any) => response.unidades as UnidadMedida),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(unidad: UnidadMedida): Observable<any> {
      return this.http.put<any>(BASE_URL + 'unidades', unidad).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }


   delete(id: number): Observable<UnidadMedida> {
    return this.http.delete<UnidadMedida>(BASE_URL + 'unidades' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


}
