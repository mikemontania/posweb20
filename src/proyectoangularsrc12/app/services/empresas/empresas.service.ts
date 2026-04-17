import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  BASE_URL } from '../../config/config';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { Empresas } from '../../models/empresas.model';
import { UsuarioService } from '../usuario/usuario.service';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import { LoginService } from '../login/login.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';




@Injectable()
export class EmpresasService {
  private urlEndPoint: string = BASE_URL;
  empresas: Empresas;
   constructor(
    public http: HttpClient,
    public router: Router,
  ) {}
 
  traerEmpresas() {
    let url = BASE_URL + 'empresas';
    console.log(url);
    return this.http.get(url)
      .map((resp: any) => resp);
  }
  traerEmpresasPorId(id: number) {
    let url = BASE_URL + 'empresas/' + id;
    console.log(url);
    return this.http.get(url)
      .map((resp: any) =>  resp );
  }
  getImagen(nombre: string){
    let url = BASE_URL + 'empresas/download-image/' + nombre;
    return this.http.get(url, {  responseType:'blob'})
    // .map( data => data);
  }

  // getEmpresas(page: number): Observable<any> {
  //   return this.http.get(BASE_URL + 'empresas' + page).pipe(
  //     tap((response: any) => {
  //       console.log('ClienteService: tap 1');
  //       (response.content as Cliente[]).forEach(cliente => console.log(cliente.nombre));
  //     }),
  //     map((response: any) => {
  //       (response.content as Cliente[]).map(cliente => {
  //         cliente.nombre = cliente.nombre.toUpperCase();
  //         //let datePipe = new DatePipe('es');
  //         //cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
  //         //cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy', 'es');
  //         return cliente;
  //       });
  //       return response;
  //     }),
  //     tap(response => {
  //       console.log('ClienteService: tap 2');
  //       (response.content as Cliente[]).forEach(cliente => console.log(cliente.nombre));
  //     })
  //   );
  // }


  create(empresa: Empresas): Observable<Empresas> {
    return this.http.post(BASE_URL + 'empresas', empresa)
      .pipe(
        map((response: any) => response.empresa as Empresas),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  update(empresa: Empresas): Observable<any> {
    return this.http.put<any>(BASE_URL + 'empresas', empresa).pipe(
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
    let url = BASE_URL + 'empresas/upload-image';
    return this.http.post(url, formData)
      .map((response: any) => {
        console.log(response)
        return response;
      });

  }

  uploadImageReport(imagen, code): Observable<any> {

    let formData: FormData = new FormData();
    formData.append('id', code);
    formData.append('image', imagen);
    let url = BASE_URL + 'empresas/upload-image/reportes';
    return this.http.post(url, formData)
      .map((response: any) => {
        console.log(response)
        return response;
      });

  }


  getempresa(id): Observable<Empresas> {
    return this.http.get<Empresas>(`${this.urlEndPoint}empresas/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/empresas']);
        console.error(e.error.mensaje);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
