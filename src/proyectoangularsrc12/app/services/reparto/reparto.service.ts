import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import * as moment from 'moment';
import { Cliente } from '../../models/cliente.model';
import { Venta } from '../../models/venta.model';
import { LoginService } from '../login/login.service';
import { map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Usuarios } from '../../models/usuarios.model';
import { Sucursal } from '../../models/sucursal.model';
import { MotivoAnulacion } from '../../models/motivoAnulacion.model';
import { Cobranza } from '../../models/cobranza.model';
import { Chofer } from '../../models/chofer.model';
import { Vehiculo } from '../../models/vehiculo.model';
@Injectable()
export class RepartoService {

  constructor(
    public http: HttpClient, public router: Router, private _loginService: LoginService) { }

  anular(id): Observable<any> {
    let url = BASE_URL + 'repartos/anular/' + id;
    return this.http.put<any>(url, null).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  cerrar(modelo) {
    console.log(modelo);
    let body = modelo;
    let url = BASE_URL + 'repartos';
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

  update(modelo) {
    console.log(modelo);
    let body = modelo;
    let url = BASE_URL + 'repartos';
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


  getById(id) {
    let url = BASE_URL + 'repartos/' + id;
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
  getMarcadoresById(id) {
    let url = BASE_URL + 'repartos/marcadores?codreparto=' + id;
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



  changeOrder(codreparto:number,codrepartodocs:number,direccion:string) {
    let url = BASE_URL + 'repartos/marcadoreschangeorder?codreparto=' + codreparto+ '&codrepartodocs='+codrepartodocs+'&direccion='+direccion;
    console.log(url);
    return this.http.put(url,null)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }




  sortMarkerBySuc(codreparto:number,codsucursal:number ) {
    let url = BASE_URL + 'repartos/marcadoressortsucursal?codreparto=' + codreparto+ '&codsucursal='+codsucursal ;
    console.log(url);
    return this.http.put(url,null)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }


  sortMarkerByMarcador(codreparto:number,codrepartodoc:number ) {
    let url = BASE_URL + 'repartos/marcadoressortbymarcador?codreparto=' + codreparto+ '&codrepartodoc='+codrepartodoc ;
    console.log(url);
    return this.http.put(url,null)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  findByFecha(page: number, size: number, usuario: Usuarios, chofer: Chofer, vehiculo: Vehiculo, fechainicio: any, fechafin: any) {

    if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    if (!fechafin) {
      fechafin = moment(new Date()).format('YYYY-MM-DD');
    }

    let url = BASE_URL + 'repartos?page=' + page + '&size=' + size;
    url += '&fechainicio=' + fechainicio + '&fechafin=' + fechafin;
    if (chofer) {
      url += '&codChofer=' + chofer.codChofer;
    }

    if (vehiculo) {
      url += '&codVehiculo=' + vehiculo.codVehiculo;
    }

    if (usuario) {
      url += '&codUsuario=' + usuario.codUsuario;
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

  verReporteRepartoDetallePdf(fecha: any, codEmpresa: number, codReparto: number) {
    let url = BASE_URL + 'repartos/reportedetalle/?fecha=' + fecha + '&codempresa=' + codEmpresa + '&codreparto=' + codReparto;
    console.log(url);
    return this.http.get(url, { responseType: 'blob' })
      .map((response: any) => {
        console.log(response);
        return new Blob([response], { type: 'application/pdf' });
      });
  }

  verReporteRepartoDocsPdf(fecha: any, codEmpresa: number, codReparto: number) {
    let url = BASE_URL + 'repartos/reportedocs/?fecha=' + fecha + '&codempresa=' + codEmpresa + '&codreparto=' + codReparto;
    console.log(url);
    return this.http.get(url, { responseType: 'blob' })
      .map((response: any) => {
        console.log(response);
        return new Blob([response], { type: 'application/pdf' });
      });
  }


}
