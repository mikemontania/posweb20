import { Injectable } from '@angular/core';

import { HttpHeaders, HttpClient } from '@angular/common/http';
 import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
   import { MotivoTransferencia } from '../../models/motivoTransferencia.model';
@Injectable()
export class MotivoTransferenciaService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
                public http: HttpClient,
                public router: Router,
               ) {
             }

   traerByCodEmp(codeEmpresa) {
   let url = BASE_URL + 'motivotransferencia?codempresa=' + codeEmpresa;
      return this.http.get( url )
     .map( (resp: any) => resp);
    }

    delete(id: number): Observable<MotivoTransferencia> {
      return this.http.delete<MotivoTransferencia>(BASE_URL + 'motivotransferencia' + `/${id}` ).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    getById(id): Observable<MotivoTransferencia> {
      return this.http.get<MotivoTransferencia>(BASE_URL + 'motivotransferencia' + `/${id}` ).pipe(
        catchError(e => {
          this.router.navigate(['/motivotransferencia']);
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    create(motivo: MotivoTransferencia): Observable<MotivoTransferencia> {
      return this.http.post(BASE_URL + 'motivotransferencia', motivo )
        .pipe(
          map((response: any) => response.MotivoAnulacion as MotivoTransferencia),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(motivo: MotivoTransferencia): Observable<MotivoTransferencia> {
      return this.http.put<MotivoTransferencia>(BASE_URL + 'motivotransferencia', motivo ).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

}
