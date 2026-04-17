import {Injectable} from '@angular/core';
import {User} from '../../models/user.model';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BASE_URL} from '../../config/config';
import 'rxjs/add/operator/map';
import {Router} from '@angular/router';
import {SubirArchivoService} from '../subir-archivo/subir-archivo.service';
import Swal from 'sweetalert2';
import {Usuarios} from '../../models/usuarios.model';
import {Observable} from 'rxjs';
import {tap, map, catchError} from 'rxjs/operators';
import {_throw as throwError} from 'rxjs/observable/throw';
import {LoginService} from '../login/login.service';
@Injectable()
export class UsuarioService {
  user: User;

  constructor(
    public http: HttpClient,
    public router: Router,
    public _loginService: LoginService,
    public _subirArchivoService: SubirArchivoService
  ) { }

  traerUsuariosPorSucursal(cod) {
    let url = '';
    url = BASE_URL + 'usuarios?codsucursal=' + cod;
    console.log(url);
    return this.http.get(url).map((response: any) => {
      console.log(response.content)
      return response.content;
    });
  }

  traerUsuarios(page: number, termino: string) {
    let url = '';
    if (termino === '' || termino === '') {
      console.log('sin termino');
      url = BASE_URL + 'usuarios?' + 'page=' + page + '&size=10';
    } else {
      url = BASE_URL + 'usuarios?size=10&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url).map((response: any) => {
      return response.content;
    });
  }

  traerUsuariosPorPaginasComponente(page: number, termino: string): Observable<any>  {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'usuarios?' + 'page=' + page + '&size=10';
    } else {
      url = BASE_URL + 'usuarios?size=10&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
    return this.http
      .get(url)
      .map((response: any) => response);
  }

  uploadImage(imagen, code): Observable<any> {

    let formData: FormData = new FormData();
    formData.append('id', code);
    formData.append('image', imagen);
    let url = BASE_URL + 'usuarios/upload-image';
    return this.http
      .post(url, formData)
      .map((response: any) => {
        console.log(response);
        return response;
      });
  }

  traerEmpresasPorId(id: number) {
    let url = BASE_URL + 'empresas/' + id;
    console.log(url);
    return this.http.get(url).map((resp: any) => resp);
  }

  getUsuario(id): Observable<Usuarios> {
    return this.http
      .get<Usuarios>(BASE_URL + 'usuarios' + `/${id}`)
      .pipe(
        catchError(e => {
          // this.router.navigate(['/usuarios']);
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getUsuarioByIdForImg(id): Observable<Usuarios> {
    return this.http
      .get<Usuarios>(BASE_URL + 'usuarios' + `/${id}`)
      .pipe(tap((response: any) => response as Usuarios));
  }

  create(usuario: Usuarios) {
    return this.http
      .post<any>(BASE_URL + 'usuarios', usuario)
      .pipe(
        tap((response: any) => response.usuario as Usuarios),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  update(usuario: Usuarios): Observable<any> {
    return this.http
      .put<any>(BASE_URL + 'usuarios', usuario)
      .pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  delete(id: number): Observable<Usuarios> {
    return this.http
      .delete<Usuarios>(BASE_URL + 'usuarios' + `/${id}`)
      .pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
}
