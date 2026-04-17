import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
@Injectable()
export class HistorialPuntosService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  getLista(codCliente, fecha) {
    let url:string;
    if (codCliente == null) {
      url = BASE_URL + 'historialpuntos?fechainicio=' + fecha;
    } else {
      url = BASE_URL + 'historialpuntos?codCliente=' + codCliente + '&fechainicio=' + fecha;
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
