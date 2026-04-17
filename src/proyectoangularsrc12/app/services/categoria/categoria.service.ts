import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
 import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { CategoriaProducto } from '../../models/categoriaProducto.model';
import {   map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
 @Injectable()
export class CategoriaService {

  constructor(
                public http: HttpClient,
                public router: Router,
              ) {}

   traerCategoria(codeEmpresa) {
   let url = BASE_URL + 'categoriaproducto?codempresa=' + codeEmpresa;
     console.log( url);
     return this.http.get( url)
     .map( (resp: any) => resp);
    }

    delete(id: number): Observable<CategoriaProducto> {
      return this.http.delete<CategoriaProducto>(BASE_URL + 'categoriaproducto' + `/${id}`).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    getById(id): Observable<CategoriaProducto> {
      return this.http.get<CategoriaProducto>(BASE_URL + 'categoriaproducto' + `/${id}`).pipe(
        catchError(e => {
          this.router.navigate(['/categoria']);
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

    create(categoria: CategoriaProducto): Observable<CategoriaProducto> {
      return this.http.post(BASE_URL + 'categoriaproducto', categoria)
        .pipe(
          map((response: any) => response.categoriaProducto as CategoriaProducto),
          catchError(e => {
            console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
            return throwError(e);
          })
        );
    }
    update(categoria: CategoriaProducto): Observable<any> {
      return this.http.put<any>(BASE_URL + 'categoriaproducto', categoria).pipe(
        catchError(e => {
          console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
    }

}
