import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import { Sucursal } from '../../models/sucursal.model';
import * as moment from 'moment';
import { ErrModel } from '../../models/ErrModel.model';

import { ToastrService } from 'ngx-toastr';

import { LoginService } from '../../services/login/login.service';
import { ListaPrecioService } from '../../services/ListaPrecio/listaPrecio.service';
@Component({
  selector: 'app-form-listaPrecio',
  templateUrl: './form-listaPrecio.component.html',
  styles: []
})
export class FormListaPrecioComponent implements OnInit {
  listaPrecio: ListaPrecio = new ListaPrecio();
  user: User;
  errores: ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _listaPrecioServices: ListaPrecioService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.listaPrecio.codEmpresa = this._loginService.user.codEmpresa;
    this.listaPrecio.codListaPrecio = null;
    this.listaPrecio.codListaPrecioErp = '';
    this.listaPrecio.descripcion = '';
    this.listaPrecio.ecommerce = null;
  }

  ngOnInit() {
    this.user = this._loginService.user;
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (!this.listaPrecio.ecommerce) {
        this.listaPrecio.ecommerce = false;
      }
      if (id) {
        this._listaPrecioServices.getById(id).subscribe((ba) => {
          this.listaPrecio = ba;
        });
      }
    });
  }

  create(): void {
    this._listaPrecioServices.create(this.listaPrecio)
      .subscribe(
        list => {
          this.router.navigate(['/listaPrecio']);
          swal.fire('Nueva lista de precio', `La lista ${this.listaPrecio.descripcion} ha sido creada con éxito`, 'success');
        },
        err => {
          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
          this.errores = err.error.errors;
          console.error('Código del error desde el backend: ' + err.status);
        }
      );
  }

  update(): void {
    this._listaPrecioServices.update(this.listaPrecio)
      .subscribe(
        json => {
          this.router.navigate(['/listaPrecio']);
          swal.fire('Lista Actualizada', `Lista  : ${json.descripcion}`, 'success');
        },
        err => {
          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
          this.errores = err.error.errors;
          console.error('Código del error desde el backend: ' + err.status);
        }
      );
  }

  invalido() {
    this.toastr.error('Favor completar todos los campos correctamente', 'Invalido',
      { timeOut: 1500 });
  }

  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }

  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }
}
