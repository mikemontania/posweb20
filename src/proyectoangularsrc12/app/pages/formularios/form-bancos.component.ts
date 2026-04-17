import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import { Sucursal } from '../../models/sucursal.model';
import * as moment from 'moment';
import { ErrModel } from '../../models/ErrModel.model';
import { BancosService } from '../../services/bancos/bancos.service';
import { ToastrService } from 'ngx-toastr';
import { Bancos } from '../../models/bancos.model';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-form-bancos',
  templateUrl: './form-bancos.component.html',
  styles: []
})
export class FormBancosComponent implements OnInit {
  bancos: Bancos  = new Bancos();
  user: User;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _bancosServices: BancosService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
   this.bancos.codEmpresa = this._loginService.user.codEmpresa;
   this.bancos.codBanco = null;
   this.bancos.codBancoErp = '';
   this.bancos.descripcion = '';
    }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._bancosServices.getById(id).subscribe((ba) => {
                this.bancos = ba;
              });
            }
          });
  }

  create(): void {
      this._bancosServices.create(this.bancos)
        .subscribe(
          bancos => {
            this.router.navigate(['/bancos']);
            swal.fire('Nuevo banco', `El banco ${this.bancos.descripcion} ha sido creado con éxito`, 'success');
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
    this._bancosServices.update(this.bancos)
      .subscribe(
        json => {
          this.router.navigate(['/bancos']);
          swal.fire('Banco Actualizado', `Banco  : ${json.descripcion}`, 'success');
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
    {timeOut: 1500});
  }

  error(err) {
    this.toastr.error(err, 'Error',
    {timeOut: 2500});
  }

  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }
}
