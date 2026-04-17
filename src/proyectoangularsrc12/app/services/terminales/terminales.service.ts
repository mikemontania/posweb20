import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UsuarioService } from '../usuario/usuario.service';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { CategoriaProducto } from '../../models/categoriaProducto.model';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Terminales } from '../../models/terminales.model';
import { LoginService } from '../login/login.service';
@Injectable()
export class TerminalService {
  constructor(
    public http: HttpClient,
    public router: Router,
  ) {

  }

  traerterminales(codeEmpresa, codSucursal) {
    let url = BASE_URL + 'terminales?codempresa=' + codeEmpresa + '&codsucursal=' + codSucursal;
    console.log(url);
    return this.http.get(url)
      .map((resp: any) => resp);
  }
  traerterminalesDisponibles(codeEmpresa, codSucursal) {
    let url = BASE_URL + 'terminales?codempresa=' + codeEmpresa + '&codsucursal=' + codSucursal;
    return this.http.get(url)
      .map((resp: any) => resp);
  }
  traerterminalesOcupadas(codeEmpresa) {
    let url = BASE_URL + 'terminales?codempresa=' + codeEmpresa + '&disponible=false';
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  delete(id: number): Observable<Terminales> {
    return this.http.delete<Terminales>(BASE_URL + 'terminales' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getTerminalById(id): Observable<Terminales> {
    return this.http.get<Terminales>(BASE_URL + 'terminales' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/terminales']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  create(terminal: Terminales): Observable<Terminales> {
    return this.http.post(BASE_URL + 'terminales', terminal)
      .pipe(
        map((response: any) => response.terminales as Terminales),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  update(terminal: Terminales): Observable<any> {
    return this.http.put<any>(BASE_URL + 'terminales', terminal).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
