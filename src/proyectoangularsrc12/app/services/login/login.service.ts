import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BASE_URL } from '../../config/config';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { SubirArchivoService } from '../subir-archivo/subir-archivo.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { _throw as throwError } from 'rxjs/observable/throw';
import { map, catchError } from 'rxjs/operators';
import { TerminalVenta } from '../../models/terminalVenta.model';

@Injectable()
export class LoginService {
  user: User;
  token: string;
  terminal: TerminalVenta = {
    codTerminalVenta: 0,
    descripcion: 'No Seleccionada',
    id: '363ddbe5-ead3-7455-39a8-6737444ae234',
    codEmpresa: 0,
    codSucursal: 0,
    disponible: false
  };
  constructor(
    public http: HttpClient,
    public router: Router,
    public _subirArchivoService: SubirArchivoService
  ) {
    this.cargarStorage();
  }

  actualizarToken() {
    return this.http.get(BASE_URL + 'auth/token')
      .pipe(
        map((response: any) => {
          console.log(response);

          let decode = [];
          decode = response.token.split('.');
          let usu: any;
          let ini;
          let exp;
          usu = JSON.parse(window.atob(decode[1]));
          ini = new Date(usu.iat * 1000);
          exp = new Date(usu.exp * 1000);
          console.log('inicio:' + ini);
          console.log('expira:' + exp);
          localStorage.removeItem('token');
          this.user.codSucursal = usu.codSucursal;
          this.user.codSucursalErp = usu.codSucursalErp;
          this.guardarLocalStorage(response.token, this.user);
          console.log('tokenRenovado:');
          return true;
        }
        ),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  renuevaToken() {
    let url = BASE_URL + 'auth/login';
    let body = JSON.stringify({
      username: this.user.username,
      password: this.user.password,
    });
    return this.http
      .post(url, body)
      .map((res: any) => {
        let decode = [];
        decode = res.token.split('.');
        let usu: any;
        let ini;
        let exp;
        usu = JSON.parse(window.atob(decode[1]));
        ini = new Date(usu.iat * 1000);
        exp = new Date(usu.exp * 1000);
        this.user.codSucursal = usu.codSucursal;
        this.user.codSucursalErp = usu.codSucursalErp;
        console.log('inicio:' + ini);
        console.log('expira:' + exp);
        localStorage.removeItem('token');
        this.guardarLocalStorage(res.token, this.user);
        console.log('tokenRenovado:');
        return true;
      })
      .catch(err => {
        console.error(err);
        this.router.navigate(['/login']);
        Swal.fire(
          'No se pudo renovar token',
          'No fue posible renovar token',
          'error'
        );
        return Observable.throw(err);
      });
  }

  estaLogueado() {
    return this.token.length > 5 ? true : false;
  }


  
  cargarTerminal() {
    if (localStorage.getItem('tv')) {
      let terminaUUI = localStorage.getItem('tv');
      this.terminal = JSON.parse(window.atob(terminaUUI));
    } else {
      this.terminal = {
        codTerminalVenta: 0,
        descripcion: 'No Seleccionada',
        id: '363ddbe5-ead3-7455-39a8-6737444ae234',
        codEmpresa: 1,
        codSucursal: 2,
        disponible: false
      };
    }
  }

  cargarStorage() {
    if (localStorage.getItem('token')) {
      this.token = localStorage.getItem('token');
      this.user = JSON.parse(localStorage.getItem('user'));
    } else {
      this.token = '';
      this.user = null;
    }
  }

  changeSucursal(codSucursal: number): Observable<any> {
    return this.http
      .put<any>(BASE_URL + 'usuarios/changeCodSucursal?codsucursal=' + codSucursal, null)
      .pipe(
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }
  guardarStorage(id: string, token: string, user: User) {
    localStorage.setItem('id', id);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.user = user;
    this.token = token;
  }

  guardarLocalStorage(token: string, user: User) {
    this.user = user;
    this.token = token;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    console.log(token);
  }

  logout() {
    this.user = null;
    this.token = '';
    localStorage.removeItem('tv');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
  accion() {
    localStorage.removeItem('accion');
  }

  loginGoogle(token: string) {
    let url = BASE_URL + '/login/google';

    return this.http.post(url, { token }).map((resp: any) => {
      this.guardarStorage(resp.id, resp.token, resp.usuario);
      return true;
    });
  }

  login(user: User, recordar: boolean = false) {
    localStorage.removeItem('tv');
    localStorage.removeItem('token');
    if (recordar) {
      localStorage.setItem('username', user.username);
    } else {
      localStorage.removeItem('username');
    }
    let body = JSON.stringify({
      username: user.username,
      password: user.password,
    });
    let url = BASE_URL + 'auth/login';

    return this.http.post(url, body)
      .pipe(
        map((response: any) => {
          /*     let t = JSON.parse(JSON.stringify(response));
          console.log(t.token); */
          let decode = [];
          decode = response.token.split('.');
          let usu: any;
          let ini;
          let exp;
          usu = JSON.parse(window.atob(decode[1]));
          // console.error('usuarioDesencriptado: ', usu);
          user.codUsuario = usu.codUsuario;
          user.codEmpresa = usu.codEmpresa;
          user.codSucursal = usu.codSucursal;
          user.codEmpresaErp = usu.codEmpresaErp;
          user.codSucursalErp = usu.codSucursalErp;
          user.nombre = usu.nombre;
          user.username = usu.sub;
          user.authorities = usu.authorities;
          user.maxDescuentoImp = usu.maxDescuentoImp;
          user.maxDescuentoPorc = usu.maxDescuentoPorc;
          user.cantItem = usu.cantItem;
          user.img = '';
          user.password = ''
          // console.log('iat', new Date(usu.iat  ));
          // console.log('exp', new Date(usu.iat  ));
          // ini = new Date(usu.iat * 1000);
          // exp = new Date(usu.exp * 1000);
          console.log('***********************', user)
          this.guardarLocalStorage(response.token, user);
          return true;
        }),
        catchError(e => {

          console.error('login error ', e);
          if (e.status == '401' || e.status == 401) {

            Swal.fire('Atencion', 'Usuario o contraseña no valida', 'error');
          }
          return throwError(e);
        })
      );
  }
}
