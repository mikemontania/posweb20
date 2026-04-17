import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Bancos } from '../../models/bancos.model';
import { LoginService } from '../login/login.service';
@Injectable()
export class DashboardService {


  constructor(
    public http: HttpClient,
    public router: Router,
    public _loginService: LoginService
  ) {
  }

  traerByCodEmp(codeEmpresa) {
    let url = BASE_URL + 'bancos?codempresa=' + codeEmpresa;
    console.log(url);
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  delete(id: number): Observable<Bancos> {
    return this.http.delete<Bancos>(BASE_URL + 'bancos' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getTopProductos(fechaInicio, fechaFin, codUsuario, codsucursal) {
    let url: string;
    if (codUsuario == 0 && codsucursal == 0) {
      url = BASE_URL + 'ventas/topproductos?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin;
    } else if (codUsuario != 0 && codsucursal == 0) {
      url = BASE_URL + 'ventas/topproductos?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codusuario=' + codUsuario;
    } else if (codUsuario == 0 && codsucursal != 0) {
      url = BASE_URL + 'ventas/topproductos?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codsucursal=' + codsucursal;
    } else if (codUsuario != 0 && codsucursal != 0) {
      url = BASE_URL + 'ventas/topproductos?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codusuario=' + codUsuario + '&codsucursal=' + codsucursal;
    }
    return this.http.get(url).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getResumenMediopago(fechaInicio, fechaFin, codUsuario, codsucursal) {
    let url: string;
    if (codUsuario == 0 && codsucursal == 0) {
      url = BASE_URL + 'cobranzas/resumenmediopago?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin;
    } else if (codUsuario != 0 && codsucursal == 0) {
      url = BASE_URL + 'cobranzas/resumenmediopago?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codusuario=' + codUsuario;
    } else if (codUsuario == 0 && codsucursal != 0) {
      url = BASE_URL + 'cobranzas/resumenmediopago?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codsucursal=' + codsucursal;
    } else if (codUsuario != 0 && codsucursal != 0) {
      url = BASE_URL + 'cobranzas/resumenmediopago?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codusuario=' + codUsuario + '&codsucursal=' + codsucursal;
    }
     return this.http.get(url).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getTopClientes(fechaInicio, fechaFin, codUsuario, codsucursal) {
    let url: string;
    if (codUsuario == 0 && codsucursal == 0) {
      url = BASE_URL + 'ventas/topclientes?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin;
    } else if (codUsuario != 0 && codsucursal == 0) {
      url = BASE_URL + 'ventas/topclientes?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codusuario=' + codUsuario;
    } else if (codUsuario == 0 && codsucursal != 0) {
      url = BASE_URL + 'ventas/topclientes?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codsucursal=' + codsucursal;
    } else if (codUsuario != 0 && codsucursal != 0) {
      url = BASE_URL + 'ventas/topclientes?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codusuario=' + codUsuario + '&codsucursal=' + codsucursal;
    }
      return this.http.get(url).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getResumenUsuario(fechaInicio, fechaFin, codUsuario, codsucursal) {
    let url: string;
    if (codUsuario == 0 && codsucursal == 0) {
      url = BASE_URL + 'ventas/resumenusuario?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin;
    } else if (codUsuario != 0 && codsucursal == 0) {
      url = BASE_URL + 'ventas/resumenusuario?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codusuario=' + codUsuario;
    } else if (codUsuario == 0 && codsucursal != 0) {
      url = BASE_URL + 'ventas/resumenusuario?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codsucursal=' + codsucursal;
    } else if (codUsuario != 0 && codsucursal != 0) {
      url = BASE_URL + 'ventas/resumenusuario?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codusuario=' + codUsuario + '&codsucursal=' + codsucursal;
    }
       return this.http.get(url).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getResumenSucursal(fechaInicio, fechaFin, codsucursal) {
    let url: string;
    if (codsucursal == 0) {
      url = BASE_URL + 'ventas/resumensucursal?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin;
    } else if (codsucursal != 0) {
      url = BASE_URL + 'ventas/resumensucursal?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codsucursal=' + codsucursal;
    }
    return this.http.get(url).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getResumenReparto(fechaInicio, fechaFin, codsucursal) {
    let url: string;
    if (codsucursal == 0) {
      url = BASE_URL + 'ventas/resumensucursalreparto?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin;
    } else if (codsucursal != 0) {
      url = BASE_URL + 'ventas/resumensucursalreparto?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codsucursal=' + codsucursal;
    }
    return this.http.get(url).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


    getResumenCanal(fechaInicio, fechaFin, codsucursal) {
    let url: string;
    if (codsucursal == 0) {
      url = BASE_URL + 'ventas/resumencanal?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin;
    } else if (codsucursal != 0) {
      url = BASE_URL + 'ventas/resumencanal?fechainicio=' + fechaInicio + '&fechafin=' + fechaFin
        + '&codsucursal=' + codsucursal;
    }
    return this.http.get(url).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
}
