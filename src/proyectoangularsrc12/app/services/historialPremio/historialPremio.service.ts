import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import * as moment from 'moment';
@Injectable()
export class HistorialPremioService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  getLista(codSucursal:number, codPremio:number,fechainicio:string) {
    
     if (!fechainicio) {
      fechainicio = moment('2018-01-01').format('YYYY-MM-DD');
    }
    let url:string = BASE_URL + 'historialpremio?fechainicio=' + fechainicio
    if (codSucursal) {
      url = url + '&codSucursal=' + codSucursal;
    }
    if (codPremio) {
      url = url + '&codPremio=' + codPremio;
    } 
     

    console.log(url);
    return this.http.get(url).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}