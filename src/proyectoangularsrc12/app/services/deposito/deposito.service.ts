import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Deposito } from '../../models/deposito.model';
@Injectable()
export class DepositoService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  getByCodEmp(codeEmpresa) {
    let url = BASE_URL + 'depositos?codempresa=' + codeEmpresa;
    console.log(url);
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  getDepositoVenta(codeEmpresa, codSucursal) {
    let url = BASE_URL + 'depositos/venta?codempresa=' + codeEmpresa + '&codsucursal=' + codSucursal;
    return this.http.get(url)
      .map((response: any) => {
        console.log(response);
        return response;
      });
  }


  getByCodEmpAndCodSuc(codeEmpresa, codSucursal) {
    let url = BASE_URL + 'depositos?codempresa=' + codeEmpresa;
    url = url + '&codsucursal=' + codSucursal;
    console.log(url);
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  delete(id: number): Observable<Deposito> {
    return this.http.delete<Deposito>(BASE_URL + 'depositos' + `/${id}`).pipe(
      catchError(e => {
        console.log('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getById(id): Observable<Deposito> {
    return this.http.get<Deposito>(BASE_URL + 'depositos' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/depositos']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  create(depositos: Deposito): Observable<Deposito> {
    return this.http.post(BASE_URL + 'depositos', depositos)
      .pipe(
        map((response: any) => response.depositos as Deposito),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  update(depositos: Deposito): Observable<any> {
    return this.http.put<any>(BASE_URL + 'depositos', depositos).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
