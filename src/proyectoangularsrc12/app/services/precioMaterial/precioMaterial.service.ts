import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { PrecioMaterial } from '../../models/precioMaterial.model';

@Injectable()
export class PrecioMaterialService {

  constructor(
    public http: HttpClient,
    public router: Router,
  ) {

  }

  cambiarPrecios(codEmpresa: number, codSucursalErp: string, nuevosPrecios: PrecioMaterial[]): Observable<any> {
    console.log('nuevosPrecios', nuevosPrecios);
    let url = BASE_URL + 'precioMaterial/cambioprecio?codempresa=' + codEmpresa + '&codsucursalerp=' + codSucursalErp;
    return this.http.put<any>(url, nuevosPrecios).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  getPrecioMaterialById(id): Observable<PrecioMaterial> {
    return this.http.get<PrecioMaterial>(BASE_URL + 'precioMaterial' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


  getPrecioMaterialBySucursalId(codSucursal) {
    return this.http.get(BASE_URL + 'precioMaterial/list?codsucursal' +codSucursal).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  create(precio: PrecioMaterial): Observable<PrecioMaterial> {
    console.log(precio);
    return this.http.post(BASE_URL + 'precioMaterial', precio)
      .pipe(
        map((response: any) => response.precio as PrecioMaterial),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  crearPrecios(precios) {
    return this.http.post(BASE_URL + 'precioMaterial/all', precios)
      .pipe(
        map((response: any) => response),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.close();
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  update(precio: PrecioMaterial): Observable<PrecioMaterial> {
    return this.http.put<any>(BASE_URL + 'precioMaterial', precio).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }



  traerPreciosMaterialesPorPaginas(page: number, codProd: number, codSuc: number) {
    let url = BASE_URL + 'precioMaterial?size=10&page=' + page;
    if (codProd > 0) {
      url = url + '&codproducto=' + codProd;
    }
    if (codSuc > 0) {
      url = url + '&codsucursal=' + codSuc;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

  findByPrecioCostoActual(codProdErp: string, codSucErp: string): Observable<PrecioMaterial> {
    let url = BASE_URL + 'precioMaterial/precioCosto/?codproductoerp=' + codProdErp + '&codsucursalerp=' + codSucErp;
    console.log(url);
    return this.http.get<PrecioMaterial>(url).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


  delete(id: number): Observable<PrecioMaterial> {
    return this.http.delete<PrecioMaterial>(BASE_URL + 'precioMaterial' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
}
