import { Injectable } from '@angular/core';

import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UsuarioService } from '../usuario/usuario.service';
import { Router } from '@angular/router';
import { MedioPago } from '../../models/medioPago.model';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { LoginService } from '../login/login.service';

@Injectable()
export class MedioPagoService {

  forma: MedioPago[] = [];

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
    public http: HttpClient,
    public router: Router,
  ) {

  }

  traerMedioPago(codeEmpresa) {
    let url = BASE_URL + 'mediopago?codempresa=' + codeEmpresa;
    const orden = [
      'EFECTIVO',
      'TARJETA',
      'TRANSF.GNB',
      'TRANSF.ITAU',
      'TRANSF.SUDAMERIS',
      'TRANSF.EXPRESS',
      'TRANSF.UENO',
      'CHEQUE DIFERIDO',
      'BANCARD QR',
      'VALE EMPLEADOS',
      'OBSEQUIO'
    ];
    return this.http.get(url)
      .map((resp: any[]) => {
        // Ordenar medios pago ANTES de devolver
        return resp.sort((a, b) => {
          const posA = orden.indexOf(a.descripcion.toUpperCase());
          const posB = orden.indexOf(b.descripcion.toUpperCase());
          return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
        });
      });
  }
  getObsequio(codeEmpresa, esObsequio) {
    let url = BASE_URL + 'mediopago/obsequio?codempresa=' + codeEmpresa + '&esobsequio=' + esObsequio;
    return this.http.get(url)
      .pipe(
        map((resp: any) => resp),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getMedioPagoById(id): Observable<MedioPago> {
    return this.http.get<MedioPago>(BASE_URL + 'mediopago' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/medioPago']);
        console.error(e.error.mensaje);
        Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  create(medio: MedioPago): Observable<MedioPago> {
    return this.http.post(BASE_URL + 'mediopago', medio)
      .pipe(
        map((response: any) => response.medioPago as MedioPago),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  update(medio: MedioPago): Observable<any> {
    return this.http.put<any>(BASE_URL + 'mediopago', medio).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<MedioPago> {
    return this.http.delete<MedioPago>(BASE_URL + 'mediopago' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
