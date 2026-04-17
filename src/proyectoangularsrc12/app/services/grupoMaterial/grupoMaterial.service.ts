import { Injectable } from '@angular/core';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { GrupoMaterial } from '../../models/grupoMaterial.model';
import Swal from 'sweetalert2';
@Injectable()
export class GrupoMaterialService {

  lista: GrupoMaterial[] = [];

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  getByCodEmpresa(codeEmpresa) {
    let url = BASE_URL + 'grupomaterial?codempresa=' + codeEmpresa;
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  delete(id: string): Observable<GrupoMaterial> {
    return this.http.delete<GrupoMaterial>(BASE_URL + 'grupomaterial' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getById(id): Observable<GrupoMaterial> {
    return this.http.get<GrupoMaterial>(BASE_URL + 'grupomaterial' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/grupoMaterial']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


  create(lista: GrupoMaterial): Observable<GrupoMaterial> {
    return this.http.post(BASE_URL + 'grupomaterial', lista)
      .pipe(
        map((response: any) => response.grupoMaterial as GrupoMaterial),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  update(lista: GrupoMaterial): Observable<any> {
    return this.http.put<any>(BASE_URL + 'grupomaterial', lista).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


}