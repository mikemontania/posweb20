import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import {   map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { GrupoDescuento } from '../../models/grupoDescuento.model';
 @Injectable()
export class GrupoDescuentoService {
   headers: HttpHeaders; // new HttpHeaders();
  constructor(
                public http: HttpClient,
                public router: Router,
              ) {}

   getByEmpresa(codeEmpresa) {
   let url = BASE_URL + 'grupodescuento?codempresa=' + codeEmpresa;
     return this.http.get( url)
     .map( (resp: any) => resp);
    }

    getGrupoById(id): Observable<GrupoDescuento> {
      return this.http.get<GrupoDescuento>(BASE_URL + 'grupodescuento' + `/${id}`).pipe(
        catchError(e => {
           console.error(e.error.mensaje);
          Swal.fire('Error al editar', e.error.mensaje, 'error');
          return throwError(e);
        })
      );
    }

    create(grupoDescuento: GrupoDescuento): Observable<GrupoDescuento> {
      return this.http.post(BASE_URL + 'grupodescuento', grupoDescuento)
        .pipe(
          map((response: any) => response.grupoDescuento as GrupoDescuento),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(grupoDescuento: GrupoDescuento): Observable<any> {
      return this.http.put<any>(BASE_URL + 'grupodescuento', grupoDescuento).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    delete(id: number): Observable<GrupoDescuento> {
      return this.http.delete<GrupoDescuento>(BASE_URL + 'grupodescuento' + `/${id}`).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

}
