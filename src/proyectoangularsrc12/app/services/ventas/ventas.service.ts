import { Injectable } from '@angular/core';
import { Cabecera } from '../../models/cabecera.model';
import { Detalles } from '../../models/detalles.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsuarioService } from '../usuario/usuario.service';
import { BASE_URL } from '../../config/config';
import * as moment from 'moment';
import { Cliente } from '../../models/cliente.model';
import { Venta } from '../../models/venta.model';
import { stringify } from '@angular/compiler/src/util';
import { LoginService } from '../login/login.service';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Usuarios } from '../../models/usuarios.model';
import { Sucursal } from '../../models/sucursal.model';
import { MotivoAnulacion } from '../../models/motivoAnulacion.model';
import { Cobranza } from '../../models/cobranza.model';
@Injectable()
export class VentasService {
  cabecera: Cabecera;
  detalles: Detalles[] = [];
  constructor(
    public http: HttpClient,
    public router: Router,
    private _loginService: LoginService,
  ) { }

  anular(id): Observable<any> {
    let url = BASE_URL + 'ventas/anular/' + id;
    return this.http.put<any>(url, null).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  anularVenta(id: number, motivoAnulacion: MotivoAnulacion): Observable<any> {
    let url = BASE_URL + 'ventas/anular/' + id;
    console.log(url, motivoAnulacion);
    return this.http.put<any>(url, motivoAnulacion).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  cerrarVenta(modelo) {
    console.log(modelo);
    let body = modelo;
    let url = BASE_URL + 'ventas';
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

  cambiarCobranza(modelo) {
    console.log(modelo);
    let body = modelo;
    let url = BASE_URL + 'ventas';
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

  /* 
  findByFecha( page,  fechainicio, fechafin, cliente: Cliente,  usuario: Usuarios , sucursal: Sucursal , nroComprobante: string, size: number) {
  
    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment( new Date()).format('YYYY-MM-DD');
    }
    let codusuario = this._loginService.user.codUsuario;
    let codesucursal = 1;
    let url = BASE_URL + 'ventas?page=' + page + '&size=' +size ;
      url +=  '&fechainicio=' + fechainicio + '&fechafin=' + fechafin;
    if (cliente) {
      url +=  '&codcliente=' + cliente.codCliente;
    }
  
    if (usuario) {
      url +=  '&codusuario=' + usuario.codUsuario;
    }
  
    if (sucursal) {
      url +=   '&codsucursal=' + sucursal.codSucursal;
    }
    if (nroComprobante != '' && nroComprobante != null && nroComprobante != undefined ) {
      url +=   '&nrocomprobante=' + nroComprobante;
    }
  

      console.log(url);
      return this.http.get(url)
      .pipe(
        map((response: any) => response ),
        catchError(e => {
          console.error('ERROR', e.error);
              Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );

  }

   */

  findTotal(fechainicio, fechafin, cliente: Cliente, usuario: Usuarios, sucursal: Sucursal, nroComprobante: string,tipo: string, estado: string) {
    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let codusuario = this._loginService.user.codUsuario;
    let url = BASE_URL + 'ventas/totales?fechainicio=' + fechainicio + '&fechafin=' + fechafin;
    if (cliente) {
      url += '&codcliente=' + cliente.codCliente;
    }
    if (usuario) {
      url += '&codusuario=' + usuario.codUsuario;
    }
    if (sucursal) {
      url += '&codsucursal=' + sucursal.codSucursal;
    }
    if (nroComprobante != '' && nroComprobante != null && nroComprobante != undefined) {
      url += '&nrocomprobante=' + nroComprobante;
    }
    if (tipo != '' && tipo != null && tipo != undefined) {
      url += '&tipo=' + tipo;
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


  findByFecha(page, fechainicio, fechafin, cliente: Cliente, usuario: Usuarios, sucursal: Sucursal, nroComprobante: string,tipoVenta: string, estado: string, size: number, anulado: boolean) {
    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let codusuario = this._loginService.user.codUsuario;
    let codesucursal = 1;
    let url = BASE_URL + 'ventas?page=' + page + '&size=' + size;
    url += '&fechainicio=' + fechainicio + '&fechafin=' + fechafin;
    if (cliente) {
      url += '&codcliente=' + cliente.codCliente;
    }
    if (usuario) {
      url += '&codusuario=' + usuario.codUsuario;
    }
    if (sucursal) {
      url += '&codsucursal=' + sucursal.codSucursal;
    }
    if (nroComprobante != '' && nroComprobante != null && nroComprobante != undefined) {
      url += '&nrocomprobante=' + nroComprobante;
    }
    if (tipoVenta != '' && tipoVenta != null && tipoVenta != undefined) {
      url += '&tipo=' + tipoVenta;
    }
    if (estado != 'TODOS' && estado != '' && estado != null && estado != undefined) {
      url += '&estado=' + estado;
    }
    if (anulado != null && anulado != undefined) {
      url += '&anulado=' + anulado;
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






  
  listaVentas(fechainicio, fechafin, cliente: Cliente, usuario: Usuarios, sucursal: Sucursal, nroComprobante: string,tipo: string, estado: string, anulado: boolean) {
    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let url = BASE_URL + 'ventas/listadoventas?fechainicio=' + fechainicio + '&fechafin=' + fechafin;
    if (cliente) {
      url += '&codcliente=' + cliente.codCliente;
    }
    if (usuario) {
      url += '&codusuario=' + usuario.codUsuario;
    }
    if (sucursal) {
      url += '&codsucursal=' + sucursal.codSucursal;
    }
    if (nroComprobante != '' && nroComprobante != null && nroComprobante != undefined) {
      url += '&nrocomprobante=' + nroComprobante;
    }
    if (tipo != '' && tipo != null && tipo != undefined) {
      url += '&tipo=' + tipo;
    }
    if (estado != 'TODOS' && estado != '' && estado != null && estado != undefined) {
      url += '&estado=' + estado;
    }
    if (anulado != null && anulado != undefined) {
      url += '&anulado=' + anulado;
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


  traerVentas(page,
    fechainicio,
    fechafin,
    codCliente: number,
    codUsuario: number,
    codSucursal: number,
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
    let url = BASE_URL + 'ventas?page=' + page + '&size=' + size;
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


  traerVentaPorID(id) {
    let url = BASE_URL + 'ventas/model/' + id;
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

  traercomprobante(venta: Venta) {
    let url = BASE_URL + 'ventas/comprobante/' + venta.codVenta;
    console.log(url);
    console.log(url);
    return this.http.get(url, { responseType: 'blob' })
      .map((response: any) => {
        console.log(response);
        return new Blob([response], { type: 'application/pdf' });
      });

  }
 
  reporteDetalleCobranza(
    fechainicio,
    fechafin,
    codMedioPago: number,
    codUsuario: number,
    codSucursal: number) {

    if (!fechainicio) {
      fechainicio = moment(new Date()).format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let codusuario = this._loginService.user.codUsuario;
    let url = BASE_URL + 'cobranzas/reportedetallemediopago?fechainicio=' + fechainicio + '&fechafin=' + fechafin ;
    if (codMedioPago) {
      url += '&codmediopago=' + codMedioPago;
    }
    if (codUsuario) {
      url += '&codusuario=' + codUsuario;
    }
    if (codSucursal) {
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

  traerDetalleCobranza(
    page,
    fechainicio,
    fechafin,
    codMedioPago: number,
    codUsuario: number,
    codSucursal: number,
    size: number) {

    if (!fechainicio) {
      fechainicio = moment(new Date()).format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }
    let codusuario = this._loginService.user.codUsuario;
    let url = BASE_URL + 'cobranzas/detallemediopago?fechainicio=' + fechainicio + '&fechafin=' + fechafin + '&page=' + page + '&size=' + size;
    if (codMedioPago) {
      url += '&codmediopago=' + codMedioPago;
    }
    if (codUsuario) {
      url += '&codusuario=' + codUsuario;
    }

    if (codSucursal) {
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


  traerImagen(img: string, tipo: string) {
    let url = BASE_URL + tipo + '/download-image/' + img;
    console.log(url);
    return this.http.get(url, { responseType: 'blob' })
      .map((response: any) => {
        console.log(response);
        return new Blob([response], { type: 'image/png' });
      });


  }

  verTicketPdf(venta_id: number, tipo: string) {
    let url = BASE_URL + 'ventas/report/?venta_id=' + venta_id + '&tipo=' + tipo;
    console.log(url);
    return this.http.get(url, { responseType: 'blob' })
      .map((response: any) => {
        console.log(response);
        return new Blob([response], { type: 'application/pdf' });
      });
  }

  verReporteVendedoresPdf(fechaInicio: any, fechaFin: any, codEmpresa: number, codSucursal: number, codVendedor: number) {
    let url = BASE_URL + 'ventas/reporteventasvendedor/?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin+ '&codempresa=' + codEmpresa;
    url = url + '&codsucursal=' + codSucursal + '&codvendedor=' + codVendedor;
    console.log(url);
    return this.http.get(url, { responseType: 'blob' })
      .map((response: any) => {
        console.log(response);
        return new Blob([response], { type: 'application/pdf' });
      });
  }

  verTicket80Pdf(codVenta: number, tipoCopia: string ) {
    let url = BASE_URL + 'ventas/ticket/?codVenta=' + codVenta + '&tipoCopia=' + tipoCopia;
    console.log(url);
    return this.http.get(url, { responseType: 'blob' })
      .map((response: any) => {
        console.log(response);
        return new Blob([response], { type: 'application/pdf' });
      });
  }



}
