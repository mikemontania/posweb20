import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Alianza } from '../../models/alianza.model';
import { InfluencerDescuento } from '../../models/influencerDescuento.model';
import { Influencer } from 'src/app/models/influencer.model';
@Injectable()
export class InfluencersService {

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }


  obtenerDescuento(codeEmpresa: number, cupon: string, codCliente: number): Observable<InfluencerDescuento> {
    let url = BASE_URL + 'influencers/descuentocupon?codempresa=' + codeEmpresa + '&cupon=' + cupon + '&codcliente=' + codCliente;
    return this.http.get<InfluencerDescuento>(url).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
 
  traerByCodEmp(codeEmpresa) {
    let url = BASE_URL + 'influencers?codempresa=' + codeEmpresa;
    console.log(url);
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  delete(id: number): Observable<Influencer> {
    return this.http.delete<Influencer>(BASE_URL + 'influencers' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  getById(id): Observable<Influencer> {
    return this.http.get<Influencer>(BASE_URL + 'influencers' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  create(i: Influencer): Observable<Influencer> {
    return this.http.post(BASE_URL + 'influencers', i)
      .pipe(
        map((response: any) => response as Influencer),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  
  update(i: Influencer): Observable<any> {
    return this.http.put<any>(BASE_URL + 'influencers', i).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
