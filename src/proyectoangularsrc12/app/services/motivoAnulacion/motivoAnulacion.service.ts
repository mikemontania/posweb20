import { Injectable } from '@angular/core';

import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UsuarioService } from '../usuario/usuario.service';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
 
import { LoginService } from '../login/login.service';
import { MotivoAnulacion } from '../../models/motivoAnulacion.model';
@Injectable()
export class MotivoAnulacionService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
                public http: HttpClient,
                public router: Router,
               ) {
             }

   traerByCodEmp(codeEmpresa) {
   let url = BASE_URL + 'motivoanulacion?codempresa=' + codeEmpresa;
      return this.http.get( url )
     .map( (resp: any) => resp);
    }

    delete(id: number): Observable<MotivoAnulacion> {
      return this.http.delete<MotivoAnulacion>(BASE_URL + 'motivoanulacion' + `/${id}` ).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    getById(id): Observable<MotivoAnulacion> {
      return this.http.get<MotivoAnulacion>(BASE_URL + 'motivoanulacion' + `/${id}` ).pipe(
        catchError(e => {
          this.router.navigate(['/motivoAnulacion']);
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    create(motivo: MotivoAnulacion): Observable<MotivoAnulacion> {
      return this.http.post(BASE_URL + 'motivoanulacion', motivo )
        .pipe(
          map((response: any) => response.MotivoAnulacion as MotivoAnulacion),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(motivo: MotivoAnulacion): Observable<any> {
      return this.http.put<any>(BASE_URL + 'motivoanulacion', motivo ).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

}
