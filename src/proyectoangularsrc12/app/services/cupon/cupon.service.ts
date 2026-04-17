import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Cupon } from '../../models/cupon.model';
import Swal from 'sweetalert2';
import { Cliente } from 'src/app/models/cliente.model';

@Injectable()
export class CuponService {
  cupon: Cupon;


  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  getCuponByCupon(codEmpresa, cupon): Observable<Cupon> {
    return this.http.get<Cupon>(BASE_URL + `cupones/cupon?codempresa=${codEmpresa}&cupon=${cupon}`).pipe(
      catchError(e => {
        console.error(e.error.mensaje);
        Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  getCuponesPorPaginas(page: number, termino: string) {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'cupones/paginado?size=10&page=' + page;
    } else {
      url = BASE_URL + 'cupones/paginado?size=10&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }



  invalidarCupon(cupon: string, cliente: Cliente): Observable<any> {
    let url: string = BASE_URL + 'cupones/invalidar?cupon=' + cupon + '&docnro=' + cliente.docNro + '&razonsocial=' + cliente.razonSocial;
    return this.http.put<any>(url, null).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }





  searchCupones(termino: string) {
    let url = BASE_URL + 'cupones/paginado?page=0' + '&keyword=' + termino;
    console.log(url);
    return this.http.get(url)
      .map((response: any) => {
        return response.content;
      });
  }


  getCuponesPorTermino(termino) {
    let url = BASE_URL + 'cupones?keyword=' + termino;
    return this.http.get(url)
      .map((resp: any) => resp);
  }
  delete(id: number) {
    return this.http.delete(BASE_URL + 'cupones' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  createCupon(cupon: Cupon): Observable<Cupon> {
    console.log(cupon);
    return this.http.post(BASE_URL + 'cupones', cupon)
      .pipe(
        map((response: any) => response.cupon as Cupon),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getCuponById(id): Observable<Cupon> {
    return this.http.get<Cupon>(BASE_URL + 'cupones' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/cupones']);
        console.error(e.error.mensaje);
        Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }


  updateEstado(codCupon): Observable<any> {
    let url: string = BASE_URL + 'cajero_sup/cupones/estado?codcupon=' + codCupon;
    return this.http.put<any>(url, null).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  updateCupon(cupon: Cupon): Observable<any> {
    return this.http.put<any>(BASE_URL + 'cupones', cupon).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  deleteCupon(id: number): Observable<Cupon> {
    return this.http.delete<Cupon>(BASE_URL + 'cupones' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
