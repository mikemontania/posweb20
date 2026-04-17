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
import { TipoDepositoService } from '../../services/service.index';
 import { TipoDeposito } from '../../models/tipoDeposito.model';

@Component({
  selector: 'app-form-tipoDeposito',
  templateUrl: './form-tipoDeposito.component.html',
  styles: []
})
export class FormTipoDepositoComponent implements OnInit {
  tipoDeposito: TipoDeposito  = new TipoDeposito();
  user: User;
  seleccionMedioPago: number;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _tipoDepositoServices: TipoDepositoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
   this.tipoDeposito.codEmpresa = this._loginService.user.codEmpresa;
   this.tipoDeposito.codTipoDeposito = null;
    this.tipoDeposito.descripcion = '';
    }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._tipoDepositoServices.getById(id).subscribe((t) => {
                this.tipoDeposito = t;
              });
            }
          });
  }

  create(): void {
      this._tipoDepositoServices.create(this.tipoDeposito)
        .subscribe(
          categoria => {
            this.router.navigate(['/tipoDeposito']);
            swal.fire('Nuevo tipo deposito', `El tipo ${this.tipoDeposito.descripcion} ha sido creada con éxito`, 'success');
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
    this._tipoDepositoServices.update(this.tipoDeposito)
      .subscribe(
        json => {
          this.router.navigate(['/tipoDeposito']);
          swal.fire('Tipo deposito Actualizado', `Tipo deposito: ${json.descripcion}`, 'success');
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
