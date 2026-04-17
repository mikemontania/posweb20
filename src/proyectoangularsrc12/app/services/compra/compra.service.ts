import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import * as moment from 'moment';
import { LoginService } from '../login/login.service';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import Swal from 'sweetalert2';
import { Usuarios } from '../../models/usuarios.model';
import { Observable } from 'rxjs';
import { Proveedor } from '../../models/proveedor.model';
import { MotivoAnulacionCompra } from '../../models/motivoAnulacionCompra.model';
@Injectable()
export class CompraService {
  constructor(
    public http: HttpClient,
    public router: Router,
    private _loginService: LoginService,
  ) { }

  anularCompra(id: number, motivoAnulacion: MotivoAnulacionCompra): Observable<any> {
    let url = BASE_URL + 'compras/anular/' + id;
    console.log(url, motivoAnulacion);
    return this.http.put<any>(url, motivoAnulacion).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  create(compra) {
    console.log(compra);
    let body = compra;
    let url = BASE_URL + 'compras';
    return this.http.post(url, body)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e);
      //    Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }


  findByFecha(page, fechainicio, fechafin, proveedor: Proveedor, usuario: Usuarios, nroComprobante: string, estado: string, size: number) {

    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let codusuario = this._loginService.user.codUsuario;
    let codesucursal = 1;
    let url = BASE_URL + 'compras?page=' + page + '&size=' + size;
    url += '&fechainicio=' + fechainicio + '&fechafin=' + fechafin;
    if (proveedor) {
      url += '&codproveedor=' + proveedor.codProveedor;
    }

    if (usuario) {
      url += '&codusuario=' + usuario.codUsuario;
    }

    if (nroComprobante != '' && nroComprobante != null && nroComprobante != undefined) {
      url += '&nrocomprobante=' + nroComprobante;
    }
    if (estado != 'TODOS' && estado != '' && estado != null && estado != undefined) {
      url += '&estado=' + estado;
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



  traer(page,
    fechainicio,
    fechafin,
    codProveedor: number,
    codUsuario: number,
    nroComprobante: string,
    size: number) {

    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let codusuario = this._loginService.user.codUsuario;
    let codesucursal = 1;
    let url = BASE_URL + 'compras?page=' + page + '&size=' + size;
    url += '&fechainicio=' + fechainicio + '&fechafin=' + fechafin;
    if (codProveedor > 0) {
      url += '&codproveedor=' + codProveedor;
    }

    if (codUsuario > 0) {
      url += '&codusuario=' + codUsuario;
    }
    if (nroComprobante != '' && nroComprobante != null && nroComprobante != undefined) {
      url += '&nrocomprobante=' + nroComprobante;
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


  traerPorID(id) {
    let url = BASE_URL + 'compras/' + id;
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



}
