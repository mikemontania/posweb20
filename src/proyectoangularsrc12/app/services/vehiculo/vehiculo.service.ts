import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Vehiculo } from '../../models/vehiculo.model';
 
@Injectable()
export class VehiculoService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  getByCodEmp(codeEmpresa) {
    let url = BASE_URL + 'vehiculos?codempresa=' + codeEmpresa;
    console.log(url);
    return this.http.get(url)
      .map((resp: any) => resp);
  }
 


  getByCodEmpresa(codeEmpresa ) {
    let url = BASE_URL + 'vehiculos?codempresa=' + codeEmpresa;
    console.log(url);
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  delete(id: number): Observable<Vehiculo> {
    return this.http.delete<Vehiculo>(BASE_URL + 'vehiculos' + `/${id}`).pipe(
      catchError(e => {
        console.log('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getById(id): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(BASE_URL + 'vehiculos' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/vehiculos']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  create(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(BASE_URL + 'vehiculos', vehiculo)
      .pipe(
        map((response: any) => response.vehiculo as Vehiculo),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  update(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(BASE_URL + 'vehiculos', vehiculo).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
