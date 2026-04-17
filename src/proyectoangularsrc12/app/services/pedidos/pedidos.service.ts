import { Injectable } from '@angular/core';
import { Cabecera } from '../../models/cabecera.model';
import { Detalles } from '../../models/detalles.model';
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
import { Pedido } from '../../models/pedido.model';
import { MotivoAnulacion } from 'src/app/models/motivoAnulacion.model';
@Injectable()
export class PedidosService {
  cabecera: Cabecera;
  detalles: Detalles[] = [];
  constructor(
    public http: HttpClient,
    public router: Router,
    private _loginService: LoginService,
  ) { }


updateFechaReal(id: number, fechaReal: string): Observable<any> {
  const url = `${BASE_URL}pedidos/fechaReal/${id}?fechaReal=${fechaReal}`;
  return this.http.put<any>(url, null).pipe(
    catchError(e => {
      console.error('ERROR', e.error);
      Swal.fire(e.error.header, e.error.message, 'error');
      return throwError(e);
    })
  );
}

    anular(id: number, motivoAnulacion: MotivoAnulacion): Observable<any> {
      let url = BASE_URL + 'pedidos/anular/' + id;
      console.log(url, motivoAnulacion);
      return this.http.put<any>(url, motivoAnulacion).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

  /*   anular(id, codUsuario): Observable<any> {
      let url = BASE_URL + 'pedidos/anular/' + id + '/' + codUsuario ;
      return this.http.put<any>(url , null).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }
   */
  concretar(pedido) {
    console.log(pedido);
    let body = pedido;
    let url = BASE_URL + 'pedidos';
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

  confirmarFechaRetiro(codOrdenAbi: number, fechaRetiro: string) {
      let url = BASE_URL + 'pedidos/fechaConfirmacion?codOrdenAbi=' + codOrdenAbi + '&fechaRetiro=' + fechaRetiro;
    return this.http.post(url, null)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );

  }

  updateContrasena(codOrdenAbi: number, contrasena: string) {
    let url = BASE_URL + 'pedidos/contrasena?codOrdenAbi=' + codOrdenAbi + '&contrasena=' + contrasena;
  return this.http.put(url, null)
    .pipe(
      map((response: any) => response),
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );

}

  update(pedido) {
    console.log(pedido);
    let body = pedido;
    let url = BASE_URL + 'pedidos/update';
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

  cambiarCobranza(modelo) {
    console.log(modelo);
    let body = modelo;
    let url = BASE_URL + 'pedidos';
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

  findByFecha(page, fechainicio, fechafin, cliente: Cliente, usuario: Usuarios, codSucursal: number, size: number, estado: string, anulado: any, tipoPedido:string, nroPedido: number) {
    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let codusuario = this._loginService.user.codUsuario;
    let codesucursal = 1;
    let url = BASE_URL + 'pedidos?page=' + page + '&size=' + size;
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
    if (nroPedido != null && nroPedido > 0) {
      url += '&nropedido=' + nroPedido;
    }
    if (tipoPedido != '' && tipoPedido != null && tipoPedido != undefined) {
      url += '&tipo=' + tipoPedido;
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

  findTotal(fechainicio, fechafin, cliente: Cliente, usuario: Usuarios, codSucursal: number, estado: string, tipoPedido:string, nroPedido: number) {
    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let codusuario = this._loginService.user.codUsuario;
    let codesucursal = 1;
    let url = BASE_URL + 'pedidos/totales?fechainicio=' + fechainicio + '&fechafin=' + fechafin;
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
    if (nroPedido != null && nroPedido > 0) {
      url += '&nropedido=' + nroPedido;
    }
    if (tipoPedido != '' && tipoPedido != null && tipoPedido != undefined) {
      url += '&tipo=' + tipoPedido;
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
    let url = BASE_URL + 'pedidos?page=' + page + '&size=' + size;
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
    let url = BASE_URL + 'pedidos/model/' + id;
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
    let url = BASE_URL + 'pedidos/pedidospendientes?codsucursal=' + codSucursal;
    console.log(url);
    return this.http.get(url)
      .pipe(
        map((response: Pedido[]) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }






}
