import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UsuarioService } from '../usuario/usuario.service';
import { Router } from '@angular/router';
import { Sucursal } from '../../models/sucursal.model';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { LoginService } from '../login/login.service';

@Injectable()
export class SucursalesService {

  sucursales: Sucursal[] = [];

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  traerSucursales(codeEmpresa) {
    let url = BASE_URL + 'sucursales?codempresa=' + codeEmpresa;
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  getSucursalbyId(id): Observable<Sucursal> {
    return this.http.get<Sucursal>(BASE_URL + 'sucursales' + `/${id}`).pipe(
      catchError(e => {
        // this.router.navigate(['/sucursales']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  create(sucursal: Sucursal): Observable<Sucursal> {
    return this.http.post(BASE_URL + 'sucursales', sucursal)
      .pipe(
        map((response: any) => response.sucursal as Sucursal),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  update(sucursal: Sucursal): Observable<any> {
    return this.http.put<any>(BASE_URL + 'sucursales', sucursal).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  traerSucursalesPorPaginasComponente(page: number, termino: string) {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'sucursales?' + 'page=' + page + '&size=10';
    } else {
      url = BASE_URL + 'sucursales?size=10&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }






  deleteSucursal(id: number): Observable<Sucursal> {
    return this.http.delete<Sucursal>(BASE_URL + 'sucursales' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


}
