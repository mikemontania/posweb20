import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import * as moment from 'moment';
import { Cliente } from '../../models/cliente.model';
import { LoginService } from '../login/login.service';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { Usuarios } from '../../models/usuarios.model';
import { Canje } from '../../models/canje.model';
@Injectable()
export class CanjesService { 
  constructor(
    public http: HttpClient,
    public router: Router,
    private _loginService: LoginService,
  ) { }

  anular(id): Observable<any> {
    let url = BASE_URL + 'canjes/anular/' + id;
    return this.http.put<any>(url, null).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  /*   anular(id, codUsuario): Observable<any> {
      let url = BASE_URL + 'canjes/anular/' + id + '/' + codUsuario ;
      return this.http.put<any>(url , null).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }
   */
  realizarCanje(canje) {
    console.log('ENVIANDO CANJE');
    let body = canje;
    let url = BASE_URL + 'canjes';
    return this.http.post(url, body)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );

  }
 
  update(canje) {
    console.log(canje);
    let body = canje;
    let url = BASE_URL + 'canjes/update';
    return this.http.put(url, body)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );

  }
 
  findByFecha(page, fechainicio, fechafin, cliente: Cliente, usuario: Usuarios, codSucursal: number, size: number, estado: string, anulado: any, nroCanje: number) {
    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let codusuario = this._loginService.user.codUsuario;
    let codesucursal = 1;
    let url = BASE_URL + 'canjes?page=' + page + '&size=' + size;
    url += '&fechainicio=' + fechainicio + '&fechafin=' + fechafin;
    if (cliente) {
      url += '&codcliente=' + cliente.codCliente;
    }

    if (usuario) {
      url += '&codusuario=' + usuario.codUsuario;
    }

    if (codSucursal > 0) {
      url += '&codsucursal=' + codSucursal;
    }
    if (estado) {
      url += '&estado=' + estado;
    }
    if (anulado != null && anulado != undefined) {
      url += '&anulado=' + anulado;
    }
    if (nroCanje != null && nroCanje > 0) {
      url += '&nrocanje=' + nroCanje;
    }
    console.log(url);
    return this.http.get<any>(url)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );

  }
 

  get(page,
    fechainicio,
    fechafin,
    codCliente: number,
    codUsuario: number,
    codSucursal: number,
    size: number) {

    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let codusuario = this._loginService.user.codUsuario;
    let codesucursal = 1;
    let url = BASE_URL + 'canjes?page=' + page + '&size=' + size;
    url += '&fechainicio=' + fechainicio + '&fechafin=' + fechafin;
    if (codCliente > 0) {
      url += '&codcliente=' + codCliente;
    }

    if (codUsuario > 0) {
      url += '&codusuario=' + codUsuario;
    }

    if (codSucursal > 0) {
      url += '&codsucursal=' + codSucursal;
    }
    console.log(url);
    return this.http.get(url)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );

  }


  getById(id) {
    let url = BASE_URL + 'canjes/model/' + id;
    console.log(url);
    return this.http.get(url)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }


  findPendientes(codSucursal): Observable<any> {
    let url = BASE_URL + 'canjes/canjespendientes?codsucursal=' + codSucursal;
    console.log(url);
    return this.http.get(url)
      .pipe(
        map((response: Canje[]) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }






}
