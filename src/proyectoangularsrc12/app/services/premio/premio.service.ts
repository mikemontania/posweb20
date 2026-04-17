import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsuarioService } from '../usuario/usuario.service';
import { BASE_URL } from '../../config/config';
import { Observable } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { SearchPipe } from '../../pipes/SearchPipe.pipe';
import { _throw as throwError } from 'rxjs/observable/throw';
import Swal from 'sweetalert2';
import { response } from 'express';
import { LoginService } from '../login/login.service';
import { Premio } from '../../models/premio.model ';

@Injectable()
export class PremioService {
  premio: Premio[] = [];


  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }


  getPremioByCodErp(codPremioErp: string): Observable<any> {
    return this.http.get(BASE_URL + 'premios/getByCodErp?codPremioErp=' + codPremioErp).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


  traerPremios() {
    let url = BASE_URL + 'premios';
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  traerPremiosPorTermino(termino) {
    let url = BASE_URL + 'premios?keyword=' + termino;
    return this.http.get(url)
      .map((resp: any) => resp);
  }
 
  traerPremiosActivosPorPaginas(page: number, termino: string, puntosDesde: number, puntosHasta: number) {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'premios?size=16&page=' + page + '&activo=true&puntosdesde=' + puntosDesde + '&puntoshasta=' + puntosHasta;
    } else {
      url = BASE_URL + 'premios?size=16&page=' + page + '&activo=true&puntosdesde=' + puntosDesde + '&puntoshasta=' + puntosHasta + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

  traerPremiosPorPaginasComponente(page: number, termino: string, puntosDesde: number, puntosHasta: number): Observable<any[]> {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'premios?size=16&page=' + page + '&puntosdesde=' + puntosDesde + '&puntoshasta=' + puntosHasta;
    } else {
      url = BASE_URL + 'premios?size=16&page=' + page + '&puntosdesde=' + puntosDesde + '&puntoshasta=' + puntosHasta + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

  getImagen(nombre: string) {
    let url = BASE_URL + 'premios/download-image/' + nombre;
    return this.http.get(url, { responseType: 'blob' });
    // .map( data => data);
  }

  guardarImagenPremio(imagen, id) {
    let body = { 'image': imagen, 'id': id }
    return this.http.post<any>(BASE_URL + 'premios/upload-image', body).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  uploadImage(imagen, code): Observable<any> {

    let formData: FormData = new FormData();
    formData.append('id', code);
    formData.append('image', imagen);
    let url = BASE_URL + 'premios/upload-image';
    return this.http.post(url, formData)
      .map((response: any) => {
        console.log(response)
        return response;
      });

  }
  getPremios(page: number): Observable<any> {
    return this.http.get(BASE_URL + 'premios?page=' + page).pipe(
      /*  tap((response: any) => {
         console.log('PRoductoService: tap 1');
         (response.content as Premio[]).forEach(premio => console.log(premio.nombrePremio));
       }), */
      map((response: any) => {
        (response.content as Premio[]).map(premio => {
          premio.descripcion = premio.descripcion.toUpperCase();
          // let datePipe = new DatePipe('es');
          // cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
          // cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy', 'es');
          return premio;
        });
        return response;
      }),
      tap(res => {
        console.log('PRoductoService: tap 2');
        (res.content as Premio[]).forEach(premio => console.log(premio.descripcion));
      })
    );
  }


  buscarPremio(termino: string) {
    let url = BASE_URL + 'premios?page=0' + '&keyword=' + termino;

    console.log(url);
    return this.http.get(url)
      .map((respo: any) => {
        return respo.content;
      });
  }


  create(premio: Premio) {
    return this.http.post<any>(BASE_URL + 'premios', premio)
      .pipe(
        tap((respons: any) => respons.premio as Premio),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getPremio(id): Observable<Premio> {
    return this.http.get<Premio>(BASE_URL + 'premios' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/premios']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  updatePremio(premio: Premio): Observable<any> {
    return this.http.put<any>(BASE_URL + 'premios', premio).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  deletePremio(id: number): Observable<Premio> {
    return this.http.delete<Premio>(BASE_URL + 'premios' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
