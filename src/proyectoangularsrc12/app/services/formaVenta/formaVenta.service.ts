import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UsuarioService } from '../usuario/usuario.service';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { FormaVenta } from '../../models/formaVenta.model';
import { LoginService } from '../login/login.service';
@Injectable()
export class FormaVentaService {

  forma: FormaVenta[] = [];

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
                public http: HttpClient,
                public router: Router,
              ) {}

   traerFormaVenta(codeEmpresa) {
   let url = BASE_URL + 'formaventa?codempresa=' + codeEmpresa;
     return this.http.get( url)
     .map( (resp: any) => resp);
    }

    getFormaVentaById(id): Observable<FormaVenta> {
      return this.http.get<FormaVenta>(BASE_URL + 'formaventa' + `/${id}`).pipe(
        catchError(e => {
         // this.router.navigate(['/formaVenta']);
          console.error(e.error.mensaje);
          Swal.fire('Error al editar', e.error.mensaje, 'error');
          return throwError(e);
        })
      );
    }

    create(formaVenta: FormaVenta): Observable<FormaVenta> {
      return this.http.post(BASE_URL + 'formaventa', formaVenta)
        .pipe(
          map((response: any) => response.formaVenta as FormaVenta),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(formaVenta: FormaVenta): Observable<any> {
      return this.http.put<any>(BASE_URL + 'formaventa', formaVenta).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    delete(id: number): Observable<FormaVenta> {
      return this.http.delete<FormaVenta>(BASE_URL + 'formaventa' + `/${id}`).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

}
