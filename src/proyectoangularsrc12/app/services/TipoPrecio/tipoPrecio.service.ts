import { Injectable } from '@angular/core';

import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UsuarioService } from '../usuario/usuario.service';
import { Router } from '@angular/router';
import { BASE_URL } from '../../config/config';
import { LoginService } from '../login/login.service';

@Injectable()
export class TipoPrecioService {
  constructor(
                public http: HttpClient,
                public router: Router,
              ) { }

   traerTipoPrecio(codeEmpresa) {
   let url = BASE_URL + 'tipoprecio?codempresa=' + codeEmpresa;
     return this.http.get( url)
     .map( (resp: any) => resp);
    }

}