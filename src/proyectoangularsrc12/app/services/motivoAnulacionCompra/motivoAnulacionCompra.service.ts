import { Injectable } from '@angular/core';

import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UsuarioService } from '../usuario/usuario.service';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { MotivoAnulacionCompra } from '../../models/motivoAnulacionCompra.model';
@Injectable()
export class MotivoAnulacionCompraService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
                public http: HttpClient,
                public router: Router,
               ) {
             }

   traerByCodEmp(codeEmpresa) {
   let url = BASE_URL + 'motivoAnulacionCompra?codempresa=' + codeEmpresa;
      return this.http.get( url )
     .map( (resp: any) => resp);
    }

    delete(id: number): Observable<MotivoAnulacionCompra> {
      return this.http.delete<MotivoAnulacionCompra>(BASE_URL + 'motivoAnulacionCompra' + `/${id}` ).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    getById(id): Observable<MotivoAnulacionCompra> {
      return this.http.get<MotivoAnulacionCompra>(BASE_URL + 'motivoAnulacionCompra' + `/${id}` ).pipe(
        catchError(e => {
          this.router.navigate(['/motivoAnulacionCompra']);
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    create(motivo: MotivoAnulacionCompra): Observable<MotivoAnulacionCompra> {
      return this.http.post(BASE_URL + 'motivoAnulacionCompra', motivo )
        .pipe(
          map((response: any) => response.MotivoAnulacion as MotivoAnulacionCompra),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(motivo: MotivoAnulacionCompra): Observable<any> {
      return this.http.put<any>(BASE_URL + 'motivoAnulacionCompra', motivo ).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

}
