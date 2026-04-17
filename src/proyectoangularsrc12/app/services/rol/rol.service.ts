import { Injectable } from '@angular/core';

import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UsuarioService } from '../usuario/usuario.service';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Rol } from '../../models/rol.model';
@Injectable()
export class RolService {

  headers: HttpHeaders;

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  traerRol(codeEmpresa) {
    let url = BASE_URL + 'roles?codempresa=' + codeEmpresa;
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  delete(id: number): Observable<Rol> {
    return this.http.delete<Rol>(BASE_URL + 'roles' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getById(id): Observable<Rol> {
    return this.http.get<Rol>(BASE_URL + 'roles' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/roles']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  create(rol: Rol): Observable<Rol> {
    return this.http.post(BASE_URL + 'roles', rol)
      .pipe(
        map((response: any) => response.rol as Rol),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  update(rol: Rol): Observable<any> {
    return this.http.put<any>(BASE_URL + 'roles', rol).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
